CREATE TABLE IF NOT EXISTS public.founder_app_keys (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  app_key              TEXT NOT NULL UNIQUE,
  encrypted_app_secret TEXT NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER founder_app_keys_updated_at
  BEFORE UPDATE ON public.founder_app_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.founder_app_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "founder_app_keys_select" ON public.founder_app_keys
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "founder_app_keys_insert" ON public.founder_app_keys
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_founder_app_keys_app_key
  ON public.founder_app_keys(app_key);
