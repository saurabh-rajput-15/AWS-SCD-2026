export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
  method?: string;
}

export interface RazorpayTheme {
  color?: string;
  backdrop_color?: string;
  hide_topbar?: boolean;
}

export interface RazorpayModalOptions {
  backdropclose?: boolean;
  escape?: boolean;
  handleback?: boolean;
  confirm_close?: boolean;
  ondismiss?: () => void;
  animation?: boolean;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailureResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id?: string;
    };
  };
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler?: (response: RazorpaySuccessResponse) => void;
  prefill?: RazorpayPrefill;
  notes?: Record<string, string | number>;
  theme?: RazorpayTheme;
  modal?: RazorpayModalOptions;
}

export interface RazorpayInstance {
  open(): void;
  close(): void;
  on(event: 'payment.failed', handler: (response: RazorpayFailureResponse) => void): void;
}

export interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}
