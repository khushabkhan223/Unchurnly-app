import Stripe from "stripe";
import { decryptToken } from "./crypto";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-04-22.dahlia",
});

export function getStripeAccountClient(encryptedToken: string): Stripe {
  const key = decryptToken(encryptedToken);
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}
