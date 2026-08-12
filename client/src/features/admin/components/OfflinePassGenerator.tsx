import { useState, useEffect } from 'react';
import { Ticket, Send, CheckCircle, AlertCircle, Loader2, RotateCcw, ExternalLink, Copy, Check } from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface PassType {
  id: string;
  name: string;
  slug: string;
  price: number;
  available: number;
  badge_color: string;
}

interface FormData {
  pass_type_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'student' | 'professional';
  organization: string;
  received_by: string;
}

const sanitizePhone = (val: string): string => {
  let str = val.trim();
  if (str.startsWith('+91')) {
    str = str.slice(3);
  } else if (str.startsWith('0')) {
    str = str.slice(1);
  }
  let digits = str.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
};

const initialForm: FormData = {
  pass_type_id: '',
  full_name: '',
  email: '',
  phone: '',
  role: 'student',
  organization: '',
  received_by: 'Soham Chaudhari',
};

export function OfflinePassGenerator() {
  const [passes, setPasses] = useState<PassType[]>([]);
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [passesLoading, setPassesLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState<{
    ticket_number: string;
    order_id: string;
    registration_id: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    organization: string;
    pass_name: string;
    received_by: string;
  } | null>(null);

  useEffect(() => {
    adminApi.getPasses().then(res => {
      setPasses(res.data);
      setPassesLoading(false);
    }).catch(() => setPassesLoading(false));
  }, []);

  const selectedPass = passes.find(p => p.id === form.pass_type_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!form.pass_type_id || !form.full_name || !form.email || !form.phone || !form.organization || !form.received_by) {
      setError('All fields including Receiver / Organizer Name are required.');
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError('Phone must be a 10-digit number.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminApi.generateOfflinePass(form);
      setSuccess({
        ticket_number: res.data.ticket_number,
        order_id: res.data.order_id,
        registration_id: res.data.registration_id,
        full_name: res.data.full_name,
        email: res.data.email,
        phone: res.data.phone,
        role: res.data.role,
        organization: res.data.organization,
        pass_name: res.data.pass_name || selectedPass?.name || 'OFFLINE PASS',
        received_by: res.data.received_by || form.received_by,
      });
      setForm(initialForm);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to generate pass. Try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setError('');
    setSuccess(null);
    setCopied(false);
  };

  if (success) {
    const ticketUrl = `${window.location.origin}/ticket/${success.registration_id}`;

    const handleCopy = () => {
      navigator.clipboard.writeText(ticketUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-[#0a1a0a] border-2 border-emerald-500/40 rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_40px_rgba(16,185,129,0.15)]">
          <CheckCircle size={52} className="text-emerald-400 mx-auto mb-3" />
          <h3 className="font-sans font-black italic text-2xl uppercase tracking-tight text-white mb-1">
            Pass Generated & Sent!
          </h3>
          <p className="font-mono text-xs text-emerald-400/80 mb-6">
            ✓ Ticket generated successfully & confirmation email sent to <span className="font-bold text-white">{success.email}</span>
          </p>

          {/* Ticket Card Preview */}
          <div className="bg-[#111] border-2 border-emerald-500/30 rounded-xl p-5 mb-6 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/20 border-b border-l border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest rounded-bl-lg">
              {success.pass_name}
            </div>

            <div className="mb-4">
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Ticket Number</p>
              <p className="font-sans font-black italic text-2xl text-aws-orange tracking-tight">
                {success.ticket_number}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs text-white/80 border-t border-white/10 pt-3">
              <div>
                <p className="text-[10px] text-white/40 uppercase">Attendee</p>
                <p className="font-bold text-white truncate">{success.full_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase">Role</p>
                <p className="font-bold text-white uppercase">{success.role}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase">Phone</p>
                <p className="text-white">{success.phone}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase">Organization</p>
                <p className="text-white truncate">{success.organization}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-white/5">
                <p className="text-[10px] text-aws-orange/80 uppercase font-bold">Payment Collected By (Organizer)</p>
                <p className="font-bold text-aws-orange">{success.received_by}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <a
              href={ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-aws-orange hover:bg-amber-400 text-black font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-colors"
            >
              <ExternalLink size={14} />
              Open / View Digital Pass
            </a>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider border border-white/15 rounded-lg transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Link Copied!' : 'Copy Ticket Link'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider border border-white/15 rounded-lg transition-colors"
              >
                <RotateCcw size={14} />
                Generate Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-[#111] border border-white/5 rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-aws-orange/10 flex items-center justify-center">
            <Ticket size={20} className="text-aws-orange" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm text-white">Generate Offline Pass</h3>
            <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
              For cash / UPI payments collected offline
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pass Type */}
          <div>
            <label className="block font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1.5">
              Pass Type *
            </label>
            {passesLoading ? (
              <div className="h-10 bg-white/5 rounded animate-pulse" />
            ) : (
              <div className="relative">
                <select
                  value={form.pass_type_id}
                  onChange={e => setForm(f => ({ ...f, pass_type_id: e.target.value }))}
                  className="w-full h-11 bg-[#161616] border border-white/15 rounded-lg px-3.5 font-mono text-xs text-white focus:border-aws-orange focus:ring-1 focus:ring-aws-orange/50 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="" className="bg-[#161616] text-white/50 py-2">Select pass type...</option>
                  {passes.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#161616] text-white py-2">
                      {p.name} — ₹{p.price} ({p.available} remaining)
                    </option>
                  ))}
                </select>
              </div>
            )}
            {selectedPass && (
              <p className="mt-1.5 font-mono text-[10px] text-aws-orange">
                Pass value: ₹{selectedPass.price} (no PG/service charges for offline)
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Enter attendee's full name"
              className="w-full h-10 bg-white/5 border border-white/10 rounded px-3 font-mono text-xs text-white placeholder:text-white/20 focus:border-aws-orange/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1.5">
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="attendee@example.com"
              className="w-full h-10 bg-white/5 border border-white/10 rounded px-3 font-mono text-xs text-white placeholder:text-white/20 focus:border-aws-orange/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1.5">
              Phone (10 digits) *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: sanitizePhone(e.target.value) }))}
              placeholder="9876543210"
              className="w-full h-10 bg-white/5 border border-white/10 rounded px-3 font-mono text-xs text-white placeholder:text-white/20 focus:border-aws-orange/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1.5">
              Role *
            </label>
            <div className="flex gap-3">
              {(['student', 'professional'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={`flex-1 h-10 font-mono text-xs uppercase tracking-wider border rounded transition-colors ${
                    form.role === r
                      ? 'bg-aws-orange/20 border-aws-orange/50 text-aws-orange'
                      : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Organization */}
          <div>
            <label className="block font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1.5">
              {form.role === 'student' ? 'College / Institution' : 'Company / Organization'} *
            </label>
            <input
              type="text"
              value={form.organization}
              onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
              placeholder={form.role === 'student' ? 'e.g. SNGU STME DHULE' : 'e.g. Amazon Web Services'}
              className="w-full h-10 bg-white/5 border border-white/10 rounded px-3 font-mono text-xs text-white placeholder:text-white/20 focus:border-aws-orange/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Payment Collected By (Receiver Name) */}
          <div>
            <label className="block font-mono text-[10px] text-aws-orange uppercase tracking-wider mb-1.5 font-bold">
              Payment Collected By (Organizer Name) *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {['Soham Chaudhari', 'Vaibhav Chaudhari', 'Saurabh Rajput'].map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, received_by: name }))}
                  className={`px-2.5 py-1 font-mono text-[10px] uppercase rounded transition-colors ${
                    form.received_by === name
                      ? 'bg-aws-orange text-black font-bold'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {name.split(' ')[0]}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={form.received_by}
              onChange={e => setForm(f => ({ ...f, received_by: e.target.value }))}
              placeholder="Enter organizer's name receiving payment"
              className="w-full h-10 bg-white/5 border border-aws-orange/30 rounded px-3 font-mono text-xs text-white placeholder:text-white/20 focus:border-aws-orange focus:outline-none transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-f1-red/10 border border-f1-red/30 rounded text-f1-red">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <p className="font-mono text-[11px]">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-aws-orange to-amber-500 hover:brightness-110 text-black font-mono text-xs uppercase tracking-widest font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send size={14} />
                Generate & Send Pass
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
