ALTER TABLE public.stripe_connections
  ADD CONSTRAINT stripe_connections_user_id_key UNIQUE (user_id);
