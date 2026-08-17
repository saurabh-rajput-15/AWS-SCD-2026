import React from 'react';
import { StarRating } from './StarRating';
import { TagSelector } from './TagSelector';
import { SessionFeedbackItem } from '../types';
import { Mic, CheckCircle2, XCircle, Sparkles, MessageSquare } from 'lucide-react';

interface FeedbackStepSessionsProps {
  title: string;
  subtitle: string;
  sessions: SessionFeedbackItem[];
  onChange: (updatedSessions: SessionFeedbackItem[]) => void;
}

export const FeedbackStepSessions: React.FC<FeedbackStepSessionsProps> = ({
  title,
  subtitle,
  sessions,
  onChange
}) => {
  const handleToggleAttended = (index: number) => {
    const updated = [...sessions];
    updated[index] = {
      ...updated[index],
      attended: !updated[index].attended,
      // If toggling to unattended, reset rating
      rating: !updated[index].attended ? (updated[index].rating || 4) : 0
    };
    onChange(updated);
  };

  const handleRatingChange = (index: number, rating: number) => {
    const updated = [...sessions];
    updated[index] = {
      ...updated[index],
      rating,
      attended: rating > 0 ? true : updated[index].attended
    };
    onChange(updated);
  };

  const handleTagsChange = (index: number, tags: string[]) => {
    const updated = [...sessions];
    updated[index] = {
      ...updated[index],
      tags
    };
    onChange(updated);
  };

  const handleCommentChange = (index: number, comment: string) => {
    const updated = [...sessions];
    updated[index] = {
      ...updated[index],
      comment
    };
    onChange(updated);
  };

  const markAllAttended = () => {
    const updated = sessions.map(s => ({
      ...s,
      attended: true,
      rating: s.rating
    }));
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
        <div>
          <h3 className="font-sans font-black italic text-lg uppercase text-white tracking-wide flex items-center gap-2">
            <Mic size={18} className="text-aws-orange" />
            {title}
          </h3>
          <p className="font-sans text-xs text-white/60 mt-1">
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={markAllAttended}
          className="self-start sm:self-auto px-3 py-1.5 bg-white/[0.04] hover:bg-aws-orange/10 border border-white/10 hover:border-aws-orange/30 text-white/80 hover:text-aws-orange text-xs font-mono rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5"
        >
          <CheckCircle2 size={13} className="text-aws-orange" />
          <span>Mark All Attended</span>
        </button>
      </div>

      {/* Session Cards List */}
      <div className="flex flex-col gap-5">
        {sessions.map((session, index) => {
          return (
            <div
              key={session.sessionId}
              className={`border rounded-xl transition-all duration-300 p-4 sm:p-6 ${
                session.attended
                  ? 'bg-[#0d0d0d] border-white/10 hover:border-aws-orange/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                  : 'bg-[#080808]/60 border-white/5 opacity-60'
              }`}
            >
              {/* Top Bar: Time, Badge, Attendance Switch */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3.5 mb-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {session.sessionType && (
                    <span className="px-2.5 py-1 bg-aws-orange/10 border border-aws-orange/30 text-aws-orange text-[10px] font-mono uppercase tracking-wider rounded font-bold">
                      {session.sessionType}
                    </span>
                  )}
                </div>

                {/* Attendance Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleAttended(index)}
                  className={`px-2.5 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                    session.attended
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'
                  }`}
                >
                  {session.attended ? (
                    <>
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <span>Attended</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={12} className="text-white/40" />
                      <span>Skipped / Missed</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title and Speaker */}
              <div className="flex flex-col mb-4">
                <h4 className="font-sans font-black italic text-base sm:text-lg uppercase text-white tracking-wide">
                  {session.sessionTitle}
                </h4>
                {session.speakerName && (
                  <div className="font-mono text-xs text-white/70 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-aws-orange shrink-0" />
                    <span>Speaker: <strong className="text-white">{session.speakerName}</strong></span>
                  </div>
                )}
              </div>

              {/* Rating & Tag Options (Only when attended) */}
              {session.attended ? (
                <div className="flex flex-col gap-4 bg-[#070707] border border-white/5 rounded-lg p-4 sm:p-5 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs text-white/70 uppercase tracking-wider block">
                        Speaker & Content Quality
                      </span>
                      <span className="text-[11px] text-white/40 font-sans">
                        Rate the clarity, depth, and overall delivery
                      </span>
                    </div>
                    <StarRating
                      value={session.rating}
                      onChange={(rating) => handleRatingChange(index, rating)}
                      size="md"
                    />
                  </div>

                  {/* Quick Tags */}
                  {session.tagsPool && session.tagsPool.length > 0 && (
                    <div className="pt-2 border-t border-white/5">
                      <TagSelector
                        label="Quick Reaction"
                        options={session.tagsPool}
                        selected={session.tags}
                        onChange={(tags) => handleTagsChange(index, tags)}
                        maxSelection={3}
                      />
                    </div>
                  )}

                  {/* Optional One-liner note */}
                  <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-white/40 uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare size={11} className="text-aws-orange" />
                      Optional note or key takeaway
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Loved the live architecture diagrams and demo!"
                      value={session.comment || ''}
                      onChange={(e) => handleCommentChange(index, e.target.value)}
                      className="bg-[#0c0c0c] border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-aws-orange/50"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded-lg text-white/40 text-xs font-mono">
                  <span>Marked as not attended</span>
                  <button
                    type="button"
                    onClick={() => handleToggleAttended(index)}
                    className="text-aws-orange hover:underline cursor-pointer"
                  >
                    Click here to rate
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
