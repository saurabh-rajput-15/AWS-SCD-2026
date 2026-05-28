import { motion } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const currentSponsors = [
  { name: "Amazon Web Services", tier: "Cloud Partner", logo: "/AWS_logo.png" },
  { name: "ARIF", tier: "Community Partner", logo: "/ARIF.png" },
  { name: "AWS Builder", tier: "Technology Partner", logo: "/AWS_Builder.png" },
];

export const ConstructorsSection = () => {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-[#050505]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <SectionHeader
          title="Meet Our Sponsors"
          subtitle="Our valued partners who make AWS Student Community Day Dhule 2026 possible. Join them in supporting the next generation of cloud innovators."
          sysId="05.SPNS"
        />

        <div className="pb-8">
          <Link
            to="/sponsors"
            className="relative px-8 py-3 font-sans font-bold uppercase text-xs tracking-widest skew-x-[-12deg] transition-colors bg-f1-red text-white hover:bg-white hover:text-black inline-flex"
          >
            <span className="relative z-10 flex items-center space-x-2 skew-x-[12deg]">
              <span>Become a Sponsor</span>
              <ArrowUpRight size={16} />
            </span>
          </Link>
        </div>
      </div>

      {/* Sponsor Logo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentSponsors.map((sponsor, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="group relative bg-[#111] border border-white/5 hover:border-white/20 p-6 sm:p-8 flex flex-col items-center justify-center min-h-[180px] sm:min-h-[220px] transition-all duration-500 overflow-hidden"
          >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-aws-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Tier Badge */}
            <div className="absolute top-4 right-4 font-mono text-[10px] tracking-[0.2em] uppercase text-aws-orange opacity-60 group-hover:opacity-100 transition-opacity">
              {sponsor.tier}
            </div>

            {/* Logo */}
            <div className="relative z-10 flex items-center justify-center h-20 mb-6">
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="max-h-full max-w-[180px] object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              />
            </div>

            {/* Name */}
            <h3 className="relative z-10 font-sans font-black italic text-lg uppercase tracking-tight text-white/80 group-hover:text-white transition-colors text-center">
              {sponsor.name}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-8 sm:mt-12 border border-white/5 bg-gradient-to-r from-[#111] to-[#0a0a0a] p-5 sm:p-8 md:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6"
      >
        <div>
          <h3 className="font-sans font-black italic text-xl sm:text-2xl uppercase tracking-tighter text-white mb-1 sm:mb-2">
            Want to sponsor this event?
          </h3>
          <p className="font-sans text-sm opacity-60 max-w-lg">
            Explore our sponsorship tiers and apply to become a partner. Help us power the next generation of cloud innovators.
          </p>
        </div>
        <Link
          to="/sponsors"
          className="relative px-8 py-3 font-sans font-bold uppercase text-xs tracking-widest skew-x-[-12deg] transition-colors border border-white/20 text-white hover:bg-white/10 inline-flex shrink-0"
        >
          <span className="relative z-10 flex items-center space-x-2 skew-x-[12deg]">
            <span>View Tiers & Apply</span>
            <ArrowUpRight size={16} />
          </span>
        </Link>
      </motion.div>
    </section>
  );
};
