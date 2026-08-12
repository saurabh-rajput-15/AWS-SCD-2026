import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, CreditCard, AlertCircle, Phone, Mail } from 'lucide-react';
import type { PassType } from '../hooks/usePassTypes';

interface Props {
  selectedPass: PassType;
  loading: boolean;
  error: string | null;
  onInitiatePayment: () => void;
  onBack: () => void;
}

export function PaymentEmbed({ selectedPass, loading, error, onInitiatePayment, onBack }: Props) {
  useEffect(() => {
    // Auto-initiate payment on mount
    onInitiatePayment();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      {/* Pass summary */}
      <div className="inline-flex items-center gap-3 mb-8 p-4 border border-white/10 bg-white/5">
        <div
          className="w-3 h-12 shrink-0"
          style={{ backgroundColor: selectedPass.badge_color }}
        />
        <div className="text-left">
          <p className="font-sans font-black italic text-lg uppercase tracking-tight text-white">
            {selectedPass.name}
          </p>
          <p className="font-mono text-2xl text-aws-orange font-bold">₹{selectedPass.price}</p>
        </div>
      </div>

      {error && (
        <div className="p-5 mb-6 border border-aws-orange/40 bg-gradient-to-br from-f1-red/20 via-black to-f1-red/10 rounded-xl text-left shadow-xl">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle size={24} className="text-aws-orange shrink-0 mt-0.5" />
            <div>
              <h3 className="font-sans font-black italic text-base sm:text-lg uppercase tracking-tight text-white">
                Digital Passes Currently Sold Out Online
              </h3>
              <p className="font-mono text-xs text-white/80 mt-1 leading-relaxed">
                Digital passes are currently sold out online for a moment. Please contact the organizers for possible physical passes as physical passes are limited!
              </p>
            </div>
          </div>

          <div className="p-4 bg-black/60 border border-white/10 rounded-lg font-mono text-xs space-y-2">
            <p className="text-aws-orange font-bold uppercase tracking-wider text-[11px]">Contact Organizers for Pass Enquiries:</p>
            <div className="text-white/80 space-y-1.5 pt-1">
              <p className="flex items-center justify-between">
                <span>Soham Chaudhari:</span>
                <a href="tel:+919834382337" className="text-aws-orange hover:underline font-bold flex items-center gap-1"><Phone size={12} /> +91 98343 82337</a>
              </p>
              <p className="flex items-center justify-between">
                <span>Vaibhav Chaudhari:</span>
                <a href="tel:+918007298092" className="text-aws-orange hover:underline font-bold flex items-center gap-1"><Phone size={12} /> +91 80072 98092</a>
              </p>
              <p className="flex items-center justify-between">
                <span>Saurabh Rajput:</span>
                <a href="tel:+919890991510" className="text-aws-orange hover:underline font-bold flex items-center gap-1"><Phone size={12} /> +91 98909 91510</a>
              </p>
              <p className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span>Email Support:</span>
                <a href="mailto:info@aws-scd-dhule.tech" className="text-aws-orange hover:underline font-bold flex items-center gap-1"><Mail size={12} /> info@aws-scd-dhule.tech</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 size={32} className="animate-spin text-aws-orange" />
          <p className="font-mono text-xs text-white/50 uppercase tracking-widest">
            Connecting to payment gateway...
          </p>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col items-center gap-4 py-8">
          <CreditCard size={32} className="text-white/30" />
          <p className="font-mono text-xs text-white/50">
            Payment window should open automatically.
          </p>
          <button type="button"
            onClick={onInitiatePayment}
            className="px-6 py-2.5 bg-aws-orange text-black text-xs font-mono uppercase tracking-widest font-bold hover:bg-white transition-colors"
          >
            Retry Payment
          </button>
        </div>
      )}

      <button type="button"
        onClick={onBack}
        className="mt-4 text-white/30 hover:text-white/60 text-xs font-mono uppercase tracking-widest transition-colors"
      >
        ← Back
      </button>
    </motion.div>
  );
}
