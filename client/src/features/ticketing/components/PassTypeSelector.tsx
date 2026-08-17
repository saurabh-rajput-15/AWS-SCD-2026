import { CheckCircle2, Phone, Mail } from 'lucide-react';
import type { PassType } from '../hooks/usePassTypes';
import { Link } from 'react-router-dom';

interface Props {
  passes: PassType[];
  loading: boolean;
  onSelect: (pass: PassType, quantity: number) => void;
}

export function PassTypeSelector({ loading }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-white/10 border-t-aws-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="p-6 bg-gradient-to-br from-aws-orange/10 via-[#0d0d0d] to-black border border-white/10 rounded-xl text-left shadow-xl">
        <div className="flex items-start gap-4">
          <CheckCircle2 size={28} className="text-emerald-400 shrink-0 mt-1" />
          <div className="space-y-2">
            <h3 className="font-sans font-black italic text-xl sm:text-2xl uppercase tracking-tight text-white">
              Event Registration Concluded
            </h3>
            <p className="font-mono text-xs text-white/70 leading-relaxed">
              Registrations for AWS Student Community Day Dhule 2026 are now officially closed. Check out our exclusive Bags &amp; Welcome Kit Merch Combo or explore event moments.
            </p>
          </div>
        </div>

        <div className="mt-5 p-4 bg-black/50 border border-white/10 rounded-lg font-mono text-xs">
          <p className="text-aws-orange font-bold uppercase tracking-wider text-[11px] mb-3">Event Organizers Contact:</p>
          <div className="space-y-2 text-white/80">
            <p className="flex items-center justify-between">
              <span>Soham Chaudhari</span>
              <a href="tel:+919834382337" className="text-aws-orange hover:underline font-bold flex items-center gap-1"><Phone size={12} /> +91 98343 82337</a>
            </p>
            <p className="flex items-center justify-between">
              <span>Vaibhav Chaudhari</span>
              <a href="tel:+918007298092" className="text-aws-orange hover:underline font-bold flex items-center gap-1"><Phone size={12} /> +91 80072 98092</a>
            </p>
            <p className="flex items-center justify-between">
              <span>Saurabh Rajput</span>
              <a href="tel:+919890991510" className="text-aws-orange hover:underline font-bold flex items-center gap-1"><Phone size={12} /> +91 98909 91510</a>
            </p>
            <p className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span>Email Support</span>
              <a href="mailto:info@aws-scd-dhule.tech" className="text-aws-orange hover:underline font-bold flex items-center gap-1"><Mail size={12} /> info@aws-scd-dhule.tech</a>
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 justify-center">
          <a
            href="/#store"
            className="px-6 py-2.5 bg-aws-orange text-black font-sans font-black italic uppercase text-xs tracking-widest skew-x-[-6deg] hover:bg-white transition-all shadow-[0_0_15px_rgba(255,153,0,0.3)]"
          >
            <span className="skew-x-[6deg] block">Get Merch Combo</span>
          </a>
          <Link
            to="/"
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 transition-colors font-mono text-xs uppercase tracking-widest border border-white/20 text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

