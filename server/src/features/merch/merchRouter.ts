import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabase } from '../../shared/lib/supabase.js';
import { redis } from '../../shared/lib/redis.js';
import { randomInt, timingSafeEqual, createHash } from 'crypto';
import { otpLimiter, applicationLimiter, checkoutLimiter } from '../../shared/middleware/rateLimiter.js';
import { merchOtpEmailTemplate } from './merchOtpEmailTemplate.js';
import { merchOrderConfirmationEmailTemplate } from './merchOrderConfirmationEmailTemplate.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../../shared/lib/razorpay.js';
import { getEmailProvider } from '../../shared/lib/emailProvider.js';

const router = Router();

const sendOtpSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  name: z.string().optional()
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits')
});

const merchOrderSchema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  customer_email: z.string().email('Valid email is required'),
  customer_phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  street_address: z.string().min(2, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(4, 'Pincode is required'),
  product_id: z.string(),
  product_title: z.string(),
  quantity: z.number().int().min(1).max(20),
  unit_price: z.number().positive(),
  subtotal: z.number().positive(),
  delivery_option_id: z.string(),
  delivery_option_name: z.string(),
  delivery_charge: z.number().min(0),
  total_amount: z.number().positive(),
  promo_code: z.string().optional(),
  discount_amount: z.number().min(0).optional(),
  notes: z.string().optional()
});



const genericCreateOrderSchema = z.object({
  amount: z.number().positive(), // in paise or INR
  currency: z.string().default('INR'),
  receipt: z.string().optional(),
  notes: z.record(z.any()).optional()
});

/**
 * Generates an Amazon/Flipkart-style 13-character unique alphanumeric Order Reference:
 * "SCD" prefix + 10 un-ambiguous uppercase alphanumeric characters (excluding I, O, 0, 1)
 * e.g. "SCD8KM2X4R9P" (~3.6 trillion combinations)
 */
export function generateOrderRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'SCD';
  for (let i = 0; i < 10; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

// Send OTP email - FIXED to Mailtrap exclusively
async function sendMerchOtpEmail(
  toEmail: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    const provider = getEmailProvider('mailtrap');
    await provider.send({
      to: toEmail,
      subject,
      html,
      text,
    });
    console.log(`[Email OTP] Sent via Mailtrap to ${toEmail}`);
  } catch (err) {
    console.error(`[Email OTP Error] Failed to send via Mailtrap to ${toEmail}:`, err);
    throw err;
  }
}

// Send Order Confirmation email - FIXED to Resend exclusively
async function sendMerchOrderConfirmationEmail(
  toEmail: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    const provider = getEmailProvider('resend');
    await provider.send({
      to: toEmail,
      subject,
      html,
      text,
    });
    console.log(`[Email Confirmation] Sent via Resend to ${toEmail}`);
  } catch (err) {
    console.error(`[Email Confirmation Error] Failed to send via Resend to ${toEmail}:`, err);
    throw err;
  }
}



// POST /api/merch/send-otp
router.post('/send-otp', otpLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = sendOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, name } = parsed.data;

    // Rate limiting: Max 5 OTP requests per 10 mins per email
    const limitKey = `merch_otp_limit:${email}`;
    const count = await redis.incr(limitKey);
    if (count === 1) {
      await redis.expire(limitKey, 600);
    }
    if (count > 5) {
      res.status(429).json({ error: 'RATE_LIMIT_EXCEEDED', message: 'Too many OTP requests. Please try again in a few minutes.' });
      return;
    }

    // Generate 6-digit OTP
    const otp = randomInt(100000, 999999).toString();
    const hashedOtp = createHash('sha256').update(otp).digest('hex');

    // Store in Redis with 10-minute TTL
    const otpKey = `merch_otp:${email}`;
    await redis.set(otpKey, JSON.stringify({ otp: hashedOtp, attempts: 0 }), { ex: 600 });

    // Send OTP email via Mailtrap
    const html = merchOtpEmailTemplate
      .replace('{{otp}}', otp)
      .replace('{{name}}', name || 'Awesome Builder');
    
    await sendMerchOtpEmail(
      email,
      'Your Merch Order Verification Code - AWS SCD 2026',
      html,
      `Your verification code for AWS SCD 2026 merchandise checkout is: ${otp}. Valid for 10 minutes.`
    );


    res.status(200).json({ message: 'Verification code sent to your email address' });
  } catch (err) {
    next(err);
  }
});

