-- Migration 027: Tie WFEMS signature to admin account identity
-- Adds rank to admin_accounts, wfems_signed_by FK to class_mous.
-- Removes free-text signer fields in favor of FK identity.

ALTER TABLE public.admin_accounts
  ADD COLUMN IF NOT EXISTS rank text;

COMMENT ON COLUMN public.admin_accounts.rank IS 'Admin''s rank or title (e.g. EMS Major, Deputy Chief). Required for new accounts.';

ALTER TABLE public.class_mous
  ADD COLUMN IF NOT EXISTS wfems_signed_by uuid REFERENCES public.admin_accounts(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.class_mous.wfems_signed_by IS 'Admin account that executed the WFEMS signature.'

ALTER TABLE public.class_mous
  DROP COLUMN IF EXISTS wfems_signer_name,
  DROP COLUMN IF EXISTS wfems_signer_title;
