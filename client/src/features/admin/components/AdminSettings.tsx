import { useState, useEffect } from 'react';
import {
  Loader2,
  BarChart3,
  Ticket,
  Users,
  Download,
  Mail,
  ShoppingBag,
  Mic,
  Handshake,
  Building2,
  Tag,
  UserCheck,
  Gift,
  UserPlus,
  Star,
  CheckSquare,
  Square
} from 'lucide-react';
import { api } from '../../../lib/api';


const getHeaders = () => ({
  'X-Admin-Key': sessionStorage.getItem('scd_admin_key') || ''
});

export const ALL_SIDEBAR_TABS = [
  { key: 'overview', label: 'Overview & Analytics', icon: BarChart3, category: 'Dashboard' },
  { key: 'merch', label: 'Merchandise Orders & Inventory', icon: ShoppingBag, category: 'E-Commerce' },
  { key: 'registrations', label: 'Registrations & Attendees', icon: Users, category: 'Ticketing' },
  { key: 'passes', label: 'Pass Types & Pricing', icon: Ticket, category: 'Ticketing' },
  { key: 'generate-pass', label: 'Generate Offline Pass', icon: UserPlus, category: 'Ticketing' },
  { key: 'promo', label: 'Promo Codes & Discounts', icon: Tag, category: 'Sales' },
  { key: 'referrals', label: 'Referral Leaderboard', icon: Gift, category: 'Sales' },
  { key: 'feedback', label: 'Event Feedback Responses', icon: Star, category: 'Community' },
  { key: 'speakers', label: 'CFP Speakers', icon: Mic, category: 'Management' },
  { key: 'partners', label: 'Community Partners', icon: Handshake, category: 'Management' },
  { key: 'sponsors', label: 'Event Sponsors', icon: Building2, category: 'Management' },
  { key: 'volunteers', label: 'Volunteers Applications', icon: UserCheck, category: 'Management' },
  { key: 'mpd', label: 'MPD Panelists', icon: Mic, category: 'Management' },
  { key: 'shoutout', label: 'Email Shoutout & Broadcast', icon: Mail, category: 'Outreach' },
  { key: 'export', label: 'Export Data (CSV)', icon: Download, category: 'Tools' },
];

export const AdminSettings = () => {
  const [registrationEnabled, setRegistrationEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sidebar visible tabs state
  const [visibleTabs, setVisibleTabs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('scd_admin_sidebar_views');
      return saved ? JSON.parse(saved) : ALL_SIDEBAR_TABS.map((t) => t.key);
    } catch {
      return ALL_SIDEBAR_TABS.map((t) => t.key);
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/admin/settings', { headers: getHeaders() });
      setRegistrationEnabled(!!res.data?.registration_enabled);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };


  const toggleRegistration = async () => {
    setSaving(true);
    try {
      const res = await api.put('/api/admin/settings', 
        { registration_enabled: !registrationEnabled },
        { headers: getHeaders() }
      );
      setRegistrationEnabled(res.data.registration_enabled);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleTabVisibility = (tabKey: string) => {
    const updated = visibleTabs.includes(tabKey)
      ? visibleTabs.filter((k) => k !== tabKey)
      : [...visibleTabs, tabKey];
    
    setVisibleTabs(updated);
    localStorage.setItem('scd_admin_sidebar_views', JSON.stringify(updated));
    window.dispatchEvent(new Event('scd_admin_sidebar_changed'));
  };

  const handleSelectAllTabs = () => {
    const all = ALL_SIDEBAR_TABS.map((t) => t.key);
    setVisibleTabs(all);
    localStorage.setItem('scd_admin_sidebar_views', JSON.stringify(all));
    window.dispatchEvent(new Event('scd_admin_sidebar_changed'));
  };

  const handleResetDefaultTabs = () => {
    const defaults = ALL_SIDEBAR_TABS.map((t) => t.key);
    setVisibleTabs(defaults);
    localStorage.setItem('scd_admin_sidebar_views', JSON.stringify(defaults));
    window.dispatchEvent(new Event('scd_admin_sidebar_changed'));
  };


  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-aws-orange" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* 1. Global Application State */}
      <div className="bg-[#111] border border-white/5 p-6 sm:p-8 rounded-xl shadow-xl">
        <h3 className="font-sans font-black italic text-lg uppercase tracking-tight text-white mb-1">
          Global Registration State
        </h3>
        <p className="font-mono text-xs text-white/40 mb-6">
          Manage ticket registration availability across the public portal.
        </p>

        <div className="flex items-start md:items-center justify-between gap-4 border-t border-white/5 pt-6">
          <div className="flex-1">
            <h4 className="text-sm text-white font-bold">Ticket Registrations</h4>
            <p className="text-xs text-white/40 mt-1">
              When disabled, the website displays "OPENING SOON" and temporarily halts ticket purchases.
            </p>
          </div>
          <button
            aria-label="Toggle ticket registrations"
            type="button"
            onClick={toggleRegistration}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 cursor-pointer ${
              registrationEnabled ? 'bg-aws-orange' : 'bg-white/10'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                registrationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. Admin Sidebar Navigation Views Manager */}
      <div className="bg-[#111] border border-white/5 p-6 sm:p-8 rounded-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
          <div>
            <h3 className="font-sans font-black italic text-lg uppercase tracking-tight text-white mb-1">
              Admin Sidebar Navigation Views
            </h3>
            <p className="font-mono text-xs text-white/40">
              Only selected views will appear in your admin navigation bar. Unchecked items are hidden for a clutter-free view.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={handleSelectAllTabs}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleResetDefaultTabs}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {ALL_SIDEBAR_TABS.map((tab) => {
            const isChecked = visibleTabs.includes(tab.key);
            const Icon = tab.icon;
            return (
              <label
                key={tab.key}
                onClick={() => toggleTabVisibility(tab.key)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                  isChecked
                    ? 'bg-aws-orange/10 border-aws-orange/40 text-white'
                    : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05]'
                }`}
              >
                <div className={isChecked ? 'text-aws-orange' : 'text-white/30'}>
                  {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                </div>
                <Icon size={15} className={isChecked ? 'text-aws-orange' : 'text-white/40'} />
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-xs font-bold block truncate">
                    {tab.label}
                  </span>
                  <span className="font-mono text-[9px] text-white/30 uppercase block">
                    {tab.category}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        <p className="font-mono text-[10px] text-white/30 mt-4">
          Note: "Settings" tab is permanently pinned for ongoing configuration access.
        </p>
      </div>
    </div>
  );
};