// POST /api/merch/verify-otp
router.post('/verify-otp', otpLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, otp } = parsed.data;
    const otpKey = `merch_otp:${email}`;
    const data = await redis.get<{ otp: string; attempts: number }>(otpKey);

    if (!data) {
      res.status(400).json({ error: 'INVALID_OTP', message: 'Verification code has expired or not found. Please request a new code.' });
      return;
    }

    if (data.attempts >= 4) {
      res.status(400).json({ error: 'MAX_ATTEMPTS_EXCEEDED', message: 'Too many incorrect attempts. Please request a new verification code.' });
      return;
    }

    // Compare Hash
    const hashedInput = createHash('sha256').update(otp).digest('hex');
    const isMatch = data.otp.length === hashedInput.length &&
      timingSafeEqual(Buffer.from(data.otp), Buffer.from(hashedInput));

    if (!isMatch) {
      data.attempts += 1;
      const ttl = await redis.ttl(otpKey);
      if (ttl > 0) {
        await redis.set(otpKey, JSON.stringify(data), { ex: ttl });
      }
      res.status(400).json({ error: 'INCORRECT_OTP', message: 'Incorrect verification code. Please check and try again.' });
      return;
    }

    // Verified successfully -> Mark email verified in Redis for 2 hours
    await redis.del(otpKey);
    await redis.set(`merch_verified:${email}`, 'true', { ex: 7200 });

    res.status(200).json({ verified: true, message: 'Email verified successfully!' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/merch/create-order
 * Creates a Razorpay Order and records the initial order into Supabase
 */
export async function handleCreateMerchOrder(req: Request, res: Response, next: NextFunction) {
  try {
    // Check if body is a structured merch order or a generic amount/currency order
    const merchParsed = merchOrderSchema.safeParse(req.body);

    if (merchParsed.success) {
      const data = merchParsed.data;

      // Check if email was verified in Redis
      const isVerified = await redis.get(`merch_verified:${data.customer_email}`);
      const orderRef = generateOrderRef();
      const fullAddress = `${data.street_address}, ${data.city}, ${data.state} - ${data.pincode}`;

      // 1. Check live inventory stock from DB table merch_inventory (with fallback to app_settings)
      let inventoryConfig: Record<string, number> = {
        'bag': 150,
        'welcome-kit': 150,
        'combo': 200
      };

      try {
        const { data: tableData, error: tableErr } = await supabase
          .from('merch_inventory')
          .select('*');

        if (!tableErr && tableData && tableData.length > 0) {
          tableData.forEach((row: any) => {
            inventoryConfig[row.id] = Number(row.capacity) || 0;
          });
        } else {
          const { data: settingsData } = await supabase
            .from('app_settings')
            .select('merch_inventory')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (settingsData?.merch_inventory) {
            inventoryConfig = { ...inventoryConfig, ...settingsData.merch_inventory };
          }
        }
      } catch (invErr) {
        console.warn('[Merch Order Create Inventory Fetch Notice]', invErr);
      }

      const productStockCapacity = Number(inventoryConfig[data.product_id] || 150);

      const { data: paidSameProduct } = await supabase
        .from('merch_orders')
        .select('quantity')
        .eq('product_id', data.product_id)
        .eq('payment_status', 'PAID');

      const currentSold = (paidSameProduct || []).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
      const remainingStock = Math.max(0, productStockCapacity - currentSold);

      if (remainingStock < data.quantity) {
        res.status(400).json({
          error: 'OUT_OF_STOCK',
          message: remainingStock <= 0
            ? 'This product is currently Sold Out.'
            : `Only ${remainingStock} unit(s) remaining in stock.`
        });
        return;
      }

      // 2. Server-side promo code validation and discount calculation
      let appliedPromoCode: string | null = null;
      let discountAmount = 0;

      if (data.promo_code && data.promo_code.trim()) {
        const cleanCode = data.promo_code.trim().toUpperCase();
        const { data: promo } = await supabase
          .from('promo_codes')
          .select('*')
          .eq('code', cleanCode)
          .eq('is_active', true)
          .single();

        if (promo) {
          const isExhausted = promo.max_uses > 0 && promo.uses >= promo.max_uses;
          const minQtyMet = !promo.min_quantity || data.quantity >= promo.min_quantity;

          if (!isExhausted && minQtyMet) {
            appliedPromoCode = promo.code;
            const discountQty = promo.max_discount_qty && promo.max_discount_qty > 0
              ? Math.min(data.quantity, promo.max_discount_qty)
              : data.quantity;

            if (promo.discount_type === 'flat') {
              const discountPerItem = Math.min(data.unit_price, Number(promo.discount_value));
              discountAmount = Number((discountPerItem * discountQty).toFixed(2));
            } else {
              const pct = Number(
                promo.discount_value !== undefined && promo.discount_value !== null && Number(promo.discount_value) > 0
                  ? promo.discount_value
                  : promo.discount_percentage || 0
              );
              discountAmount = Number(((data.unit_price * discountQty) * (pct / 100)).toFixed(2));
            }
          }
        }
      }

      // 3. Compute verified subtotal and total amount (clean 2-decimal numbers in INR)
      const verifiedSubtotal = Number(Math.max(0, data.subtotal - discountAmount).toFixed(2));
      const verifiedTotalAmount = Number(Math.max(1, verifiedSubtotal + data.delivery_charge).toFixed(2));
      const amountInPaise = Math.round(verifiedTotalAmount * 100);


      if (amountInPaise < 100) {
        res.status(400).json({ error: 'INVALID_AMOUNT', message: 'Order amount must be at least ₹1.00 (100 paise)' });
        return;
      }

      // 4. Create Razorpay order
      let razorpayOrder;
      try {
        razorpayOrder = await createRazorpayOrder({
          amount: amountInPaise,
          currency: 'INR',
          receipt: orderRef,
          notes: {
            order_ref: orderRef,
            customer_name: data.customer_name,
            customer_email: data.customer_email,
            product_title: data.product_title,
            quantity: data.quantity,
            delivery_option: data.delivery_option_name,
            promo_code: appliedPromoCode || 'none',
            discount_amount: discountAmount
          },
        });
      } catch (rzpErr: any) {
        console.error('[Razorpay Order Creation Error]', rzpErr);
        res.status(500).json({
          error: 'GATEWAY_ERROR',
          message: rzpErr.message || 'Failed to initialize Razorpay checkout order',
        });
        return;
      }

      // 5. Insert order record in Supabase merch_orders
      const defaultExpectedDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const orderRecord = {
        order_ref: orderRef,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        delivery_address: fullAddress,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        product_id: data.product_id,
        product_title: data.product_title,
        quantity: data.quantity,
        unit_price: data.unit_price,
        subtotal: data.subtotal,
        promo_code: appliedPromoCode,
        discount_amount: discountAmount,
        delivery_option_id: data.delivery_option_id,
        delivery_option_name: data.delivery_option_name,
        delivery_charge: data.delivery_charge,
        total_amount: verifiedTotalAmount,
        expected_delivery_date: defaultExpectedDate,
        status: 'PENDING',
        payment_status: 'PENDING',
        payment_method: 'razorpay',
        razorpay_order_id: razorpayOrder.id,
        email_verified: !!isVerified,
        notes: data.notes || null,
      };

      const { data: inserted, error: dbError } = await supabase
        .from('merch_orders')
        .insert([orderRecord])
        .select()
        .single();

      if (dbError) {
        console.error('[Merch Order Supabase Error]', dbError);
        res.status(500).json({ error: 'DATABASE_ERROR', message: 'Failed to record order in database.' });
        return;
      }

      res.status(201).json({
        success: true,
        order_id: razorpayOrder.id,
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_ref: orderRef,
        key_id: process.env.RAZORPAY_KEY_ID,
        order: inserted,
        discount_amount: discountAmount,
        promo_code: appliedPromoCode,
        message: 'Razorpay order created successfully',
      });
      return;
    }

    // Generic fallback for plain amount/currency requests
    const genericParsed = genericCreateOrderSchema.safeParse(req.body);
    if (!genericParsed.success) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: merchParsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { amount, currency, receipt, notes } = genericParsed.data;
    const finalAmountInPaise = amount < 100 ? Math.round(amount * 100) : Math.round(amount);

    if (finalAmountInPaise < 100) {
      res.status(400).json({ error: 'INVALID_AMOUNT', message: 'Amount must be at least 100 paise' });
      return;
    }

    const razorpayOrder = await createRazorpayOrder({
      amount: finalAmountInPaise,
      currency,
      receipt: receipt || generateOrderRef(),
      notes,
    });

    res.status(201).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
}

router.post('/create-order', checkoutLimiter, handleCreateMerchOrder);
router.post('/order', checkoutLimiter, handleCreateMerchOrder);

/**
 * POST /api/merch/verify-payment
 * Verifies Razorpay payment signature and marks the order PAID
 */
export async function handleVerifyPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = (req.body.razorpay_order_id || req.body.order_id) as string;
    const paymentId = (req.body.razorpay_payment_id || req.body.payment_id) as string;
    const signature = (req.body.razorpay_signature || req.body.signature) as string;
    const orderRef = (req.body.order_ref || req.body.receipt) as string;

    if (!orderId || !paymentId || !signature) {
      res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Missing required Razorpay payment verification fields (order_id, payment_id, signature)',
      });
      return;
    }

    // Cryptographic signature check: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const isValid = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValid) {
      console.warn(`[Razorpay Signature Mismatch] Order: ${orderId}, Payment: ${paymentId}`);
      res.status(400).json({
        success: false,
        error: 'SIGNATURE_VERIFICATION_FAILED',
        message: 'Payment verification failed: cryptographic signature mismatch.',
      });
      return;
    }

    console.log(`[Razorpay Verified] Order ${orderId} successfully paid with Payment ID: ${paymentId}`);

    // Update order status in Supabase
    let updateQuery = supabase
      .from('merch_orders')
      .update({
        status: 'PAID',
        payment_status: 'PAID',
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        paid_at: new Date().toISOString(),
      });

    if (orderRef) {
      updateQuery = updateQuery.or(`order_ref.eq.${orderRef},razorpay_order_id.eq.${orderId}`);
    } else {
      updateQuery = updateQuery.eq('razorpay_order_id', orderId);
    }

    const { data: updatedOrder, error: updateError } = await updateQuery.select().single();

    if (updateError) {
      console.warn('[Merch Order Update Notice]', updateError.message);
    }

    // If order had a promo code, increment usage count in promo_codes table
    if (updatedOrder?.promo_code) {
      try {
        const { data: promoData } = await supabase
          .from('promo_codes')
          .select('id, uses')
          .eq('code', updatedOrder.promo_code)
          .single();

        if (promoData) {
          await supabase
            .from('promo_codes')
            .update({ uses: (promoData.uses || 0) + 1 })
            .eq('id', promoData.id);
        }
      } catch (promoErr) {
        console.error('[Promo Usage Increment Error]', promoErr);
      }
    }

    // Send confirmation email if order details were found
    if (updatedOrder) {
      let frontendUrl = (process.env.FRONTEND_URL || 'https://aws-scd-2026.vercel.app').replace(/\/+$/, '');
      if (process.env.NODE_ENV === 'production' && frontendUrl.includes('localhost')) {
        frontendUrl = 'https://aws-scd-dhule.tech';
      }
      if (!frontendUrl.startsWith('http')) {
        frontendUrl = `https://${frontendUrl}`;
      }
      const orderUrl = `${frontendUrl}/order/${updatedOrder.order_ref}`;

      const emailHtml = merchOrderConfirmationEmailTemplate
        .replace(/{{customer_name}}/g, updatedOrder.customer_name || 'Builder')
        .replace(/{{order_ref}}/g, updatedOrder.order_ref)
        .replace(/{{order_url}}/g, orderUrl)
        .replace(/{{payment_id}}/g, paymentId)
        .replace(/{{product_title}}/g, updatedOrder.product_title)
        .replace(/{{quantity}}/g, String(updatedOrder.quantity))
        .replace(/{{unit_price}}/g, String(updatedOrder.unit_price))
        .replace(/{{subtotal}}/g, String(updatedOrder.subtotal))
        .replace(/{{delivery_option_name}}/g, updatedOrder.delivery_option_name)
        .replace(/{{delivery_charge}}/g, String(updatedOrder.delivery_charge))
        .replace(/{{delivery_address}}/g, updatedOrder.delivery_address)
        .replace(/{{total_amount}}/g, String(updatedOrder.total_amount));

      // Send Order Confirmation email via Resend
      sendMerchOrderConfirmationEmail(
        updatedOrder.customer_email,
        `Order Confirmed (${updatedOrder.order_ref}) — AWS SCD Dhule 2026 Merch`,
        emailHtml,
        `Your AWS SCD 2026 merchandise order ${updatedOrder.order_ref} has been confirmed. Total Paid: ₹${updatedOrder.total_amount} INR (Payment ID: ${paymentId}). Track online at: ${orderUrl}`
      ).catch(err => console.error('[Merch Email Send Error]', err));
    }

    res.status(200).json({
      success: true,
      verified: true,
      order_id: orderId,
      payment_id: paymentId,
      order_ref: updatedOrder?.order_ref || orderRef,
      order: updatedOrder,
      message: 'Payment verified and order confirmed successfully',
    });
  } catch (err) {
    next(err);
  }
}

