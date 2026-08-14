/* eslint-disable react-doctor/label-has-associated-control, react-doctor/control-has-associated-label */
import { useState, useRef, useId } from 'react';
import {
  Send,
  Eye,
  AlertTriangle,
  X,
  Upload,
  FileSpreadsheet,
  Download,
  Users,
  CheckCircle2,
  Trash2,
  Laptop,
  Smartphone,
  Sparkles,
  Search,
  Database,
  ListPlus,
  Info,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface RecipientItem {
  email: string;
  name: string;
}

interface ParsedCsvResult {
  recipients: RecipientItem[];
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
}

function parseEmailCsv(csvText: string): ParsedCsvResult {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { recipients: [], validCount: 0, duplicateCount: 0, invalidCount: 0 };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const seenEmails = new Set<string>();
  const recipients: RecipientItem[] = [];
  let duplicateCount = 0;
  let invalidCount = 0;

  // Check if first line is a header
  const firstLine = lines[0].toLowerCase();
  const hasHeader =
    firstLine.includes('email') ||
    firstLine.includes('mail') ||
    firstLine.includes('name') ||
    firstLine.includes('recipient');

  let emailColIdx = -1;
  let nameColIdx = -1;

  if (hasHeader) {
    const headerCols = lines[0].split(/[,;\t]/).map((c) => c.replace(/^["']|["']$/g, '').trim().toLowerCase());
    emailColIdx = headerCols.findIndex((c) => c.includes('email') || c.includes('mail'));
    nameColIdx = headerCols.findIndex((c) => c.includes('name') || c.includes('user') || c.includes('attendee'));
  }

  const startIndex = hasHeader ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i];
    const cols = rawLine.split(/[,;\t]/).map((c) => c.replace(/^["']|["']$/g, '').trim());

    let email = '';
    let name = '';

    if (emailColIdx !== -1 && cols[emailColIdx]) {
      email = cols[emailColIdx];
      if (nameColIdx !== -1 && cols[nameColIdx]) {
        name = cols[nameColIdx];
      }
    } else {
      // Find the first column matching email regex
      const foundIdx = cols.findIndex((c) => emailRegex.test(c));
      if (foundIdx !== -1) {
        email = cols[foundIdx];
        // Guess name from another column if present
        const otherCol = cols.find((_, idx) => idx !== foundIdx && cols[idx].length > 0);
        if (otherCol) name = otherCol;
      } else {
        // Fallback regex search anywhere in the line
        const match = rawLine.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (match) {
          email = match[0];
        }
      }
    }

    email = email.trim().toLowerCase();

    if (!email || !emailRegex.test(email)) {
      invalidCount++;
      continue;
    }

    if (seenEmails.has(email)) {
      duplicateCount++;
      continue;
    }

    seenEmails.add(email);
    recipients.push({
      email,
      name: name.trim() || email.split('@')[0],
    });
  }

  return {
    recipients,
    validCount: recipients.length,
    duplicateCount,
    invalidCount,
  };
}

function extractHtmlFromMime(mime: string) {
  if (!mime.trim()) return '';
  const htmlRegex = /(<html[\s\S]*<\/html>|<body[\s\S]*<\/body>|<div[\s\S]*<\/div>)/i;
  const match = mime.match(htmlRegex);
  if (match && match[1]) {
    return match[1];
  }
  return `<div style="font-family: monospace; padding: 1rem; color: #666;">No valid HTML content detected yet...<br/>(Looking for &lt;html&gt;, &lt;body&gt;, or &lt;div&gt; tags)</div>`;
}

function extractSubjectFromMime(mime: string) {
  const match = mime.match(/^Subject:\s*(.*)$/im);
  return match ? match[1].trim() : 'Important Update — AWS Student Community Day Dhule 2026';
}

const DEFAULT_THEME_MIME = `From: AWS Student Community Day Dhule 2026 <no-reply@aws-scd-dhule.tech>
Reply-To: info@aws-scd-dhule.tech
To: {{attendee_email}}
Subject: 🎟️ Your Ticket is Confirmed — AWS Student Community Day Dhule 2026
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="AWS-SCD-2026-BOUNDARY"

--AWS-SCD-2026-BOUNDARY
Content-Type: text/plain; charset=UTF-8

Your Ticket is Confirmed!
Please view this email in an HTML-compatible client to see your ticket.

--AWS-SCD-2026-BOUNDARY
Content-Type: text/html; charset=UTF-8

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AWS Student Community Day Dhule 2026</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background:#0f1923;padding: 28px 30px 28px;">
              <img
                src="https://aws-scd-dhule.tech/scd-dhule-logo.avif"
                alt="AWS Student Community Day Dhule"
                style="display:block;margin:0 auto 16px;max-width:180px;"
              />
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.3px;">
                AWS Student Community Day
              </h1>
              <p style="margin:6px 0 0;color:#FF9900;font-size:15px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
                Dhule &nbsp;·&nbsp; 2026
              </p>
            </td>
          </tr>

          <!-- BANNER -->
          <tr>
            <td style="background:#fff7ed;border-top:3px solid #FF9900;border-bottom:1px solid #fed7aa;padding:16px 30px;text-align:center;">
              <span style="font-size:17px;font-weight:700;color:#c2410c;">
                📢 &nbsp;Important Community Announcement
              </span>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:36px 36px 28px;">

              <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#374151;">
                Hello <strong>{{attendee_name}}</strong>,
              </p>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#4b5563;">
                We are excited to share an important update regarding <strong>AWS Student Community Day Dhule 2026</strong> happening on <strong>14 August 2026</strong>.
              </p>

              <p style="margin:0 0 28px;font-size:15px;line-height:1.8;color:#4b5563;">
                Join hundreds of students, developers, and cloud enthusiasts for a full day of
                technical sessions, hands-on learning, networking, and insights into modern cloud
                technologies and AI.
              </p>

              <!-- HIGHLIGHT CARD -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#111827;">
                      📍 Event Venue &amp; Time
                    </p>
                    <p style="margin:0 0 4px;font-size:14px;color:#4b5563;">
                      <strong>Venue:</strong> SVKM's Institute of Technology, Dhule
                    </p>
                    <p style="margin:0;font-size:14px;color:#4b5563;">
                      <strong>Date:</strong> 14 August 2026 &nbsp;|&nbsp; 09:00 AM IST
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="https://aws-scd-dhule.tech"
                       style="background:#FF9900;color:#111827;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:15px;display:inline-block;letter-spacing:0.2px;">
                      Visit Official Portal &nbsp;→
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                Questions? Reach out to us at <a href="mailto:info@aws-scd-dhule.tech" style="color:#FF9900;font-weight:600;text-decoration:none;">info@aws-scd-dhule.tech</a>.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#0f1923;padding:24px 30px;text-align:center;">
              <p style="margin:0;color:#d1d5db;font-size:13px;font-weight:600;">
                AWS Student Community Day Dhule 2026
              </p>
              <p style="margin:6px 0 0;color:#9ca3af;font-size:12px;">
                Building the next generation of cloud innovators.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>

--AWS-SCD-2026-BOUNDARY--`;

type RecipientSource = 'csv' | 'database_paid' | 'database_all' | 'database_all_contacts' | 'manual';

export function EmailShoutout() {
  const [recipientSource, setRecipientSource] = useState<RecipientSource>('csv');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvRecipients, setCsvRecipients] = useState<RecipientItem[]>([]);
  const [csvStats, setCsvStats] = useState<{ valid: number; duplicates: number; invalid: number } | null>(null);
  const [manualText, setManualText] = useState('');
  const [recipientSearch, setRecipientSearch] = useState('');

  const [mimeMessage, setMimeMessage] = useState(DEFAULT_THEME_MIME);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    type: 'success' | 'error';
    text: string;
    sent?: number;
    failed?: number;
    total?: number;
    failures?: Array<{ email: string; error: string }>;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaId = useId();

  // Handle CSV file upload
  const handleFileUpload = (file: File) => {
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const parsed = parseEmailCsv(text);
        setCsvRecipients(parsed.recipients);
        setCsvStats({
          valid: parsed.validCount,
          duplicates: parsed.duplicateCount,
          invalid: parsed.invalidCount,
        });
      }
    };
    reader.readAsText(file);
  };

  // Handle Manual list parsing
  const handleManualParse = () => {
    const parsed = parseEmailCsv(manualText);
    setCsvRecipients(parsed.recipients);
    setCsvStats({
      valid: parsed.validCount,
      duplicates: parsed.duplicateCount,
      invalid: parsed.invalidCount,
    });
  };

  // Download Sample CSV
  const downloadSampleCsv = () => {
    const sampleContent = `email,name\nstudent1@example.com,Aarav Sharma\ndeveloper@example.com,Priya Patel\ncloudfan@example.com,Rohan Deshmukh`;
    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'broadcast-recipients-sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Insert variable into MIME message
  const insertVariable = (variable: string) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + variable + text.substring(end);
      setMimeMessage(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 50);
    } else {
      setMimeMessage((prev) => prev + `\n${variable}`);
    }
  };

  // Filtered preview of CSV recipients
  const filteredRecipients = csvRecipients.filter(
    (r) =>
      r.email.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      r.name.toLowerCase().includes(recipientSearch.toLowerCase())
  );

  // Send broadcast handler
  const handleSend = async () => {
    setIsSending(true);
    setSendResult(null);

    try {
      const payload: any = {
        mimeMessage,
        recipientSource: recipientSource === 'manual' ? 'csv' : recipientSource,
        provider: 'mailtrap',
      };

      if (recipientSource === 'csv' || recipientSource === 'manual') {
        if (csvRecipients.length === 0) {
          throw new Error('Please upload a CSV file with valid emails or enter recipient emails.');
        }
        payload.recipients = csvRecipients;
      }

      const response = await adminApi.sendShoutout(payload);
      const data = response.data;

      setSendResult({
        type: 'success',
        text: data.message || `Broadcast completed via Mailtrap: ${data.sent} sent, ${data.failed} failed.`,
        sent: data.sent,
        failed: data.failed,
        total: data.total,
        failures: data.failures,
      });

      setIsPreviewOpen(false);
    } catch (err: any) {
      console.error(err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to send broadcast email';
      setSendResult({
        type: 'error',
        text: errMsg,
      });
    } finally {
      setIsSending(false);
    }
  };

  // First recipient for live interpolation preview in modal
  const sampleRecipient = csvRecipients[0] || {
    name: 'Saurabh Rajput',
    email: 'saurabh@example.com',
  };

  const rawHtml = extractHtmlFromMime(mimeMessage);
  const samplePersonalizedHtml = rawHtml
    .replace(/\{\{attendee_name\}\}/gi, sampleRecipient.name)
    .replace(/\{\{name\}\}/gi, sampleRecipient.name)
    .replace(/\{\{recipient_name\}\}/gi, sampleRecipient.name)
    .replace(/\{\{attendee_email\}\}/gi, sampleRecipient.email)
    .replace(/\{\{email\}\}/gi, sampleRecipient.email)
    .replace(/\{\{event_name\}\}/gi, 'AWS Student Community Day Dhule 2026')
    .replace(/\{\{event_date\}\}/gi, '14 August 2026')
    .replace(/\{\{event_venue\}\}/gi, "SVKM's Institute of Technology, Dhule");

  return (
    <div className="space-y-6">
      {/* Header card with Mailtrap status */}
      <div className="bg-[#111] border border-white/5 p-6 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-sans font-black italic text-lg text-white flex items-center gap-2">
                <Send size={18} className="text-aws-orange" />
                Broadcast Email Dispatch
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Mailtrap Provider
              </span>
            </div>
            <p className="font-mono text-xs text-white/50 mt-1">
              Send mass announcements and customized updates to attendees using <strong>Mailtrap Email Delivery</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={downloadSampleCsv}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors self-start lg:self-auto"
          >
            <Download size={14} className="text-aws-orange" />
            Download Sample CSV
          </button>
        </div>
      </div>

      {/* Result feedback */}
      {sendResult && (
        <div
          className={`p-4 border font-mono text-xs ${
            sendResult.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            {sendResult.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {sendResult.text}
          </div>
          {sendResult.total !== undefined && (
            <div className="text-[11px] text-white/70 mt-2 space-x-4">
              <span>Total: <strong>{sendResult.total}</strong></span>
              <span className="text-emerald-400">Delivered: <strong>{sendResult.sent}</strong></span>
              {sendResult.failed !== undefined && sendResult.failed > 0 && (
                <span className="text-rose-400">Failed: <strong>{sendResult.failed}</strong></span>
              )}
            </div>
          )}

          {sendResult.failures && sendResult.failures.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <span className="font-bold text-rose-300">Failure details:</span>
              <ul className="mt-1 space-y-1 max-h-32 overflow-y-auto text-[10px]">
                {sendResult.failures.map((f, idx) => (
                  <li key={idx} className="text-white/60">
                    <span className="text-white/90">{f.email}</span>: {f.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* STEP 1: Select Recipient Target */}
      <div className="bg-[#111] border border-white/5 p-6">
        <h4 className="font-mono text-xs uppercase tracking-widest text-aws-orange mb-4 flex items-center gap-2 font-bold">
          <span className="w-5 h-5 rounded-full bg-aws-orange/20 text-aws-orange flex items-center justify-center text-[10px]">1</span>
          Select Recipient Target
        </h4>

        {/* Source Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRecipientSource('csv')}
            className={`p-4 text-left border transition-all ${
              recipientSource === 'csv'
                ? 'bg-aws-orange/10 border-aws-orange text-white'
                : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2.5 font-sans font-bold text-sm mb-1">
              <FileSpreadsheet size={16} className={recipientSource === 'csv' ? 'text-aws-orange' : 'text-white/40'} />
              Upload Email CSV
            </div>
            <p className="font-mono text-[11px] text-white/40">
              Upload custom list from a .csv file
            </p>
          </button>

          <button
            type="button"
            onClick={() => setRecipientSource('database_paid')}
            className={`p-4 text-left border transition-all ${
              recipientSource.startsWith('database')
                ? 'bg-aws-orange/10 border-aws-orange text-white'
                : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2.5 font-sans font-bold text-sm mb-1">
              <Database size={16} className={recipientSource.startsWith('database') ? 'text-aws-orange' : 'text-white/40'} />
              Database Attendees
            </div>
            <p className="font-mono text-[11px] text-white/40">
              Send to verified database registrations
            </p>
          </button>

          <button
            type="button"
            onClick={() => setRecipientSource('manual')}
            className={`p-4 text-left border transition-all ${
              recipientSource === 'manual'
                ? 'bg-aws-orange/10 border-aws-orange text-white'
                : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2.5 font-sans font-bold text-sm mb-1">
              <ListPlus size={16} className={recipientSource === 'manual' ? 'text-aws-orange' : 'text-white/40'} />
              Paste Email List
            </div>
            <p className="font-mono text-[11px] text-white/40">
              Paste comma or line separated emails
            </p>
          </button>
        </div>

        {/* CSV Upload Mode */}
        {recipientSource === 'csv' && (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.txt,.tsv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />

            {!csvFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="border-2 border-dashed border-white/15 hover:border-aws-orange/60 bg-black/30 hover:bg-black/50 p-8 text-center cursor-pointer transition-all rounded-sm flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-aws-orange/10 flex items-center justify-center text-aws-orange">
                  <Upload size={22} />
                </div>
                <div>
                  <p className="font-sans font-bold text-white text-sm">
                    Click to select or drag &amp; drop your CSV file here
                  </p>
                  <p className="font-mono text-[11px] text-white/40 mt-1">
                    Supports columns like: <code>email, name</code> (comma, tab, or semicolon separated)
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-black/60 border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-aws-orange/10 border border-aws-orange/20 flex items-center justify-center text-aws-orange">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <p className="font-sans font-bold text-sm text-white">{csvFile.name}</p>
                      <p className="font-mono text-[11px] text-white/40">
                        {(csvFile.size / 1024).toFixed(1)} KB &nbsp;·&nbsp; Processed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white font-mono text-xs border border-white/10 transition-colors"
                    >
                      Change File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCsvFile(null);
                        setCsvRecipients([]);
                        setCsvStats(null);
                      }}
                      className="p-1.5 text-white/40 hover:text-f1-red transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Validation Stats */}
                {csvStats && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                      <span className="block font-sans font-black text-lg text-emerald-400">
                        {csvStats.valid}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-300 uppercase tracking-wider">
                        Valid Recipients
                      </span>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 text-center">
                      <span className="block font-sans font-black text-lg text-amber-400">
                        {csvStats.duplicates}
                      </span>
                      <span className="font-mono text-[10px] text-amber-300 uppercase tracking-wider">
                        Duplicates Removed
                      </span>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 text-center">
                      <span className="block font-sans font-black text-lg text-rose-400">
                        {csvStats.invalid}
                      </span>
                      <span className="font-mono text-[10px] text-rose-300 uppercase tracking-wider">
                        Invalid Skipped
                      </span>
                    </div>
                  </div>
                )}

                {/* Recipient preview list */}
                {csvRecipients.length > 0 && (
                  <div className="border border-white/10 bg-black/40 p-4">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <span className="font-mono text-xs text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                        <Users size={14} className="text-aws-orange" />
                        Recipient Preview ({csvRecipients.length})
                      </span>
                      <div className="relative w-48">
                        <Search size={12} className="absolute left-2.5 top-2.5 text-white/30" />
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={recipientSearch}
                          onChange={(e) => setRecipientSearch(e.target.value)}
                          className="w-full bg-black border border-white/10 text-white pl-8 pr-2 py-1 text-xs font-mono focus:border-aws-orange outline-none"
                        />
                      </div>
                    </div>

                    <div className="max-h-40 overflow-y-auto divide-y divide-white/5 font-mono text-xs">
                      {filteredRecipients.slice(0, 100).map((r, i) => (
                        <div key={i} className="py-1.5 px-2 flex items-center justify-between text-white/70 hover:bg-white/[0.02]">
                          <span className="text-white/90 font-medium">{r.name}</span>
                          <span className="text-white/40 text-[11px]">{r.email}</span>
                        </div>
                      ))}
                      {filteredRecipients.length > 100 && (
                        <p className="text-[10px] text-white/30 text-center pt-2">
                          ... and {filteredRecipients.length - 100} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Database Target Mode */}
        {recipientSource.startsWith('database') && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${
                recipientSource === 'database_paid' ? 'bg-aws-orange/10 border-aws-orange' : 'bg-black/40 border-white/10'
              }`}>
                <input
                  type="radio"
                  name="db_target"
                  checked={recipientSource === 'database_paid'}
                  onChange={() => setRecipientSource('database_paid')}
                  className="mt-1 accent-aws-orange"
                />
                <div>
                  <span className="block font-sans font-bold text-xs text-white">Paid Registrations</span>
                  <span className="font-mono text-[10px] text-white/40">Only attendees with confirmed paid passes</span>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${
                recipientSource === 'database_all' ? 'bg-aws-orange/10 border-aws-orange' : 'bg-black/40 border-white/10'
              }`}>
                <input
                  type="radio"
                  name="db_target"
                  checked={recipientSource === 'database_all'}
                  onChange={() => setRecipientSource('database_all')}
                  className="mt-1 accent-aws-orange"
                />
                <div>
                  <span className="block font-sans font-bold text-xs text-white">All Registrations</span>
                  <span className="font-mono text-[10px] text-white/40">All registered attendee emails</span>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${
                recipientSource === 'database_all_contacts' ? 'bg-aws-orange/10 border-aws-orange' : 'bg-black/40 border-white/10'
              }`}>
                <input
                  type="radio"
                  name="db_target"
                  checked={recipientSource === 'database_all_contacts'}
                  onChange={() => setRecipientSource('database_all_contacts')}
                  className="mt-1 accent-aws-orange"
                />
                <div>
                  <span className="block font-sans font-bold text-xs text-white">All Event Contacts</span>
                  <span className="font-mono text-[10px] text-white/40">Includes speakers, volunteers, partners</span>
                </div>
              </label>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 text-[11px] font-mono text-white/50 flex items-center gap-2">
              <Info size={14} className="text-aws-orange shrink-0" />
              Emails will be dynamically fetched and deduplicated from the live database during dispatch.
            </div>
          </div>
        )}

        {/* Manual Input Mode */}
        {recipientSource === 'manual' && (
          <div className="space-y-3">
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={`john@example.com, John Doe\nalice@example.com, Alice Smith\nrohan@example.com`}
              rows={4}
              className="w-full bg-black border border-white/10 text-white p-3 font-mono text-xs focus:border-aws-orange focus:ring-1 focus:ring-aws-orange outline-none"
            />
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleManualParse}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-colors"
              >
                Parse &amp; Validate Emails
              </button>
              {csvStats && (
                <span className="font-mono text-xs text-emerald-400">
                  ✓ {csvStats.valid} valid emails loaded
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: Email Content & Live Preview */}
      <div className="bg-[#111] border border-white/5 p-6">
        <h4 className="font-mono text-xs uppercase tracking-widest text-aws-orange mb-4 flex items-center gap-2 font-bold">
          <span className="w-5 h-5 rounded-full bg-aws-orange/20 text-aws-orange flex items-center justify-center text-[10px]">2</span>
          Email Payload &amp; Template Variables
        </h4>

        {/* Variables Helper Pills */}
        <div className="mb-4 bg-black/40 border border-white/10 p-3 rounded-sm">
          <span className="font-mono text-[11px] text-white/60 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
            <Sparkles size={13} className="text-aws-orange" />
            Click to insert dynamic placeholder:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Attendee Name', code: '{{attendee_name}}' },
              { label: 'Attendee Email', code: '{{attendee_email}}' },
              { label: 'Event Name', code: '{{event_name}}' },
              { label: 'Event Date', code: '{{event_date}}' },
              { label: 'Event Venue', code: '{{event_venue}}' },
            ].map((tag) => (
              <button
                key={tag.code}
                type="button"
                onClick={() => insertVariable(tag.code)}
                className="px-2 py-1 bg-white/5 hover:bg-aws-orange/20 border border-white/10 hover:border-aws-orange/40 text-white/80 hover:text-aws-orange font-mono text-[11px] rounded transition-colors"
              >
                {tag.label} <code className="text-aws-orange/70 font-bold ml-1">{tag.code}</code>
              </button>
            ))}
          </div>
        </div>

        {/* Editor & Preview Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono text-white/60 mb-2 uppercase tracking-widest">
              Raw MIME / HTML Message Payload
            </label>
            <textarea
              id={textareaId}
              value={mimeMessage}
              onChange={(e) => setMimeMessage(e.target.value)}
              className="w-full h-[520px] bg-black border border-white/10 text-white p-4 font-mono text-xs focus:border-aws-orange focus:ring-1 focus:ring-aws-orange outline-none transition-all resize-y"
              placeholder={`From: sender@example.com\nTo: {{attendee_email}}\nSubject: Important Update\n\n<html>...</html>`}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono text-white/60 uppercase tracking-widest">
                Live Preview
              </label>
              <div className="flex items-center gap-1 bg-black border border-white/10 p-0.5 rounded">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1 text-xs ${previewDevice === 'desktop' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                  title="Desktop Preview"
                >
                  <Laptop size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1 text-xs ${previewDevice === 'mobile' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                  title="Mobile Preview"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-[#f0f2f5] border border-white/10 rounded-sm overflow-hidden h-[520px] flex justify-center">
              <iframe
                title="Email Live Preview"
                srcDoc={rawHtml}
                style={{ width: previewDevice === 'mobile' ? '375px' : '100%' }}
                className="h-full border-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-between items-center pt-6 border-t border-white/5 mt-6">
          <div className="font-mono text-xs text-white/40">
            Target: <span className="text-white font-bold uppercase">
              {recipientSource === 'csv' && `CSV (${csvRecipients.length} recipients)`}
              {recipientSource === 'database_paid' && 'Database (Paid attendees)'}
              {recipientSource === 'database_all' && 'Database (All registrations)'}
              {recipientSource === 'database_all_contacts' && 'Database (All event contacts)'}
              {recipientSource === 'manual' && `Manual (${csvRecipients.length} recipients)`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            disabled={!mimeMessage.trim() || isSending || ((recipientSource === 'csv' || recipientSource === 'manual') && csvRecipients.length === 0)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-mono text-sm uppercase tracking-widest hover:bg-aws-orange transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-bold"
          >
            <Eye size={16} />
            Review &amp; Broadcast
          </button>
        </div>
      </div>

      {/* Confirmation & Broadcast Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 w-full max-w-4xl flex flex-col max-h-[92vh] shadow-2xl">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h4 className="font-sans font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={18} className="text-aws-orange" />
                Confirm Mass Broadcast
              </h4>
              <button
                type="button"
                onClick={() => !isSending && setIsPreviewOpen(false)}
                disabled={isSending}
                className="text-white/40 hover:text-white disabled:opacity-30"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-white/70 space-y-4">
              {/* Campaign summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/50 border border-white/10 p-4">
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest block">Recipient Target</span>
                  <strong className="text-white text-sm">
                    {recipientSource === 'csv' && `CSV (${csvRecipients.length} emails)`}
                    {recipientSource === 'database_paid' && 'Paid Registrations'}
                    {recipientSource === 'database_all' && 'All Registrations'}
                    {recipientSource === 'database_all_contacts' && 'All Event Contacts'}
                    {recipientSource === 'manual' && `Manual (${csvRecipients.length} emails)`}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest block">Email Provider</span>
                  <strong className="text-emerald-400 text-sm flex items-center gap-1">
                    Mailtrap API (send.api.mailtrap.io)
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest block">Subject Line</span>
                  <span className="text-white truncate block">
                    {extractSubjectFromMime(mimeMessage)}
                  </span>
                </div>
              </div>

              {/* Live interpolation sample */}
              <div>
                <p className="text-xs text-white/80 mb-2 font-sans font-bold flex items-center gap-2">
                  <Eye size={14} className="text-aws-orange" />
                  Personalized Sample Preview (Rendered for <em>{sampleRecipient.name}</em> &lt;{sampleRecipient.email}&gt;):
                </p>
                <div className="border border-white/10 rounded overflow-hidden bg-white h-80">
                  <iframe
                    title="Sample Personalized Preview"
                    srcDoc={samplePersonalizedHtml}
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-[#0a0a0a]">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                disabled={isSending}
                className="px-4 py-2 border border-white/10 text-white/60 hover:text-white font-mono text-xs uppercase transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="flex items-center gap-2 px-6 py-2.5 bg-aws-orange text-black font-mono text-xs uppercase tracking-widest hover:bg-orange-500 font-bold transition-colors disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Dispatching via Mailtrap...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Confirm &amp; Send Broadcast
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

