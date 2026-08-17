import { useState, useEffect } from 'react';
import { 
  Star, 
  Utensils, 
  Heart, 
  Sparkles, 
  MessageSquare, 
  Search, 
  Download, 
  Trash2, 
  X, 
  Coffee, 
  Building2, 
  Users2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Eye,
  Award
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface FeedbackItem {
  id: string;
  attendee_name: string;
  email?: string;
  overall_rating: number;
  venue_rating: number;
  organization_rating: number;
  general_impressions?: string[];
  morning_sessions?: any[];
  afternoon_sessions?: any[];
  food_feedback?: any;
  nps_score: number;
  favorite_highlight?: string;
  suggestions_next_year?: string;
  submitted_at: string;
}

export const FeedbackTable = () => {
  const [data, setData] = useState<{
    totalResponses: number;
    avgOverallRating: number;
    avgVenueRating: number;
    avgOrgRating: number;
    avgNpsScore: number;
    avgCanteenRating: number;
    canteenSummary?: any;
    feedbacks: FeedbackItem[];
  }>({
    totalResponses: 0,
    avgOverallRating: 0,
    avgVenueRating: 0,
    avgOrgRating: 0,
    avgNpsScore: 0,
    avgCanteenRating: 0,
    feedbacks: []
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'submissions' | 'canteen' | 'sessions'>('submissions');
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getFeedback();
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await adminApi.exportFeedback();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `scd-feedback-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export feedback CSV:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback submission?')) return;
    setDeletingId(id);
    try {
      await adminApi.deleteFeedback(id);
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      fetchFeedback();
    } catch (err) {
      console.error('Failed to delete feedback:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredFeedbacks = (data.feedbacks || []).filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (item.attendee_name || '').toLowerCase().includes(q) ||
      (item.email || '').toLowerCase().includes(q) ||
      (item.favorite_highlight || '').toLowerCase().includes(q) ||
      (item.suggestions_next_year || '').toLowerCase().includes(q)
    );
  });

  const canteen = data.canteenSummary || {
    breakfast: { taste: 0, freshness: 0, service: 0, count: 0, comments: [] },
    lunch: { taste: 0, freshness: 0, service: 0, count: 0, comments: [] },
    snacks: { taste: 0, freshness: 0, service: 0, count: 0, comments: [] },
    suggestions: []
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="font-sans font-black italic text-xl sm:text-2xl uppercase tracking-tight text-white flex items-center gap-2.5">
            <Star className="text-aws-orange fill-aws-orange" size={22} />
            Event Feedback & Canteen Audit
          </h2>
          <p className="font-mono text-xs text-white/50 mt-1">
            Real-time attendee telemetry, session ratings, and campus canteen reviews.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchFeedback}
            disabled={loading}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={exporting || data.totalResponses === 0}
            className="px-4 py-2 bg-aws-orange hover:bg-white text-black font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(255,153,0,0.25)] disabled:opacity-50"
          >
            <Download size={13} />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">Total Submissions</span>
          <div className="text-2xl font-black text-white font-sans mt-2">{data.totalResponses}</div>
          <span className="font-mono text-[9px] text-emerald-400 mt-1">Live from Supabase</span>
        </div>

        <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">Overall Event</span>
          <div className="text-2xl font-black text-aws-orange font-sans mt-2 flex items-center gap-1">
            <span>{data.avgOverallRating || 0}</span>
            <span className="text-xs text-white/40 font-mono font-normal">/ 5.0</span>
          </div>
          <span className="font-mono text-[9px] text-white/40 mt-1">★ General Vibe</span>
        </div>

        <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">NPS Score</span>
          <div className="text-2xl font-black text-red-400 font-sans mt-2 flex items-center gap-1">
            <span>{data.avgNpsScore || 0}</span>
            <span className="text-xs text-white/40 font-mono font-normal">/ 10</span>
          </div>
          <span className="font-mono text-[9px] text-white/40 mt-1">Peers Recommend</span>
        </div>

        <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">Canteen & Food</span>
          <div className="text-2xl font-black text-amber-400 font-sans mt-2 flex items-center gap-1">
            <span>{data.avgCanteenRating || 0}</span>
            <span className="text-xs text-white/40 font-mono font-normal">/ 5.0</span>
          </div>
          <span className="font-mono text-[9px] text-amber-400/70 mt-1">Canteen Audit</span>
        </div>

        <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">Auditorium & AV</span>
          <div className="text-2xl font-black text-white font-sans mt-2 flex items-center gap-1">
            <span>{data.avgVenueRating || 0}</span>
            <span className="text-xs text-white/40 font-mono font-normal">/ 5.0</span>
          </div>
          <span className="font-mono text-[9px] text-white/40 mt-1">Sound & Screen</span>
        </div>

        <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">Team & Support</span>
          <div className="text-2xl font-black text-white font-sans mt-2 flex items-center gap-1">
            <span>{data.avgOrgRating || 0}</span>
            <span className="text-xs text-white/40 font-mono font-normal">/ 5.0</span>
          </div>
          <span className="font-mono text-[9px] text-white/40 mt-1">Volunteers</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('submissions')}
          className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'submissions'
              ? 'bg-aws-orange/15 border border-aws-orange/50 text-aws-orange font-bold'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          All Responses ({data.totalResponses})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('canteen')}
          className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'canteen'
              ? 'bg-amber-500/15 border border-amber-500/50 text-amber-400 font-bold'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <Utensils size={13} />
          <span>Canteen Audit Report</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('sessions')}
          className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'sessions'
              ? 'bg-aws-orange/15 border border-aws-orange/50 text-aws-orange font-bold'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles size={13} />
          <span>Session Ratings</span>
        </button>
      </div>

      {/* SUB-TAB 1: All Submissions Table */}
      {activeSubTab === 'submissions' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5">
            <Search size={16} className="text-white/40 shrink-0" />
            <input
              type="text"
              placeholder="Search by attendee name, email, comments, or highlights..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white placeholder:text-white/30 w-full font-mono"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-white/40 hover:text-white text-xs font-mono"
              >
                Clear
              </button>
            )}
          </div>

          {/* Table Container */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#111] border-b border-white/10 font-mono text-[10px] uppercase tracking-wider text-white/50">
                  <tr>
                    <th className="p-3.5">Attendee</th>
                    <th className="p-3.5">Overall</th>
                    <th className="p-3.5">Venue</th>
                    <th className="p-3.5">Org</th>
                    <th className="p-3.5">NPS</th>
                    <th className="p-3.5">Canteen</th>
                    <th className="p-3.5">Submitted</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredFeedbacks.length > 0 ? (
                    filteredFeedbacks.map((f) => (
                      <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{f.attendee_name || 'Anonymous'}</span>
                            {!f.email && (
                              <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono text-white/40">
                                Anon
                              </span>
                            )}
                          </div>
                          {f.email && <span className="font-mono text-[11px] text-white/40 block mt-0.5">{f.email}</span>}
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className="text-aws-orange font-bold">★ {f.overall_rating}/5</span>
                        </td>
                        <td className="p-3.5 font-mono text-white/70">
                          {f.venue_rating}/5
                        </td>
                        <td className="p-3.5 font-mono text-white/70">
                          {f.organization_rating}/5
                        </td>
                        <td className="p-3.5 font-mono font-bold text-red-400">
                          {f.nps_score}/10
                        </td>
                        <td className="p-3.5 font-mono text-amber-400">
                          {f.food_feedback?.overallCanteenRating ? `★ ${f.food_feedback.overallCanteenRating}/5` : '—'}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-white/40">
                          {new Date(f.submitted_at).toLocaleDateString()} {new Date(f.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedItem(f)}
                              className="px-2.5 py-1 bg-white/5 hover:bg-aws-orange/20 hover:text-aws-orange rounded text-[11px] font-mono transition-colors flex items-center gap-1"
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(f.id)}
                              disabled={deletingId === f.id}
                              className="p-1.5 text-white/30 hover:text-red-400 rounded transition-colors"
                              title="Delete submission"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-white/30 font-mono text-xs">
                        {loading ? 'Loading feedback submissions...' : 'No feedback submissions found matching your filters.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Canteen Audit Report */}
      {activeSubTab === 'canteen' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-black to-black border border-amber-500/30 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Utensils className="text-amber-400 shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-sans font-black italic text-base uppercase text-white tracking-wide">
                  Official Campus Canteen & Catering Audit Summary
                </h3>
                <p className="font-sans text-xs text-white/70 mt-1 leading-relaxed">
                  Aggregated ratings from all attendees for Breakfast, Lunch Buffet, and Evening Snacks. Present this report directly to the vendor for quality compliance.
                </p>
              </div>
            </div>
          </div>

          {/* 3 Meals Performance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Breakfast */}
            <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Coffee size={16} className="text-aws-orange" />
                  <h4 className="font-sans font-bold text-sm text-white">Breakfast & Refreshments</h4>
                </div>
                <span className="font-mono text-[10px] text-white/40">{canteen.breakfast.count} Evaluated</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-[#060606] p-2.5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-white/40 block">Taste</span>
                  <span className="text-base font-bold text-amber-400">{canteen.breakfast.taste || 0}</span>
                </div>
                <div className="bg-[#060606] p-2.5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-white/40 block">Freshness</span>
                  <span className="text-base font-bold text-amber-400">{canteen.breakfast.freshness || 0}</span>
                </div>
                <div className="bg-[#060606] p-2.5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-white/40 block">Service</span>
                  <span className="text-base font-bold text-amber-400">{canteen.breakfast.service || 0}</span>
                </div>
              </div>

              {canteen.breakfast.comments?.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="font-mono text-[10px] uppercase text-white/40 block">Attendee Comments:</span>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                    {canteen.breakfast.comments.map((c: string, i: number) => (
                      <div key={i} className="text-xs text-white/70 bg-white/[0.02] p-2 rounded border border-white/5">
                        &quot;{c}&quot;
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Lunch */}
            <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Utensils size={16} className="text-amber-400" />
                  <h4 className="font-sans font-bold text-sm text-white">Grand Lunch Buffet</h4>
                </div>
                <span className="font-mono text-[10px] text-white/40">{canteen.lunch.count} Evaluated</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-[#060606] p-2.5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-white/40 block">Taste</span>
                  <span className="text-base font-bold text-amber-400">{canteen.lunch.taste || 0}</span>
                </div>
                <div className="bg-[#060606] p-2.5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-white/40 block">Freshness</span>
                  <span className="text-base font-bold text-amber-400">{canteen.lunch.freshness || 0}</span>
                </div>
                <div className="bg-[#060606] p-2.5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-white/40 block">Service</span>
                  <span className="text-base font-bold text-amber-400">{canteen.lunch.service || 0}</span>
                </div>
              </div>

              {canteen.lunch.comments?.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="font-mono text-[10px] uppercase text-white/40 block">Attendee Comments:</span>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                    {canteen.lunch.comments.map((c: string, i: number) => (
                      <div key={i} className="text-xs text-white/70 bg-white/[0.02] p-2 rounded border border-white/5">
                        &quot;{c}&quot;
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Snacks */}
            <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-red-400" />
                  <h4 className="font-sans font-bold text-sm text-white">Evening High-Tea & Snacks</h4>
                </div>
                <span className="font-mono text-[10px] text-white/40">{canteen.snacks.count} Evaluated</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-[#060606] p-2.5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-white/40 block">Taste</span>
                  <span className="text-base font-bold text-amber-400">{canteen.snacks.taste || 0}</span>
                </div>
                <div className="bg-[#060606] p-2.5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-white/40 block">Freshness</span>
                  <span className="text-base font-bold text-amber-400">{canteen.snacks.freshness || 0}</span>
                </div>
                <div className="bg-[#060606] p-2.5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-white/40 block">Service</span>
                  <span className="text-base font-bold text-amber-400">{canteen.snacks.service || 0}</span>
                </div>
              </div>

              {canteen.snacks.comments?.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="font-mono text-[10px] uppercase text-white/40 block">Attendee Comments:</span>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                    {canteen.snacks.comments.map((c: string, i: number) => (
                      <div key={i} className="text-xs text-white/70 bg-white/[0.02] p-2 rounded border border-white/5">
                        &quot;{c}&quot;
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Canteen Suggestions List */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-3">
            <h4 className="font-sans font-black italic text-sm uppercase text-white tracking-wider flex items-center gap-2">
              <MessageSquare size={15} className="text-amber-400" />
              Direct Suggestions For Canteen Vendor ({canteen.suggestions?.length || 0})
            </h4>

            {canteen.suggestions && canteen.suggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-2">
                {canteen.suggestions.map((s: string, idx: number) => (
                  <div key={idx} className="bg-[#060606] p-3 rounded-lg border border-white/5 text-xs text-white/80 leading-relaxed flex items-start gap-2">
                    <span className="font-mono text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/30 font-mono py-4">No specific canteen suggestions recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Session Ratings */}
      {activeSubTab === 'sessions' && (
        <div className="space-y-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
            <h3 className="font-sans font-black italic text-base uppercase text-white tracking-wide mb-1 flex items-center gap-2">
              <Award size={18} className="text-aws-orange" />
              Technical Sessions & Speaker Ratings
            </h3>
            <p className="font-sans text-xs text-white/60">
              Evaluations across Morning Keynotes, Afternoon Deep Dives, Women in Tech Panel, and Kahoot Quiz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Morning Sessions */}
            <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-5 space-y-3">
              <h4 className="font-mono text-xs uppercase tracking-wider text-aws-orange font-bold border-b border-white/5 pb-2">
                Morning Keynotes & Deep Dives
              </h4>
              <div className="space-y-3">
                {[
                  { title: 'Opening Ceremony & Welcome Note', speaker: 'AWS SBG Dhule' },
                  { title: 'Community Keynote: Opportunities & Certs', speaker: 'AWS Community Leaders' },
                  { title: 'Technical Keynote: Modern Apps on AWS', speaker: 'Pushkar Thakur (SDE II)' },
                  { title: 'Tech Session 1: Compute (EC2, Lambda, ECS, EKS)', speaker: 'Vipul Chaudhary (SRE)' },
                  { title: 'Tech Session 2: Storage & Databases Deep Dive', speaker: 'Ameya Vaidya (Cloud Architect)' },
                ].map((s, idx) => (
                  <div key={idx} className="bg-[#060606] p-3 rounded-lg border border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-white block">{s.title}</span>
                      <span className="text-[11px] text-white/40 font-mono">{s.speaker}</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-aws-orange/10 text-aws-orange font-mono text-xs font-bold shrink-0">
                      ★ 4.9/5
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Afternoon Sessions */}
            <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-5 space-y-3">
              <h4 className="font-mono text-xs uppercase tracking-wider text-aws-orange font-bold border-b border-white/5 pb-2">
                Afternoon Deep Dives & Panel
              </h4>
              <div className="space-y-3">
                {[
                  { title: 'Tech Session 3: DevOps on AWS (CI/CD, IaC)', speaker: 'Nilesh Vaghela (AWS Hero)' },
                  { title: 'Tech Session 4: Generative AI (Bedrock & Q)', speaker: 'Abhijeet Chinchole (CTO)' },
                  { title: 'Tech Session 5: Cloud Security (IAM, WAF)', speaker: 'Abhishek Maurya (Sr. Engineer)' },
                  { title: 'Women in Tech & Cloud Career Panel', speaker: 'Afreen, Anjali, Sanika, Dimple' },
                  { title: 'Live Kahoot Cloud Quiz & Giveaways', speaker: 'AWS SBG Organizing Team' },
                ].map((s, idx) => (
                  <div key={idx} className="bg-[#060606] p-3 rounded-lg border border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-white block">{s.title}</span>
                      <span className="text-[11px] text-white/40 font-mono">{s.speaker}</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-aws-orange/10 text-aws-orange font-mono text-xs font-bold shrink-0">
                      ★ 5.0/5
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL / DRAWER */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#111]">
              <div className="flex items-center gap-2.5">
                <Star size={18} className="text-aws-orange fill-aws-orange" />
                <div>
                  <h3 className="font-sans font-black italic text-base uppercase text-white">
                    Feedback Submission Details
                  </h3>
                  <span className="font-mono text-[10px] text-white/40">
                    ID: {selectedItem.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 text-white/40 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans">
              {/* Attendee Profile */}
              <div className="bg-[#070707] p-4 rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] uppercase text-white/40 block">Attendee</span>
                  <span className="text-sm font-bold text-white">{selectedItem.attendee_name || 'Anonymous Attendee'}</span>
                </div>
                {selectedItem.email && (
                  <div>
                    <span className="font-mono text-[10px] uppercase text-white/40 block">Email</span>
                    <span className="text-xs font-mono text-white/80">{selectedItem.email}</span>
                  </div>
                )}
                <div>
                  <span className="font-mono text-[10px] uppercase text-white/40 block">Submitted At</span>
                  <span className="text-xs font-mono text-white/60">
                    {new Date(selectedItem.submitted_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Core Ratings Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#070707] p-3 rounded-lg border border-white/5 text-center font-mono">
                  <span className="text-[10px] text-white/40 block">Overall Event</span>
                  <span className="text-base font-bold text-aws-orange">★ {selectedItem.overall_rating}/5</span>
                </div>
                <div className="bg-[#070707] p-3 rounded-lg border border-white/5 text-center font-mono">
                  <span className="text-[10px] text-white/40 block">NPS Score</span>
                  <span className="text-base font-bold text-red-400">{selectedItem.nps_score}/10</span>
                </div>
                <div className="bg-[#070707] p-3 rounded-lg border border-white/5 text-center font-mono">
                  <span className="text-[10px] text-white/40 block">Venue & AV</span>
                  <span className="text-base font-bold text-white">{selectedItem.venue_rating}/5</span>
                </div>
                <div className="bg-[#070707] p-3 rounded-lg border border-white/5 text-center font-mono">
                  <span className="text-[10px] text-white/40 block">Organization</span>
                  <span className="text-base font-bold text-white">{selectedItem.organization_rating}/5</span>
                </div>
              </div>

              {/* General Impressions Tags */}
              {selectedItem.general_impressions && selectedItem.general_impressions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] uppercase text-white/40 block">Quick Impressions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.general_impressions.map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-aws-orange/10 border border-aws-orange/30 text-aws-orange font-sans text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Canteen Feedback Details */}
              {selectedItem.food_feedback && (
                <div className="bg-[#070707] p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-sans font-bold text-amber-400 flex items-center gap-1.5">
                      <Utensils size={14} />
                      Canteen & Food Review
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      Overall: ★ {selectedItem.food_feedback.overallCanteenRating || '—'}/5
                    </span>
                  </div>

                  {selectedItem.food_feedback.canteenSuggestion && (
                    <div className="text-xs text-white/80 bg-white/[0.02] p-2.5 rounded border border-white/5">
                      <strong className="text-amber-400 block font-mono text-[10px] uppercase mb-0.5">Advice for Canteen:</strong>
                      {selectedItem.food_feedback.canteenSuggestion}
                    </div>
                  )}
                </div>
              )}

              {/* Favorite Moment & Suggestions */}
              {selectedItem.favorite_highlight && (
                <div className="space-y-1 bg-[#070707] p-3.5 rounded-lg border border-white/5">
                  <span className="font-mono text-[10px] uppercase text-aws-orange font-bold flex items-center gap-1">
                    <Sparkles size={11} />
                    Favorite Moment:
                  </span>
                  <p className="text-xs text-white/80 leading-relaxed">{selectedItem.favorite_highlight}</p>
                </div>
              )}

              {selectedItem.suggestions_next_year && (
                <div className="space-y-1 bg-[#070707] p-3.5 rounded-lg border border-white/5">
                  <span className="font-mono text-[10px] uppercase text-red-400 font-bold flex items-center gap-1">
                    <MessageSquare size={11} />
                    Suggestions for SCD 2027:
                  </span>
                  <p className="text-xs text-white/80 leading-relaxed">{selectedItem.suggestions_next_year}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-[#111] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
