import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import { Mail, ArrowUpRight, Trophy, Users, GraduationCap, Laptop, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BecomeSponsorSection = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("info@aws-scd-dhule.tech");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <section id="sponsors" className="relative py-20 sm:py-28 px-4 sm:px-12 lg:px-24 bg-[#050505] border-t border-white/5 overflow-hidden" aria-label="Event Sponsors">
      {/* Background high-tech accents */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute -top-1/4 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-1/4 left-0 w-[500px] h-[500px] bg-aws-orange/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-12 sm:mb-16">
          <SectionHeader
            title="Event Sponsors"
            subtitle="Powering North Maharashtra's flagship cloud event. Proudly supported by industry pioneers and regional technology champions."
            sysId="05.SPN"
          />
        </div>

        {/* Featured Sponsor Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-[#0c0f14] via-[#090a0d] to-[#050505] border border-blue-500/30 rounded-2xl p-6 sm:p-10 mb-12 overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.08)] group"
        >
          {/* Tech Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-cyan-400 to-aws-orange" />
          <div className="absolute top-3 right-3 w-2 h-2 border-t border-r border-blue-400/40" />
          <div className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-blue-400/40" />

          {/* Ambient Glow */}
          <div className="absolute -right-24 -bottom-24 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-600/15 transition-all duration-700" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Sponsor Logo Box */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl bg-black/80 border border-blue-500/20 p-6 flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-blue-400/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] transition-all duration-500">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                <img
                  src="/sponcer/ASUS-STORE-BY-GOPAL-COMP-DHULE.PNG"
                  alt="ASUS Store by Gopal Computers Dhule"
                  className="max-w-[95%] max-h-[95%] object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.35)] group-hover:scale-105 transition-transform duration-500 relative z-10"
                />
              </div>
            </div>

            {/* Sponsor Info */}
            <div className="lg:col-span-8 flex flex-col text-left">
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/40 text-blue-400 font-mono text-[10px] font-bold uppercase tracking-widest rounded-full">
                  <Sparkles size={12} className="text-blue-400" /> Official Event Sponsor
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-white/70 font-mono text-[10px] uppercase tracking-widest rounded-full">
                  <MapPin size={12} className="text-aws-orange" /> Dhule, Maharashtra
                </span>
              </div>

              <h3 className="font-sans font-black italic uppercase text-2xl sm:text-4xl text-white tracking-tight leading-none mb-1.5">
                ASUS Exclusive Store
              </h3>
              <p className="font-mono text-xs sm:text-sm text-aws-orange uppercase tracking-wider font-bold mb-4">
                By Gopal Computers, Dhule
              </p>

              <p className="font-sans text-xs sm:text-sm text-white/60 leading-relaxed max-w-2xl mb-6">
                Official Computing & Hardware Partner for AWS Student Community Day Dhule 2026. Empowering our builder community, student innovators, and cloud developers with cutting-edge computing performance, gaming laptops, and creator systems.
              </p>

              {/* Sponsor Key Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center gap-2.5">
                  <Laptop size={16} className="text-blue-400 shrink-0" />
                  <span className="text-white/80 text-[11px] uppercase tracking-wider">Official Tech Partner</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center gap-2.5">
                  <Trophy size={16} className="text-aws-orange shrink-0" />
                  <span className="text-white/80 text-[11px] uppercase tracking-wider">Computing Showcase</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center gap-2.5">
                  <Users size={16} className="text-[#00ff00] shrink-0" />
                  <span className="text-white/80 text-[11px] uppercase tracking-wider">Regional Enabler</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Second Row: Partnership Opportunity & Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Why Sponsor Benefits */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[#0a0a0a] border border-white/5">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-aws-orange block mb-2 font-bold">
                GROW WITH US / PARTNERSHIP OPPORTUNITIES
              </span>
              <h4 className="font-sans text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-6 italic">
                Why Partner With AWS SCD Dhule?
              </h4>

              <div className="flex flex-col gap-5">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-aws-orange/10 border border-aws-orange/20 flex items-center justify-center shrink-0 mt-1">
                    <GraduationCap className="text-aws-orange" size={20} />
                  </div>
                  <div>
                    <h5 className="font-sans font-bold text-white text-sm uppercase tracking-wider mb-1">Empower Regional Talent</h5>
                    <p className="font-sans text-xs text-white/50 leading-relaxed">
                      Enable hands-on workshops, cloud engineering learning paths, and active developer projects for students in North Maharashtra.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-aws-orange/10 border border-aws-orange/20 flex items-center justify-center shrink-0 mt-1">
                    <Trophy className="text-aws-orange" size={20} />
                  </div>
                  <div>
                    <h5 className="font-sans font-bold text-white text-sm uppercase tracking-wider mb-1">Elevate Brand Visibility</h5>
                    <p className="font-sans text-xs text-white/50 leading-relaxed">
                      Gain high-impact exposure across digital platforms, stage backdrops, student badges, marketing flyers, and expo stall areas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-aws-orange/10 border border-aws-orange/20 flex items-center justify-center shrink-0 mt-1">
                    <Users className="text-aws-orange" size={20} />
                  </div>
                  <div>
                    <h5 className="font-sans font-bold text-white text-sm uppercase tracking-wider mb-1">Direct Recruitment Pipeline</h5>
                    <p className="font-sans text-xs text-white/50 leading-relaxed">
                      Interact directly with top-tier student builders, developers, and cloud enthusiasts for hiring, internships, and mentoring.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-tech HUD Console Card */}
          <div className="lg:col-span-5 flex">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative w-full p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0c0c0c]/90 backdrop-blur-md overflow-hidden shadow-2xl flex flex-col justify-between"
            >
              {/* Racing orange accent bar */}
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-aws-orange to-red-600" />
              
              {/* Corner tech lines */}
              <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-white/20" />
              <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-white/20" />

              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-aws-orange block mb-2 font-bold">
                  PARTNERSHIP CIRCUIT / SCD.2026
                </span>
                <h3 className="font-sans text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-6 italic">
                  Sponsorship Console
                </h3>

                {/* Grid of Outreach Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6 bg-white/[0.02] border border-white/5 p-4 rounded-xl font-mono text-left">
                  <div>
                    <span className="text-[9px] uppercase text-white/40 block tracking-wider mb-1">Target Outreach</span>
                    <span className="text-sm font-black text-white">4,000+ Students</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-white/40 block tracking-wider mb-1">Expected Attendance</span>
                    <span className="text-sm font-black text-white">400+ Builders</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-white/40 block tracking-wider mb-1">Key Topics</span>
                    <span className="text-sm font-black text-white">Cloud, AI, DevOps</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-white/40 block tracking-wider mb-1">Venue</span>
                    <span className="text-sm font-black text-white">SVKM's IOT, Dhule</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-4">
                <Link
                  to="/sponsors"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-aws-orange text-black font-sans font-black italic uppercase text-xs tracking-widest skew-x-[-10deg] transition-all hover:bg-white hover:text-black shadow-[0_0_20px_rgba(255,153,0,0.2)] cursor-pointer"
                >
                  <span className="skew-x-[10deg] flex items-center gap-1.5">
                    View Sponsorship Tiers & Apply <ArrowUpRight size={14} />
                  </span>
                </Link>

                <div className="flex items-center justify-center gap-3">
                  <div className="h-px bg-white/5 flex-1" />
                  <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">or email us</span>
                  <div className="h-px bg-white/5 flex-1" />
                </div>

                <button type="button"
                  onClick={handleCopyEmail}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-white font-mono text-[10px] uppercase tracking-widest hover:border-white/30 hover:bg-white/10 transition-colors"
                >
                  <Mail size={12} className="text-aws-orange" />
                  {copiedEmail ? "Copied to clipboard!" : "info@aws-scd-dhule.tech"}
                </button>
              </div>

            </motion.div>
          </div>

        </div>
      </div>

    </section>
  );
};
