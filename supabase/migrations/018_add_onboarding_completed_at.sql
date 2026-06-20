alter table public.students
  add column if not exists onboarding_completed_at timestamptz;

update public.students
set onboarding_completed_at = coalesce(signature_timestamp, created_at)
where onboarding_completed_at is null
  and status::text in ('certified', 'expired', 'archived');

update public.students
set onboarding_completed_at = coalesce(signature_timestamp, created_at)
where onboarding_completed_at is null
  and status::text = 'pending'
  and auth_user_id is not null;

create index if not exists idx_students_status_onboarding_completed_at
  on public.students (status, onboarding_completed_at, created_at desc);
