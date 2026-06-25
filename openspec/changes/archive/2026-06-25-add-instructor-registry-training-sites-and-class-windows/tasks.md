## 1. Database And Types

- [x] 1.1 Add a Supabase migration for `training_sites`, `instructors`, and `training_classes` with status constraints or enum values, approval metadata, timestamps, foreign keys, indexes, and date-range validation.
- [x] 1.2 Add nullable `training_site_id`, `instructor_id`, and `training_class_id` foreign keys and indexes to `students` while preserving legacy manual fields.
- [x] 1.3 Add RLS policies for registry tables so admins can manage all records and public/student-facing reads only expose active currently visible class options.
- [x] 1.4 Update or replace `register_onboarding_student` to accept selected class id, save class/site/instructor relationships, and populate legacy display fields for compatibility.
- [x] 1.5 Add database-level or API-level enforcement preventing class-linked students from creating schedules outside their selected class date window.
- [x] 1.6 Apply the migration live in Supabase and update `src/lib/supabase/database.types.ts` from the live schema.

## 2. Validation And APIs

- [x] 2.1 Add Zod schemas for instructor registration, training site input, training class input, class date ranges, class selection, and class-window schedule creation.
- [x] 2.2 Add a public instructor registration API route that validates input and creates pending instructor, site, and class records using the admin client.
- [x] 2.3 Add a student-facing class options API or safe query path that returns only active classes inside the current local date window with site/class display labels.
- [x] 2.4 Update `/api/onboarding/register` to require `trainingClassId` for new registrations and pass it to the registration RPC.
- [x] 2.5 Add admin API routes or safe admin-client actions for approving, rejecting, suspending, archiving, editing, and manually creating instructors, sites, and classes.
- [x] 2.6 Update student schedule creation to use a validated API route or database-enforced write path instead of relying only on client-side inserts.

## 3. Public And Onboarding UI

- [x] 3.1 Replace the public home Need Help contact tile with a Register as Instructor link to the instructor registration flow.
- [x] 3.2 Build the public instructor registration flow for instructor, training site, and class details with clear pending-review confirmation.
- [x] 3.3 Update the student registration form to load approved visible Site/Class options and render one required combined dropdown.
- [x] 3.4 Remove new-student dependence on manual school/instructor/contact fields while preserving custom registration fields and legacy compatibility.
- [x] 3.5 Add empty/error states when no active class options are available.

## 4. Admin UI

- [x] 4.1 Add pending instructor, training site, and training class submissions to the Daily Operations Action Required card.
- [x] 4.2 Add admin actions to approve, reject, suspend, archive, edit, and manually create instructors, training sites, and training classes.
- [x] 4.3 Add a management view showing active/inactive instructors, sites, classes, class date windows, and students assigned to each class.
- [x] 4.4 Update pending student rows and roster displays to show selected Site/Class context when available.
- [x] 4.5 Update countdown badge hover text to include class name and ride-time end date for class-linked students.

## 5. Access, Scheduling, And Notifications

- [x] 5.1 Update student approval so class-linked students get `access_until` from the selected class `ride_time_end_date` and unassigned legacy students keep existing behavior.
- [x] 5.2 Update dashboard data loading to include selected class date-window context for class-linked students.
- [x] 5.3 Grey out and disable calendar dates before `class_start_date` and after `ride_time_end_date` for class-linked students.
- [x] 5.4 Ensure out-of-window schedule attempts are rejected with a useful UI error.
- [x] 5.5 Update onboarding/admin notification content to include class, site, and instructor details when available and fall back to legacy fields otherwise.
- [x] 5.6 Update master export and purge behavior to explicitly include or preserve registry records without orphaning student data.

## 6. Verification

- [x] 6.1 Add or update unit tests for validation schemas, registration API behavior, class option filtering, approval expiration, and schedule window enforcement.
- [x] 6.2 Manually verify public instructor submission creates pending records that do not appear in student class options before approval.
- [x] 6.3 Manually verify approved active classes appear only during their inclusive date window.
- [x] 6.4 Manually verify a new class-linked student registration saves all three relationship ids and approval sets `access_until` from ride-time end date.
- [x] 6.5 Manually verify existing unassigned students retain legacy access behavior.
- [x] 6.6 Run `npm run test`.
- [x] 6.7 Run `npm run build`.
