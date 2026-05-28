import { motion } from 'motion/react';
import { SectionHeader } from './LayoutElements';

const galleryImages = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800",
];

export const GallerySection = () => {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-[#050505]">
      <SectionHeader title="Past Highlights" subtitle="Glimpses from our previous community events, workshops, and cloud conferences." sysId="07.GLY" />
      
      {/* Masonry-style Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-12 relative z-10">
        {galleryImages.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`relative group overflow-hidden border border-white/5 ${
              i === 0 || i === 3 ? "md:col-span-2 md:row-span-2" : ""
            }`}
          >
            <div className="aspect-[4/3] w-full h-full">
              <img 
                src={src} 
                alt={`Event highlight ${i + 1}`} 
                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                loading="lazy"
              />
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            
            {/* View Label */}
            <div className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-widest text-white/0 group-hover:text-white/70 transition-colors duration-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-aws-orange"></span>
              Event Archive
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
