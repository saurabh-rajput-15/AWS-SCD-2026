import { motion } from 'motion/react';
import { MessageCircle, ExternalLink } from 'lucide-react';

export const ThankYouSection = () => {
  return (
    <section className="relative py-16 sm:py-24 px-4 bg-[#050505] overflow-hidden border-t border-white/5 flex flex-col items-center justify-center text-center">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] md:w-[650px] h-[250px] sm:h-[350px] bg-aws-orange/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center justify-center max-w-3xl mx-auto"
      >
        {/* Heading */}
        <h2 className="font-sans font-black italic text-4xl sm:text-6xl md:text-7xl text-white uppercase tracking-tighter mb-4 sm:mb-6 drop-shadow-[0_0_30px_rgba(255,153,0,0.25)]">
          THANK <span className="text-aws-orange">YOU</span>
        </h2>

        {/* AWS Thank You Smile Graphic */}
        <div className="w-full max-w-[280px] sm:max-w-md md:max-w-lg lg:max-w-xl mb-6">
          <img
            src="/aws-smile.png"
            alt="Thank You - AWS Student Community Day Dhule 2026"
            className="w-full h-auto object-contain mx-auto drop-shadow-[0_0_35px_rgba(255,153,0,0.25)] select-none pointer-events-none"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Message */}
        <p className="font-sans font-medium text-xs sm:text-sm md:text-base text-white/60 max-w-xl mx-auto leading-relaxed uppercase tracking-wider">
          To all our attendees, speakers, sponsors, volunteers, and the vibrant developer community — thank you for making <span className="text-white font-bold">AWS SCD Dhule 2026</span> unforgettable!
        </p>

        {/* WhatsApp Community Button */}
        <div className="mt-8">
          <a
            href="https://chat.whatsapp.com/KsMTV60oG2kBuaoofwQdxJ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-sans font-black italic uppercase text-xs sm:text-sm tracking-wider rounded-lg shadow-[0_0_25px_rgba(37,211,102,0.35)] transition-all hover:scale-105 group cursor-pointer"
          >
            <MessageCircle size={18} className="text-black" />
            <span>Join Our WhatsApp Community</span>
            <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Community Tag */}
        <div className="mt-8 flex items-center gap-2 font-mono text-[10px] sm:text-xs text-aws-orange/80 uppercase tracking-[0.25em] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-aws-orange animate-pulse" />
          <span>Keep Building • See You At The Next Starting Grid</span>
        </div>
      </motion.div>
    </section>
  );
};
