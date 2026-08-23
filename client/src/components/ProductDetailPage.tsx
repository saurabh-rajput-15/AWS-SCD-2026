import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  findProductById,
  deliveryOptions,
  DeliveryOption,
  merchProducts
} from '../data/merchProducts';
import {
  Star,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Phone,
  Mail,
  Copy,
  Check,
  ShoppingBag,
  ExternalLink,
  MapPin,
  User,
  ArrowLeft,
  Tag,
  Zap,
  Info,
  PackageCheck
} from 'lucide-react';
import { FooterSection } from './FooterSection';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const product = findProductById(id);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<
    'campus-pickup' | 'soham-dhule' | 'vaibhav-amalner' | 'pan-india'
  >('campus-pickup');
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [orderSuccessOpen, setOrderSuccessOpen] = useState<boolean>(false);
  const [orderReceipt, setOrderReceipt] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    streetAddress: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImageIndex(0);
    document.title = `${product.title} (₹${product.price}) | SCD Dhule 2026 Merch`;
  }, [product.id]);

  // Auto-change product images every 5 seconds
  useEffect(() => {
    if (product.images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [product.images.length]);

  const selectedDelivery =
    deliveryOptions.find((d) => d.id === selectedDeliveryId) || deliveryOptions[0];

  const subtotal = product.price * quantity;
  const totalAmount = subtotal + selectedDelivery.charge;

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@'))
      errors.email = 'Valid email is required';
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10)
      errors.phone = 'Valid 10-digit phone number is required';
    if (!formData.streetAddress.trim())
      errors.streetAddress = 'Address / House No / Street is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.pincode.trim() || formData.pincode.replace(/\D/g, '').length < 6)
      errors.pincode = 'Valid 6-digit Pincode is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const orderId = `SCD-${product.id.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullAddress = `${formData.streetAddress}${
      formData.landmark ? `, Near ${formData.landmark}` : ''
    }, ${formData.city}, ${formData.state} - ${formData.pincode}`;

    const receipt = {
      orderId,
      product: product.title,
      quantity,
      pricePerUnit: product.price,
      subtotal,
      deliveryOption: selectedDelivery.name,
      deliveryCharge: selectedDelivery.charge,
      totalAmount,
      customer: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress
      },
      createdAt: new Date().toLocaleString()
    };

    setOrderReceipt(receipt);
    setCheckoutOpen(false);
    setOrderSuccessOpen(true);

    // Format WhatsApp order message
    const waText = `🚀 *NEW SCD 2026 MERCH ORDER*\n──────────────────────\n*Order Ref:* ${orderId}\n*Item:* ${product.title}\n*Quantity:* ${quantity}\n*Item Subtotal:* ₹${subtotal} (₹${product.price} x ${quantity})\n\n*Delivery Option:* ${selectedDelivery.name}\n*Delivery Charge:* ₹${selectedDelivery.charge}\n\n*Customer Details:*\n- *Name:* ${formData.fullName}\n- *Phone:* ${formData.phone}\n- *Email:* ${formData.email}\n- *Address:* ${fullAddress}\n\n──────────────────────\n*GRAND TOTAL AMOUNT:* ₹${totalAmount} INR\n──────────────────────\nHi Team! Please confirm my order reservation & dispatch!`;

    const waUrl = `https://wa.me/919834382337?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col selection:bg-aws-orange selection:text-black">
      {/* Background accents */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-aws-orange/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-f1-red/5 blur-[160px] rounded-full pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-[#070707]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/merchstore"
            className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors"
          >
            <ArrowLeft size={16} className="text-aws-orange" />
            <span>Merch Store</span>
          </Link>
          <span className="text-white/20">/</span>
          <span className="font-mono text-xs text-white/80 uppercase truncate max-w-[140px] sm:max-w-xs">
            {product.shortTitle}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded font-mono text-[10px] uppercase text-white/80 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} />}
            <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
          </button>
          <Link
            to="/#store"
            className="px-3.5 py-1.5 bg-aws-orange text-black font-sans font-black italic uppercase text-[10px] tracking-wider skew-x-[-8deg] hover:bg-white transition-all hidden sm:inline-block"
          >
            <span className="skew-x-[8deg] block">View All 3 Items</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-12 relative z-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-white/40 uppercase mb-6 tracking-wider">
          <Link to="/" className="hover:text-aws-orange transition-colors">
            Home
          </Link>
          <span>›</span>
          <Link to="/merchstore" className="hover:text-aws-orange transition-colors">
            Merch Store
          </Link>
          <span>›</span>
          <span className="text-aws-orange font-bold truncate">{product.shortTitle}</span>
        </div>

        {/* Amazon / Flipkart Style 2-Column Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Image Gallery Viewer */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 flex flex-col gap-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[4/3] sm:aspect-[16/11] bg-[#0c0c0c] border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center group shadow-2xl">
              {/* Product Badge */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <span
                  className={`px-3 py-1 font-mono text-[10px] font-black uppercase tracking-widest rounded ${
                    product.isPopular
                      ? 'bg-aws-orange text-black shadow-[0_0_12px_rgba(255,153,0,0.4)]'
                      : 'bg-white/10 text-white backdrop-blur-md border border-white/15'
                  }`}
                >
                  {product.badge}
                </span>
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider rounded flex items-center gap-1">
                  <PackageCheck size={11} /> Ready to Dispatch
                </span>
              </div>

              {/* Lightbox Trigger */}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute top-3 right-3 z-10 p-2.5 bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/15 rounded-xl text-white/80 hover:text-white transition-all cursor-pointer shadow-lg"
                title="Fullscreen Zoom"
              >
                <Maximize2 size={16} />
              </button>

              {/* Main Image */}
              <motion.img
                key={activeImageIndex}
                src={product.images[activeImageIndex]}
                alt={`${product.title} view ${activeImageIndex + 1}`}
                initial={{ opacity: 0.4, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />

              {/* Nav Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-black border border-white/15 rounded-full text-white transition-all cursor-pointer shadow-xl opacity-0 group-hover:opacity-100"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-black border border-white/15 rounded-full text-white transition-all cursor-pointer shadow-xl opacity-0 group-hover:opacity-100"
                    aria-label="Next"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Counter */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded font-mono text-[10px] text-white/80">
                {activeImageIndex + 1} / {product.images.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {product.images.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden shrink-0 border transition-all cursor-pointer bg-black/50 ${
                      activeImageIndex === idx
                        ? 'border-aws-orange ring-2 ring-aws-orange/50 scale-105'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Assurances Under Gallery */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center flex flex-col items-center">
                <ShieldCheck size={18} className="text-emerald-400 mb-1" />
                <span className="font-mono text-[9px] text-white/50 uppercase">100% Authentic</span>
                <span className="font-sans text-xs font-bold text-white">Official Swag</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center flex flex-col items-center">
                <Truck size={18} className="text-aws-orange mb-1" />
                <span className="font-mono text-[9px] text-white/50 uppercase">Fast Shipping</span>
                <span className="font-sans text-xs font-bold text-white">Direct / Courier</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center flex flex-col items-center">
                <Zap size={18} className="text-f1-red mb-1" />
                <span className="font-mono text-[9px] text-white/50 uppercase">Limited Drop</span>
                <span className="font-sans text-xs font-bold text-white">Post-Event Batch</span>
              </div>
            </div>
          </div>

          {/* Right Column: Flipkart / Amazon Style Buy Box & Details */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            {/* Header / Brand */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-[10px] text-aws-orange font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Tag size={12} /> AWS STUDENT COMMUNITY DAY DHULE 2026
                </span>
                <span className="font-mono text-[9px] text-white/40 uppercase">
                  SKU: SCD-26-{product.id.toUpperCase()}
                </span>
              </div>

              <h1 className="font-sans font-black italic text-2xl sm:text-4xl uppercase tracking-tight text-white mb-2">
                {product.title}
              </h1>
              <p className="font-sans text-sm text-white/60 leading-relaxed">
                {product.tagline}
              </p>

              {/* Rating Block */}
              <div className="flex items-center gap-3 mt-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 font-sans font-bold text-xs">
                  <span>{product.rating}</span>
                  <Star size={12} fill="currentColor" />
                </div>
                <span className="font-mono text-xs text-white/60">
                  {product.reviewsCount} Verified Community Builders
                </span>
              </div>
            </div>

            {/* Price Block (Amazon/Flipkart Style) */}
            <div className="p-5 bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-white/10 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-f1-red text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded-bl-lg">
                Special Event Deal
              </div>

              <div className="flex flex-wrap items-baseline gap-3 mb-1">
                <span className="font-sans font-black italic text-3xl sm:text-4xl text-aws-orange">
                  ₹{product.price}
                </span>
                <span className="font-mono text-xs text-white/50 uppercase">INR</span>
                <span className="font-mono text-base text-white/40 line-through">
                  ₹{product.mrp}
                </span>
                <span className="font-mono text-xs text-emerald-400 font-black">
                  ({product.discountPercentage}% OFF)
                </span>
              </div>

              {product.savings && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-400/10 border border-emerald-400/30 rounded-full font-mono text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                  <Tag size={12} /> Save ₹{product.savings} compared to individual purchases!
                </div>
              )}

              <p className="font-mono text-[10px] text-white/40 mt-2 uppercase tracking-wide">
                Inclusive of all taxes • Secure ordering directly via organizing team
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-xl">
              <div>
                <span className="font-mono text-xs font-bold text-white block uppercase tracking-wider">
                  Quantity
                </span>
                <span className="font-mono text-[10px] text-white/40">Select number of units</span>
              </div>
              <div className="flex items-center gap-3 bg-black/60 border border-white/15 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-white font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="font-mono text-sm font-bold text-white w-6 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-white font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Delivery Option Selector Quick Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-aws-orange uppercase tracking-wider flex items-center gap-1.5">
                  <Truck size={14} /> Select Delivery Mode:
                </span>
                <span className="font-mono text-[10px] text-white/40 uppercase">3 Options Available</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {deliveryOptions.map((opt) => {
                  const isOptSelected = selectedDeliveryId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedDeliveryId(opt.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isOptSelected
                          ? 'bg-aws-orange/10 border-aws-orange ring-1 ring-aws-orange/40'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          id={opt.id}
                          name="delivery-option"
                          checked={isOptSelected}
                          onChange={() => setSelectedDeliveryId(opt.id)}
                          className="mt-1 accent-aws-orange cursor-pointer"
                        />
                        <div>
                          <p className="font-sans text-xs font-bold text-white">{opt.name}</p>
                          <p className="font-sans text-[11px] text-white/60 leading-relaxed mt-0.5">
                            {opt.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {opt.charge === 0 ? (
                          <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold uppercase rounded">
                            FREE (₹0)
                          </span>
                        ) : (
                          <>
                            <span className="font-sans font-black italic text-sm text-aws-orange">
                              +₹{opt.charge}
                            </span>
                            <span className="font-mono text-[9px] text-white/40 block">INR</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTAs / Primary Checkout Buttons */}
            <div className="pt-2">
              <Link
                to={`/checkout/${product.id}?qty=${quantity}&delivery=${selectedDeliveryId}`}
                className="w-full py-4 bg-aws-orange hover:bg-white text-black font-sans font-black italic uppercase text-xs tracking-widest skew-x-[-8deg] transition-all shadow-[0_0_25px_rgba(255,153,0,0.35)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="skew-x-[8deg] flex items-center gap-2">
                  <ShoppingBag size={16} /> Proceed to Checkout (₹{totalAmount})
                </span>
              </Link>
            </div>

            {/* Key Highlights */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-3">
                Key Highlights:
              </h3>
              <ul className="space-y-2 text-xs text-white/80 font-sans">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} className="text-aws-orange shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications Table */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-3">
                Specifications:
              </h3>
              <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5 font-mono text-xs">
                {product.specs.map((s) => (
                  <div key={s.name} className="grid grid-cols-2 p-3 bg-white/[0.01]">
                    <span className="text-white/40 uppercase text-[11px]">{s.name}</span>
                    <span className="text-white font-bold text-[11px]">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions Box */}
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
              <span className="font-mono text-xs font-bold text-aws-orange uppercase tracking-wider block mb-2">
                What's Inside the Box:
              </span>
              <div className="space-y-1.5 font-sans text-xs text-white/80">
                {product.inclusions.map((inc) => (
                  <div key={inc} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-aws-orange" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Products Slider / Links */}
            <div className="pt-6 border-t border-white/10">
              <span className="font-mono text-xs font-bold text-white/60 uppercase tracking-widest block mb-4">
                Other SCD 2026 Collectibles:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {merchProducts
                  .filter((p) => p.id !== product.id)
                  .map((other) => (
                    <Link
                      key={other.id}
                      to={`/product/${other.id}`}
                      className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-xl flex items-center gap-3 transition-colors group"
                    >
                      <img
                        src={other.images[0]}
                        alt={other.shortTitle}
                        className="w-14 h-14 object-cover rounded-lg bg-black shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p className="font-sans font-bold text-xs text-white group-hover:text-aws-orange transition-colors truncate">
                          {other.shortTitle}
                        </p>
                        <p className="font-sans font-black italic text-sm text-aws-orange">
                          ₹{other.price} INR
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Drawer / Modal */}
      <AnimatePresence>
        {checkoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setCheckoutOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0e0e0e] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <span className="font-mono text-[10px] text-aws-orange uppercase font-bold tracking-widest">
                    CHECKOUT // MERCH DESK
                  </span>
                  <h3 className="font-sans font-black italic text-2xl uppercase tracking-tight text-white">
                    Complete Your Order
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-6">
                {/* Product Summary Mini Card */}
                <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded-lg bg-black border border-white/10"
                    />
                    <div>
                      <p className="font-sans font-bold text-xs text-white">{product.title}</p>
                      <p className="font-mono text-[11px] text-white/60">
                        Qty: {quantity} × ₹{product.price} = ₹{subtotal}
                      </p>
                    </div>
                  </div>
                  <span className="font-sans font-black italic text-base text-aws-orange">
                    ₹{subtotal}
                  </span>
                </div>

                {/* Delivery Option In Checkout */}
                <div className="space-y-2.5">
                  <label className="font-mono text-xs uppercase font-bold text-aws-orange tracking-wider block">
                    1. Select Delivery Mode:
                  </label>
                  <div className="space-y-2">
                    {deliveryOptions.map((opt) => {
                      const isOptSelected = selectedDeliveryId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedDeliveryId(opt.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isOptSelected
                              ? 'bg-aws-orange/15 border-aws-orange'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="checkout-delivery"
                              checked={isOptSelected}
                              onChange={() => setSelectedDeliveryId(opt.id)}
                              className="accent-aws-orange cursor-pointer"
                            />
                            <div>
                              <span className="font-sans text-xs font-bold text-white block">
                                {opt.name}
                              </span>
                              <span className="font-mono text-[10px] text-white/50">
                                {opt.locationTag} • Handled by {opt.agent}
                              </span>
                            </div>
                          </div>
                          {opt.charge === 0 ? (
                            <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold uppercase rounded">
                              FREE (₹0)
                            </span>
                          ) : (
                            <span className="font-sans font-black italic text-xs text-aws-orange">
                              +₹{opt.charge}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customer Contact & Address Form */}
                <div className="space-y-4">
                  <label className="font-mono text-xs uppercase font-bold text-aws-orange tracking-wider block">
                    2. Customer Information:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          formErrors.fullName ? 'border-f1-red' : 'border-white/15'
                        }`}
                      />
                      {formErrors.fullName && (
                        <span className="text-[10px] text-f1-red mt-1 block">
                          {formErrors.fullName}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase text-white/60 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. rahul@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={`w-full px-3.5 py-2.5 bg-black/60 border rounded-lg font-sans text-xs text-white focus:outline-none focus:border-aws-orange ${
                          formErrors.email ? 'border-f1-red' : 'border-white/15'
                        }`}
                      />
                      {formErrors.email && (
                        <span className="text-[10px] text-f1-red mt-1 block">
                          {formErrors.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-white/60 mb-1">
                      Phone Number (WhatsApp Active) *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-3.5 py-2.5 bg-black/60 border rounded-lg font-sans text-xs text-white focus:outline-none focus:border-aws-orange ${
                        formErrors.phone ? 'border-f1-red' : 'border-white/15'
                      }`}
                    />
                    {formErrors.phone && (
                      <span className="text-[10px] text-f1-red mt-1 block">
                        {formErrors.phone}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-white/60 mb-1">
                      Street Address / House No / Flat / College Campus *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 302, Green Enclave, Deopur"
                      value={formData.streetAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, streetAddress: e.target.value })
                      }
                      className={`w-full px-3.5 py-2.5 bg-black/60 border rounded-lg font-sans text-xs text-white focus:outline-none focus:border-aws-orange ${
                        formErrors.streetAddress ? 'border-f1-red' : 'border-white/15'
                      }`}
                    />
                    {formErrors.streetAddress && (
                      <span className="text-[10px] text-f1-red mt-1 block">
                        {formErrors.streetAddress}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-white/60 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dhule / Amalner"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className={`w-full px-3.5 py-2.5 bg-black/60 border rounded-lg font-sans text-xs text-white focus:outline-none focus:border-aws-orange ${
                          formErrors.city ? 'border-f1-red' : 'border-white/15'
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
                          formErrors.state ? 'border-f1-red' : 'border-white/15'
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
                          formErrors.pincode ? 'border-f1-red' : 'border-white/15'
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

                {/* Final Bill Breakdown */}
                <div className="p-4 bg-black/60 border border-white/10 rounded-xl space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-white/70">
                    <span>Items Total ({quantity} unit)</span>
                    <span>₹{subtotal} INR</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Delivery Charge ({selectedDelivery.shortName})</span>
                    <span>₹{selectedDelivery.charge} INR</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                    <span className="text-aws-orange uppercase">Total Payable Amount</span>
                    <span className="text-aws-orange font-sans font-black italic text-lg">
                      ₹{totalAmount} INR
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-aws-orange hover:bg-white text-black font-sans font-black italic uppercase text-xs tracking-widest skew-x-[-6deg] transition-all shadow-[0_0_25px_rgba(255,153,0,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="skew-x-[6deg] flex items-center gap-2">
                    Submit Order & Confirm on WhatsApp <ExternalLink size={16} />
                  </span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Success / Receipt Modal */}
      <AnimatePresence>
        {orderSuccessOpen && orderReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setOrderSuccessOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0e0e0e] border border-white/15 rounded-2xl w-full max-w-lg p-6 sm:p-8 text-left relative shadow-2xl space-y-5"
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                  <CheckCircle2 size={32} />
                </div>
                <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 tracking-widest">
                  ORDER INITIATED SUCCESSFULLY
                </span>
                <h3 className="font-sans font-black italic text-2xl uppercase tracking-tight text-white mt-1">
                  Thank You, {orderReceipt.customer.name}!
                </h3>
                <p className="font-sans text-xs text-white/60 mt-1">
                  Your order reference token is generated and forwarded to the SCD Dhule team.
                </p>
              </div>

              <div className="p-4 bg-black/60 border border-white/10 rounded-xl space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-white/40">Order Ref:</span>
                  <span className="text-aws-orange font-bold">{orderReceipt.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Product:</span>
                  <span className="text-white font-bold">{orderReceipt.product}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Delivery Mode:</span>
                  <span className="text-white text-right max-w-[200px] truncate">
                    {orderReceipt.deliveryOption}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Address:</span>
                  <span className="text-white text-right max-w-[220px] truncate">
                    {orderReceipt.customer.address}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold">
                  <span className="text-white/60">Grand Total:</span>
                  <span className="text-aws-orange font-sans font-black italic text-base">
                    ₹{orderReceipt.totalAmount} INR
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href={`https://wa.me/919834382337?text=${encodeURIComponent(
                    `Hi Team, following up on my SCD order ${orderReceipt.orderId} for ${orderReceipt.product} (Total: ₹${orderReceipt.totalAmount}).`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-aws-orange hover:bg-white text-black font-sans font-black italic uppercase text-xs tracking-wider rounded flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Chat with Organizer on WhatsApp</span>
                  <ExternalLink size={14} />
                </a>

                <button
                  type="button"
                  onClick={() => setOrderSuccessOpen(false)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs text-white/80 uppercase rounded transition-colors cursor-pointer"
                >
                  Close & Continue Browsing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxOpen(false)}
          >
            <div className="w-full max-w-5xl flex items-center justify-between pb-4 text-white">
              <span className="font-mono text-xs uppercase tracking-widest text-aws-orange font-bold">
                {product.title} ({activeImageIndex + 1}/{product.images.length})
              </span>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div
              className="relative max-w-5xl w-full max-h-[75vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={product.images[activeImageIndex]}
                alt={product.title}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
              />

              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-black border border-white/20 rounded-full text-white transition-all cursor-pointer shadow-xl"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-black border border-white/20 rounded-full text-white transition-all cursor-pointer shadow-xl"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FooterSection />
    </div>
  );
};
