## Context

Greenfield build of the EMS Student Training & Rotation Portal (ESTRP) for the Winchester Fire Department. The application streamlines student onboarding, clinical compliance, shift scheduling, preceptor accountability, and administrative oversight. Architecture follows a serverless-first philosophy: Next.js on Vercel, Supabase for data and auth, Resend for email, Pushover for admin alerts. No infrastructure to manage.

The system serves two user types: **students** (mobile-first onboarding and dashboard) and **admins** (Training Major and EMS Assistant Chief, desktop-optimized command center). Preceptors are data entities only — no login.

## Goals / Non-Goals

**Goals:**
- Multi-step student onboarding with legal waiver capture, resource downloads, and interactive safety quiz with hotspot image testing
- Calendar-based shift scheduling with pending/approved/rejected states and color-coded visual feedback
- Admin command center with approval queues, threaded messaging, attendance tracking, kill switch, analytics, and data export
- Serverless architecture: Next.js + Supabase + Resend + Pushover — zero servers
- Per-student iCal feeds + aggregate admin/preceptor feed for Google Calendar / Apple Calendar subscription
- RLS-enforced data isolation; admin-gated account creation with magic-link authentication for students
- Daily cron sweep for 120-day account expiration; system health heartbeat with emergency push alerts

**Non-Goals:**
- Preceptor login or dashboard (preceptors are data entities, notified via email/iCal)
- Username/password authentication for students (magic links only; admins use email/password)
- Student file uploads
- Real-time WebSocket messaging (polling or on-demand fetch sufficient for v1)
- Mobile native app (mobile-first responsive web only)
- Multi-tenancy beyond WFD

## Decisions

### 1. Next.js App Router (not Pages Router, not SPA)

**Rationale:** App Router provides server components, middleware at the edge, API routes, and layout nesting — all useful for server-rendered onboarding pages, middleware-based auth gating, and API routes for cron/health/iCal endpoints. Vercel deployment is zero-config.

**Alternatives considered:** Pages Router (legacy, less flexible middleware), pure SPA with separate backend (adds infrastructure).

### 2. Supabase Auth: Magic links for students, email/password for admins

**Rationale:** Students authenticate via Supabase magic links (passwordless). On admin approval, a Supabase Auth user is created with the student's email. The system triggers a magic link email via Supabase's `signInWithOtp`. Students never manage a password — reducing support overhead and eliminating credential storage concerns. Admin accounts (Training Major, EMS Assistant Chief) use email/password login since they need more persistent sessions for the command center. Student status (`is_certified`, `access_until`, `is_blacklisted`) lives in the `students` table joined by user UUID. Admin role is stored in `auth.users.raw_user_meta_data.role`. Next.js middleware reads the Supabase session cookie and the students table to enforce access gates.

**Alternatives considered:** Username/password for everyone (password management burden, reset flows), custom auth table (reinventing JWT — error-prone).

### 3. RLS with two policies per table: student SELECT/INSERT/UPDATE (own rows) + admin ALL

**Rationale:** Supabase RLS evaluates server-side on every query. The `auth.uid()` function identifies the caller. Student policies: `auth.uid() = student_id` (for tables with student_id) or join through schedules. Admin policies: `auth.jwt() -> raw_user_meta_data -> role = 'admin'`.

**Key detail:** Admin accounts are pre-created in Supabase Auth with `role: 'admin'` in user metadata. No self-service admin signup.

### 4. iCal feed generation: on-demand API route, not cron

**Rationale:** An API route `/api/calendar/[studentId].ics` generates the iCal file on each request from the current database state. This avoids stale cached files. Google Calendar polls subscribed URLs roughly every 8–24 hours, so regeneration cost is negligible with database caching. The aggregate feed `/api/calendar/all.ics` follows the same pattern.

**Alternatives considered:** Pre-generating .ics files on every status change (writes files to storage, adds complexity), cron-based regeneration (stale data between sweeps).

### 5. Hotspot image testing: percentage-based coordinate zones

**Rationale:** Images in the knowledge gate quiz display at varying sizes across mobile and desktop. Storing click zones as percentage coordinates (`xPercent`, `yPercent`, `radiusPercent`) relative to image dimensions ensures consistent targeting regardless of render size. The client calculates actual pixel positions from the rendered image element's dimensions.

```
Zone definition: { x: 45, y: 30, radius: 5 }  // 45% from left, 30% from top, 5% radius
Click detection: √((clickX% - zoneX%)² + (clickY% - zoneY%)²) < zoneRadius%
```

**Alternatives considered:** Absolute pixel coordinates (breaks on responsive), server-side image processing (complex, latency).

### 6. Image grid quiz: client-side toggle state with server-side validation

