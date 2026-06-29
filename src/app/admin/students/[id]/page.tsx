import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Disclosure } from '@/components/ui/disclosure';
import { CompletenessWarnings } from '@/components/admin/student-profile/completeness-warnings';
import { LegalDocumentsSection } from '@/components/admin/student-profile/legal-documents-section';
import { AdminNotesSection } from '@/components/admin/student-profile/admin-notes-section';
import { OnboardingTestSection } from '@/components/admin/student-profile/onboarding-test-section';
import { RideHistorySection } from '@/components/admin/student-profile/ride-history-section';
import { PrintPacketButton } from '@/components/admin/student-profile/print-packet-button';
import { CopyButton } from '@/components/admin/student-profile/copy-button';

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: student, error } = await supabase
    .from('students')
    .select(`
      *,
      instructors(*, training_sites(*)),
      training_sites(*),
      training_classes(*, training_sites(*), instructors(*)),
      schedules(*),
      admin_notes(*),
      student_legal_acceptances(*, legal_documents(*)),
      quiz_flags(*)
    `)
    .eq('id', id)
    .single();

  if (error || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-xl font-bold text-wfd-charcoal mb-2">Student Not Found</h1>
          <p className="text-gray-500 mb-4">No student found with that ID.</p>
          <Link href="/admin" className="text-wfd-crimson hover:underline text-sm">
            &larr; Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  const instructor = student.instructors;
  const trainingSite = student.training_sites;
  const trainingClass = student.training_classes;
  const legalAcceptances = student.student_legal_acceptances || [];
  const adminNotes = student.admin_notes || [];
  const schedules = student.schedules || [];
  const quizFlags = student.quiz_flags || [];

  const warnings: string[] = [];
  if (!student.training_site_id && !trainingSite) warnings.push('No TEI / Training Site assigned');
  if (!student.instructor_id && !instructor) warnings.push('No instructor linked');
  if (instructor && !instructor.business_phone && !instructor.mobile_phone) warnings.push('Instructor phone number missing');
  if (legalAcceptances.length === 0) warnings.push('No signed legal documents');
  if (!student.onboarding_completed_at) warnings.push('Onboarding test not completed');
  if (!student.training_class_id && !trainingClass) warnings.push('No class association found');

  const statusVariant = student.status === 'certified' ? 'green' : student.status === 'pending' ? 'gold' : 'gray';

  const sortedNotes = [...adminNotes].sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const sectionAccent = (status: string | undefined, exists: boolean) => {
    if (!exists) return 'border-gray-300';
    if (status === 'active' || status === 'certified') return 'border-green-500';
    if (status === 'pending') return 'border-amber-400';
    return 'border-gray-400';
  };

  const instructorAccent = instructor
    ? instructor.status === 'active' ? 'border-green-500' : instructor.status === 'pending' ? 'border-amber-400' : 'border-gray-400'
    : student.instructor_name ? 'border-amber-400' : 'border-red-400';

  const approvedRides = schedules.filter((s: any) => s.status === 'approved').length;
  const pendingRides = schedules.filter((s: any) => s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-white print:bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-sm text-wfd-crimson hover:underline print:hidden">
            &larr; Back to Admin Command Center
          </Link>
          <div className="flex items-center gap-3">
            <PrintPacketButton />
            <a href={`/admin/accounts?edit=${student.id}`} className="text-sm text-wfd-crimson hover:underline print:hidden">
              Edit Student
            </a>
          </div>
        </div>

        {warnings.length > 0 && <CompletenessWarnings warnings={warnings} />}

        {/* === Status Summary Card === */}
        <Card className="overflow-hidden print:shadow-none border-l-4 border-l-wfd-crimson">
          <div className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h1 className="text-2xl font-bold text-wfd-charcoal">{student.full_name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{student.email}</p>
                {student.phone && <p className="text-sm text-gray-400">{student.phone}</p>}
                {student.school_name && <p className="text-xs text-gray-400 italic">{student.school_name}</p>}
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge variant={statusVariant} className="text-sm px-3 py-1">{student.status}</Badge>
                {student.is_blacklisted && <Badge variant="red" className="text-sm px-3 py-1">Blacklisted</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 text-sm">
              <div className="bg-gray-50/50 rounded-lg p-3">
                <span className="text-wfd-crimson/70 block text-xs uppercase tracking-wider font-semibold mb-1">Class</span>
                <span className="text-wfd-charcoal font-semibold">{trainingClass ? trainingClass.name : '—'}</span>
              </div>
              <div className="bg-gray-50/50 rounded-lg p-3">
                <span className="text-wfd-crimson/70 block text-xs uppercase tracking-wider font-semibold mb-1">Instructor</span>
                <span className="text-wfd-charcoal font-semibold">{instructor ? `${instructor.first_name} ${instructor.last_name}` : (student.instructor_name || '—')}</span>
              </div>
              <div className="bg-gray-50/50 rounded-lg p-3">
                <span className="text-wfd-crimson/70 block text-xs uppercase tracking-wider font-semibold mb-1">TEI</span>
                <span className="text-wfd-charcoal font-semibold">{trainingSite ? trainingSite.name : '—'}</span>
              </div>
              <div className="bg-gray-50/50 rounded-lg p-3">
                <span className="text-wfd-crimson/70 block text-xs uppercase tracking-wider font-semibold mb-1">Class Start</span>
                <span className="text-wfd-charcoal font-semibold">
                  {trainingClass?.class_start_date ? new Date(trainingClass.class_start_date).toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="bg-gray-50/50 rounded-lg p-3">
                <span className="text-wfd-crimson/70 block text-xs uppercase tracking-wider font-semibold mb-1">Ride-Time Ends</span>
                <span className="text-wfd-charcoal font-semibold">
                  {trainingClass?.ride_time_end_date ? new Date(trainingClass.ride_time_end_date).toLocaleDateString() : (student.access_until ? new Date(student.access_until).toLocaleDateString() : '—')}
                </span>
              </div>
              <div className="bg-gray-50/50 rounded-lg p-3">
                <span className="text-wfd-crimson/70 block text-xs uppercase tracking-wider font-semibold mb-1">Onboarding Test</span>
                <Badge variant={student.onboarding_completed_at ? 'green' : 'gray'}>{student.onboarding_completed_at ? 'Completed' : 'Not completed'}</Badge>
              </div>
              <div className="bg-gray-50/50 rounded-lg p-3">
                <span className="text-wfd-crimson/70 block text-xs uppercase tracking-wider font-semibold mb-1">Legal Docs</span>
                <Badge variant={legalAcceptances.length > 0 ? 'green' : 'gray'}>{legalAcceptances.length > 0 ? `${legalAcceptances.length} signed` : 'None'}</Badge>
              </div>
              {student.no_show_count > 0 && (
                <div className="bg-gray-50/50 rounded-lg p-3">
                  <span className="text-wfd-crimson/70 block text-xs uppercase tracking-wider font-semibold mb-1">No-Shows</span>
                  <Badge variant="red">{student.no_show_count}</Badge>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {/* === Instructor === */}
          <Disclosure
            title="Instructor"
            summary={instructor
              ? `${instructor.first_name} ${instructor.last_name} — ${instructor.status || 'Active'}`
              : (student.instructor_name || 'Not assigned')}
            className={`border-l-4 ${instructorAccent}`}
          >
            {instructor ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Name</span>
                    <p className="font-semibold text-wfd-charcoal text-base">{instructor.first_name} {instructor.last_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Title</span>
                    <p className="font-semibold text-wfd-charcoal">{instructor.title || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Email</span>
                    <p className="font-medium text-wfd-charcoal">{instructor.email || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Status</span>
                    <Badge variant={instructor.status === 'active' ? 'green' : 'gold'}>{instructor.status || '—'}</Badge>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Business Phone</span>
                    <p className="font-medium text-wfd-charcoal">{instructor.business_phone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Mobile Phone</span>
                    <p className="font-medium text-wfd-charcoal">{instructor.mobile_phone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Credentials</span>
                    <p className="font-medium text-wfd-charcoal">{instructor.credentials || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Preferred Contact</span>
                    <p className="font-medium text-wfd-charcoal capitalize">
                      {instructor.preferred_contact_method || '—'}
                      {instructor.preferred_contact_hours && <span className="block text-xs text-gray-400 normal-case">{instructor.preferred_contact_hours}</span>}
                    </p>
                  </div>
                  {instructor.contact_instructions && (
                    <div className="col-span-2">
                      <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Contact Instructions</span>
                      <p className="font-medium text-wfd-charcoal text-sm mt-0.5">{instructor.contact_instructions}</p>
                    </div>
                  )}
                  {instructor.training_sites && (
                    <div className="col-span-2">
                      <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Training Site</span>
                      <p className="font-semibold text-wfd-charcoal">{instructor.training_sites.name}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                  {instructor.email && <a href={`mailto:${instructor.email}`} className="text-xs px-3 py-1.5 rounded-full bg-wfd-crimson/10 text-wfd-crimson font-medium hover:bg-wfd-crimson/20 transition-colors">Email Instructor</a>}
                  {instructor.business_phone && <CopyButton text={instructor.business_phone} label="Copy Business" />}
                  {instructor.mobile_phone && <CopyButton text={instructor.mobile_phone} label="Copy Mobile" />}
                  {instructor.email && <CopyButton text={instructor.email} label="Copy Email" />}
                </div>
              </div>
            ) : student.instructor_name ? (
              <div className="space-y-2 bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-wfd-charcoal"><span className="text-gray-500 font-semibold">Name:</span> {student.instructor_name}</p>
                {student.instructor_contact && <p className="text-sm text-wfd-charcoal"><span className="text-gray-500 font-semibold">Contact:</span> {student.instructor_contact}</p>}
                <div className="flex items-center gap-2 text-xs text-amber-700 mt-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  Not linked to a registry record
                </div>
              </div>
            ) : <p className="text-sm text-gray-400 py-2">No instructor assigned</p>}
          </Disclosure>

          {/* === TEI === */}
          <Disclosure
            title="TEI / Training Site"
            summary={trainingSite ? `${trainingSite.name} — ${trainingSite.status || 'Active'}` : 'Not assigned'}
            className={`border-l-4 ${trainingSite ? (trainingSite.status === 'active' ? 'border-green-500' : 'border-amber-400') : 'border-red-400'}`}
          >
            {trainingSite ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Name</span>
                    <p className="font-semibold text-wfd-charcoal text-base">{trainingSite.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Status</span>
                    <Badge variant={trainingSite.status === 'active' ? 'green' : 'gold'}>{trainingSite.status || '—'}</Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Organization</span>
                    <p className="font-semibold text-wfd-charcoal">{trainingSite.organization_name || '—'}</p>
                  </div>
                  {trainingSite.address && (
                    <div className="col-span-2">
                      <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Address</span>
                      <p className="font-medium text-wfd-charcoal">{trainingSite.address}</p>
                    </div>
                  )}
                  {(trainingSite.city || trainingSite.state) && (
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Location</span>
                      <p className="font-medium text-wfd-charcoal">{[trainingSite.city, trainingSite.state, trainingSite.zip_code].filter(Boolean).join(', ') || '—'}</p>
                    </div>
                  )}
                  {trainingSite.main_phone && (
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Phone</span>
                      <p className="font-medium text-wfd-charcoal">{trainingSite.main_phone}</p>
                    </div>
                  )}
                </div>
                {trainingSite.main_phone && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                    <CopyButton text={trainingSite.main_phone} label="Copy Phone" />
                  </div>
                )}
              </div>
            ) : <p className="text-sm text-gray-400 py-2">No training site assigned</p>}
          </Disclosure>

          {/* === Training Class === */}
          <Disclosure
            title="Training Class"
            summary={trainingClass ? `${trainingClass.name} — ${trainingClass.class_start_date ? 'Starts ' + new Date(trainingClass.class_start_date).toLocaleDateString() : 'No start date'}` : 'Not assigned'}
            className={`border-l-4 ${trainingClass ? (trainingClass.status === 'active' ? 'border-green-500' : 'border-amber-400') : 'border-red-400'}`}
          >
            {trainingClass ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Name</span>
                    <p className="font-semibold text-wfd-charcoal text-base">{trainingClass.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Status</span>
                    <Badge variant={trainingClass.status === 'active' ? 'green' : 'gold'}>{trainingClass.status || '—'}</Badge>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Start Date</span>
                    <p className="font-semibold text-wfd-charcoal">{trainingClass.class_start_date || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Ride-Time Ends</span>
                    <p className="font-semibold text-wfd-charcoal">{trainingClass.ride_time_end_date || '—'}</p>
                  </div>
                </div>
                {trainingClass.training_sites && (
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Training Site</span>
                    <p className="font-medium text-wfd-charcoal text-sm">{trainingClass.training_sites.name}</p>
                  </div>
                )}
                {trainingClass.instructors && (
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Assigned Instructor</span>
                    <p className="font-medium text-wfd-charcoal text-sm">{trainingClass.instructors.first_name} {trainingClass.instructors.last_name}</p>
                  </div>
                )}
              </div>
            ) : <p className="text-sm text-gray-400 py-2">No training class assigned</p>}
          </Disclosure>

          {/* === Legal Documents === */}
          <Disclosure
            title="Signed Legal Documents"
            summary={legalAcceptances.length > 0 ? `${legalAcceptances.length} document${legalAcceptances.length > 1 ? 's' : ''} signed` : 'None'}
            className={`border-l-4 ${legalAcceptances.length > 0 ? 'border-green-500' : 'border-red-400'}`}
          >
            <LegalDocumentsSection
              acceptances={legalAcceptances}
              studentName={student.full_name}
              signatureIp={student.signature_ip}
              signatureTimestamp={student.signature_timestamp}
            />
          </Disclosure>

          {/* === Admin Notes === */}
          <Disclosure
            title="Admin Notes"
            summary={sortedNotes.length > 0 ? `${sortedNotes.length} note${sortedNotes.length > 1 ? 's' : ''}` : 'None'}
            className="border-l-4 border-wfd-charcoal"
          >
            <AdminNotesSection notes={sortedNotes} studentId={student.id} />
          </Disclosure>

          {/* === Onboarding Test === */}
          <Disclosure
            title="Onboarding Test"
            summary={student.onboarding_completed_at ? `Completed ${new Date(student.onboarding_completed_at).toLocaleDateString()}` : 'Not completed'}
            className={`border-l-4 ${student.onboarding_completed_at ? 'border-green-500' : quizFlags.length > 0 ? 'border-amber-400' : 'border-red-400'}`}
          >
            <OnboardingTestSection
              onboardingCompletedAt={student.onboarding_completed_at}
              quizFlags={quizFlags}
            />
          </Disclosure>

          {/* === Ride History === */}
          <Disclosure
            title="Ride History"
            summary={schedules.length > 0 ? `${schedules.length} total · ${approvedRides} approved · ${pendingRides} pending` : 'No rides'}
            className={`border-l-4 ${schedules.length > 0 ? 'border-green-500' : 'border-gray-300'}`}
          >
            <RideHistorySection schedules={schedules} />
          </Disclosure>
        </div>
      </div>
    </div>
  );
}
