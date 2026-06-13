## 1. Project Scaffold & Configuration

- [x] 1.1 Initialize Next.js project with App Router, TypeScript, and TailwindCSS
- [x] 1.2 Configure Tailwind theme extensions: WFD crimson (`#B61C20`), charcoal (`#1C1C1E`), gold (`#D4AF37`), Inter font
- [x] 1.3 Set up environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `PUSHOVER_APP_TOKEN`, `PUSHOVER_USER_KEY`
- [x] 1.4 Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `resend`, `ical-generator`, `jspdf`, `recharts`, date-fns
- [x] 1.5 Create Supabase client utilities: browser client, server client, admin client (`src/lib/supabase/`)
- [x] 1.6 Set up root layout with WFD branding wrapper and middleware for route protection

## 2. Database Schema & RLS

- [x] 2.1 Create Supabase migration: `students` table with all columns, constraints, and `email` unique index
- [x] 2.2 Create Supabase migration: `preceptors` table with `specialty_tags` text array and `station_unit` enum
- [x] 2.3 Create Supabase migration: `schedules` table with foreign keys to students, `shift_type` and `status` enums, index on `student_id` + `date`
- [x] 2.4 Create Supabase migration: `evaluations` table with foreign keys to students and preceptors, 1-5 rating constraints, index on `preceptor_id`
- [x] 2.5 Create Supabase migration: `admin_notes` table with foreign key to students and `priority` enum
- [x] 2.6 Create Supabase migration: `messages` table with foreign key to students and `sender` enum
- [x] 2.7 Create Supabase migration: `audit_log` table
- [x] 2.8 Enable RLS on all 7 tables and create student policies (SELECT/INSERT/UPDATE own rows only)
- [x] 2.9 Create admin RLS bypass policies using `auth.jwt()` role metadata check
- [x] 2.10 Generate TypeScript types from Supabase schema

## 3. Authentication & Authorization

- [x] 3.1 Configure Supabase Auth: enable magic link provider for students, disable public sign-up endpoint, enable email/password for admin accounts only
- [x] 3.2 Create admin user accounts in Supabase Auth with `role: 'admin'` in user metadata
- [x] 3.3 Implement Next.js middleware: check Supabase session, verify student `access_until` not expired, verify `is_blacklisted = false`, redirect accordingly
- [x] 3.4 Create onboarding access token validation (`?token=WFD_TRAINING_2026`)
- [x] 3.5 Implement admin approval flow: create Supabase Auth user via service role API with student's email, set `status = 'certified'` and `access_until = NOW() + 120 days`, trigger magic link email via Supabase Auth
- [x] 3.6 Build login page with WFD branding: magic link email input for students, email/password form for admins; redirect logic (student → `/dashboard`, admin → `/admin`, uncertified → `/onboarding`)

## 4. WFD Branding & Shared UI

- [x] 4.1 Create shared layout component with WFD logo centered at top, crimson header bar, charcoal navbar
- [x] 4.2 Build reusable UI primitives: Button (crimson primary, charcoal secondary, red danger), Modal, Card, Badge, Input (styled to WFD theme)
- [x] 4.3 Create page transitions and loading states with WFD crimson spinner/skeleton
- [x] 4.4 Mobile-first responsive styles: single-column on mobile, two-panel on desktop for admin

## 5. Phase 1: Student Onboarding

- [x] 5.1 Build `/onboarding` route with token gate and multi-step progress indicator
- [x] 5.2 Step 1 — Registration form: full name, email, phone, school, instructor name, instructor contact; validate uniqueness of email against Supabase
- [x] 5.3 Step 2 — Legal waiver & HIPAA NDA: scrollable document containers, full name input, checkbox agreement; capture `signature_ip` and `signature_timestamp` on submit
- [x] 5.4 Step 3 — Resource library: download buttons for Station 1/2/3 maps and Departmental SOGs (PDF files in Supabase Storage or public directory)
- [x] 5.5 Step 4 — Knowledge gate engine: slide deck framework with progress tracking and failure counter (3 strikes = reset to slide 1)
- [x] 5.6 Step 4a — Hotspot quiz component: render scene photograph, define percentage-based click zones, detect correct/incorrect clicks, display strike counter, handle responsive scaling
- [x] 5.7 Step 4b — Image grid quiz component: display grid of safety images, toggle acceptable/unacceptable per image, validate all classifications on submit
- [x] 5.8 Step 4c — Standard multiple-choice safety questions mixed between hotspot and grid sections
- [x] 5.9 On knowledge gate completion: set `is_certified = true`, trigger Pushover alert to Training Major, trigger Resend email to Training Major with student details and approval link

## 6. Phase 2: Student Dashboard

- [x] 6.1 Build `/dashboard` route with auth gate (redirect uncertified/expired/blacklisted to `/onboarding`)
- [x] 6.2 Calendar grid component: render monthly calendar with navigation (prev/next month), highlight today, disable past dates
- [x] 6.3 Calendar date cell styling: pending = yellow/striped (`#D4AF37`), approved = solid crimson (`#B61C20`), rejected = distinct style
- [x] 6.4 Shift request modal: on date click, show modal with Full Shift/Day/Night radio selection, confirm and cancel actions
- [x] 6.5 Create schedule record on shift request submit (status `pending`), refresh calendar with optimistic UI update
- [x] 6.6 Preceptor gallery component: fetch active preceptors from Supabase, render cards with headshot, bio, station/unit, specialty tag badges
- [x] 6.7 Evaluation form component: preceptor selector dropdown, 1-5 rating matrix for clinical/teaching/safety/overall, comments textarea, submit with validation (all ratings required)
- [x] 6.8 Flag evaluation: set `is_flagged = true` when `overall_rating < 3`, trigger Pushover alert to admin
- [x] 6.9 On evaluation submit: trigger Resend receipt email to student
- [x] 6.10 Student messaging: simple message list and compose form, scoped to student's own messages, send/receive with admin