router.post('/verify-payment', handleVerifyPayment);



// POST /api/merch/validate-promo - Validate promo code for merchandise checkout
router.post('/validate-promo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, quantity = 1, unit_price = 0, subtotal = 0 } = req.body;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'INVALID_REQUEST', message: 'Promo code is required' });
      return;
    }

    const cleanCode = code.trim().toUpperCase();

    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .single();

    if (error || !promo) {
      res.status(404).json({ error: 'INVALID_PROMO', message: 'Promo code is invalid or inactive.' });
      return;
    }

    if (promo.max_uses > 0 && promo.uses >= promo.max_uses) {
      res.status(400).json({ error: 'PROMO_EXHAUSTED', message: 'Promo code usage limit has been reached.' });
      return;
    }

    if (promo.min_quantity && quantity < promo.min_quantity) {
      res.status(400).json({
        error: 'MIN_QTY_NOT_MET',
        message: `This promo code requires a minimum purchase of ${promo.min_quantity} items.`
      });
      return;
    }

    const effectiveUnitPrice = unit_price > 0 ? unit_price : (subtotal > 0 ? subtotal / quantity : 0);
    const discountQty = promo.max_discount_qty && promo.max_discount_qty > 0
      ? Math.min(quantity, promo.max_discount_qty)
      : quantity;

    let discountAmount = 0;
    if (promo.discount_type === 'flat') {
      const discountPerItem = Math.min(effectiveUnitPrice, Number(promo.discount_value));
      discountAmount = Number((discountPerItem * discountQty).toFixed(2));
    } else {
      const pct = Number(
        promo.discount_value !== undefined && promo.discount_value !== null && Number(promo.discount_value) > 0
          ? promo.discount_value
          : promo.discount_percentage || 0
      );
      discountAmount = Number(((effectiveUnitPrice * discountQty) * (pct / 100)).toFixed(2));
    }

    const newSubtotal = Number(Math.max(0, subtotal - discountAmount).toFixed(2));

    res.status(200).json({
      valid: true,
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value || promo.discount_percentage,
      discount_amount: discountAmount,
      new_subtotal: newSubtotal,
      message: `Promo code "${promo.code}" applied successfully!`
    });

  } catch (err) {
    next(err);
  }
});

