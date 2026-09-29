CREATE TABLE public.class_mou_skips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_class_id uuid NOT NULL UNIQUE REFERENCES public.training_classes(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('existing_mou', 'will_execute_separately')),
  organization_name text NOT NULL,
  acknowledged_name text NOT NULL,
  acknowledged_at timestamptz NOT NULL DEFAULT now(),
  dismissed_at timestamptz,
  dismissed_by uuid REFERENCES public.admin_accounts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX class_mou_skips_undismissed_idx
  ON public.class_mou_skips (created_at DESC) WHERE dismissed_at IS NULL;
CREATE INDEX class_mou_skips_dismissed_by_idx
  ON public.class_mou_skips (dismissed_by) WHERE dismissed_by IS NOT NULL;

ALTER TABLE public.class_mou_skips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage class mou skips" ON public.class_mou_skips
  FOR ALL TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

REVOKE ALL ON public.class_mou_skips FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_mou_skips TO authenticated, service_role;
