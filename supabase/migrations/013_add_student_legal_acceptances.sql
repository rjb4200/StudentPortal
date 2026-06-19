-- Migration 013: Add student_legal_acceptances table
-- Fixes issues #37 and #38: per-document acceptance tracking and real IP capture

begin;

create table if not exists student_legal_acceptances (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  document_id uuid not null references legal_documents(id) on delete cascade,
  accepted_at timestamptz not null default now(),
  constraint student_legal_acceptances_pkey primary key (id),
  constraint student_legal_acceptances_student_document_unique unique (student_id, document_id)
);

commit;
