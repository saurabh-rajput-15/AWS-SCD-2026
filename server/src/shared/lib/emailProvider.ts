import { Resend } from 'resend';

// --- Provider Interface ---

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}

export interface SendEmailResult {
  messageId: string;
  raw?: unknown;
}

export interface EmailProvider {
  name: string;
  send(options: SendEmailOptions): Promise<SendEmailResult>;
}

// --- Resend Provider ---

class ResendProvider implements EmailProvider {
  name = 'resend';
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    let envFrom = process.env.EMAIL_FROM || 'no-reply@aws-scd-dhule.tech';
    if (!envFrom.includes('<')) {
      envFrom = `AWS Student Community Day Dhule 2026 <${envFrom}>`;
    }
    const from = options.from || envFrom;
    const reply_to = options.replyTo || process.env.EMAIL_REPLY_TO || 'info@aws-scd-dhule.tech';

    const payload: any = {
      from,
      reply_to,
      to: [options.to],
      subject: options.subject,
      html: options.html,
    };

    if (options.text) {
      payload.text = options.text;
    }

    if (options.attachments) {
      payload.attachments = options.attachments;
    }

    const { data, error } = await this.client.emails.send(payload);

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    return {
      messageId: data?.id || 'unknown',
      raw: data,
    };
  }
}

// --- Mailtrap Provider ---

export class MailtrapProvider implements EmailProvider {
  name = 'mailtrap';
  private apiKey: string;
  private endpoint = 'https://send.api.mailtrap.io/api/send';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    let envFrom = process.env.EMAIL_FROM || 'no-reply@aws-scd-dhule.tech';
    let fromName = 'AWS Student Community Day Dhule 2026';
    let fromEmail = envFrom;

    if (options.from) {
      envFrom = options.from;
    }

    if (envFrom.includes('<') && envFrom.includes('>')) {
      const match = envFrom.match(/^(.*?)\s*<(.+)>$/);
      if (match) {
        fromName = match[1].trim();
        fromEmail = match[2].trim();
      }
    } else {
      fromEmail = envFrom.trim();
    }

    const payload: any = {
      from: {
        email: fromEmail,
        name: fromName,
      },
      to: [
        {
          email: options.to,
        },
      ],
      subject: options.subject,
      html: options.html,
    };

    if (options.text) {
      payload.text = options.text;
    }

    if (options.replyTo || process.env.EMAIL_REPLY_TO) {
      payload.headers = {
        'Reply-To': options.replyTo || process.env.EMAIL_REPLY_TO || 'info@aws-scd-dhule.tech',
      };
    }

    if (options.attachments && options.attachments.length > 0) {
      payload.attachments = options.attachments.map((att) => ({
        content: att.content.toString('base64'),
        filename: att.filename,
        type: 'application/octet-stream',
        disposition: 'attachment',
      }));
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const resData: any = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg =
        (Array.isArray(resData?.errors) ? resData.errors.join(', ') : null) ||
        resData?.message ||
        response.statusText ||
        'Unknown Mailtrap error';
      throw new Error(`Mailtrap error (${response.status}): ${errorMsg}`);
    }

    const messageId = resData?.message_ids?.[0] || 'mailtrap-' + Date.now();

    return {
      messageId,
      raw: resData,
    };
  }
}

// --- Factory ---

let cachedProvider: EmailProvider | null = null;

export function getEmailProvider(providerName?: string): EmailProvider {
  const provider = (providerName || process.env.EMAIL_PROVIDER || 'resend').toLowerCase();

  if (provider === 'mailtrap') {
    const apiKey = process.env.MAILTRAP_API_KEY || process.env.MAILTRAP_TOKEN;
    if (!apiKey) {
      throw new Error('MAILTRAP_API_KEY is not set in environment variables');
    }
    return new MailtrapProvider(apiKey);
  }

  if (cachedProvider && !providerName) return cachedProvider;

  switch (provider) {
    case 'resend': {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error('RESEND_API_KEY is not set in environment variables');
      }
      const instance = new ResendProvider(apiKey);
      if (!providerName) cachedProvider = instance;
      return instance;
    }
    // Future: case 'ses': { ... }
    default:
      throw new Error(`Unknown email provider: ${provider}`);
  }
}

