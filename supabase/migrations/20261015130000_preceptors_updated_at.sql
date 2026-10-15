-- preceptors is written with updated_at by account provisioning and the Accounts
-- editor, but the column never existed (admin_accounts has it; preceptors did not).

ALTER TABLE public.preceptors
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
