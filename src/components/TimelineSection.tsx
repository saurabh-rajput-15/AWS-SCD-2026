import { motion } from 'motion/react';
import { SectionHeader, TelemetryData } from './LayoutElements';

const schedule = [
  { time: "08:00 - 08:30", type: "Formation Lap", title: "Organizing Team Preparation", detail: "Last-minute checks before opening the circuit.", isPit: false, flag: "gray" },
  { time: "08:30 - 10:00", type: "Pit Lane", title: "Registration & Morning Breakfast", detail: "Get your paddock passes, grab fuel, and prepare for lights out.", isPit: true, flag: "red" },
  { time: "10:00 - 10:30", type: "Lights Out", title: "Official Opening Ceremony", detail: "Welcome address from SVKM track directors and AWS leadership.", isPit: false, flag: "red" },
  { time: "10:30 - 11:15", type: "Green Flag", title: "Main Presentation 1: Tech Keynote", detail: "Deep dive into cloud architecture and community building.", isPit: false, flag: "green" },
  { time: "11:15 - 11:30", type: "Safety Car", title: "Short Networking Break", detail: "Quick pit stop to refuel and network.", isPit: false, flag: "yellow" },
  { time: "11:30 - 12:30", type: "Green Flag", title: "Parallel Presentation Sessions", detail: "Multiple technical tracks covering cloud, AI, and DevOps.", isPit: false, flag: "green" },
  { time: "12:30 - 13:30", type: "Pit Lane", title: "Lunch Break & Company Networking", detail: "Refuel, change tires, and network with fellow constructors.", isPit: true, flag: "red" },
  { time: "13:30 - 15:00", type: "Green Flag", title: "Practical Hands-on Workshops", detail: "Building responsive cloud and AI systems entirely hands-on.", isPit: false, flag: "green" },
  { time: "15:00 - 15:15", type: "Safety Car", title: "Short Afternoon Break", detail: "Cool down the engines.", isPit: false, flag: "yellow" },
  { time: "15:15 - 16:00", type: "Green Flag", title: "Industry Panel Discussion", detail: "Insights from tech leaders and cloud professionals.", isPit: false, flag: "green" },
  { time: "16:00 - 16:45", type: "Green Flag", title: "Student Project Exhibition & High-Tea", detail: "Showcase of innovative student-built cloud projects.", isPit: false, flag: "green" },
  { time: "16:45 - 17:30", type: "Chequered Flag", title: "Closing Ceremony & Group Photo", detail: "Trophies, prizes, and grand finale.", isPit: false, flag: "gray" },
];

export const TimelineSection = () => {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-[#050505]">
      <SectionHeader title="Race Weekend Timeline" subtitle="Twelve sectors. One full day on the cloud racing calendar — from opening lights to the final chequered flag." sysId="02.STRAT" />
      
      <div className="mt-8 sm:mt-12 relative max-w-4xl mx-auto">
        {/* Decorative Track Line */}
        <div className="absolute left-4 sm:left-8 md:left-1/2 top-0 bottom-0 w-3 sm:w-4 bg-[#111] border-x border-white/10 transform md:-translate-x-1/2 flex flex-col justify-between overflow-hidden z-0">
             {/* Kerbs overlay on the track */}
             {[...Array(20)].map((_, i) => (
                <div key={i} className="h-4 w-full bg-repeating-linear-gradient(45deg,#E10600,#E10600 4px,white 4px,white 8px) opacity-50"></div>
             ))}
        </div>

        <div className="flex flex-col gap-6 sm:gap-8 relative z-10">
          {schedule.map((slot, i) => {
             const isLeft = i % 2 === 0;
             return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 6) * 0.1, duration: 0.5 }}
                className={`flex flex-col md:flex-row items-center gap-4 sm:gap-8 ${isLeft ? 'md:flex-row-reverse' : ''}`}
              >
                 {/* Empty space for alternating layout */}
                 <div className="hidden md:block md:w-1/2"></div>
                 
                 {/* Timeline Node */}
                 <div className="absolute left-4 sm:left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-[#050505] rounded-full border-[3px] sm:border-4 border-[#FF9900] z-20 shadow-[0_0_10px_rgba(255,153,0,0.4)] sm:shadow-[0_0_15px_rgba(255,153,0,0.5)]"></div>
                 
                 {/* Content Card */}
                 <div className={`w-full md:w-1/2 pl-12 sm:pl-24 md:pl-0 ${isLeft ? 'md:pr-12' : 'md:pl-12'} py-2 sm:py-4`}>
                    <div className={`p-4 sm:p-6 md:p-8 flex flex-col relative overflow-hidden group transition-all duration-300 border-b-2
                        ${slot.isPit ? 'bg-[#E10600]/5 hover:bg-[#E10600]/10 border-[#E10600]/50' : 'bg-[#111] hover:bg-white/[0.05] border-[#FF9900]/50'}
                    `}>
                       {/* Background Number */}
                       <div className="absolute -right-2 sm:-right-4 -bottom-4 sm:-bottom-8 font-sans font-black italic text-5xl sm:text-8xl text-white/[0.03] group-hover:text-white/[0.05] transition-colors pointer-events-none">
                          {String(i + 1).padStart(2, '0')}
                       </div>

                       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-3 relative z-10 gap-1 sm:gap-0">
                         <span className={`font-mono text-base sm:text-xl md:text-2xl font-bold tracking-tighter ${slot.isPit ? 'text-[#E10600]' : 'text-aws-orange'}`}>
                            {slot.time}
                         </span>
                         <span className="px-2 py-0.5 bg-white/5 text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest border border-white/10 self-start">{slot.type}</span>
                       </div>
                       
                       <div className="text-sm sm:text-lg md:text-xl font-sans font-black italic uppercase tracking-wider sm:tracking-widest text-white mb-1 sm:mb-2 relative z-10 leading-tight">
                         {slot.title}
                         {slot.isPit && <span className="ml-2 sm:ml-3 text-[8px] sm:text-[9px] text-[#E10600] bg-[#E10600]/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-sm tracking-widest uppercase border border-[#E10600]/20 hidden sm:inline-block relative -top-1">[PIT STOP]</span>}
                       </div>
                       
                       <div className="text-[10px] sm:text-xs font-sans opacity-60 uppercase leading-relaxed max-w-sm relative z-10">{slot.detail}</div>
                    </div>
                 </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
