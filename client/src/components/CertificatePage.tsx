import React, { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Search,
  Loader2,
  Award,
  BadgeCheck,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Linkedin,
  Twitter,
  Lock,
  AlertCircle,
} from "lucide-react";
import { toPng } from "html-to-image";
import confetti from "canvas-confetti";
import axios from "axios";
import copy from "copy-to-clipboard";

export const CertificatePage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("email") || searchParams.get("id") || "",
  );
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [role, setRole] = useState("ATTENDEE");
  const [certId, setCertId] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const certRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const watermarkText = (
    certId ? `AWSSCDDHULE2026•${certId} • ` : "AWSSCDDHULE2026 • "
  ).repeat(20);

  const getCertificateTitle = (currentRole: string) => {
    switch (currentRole) {
      case "SPEAKER":
      case "VOLUNTEER":
        return "CERTIFICATE OF APPRECIATION";
      case "ORGANIZER":
      case "COMMUNITY BUILDER":
        return "CERTIFICATE OF RECOGNITION";
      case "VIP GUEST":
        return "CERTIFICATE OF HONOR";
      default:
        return "CERTIFICATE OF PARTICIPATION";
    }
  };

  const getRibbonTag = (currentRole: string) => {
    switch (currentRole) {
      case "SPEAKER":
        return "★ OFFICIAL SPEAKER RECOGNITION ★";
      case "VOLUNTEER":
        return "★ OFFICIAL VOLUNTEER HONOUR ★";
      case "ORGANIZER":
      case "COMMUNITY BUILDER":
        return "★ OFFICIAL BUILDER RECOGNITION ★";
      default:
        return "★ OFFICIAL PARTICIPATION RECORD ★";
    }
  };

  const getCitationMessage = (currentRole: string) => {
    switch (currentRole) {
      case "VOLUNTEER":
        return (
          <>
            In recognition of outstanding dedication, leadership, and exemplary
            volunteer service contributing to the tremendous success of{" "}
            <span className="text-white font-bold">
              AWS Student Community Day Dhule 2026
            </span>
            , held on August 14, 2026 at SVKM's Institute of Technology, Dhule.
          </>
        );
      case "SPEAKER":
        return (
          <>
            In sincere appreciation for sharing valuable technical expertise,
            thought leadership, and inspiring insights as an esteemed speaker at{" "}
            <span className="text-white font-bold">
              AWS Student Community Day Dhule 2026
            </span>
            , held on August 14, 2026 at SVKM's Institute of Technology, Dhule.
          </>
        );
      case "ORGANIZER":
      case "COMMUNITY BUILDER":
        return (
          <>
            In profound recognition of visionary leadership, tireless dedication, and exceptional community building that made <span className="text-white font-bold">AWS Student Community Day Dhule 2026</span> an unforgettable milestone on August 14, 2026 at SVKM's Institute of Technology, Dhule.
          </>
        );
      case "VIP GUEST":
        return (
          <>
            In honored recognition of distinguished presence and gracious
            support as an esteemed guest at{" "}
            <span className="text-white font-bold">
              AWS Student Community Day Dhule 2026
            </span>
            , held on August 14, 2026 at SVKM's Institute of Technology, Dhule.
          </>
        );
      case "ATTENDEE":
      default:
        return (
          <>
            For actively attending and participating in{" "}
            <span className="text-white font-bold">
              AWS Student Community Day Dhule 2026
            </span>
            , held on August 14, 2026 at SVKM's Institute of Technology, Dhule.
            Demonstrating commendable enthusiasm, cloud curiosity, and
            commitment to the builder community.
          </>
        );
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ["#FF9900", "#FFD700", "#ffffff", "#2563eb"],
    });
  };

  const handleLookup = async (queryToSearch?: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    setSearching(true);
    setSearchError(null);

    try {
      const res = await axios.get(
        `/api/tickets/lookup?query=${encodeURIComponent(q)}`,
      );
      const attendee = res.data;

      if (attendee && attendee.verified) {
        setName(attendee.full_name.toUpperCase());
        setRole("ATTENDEE");
        const generatedId = attendee.ticket_number
          ? attendee.ticket_number
          : `SCD-${attendee.id.replace(/-/g, "").slice(0, 6).toUpperCase()}-26`;
        setCertId(generatedId);
        setIsVerified(true);
        triggerConfetti();
      }
    } catch (err: any) {
      console.warn("Lookup error:", err);
      const errMsg =
        err.response?.data?.message ||
        "No verified checked-in attendance found for this email address. Certificates are exclusively available to attendees who purchased a pass and checked in at the event.";
      setSearchError(errMsg);
      setIsVerified(false);
      setName("");
      setCertId("");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const initialQuery = searchParams.get("email") || searchParams.get("id");
    if (initialQuery) {
      handleLookup(initialQuery);
    }
  }, [searchParams]);

  const handleDownloadPng = async () => {
    if (!certRef.current || !isVerified) return;
    setIsGeneratingPng(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dataUrl = await toPng(certRef.current, {
        pixelRatio: 2,
        width: 920,
        height: 640,
        backgroundColor: "#090a0f",
        cacheBust: true,
      });
      const link = document.createElement("a");
      const safeName = name.replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `AWS_SCD26_Certificate_${safeName}.png`;
      link.href = dataUrl;
      link.click();
      triggerConfetti();
    } catch (error) {
      console.error("Error generating PNG certificate:", error);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  const handleShareLinkedIn = () => {
    const text = encodeURIComponent(
      `Excited to receive my official Certificate of Participation from AWS Student Community Day Dhule 2026! 🚀☁️\n\nHad an incredible time learning about generative AI, cloud architectures, and modern DevOps from AWS Heroes & Leaders.\n\n#AWSSCDDhule #AWSCommunity #CloudBuilders #AWSCommunityDay #SCDDhule2026`,
    );
    const url = encodeURIComponent(window.location.origin + "/certificate");
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`,
      "_blank",
    );
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Proud to receive my Certificate of Participation for #AWSSCDDhule 2026! 🎓☁️ Amazing sessions and community energy.\n\nCheck it out:`,
    );
    const url = encodeURIComponent(window.location.origin + "/certificate");
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
    );
  };

  const handleCopyLink = () => {
    copy(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col font-sans relative overflow-x-hidden">
      {/* Background aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-aws-orange/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex-grow flex flex-col">
        {/* Navigation Header */}
        <header className="flex items-center justify-between mb-6 sm:mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-aws-orange transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-sm tracking-wider uppercase">
              Back to Home
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-aws-orange uppercase tracking-[0.2em] font-bold px-3 py-1 bg-aws-orange/10 border border-aws-orange/30 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,153,0,0.2)]">
              <Award size={14} />
              <span>Official Certificate</span>
            </span>
          </div>
        </header>

        {/* Page Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black italic tracking-tighter uppercase text-white mb-3">
            CLAIM YOUR{" "}
            <span className="text-aws-orange drop-shadow-[0_0_25px_rgba(255,153,0,0.4)]">
              CERTIFICATE
            </span>
          </h1>
          <p className="text-white/60 font-mono text-xs sm:text-sm uppercase tracking-wider leading-relaxed">
            Verify your attendance with your registered email to unlock your
            Certificate of Participation.
          </p>
        </div>

        {/* Search / Email Verification Bar */}
        <div className="w-full max-w-xl mx-auto mb-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup();
            }}
            className="relative flex items-center bg-[#0d0d12] border border-white/15 focus-within:border-aws-orange rounded-xl p-1.5 shadow-xl transition-all"
          >
            <div className="pl-3.5 pr-2 text-white/40">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Enter registered email or Ticket ID (e.g. SCD-271365-26)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent font-mono text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none py-2.5"
              required
            />
            <button
              type="submit"
              disabled={searching}
              className="px-5 py-2.5 bg-aws-orange hover:bg-white text-black font-sans font-black italic uppercase text-xs tracking-wider rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              {searching ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              <span>{searching ? "Verifying..." : "Verify & Unlock"}</span>
            </button>
          </form>

          {isVerified && (
            <div className="mt-3 flex items-center justify-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2.5 px-4 rounded-lg animate-fadeIn shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <CheckCircle2 size={16} />
              <span>
                Verified Check-in: <strong>{name}</strong> ({certId})
              </span>
            </div>
          )}

          {searchError && (
            <div className="mt-3 flex items-start gap-2.5 font-mono text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-left">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* Certificate Display Area */}
        {isVerified ? (
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center mb-10">
            {/* Certificate Canvas / Card (High-Res Export Target) */}
            <div className="w-full overflow-x-auto pb-4 flex justify-center">
              <div
                ref={certRef}
                className="w-[920px] min-w-[920px] h-[640px] bg-[#090a0f] relative overflow-hidden rounded-2xl border-4 border-aws-orange/80 shadow-[0_0_60px_rgba(0,0,0,0.9)] p-8 flex flex-col justify-between select-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 30%, rgba(255, 153, 0, 0.06) 0%, transparent 70%), linear-gradient(135deg, #07080c 0%, #0d0f18 50%, #07080c 100%)`,
                }}
              >
                {/* Decorative Corner Ornaments */}
                <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-[#FFD700] rounded-tl-lg pointer-events-none" />
                <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-[#FFD700] rounded-tr-lg pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-[#FFD700] rounded-bl-lg pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-[#FFD700] rounded-br-lg pointer-events-none" />

                {/* Subtle Guilloche / Technical Circuit Watermark */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                <div className="absolute -right-24 -bottom-24 w-80 h-80 bg-aws-orange/5 rounded-full blur-[90px] pointer-events-none" />

                {/* Inner Border Frame */}
                <div className="absolute inset-3.5 border border-white/15 rounded-xl pointer-events-none" />

                {/* Continuous Curved Microprint Watermark Security Border on Corners */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-visible"
                  viewBox="0 0 920 640"
                  width="920"
                  height="640"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                  <defs>
                    <path
                      id="scd-curved-watermark-track"
                      d="M 38,20 H 882 A 18,18 0 0 1 900,38 V 602 A 18,18 0 0 1 882,620 H 38 A 18,18 0 0 1 20,602 V 38 A 18,18 0 0 1 38,20 Z"
                      fill="none"
                    />
                  </defs>
                  <text
                    fill="rgba(255, 215, 0, 0.3)"
                    style={{
                      fontFamily: "monospace",
                      fontSize: "6.5px",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    <textPath
                      href="#scd-curved-watermark-track"
                      xlinkHref="#scd-curved-watermark-track"
                      startOffset="0%"
                    >
                      {watermarkText}
                    </textPath>
                  </text>
                </svg>

                {/* Top Header: Left SCD Logo, Right AWS Builder + ARIF Logo */}
                <div className="relative z-10 flex items-center justify-between px-4 pt-1">
                  <div className="flex items-center">
                    <img
                      src="/scd-dhule-logo.png"
                      alt="AWS SCD Dhule 2026"
                      className="h-18 sm:h-22 w-auto object-contain py-1 px-3"
                      crossOrigin="anonymous"
                    />
                  </div>

                  <div className="flex items-center gap-3 pr-2">
                    <img
                      src="/AWS_Builder.png"
                      alt="AWS Builder"
                      className="h-9 sm:h-10 w-auto object-contain"
                      crossOrigin="anonymous"
                    />
                    <div className="h-6 w-[1px] bg-white/20" />
                    <img
                      src="/ARIF-white.png"
                      alt="ARIF"
                      className="h-14 sm:h-18 w-auto object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>

                {/* Main Certificate Title & Text */}
                <div className="relative z-10 text-center flex flex-col items-center mt-8 mb-auto">
                  {/* Ribbon Tag */}
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-aws-orange/20 via-[#FFD700]/20 to-aws-orange/20 border border-aws-orange/40 text-aws-orange font-mono text-[10px] uppercase tracking-[0.3em] font-bold mb-2 shadow-[0_0_20px_rgba(255,153,0,0.25)]">
                    <span>{getRibbonTag(role)}</span>
                  </div>

                  <h2 className="font-sans font-black italic uppercase text-3xl sm:text-4xl tracking-tight text-white mb-1">
                    {getCertificateTitle(role)}
                  </h2>

                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/50 mb-2 font-semibold">
                    This is proudly presented to
                  </p>

                  {/* Recipient Full Name (Only Name) */}
                  <div className="relative my-1.5 py-0.5 px-8">
                    <h3
                      className="uppercase text-xl sm:text-2xl md:text-3xl tracking-wider font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5C0] via-[#FFB800] to-[#FF9900] drop-shadow-[0_4px_25px_rgba(255,153,0,0.45)]"
                      style={{
                        fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {name}
                    </h3>
                    <div className="h-[1.5px] w-48 mx-auto bg-gradient-to-r from-transparent via-aws-orange to-transparent mt-2" />
                  </div>

                  {/* Role Tag */}
                  <div className="flex items-center justify-center gap-2 mt-2 mb-2.5 font-mono text-xs">
                    <span className="px-3 py-0.5 rounded bg-white/5 border border-white/15 text-aws-orange font-bold uppercase tracking-widest text-[10px]">
                      {role}
                    </span>
                  </div>

                  {/* Citation Paragraph */}
                  <p className="font-sans text-xs sm:text-[13px] text-white/70 max-w-2xl mx-auto leading-relaxed px-4 text-center font-normal">
                    {getCitationMessage(role)}
                  </p>
                </div>

                {/* Bottom Footer: Verification, Date & Single Signature */}
                <div className="relative z-10 flex items-end justify-between px-6 pb-2 border-t border-white/10 pt-4">
                  {/* Left: ID & Metadata */}
                  <div className="text-left font-mono text-[10px] text-white/50 space-y-1">
                    <div>
                      <span className="text-white/30 uppercase tracking-wider">
                        CERTIFICATE ID:{" "}
                      </span>
                      <span className="text-aws-orange font-bold font-mono tracking-wider">
                        {certId}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/30 uppercase tracking-wider">
                        DATE:{" "}
                      </span>
                      <span className="text-white/80">August 14, 2026</span>
                    </div>
                    <div>
                      <span className="text-white/30 uppercase tracking-wider">
                        VENUE:{" "}
                      </span>
                      <span className="text-white/80">Dhule, Maharashtra</span>
                    </div>
                  </div>

                  {/* Center: Luxury Verified Hologram Security Seal */}
                  <div className="flex flex-col items-center justify-center relative">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      {/* Outer Notched Sunburst Ring */}
                      <div className="absolute inset-0 rounded-full border border-dashed border-[#FFD700]/70" />
                      
                      {/* Outer Shimmer Gradient Border */}
                      <div className="absolute inset-[3px] rounded-full p-[1.5px] bg-gradient-to-tr from-[#FF9900] via-[#FFD700] to-[#FFF5C0] shadow-[0_0_20px_rgba(255,153,0,0.35)]">
                        {/* Inner Dark Metallic Dial */}
                        <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1c1206] via-[#0d0903] to-[#181005] flex flex-col items-center justify-center text-center p-1 border border-[#FFD700]/40">
                          <BadgeCheck size={20} className="text-[#FFD700] drop-shadow-[0_0_6px_rgba(255,215,0,0.6)] mb-0.5" />
                          <span
                            className="font-mono text-[6.5px] uppercase tracking-[0.22em] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5C0] via-[#FFD700] to-[#FF9900] leading-none"
                          >
                            VERIFIED
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Security Micro Badge */}
                    <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 shadow-[0_0_8px_rgba(255,215,0,0.15)] flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      <span className="font-mono text-[6.5px] uppercase tracking-widest text-[#FFD700] font-bold">
                        AWS SCD 2026
                      </span>
                    </div>
                  </div>

                  {/* Right: Signature Block (Soham Chaudhari - Cursive Handwriting) */}
                  <div className="text-center font-mono max-w-[220px]">
                    <div
                      className="text-2xl sm:text-3xl text-aws-orange tracking-wide leading-none py-0.5 drop-shadow-[0_0_15px_rgba(255,153,0,0.3)]"
                      style={{
                        fontFamily: "'Great Vibes', 'Dancing Script', 'Caveat', cursive",
                        fontWeight: 400,
                      }}
                    >
                      Soham Chaudhari
                    </div>
                    <div className="h-[1px] w-44 mx-auto bg-white/30 my-1" />
                    <span className="text-[7.5px] uppercase tracking-wider text-white/50 block leading-tight">
                      Leader, AWS Student Builder Group at SVKM IOT Dhule
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customization Options & Download Controls */}
            <div className="w-full max-w-4xl mx-auto bg-[#0d0d12]/90 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block font-mono text-xs text-white/50 uppercase tracking-[0.2em] mb-2 font-semibold">
                    Verified Participant Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    disabled
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-white/70 cursor-not-allowed"
                  />
                  <span className="text-[10px] font-mono text-white/40 mt-1 block">
                    * Name is tied to your verified check-in registration
                  </span>
                </div>

                <div>
                  <label className="block font-mono text-xs text-white/50 uppercase tracking-[0.2em] mb-2 font-semibold">
                    Change Role / Category
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#050505] border border-white/15 rounded-lg px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-aws-orange focus:ring-1 focus:ring-aws-orange transition-all cursor-pointer"
                  >
                    <option value="ATTENDEE">ATTENDEE</option>
                    <option value="VOLUNTEER">VOLUNTEER</option>
                    <option value="SPEAKER">SPEAKER</option>
                    <option value="COMMUNITY BUILDER">COMMUNITY BUILDER</option>
                    <option value="VIP GUEST">VIP GUEST</option>
                    <option value="ORGANIZER">ORGANIZER</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    disabled={isGeneratingPng}
                    className="px-6 py-3.5 bg-aws-orange hover:bg-white text-black font-sans font-black italic uppercase text-xs sm:text-sm tracking-wider rounded-lg shadow-[0_0_20px_rgba(255,153,0,0.3)] transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isGeneratingPng ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    <span>
                      {isGeneratingPng
                        ? "Generating HD Certificate..."
                        : "Download Certificate (High-Res)"}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleShareLinkedIn}
                    className="p-3 bg-[#0a66c2]/15 hover:bg-[#0a66c2] text-[#0a66c2] hover:text-white border border-[#0a66c2]/30 rounded-lg transition-all cursor-pointer"
                    title="Share on LinkedIn"
                  >
                    <Linkedin size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={handleShareTwitter}
                    className="p-3 bg-white/5 hover:bg-white hover:text-black text-white/80 border border-white/10 rounded-lg transition-all cursor-pointer"
                    title="Share on X / Twitter"
                  >
                    <Twitter size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-3 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-lg transition-all cursor-pointer"
                    title="Copy Page Link"
                  >
                    {copiedLink ? (
                      <Check size={18} className="text-emerald-400" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Locked State Card */
          <div className="w-full max-w-xl mx-auto bg-[#0d0d12]/80 border border-white/10 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center backdrop-blur-md shadow-2xl mb-12">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-4">
              <Lock size={28} />
            </div>
            <h3 className="font-sans font-black italic uppercase text-xl sm:text-2xl text-white mb-2">
              Certificate Locked
            </h3>
            <p className="font-mono text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
              Enter your registered event pass email above to verify your venue
              check-in and unlock your certificate.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 text-center mt-auto flex flex-col items-center gap-2">
          <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest">
            AWS Student Community Day Dhule 2026 • Verified Participation
            Registry
          </p>
        </footer>
      </div>
    </div>
  );
};