// GET /api/merch/inventory - Public live merchandise stock count from database
router.get('/inventory', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let inventoryConfig: Record<string, number> = {
      'bag': 150,
      'welcome-kit': 150,
      'combo': 200
    };

    try {
      const { data: tableData, error: tableErr } = await supabase
        .from('merch_inventory')
        .select('*');

      if (!tableErr && tableData && tableData.length > 0) {
        tableData.forEach((row: any) => {
          inventoryConfig[row.id] = Number(row.capacity) || 0;
        });
      } else {
        const { data: settingsData } = await supabase
          .from('app_settings')
          .select('merch_inventory')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (settingsData?.merch_inventory) {
          inventoryConfig = { ...inventoryConfig, ...settingsData.merch_inventory };
        }
      }
    } catch (invErr) {
      console.warn('[Merch Inventory Public Fetch Notice]', invErr);
    }

    const { data: paidOrders } = await supabase
      .from('merch_orders')
      .select('product_id, quantity')
      .eq('payment_status', 'PAID');

    const soldMap: Record<string, number> = {
      'bag': 0,
      'welcome-kit': 0,
      'combo': 0
    };

    (paidOrders || []).forEach((o) => {
      const pId = o.product_id || 'combo';
      soldMap[pId] = (soldMap[pId] || 0) + (Number(o.quantity) || 1);
    });

    const inventory: Record<string, { capacity: number; sold: number; remaining: number; in_stock: boolean }> = {};
    for (const [pId, capacity] of Object.entries(inventoryConfig)) {
      const sold = soldMap[pId] || 0;
      const remaining = Math.max(0, Number(capacity) - sold);
      inventory[pId] = {
        capacity: Number(capacity),
        sold,
        remaining,
        in_stock: remaining > 0
      };
    }

    res.json({ success: true, inventory });
  } catch (err) {
    next(err);
  }
});


// GET /api/merch/order/:orderRef - Get details of a single order
router.get('/order/:orderRef', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderRef } = req.params;
    const cleanRef = orderRef.trim();
    
    let query = supabase.from('merch_orders').select('*');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanRef);
    
    if (isUuid) {
      query = query.eq('id', cleanRef);
    } else {
      query = query.eq('order_ref', cleanRef);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Merchandise order not found' });
      return;
    }

    const calculate5DaysNext = (createdAtStr?: string) => {
      const base = createdAtStr ? new Date(createdAtStr) : new Date();
      const target = new Date(base.getTime() + 5 * 24 * 60 * 60 * 1000);
      return target.toISOString().split('T')[0];
    };

    res.status(200).json({
      success: true,
      order: {
        ...order,
        expected_delivery_date: order.expected_delivery_date || calculate5DaysNext(order.created_at)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/merch/orders - List merch orders (for admin)
router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: orders, error } = await supabase
      .from('merch_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: 'DATABASE_ERROR', message: error.message });
      return;
    }

    res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
});

export default router;
