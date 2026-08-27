import { loadStripe } from "@stripe/stripe-js";

// Publishable keys are designed to be exposed in client code.
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise;
export const getStripe = () => {
  if (!publishableKey) return Promise.resolve(null);
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
};

export const isStripeConfigured = Boolean(publishableKey);
