import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { api } from "../lib/api";
import { findProductById, deliveryOptions } from "../data/merchProducts";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Printer,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Tag,
} from "lucide-react";


import { FooterSection } from "./FooterSection";

export const MerchOrderPage = () => {
  const { orderRef } = useParams<{ orderRef: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!orderRef) {
      setError("Order reference is required");
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get(`/api/merch/order/${encodeURIComponent(orderRef)}`)
      .then((res) => {
        setOrder(res.data.order);
        setLoading(false);
        document.title = `Order ${res.data.order.order_ref} | AWS SCD Dhule 2026`;
      })
      .catch((err) => {
        console.error("Failed to load merch order:", err);
        setError(
          err.response?.data?.message ||
            "Order not found. Please check your order reference and try again.",
        );
        setLoading(false);
      });
  }, [orderRef]);

  const formatExpectedDate = (
    orderDateStr?: string,
    customDateStr?: string,
  ): string => {
    if (customDateStr && customDateStr.trim()) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(customDateStr.trim())) {
        const parts = customDateStr.trim().split("-");
        const d = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2]),
        );
        return d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
      return customDateStr;
    }
    const base = orderDateStr ? new Date(orderDateStr) : new Date();
    const target = new Date(base.getTime() + 5 * 24 * 60 * 60 * 1000);
    return target.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const copyRef = () => {
    if (order?.order_ref) {
      navigator.clipboard.writeText(order.order_ref);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col items-center justify-center p-4">
        <Loader2 size={36} className="animate-spin text-aws-orange mb-3" />
        <span className="font-mono text-xs uppercase tracking-widest text-white/60">
          Loading order details...
        </span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col justify-between">
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
            <AlertCircle size={32} />
          </div>
          <h1 className="font-sans font-black italic text-2xl uppercase tracking-tight text-white mb-2">
            Order Not Found
          </h1>
          <p className="font-sans text-xs text-white/60 mb-6">
            {error || "We could not find any order with that reference."}
          </p>
          <Link
            to="/merchstore"
            className="inline-flex items-center gap-2 px-6 py-3 bg-aws-orange hover:bg-white text-black font-sans font-black italic uppercase text-xs tracking-wider rounded-lg transition-colors"
          >
            <ArrowLeft size={14} /> Back to Merch Store
          </Link>
        </div>
        <FooterSection />
      </div>
    );
  }

  const product = findProductById(order.product_id);
  const isPaid = order.payment_status === "PAID";

  // Step Calculation
  let currentStep = 1;
  if (isPaid) currentStep = 2;
  if (order.status === "PROCESSING") currentStep = 2.5;
  if (order.status === "DISPATCHED") currentStep = 3;
  if (order.status === "DELIVERED") currentStep = 4;

  const steps = [
    { title: "Order Placed", desc: "Recorded in DB", completed: true },
    {
      title: "Payment Verified",
      desc: isPaid ? "Razorpay Confirmed ✓" : "Payment Pending",
      completed: isPaid,
    },
    {
      title: "Packaging & Dispatched",
      desc:
        order.status === "DISPATCHED" || order.status === "DELIVERED"
          ? "Handled by Team"
          : "In Queue",
      completed: order.status === "DISPATCHED" || order.status === "DELIVERED",
    },
    {
      title: "Delivered / Ready",
      desc:
        order.status === "DELIVERED" ? "Fulfilled ✓" : "Event Day / Courier",
      completed: order.status === "DELIVERED",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col selection:bg-aws-orange selection:text-black">
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          body {
            background-color: #ffffff !important;
            color: #111827 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. DEDICATED OFFICIAL PRINTABLE INVOICE (SHOWN ONLY ON PRINT / DOWNLOAD) */}
      {/* ========================================================================= */}
      <div className="hidden print:block bg-white text-gray-900 font-sans text-xs leading-relaxed p-2">
        {/* Top Header with 3 Logos */}
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4 mb-4">
          <div className="w-1/3 flex justify-start items-center">
            <img
              src="/scd-invoice.png"
              alt="AWS SCD Dhule 2026"
              className="h-22 w-auto object-contain"
            />
          </div>
          <div className="w-1/3 flex justify-center items-center">
            <img
              src="/AWS_Builder.png"
              alt="AWS SBG / Cloud Club"
              className="h-16 w-auto object-contain"
            />
          </div>
          <div className="w-1/3 flex justify-end items-center">
            <img
              src="/ARIF.png"
              alt="ARIF Logo"
              className="h-22 w-auto object-contain"
            />
          </div>
        </div>

        {/* Invoice Title & Metadata Ribbon */}
        <div className="bg-[#0f1923] text-white p-4 rounded-lg flex items-center justify-between mb-5">
          <div>
            <span className="font-mono text-[10px] text-[#FF9900] uppercase font-bold tracking-widest block">
              OFFICIAL MERCHANDISE RECEIPT
            </span>
            <h1 className="font-sans font-black italic text-xl uppercase tracking-wide text-white">
              TAX &amp; ORDER INVOICE
            </h1>
            <span className="font-mono text-[11px] text-gray-300">
              Invoice ID:{" "}
              <strong className="text-white">INV-{order.order_ref}</strong>
            </span>
          </div>

          <div className="text-right font-mono text-[11px] space-y-1">
            <div>
              <span className="text-gray-400">Order Ref: </span>
              <span className="font-bold text-[#FF9900] text-sm">
                #{order.order_ref}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Order Date: </span>
              <span className="text-white">
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Payment: </span>
              <span className="font-bold text-emerald-400">
                {isPaid ? "PAID ✓ (Razorpay)" : "PENDING"}
              </span>
            </div>
          </div>
        </div>

        {/* Name and Customer / Delivery Details (Top Grid) */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Customer & Billing Details */}
          <div className="border border-gray-200 rounded-lg p-3.5 bg-gray-50/70">
            <h2 className="font-mono text-[10px] font-bold uppercase text-[#FF9900] tracking-wider mb-2.5 border-b border-gray-200 pb-1">
              Customer &amp; Billing Information
            </h2>
            <div className="space-y-1.5 text-xs">
              <div className="flex">
                <span className="w-28 text-gray-500 font-medium">
                  Customer Name:
                </span>
                <span className="font-bold text-gray-900">
                  {order.customer_name}
                </span>
              </div>
              <div className="flex">
                <span className="w-28 text-gray-500 font-medium">Email:</span>
                <span className="text-gray-900">
                  {order.customer_email} (Verified ✓)
                </span>
              </div>
              <div className="flex">
                <span className="w-28 text-gray-500 font-medium">
                  Phone Number:
                </span>
                <span className="font-bold text-gray-900">
                  {order.customer_phone}
                </span>
              </div>
              <div className="flex">
                <span className="w-28 text-gray-500 font-medium">
                  Payment Method:
                </span>
                <span className="text-gray-900">Razorpay Online Gateway</span>
              </div>
              {order.razorpay_payment_id && (
                <div className="flex font-mono text-[10px]">
                  <span className="w-28 text-gray-500 font-medium font-sans text-xs">
                    Payment ID:
                  </span>
                  <span className="font-bold text-emerald-700">
                    {order.razorpay_payment_id}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping & Delivery Details */}
          <div className="border border-gray-200 rounded-lg p-3.5 bg-gray-50/70">
            <h2 className="font-mono text-[10px] font-bold uppercase text-[#FF9900] tracking-wider mb-2.5 border-b border-gray-200 pb-1">
              Delivery &amp; Handover Details
            </h2>
            <div className="space-y-1.5 text-xs">
              <div className="flex">
                <span className="w-28 text-gray-500 font-medium">
                  Delivery Mode:
                </span>
                <span className="font-bold text-gray-900">
                  {order.delivery_option_name}
                </span>
              </div>
              <div className="flex">
                <span className="w-28 text-gray-500 font-medium">
                  Expected Delivery:
                </span>
                <span className="font-bold text-[#ea580c]">
                  {formatExpectedDate(
                    order.created_at,
                    order.expected_delivery_date,
                  )}
                </span>
              </div>
              <div className="flex">
                <span className="w-28 text-gray-500 font-medium">
                  Destination Address:
                </span>
                <span className="text-gray-900 flex-1">
                  {order.delivery_address}
                </span>
              </div>
              <div className="flex">
                <span className="w-28 text-gray-500 font-medium">
                  Location:
                </span>
                <span className="text-gray-900">
                  {order.city}, {order.state} - {order.pincode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Table (Below Customer Details) */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0f1923] text-white font-mono text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">
                  Item Description &amp; Specifications
                </th>
                <th className="py-2.5 px-3 text-right w-24">Unit Price</th>
                <th className="py-2.5 px-3 text-center w-16">Qty</th>
                <th className="py-2.5 px-3 text-right w-28">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-white">
                <td className="py-3 px-3 text-center font-mono text-gray-400">
                  1
                </td>
                <td className="py-3 px-3">
                  <div className="font-bold text-gray-900 text-sm">
                    {order.product_title}
                  </div>
                  {product?.inclusions && (
                    <div className="text-[11px] text-gray-600 mt-1">
                      <span className="font-medium text-gray-700">
                        Includes:{" "}
                      </span>
                      {product.inclusions.join(" • ")}
                    </div>
                  )}
                </td>
                <td className="py-3 px-3 text-right font-mono text-gray-800">
                  ₹{order.unit_price}
                </td>
                <td className="py-3 px-3 text-center font-mono font-bold text-gray-900">
                  {order.quantity}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">
                  ₹{order.subtotal}
                </td>
              </tr>

              <tr className="bg-gray-50/50">
                <td className="py-2.5 px-3 text-center font-mono text-gray-400">
                  2
                </td>
                <td className="py-2.5 px-3 text-gray-700 font-medium">
                  Delivery / Logistics Fee ({order.delivery_option_name})
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-gray-600">
                  {order.delivery_charge === 0
                    ? "₹0"
                    : `₹${order.delivery_charge}`}
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-gray-600">
                  1
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                  {order.delivery_charge === 0
                    ? "FREE (₹0)"
                    : `₹${order.delivery_charge}`}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Table Totals Summary */}
          <div className="bg-gray-50 border-t border-gray-200 p-3.5 flex justify-between items-center">
            <div className="text-[11px] text-gray-500 font-mono">
              <span>
                All amounts are in <strong>Indian Rupees (INR)</strong> <br />•
                Inclusive of applicable taxes
              </span>
            </div>
            <div className="w-64 space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span className="font-mono">₹{order.subtotal} INR</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promo Discount ({order.promo_code || "APPLIED"}):</span>
                  <span className="font-mono">
                    -₹{order.discount_amount} INR
                  </span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges:</span>
                <span className="font-mono">
                  {order.delivery_charge === 0
                    ? "₹0 (FREE)"
                    : `₹${order.delivery_charge} INR`}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t-2 border-gray-900 text-sm font-bold text-gray-900">
                <span>Grand Total Paid:</span>
                <span className="font-mono text-base font-black text-gray-900 px-2 py-0.5 bg-[#FF9900]/20 rounded">
                  ₹{order.total_amount} INR
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: SCD Email + Organizer Helpline */}
        <div className="mt-8 border-t-2 border-gray-200 pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 font-mono text-[11px]">
            <div>
              <span className="font-bold text-gray-900 uppercase block mb-1">
                Official Event &amp; Support Contact
              </span>
              <div className="text-gray-600 space-y-0.5">
                <div>
                  Email:{" "}
                  <strong className="text-gray-900">
                    info@aws-scd-dhule.tech
                  </strong>
                </div>
                <div>
                  Website:{" "}
                  <strong className="text-gray-900">
                    https://aws-scd-dhule.tech
                  </strong>
                </div>
                <div>
                  Venue: SVKM's Institute of Technology, Dhule, Maharashtra
                </div>
              </div>
            </div>

            <div>
              <span className="font-bold text-gray-900 uppercase block mb-1">
                Organizers Helpline Desk
              </span>
              <div className="text-gray-600 space-y-0.5">
                <div>
                  Soham Chaudhari :{" "}
                  <strong className="text-gray-900">+91 98343 82337</strong>
                </div>
                <div>
                  Vaibhav Chaudhari:{" "}
                  <strong className="text-gray-900">+91 80072 98092</strong>
                </div>
                <div>
                  Fulfillment: AWS Student Community Day Dhule 2026 Core Team
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-2.5 rounded text-center text-[10px] text-gray-500 font-mono">
            This is a computer-generated tax invoice &amp; proof of purchase for
            AWS Student Community Day Dhule 2026. Please retain this document
            for delivery verification or on-campus item collection.
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ON-SCREEN ORDER TRACKING EXPERIENCE (HIDDEN ON PRINT)                  */}
      {/* ========================================================================= */}
      <div className="print:hidden flex flex-col flex-1">
        {/* Ambience */}
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="fixed -top-20 left-1/4 w-[500px] h-[500px] bg-aws-orange/5 blur-[180px] rounded-full pointer-events-none" />

        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-[#070707]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <Link
            to="/merchstore"
            className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors"
          >
            <ArrowLeft size={16} className="text-aws-orange" />
            <span>Back to Merch Store</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-mono text-xs text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <Printer size={13} />
              <span>Print Official Invoice</span>
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full font-mono text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
              <ShieldCheck size={12} />
              <span>Official Order</span>
            </div>
          </div>
        </header>

        {/* Main Order Content */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 relative z-10">
          {/* Breadcrumb & Title */}
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
              <span className="text-aws-orange font-bold">Order Tracking</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="font-mono text-xs text-aws-orange font-bold uppercase tracking-widest block mb-1">
                  OFFICIAL SCD 2026 ORDER
                </span>
                <div className="flex items-center gap-3">
                  <h1 className="font-sans font-black italic text-3xl sm:text-4xl uppercase tracking-tight text-white">
                    {order.order_ref}
                  </h1>
                  <button
                    type="button"
                    onClick={copyRef}
                    className="p-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                    title="Copy Order Reference"
                  >
                    {copiedToken ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>

              {/* Status Pills & Expected Delivery */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider ${
                    isPaid
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                      : "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                  }`}
                >
                  {isPaid ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                  <span>{isPaid ? "Payment Verified" : "Payment Pending"}</span>
                </span>

                <span className="px-3 py-1.5 bg-white/10 border border-white/15 rounded-full font-mono text-xs font-bold uppercase text-white/80">
                  {order.status || "PENDING"}
                </span>

                <span className="px-3 py-1.5 bg-aws-orange/15 border border-aws-orange/40 rounded-full font-mono text-xs font-bold text-aws-orange flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,153,0,0.2)]">
                  <Truck size={13} />
                  <span>
                    Est. Delivery:{" "}
                    {formatExpectedDate(
                      order.created_at,
                      order.expected_delivery_date,
                    )}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Live Fulfillment Stepper */}
          <div className="p-6 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-xl mb-8">
            <span className="font-mono text-xs font-bold text-aws-orange uppercase tracking-wider block mb-4 flex items-center gap-1.5">
              <Truck size={14} /> Live Fulfillment Progress
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
              {steps.map((step, idx) => (
                <div
                  key={step.title}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    step.completed
                      ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                      : "bg-white/[0.02] border-white/10 text-white/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                      Step {idx + 1}
                    </span>
                    {step.completed ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : (
                      <Clock size={16} className="text-white/30" />
                    )}
                  </div>
                  <div>
                    <span className="font-sans font-bold text-xs text-white block">
                      {step.title}
                    </span>
                    <span className="font-mono text-[10px] text-white/50 block mt-0.5">
                      {step.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2-Column Grid: Order Details + Customer/Receipt Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Product & Shipping */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Product Card */}
              <div className="p-6 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-xl space-y-4">
                <span className="font-mono text-xs font-bold text-aws-orange uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag size={14} /> Ordered Item Details
                </span>

                <div className="flex gap-4 items-center">
                  <div className="w-24 h-24 rounded-xl bg-black border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {product?.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={order.product_title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ShoppingBag size={32} className="text-aws-orange" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="font-sans font-bold text-lg text-white truncate">
                      {order.product_title}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 font-mono text-xs text-white/60">
                      <span>
                        Qty:{" "}
                        <strong className="text-white">{order.quantity}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Unit Price:{" "}
                        <strong className="text-white">
                          ₹{order.unit_price}
                        </strong>
                      </span>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded font-mono text-[10px] text-aws-orange font-bold uppercase">
                      <Tag size={10} />
                      <span>Official SCD 2026 Merch</span>
                    </div>
                  </div>
                </div>

                {/* Inclusions */}
                {product?.inclusions && (
                  <div className="pt-4 border-t border-white/5 font-mono text-xs text-white/60">
                    <span className="text-white/40 block mb-2 text-[10px] uppercase tracking-wider">
                      Package Inclusions:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-white/80">
                      {product.inclusions.map((inc) => (
                        <div key={inc} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-aws-orange shrink-0" />
                          <span className="truncate">{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping / Pickup Destination Card */}
              <div className="p-6 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-xl space-y-4">
                <span className="font-mono text-xs font-bold text-aws-orange uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} /> Shipping &amp; Delivery Information
                </span>

                <div className="space-y-3 font-mono text-xs text-white/80">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Delivery Mode:</span>
                    <span className="font-bold text-white text-right max-w-[280px]">
                      {order.delivery_option_name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Recipient Name:</span>
                    <span className="font-bold text-white">
                      {order.customer_name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Contact Phone:</span>
                    <span className="text-aws-orange font-bold">
                      {order.customer_phone}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Contact Email:</span>
                    <span className="text-emerald-400 font-bold">
                      {order.customer_email} (Verified ✓)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Expected Delivery:</span>
                    <span className="font-bold text-aws-orange text-right">
                      {formatExpectedDate(
                        order.created_at,
                        order.expected_delivery_date,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-white/40">Delivery Address:</span>
                    <span className="text-white text-right max-w-[280px]">
                      {order.delivery_address}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Payment Receipt & Contact Support */}
            <div className="lg:col-span-5 flex flex-col gap-6 text-left">
              {/* Invoice Breakdown */}
              <div className="p-6 bg-[#0e0e0e] border border-white/15 rounded-2xl shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Payment &amp; Invoice Summary
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">
                    Razorpay PG
                  </span>
                </div>

                <div className="space-y-2.5 font-mono text-xs text-white/80">
                  <div className="flex justify-between">
                    <span className="text-white/50">Item Subtotal:</span>
                    <span className="font-bold text-white">
                      ₹{order.subtotal} INR
                    </span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>
                        Promo Discount ({order.promo_code || "APPLIED"}):
                      </span>
                      <span>-₹{order.discount_amount} INR</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/50">Delivery Fee:</span>
                    <span className="font-bold text-white">
                      {order.delivery_charge === 0
                        ? "FREE (₹0)"
                        : `+₹${order.delivery_charge} INR`}
                    </span>
                  </div>

                  {order.razorpay_payment_id && (
                    <div className="flex justify-between pt-2 border-t border-white/5 text-[11px]">
                      <span className="text-white/40">
                        Razorpay Payment ID:
                      </span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {order.razorpay_payment_id}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 text-[11px]">
                    <span className="text-white/40">Order Date:</span>
                    <span className="text-white/60">
                      {new Date(order.created_at).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>

                  {/* Total Paid */}
                  <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                    <div>
                      <span className="font-sans font-black italic text-base uppercase text-white block">
                        Total Paid
                      </span>
                      <span className="font-mono text-[10px] text-white/40">
                        Inclusive of all taxes
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-sans font-black italic text-2xl text-aws-orange">
                        ₹{order.total_amount}
                      </span>
                      <span className="font-mono text-xs text-white/40 ml-1">
                        INR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-3 border-t border-white/10">
                  <a
                    href={`https://wa.me/919834382337?text=${encodeURIComponent(
                      `Hi Team! I am checking on my AWS SCD 2026 Merch Order ${order.order_ref} (${order.product_title}, Total Paid: ₹${order.total_amount}). Please confirm dispatch details.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 bg-aws-orange hover:bg-white text-black font-sans font-black italic uppercase text-xs tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,153,0,0.3)]"
                  >
                    <span>Track / Chat on WhatsApp</span>
                    <ExternalLink size={14} />
                  </a>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs text-white/80 hover:text-white uppercase rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Download / Print Official Invoice</span>
                  </button>
                </div>
              </div>

              {/* Direct Helpline Contact */}
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
          </div>
        </main>

        <FooterSection />
      </div>
    </div>
  );
};

export default MerchOrderPage;
