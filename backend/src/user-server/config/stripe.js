import stripe from "stripe";
import "dotenv/config";

export const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);