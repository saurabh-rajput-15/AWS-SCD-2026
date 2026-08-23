import Razorpay from 'razorpay';
import { createHmac, timingSafeEqual } from 'crypto';

let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured in environment variables');
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }

  return razorpayInstance;
}

export interface CreateOrderParams {
  amount: number; // in paise (minimum 100 paise = 1 INR)
  currency?: string; // default INR
  receipt?: string;
  notes?: Record<string, string | number>;
}

export interface CreateOrderResult {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
}

export async function createRazorpayOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  const { amount, currency = 'INR', receipt, notes } = params;

  if (amount < 100) {
    throw new Error('Order amount must be at least 100 paise (₹1.00)');
  }

  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: Math.round(amount),
    currency,
    receipt: receipt?.slice(0, 40), // Razorpay receipt max 40 chars
    notes,
  });

  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    receipt: order.receipt || undefined,
    status: order.status,
  };
}

export interface VerifySignatureParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export function verifyRazorpaySignature(params: VerifySignatureParams): boolean {
  const { orderId, paymentId, signature } = params;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_secret || !orderId || !paymentId || !signature) {
    return false;
  }

  try {
    const expectedSignature = createHmac('sha256', key_secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const signatureBuf = Buffer.from(signature, 'utf8');

    if (expectedBuf.length !== signatureBuf.length) {
      return false;
    }

    return timingSafeEqual(expectedBuf, signatureBuf);
  } catch (err) {
    console.error('[Razorpay Signature Error]', err);
    return false;
  }
}
