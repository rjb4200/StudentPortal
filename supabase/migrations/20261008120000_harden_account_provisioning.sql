-- Harden account provisioning:
--   1. De-duplicate auth_user_id links so partial unique indexes can be created.
--   2. Add FK students.auth_user_id -> auth.users(id) ON DELETE SET NULL.
--   3. Add partial unique indexes on auth_user_id for students, admin_accounts, preceptors.

-- 1. De-duplicate: for each auth_user_id that appears more than once in a table,
--    keep the link on one deterministic row and null the rest.
do $$
declare
  t text;
  auth_id uuid;
  keep_id uuid;
begin
  foreach t in array array['students', 'admin_accounts', 'preceptors']
  loop
    for auth_id in
      execute format(
        'select auth_user_id from public.%I where auth_user_id is not null group by auth_user_id having count(*) > 1',
        t
      )
    loop
      execute format(
        'select id from public.%I where auth_user_id = $1 order by id limit 1',
        t
      ) into keep_id using auth_id;

      execute format(
        'update public.%I set auth_user_id = null where auth_user_id = $1 and id <> $2',
        t
      ) using auth_id, keep_id;
    end loop;
  end loop;
end $$;

-- 1b. Clear dangling student links (auth user no longer exists) before adding the FK.
update public.students s
set auth_user_id = null
where s.auth_user_id is not null
  and not exists (select 1 from auth.users u where u.id = s.auth_user_id);

-- 2. Add the missing FK on students (admin_accounts and preceptors already have it).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'students_auth_user_id_fkey'
      and conrelid = 'public.students'::regclass
  ) then
    alter table public.students
      add constraint students_auth_user_id_fkey
      foreign key (auth_user_id) references auth.users(id) on delete set null;
  end if;
end $$;

-- 3. Partial unique indexes: one auth user backs at most one profile per table.
create unique index if not exists students_auth_user_id_key
  on public.students (auth_user_id) where auth_user_id is not null;

create unique index if not exists admin_accounts_auth_user_id_key
  on public.admin_accounts (auth_user_id) where auth_user_id is not null;

create unique index if not exists preceptors_auth_user_id_key
  on public.preceptors (auth_user_id) where auth_user_id is not null;
