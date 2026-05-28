import { motion } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import { Tag, Check } from 'lucide-react';

const ticketTiers = [
  {
    name: "Super Early Bird",
    type: "Student",
    price: "249",
    status: "SOLD OUT",
    features: ["Full Event Access", "Student Swag Kit", "Lunch & High Tea", "Participation Certificate"],
    highlight: false,
  },
  {
    name: "Early Bird",
    type: "Student",
    price: "349",
    status: "SELLING FAST",
    features: ["Full Event Access", "Student Swag Kit", "Lunch & High Tea", "Participation Certificate"],
    highlight: true,
  },
  {
    name: "Standard",
    type: "Student",
    price: "499",
    status: "COMING SOON",
    features: ["Full Event Access", "Student Swag Kit", "Lunch & High Tea", "Participation Certificate"],
    highlight: false,
  },
  {
    name: "Early Bird",
    type: "Professional",
    price: "499",
    status: "AVAILABLE",
    features: ["Full Event Access", "Premium Swag Kit", "VIP Networking Area", "Lunch & High Tea"],
    highlight: false,
  },
  {
    name: "Standard",
    type: "Professional",
    price: "799",
    status: "COMING SOON",
    features: ["Full Event Access", "Premium Swag Kit", "VIP Networking Area", "Lunch & High Tea"],
    highlight: false,
  }
];

export const TicketsSection = () => {
  return (
    <section id="tickets" className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-[#050505]">
      {/* Background flare */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-f1-red/5 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none"></div>

      <SectionHeader title="Paddock Passes" subtitle="Secure your spot on the grid. Choose the pass that fits your profile and join the cloud revolution." sysId="06.TKT" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mt-8 sm:mt-12 relative z-10">
        {ticketTiers.map((tier, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`flex flex-col p-6 sm:p-8 relative overflow-hidden group transition-all duration-300 min-h-[380px] border ${
              tier.highlight 
                ? 'bg-gradient-to-br from-f1-red/10 to-[#050505] border-f1-red/50 shadow-[0_0_30px_rgba(225,6,0,0.15)]' 
                : 'bg-[#111] border-white/5 hover:border-white/20'
            }`}
          >
            {/* Top gradient line for highlight */}
            {tier.highlight && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-f1-red to-aws-orange"></div>
            )}

            {/* Status Badge */}
            <div className={`self-start font-mono text-[9px] sm:text-[10px] tracking-widest uppercase px-2 py-1 mb-6 border ${
              tier.status === "SOLD OUT" ? "text-gray-400 border-gray-700 bg-gray-900" :
              tier.status === "SELLING FAST" ? "text-f1-red border-f1-red/30 bg-f1-red/10" :
              tier.status === "AVAILABLE" ? "text-aws-orange border-aws-orange/30 bg-aws-orange/10" :
              "text-white/50 border-white/10 bg-white/5"
            }`}>
              {tier.status}
            </div>

            <div className="mb-6 border-b border-white/10 pb-6">
              <h3 className={`font-sans font-black italic text-2xl uppercase tracking-tighter ${tier.highlight ? 'text-white' : 'text-gray-300'}`}>
                {tier.name}
              </h3>
              <p className="font-mono text-[10px] sm:text-xs text-aws-orange tracking-widest uppercase mt-1">
                {tier.type} Pass
              </p>
              
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-sans font-bold text-xl text-white/50">₹</span>
                <span className="font-sans font-black italic text-4xl sm:text-5xl tracking-tighter text-white">
                  {tier.price}
                </span>
              </div>
            </div>

            <ul className="flex flex-col gap-3 flex-1 mt-auto">
              {tier.features.map((feature, j) => (
                <li key={j} className="text-[10px] sm:text-xs font-sans opacity-60 flex items-start gap-2 group-hover:opacity-80 transition-opacity">
                  <Check size={14} className="text-[#00ff00] shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
