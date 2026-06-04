ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS widget_first_seen_at TIMESTAMPTZ;

ALTER PUBLICATION supabase_realtime ADD TABLE public.users (id, widget_installed, widget_first_seen_at);
