ALTER TABLE public.cancel_flow_configs
  ADD COLUMN IF NOT EXISTS stripe_coupon_id TEXT;
