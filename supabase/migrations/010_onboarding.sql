ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS business_description TEXT,
  ADD COLUMN IF NOT EXISTS business_model TEXT,
  ADD COLUMN IF NOT EXISTS brand_voice TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS widget_banner_dismissed_at TIMESTAMPTZ;
