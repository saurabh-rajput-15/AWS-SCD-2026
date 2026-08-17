import { useState } from 'react';
import { motion } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import {
  ShoppingBag,
  PackageCheck,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Truck,
  Flame,
  Award,
  Layers,
  FileText
} from 'lucide-react';

interface ComboItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: typeof ShoppingBag;
  tag: string;
}

const comboItems: ComboItem[] = [
  {
    id: 'bag',
    title: 'SCD 2026 Paddock Bag',
    category: 'Heavy-Duty Gear',
    description: 'Custom racing-livery cloud builder bag crafted with durable, water-resistant fabric, laptop compartment & reinforced seams.',
    icon: ShoppingBag,
    tag: 'LIMITED RUN'
  },
  {
    id: 'badge',
    title: 'Commemorative Badge & Lanyard',
    category: 'Paddock Pass Keepsake',
    description: 'Official SCD Dhule 2026 metal collectible badge with high-density woven racing lanyard and custom clip.',
    icon: Award,
    tag: 'COLLECTIBLE'
  },
  {
    id: 'stickers',
    title: 'AWS Holographic Decal Pack',
    category: 'Swag Pack',
    description: 'Set of premium vinyl & holographic stickers including AWS Cloud architecture, SCD Dhule speed logos, and tech decals.',
    icon: Sparkles,
    tag: 'VINYL GLOSS'
  },
  {
    id: 'notebook',
    title: 'Cloud Architect Diary & Pen',
    category: 'Engineering Station',
    description: 'Hardcover grid-lined technical notebook for cloud diagrams, architecture sketching, and daily coding logs + sleek metal stylus pen.',
    icon: FileText,
    tag: 'OFFICIAL'
  },
  {
    id: 'swag',
    title: 'Collector Swag & Surprise Perks',
    category: 'Bonus Collectibles',
    description: 'Exclusive community builder collectible cards, pin badge, and partner voucher surprises packed inside the kit.',
    icon: Layers,
    tag: 'BONUS'
  }
];

