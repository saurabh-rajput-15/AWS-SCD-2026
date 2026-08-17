import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Copy, 
  Check, 
  Mail, 
  Loader2,
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  Medal,
  Crown
} from 'lucide-react';
import { api } from '../../../lib/api';
import copy from 'copy-to-clipboard';
import confetti from 'canvas-confetti';

interface ReferralRecord {
  date: string;
  points: number;
  email: string;
  pass_name: string;
}

interface ReferralResponse {
  found: boolean;
  referral_code: string;
  total_points: number;
  referral_count: number;
  referrals: ReferralRecord[];
}

export default function MyReferralsPage() {
  interface PublicLeaderboardEntry {
    name: string;
    pass: string;
    total_points: number;
    referrals: number;
  }

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<ReferralResponse | null>(null);
  
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [leaderboard, setLeaderboard] = useState<PublicLeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // Initial celebratory confetti
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF9900', '#E10600', '#ffffff', '#10B981', '#FFD700']
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get<PublicLeaderboardEntry[]>('/api/orders/public-leaderboard');
        setLeaderboard(res.data);
      } catch (err) {
        console.error('Failed to fetch public leaderboard:', err);
      } finally {
        setLeaderboardLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await api.get<ReferralResponse>(`/api/orders/my-referrals`, {
        params: { email: email.trim() }
      });
      setData(res.data);
      
      // Theme matched confetti: AWS Orange, F1 Red, White, Green, Gold
      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.75 },
        colors: ['#FF9900', '#E10600', '#ffffff', '#10B981', '#FFD700']
      });
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'No paddock pass found associated with this email. Check email.'
      );
    } finally {
      setLoading(false);
    }
  };

  const referralUrl = data?.referral_code
    ? `${window.location.origin}/ticket?ref=${data.referral_code}`
    : '';

  const handleCopyLink = () => {
    if (!referralUrl) return;
    copy(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!data?.referral_code) return;
    copy(data.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Verified Final Top 5 from Leaderboard
  const top1 = leaderboard[0] || { name: 'Dnyaneshwar Mali', total_points: 225, referrals: 9 };
  const top2 = leaderboard[1] || { name: 'Yuvraj Patil', total_points: 150, referrals: 6 };
  const top3 = leaderboard[2] || { name: 'Shaikh Shaarif', total_points: 150, referrals: 2 };
  const top4 = leaderboard[3] || { name: 'Om Jadhav', total_points: 125, referrals: 5 };
  const top5 = leaderboard[4] || { name: 'Srushti Dashpute', total_points: 125, referrals: 5 };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col relative no-scrollbar">
      {/* Scrollbar-hide global overrides + Floating emoji wallpaper + F1 Chequered Backgrounds */}
      <style>{`
        html, body {
          overscroll-behavior-y: none;
        }
        .custom-scrollbar {
          overflow-y: auto !important;
          overscroll-behavior-y: contain;
          touch-action: pan-y;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 153, 0, 0.4) transparent;
          -webkit-overflow-scrolling: touch;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 153, 0, 0.4);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 153, 0, 0.8);
        }
        @keyframes floatUp {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
        .emoji-float {
          position: fixed;
          z-index: 1;
          pointer-events: none;
          animation: floatUp linear infinite;
          font-size: 20px;
          opacity: 0;
          filter: grayscale(0.5) brightness(0.4);
        }
        .bg-chequered {
          background-image: 
            linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%), 
            linear-gradient(-45deg, rgba(255,255,255,0.08) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.08) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.08) 75%);
          background-size: 8px 8px;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
        }
        .group:hover .bg-chequered-hover {
          background-image: 
            linear-gradient(45deg, rgba(255,153,0,0.15) 25%, transparent 25%), 
            linear-gradient(-45deg, rgba(255,153,0,0.15) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(255,153,0,0.15) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(255,153,0,0.15) 75%);
          background-size: 8px 8px;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
        }
      `}
      </style>

      {/* Floating Emoji Wallpaper */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {['🏆','🎁','🚀','☁️','⭐','🏁','🎯','🔥','💎','🏆','🎁','🚀','☁️','⭐','🏁','🎯'].map((emoji, i) => (
          <span
            key={i}
            className="emoji-float"
            style={{
              left: `${5 + (i * 6.2) % 90}%`,
              animationDuration: `${14 + (i * 3.7) % 16}s`,
              animationDelay: `${(i * 2.3) % 12}s`,
              fontSize: `${16 + (i * 2.1) % 12}px`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="w-full flex-1 flex flex-col relative z-10">
        {/* Header Navigation */}
        <header className="border-b border-white/5 bg-[#0a0a0a]/60 backdrop-blur-md px-4 sm:px-12 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
          <span className="font-sans font-black italic text-lg uppercase tracking-tighter text-white">
            AWS SCD <span className="text-aws-orange">2026</span>
          </span>
        </header>

        {/* Main Winners Stage & Results Center */}
        <div className="w-full flex-1 px-4 sm:px-12 py-8 sm:py-12 flex flex-col items-center justify-start max-w-6xl mx-auto">
          
          {/* Contest Concluded Status Badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full font-mono text-[10px] sm:text-xs text-emerald-400 font-bold uppercase tracking-widest mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CONTEST CONCLUDED • FINAL PODIUM</span>
          </div>

          {/* Title */}
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h1 className="font-sans font-black italic text-4xl sm:text-6xl uppercase tracking-tighter mb-3 text-white">
              REFER & <span className="text-aws-orange drop-shadow-[0_0_25px_rgba(255,153,0,0.5)]">WINNERS</span>
            </h1>
            <p className="text-white/60 font-mono text-xs sm:text-sm uppercase tracking-wider max-w-xl mx-auto leading-relaxed">
              The chequered flag has dropped! Huge congratulations to our Top 5 community builders who brought the crowd to the grid!
            </p>
          </div>

          {/* Top 3 Podium Cards */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 items-end">
            
            {/* P2 (Silver) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="order-2 md:order-1 relative bg-gradient-to-b from-[#181822] via-[#0f0f16] to-[#08080c] border border-slate-400/30 rounded-2xl p-6 text-center shadow-xl overflow-hidden group hover:border-slate-300/60 transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 to-slate-200" />
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-400/10 border border-slate-400/40 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(148,163,184,0.2)]">
                <span className="font-mono font-black text-xl text-slate-300">2</span>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-300 font-bold block mb-1">
                🥈 2nd Place Podium
              </span>
              <h3 className="font-sans font-black italic text-xl text-white uppercase tracking-tight mb-2 truncate">
                {top2.name}
              </h3>
              <div className="font-mono font-black text-2xl text-slate-200 mb-1">
                {top2.total_points} <span className="text-xs text-slate-400 font-normal">PTS</span>
              </div>
              <p className="font-mono text-[10px] text-white/40 uppercase">{top2.referrals} Referrals Completed</p>
            </motion.div>

            {/* P1 (Gold Champion) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="order-1 md:order-2 relative bg-gradient-to-b from-[#2a1a05] via-[#1a1104] to-[#0a0702] border-2 border-aws-orange/60 rounded-2xl p-7 text-center shadow-[0_0_40px_rgba(255,153,0,0.25)] overflow-hidden group -mt-4"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFD700] via-aws-orange to-[#E10600]" />
              <div className="w-16 h-16 mx-auto rounded-full bg-aws-orange/20 border-2 border-aws-orange flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(255,153,0,0.5)]">
                <Trophy className="text-aws-orange w-8 h-8 drop-shadow-[0_0_10px_rgba(255,153,0,0.8)]" />
              </div>
              <span className="px-3 py-0.5 rounded-full bg-aws-orange/20 border border-aws-orange/50 font-mono text-[10px] uppercase tracking-[0.25em] text-aws-orange font-black inline-block mb-1.5">
                👑 1st Place Champion
              </span>
              <h3 className="font-sans font-black italic text-2xl sm:text-3xl text-white uppercase tracking-tight mb-2 truncate">
                {top1.name}
              </h3>
              <div className="font-mono font-black text-4xl text-aws-orange mb-1 drop-shadow-[0_0_15px_rgba(255,153,0,0.4)]">
                {top1.total_points} <span className="text-sm text-white/50 font-normal">PTS</span>
              </div>
              <p className="font-mono text-xs text-white/60 uppercase font-semibold">{top1.referrals} Referrals Completed</p>
            </motion.div>

            {/* P3 (Bronze) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="order-3 relative bg-gradient-to-b from-[#1f1510] via-[#140d0a] to-[#080504] border border-amber-700/40 rounded-2xl p-6 text-center shadow-xl overflow-hidden group hover:border-amber-600/60 transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700 to-amber-500" />
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-700/10 border border-amber-700/40 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(217,119,6,0.2)]">
                <span className="font-mono font-black text-xl text-amber-500">3</span>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-500 font-bold block mb-1">
                🥉 3rd Place Podium
              </span>
              <h3 className="font-sans font-black italic text-xl text-white uppercase tracking-tight mb-2 truncate">
                {top3.name}
              </h3>
              <div className="font-mono font-black text-2xl text-amber-400 mb-1">
                {top3.total_points} <span className="text-xs text-amber-500/70 font-normal">PTS</span>
              </div>
              <p className="font-mono text-[10px] text-white/40 uppercase">{top3.referrals} Referrals Completed</p>
            </motion.div>

          </div>

          {/* P4 & P5 Cards (Top 5 Finishes) */}
          <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <div className="bg-[#0e0e14] border border-white/10 rounded-xl p-5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center font-mono font-black text-sm text-white/80">
                  4
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase text-white/40 tracking-wider block font-semibold">🎖️ 4th Place Finalist</span>
                  <h4 className="font-sans font-black italic uppercase text-lg text-white">{top4.name}</h4>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xl font-black text-aws-orange">{top4.total_points} <span className="text-[10px] text-white/40 font-normal">PTS</span></div>
                <div className="text-[10px] text-white/40 uppercase">{top4.referrals} Referrals</div>
              </div>
            </div>

            <div className="bg-[#0e0e14] border border-white/10 rounded-xl p-5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center font-mono font-black text-sm text-white/80">
                  5
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase text-white/40 tracking-wider block font-semibold">🎖️ 5th Place Finalist</span>
                  <h4 className="font-sans font-black italic uppercase text-lg text-white truncate max-w-[170px] sm:max-w-[200px]">
                    {top5.name}
                  </h4>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xl font-black text-aws-orange">{top5.total_points} <span className="text-[10px] text-white/40 font-normal">PTS</span></div>
                <div className="text-[10px] text-white/40 uppercase">{top5.referrals} Referrals</div>
              </div>
            </div>
          </div>

          {/* Individual Participant Lookup Card */}
          <div className="w-full max-w-md bg-[#0d0d0d]/90 border border-white/10 rounded-2xl p-6 sm:p-8 mb-12 shadow-xl backdrop-blur-md">
            <div className="text-center mb-5">
              <span className="font-mono text-[10px] text-aws-orange uppercase tracking-[0.2em] font-bold block mb-1">
                Participant Results
              </span>
              <h3 className="font-sans font-black italic text-lg uppercase tracking-tight text-white">
                Check Your Final Points
              </h3>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="email" className="block font-mono text-xs text-white/50 uppercase tracking-[0.2em] mb-2 font-semibold">
                  Registration Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 pl-11 font-mono text-sm text-white placeholder-white/20 focus:outline-none focus:border-aws-orange focus:ring-1 focus:ring-aws-orange transition-colors"
                    required
                  />
                  <Mail className="absolute left-3.5 top-3.5 text-white/30 w-4 h-4" />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-aws-orange text-black py-3.5 rounded-lg font-mono text-sm uppercase tracking-widest font-bold hover:bg-white transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Searching Results...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    View Final Tally
                  </>
                )}
              </button>
            </form>

            {/* Search Error */}
            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-lg text-xs font-mono text-center">
                {error}
              </div>
            )}
          </div>

          {/* Dashboard Results */}
          <AnimatePresence mode="wait">
            {data && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full space-y-8 mb-12"
              >
                {/* Scoreboard Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
                  <div className="bg-gradient-to-br from-[#111]/80 to-[#0a0a0a]/80 border border-white/5 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden backdrop-blur-sm">
                    <p className="font-mono text-xs text-white/50 uppercase tracking-[0.2em] mb-1 font-semibold">Total Verified Points</p>
                    <p className="font-sans font-black italic text-5xl text-emerald-400">{data.total_points}</p>
                    <p className="font-mono text-[10px] text-white/30 uppercase mt-2">25 PTS per attendee</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#111]/80 to-[#0a0a0a]/80 border border-white/5 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden backdrop-blur-sm">
                    <p className="font-mono text-xs text-white/50 uppercase tracking-[0.2em] mb-1 font-semibold">Total Referrals</p>
                    <p className="font-sans font-black italic text-5xl text-aws-orange">{data.referral_count}</p>
                    <p className="font-mono text-[10px] text-white/30 uppercase mt-2">Friends registered</p>
                  </div>
                </div>

                {/* Campaign Concluded Note for User */}
                <div className="max-w-2xl mx-auto w-full bg-gradient-to-br from-[#12121a] to-[#0a0a10] border border-white/10 rounded-2xl p-6 shadow-xl text-center">
                  <div className="inline-flex items-center justify-center p-2.5 bg-emerald-500/10 rounded-full border border-emerald-500/30 text-emerald-400 mb-3">
                    <CheckCircle2 size={20} />
                  </div>
                  <h4 className="font-sans font-black italic text-lg uppercase text-white mb-2">
                    Thank You For Participating!
                  </h4>
                  <p className="font-mono text-xs text-white/60 leading-relaxed max-w-md mx-auto">
                    Your referral code was <span className="text-aws-orange font-bold font-mono">{data.referral_code}</span>. All points and referrals are locked and recorded for official event awards and swag distribution.
                  </p>
                </div>

                {/* Referral History List */}
                <div className="max-w-2xl mx-auto w-full bg-[#0d0d0d]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md overflow-hidden">
                  <h3 className="font-sans font-black italic text-lg uppercase tracking-tight text-white mb-6">
                    Referral Breakdown
                  </h3>

                  {data.referrals.length === 0 ? (
                    <div className="text-center py-10 border border-white/5 border-dashed rounded-xl">
                      <p className="font-mono text-xs text-white/40 uppercase tracking-widest">No referrals recorded on this pass</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-64 no-scrollbar">
                      <table className="w-full text-left font-mono text-sm">
                        <thead>
                          <tr className="border-b border-white/10 text-white/50 uppercase text-xs tracking-wider sticky top-0 bg-[#0d0d0d] z-10 font-bold">
                            <th className="pb-3 font-semibold">Attendee</th>
                            <th className="pb-3 font-semibold">Pass Type</th>
                            <th className="pb-3 font-semibold text-right">Points</th>
                            <th className="pb-3 font-semibold text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {data.referrals.map((ref, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 text-white/90">{ref.email}</td>
                              <td className="py-3 text-white/60">{ref.pass_name}</td>
                              <td className="py-3 text-emerald-400 font-bold text-right">+{ref.points}</td>
                              <td className="py-3 text-white/40 text-right">{formatDate(ref.date)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Full Final Standings Grid (Bottom Leaderboard) */}
          <div className="w-full max-w-4xl bg-[#0c0c12]/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md font-sans mb-6">
            {/* HUD Header */}
            <div className="bg-[#08080c] px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Trophy size={18} className="text-aws-orange" />
                <span className="font-sans font-black italic text-base sm:text-lg text-white tracking-wider uppercase">
                  Final Standings & Complete Grid
                </span>
              </div>
              <div className="flex items-center gap-2">
                {leaderboard.length > 0 && (
                  <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 font-bold uppercase">
                    {leaderboard.length} Referrers
                  </span>
                )}
                <div className="flex items-center gap-1.5 ml-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest font-semibold">CONCLUDED</span>
                </div>
              </div>
            </div>

            {/* Leaderboard Rows */}
            <div className="p-4 sm:p-6 space-y-2.5">
              <div className="font-mono text-[11px] text-white/40 uppercase tracking-[0.2em] mb-2 font-semibold flex items-center justify-between">
                <span>Leaderboard Ranks</span>
                <span className="text-aws-orange text-[10px] font-bold">ALL PARTICIPANTS</span>
              </div>

              {leaderboardLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-aws-orange" size={24} />
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => {
                    const isLeader = index === 0;
                    const isPodium = index < 3;
                    const nameHoverColor = isLeader ? 'group-hover:text-[#E10600]' : 'group-hover:text-aws-orange';
                    const pointsColorClass = isLeader ? 'text-[#E10600]' : isPodium ? 'text-aws-orange' : 'text-white/80';

                    return (
                      <div 
                        key={index} 
                        className={`group flex items-center border rounded-lg overflow-hidden h-11 transition-all duration-300 hover:translate-x-1 ${
                          index === 0 ? 'bg-aws-orange/[0.08] border-aws-orange/40 hover:border-aws-orange' :
                          index === 1 ? 'bg-slate-500/[0.06] border-slate-400/30 hover:border-slate-300' :
                          index === 2 ? 'bg-amber-700/[0.06] border-amber-600/30 hover:border-amber-500' :
                          'bg-[#0e0e13]/85 hover:bg-[#161622]/90 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div 
                          className={`w-11 sm:w-12 h-full flex items-center justify-center font-mono text-sm sm:text-base font-black select-none transition-colors duration-300 shrink-0 ${
                            index === 0 ? 'bg-[#FFD700] text-black font-black' :
                            index === 1 ? 'bg-slate-300 text-black font-black' :
                            index === 2 ? 'bg-amber-600 text-white font-black' :
                            'bg-zinc-800 group-hover:bg-zinc-700 text-white/70 group-hover:text-white'
                          }`}
                        >
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </div>

                        <div 
                          className={`w-1.5 h-full transition-transform duration-300 group-hover:scale-y-110 shrink-0 ${
                            isLeader 
                              ? 'bg-[#E10600]'
                              : entry.pass?.toLowerCase().includes('vip') 
                                ? 'bg-emerald-500' 
                                : 'bg-aws-orange'
                          }`} 
                        />

                        <div className="flex-1 px-3 sm:px-4 flex items-center justify-between min-w-0 h-full bg-chequered bg-chequered-hover transition-all duration-300">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <span className={`font-sans font-black italic uppercase tracking-wider text-white/95 truncate transition-colors duration-300 text-xs sm:text-sm ${nameHoverColor}`}>
                              {entry.name}
                            </span>
                            {index === 0 && (
                              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#FFD700]/20 border border-[#FFD700]/40 font-mono text-[9px] font-bold text-[#FFD700] uppercase tracking-wider">
                                Champion
                              </span>
                            )}
                            {index > 0 && index < 5 && (
                              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[9px] font-bold text-white/50 uppercase tracking-wider">
                                Top 5
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                            <span className="hidden sm:inline-block font-mono text-xs text-white/40">
                              {entry.referrals} {entry.referrals === 1 ? 'ref' : 'refs'}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className={`font-mono font-black text-sm sm:text-base group-hover:scale-105 transition-all duration-300 ${pointsColorClass}`}>
                                {entry.total_points}
                              </span>
                              <span className="font-mono text-[9px] sm:text-[10px] font-bold text-white/40">PTS</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-white/5 bg-[#08080c]/50 flex items-center justify-between font-mono text-[10px] text-white/50 uppercase tracking-widest font-semibold">
              <span>GP: DHULE 2026</span>
              <span className="text-emerald-400">OFFICIAL ARCHIVE</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-[#0a0a0a]/60 py-6 text-center relative z-10 mt-auto flex flex-col items-center gap-2">
          <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest">
            AWS Student Community Day Dhule 2026 • Race to the Cloud
          </p>
          <Link 
            to="/codeofconduct" 
            className="font-mono text-[9px] text-aws-orange hover:text-white uppercase tracking-widest transition-colors underline underline-offset-4"
          >
            Terms & Conditions / Code of Conduct
          </Link>
        </footer>
      </div>
    </div>
  );
}
