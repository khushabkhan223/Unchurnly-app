ALTER TABLE public.stripe_connections
  ADD COLUMN IF NOT EXISTS encrypted_webhook_secret TEXT,
  ADD COLUMN IF NOT EXISTS webhook_endpoint_id TEXT,
  ADD COLUMN IF NOT EXISTS webhook_configured_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_stripe_connections_account_id
  ON public.stripe_connections(stripe_account_id);

CREATE INDEX IF NOT EXISTS idx_monitored_customers_customer_user
  ON public.monitored_customers(stripe_customer_id, user_id);

CREATE INDEX IF NOT EXISTS idx_dunning_sequences_customer_status
  ON public.dunning_sequences(monitored_customer_id, status);
