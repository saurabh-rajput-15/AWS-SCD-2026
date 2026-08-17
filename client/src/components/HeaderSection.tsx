import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Speakers', href: '#speakers' },
  { label: 'Agenda', href: '#schedule' },
  { label: 'Feedback', href: '/feedback' },
  { label: 'Sponsors', href: '#sponsors' },
  { label: 'Merch Store', href: '#store' },
  { label: 'Refer & Win', href: '/refertowin' },
  { label: 'Badge', href: '/badge' },
];

function EventStatusBadge() {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.04] border border-white/10 rounded-full font-mono text-[9px] sm:text-[10px] text-white/80 font-bold uppercase tracking-widest">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-emerald-400">EVENT CONCLUDED</span>
    </div>
  );
}

export const HeaderSection = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Custom Styles for Edge Highlights and Shimmer Sweep */}
      <style>{`
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(255,153,0,0.25); box-shadow: 0 0 3px rgba(255,153,0,0.1); }
          50% { border-color: rgba(255,153,0,0.85); box-shadow: 0 0 10px rgba(255,153,0,0.35); }
        }
        @keyframes witGlow {
          0%, 100% { border-color: rgba(236,72,153,0.3); box-shadow: 0 0 3px rgba(236,72,153,0.1); }
          50% { border-color: rgba(236,72,153,0.95); box-shadow: 0 0 12px rgba(236,72,153,0.45); }
        }
        .animate-pulse-border {
          animation: borderGlow 2s infinite ease-in-out;
        }
        .animate-pulse-border-wit {
          animation: witGlow 2s infinite ease-in-out;
        }
        .refer-shimmer {
          position: relative;
          overflow: hidden;
        }
        .refer-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 153, 0, 0.45),
            transparent
          );
          transform: skewX(-25deg);
        }
        .refer-shimmer:hover::after {
          left: 150%;
          transition: left 0.7s ease-in-out;
        }
      `}</style>

      <header className="h-14 sm:h-16 lg:h-20 flex items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-20 z-[9999] fixed top-0 left-0 right-0 transition-all duration-300">
        {/* Dissolving Glass Backdrop */}
        <div 
          className="absolute inset-0 -z-10 bg-black/60 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
          }}
        />
        <div className="flex items-center sm:gap-4 shrink-0">
          <Link to="/">
            <img src="/scd-dhule-logo.png?v=4" alt="SCD Dhule" className="w-28 sm:w-36 lg:w-44 h-auto max-h-16 sm:max-h-20 lg:max-h-24 object-contain" fetchPriority="high" />
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-3 lg:gap-5 xl:gap-7 items-center">
          <nav className="flex gap-2.5 lg:gap-4 xl:gap-5 items-center">
            {navLinks.map((link) => (
              link.label === 'Refer & Win' ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="relative px-2.5 py-1 rounded border border-aws-orange/40 bg-aws-orange/5 font-mono text-[10px] lg:text-xs font-black uppercase tracking-widest text-aws-orange hover:text-white transition-all duration-300 animate-pulse-border refer-shimmer shrink-0"
                >
                  {link.label}
                </Link>
              ) : link.href.startsWith('/') ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="font-mono text-[10px] lg:text-xs font-semibold uppercase tracking-widest text-white/90 hover:text-aws-orange transition-colors drop-shadow-md shrink-0"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-mono text-[10px] lg:text-xs font-semibold uppercase tracking-widest text-white/90 hover:text-aws-orange transition-colors drop-shadow-md shrink-0"
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          <div className="h-5 w-px bg-white/10 shrink-0" />
          <div className="shrink-0 hidden lg:block">
            <EventStatusBadge />
          </div>
          <div className="h-5 w-px bg-white/10 shrink-0 hidden lg:block" />

          <a 
            href="#store" 
            className="px-4 lg:px-5 py-2 bg-aws-orange hover:bg-white text-black font-sans font-black italic uppercase text-xs tracking-widest skew-x-[-12deg] transition-all shadow-[0_0_15px_rgba(255,153,0,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] shrink-0"
          >
            <span className="skew-x-[12deg] block">Merch Store</span>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-3 sm:gap-4">
          <EventStatusBadge />
          <div className="h-6 w-px bg-white/10" />
          <button type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-white/60 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 sm:top-16 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 p-4 flex flex-col gap-4 md:hidden"
          >

            <div className="flex flex-col gap-2 font-mono text-xs uppercase tracking-widest text-white/60 text-left px-2 pt-2">
              {navLinks.map((link) => (
                link.label === 'Refer & Win' ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="relative my-1 max-w-max px-3 py-1.5 rounded border border-aws-orange/40 bg-aws-orange/5 font-mono text-[10px] font-black uppercase tracking-widest text-aws-orange transition-all duration-300 animate-pulse-border refer-shimmer flex items-center gap-1.5"
                  >
                    {link.label}
                  </Link>
                ) : link.href.startsWith('/') ? (
                  <Link key={link.label} to={link.href} onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-aws-orange transition-colors">
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-aws-orange transition-colors">
                    {link.label}
                  </a>
                )
              ))}
              <a href="#store" onClick={() => setMobileMenuOpen(false)} className="py-2 text-aws-orange font-bold hover:text-white transition-colors">Merch Store</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
