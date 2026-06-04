ALTER TYPE dunning_sequence_status ADD VALUE IF NOT EXISTS 'recovered';

ALTER TABLE public.dunning_sequences
  ADD COLUMN IF NOT EXISTS recovered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recovered_mrr_cents INTEGER;