export const MerchandiseStoreSection = () => {
  const [selectedItem, setSelectedItem] = useState<string>('bag');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('info@aws-scd-dhule.tech');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const whatsappUrl = `https://wa.me/919834382337?text=${encodeURIComponent(
    'Hi SCD Dhule Team! I would like to order the Official Bags & Welcome Kit Combo.'
  )}`;

  return (
    <section id="store" className="relative py-20 sm:py-28 px-4 sm:px-12 lg:px-24 bg-[#050505] border-b border-white/5 overflow-hidden" aria-label="Merchandise Store">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
      <div className="absolute -top-10 left-1/4 w-[500px] h-[500px] bg-aws-orange/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 right-1/4 w-[500px] h-[500px] bg-f1-red/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <SectionHeader
            title="Merch Store"
            subtitle="Take home the official SCD Dhule 2026 paddock collectibles. Post-event drop featuring our exclusive Bags & Welcome Kit combo."
            sysId="03.MRCH"
          />
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-aws-orange/10 border border-aws-orange/30 rounded-full font-mono text-[10px] sm:text-xs text-aws-orange uppercase tracking-wider font-bold shrink-0 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-aws-orange animate-ping" />
            <span>Limited Post-Event Stock</span>
          </div>
        </div>

        {/* Featured Combo Hero Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Interactive Product Console */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-[#0b0b0b] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.6)]"
          >
            {/* Ambient edge glow line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-f1-red via-aws-orange to-f1-red" />
            
            <div>
              {/* Product Badge & Category */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-aws-orange/10 border border-aws-orange/30 text-aws-orange font-mono text-[10px] uppercase tracking-widest font-black rounded">
                    OFFICIAL DROP
                  </span>
                  <span className="font-mono text-[10px] uppercase text-white/40 tracking-wider">
                    COMBO BUNDLE // 01
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-widest">
                  <PackageCheck size={14} /> Dispatch Ready
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-sans font-black italic text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight text-white mb-3">
                Bags & Welcome Kit Combo
              </h3>
              <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed max-w-2xl mb-6">
                The ultimate commemorative package from AWS Student Community Day Dhule 2026. Includes the official heavy-duty SCD paddock bag, metal badge & lanyard, technical developer notebook, holographic sticker pack, and collector items.
              </p>

              {/* Quick Specs / Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex flex-col">
                  <span className="font-mono text-[8.5px] uppercase text-white/40 tracking-widest flex items-center gap-1 mb-1">
                    <Truck size={11} className="text-aws-orange" /> Delivery
                  </span>
                  <span className="font-sans text-xs font-bold text-white">Direct / In-Person</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex flex-col">
                  <span className="font-mono text-[8.5px] uppercase text-white/40 tracking-widest flex items-center gap-1 mb-1">
                    <ShieldCheck size={11} className="text-emerald-400" /> Authenticity
                  </span>
                  <span className="font-sans text-xs font-bold text-white">100% Official Swag</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex flex-col col-span-2 sm:col-span-1">
                  <span className="font-mono text-[8.5px] uppercase text-white/40 tracking-widest flex items-center gap-1 mb-1">
                    <Flame size={11} className="text-f1-red" /> Edition
                  </span>
                  <span className="font-sans text-xs font-bold text-white">Dhule 2026 Season</span>
                </div>
              </div>

              {/* Inclusions Selector Tabs */}
              <div className="mb-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-aws-orange font-bold mb-3 flex items-center gap-1.5">
                  <Layers size={13} /> Everything Included In The Combo:
                </p>
                <div className="flex flex-wrap gap-2">
                  {comboItems.map((item) => {
                    const isSelected = selectedItem === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedItem(item.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-aws-orange/15 border-aws-orange text-white shadow-[0_0_15px_rgba(255,153,0,0.15)] font-bold'
                            : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:border-white/25'
                        }`}
                      >
                        <Icon size={14} className={isSelected ? 'text-aws-orange' : 'text-white/40'} />
                        <span>{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Item Detail Callout */}
              {(() => {
                const active = comboItems.find((c) => c.id === selectedItem) || comboItems[0];
                return (
                  <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl relative overflow-hidden text-left mb-6">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-sans font-black italic text-sm text-aws-orange uppercase tracking-wide">
                        {active.title}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-widest bg-white/10 text-white/80 px-2 py-0.5 rounded">
                        {active.tag}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-white/70 leading-relaxed">
                      {active.description}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Bottom In-Section Action Row */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col text-left">
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">Combo Status</span>
                <span className="font-sans font-black italic text-base sm:text-lg uppercase text-white">
                  Limited Units Available
                </span>
              </div>
              
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-aws-orange text-black font-sans font-black italic uppercase text-xs tracking-widest skew-x-[-10deg] hover:bg-white transition-all shadow-[0_0_20px_rgba(255,153,0,0.25)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="skew-x-[10deg] flex items-center gap-2">
                  Order Combo on WhatsApp <ExternalLink size={14} />
                </span>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Order & Direct Contacts Console */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="lg:col-span-5 bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative shadow-2xl"
          >
            {/* Top HUD decoration */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6 font-mono text-[9px] text-white/40 uppercase tracking-widest">
              <span>ORDER DESK // DIRECT INQUIRY</span>
              <span className="text-aws-orange font-bold">READY TO ASSIST</span>
            </div>

            <div className="flex flex-col gap-5">
              <h4 className="font-sans font-black italic text-xl uppercase tracking-tight text-white text-left">
                How to Order Your Combo
              </h4>
              
              <p className="font-sans text-xs text-white/60 leading-relaxed text-left">
                To collect or get your <span className="text-white font-bold">Bags & Welcome Kit Combo</span> dispatched, contact our organizing team directly via WhatsApp or phone. We will confirm your kit reservation instantly.
              </p>

              {/* Steps / Checklist */}
              <div className="space-y-2.5 text-left font-sans text-xs text-white/80">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-aws-orange shrink-0 mt-0.5" />
                  <span>Choose your quantity of the Bags & Welcome Kit combo.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-aws-orange shrink-0 mt-0.5" />
                  <span>Drop a message on WhatsApp or call any organizer below.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-aws-orange shrink-0 mt-0.5" />
                  <span>Confirm delivery or in-person campus pickup at Dhule.</span>
                </div>
              </div>

              {/* Direct Organizer Contact Cards */}
              <div className="p-4 bg-black/60 border border-white/10 rounded-xl mt-2 font-mono text-xs text-left space-y-3">
                <span className="text-[10px] uppercase font-bold text-aws-orange tracking-widest block">
                  Organizers Direct Lines:
                </span>
                
                <div className="space-y-2 text-white/80">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div>
                      <p className="font-bold text-white text-[11px]">Soham Chaudhari</p>
                      <p className="text-[9px] text-white/40 uppercase">Organizer</p>
                    </div>
                    <a
                      href="tel:+919834382337"
                      className="text-aws-orange hover:underline font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Phone size={11} /> +91 98343 82337
                    </a>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div>
                      <p className="font-bold text-white text-[11px]">Vaibhav Chaudhari</p>
                      <p className="text-[9px] text-white/40 uppercase">Organizer</p>
                    </div>
                    <a
                      href="tel:+918007298092"
                      className="text-aws-orange hover:underline font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Phone size={11} /> +91 80072 98092
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-[11px]">Saurabh Rajput</p>
                      <p className="text-[9px] text-white/40 uppercase">Organizer</p>
                    </div>
                    <a
                      href="tel:+919890991510"
                      className="text-aws-orange hover:underline font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Phone size={11} /> +91 98909 91510
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Support Copy */}
            <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors font-mono text-[10px] text-white uppercase tracking-widest rounded flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail size={12} className="text-aws-orange" />
                {copiedEmail ? 'Email Copied to Clipboard!' : 'info@aws-scd-dhule.tech'}
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
