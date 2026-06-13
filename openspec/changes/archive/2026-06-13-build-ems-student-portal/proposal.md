## Why

The Winchester Fire Department (WFD) Training & EMS Divisions need a centralized portal to streamline student onboarding, clinical compliance tracking, shift scheduling, and preceptor accountability. Currently these processes are manual, fragmented across email and paper, and lack real-time visibility for the Training Major and EMS Assistant Chief.

## What Changes

- **Student onboarding pipeline**: Multi-step workflow with registration, legal waiver capture (HIPAA NDA + liability), resource library downloads, and interactive knowledge gate safety quiz with hotspot image testing
- **Student dashboard**: Calendar-based shift scheduling with one-click date selection, preceptor gallery with bios and specialty tags, standardized clinical evaluation matrix
- **Admin command center**: Three-tab interface for daily operations (approvals, messaging, attendance tracking with no-show counters and kill switch), preceptor analytics with export, and maintenance/archive tools
- **Authentication & authorization**: Supabase Auth with admin-gated approval flow; students receive magic link emails for passwordless authentication; admins use email/password login; RLS policies enforce data isolation
- **Notifications & alerts**: Resend transactional emails (onboarding confirmations, schedule approvals, evaluation receipts); Pushover high-priority alerts for Training Major; per-student iCal/Google Calendar subscription feeds tracking pending and approved shifts; aggregate iCal feed for admin/preceptor view of all students
- **Automated lifecycle management**: Daily cron sweep expires student accounts at 120 days; system health heartbeat with Pushover emergency alert on database failure; attendance no-show tracking surfaces violations to admin (3+ triggers visibility flag)

## Capabilities

### New Capabilities

- `student-onboarding`: Registration form, legal waiver & HIPAA NDA signing, resource library downloads, interactive knowledge gate with safety quiz and hotspot image testing
- `student-dashboard`: Calendar shift scheduling, preceptor gallery with bios/tags, clinical evaluation submission forms, iCal subscription feed
- `admin-command-center`: Daily operations hub with approval queue, threaded messaging, attendance tracker with no-show escalation, kill switch; preceptor analytics leaderboard with CSV/PDF export; maintenance and data archive tools
- `authentication-authorization`: Supabase Auth with admin-approved account creation, magic link authentication for students (passwordless), email/password for admins, role-based access (student vs admin), Row Level Security on all tables
- `notifications-alerts`: Resend email delivery for onboarding, approvals, evaluations; Pushover high-priority alerts; iCal/Google Calendar feed generation (per-student and aggregate)
- `scheduling-calendar`: Calendar UI with pending/approved/rejected states, admin approval workflow, automatic iCal feed regeneration on state changes
- `data-management`: Supabase PostgreSQL schema with all tables, RLS policies, daily cron sweep for 120-day expiration, system health heartbeat, CSV/PDF export, data purge workflow

### Modified Capabilities

*(None — this is a greenfield project with no existing specs.)*

## Impact

- **New project**: Next.js (App Router) + TypeScript + TailwindCSS — deployed on Vercel
- **New database**: Supabase PostgreSQL with 7 tables (students, preceptors, schedules, evaluations, admin_notes, messages, audit_log), RLS policies, storage buckets
- **New services**: Resend (transactional email), Pushover (admin push alerts), Vercel Cron (scheduled tasks)
- **No existing systems affected**: Greenfield build with no migration burden
