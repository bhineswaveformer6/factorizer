// Stripe Buy Button Configuration — LIVE
export const STRIPE_CONFIG = {
  publishableKey: 'pk_live_51QeZQEKXXTFIbGx6dvBx1UtwpDT6Ki3Kei41E7DYAu9DvHxxYvxXeaVghXBsH27D7LbDpGbsvtLBAAAJyIekRx3U00Miq0Ro55',
  buyButtons: {
    // Pay-as-you-go: $29 per report
    SINGLE_REPORT: 'buy_btn_1TDMIfKXXTFIbGx6asZud4ne',
    // Pro subscription: $99/month
    PRO_MONTHLY: 'buy_btn_1TDTXWKXXTFIbGx632O70e64',
  },
};

export function isStripeConfigured(): boolean {
  return true;
}

// Legacy support for any components still using redirect
export const STRIPE_LINKS = {
  SINGLE_REPORT: '',
  PRO_MONTHLY: '',
};

export function redirectToCheckout(_link: keyof typeof STRIPE_LINKS): void {
  // No-op — we use embedded buy buttons now
}
