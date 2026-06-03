ALTER TABLE public.stripe_connections
  ADD COLUMN IF NOT EXISTS stripe_baseline_mrr NUMERIC(10,2) DEFAULT 0 NOT NULL;

CREATE TABLE IF NOT EXISTS public.widget_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_widget_impressions_user_created
  ON public.widget_impressions(user_id, created_at);

ALTER TABLE public.widget_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "widget_impressions_select" ON public.widget_impressions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "widget_impressions_insert" ON public.widget_impressions
  FOR INSERT WITH CHECK (user_id = auth.uid());
