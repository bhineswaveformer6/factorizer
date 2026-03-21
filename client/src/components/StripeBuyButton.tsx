import { useEffect, useRef } from 'react';
import { STRIPE_CONFIG } from '@/lib/stripe';

interface StripeBuyButtonProps {
  buttonId: keyof typeof STRIPE_CONFIG.buyButtons;
}

// Load the Stripe Buy Button script once
let scriptLoaded = false;
function loadStripeScript() {
  if (scriptLoaded) return;
  if (document.querySelector('script[src*="buy-button.js"]')) {
    scriptLoaded = true;
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://js.stripe.com/v3/buy-button.js';
  script.async = true;
  document.head.appendChild(script);
  scriptLoaded = true;
}

export function StripeBuyButton({ buttonId }: StripeBuyButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStripeScript();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    // Clear and re-render the buy button
    containerRef.current.innerHTML = '';
    const el = document.createElement('stripe-buy-button');
    el.setAttribute('buy-button-id', STRIPE_CONFIG.buyButtons[buttonId]);
    el.setAttribute('publishable-key', STRIPE_CONFIG.publishableKey);
    containerRef.current.appendChild(el);
  }, [buttonId]);

  return <div ref={containerRef} className="flex justify-center w-full" />;
}
