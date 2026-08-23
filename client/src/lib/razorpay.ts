import { RazorpayConstructor } from '../types/razorpay';

let razorpayScriptLoadingPromise: Promise<RazorpayConstructor> | null = null;

/**
 * Dynamically loads the Razorpay Standard Checkout SDK (checkout.js).
 * Returns the window.Razorpay constructor once ready.
 */
export function loadRazorpayScript(): Promise<RazorpayConstructor> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay SDK can only be loaded in a browser environment'));
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (razorpayScriptLoadingPromise) {
    return razorpayScriptLoadingPromise;
  }

  razorpayScriptLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.Razorpay) {
          resolve(window.Razorpay);
        } else {
          reject(new Error('Razorpay SDK script loaded but window.Razorpay is undefined'));
        }
      });
      existingScript.addEventListener('error', () => {
        reject(new Error('Failed to load Razorpay SDK checkout.js'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        reject(new Error('Razorpay SDK script loaded but window.Razorpay is undefined'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Razorpay SDK checkout.js. Please check your network connection.'));
    };

    document.body.appendChild(script);
  });

  return razorpayScriptLoadingPromise;
}

export function getRazorpayKeyId(): string {
  return import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TSrp17WQir5VpR';
}
