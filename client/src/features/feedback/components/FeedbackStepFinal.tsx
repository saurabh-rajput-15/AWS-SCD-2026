import React from 'react';
import { FeedbackFormData } from '../types';
import { Sparkles, Trophy, Heart, MessageSquare, Send, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';

interface FeedbackStepFinalProps {
  formData: FeedbackFormData;
  updateFormData: (data: Partial<FeedbackFormData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  errorMessage: string;
}

export const FeedbackStepFinal: React.FC<FeedbackStepFinalProps> = ({
  formData,
  updateFormData,
  onSubmit,
  onBack,
  isSubmitting,
  errorMessage
}) => {
  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* Step Header */}
      <div className="bg-gradient-to-r from-aws-orange/10 via-transparent to-red-500/10 border border-white/10 rounded-xl p-6 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-aws-orange shrink-0" />
          <div>
            <h3 className="font-sans font-black italic text-lg uppercase text-white tracking-wide">
              Final Lap: Takeaways & Future Ideas
            </h3>
            <p className="font-sans text-xs text-white/60 mt-0.5">
              You are almost done! Tell us how we did overall and what you want to see in AWS SCD 2027.
            </p>
          </div>
        </div>
      </div>

      {/* NPS Recommendation Score (1 to 10) */}
      <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <label className="font-sans font-black italic text-sm uppercase text-white tracking-wide flex items-center gap-2">
            <Heart size={16} className="text-[#E10600]" />
            Likelihood to Recommend AWS SCD Dhule (NPS)
          </label>
          <span className="font-mono text-xs text-aws-orange font-bold">
            Score: {formData.npsScore}/10
          </span>
        </div>
        <p className="text-xs text-white/50 font-sans">
          On a scale of 1 (Never) to 10 (Definitely), how likely are you to recommend AWS SCD Dhule to your friends or college peers?
        </p>

        {/* 1-10 Button Bar */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 mt-2">
          {Array.from({ length: 10 }, (_, i) => {
            const score = i + 1;
            const isSelected = formData.npsScore === score;
            return (
              <button
                key={score}
                type="button"
                onClick={() => updateFormData({ npsScore: score })}
                className={`py-3 rounded-lg font-mono font-bold text-sm transition-all duration-150 cursor-pointer flex flex-col items-center justify-center border ${
                  isSelected
                    ? 'bg-aws-orange text-black border-aws-orange shadow-[0_0_15px_rgba(255,153,0,0.5)] scale-105'
                    : 'bg-[#121212] border-white/10 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/[0.05]'
                }`}
              >
                <span>{score}</span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between font-mono text-[10px] text-white/40 px-1">
          <span>1 - Unlikely</span>
          <span className="hidden sm:inline">5 - Neutral</span>
          <span>10 - Enthusiastic!</span>
        </div>
      </div>

      {/* Favorite Highlight */}
      <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-6 flex flex-col gap-4">
        <label className="font-sans font-black italic text-sm uppercase text-white tracking-wide flex items-center gap-2">
          <Sparkles size={16} className="text-aws-orange" />
          What was your favorite highlight or best moment of the event?
        </label>
        <textarea
          rows={2}
          placeholder="e.g. The GenAI keynote by Abhijeet, meeting the AWS Heroes, and the swags & networking during lunch!"
          value={formData.favoriteHighlight}
          onChange={(e) => updateFormData({ favoriteHighlight: e.target.value })}
          className="bg-[#050505] border border-white/10 rounded-lg p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-aws-orange/60 transition-colors text-xs sm:text-sm font-sans resize-none"
        />
      </div>

      {/* Suggestions for next year */}
      <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-6 flex flex-col gap-4">
        <label className="font-sans font-black italic text-sm uppercase text-white tracking-wide flex items-center gap-2">
          <MessageSquare size={16} className="text-aws-orange" />
          What topics, tracks, or improvements would you love to see in AWS SCD 2027?
        </label>
        <textarea
          rows={3}
          placeholder="e.g. More hands-on live coding workshops, a dedicated hackathon track, or deeper sessions on AWS CDK and Cloud Security."
          value={formData.suggestionsNextYear}
          onChange={(e) => updateFormData({ suggestionsNextYear: e.target.value })}
          className="bg-[#050505] border border-white/10 rounded-lg p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-aws-orange/60 transition-colors text-xs sm:text-sm font-sans resize-none"
        />
      </div>

      {/* Error display if any */}
      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-xs font-sans">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/80 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft size={14} />
          <span>Previous Step</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-aws-orange to-amber-500 hover:from-amber-500 hover:to-aws-orange text-black font-sans font-black italic uppercase text-sm tracking-wider rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(255,153,0,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin text-black" />
              <span>Submitting Feedback...</span>
            </>
          ) : (
            <>
              <Send size={16} className="text-black stroke-[2.5]" />
              <span>Submit Event Feedback</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
