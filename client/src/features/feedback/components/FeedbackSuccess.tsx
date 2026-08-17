import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle, ArrowRight, RotateCcw, Home, Sparkles, Heart } from 'lucide-react';
import { FeedbackFormData } from '../types';

interface FeedbackSuccessProps {
  formData: FeedbackFormData;
  onReset: () => void;
}

export const FeedbackSuccess: React.FC<FeedbackSuccessProps> = ({
  formData,
  onReset
}) => {
  useEffect(() => {
    // Launch celebratory confetti burst
    const end = Date.now() + 1.5 * 1000;
    const colors = ['#FF9900', '#E10600', '#FFFFFF', '#10B981'];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-12 px-4 animate-fadeIn">
      {/* Animated Success Icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.25)]">
          <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-400 animate-bounce" />
        </div>
        <div className="absolute -top-1 -right-1 p-2 rounded-full bg-aws-orange text-black font-bold">
          <Sparkles size={16} />
        </div>
      </div>

      {/* Title */}
      <div className="font-mono text-xs text-aws-orange uppercase tracking-widest mb-2 font-bold">
        TELEMETRY RECEIVED // SCD 2026
      </div>
      <h2 className="font-sans font-black italic text-3xl sm:text-5xl uppercase tracking-tighter text-white mb-4">
        Thank You For <span className="text-aws-orange">Your Feedback!</span>
      </h2>
      <p className="text-white/70 text-sm sm:text-base font-sans max-w-lg mb-8 leading-relaxed">
        {formData.isAnonymous
          ? 'Your anonymous feedback and canteen quality ratings have been successfully registered.'
          : `Thank you, ${formData.attendeeName || 'Builder'}! Your feedback and canteen quality ratings have been securely registered.`}
        {' '}Our team and the canteen management appreciate your honest perspective.
      </p>

      {/* Feedback Summary Receipt Card */}
      <div className="w-full bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 mb-8 text-left relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-aws-orange via-[#E10600] to-emerald-400" />

        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            SCD DHULE // FEEDBACK DISPATCH
          </span>
          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
            LOGGED & CONFIRMED
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 font-sans text-xs">
          <div className="min-w-0">
            <span className="text-white/40 text-[10px] uppercase font-mono block">Overall Rating</span>
            <span className="text-white font-bold text-sm">
              {'★'.repeat(formData.overallRating || 5)} ({formData.overallRating || 5}/5)
            </span>
          </div>
          <div className="min-w-0">
            <span className="text-white/40 text-[10px] uppercase font-mono block">NPS Score</span>
            <span className="text-aws-orange font-bold text-sm">{formData.npsScore}/10</span>
          </div>
          <div className="min-w-0">
            <span className="text-white/40 text-[10px] uppercase font-mono block">Food Review</span>
            <span className="text-amber-400 font-bold text-sm">Canteen Dispatched</span>
          </div>
          <div className="min-w-0">
            <span className="text-white/40 text-[10px] uppercase font-mono block">Community</span>
            <span className="text-white font-bold text-sm">AWS SBG Dhule</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-4 w-full">
        <Link
          to="/"
          className="px-6 py-3 bg-white text-black font-sans font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-aws-orange hover:text-black transition-all duration-200 flex items-center gap-2"
        >
          <Home size={14} />
          <span>Back to Home</span>
        </Link>

        <Link
          to="/badge"
          className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-mono text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-2"
        >
          <span>Get SCD Badge</span>
          <ArrowRight size={14} />
        </Link>

        <button
          type="button"
          onClick={onReset}
          className="px-4 py-3 text-white/40 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>Submit Another Response</span>
        </button>
      </div>

      {/* Community Footer Message */}
      <div className="mt-12 text-white/30 text-xs font-mono flex items-center gap-1.5">
        <span>Made with</span>
        <Heart size={12} className="text-[#E10600] fill-[#E10600]" />
        <span>by AWS Student Builder Group SVKM IoT Dhule</span>
      </div>
    </div>
  );
};
