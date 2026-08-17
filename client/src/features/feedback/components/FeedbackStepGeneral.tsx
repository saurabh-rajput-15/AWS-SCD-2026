import React from 'react';
import { StarRating } from './StarRating';
import { TagSelector } from './TagSelector';
import { FeedbackFormData } from '../types';
import { User, Mail, Sparkles, Building2, Users2, ShieldAlert } from 'lucide-react';

interface FeedbackStepGeneralProps {
  formData: FeedbackFormData;
  updateFormData: (data: Partial<FeedbackFormData>) => void;
}

const GENERAL_TAGS = [
  '⚡ High Energy & Vibe',
  '🎯 Flawless Schedule',
  '🏢 Great Venue & Stage',
  '🎧 Clear Sound & Screens',
  '🤝 Super Helpful Volunteers',
  '🚀 Inspiring Keynotes',
  '🎁 Awesome Swags & Kits',
  '📶 Better Wi-Fi Needed'
];

export const FeedbackStepGeneral: React.FC<FeedbackStepGeneralProps> = ({
  formData,
  updateFormData
}) => {
  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-aws-orange/10 via-transparent to-white/[0.02] border border-aws-orange/20 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-aws-orange/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start gap-3 relative z-10">
          <Sparkles className="w-5 h-5 text-aws-orange shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <h3 className="font-sans font-black italic text-base uppercase text-white tracking-wide">
              Welcome to the AWS SCD Dhule 2026 Feedback
            </h3>
            <p className="font-sans text-xs text-white/70 leading-relaxed">
              Thank you for being a part of North Maharashtra&apos;s biggest cloud gathering! Your honest reviews will shape future editions and help us recognize our top speakers, organizers, and campus partners.
            </p>
          </div>
        </div>
      </div>

      {/* Attendee Profile Section */}
      <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <User size={16} className="text-aws-orange" />
            <h4 className="font-sans font-black italic text-sm uppercase tracking-wider text-white">
              Attendee Profile
            </h4>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) => updateFormData({ isAnonymous: e.target.checked })}
              className="w-4 h-4 rounded bg-[#111] border-white/20 text-aws-orange focus:ring-aws-orange cursor-pointer accent-[#FF9900]"
            />
            <span className="font-mono text-xs text-white/70 hover:text-white transition-colors">
              Submit Anonymously
            </span>
          </label>
        </div>

        {!formData.isAnonymous ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 font-sans">
              <label className="text-xs font-mono text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                <User size={12} className="text-aws-orange" />
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Saurabh Rajput"
                value={formData.attendeeName}
                onChange={(e) => updateFormData({ attendeeName: e.target.value })}
                className="bg-[#050505] border border-white/10 rounded-lg p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-aws-orange/60 transition-colors text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5 font-sans">
              <label className="text-xs font-mono text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                <Mail size={12} className="text-aws-orange" />
                Registered Email (Optional)
              </label>
              <input
                type="email"
                placeholder="e.g. attendee@gmail.com"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                className="bg-[#050505] border border-white/10 rounded-lg p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-aws-orange/60 transition-colors text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg text-white/50 text-xs font-sans">
            <ShieldAlert size={16} className="text-aws-orange shrink-0" />
            <span>You are submitting anonymously. Your name and email will not be saved with this feedback.</span>
          </div>
        )}
      </div>

      {/* Overall Event Ratings */}
      <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-6 flex flex-col gap-6">
        <h4 className="font-sans font-black italic text-sm uppercase tracking-wider text-white border-b border-white/5 pb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-aws-orange" />
          Overall Experience & Operations
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Overall Rating */}
          <div className="bg-[#070707] border border-white/5 rounded-lg p-4 flex flex-col justify-between gap-3 min-w-0">
            <div>
              <span className="font-sans font-bold text-sm text-white block mb-1">
                Overall Event Experience
              </span>
              <p className="text-[11px] text-white/50 font-sans">
                How would you rate the overall summit?
              </p>
            </div>
            <StarRating
              value={formData.overallRating}
              onChange={(rating) => updateFormData({ overallRating: rating })}
              size="md"
              required
            />
          </div>

          {/* Venue & AV Rating */}
          <div className="bg-[#070707] border border-white/5 rounded-lg p-4 flex flex-col justify-between gap-3 min-w-0">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Building2 size={14} className="text-aws-orange" />
                <span className="font-sans font-bold text-sm text-white">
                  Auditorium & AV Setup
                </span>
              </div>
              <p className="text-[11px] text-white/50 font-sans">
                Stage, sound, screen visibility, seating
              </p>
            </div>
            <StarRating
              value={formData.venueRating}
              onChange={(rating) => updateFormData({ venueRating: rating })}
              size="md"
              required
            />
          </div>

          {/* Volunteer & Coordination Rating */}
          <div className="bg-[#070707] border border-white/5 rounded-lg p-4 flex flex-col justify-between gap-3 min-w-0">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Users2 size={14} className="text-aws-orange" />
                <span className="font-sans font-bold text-sm text-white">
                  Organization & Support
                </span>
              </div>
              <p className="text-[11px] text-white/50 font-sans">
                Check-in speed, volunteer guidance & queueing
              </p>
            </div>
            <StarRating
              value={formData.organizationRating}
              onChange={(rating) => updateFormData({ organizationRating: rating })}
              size="md"
              required
            />
          </div>
        </div>

        {/* Quick Highlights Tag Selector */}
        <div className="pt-2">
          <TagSelector
            label="Quick Impressions (Select all that resonate)"
            options={GENERAL_TAGS}
            selected={formData.generalImpressions || []}
            onChange={(selected) => updateFormData({ generalImpressions: selected })}
            maxSelection={4}
          />
        </div>
      </div>
    </div>
  );
};
