CREATE INDEX IF NOT EXISTS idx_dunning_emails_sequence_status
  ON public.dunning_emails(dunning_sequence_id, status);

CREATE INDEX IF NOT EXISTS idx_dunning_sequences_status
  ON public.dunning_sequences(status);
