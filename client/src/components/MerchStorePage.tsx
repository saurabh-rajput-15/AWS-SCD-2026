import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { merchProducts, deliveryOptions } from '../data/merchProducts';
import { api } from '../lib/api';
import {
  ShoppingBag,
  ArrowRight,
  Star,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Zap,
  Gift,
  ArrowLeft,
  Tag,
  Phone,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { FooterSection } from './FooterSection';


const ProductCardImage = ({
  images,
  title,
  icon: Icon
}: {
  images: string[];
  title: string;
  icon: any;
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // IntersectionObserver for mobile/touch screen auto-play when scrolled in view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.45 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Amazon/Flipkart 3-second cycle on hover (desktop) OR when in view (mobile/touch devices)
  useEffect(() => {
    if (images.length <= 1) return;

    const isTouchDevice =
      typeof window !== 'undefined' &&
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const shouldRotate = isHovered || (isTouchDevice && isInView);

    if (!shouldRotate) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, isInView, images.length]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveIdx(0);
      }}
      className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/60 border border-white/5"
    >
      <motion.img
        key={activeIdx}
        src={images[activeIdx]}
        alt={title}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-108"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />

      {/* Progress Dots / Bars (Flipkart / Amazon style) */}
      {images.length > 1 && (
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 z-10">
          {images.map((_, dotIdx) => (
            <span
              key={dotIdx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                dotIdx === activeIdx
                  ? 'w-4 bg-aws-orange'
                  : 'w-1.5 bg-white/35'
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/70 backdrop-blur-md rounded text-white/70 font-mono text-[9px] z-10">
        <Icon size={11} className="text-aws-orange" />
        <span>{activeIdx + 1}/{images.length} Photos</span>
      </div>
    </div>
  );
};

export const MerchStorePage = () => {
  const [inventoryStock, setInventoryStock] = useState<Record<string, { capacity: number; sold: number; remaining: number; in_stock: boolean }> | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Official Merch Store | AWS Student Community Day Dhule 2026';
    
    api
      .get('/api/merch/inventory')
      .then((res) => {
        if (res.data?.inventory) {
          setInventoryStock(res.data.inventory);
        }
      })
      .catch(() => {});
  }, []);


  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col selection:bg-aws-orange selection:text-black">
      {/* Background Ambience */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="fixed -top-20 left-1/3 w-[600px] h-[600px] bg-aws-orange/5 blur-[180px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-20 right-1/4 w-[600px] h-[600px] bg-f1-red/5 blur-[180px] rounded-full pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-[#070707]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors"
        >
          <ArrowLeft size={16} className="text-aws-orange" />
          <span>Back to Event</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="font-sans font-black italic text-sm uppercase tracking-tight text-white hidden sm:inline-block">
            AWS SCD Dhule 2026
          </span>
          <span className="h-4 w-px bg-white/10 hidden sm:inline-block" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-aws-orange/10 border border-aws-orange/30 rounded-full font-mono text-[10px] text-aws-orange uppercase tracking-wider font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-aws-orange animate-ping" />
            <span>Merch Store Drop</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-10 sm:py-16 relative z-10 flex flex-col gap-12">
        {/* Hero Banner Header */}
        <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
              <span className="font-mono text-xs font-bold text-aws-orange uppercase tracking-widest">
                [MRCH // OFFICIAL STORE]
              </span>
            </div>
            <h1 className="font-sans font-black italic text-3xl sm:text-5xl uppercase tracking-tight text-white">
              Official Merch Store
            </h1>
            <p className="font-sans text-xs sm:text-sm text-white/60 max-w-2xl mt-2 leading-relaxed">
              Take home the official AWS Student Community Day Dhule 2026 gear. Select a product below to view high-definition photos, specs, and complete your order.
            </p>
          </div>

          <div className="flex items-center gap-3 self-center sm:self-auto">
            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg font-mono text-xs text-white/70">
              3 Official Drops Available
            </span>
          </div>
        </div>

        {/* 3 Products Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {merchProducts.map((product, idx) => {
            const Icon =
              product.id === 'bag'
                ? ShoppingBag
                : product.id === 'welcome-kit'
                ? Gift
                : Zap;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`rounded-2xl flex flex-col justify-between overflow-hidden border transition-all duration-300 group ${
                  product.isPopular
                    ? 'bg-[#0f0f0f] border-aws-orange/80 shadow-[0_0_35px_rgba(255,153,0,0.18)] hover:shadow-[0_0_45px_rgba(255,153,0,0.3)] ring-1 ring-aws-orange/40'
                    : 'bg-[#0a0a0a] border-white/10 hover:border-white/25 hover:bg-[#0e0e0e] shadow-xl'
                }`}
              >
                {/* Top Badge bar */}
                <div className="p-5 pb-0 flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest font-black rounded ${
                      product.isPopular
                        ? 'bg-aws-orange text-black font-extrabold shadow-[0_0_10px_rgba(255,153,0,0.4)]'
                        : 'bg-white/10 text-white/90 border border-white/10'
                    }`}
                  >
                    {product.badge}
                  </span>
                  <div className="flex items-center gap-1 text-emerald-400 font-mono text-[10px] font-bold">
                    <Star size={12} fill="currentColor" />
                    <span>{product.rating}</span>
                  </div>
                </div>

                {/* Clickable Image Container */}
                <Link
                  to={`/product/${product.id}`}
                  className="p-5 block overflow-hidden"
                  aria-label={`View ${product.title}`}
                >
                  <ProductCardImage
                    images={product.images}
                    title={product.title}
                    icon={Icon}
                  />
                </Link>

                {/* Content Section */}
                <div className="px-5 pb-5 flex-1 flex flex-col justify-between text-left">
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-sans font-black italic text-2xl sm:text-3xl text-aws-orange">
                        ₹{product.price}
                      </span>
                      <span className="font-mono text-[10px] text-white/40 uppercase">INR</span>
                      <span className="font-mono text-xs text-white/40 line-through">
                        ₹{product.mrp}
                      </span>
                      {product.savings && (
                        <span className="font-mono text-[9px] text-emerald-400 font-bold uppercase">
                          Save ₹{product.savings}
                        </span>
                      )}
                    </div>

                    {/* Live Stock Badge from DB */}
                    {inventoryStock && inventoryStock[product.id] && (
                      <div className="mb-2">
                        {inventoryStock[product.id].remaining <= 0 ? (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-mono text-[9px] font-bold uppercase inline-flex items-center gap-1">
                            <AlertTriangle size={10} /> Sold Out
                          </span>
                        ) : inventoryStock[product.id].remaining <= 15 ? (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded font-mono text-[9px] font-bold uppercase inline-flex items-center gap-1">
                            <AlertTriangle size={10} /> Only {inventoryStock[product.id].remaining} left in stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold uppercase">
                            In Stock ({inventoryStock[product.id].remaining} units)
                          </span>
                        )}
                      </div>
                    )}

                    <Link to={`/product/${product.id}`} className="block group-hover:text-aws-orange transition-colors">
                      <h2 className="font-sans font-black italic text-lg sm:text-xl uppercase tracking-tight text-white mb-1.5">
                        {product.shortTitle}
                      </h2>
                    </Link>


                    <p className="font-sans text-xs text-white/60 line-clamp-2 leading-relaxed mb-4">
                      {product.tagline}
                    </p>

                    {/* Bullet Highlights */}
                    <div className="space-y-1.5 mb-5 border-t border-white/5 pt-3">
                      {product.highlights.slice(0, 3).map((h) => (
                        <div key={h} className="flex items-start gap-2 text-[11px] font-sans text-white/70">
                          <CheckCircle2 size={12} className="text-aws-orange shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buy / View Details CTA Button */}
                  <Link
                    to={`/product/${product.id}`}
                    className={`w-full py-3.5 px-4 rounded-xl font-sans font-black italic uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      product.isPopular
                        ? 'bg-aws-orange text-black hover:bg-white shadow-[0_0_20px_rgba(255,153,0,0.3)]'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                    }`}
                  >
                    <span>View Product &amp; Buy</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Delivery Options Overview Card */}
        <div className="p-6 sm:p-8 bg-[#0b0b0b] border border-white/10 rounded-2xl text-left shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-6">
            <div>
              <span className="font-mono text-[10px] text-aws-orange uppercase font-bold tracking-widest">
                DISPATCH &amp; FULFILLMENT DESK
              </span>
              <h3 className="font-sans font-black italic text-xl uppercase text-white mt-1">
                Available Delivery &amp; Pickup Options
              </h3>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
              <ShieldCheck size={16} /> Verified Safe Dispatch
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deliveryOptions.map((opt) => (
              <div
                key={opt.id}
                className="p-4 bg-white/[0.02] border border-white/10 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-aws-orange/10 border border-aws-orange/30 text-aws-orange font-mono text-[9px] uppercase font-bold rounded">
                      {opt.badge}
                    </span>
                    <span className="font-sans font-black italic text-sm text-white">
                      ₹{opt.charge} INR
                    </span>
                  </div>
                  <h4 className="font-sans font-bold text-xs text-white mb-1.5">{opt.name}</h4>
                  <p className="font-sans text-[11px] text-white/60 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[10px] text-white/40">
                  Agent: {opt.agent}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Organizer Helpline */}
        <div className="p-6 bg-black/60 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-1">
            <h4 className="font-sans font-black italic text-lg uppercase text-white">
              Need Assistance or Bulk Orders?
            </h4>
            <p className="font-sans text-xs text-white/60">
              Connect directly with our core organizing team for any inquiries or campus pickups.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:+919834382337"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs rounded flex items-center gap-2 transition-colors"
            >
              <Phone size={12} className="text-aws-orange" /> Soham: +91 98343 82337
            </a>
            <a
              href="tel:+918007298092"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs rounded flex items-center gap-2 transition-colors"
            >
              <Phone size={12} className="text-aws-orange" /> Vaibhav: +91 80072 98092
            </a>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};
