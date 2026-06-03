ALTER TABLE public.cancel_flow_configs
  ADD COLUMN IF NOT EXISTS support_url TEXT;