**Rationale:** Each image in the grid has a pre-configured correct classification (`acceptable` or `unacceptable`). The student toggles each image's classification. On submit, the client compares against the correct answers. Server re-validates on the final submission to prevent tampering.

### 7. Resend integration via server-side API route

**Rationale:** Resend API key stays server-side. A utility function `sendEmail(template, data)` wraps the Resend SDK. Templates are defined as React Email components or simple HTML strings. All email triggers (onboarding complete, account approved, schedule status change, evaluation receipt) call this utility from API routes or server actions.

### 8. Pushover integration via server-side HTTP POST

**Rationale:** Pushover is a simple REST API. A utility function `sendPushoverAlert(user, message, priority)` wraps the HTTP call. Emergency priority includes `retry: 30` (seconds) and `expire: 3600` parameters for persistent alerting until acknowledged.

### 9. Vercel Cron for daily sweep (not pg_cron, not external service)

**Rationale:** Vercel Cron triggers the `/api/cron/sweep` endpoint daily. The endpoint queries students with `access_until < NOW()` and batches status updates. With expected daily volume of 0–20 expirations, execution stays well within Hobby tier limits (60s). If the project upgrades to Pro, limits increase to 900s.

**Alternatives considered:** pg_cron (requires Supabase Pro, adds PG-specific dependency), external cron service (adds another service to manage).

### 10. TailwindCSS theme: WFD brand colors via tailwind.config.ts extensions

```typescript
colors: {
  wfd: {
    crimson: '#B61C20',       // Primary buttons, headers, active states
    charcoal: '#1C1C1E',      // Navbar, sidebar, headings
    gold: '#D4AF37',          // Pending indicators, high-priority alerts
  },
},
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
},
```

### 11. Project route structure

```
src/
├── app/
│   ├── onboarding/          # Phase 1: registration, legal, resources, quiz
│   ├── login/               # Magic link callback + admin email/password login
│   ├── dashboard/           # Phase 2: student calendar, preceptors, evals
│   ├── admin/               # Phase 3: command center (3 tabs)
│   ├── api/
│   │   ├── cron/sweep/      # Daily expiration sweep
│   │   ├── health/          # System heartbeat
│   │   └── calendar/        # iCal feed generation
│   └── layout.tsx           # Root layout with theme providers
├── components/
│   ├── ui/                  # Shadcn-style primitives
│   ├── onboarding/          # RegistrationForm, LegalWaiver, ResourceLibrary, KnowledgeGate
│   ├── dashboard/           # CalendarGrid, ShiftModal, PreceptorCard, EvalForm
│   └── admin/               # ApprovalQueue, MessageThread, AttendanceTracker, KillSwitch, AnalyticsCharts
├── lib/
│   ├── supabase/            # Client, server, admin clients + types
│   ├── email.ts             # Resend utility
│   ├── pushover.ts          # Pushover utility
│   ├── ical.ts              # iCal feed generator
│   └── auth.ts              # Auth helpers, middleware
└── middleware.ts             # Route protection, access expiry check
```

## Risks / Trade-offs

- **[Risk] Shared onboarding token `?token=WFD_TRAINING_2026` is weak access control** → Mitigation: Token is per-cohort and rotated (e.g., `WFD_SPRING_2026`). Real auth gates the dashboard. Rate-limit the onboarding endpoint. Document that the token is not a secret.

- **[Risk] Hotspot quiz zones may feel imprecise on touchscreens** → Mitigation: Use generous tolerance radius (8–10% of image dimension). Test on actual mobile devices during development.

- **[Risk] Resend or Pushover API downtime blocks notifications** → Mitigation: All notification calls are fire-and-forget with try/catch. Failures log to console for Vercel log monitoring. Critical flows (account creation, approval) proceed even if notification fails.

- **[Risk] Vercel Hobby tier cold starts may slow first load** → Mitigation: Acceptable for a departmental tool with low concurrent users. Pro tier available if needed.

- **[Risk] RLS policy complexity may cause subtle data leaks** → Mitigation: Test each policy with both student and admin auth contexts during development. The audit_log table records all write actions as a secondary check.

- **[Trade-off] No real-time WebSocket for messaging** → Students and admins refresh or poll for new messages. Acceptable for v1 given the low message volume. Supabase Realtime subscriptions can be added later without schema changes.

## Open Questions

- **Preceptor image hosting**: Will preceptor headshots be stored in Supabase Storage or referenced via external URLs? External URLs are simpler for initial deployment; Storage buckets provide more control.
- **PDF export library**: Server-side (PDFKit, jsPDF on the server) vs client-side (html2pdf)? Recommendation: server-side via an API route for consistency.
- **Knowledge gate slide content**: Who will provide the actual safety photographs, hotspot zone definitions, and quiz questions? The system expects these as a configuration object or database rows.