## 7. Phase 3: Admin Command Center

- [x] 7.1 Build `/admin` route with admin-only auth gate (403 if student)
- [x] 7.2 Three-tab layout: Daily Operations, Preceptor Analytics, Maintenance & Archive with tab navigation
- [x] 7.3 Tab 1 — Student approval queue: list pending students with name/school/instructor/date, Approve button per row
- [x] 7.4 Tab 1 — Schedule request management: list pending shift requests, Approve/Reject buttons per row; on action update status, regenerate iCal, send email
- [x] 7.5 Tab 1 — Threaded messaging: student list panel, message thread per student, compose reply, auto-scroll to latest
- [x] 7.6 Tab 1 — Attendance tracker: per-student no-show increment button, display `no_show_count`, warning overlay at count >= 3
- [x] 7.7 Tab 1 — Admin note bubbles: add note with priority selector (normal/high_accessibility), display as hover-expandable blue/orange badges on student rows
- [x] 7.8 Tab 1 — Kill switch: red toggle per student, native confirm modal on activation, instant reactivation reverse switch
- [x] 7.9 Tab 1 — Active Students Ticker: recently approved students and recent evaluation submissions (bottom panel)
- [x] 7.10 Tab 2 — Preceptor leaderboard: ranked list by average rating, bar chart via Recharts
- [x] 7.11 Tab 2 — Trend charts: evaluation scores over time per preceptor, line chart via Recharts
- [x] 7.12 Tab 2 — Export to CSV button: generate and download preceptor evaluation data as CSV file
- [x] 7.13 Tab 2 — Export to PDF button: generate and download preceptor evaluation report as PDF file
- [x] 7.14 Tab 3 — Master Export button: download all data from all tables as a combined export file
- [x] 7.15 Tab 3 — Purge Data form: enabled only after successful master export download; confirm modal; delete students (cascade to schedules, evaluations, messages, notes), keep preceptors and audit_log

## 8. Notifications & Calendar Feeds

- [x] 8.1 Create Resend email utility (`src/lib/email.ts`): `sendEmail(template, to, data)` with templates for onboarding-notification, schedule-approved, schedule-rejected, evaluation-receipt (magic link emails handled by Supabase Auth)
- [x] 8.2 Create Pushover utility (`src/lib/pushover.ts`): `sendAlert(user, title, message, priority)` with Emergency/High priority retry parameters
- [x] 8.3 Build iCal feed generator (`src/lib/ical.ts`): generate `.ics` string from schedule records with pending/approved event properties
- [x] 8.4 Create `/api/calendar/[studentId].ics` route: fetch student's schedules, generate and return iCal file, cache headers
- [x] 8.5 Create `/api/calendar/all.ics` route: fetch all active students' approved schedules, generate aggregate iCal with student name in event title
- [x] 8.6 Display per-student iCal feed URL in student dashboard with copy button
- [x] 8.7 Display aggregate iCal feed URL in admin maintenance tab with copy button

## 9. Automation & Backend

- [x] 9.1 Create `/api/cron/sweep` route: query students with `access_until < NOW()` and `status != 'expired'`, batch update to `'expired'`
- [x] 9.2 Configure Vercel Cron to trigger `/api/cron/sweep` daily
- [x] 9.3 Create `/api/health` route: perform database read + write (health check row), check database capacity, trigger Pushover emergency on timeout or >90% capacity
- [x] 9.4 Add audit logging utility: insert to `audit_log` on key events (student approval, kill switch toggle, schedule approval/rejection, data purge)

## 10. Polish & Testing

- [ ] 10.1 Test full onboarding flow end-to-end: token gate → register → legal → resources → knowledge gate → admin notification
- [ ] 10.2 Test auth flow: admin approval → magic link email → student clicks link → dashboard access granted
- [ ] 10.3 Test middleware gates: expired student redirect, blacklisted redirect, student accessing /admin returns 403
- [ ] 10.4 Test RLS policies: student can only see own data, admin sees all data
- [ ] 10.5 Test calendar flow: request shift → admin approve → student sees crimson cell → iCal feed updates
- [ ] 10.6 Test notification delivery: Resend emails fire correctly, Pushover alerts fire on key events
- [ ] 10.7 Test cron sweep: manually trigger sweep endpoint, verify expired students are updated
- [ ] 10.8 Test health endpoint: verify 200 OK on healthy DB, verify Pushover fires on simulated failure
- [ ] 10.9 Test admin kill switch: terminate → confirm student redirect → reactivate → confirm student restored
- [ ] 10.10 Test export and purge: master export downloads, purge enables, purge deletes correct data
- [ ] 10.11 Mobile responsiveness QA: test onboarding and dashboard on 375px, 768px, and 1440px viewports
- [x] 10.12 Add loading states, error boundaries, and toast notifications throughout
