import { Phone, Mail } from 'lucide-react';

export const NoticeMarquee = () => {
  const marqueeText = (
    <span className="inline-flex items-center gap-6 font-mono text-[11px] sm:text-xs uppercase tracking-wider font-bold text-white">
      <span className="text-aws-orange flex items-center gap-1.5 shrink-0">
        <span className="inline-block w-2 h-2 rounded-full bg-aws-orange animate-ping" />
        ⚡ NOTICE:
      </span>
      <span>
        Digital passes are currently sold out online for a moment. Contact organizers for possible physical passes as passes are limited!
      </span>
      <span className="text-aws-orange/80 flex items-center gap-3 shrink-0">
        <span className="flex items-center gap-1"><Phone size={12} /> Soham: +91 98343 82337</span>
        <span>|</span>
        <span className="flex items-center gap-1"><Phone size={12} /> Vaibhav: +91 80072 98092</span>
        <span>|</span>
        <span className="flex items-center gap-1"><Phone size={12} /> Saurabh: +91 98909 91510</span>
        <span>|</span>
        <span className="flex items-center gap-1"><Mail size={12} /> info@aws-scd-dhule.tech</span>
      </span>
    </span>
  );

  return (
    <div className="w-full bg-[#1a0a00] text-white border-b border-aws-orange/40 overflow-hidden py-2 shadow-[0_2px_12px_rgba(255,153,0,0.2)] relative z-[10000]">
      <style>{`
        @keyframes noticeMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-notice-marquee {
          display: flex;
          width: max-content;
          animation: noticeMarquee 32s linear infinite;
        }
        .animate-notice-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="animate-notice-marquee flex items-center gap-12 whitespace-nowrap">
        {marqueeText}
        {marqueeText}
      </div>
    </div>
  );
};
