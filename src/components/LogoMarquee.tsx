import { useEffect, useRef } from "react";
import gsap from "gsap";

export const LogoMarquee = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!marqueeRef.current) return;

    // Animate Marquee infinitely
    const tween = gsap.to(marqueeRef.current, {
      xPercent: -50,
      ease: "none",
      duration: 15,
      repeat: -1,
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div className="w-full border-b border-white/10 bg-[#050505] py-6 sm:py-10 overflow-hidden relative flex z-20">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none"></div>

      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none"></div>

      <div
        ref={marqueeRef}
        className="flex items-center whitespace-nowrap min-w-max"
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-12 sm:space-x-24 px-6 sm:px-12"
          >
            <img
              src="/AWS_logo1.png"
              alt="AWS Logo"
              className="h-12 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            />

            <img
              src="/ARIF-white.png"
              alt="ARIF Logo"
              className="h-16 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            />

            <img
              src="/AWS_Builder.png"
              alt="AWS Builder Logo"
              className="h-12 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
