import { loadStripe } from "@stripe/stripe-js";

// Publishable keys are designed to be exposed in client code.
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise;

// Lazily load Stripe.js once. Returns null (not a rejected promise) when no
// publishable key is configured, so the UI can degrade gracefully instead of
// throwing on load.
export const getStripe = () => {
  if (!publishableKey) return Promise.resolve(null);
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
};

export const isStripeConfigured = Boolean(publishableKey);
