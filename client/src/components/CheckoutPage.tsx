import React, { useState, useEffect } from "react";
import {
  useSearchParams,
  useParams,
  useNavigate,
  Link,
} from "react-router-dom";
import { motion } from "motion/react";
import {
  findProductById,
  deliveryOptions,
  DeliveryOption,
  merchProducts,
  MerchProduct,
} from "../data/merchProducts";
import { api } from "../lib/api";
import { loadRazorpayScript, getRazorpayKeyId } from "../lib/razorpay";
import type {
  RazorpayOptions,
  RazorpaySuccessResponse,
  RazorpayFailureResponse,
} from "../types/razorpay";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Phone,
  Mail,
  ShoppingBag,
  ExternalLink,
  MapPin,
  User,
  ArrowLeft,
  Tag,
  Zap,
  ChevronRight,
  Sparkles,
  Check,
  AlertCircle,
  KeyRound,
  RotateCw,
  Loader2,
  Lock,
  CreditCard,
  X,
} from "lucide-react";
import { FooterSection } from "./FooterSection";
import confetti from "canvas-confetti";


const CHECKOUT_DRAFT_KEY = "scd_checkout_draft";

function getSavedDraft() {
  try {
    const raw = localStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const { productId } = useParams<{ productId?: string }>();
  const navigate = useNavigate();

  const savedDraft = getSavedDraft();

  // Determine initial product & delivery
  const paramProductId = productId || searchParams.get("product") || "combo";
  const initialQty = parseInt(searchParams.get("qty") || "1", 10);
  const paramDelivery = searchParams.get("delivery");

  const [selectedProduct, setSelectedProduct] = useState<MerchProduct>(() =>
    findProductById(paramProductId),
  );
  const [quantity, setQuantity] = useState<number>(() =>
    isNaN(initialQty) || initialQty < 1 ? 1 : Math.min(initialQty, 10),
  );
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<
    "campus-pickup" | "soham-dhule" | "vaibhav-amalner" | "pan-india"
  >(() => {
    const valid = deliveryOptions.some((d) => d.id === paramDelivery);
    return valid ? (paramDelivery as any) : "campus-pickup";
  });

  // Customer Form State with auto-recovery from localStorage on reload
  const [formData, setFormData] = useState({
    fullName: savedDraft?.formData?.fullName || "",
    email: savedDraft?.formData?.email || "",
    phone: savedDraft?.formData?.phone || "",
    streetAddress: savedDraft?.formData?.streetAddress || "",
    landmark: savedDraft?.formData?.landmark || "",
    city: savedDraft?.formData?.city || "",
    state: savedDraft?.formData?.state || "",
    pincode: savedDraft?.formData?.pincode || "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Promo Code State
  const [promoInput, setPromoInput] = useState<string>("");
  const [promoLoading, setPromoLoading] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string>("");
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null>(() => savedDraft?.appliedPromo || null);

  // Live Database Inventory Stock State
  const [inventoryStock, setInventoryStock] = useState<Record<
    string,
    { capacity: number; sold: number; remaining: number; in_stock: boolean }
  > | null>(null);

  // OTP Verification State
  const [otp, setOtp] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(() => {
    if (savedDraft?.isEmailVerified && savedDraft?.verifiedEmail) {
      const emailMatch =
        savedDraft.verifiedEmail.trim().toLowerCase() ===
        (savedDraft.formData?.email || "").trim().toLowerCase();
      return !!emailMatch;
    }
    return false;
  });
  const [otpSending, setOtpSending] = useState<boolean>(false);
  const [otpVerifying, setOtpVerifying] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string>("");
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string>("");
  const [resendCountdown, setResendCountdown] = useState<number>(0);

  // Auto-save form draft and applied promo to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(
        CHECKOUT_DRAFT_KEY,
        JSON.stringify({
          formData,
          isEmailVerified,
          verifiedEmail: isEmailVerified
            ? formData.email.trim().toLowerCase()
            : "",
          appliedPromo,
        }),
      );
    } catch (e) {
      console.error("Failed to save checkout draft to localStorage", e);
    }
  }, [formData, isEmailVerified, appliedPromo]);

  // Order Submission State
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);
  const [paymentVerifying, setPaymentVerifying] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>("");

  // Fetch live inventory stock from database
  useEffect(() => {
    api
      .get("/api/merch/inventory")
      .then((res) => {
        if (res.data?.inventory) {
          setInventoryStock(res.data.inventory);
        }
      })
      .catch((err) => console.error("Failed to fetch merch inventory:", err));
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `Checkout | ${selectedProduct.title} | AWS SCD Dhule 2026`;
  }, [selectedProduct.id]);

  // Update selected product and delivery if route/query params change
  useEffect(() => {
    if (productId || searchParams.get("product")) {
      const p = findProductById(
        productId || searchParams.get("product") || undefined,
      );
      setSelectedProduct(p);
    }
    const d = searchParams.get("delivery");
    if (d && deliveryOptions.some((opt) => opt.id === d)) {
      setSelectedDeliveryId(d as any);
    }
  }, [productId, searchParams]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const round2 = (num: number): number =>
    Number((Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2));

  const selectedDelivery =
    deliveryOptions.find((d) => d.id === selectedDeliveryId) ||
    deliveryOptions[0];

  const subtotal = round2(selectedProduct.price * quantity);
  const discountAmount = round2(appliedPromo?.discountAmount || 0);
  const discountedSubtotal = Math.max(0, round2(subtotal - discountAmount));
  const totalAmount = round2(discountedSubtotal + selectedDelivery.charge);

  const currentProductStock = inventoryStock?.[selectedProduct.id];
  const isProductOutOfStock = currentProductStock
    ? currentProductStock.remaining <= 0
    : false;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF9900", "#10B981", "#6366F1", "#EC4899", "#F59E0B"]
      });
    } catch (e) {
      console.warn("Confetti trigger notice:", e);
    }
  };

  const handleApplyPromo = async (overrideCode?: string) => {
    const code = (overrideCode || promoInput).trim().toUpperCase();
    if (!code) return;

    setPromoLoading(true);
    setPromoError("");
    setPromoSuccessMsg("");

    try {
      const res = await api.post("/api/merch/validate-promo", {
        code,
        quantity,
        unit_price: selectedProduct.price,
        subtotal: selectedProduct.price * quantity,
      });

      const cleanDiscount = round2(Number(res.data.discount_amount) || 0);

      setAppliedPromo({
        code: res.data.code,
        discountType: res.data.discount_type,
        discountValue: res.data.discount_value,
        discountAmount: cleanDiscount,
      });
      setPromoSuccessMsg(res.data.message || `Promo code "${code}" applied!`);
      setPromoInput("");
      triggerConfetti();

    } catch (err: any) {
      setAppliedPromo(null);
      const msg =
        err.response?.data?.message || "Invalid or expired promo code";
      setPromoError(msg);
    } finally {
      setPromoLoading(false);
    }
  };

  // Monitor cart item changes (quantity, product, price) after promo code is applied
  useEffect(() => {
    if (!appliedPromo) return;

    let isMounted = true;
    const currentSubtotal = selectedProduct.price * quantity;

    api
      .post("/api/merch/validate-promo", {
        code: appliedPromo.code,
        quantity,
        unit_price: selectedProduct.price,
        subtotal: currentSubtotal,
      })
      .then((res) => {
        if (isMounted) {
          // If promo still valid for new quantity/product, update with new discount amount
          const cleanDiscount = round2(Number(res.data.discount_amount) || 0);
          setAppliedPromo({
            code: res.data.code,
            discountType: res.data.discount_type,
            discountValue: res.data.discount_value,
            discountAmount: cleanDiscount,
          });
          setPromoError("");
          setPromoSuccessMsg(
            `Promo "${res.data.code}" updated: Saved ₹${cleanDiscount} INR`,
          );

        }
      })

      .catch((err) => {
        if (isMounted) {
          // Promo no longer valid for updated cart item/quantity (e.g. min_quantity not met)
          const msg =
            err.response?.data?.message ||
            "Promo code no longer valid for updated cart items";
          setAppliedPromo(null);
          setPromoError(`Promo removed: ${msg}`);
          setPromoSuccessMsg("");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [quantity, selectedProduct.id, selectedProduct.price]);

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
    setPromoSuccessMsg("");
    setPromoInput("");
  };


  const handleProductChange = (prodId: "bag" | "welcome-kit" | "combo") => {
    const p = findProductById(prodId);
    setSelectedProduct(p);
  };

  const handleSendOtp = async () => {
    setOtpError("");
    setOtpSuccessMessage("");

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setFormErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address first",
      }));
      return;
    }

    setOtpSending(true);
    try {
      await api.post("/api/merch/send-otp", {
        email: formData.email.trim().toLowerCase(),
        name: formData.fullName.trim(),
      });
      setOtpSent(true);
      setResendCountdown(60);
      setOtpSuccessMessage(
        `Verification code sent to ${formData.email.trim()}`,
      );
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy.email;
        return copy;
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to send verification code. Please try again.";
      setOtpError(msg);
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError("");
    setOtpSuccessMessage("");

    if (!otp.trim() || otp.trim().length !== 6) {
      setOtpError("Please enter the complete 6-digit verification code");
      return;
    }

    setOtpVerifying(true);
    try {
      await api.post("/api/merch/verify-otp", {
        email: formData.email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      setIsEmailVerified(true);
      setOtpSuccessMessage("Email verified successfully! ✓");
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy.email;
        delete copy.otp;
        return copy;
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Incorrect or expired verification code.";
      setOtpError(msg);
    } finally {
      setOtpVerifying(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim() || !formData.email.includes("@")) {
      errors.email = "Valid email is required";
    } else if (!isEmailVerified) {
      errors.email = "Please verify your email address using OTP";
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, "").length < 10)
      errors.phone = "Valid 10-digit WhatsApp number is required";
    if (!formData.streetAddress.trim())
      errors.streetAddress =
        selectedDeliveryId === "campus-pickup"
          ? "College department / year / SVKM location is required"
          : "Delivery address / Street / House No is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (
      !formData.pincode.trim() ||
      formData.pincode.replace(/\D/g, "").length < 6
    )
      errors.pincode = "Valid 6-digit Pincode is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingOrder || paymentVerifying) return;
    if (!validateForm()) return;

    setSubmittingOrder(true);
    setPaymentError("");

    const fullAddress = `${formData.streetAddress}${
      formData.landmark ? `, Near ${formData.landmark}` : ""
    }, ${formData.city}, ${formData.state} - ${formData.pincode}`;

    try {
      // 1. Create order on backend which generates a Razorpay Order
      const createRes = await api.post("/api/merch/create-order", {
        customer_name: formData.fullName.trim(),
        customer_email: formData.email.trim().toLowerCase(),
        customer_phone: formData.phone.trim(),
        street_address: formData.streetAddress.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        product_id: selectedProduct.id,
        product_title: selectedProduct.title,
        quantity,
        unit_price: selectedProduct.price,
        subtotal,
        promo_code: appliedPromo?.code || undefined,
        discount_amount: appliedPromo?.discountAmount || 0,
        delivery_option_id: selectedDelivery.id,
        delivery_option_name: selectedDelivery.name,
        delivery_charge: selectedDelivery.charge,
        total_amount: totalAmount,
        notes: formData.landmark ? `Landmark: ${formData.landmark}` : undefined,
      });

      const orderData = createRes.data;
      const orderRef = orderData.order_ref;
      if (!orderRef) {
        throw new Error(
          "Server did not return a valid order reference. Please try again.",
        );
      }
      const razorpayOrderId = orderData.order_id || orderData.razorpay_order_id;
      const razorpayKey = orderData.key_id || getRazorpayKeyId();

      // 2. Load Razorpay Standard Checkout SDK
      const RazorpaySDK = await loadRazorpayScript();

      // 3. Configure and open Razorpay Checkout modal
      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: orderData.amount || totalAmount * 100,
        currency: orderData.currency || "INR",
        name: "AWS SCD Dhule 2026",
        description: `Official Merchandise: ${selectedProduct.title} (Qty: ${quantity})`,
        image: "https://aws-scd-dhule.tech/scdpreview.png",
        order_id: razorpayOrderId,
        prefill: {
          name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          contact: formData.phone.trim(),
        },
        notes: {
          order_ref: orderRef,
          product_title: selectedProduct.title,
          quantity,
          delivery_mode: selectedDelivery.name,
        },
        theme: {
          color: "#FF9900",
          backdrop_color: "rgba(5, 5, 5, 0.92)",
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            setSubmittingOrder(false);
          },
        },
        handler: async (paymentResponse: RazorpaySuccessResponse) => {
          try {
            setPaymentVerifying(true);
            setSubmittingOrder(true);

            // 4. Verify payment signature on backend
            await api.post("/api/merch/verify-payment", {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              order_id: paymentResponse.razorpay_order_id,
              payment_id: paymentResponse.razorpay_payment_id,
              signature: paymentResponse.razorpay_signature,
              order_ref: orderRef,
            });

            // Clear saved draft from localStorage
            try {
              localStorage.removeItem(CHECKOUT_DRAFT_KEY);
            } catch (e) {}

            // 5. Amazon-style post-payment flow: Instant redirect to unique order status page
            navigate(`/order/${encodeURIComponent(orderRef)}`, {
              replace: true,
            });
          } catch (verifyErr: any) {
            console.error("Signature verification error:", verifyErr);
            const msg =
              verifyErr.response?.data?.message ||
              "Payment signature verification failed. Please contact the organizers with your transaction ID.";
            setPaymentError(msg);
          } finally {
            setSubmittingOrder(false);
            setPaymentVerifying(false);
          }
        },
      };

      const razorpayInstance = new RazorpaySDK(options);
      razorpayInstance.on(
        "payment.failed",
        (failRes: RazorpayFailureResponse) => {
          console.error("[Razorpay Payment Failed]", failRes);
          setPaymentError(
            failRes.error?.description ||
              failRes.error?.reason ||
              "Payment could not be processed. Please try another payment method or UPI.",
          );
          setSubmittingOrder(false);
        },
      );

      razorpayInstance.open();
    } catch (err: any) {
      console.error("Order creation error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to initialize checkout. Please check your internet connection and try again.";
      setPaymentError(errMsg);
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col selection:bg-aws-orange selection:text-black">
      {/* Background Ambience */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="fixed -top-20 left-1/4 w-[500px] h-[500px] bg-aws-orange/5 blur-[180px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-20 right-1/4 w-[500px] h-[500px] bg-f1-red/5 blur-[180px] rounded-full pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-[#070707]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link
          to={`/product/${selectedProduct.id}`}
          className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors"
        >
          <ArrowLeft size={16} className="text-aws-orange" />
          <span>Back to Product</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="font-sans font-black italic text-sm uppercase tracking-tight text-white hidden sm:inline-block">
            AWS SCD Dhule 2026
          </span>
          <span className="h-4 w-px bg-white/10 hidden sm:inline-block" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full font-mono text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
            <ShieldCheck size={12} />
            <span>Secure Order Desk</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-12 relative z-10">
        {/* Breadcrumbs & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-white/40 uppercase mb-3 tracking-wider">
            <Link to="/" className="hover:text-aws-orange transition-colors">
              Home
            </Link>
            <span>›</span>
            <Link
              to="/merchstore"
              className="hover:text-aws-orange transition-colors"
            >
              Merch Store
            </Link>
            <span>›</span>
            <Link
              to={`/product/${selectedProduct.id}`}
              className="hover:text-aws-orange transition-colors"
            >
              {selectedProduct.shortTitle}
            </Link>
            <span>›</span>
            <span className="text-aws-orange font-bold">Checkout</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <span className="font-mono text-xs text-aws-orange font-bold uppercase tracking-widest block mb-1">
                [03.CHECKOUT // DESK]
              </span>
              <h1 className="font-sans font-black italic text-3xl sm:text-4xl uppercase tracking-tight text-white">
                Review &amp; Place Order
              </h1>
            </div>
            <span className="font-mono text-xs text-white/60">
              Verified Order Recording &amp; Instant WhatsApp Confirmation
            </span>
          </div>
        </div>

        {/* 2-Column Checkout Layout */}
        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left Column: Product Selection, Delivery Mode, Customer Details Form */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            {/* Step 1: Selected Merchandise Item & Quantity */}
            <div className="p-5 sm:p-6 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <span className="font-mono text-xs font-bold text-aws-orange uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag size={14} /> 1. Selected Merchandise Item
                </span>
                <Link
                  to="/merchstore"
                  className="font-mono text-[10px] text-white/50 hover:text-aws-orange uppercase transition-colors"
                >
                  Change Item ↗
                </Link>
              </div>

              {/* Single Active Product Card */}
              <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.title}
                    className="w-18 h-18 sm:w-20 sm:h-20 object-contain rounded-xl bg-black border border-white/10 shrink-0 p-1"
                  />
                  <div>
                    <h3 className="font-sans font-bold text-base text-white">
                      {selectedProduct.title}
                    </h3>
                    <p className="font-sans text-xs text-white/60 line-clamp-1 mt-0.5">
                      {selectedProduct.tagline}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="font-sans font-black italic text-lg text-aws-orange">
                        ₹{selectedProduct.price}
                      </span>
                      <span className="font-mono text-xs text-white/40 line-through">
                        ₹{selectedProduct.mrp}
                      </span>
                      {selectedProduct.savings && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] rounded font-bold">
                          Save ₹{selectedProduct.savings}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Increment / Decrement Controls */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 shrink-0">
                  <span className="font-mono text-[10px] text-white/50 uppercase">
                    Quantity
                  </span>
                  <div className="flex items-center gap-2 bg-black/80 border border-white/15 rounded-xl p-1.5 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-white font-bold flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-black text-white w-6 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      disabled={quantity >= 10}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-white font-bold flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-mono text-[10px] text-white/40">
                    Subtotal: ₹{subtotal} INR
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Delivery & Pickup Mode */}
            <div className="p-5 sm:p-6 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <span className="font-mono text-xs font-bold text-aws-orange uppercase tracking-wider flex items-center gap-1.5">
                  <Truck size={14} /> 2. Delivery &amp; Pickup Options
                </span>
                <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold">
                  FREE Campus Pickup Available
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {deliveryOptions.map((opt) => {
                  const isOptSelected = selectedDeliveryId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedDeliveryId(opt.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isOptSelected
                          ? "bg-aws-orange/15 border-aws-orange ring-1 ring-aws-orange/40"
                          : "bg-white/[0.02] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          id={opt.id}
                          name="checkout-delivery-page"
                          checked={isOptSelected}
                          onChange={() => setSelectedDeliveryId(opt.id)}
                          className="mt-1 accent-aws-orange cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-xs font-bold text-white">
                              {opt.name}
                            </span>
                            <span className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[8.5px] uppercase text-white/70">
                              {opt.locationTag}
                            </span>
                          </div>
                          <p className="font-sans text-[11px] text-white/60 leading-relaxed mt-1">
                            {opt.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {opt.charge === 0 ? (
                          <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold uppercase rounded">
                            FREE (₹0)
                          </span>
                        ) : (
                          <>
                            <span className="font-sans font-black italic text-sm text-aws-orange">
                              +₹{opt.charge}
                            </span>
                            <span className="font-mono text-[9px] text-white/40 block">
                              INR
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Customer Details & Email OTP Verification */}
            <div className="p-5 sm:p-6 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <span className="font-mono text-xs font-bold text-aws-orange uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} /> 3. Customer &amp; Shipping Details
                </span>
                <span className="font-mono text-[10px] text-white/40 uppercase">
                  Email OTP Verification Required
                </span>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block font-mono text-[10px] uppercase text-white/60 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 bg-black/60 border rounded-lg font-sans text-xs text-white focus:outline-none focus:border-aws-orange ${
                      formErrors.fullName ? "border-f1-red" : "border-white/15"
                    }`}
                  />
                  {formErrors.fullName && (
                    <span className="text-[10px] text-f1-red mt-1 block">
                      {formErrors.fullName}
                    </span>
                  )}
                </div>

                {/* Email with Live OTP Verification Box */}
                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-mono text-[10px] uppercase text-white/70 font-bold flex items-center gap-1.5">
                      <Mail size={12} className="text-aws-orange" /> Email
                      Address (OTP Verification) *
                    </label>
                    {isEmailVerified ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-[9px] font-bold uppercase rounded">
                          <Check size={10} /> Verified
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEmailVerified(false);
                            setOtpSent(false);
                            setOtp("");
                            setOtpSuccessMessage("");
                          }}
                          className="font-mono text-[10px] text-white/50 hover:text-white underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono text-[9px] text-aws-orange uppercase">
                        Verification Required
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={formData.email}
                      disabled={isEmailVerified}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setIsEmailVerified(false);
                        setOtpSent(false);
                        setOtpError("");
                        setOtpSuccessMessage("");
                      }}
                      className={`flex-1 px-3.5 py-2.5 bg-black/60 border rounded-lg font-sans text-xs text-white focus:outline-none focus:border-aws-orange ${
                        isEmailVerified
                          ? "border-emerald-500/50 bg-emerald-950/10 text-emerald-300"
                          : formErrors.email
                            ? "border-f1-red"
                            : "border-white/15"
                      }`}
                    />

                    {!isEmailVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpSending || resendCountdown > 0}
                        className="px-4 py-2.5 bg-aws-orange hover:bg-white text-black font-sans font-black italic uppercase text-xs tracking-wider rounded transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                      >
                        {otpSending ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : resendCountdown > 0 ? (
                          <span>Resend ({resendCountdown}s)</span>
                        ) : otpSent ? (
                          <span>Resend OTP</span>
                        ) : (
                          <span>Send OTP</span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* OTP Code Box when sent and not yet verified */}
                  {otpSent && !isEmailVerified && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pt-2 border-t border-white/10 space-y-2"
                    >
                      <label className="block font-mono text-[10px] uppercase text-white/60">
                        Enter 6-Digit OTP Code sent to your email:
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 123456"
                          value={otp}
                          onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, ""))
                          }
                          className="px-3.5 py-2.5 bg-black/80 border border-aws-orange/40 rounded-lg font-mono text-sm tracking-widest text-center text-white focus:outline-none focus:border-aws-orange w-full sm:w-48"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpVerifying || otp.length !== 6}
                          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-black italic uppercase text-xs tracking-wider rounded transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          {otpVerifying ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <KeyRound size={13} />
                              <span>Verify OTP</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Feedback Messages */}
                  {otpError && (
                    <div className="flex items-center gap-1.5 text-f1-red font-mono text-[11px] mt-1">
                      <AlertCircle size={12} />
                      <span>{otpError}</span>
                    </div>
                  )}

                  {otpSuccessMessage && (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] mt-1">
                      <CheckCircle2 size={12} />
                      <span>{otpSuccessMessage}</span>
                    </div>
                  )}

                  {formErrors.email && !otpError && (
                    <span className="text-[10px] text-f1-red block">
                      {formErrors.email}
                    </span>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block font-mono text-[10px] uppercase text-white/60 mb-1">
                    Phone Number (WhatsApp Active) *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 bg-black/60 border rounded-lg font-sans text-xs text-white focus:outline-none focus:border-aws-orange ${
                      formErrors.phone ? "border-f1-red" : "border-white/15"
                    }`}
                  />
                  {formErrors.phone && (
                    <span className="text-[10px] text-f1-red mt-1 block">
                      {formErrors.phone}
                    </span>
                  )}
                </div>

                {/* Street / Campus Dept Address */}
                <div>
                  <label className="block font-mono text-[10px] uppercase text-white/60 mb-1">
                    {selectedDeliveryId === "campus-pickup"
                      ? "College Department / Year / SVKM Campus Location *"
                      : "Delivery Address / House No / Flat / Street *"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      selectedDeliveryId === "campus-pickup"
                        ? "e.g. Computer Dept, 3rd Year, SVKM IOT"
                        : "e.g. Flat 302, Green Enclave, Deopur"
                    }
                    value={formData.streetAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        streetAddress: e.target.value,
                      })
                    }
                    className={`w-full px-3.5 py-2.5 bg-black/60 border rounded-lg font-sans text-xs text-white focus:outline-none focus:border-aws-orange ${
                      formErrors.streetAddress
                        ? "border-f1-red"
                        : "border-white/15"
                    }`}
                  />
                  {formErrors.streetAddress && (
                    <span className="text-[10px] text-f1-red mt-1 block">
                      {formErrors.streetAddress}
                    </span>
                  )}
                </div>

                {/* City, State, Pincode Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-white/60 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dhule"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className={`w-full px-3.5 py-2.5 bg-black/60 border rounded-lg font-sans text-xs text-white focus:outline-none focus:border-aws-orange ${
                        formErrors.city ? "border-f1-red" : "border-white/15"
                      }`}
                    />
                    {formErrors.city && (
                      <span className="text-[10px] text-f1-red mt-1 block">
                        {formErrors.city}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-white/60 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maharashtra"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      className={`w-full px-3.5 py-2.5 bg-black/60 border rounded-lg font-sans text-xs text-white focus:outline-none focus:border-aws-orange ${
                        formErrors.state ? "border-f1-red" : "border-white/15"
                      }`}
                    />
                    {formErrors.state && (
                      <span className="text-[10px] text-f1-red mt-1 block">
                        {formErrors.state}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-white/60 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 424001"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                      className={`w-full px-3.5 py-2.5 bg-black/60 border rounded-lg font-sans text-xs text-white focus:outline-none focus:border-aws-orange ${
                        formErrors.pincode ? "border-f1-red" : "border-white/15"
                      }`}
                    />
                    {formErrors.pincode && (
                      <span className="text-[10px] text-f1-red mt-1 block">
                        {formErrors.pincode}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-6 text-left">
            <div className="p-6 bg-[#0e0e0e] border border-white/15 rounded-2xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Order Summary
                </span>
                <span className="font-mono text-[10px] text-aws-orange font-bold">
                  {quantity} Item(s)
                </span>
              </div>

              {/* Item Line Row */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-start text-white/80">
                  <div>
                    <span className="font-bold text-white block">
                      {selectedProduct.title}
                    </span>
                    <span className="text-white/40 text-[11px]">
                      Qty: {quantity} × ₹{selectedProduct.price}
                    </span>
                  </div>
                  <span className="font-bold text-white">₹{subtotal} INR</span>
                </div>

                {/* Promo Code Input & Tag Section */}
                <div className="pt-3 pb-1 border-t border-white/5 space-y-2">
                  {!appliedPromo ? (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                          />
                          <input
                            type="text"
                            placeholder="Enter Promo Code (e.g. SCD10)"
                            value={promoInput}
                            onChange={(e) =>
                              setPromoInput(e.target.value.toUpperCase())
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleApplyPromo();
                              }
                            }}
                            className="w-full pl-8 pr-3 py-2 bg-black/60 border border-white/15 focus:border-aws-orange focus:outline-none rounded-lg text-xs font-mono text-white placeholder:text-white/30"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyPromo()}
                          disabled={promoLoading || !promoInput.trim()}
                          className="px-3 py-2 bg-white/10 hover:bg-aws-orange hover:text-black border border-white/10 rounded-lg font-mono text-xs font-bold text-white uppercase transition-all cursor-pointer disabled:opacity-40"
                        >
                          {promoLoading ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </div>

                      {promoError && (
                        <p className="font-mono text-[10px] text-f1-red flex items-center gap-1">
                          <AlertCircle size={10} />
                          <span>{promoError}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag size={13} className="text-emerald-400" />
                        <div>
                          <span className="font-mono text-xs font-bold text-emerald-400 block">
                            PROMO APPLIED: {appliedPromo.code}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-300/70">
                            Saved ₹{appliedPromo.discountAmount} INR
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="p-1 text-white/50 hover:text-f1-red transition-colors cursor-pointer"
                        title="Remove Promo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {promoSuccessMsg && !appliedPromo && (
                    <p className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                      <Check size={10} />
                      <span>{promoSuccessMsg}</span>
                    </p>
                  )}
                </div>

                {/* Promo Discount Row (if applied) */}
                {appliedPromo && appliedPromo.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-400 pt-2 border-t border-white/5 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={12} />
                      <span>Promo Discount ({appliedPromo.code})</span>
                    </span>
                    <span className="font-bold">
                      -₹{appliedPromo.discountAmount} INR
                    </span>
                  </div>
                )}

                {/* Delivery Fee Row */}
                <div className="flex justify-between items-start text-white/80 pt-2 border-t border-white/5">
                  <div>
                    <span className="block text-white/70">Delivery Fee</span>
                    <span className="text-white/40 text-[11px]">
                      {selectedDelivery.shortName}
                    </span>
                  </div>
                  <span
                    className={`font-bold ${
                      selectedDelivery.charge === 0
                        ? "text-emerald-400"
                        : "text-white"
                    }`}
                  >
                    {selectedDelivery.charge === 0
                      ? "FREE (₹0)"
                      : `+₹${selectedDelivery.charge} INR`}
                  </span>
                </div>

                {/* Total Row */}
                <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                  <div>
                    <span className="font-sans font-black italic text-base uppercase text-white block">
                      Grand Total
                    </span>
                    <span className="font-mono text-[10px] text-white/40">
                      Inclusive of all taxes
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-sans font-black italic text-2xl sm:text-3xl text-aws-orange">
                      ₹{totalAmount}
                    </span>
                    <span className="font-mono text-xs text-white/40 uppercase ml-1">
                      INR
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Alert Banner */}
              {paymentError && (
                <div className="p-4 bg-red-950/40 border border-f1-red/50 rounded-xl text-f1-red font-mono text-xs flex items-start gap-2.5 shadow-lg">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase mb-0.5">
                      Payment Notice:
                    </span>
                    <span>{paymentError}</span>
                  </div>
                </div>
              )}

              {/* Out of Stock Notice */}
              {isProductOutOfStock && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-mono text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>
                    This merchandise is currently Sold Out in the live
                    inventory.
                  </span>
                </div>
              )}

              {/* Primary Place Order CTA */}
              <button
                type="submit"
                disabled={
                  submittingOrder || paymentVerifying || isProductOutOfStock
                }
                className="w-full py-4 bg-aws-orange hover:bg-white text-black font-sans font-black italic uppercase text-xs tracking-widest skew-x-[-6deg] transition-all shadow-[0_0_25px_rgba(255,153,0,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProductOutOfStock ? (
                  <span className="skew-x-[6deg]">Sold Out (Out of Stock)</span>
                ) : paymentVerifying ? (
                  <span className="skew-x-[6deg] flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Verifying
                    Payment Signature...
                  </span>
                ) : submittingOrder ? (
                  <span className="skew-x-[6deg] flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Launching
                    Razorpay...
                  </span>
                ) : (
                  <span className="skew-x-[6deg] flex items-center gap-2">
                    <Lock size={15} /> Pay ₹{totalAmount} with Razorpay
                  </span>
                )}
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2.5 text-[10px] font-mono text-white/50 pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Instant UPI (GPay / PhonePe / Paytm)
                </span>
                <span>•</span>
                <span>Debit / Credit Cards</span>
                <span>•</span>
                <span>Net Banking</span>
              </div>

              {/* Trust Assurances */}
              <div className="pt-4 border-t border-white/5 space-y-2 font-mono text-[11px] text-white/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={14}
                    className="text-emerald-400 shrink-0"
                  />
                  <span>100% Official SCD Dhule 2026 Merchandise</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-aws-orange shrink-0" />
                  <span>Direct Campus Pickup or Express Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-f1-red shrink-0" />
                  <span>Instant Confirmation with Core Organizers</span>
                </div>
              </div>
            </div>

            {/* Direct Organizer Contact Box */}
            <div className="p-4 bg-black/60 border border-white/10 rounded-xl font-mono text-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-aws-orange tracking-widest block">
                Direct Organizers Helpline:
              </span>
              <div className="flex items-center justify-between text-white/80">
                <span>Soham Chaudhari</span>
                <a
                  href="tel:+919834382337"
                  className="text-aws-orange hover:underline font-bold"
                >
                  +91 98343 82337
                </a>
              </div>
              <div className="flex items-center justify-between text-white/80">
                <span>Vaibhav Chaudhari</span>
                <a
                  href="tel:+918007298092"
                  className="text-aws-orange hover:underline font-bold"
                >
                  +91 80072 98092
                </a>
              </div>
            </div>
          </div>
        </form>
      </main>

      <FooterSection />
    </div>
  );
};
