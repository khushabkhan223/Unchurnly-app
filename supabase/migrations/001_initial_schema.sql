-- ============================================================
-- 001_initial_schema.sql
-- Unchurnly initial database schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enum types ───────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE dunning_sequence_status AS ENUM ('active', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE dunning_email_status AS ENUM ('pending', 'sent', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE cancellation_outcome AS ENUM ('paused', 'discounted', 'downgraded', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Shared updated_at trigger ────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── users ────────────────────────────────────────────────────
-- Mirrors auth.users. Populated by trigger on auth.users insert.

CREATE TABLE IF NOT EXISTS public.users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_insert" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "users_update" ON public.users
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "users_delete" ON public.users
  FOR DELETE USING (id = auth.uid());

-- Trigger: sync new auth.users row into public.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ── stripe_connections ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.stripe_connections (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  encrypted_access_token TEXT NOT NULL,
  stripe_account_id     TEXT NOT NULL,
  connected_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER stripe_connections_updated_at
  BEFORE UPDATE ON public.stripe_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.stripe_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stripe_connections_select" ON public.stripe_connections
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "stripe_connections_insert" ON public.stripe_connections
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "stripe_connections_update" ON public.stripe_connections
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "stripe_connections_delete" ON public.stripe_connections
  FOR DELETE USING (user_id = auth.uid());

-- ── monitored_customers ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.monitored_customers (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id      TEXT NOT NULL,
  stripe_subscription_id  TEXT,
  customer_email          TEXT,
  customer_name           TEXT,
  plan_name               TEXT,
  mrr_amount              INTEGER,  -- in cents
  status                  TEXT NOT NULL DEFAULT 'active',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER monitored_customers_updated_at
  BEFORE UPDATE ON public.monitored_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.monitored_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "monitored_customers_select" ON public.monitored_customers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "monitored_customers_insert" ON public.monitored_customers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "monitored_customers_update" ON public.monitored_customers
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "monitored_customers_delete" ON public.monitored_customers
  FOR DELETE USING (user_id = auth.uid());

-- ── dunning_sequences ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.dunning_sequences (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  monitored_customer_id UUID NOT NULL REFERENCES public.monitored_customers(id) ON DELETE CASCADE,
  status               dunning_sequence_status NOT NULL DEFAULT 'active',
  started_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER dunning_sequences_updated_at
  BEFORE UPDATE ON public.dunning_sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.dunning_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dunning_sequences_select" ON public.dunning_sequences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "dunning_sequences_insert" ON public.dunning_sequences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "dunning_sequences_update" ON public.dunning_sequences
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "dunning_sequences_delete" ON public.dunning_sequences
  FOR DELETE USING (user_id = auth.uid());

-- ── dunning_emails ───────────────────────────────────────────
-- No direct user_id — ownership verified through dunning_sequences join.

CREATE TABLE IF NOT EXISTS public.dunning_emails (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dunning_sequence_id  UUID NOT NULL REFERENCES public.dunning_sequences(id) ON DELETE CASCADE,
  day_number           INTEGER NOT NULL CHECK (day_number IN (1, 3, 7, 14)),
  status               dunning_email_status NOT NULL DEFAULT 'pending',
  sent_at              TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER dunning_emails_updated_at
  BEFORE UPDATE ON public.dunning_emails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.dunning_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dunning_emails_select" ON public.dunning_emails
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dunning_sequences ds
      WHERE ds.id = dunning_sequence_id AND ds.user_id = auth.uid()
    )
  );

CREATE POLICY "dunning_emails_insert" ON public.dunning_emails
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dunning_sequences ds
      WHERE ds.id = dunning_sequence_id AND ds.user_id = auth.uid()
    )
  );

CREATE POLICY "dunning_emails_update" ON public.dunning_emails
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.dunning_sequences ds
      WHERE ds.id = dunning_sequence_id AND ds.user_id = auth.uid()
    )
  );

CREATE POLICY "dunning_emails_delete" ON public.dunning_emails
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.dunning_sequences ds
      WHERE ds.id = dunning_sequence_id AND ds.user_id = auth.uid()
    )
  );

-- ── cancel_flow_configs ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cancel_flow_configs (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  pause_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
  discount_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
  discount_percent   INTEGER CHECK (discount_percent BETWEEN 0 AND 100),
  downgrade_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER cancel_flow_configs_updated_at
  BEFORE UPDATE ON public.cancel_flow_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.cancel_flow_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cancel_flow_configs_select" ON public.cancel_flow_configs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "cancel_flow_configs_insert" ON public.cancel_flow_configs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "cancel_flow_configs_update" ON public.cancel_flow_configs
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "cancel_flow_configs_delete" ON public.cancel_flow_configs
  FOR DELETE USING (user_id = auth.uid());

-- ── cancellation_events ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cancellation_events (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  monitored_customer_id UUID NOT NULL REFERENCES public.monitored_customers(id) ON DELETE CASCADE,
  outcome               cancellation_outcome NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER cancellation_events_updated_at
  BEFORE UPDATE ON public.cancellation_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.cancellation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cancellation_events_select" ON public.cancellation_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "cancellation_events_insert" ON public.cancellation_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "cancellation_events_update" ON public.cancellation_events
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "cancellation_events_delete" ON public.cancellation_events
  FOR DELETE USING (user_id = auth.uid());
