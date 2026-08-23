import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { SectionHeader } from './LayoutElements';
import { merchProducts } from '../data/merchProducts';
import {
  ShoppingBag,
  ArrowRight,
  Star,
  CheckCircle2,
  Tag,
  Truck,
  ShieldCheck,
  Zap,
  Gift
} from 'lucide-react';

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

export const MerchandiseStoreSection = () => {
  return (
    <section
      id="store"
      className="relative py-20 sm:py-28 px-4 sm:px-12 lg:px-24 bg-[#050505] border-b border-white/5 overflow-hidden"
      aria-label="Merchandise Store"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
      <div className="absolute -top-10 left-1/4 w-[500px] h-[500px] bg-aws-orange/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 right-1/4 w-[500px] h-[500px] bg-f1-red/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <SectionHeader
            title="Merch Store"
            subtitle="Official SCD Dhule 2026 paddock collectibles. Select any product below for full details, specifications, and fast dispatch."
            sysId="03.MRCH"
          />
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-aws-orange/10 border border-aws-orange/30 rounded-full font-mono text-[10px] sm:text-xs text-aws-orange uppercase tracking-wider font-bold shrink-0 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-aws-orange animate-ping" />
            <span>Official Post-Event Stock</span>
          </div>
        </div>

        {/* 3 Products Grid */}
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
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
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

                    <Link to={`/product/${product.id}`} className="block group-hover:text-aws-orange transition-colors">
                      <h3 className="font-sans font-black italic text-lg sm:text-xl uppercase tracking-tight text-white mb-1.5">
                        {product.shortTitle}
                      </h3>
                    </Link>

                    <p className="font-sans text-xs text-white/60 line-clamp-2 leading-relaxed mb-4">
                      {product.tagline}
                    </p>

                    {/* Bullet Highlights */}
                    <div className="space-y-1.5 mb-5 border-t border-white/5 pt-3">
                      {product.highlights.slice(0, 2).map((h) => (
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
                    <span>View &amp; Buy (₹{product.price})</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Delivery Info Bar */}
        <div className="p-4 sm:p-5 bg-[#0a0a0a] border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-aws-orange/10 border border-aws-orange/30 flex items-center justify-center text-aws-orange shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <p className="font-sans font-bold text-xs sm:text-sm text-white">
                FREE Campus Pickup at SVKM IOT / STME Campus • Hand Delivery &amp; Pan India Courier
              </p>
              <p className="font-mono text-[10px] text-white/50">
                Collect for FREE at SVKM IOT Dhule / STME Campus, or get hand delivery in Dhule (Soham) &amp; Amalner (Vaibhav), or Pan India Courier (₹99).
              </p>
            </div>
          </div>

          <Link
            to="/merchstore"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-mono text-xs uppercase tracking-wider rounded-lg transition-colors shrink-0"
          >
            Explore Merch Store →
          </Link>
        </div>
      </div>
    </section>
  );
};
