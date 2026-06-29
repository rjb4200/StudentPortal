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
      <div className="min-h-screen flex items-center justify-center">
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
  if (!student.training_site_id && !trainingSite) {
    warnings.push('No TEI / Training Site assigned');
  }
  if (!student.instructor_id && !instructor) {
    warnings.push('No instructor linked');
  }
  if (instructor && !instructor.business_phone) {
    warnings.push('Instructor phone number missing');
  }
  if (legalAcceptances.length === 0) {
    warnings.push('No signed legal documents');
  }
  if (!student.onboarding_completed_at) {
    warnings.push('Onboarding test not completed');
  }
  if (!student.training_class_id && !trainingClass) {
    warnings.push('No class association found');
  }

  const statusVariant =
    student.status === 'certified' ? 'green' :
    student.status === 'pending' ? 'gold' : 'gray';

  const sortedNotes = [...adminNotes].sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-sm text-wfd-crimson hover:underline print:hidden">
            &larr; Back to Admin Command Center
          </Link>
          <div className="flex items-center gap-3">
            <PrintPacketButton />
            <a
              href={`/admin/accounts?edit=${student.id}`}
              className="text-sm text-wfd-crimson hover:underline print:hidden"
            >
              Edit Student
            </a>
          </div>
        </div>

        {warnings.length > 0 && <CompletenessWarnings warnings={warnings} />}

        <Card className="p-6 print:shadow-none">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-wfd-charcoal">{student.full_name}</h1>
              <p className="text-sm text-gray-500">{student.email}</p>
              {student.phone && <p className="text-sm text-gray-400">{student.phone}</p>}
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={statusVariant}>{student.status}</Badge>
              {student.is_blacklisted && <Badge variant="red">Blacklisted</Badge>}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400 block text-xs uppercase tracking-wide">Class</span>
              <span className="text-wfd-charcoal font-medium">{trainingClass ? trainingClass.name : '—'}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs uppercase tracking-wide">Instructor</span>
              <span className="text-wfd-charcoal font-medium">
                {instructor ? `${instructor.first_name} ${instructor.last_name}` : (student.instructor_name || '—')}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs uppercase tracking-wide">TEI</span>
              <span className="text-wfd-charcoal font-medium">{trainingSite ? trainingSite.name : '—'}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs uppercase tracking-wide">Class Start</span>
              <span className="text-wfd-charcoal font-medium">
                {trainingClass?.class_start_date
                  ? new Date(trainingClass.class_start_date).toLocaleDateString()
                  : '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs uppercase tracking-wide">Ride-Time Ends</span>
              <span className="text-wfd-charcoal font-medium">
                {trainingClass?.ride_time_end_date
                  ? new Date(trainingClass.ride_time_end_date).toLocaleDateString()
                  : (student.access_until
                    ? new Date(student.access_until).toLocaleDateString()
                    : '—')}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs uppercase tracking-wide">Onboarding Test</span>
              <Badge variant={student.onboarding_completed_at ? 'green' : 'gray'}>
                {student.onboarding_completed_at ? 'Completed' : 'Not completed'}
              </Badge>
            </div>
            <div>
              <span className="text-gray-400 block text-xs uppercase tracking-wide">Legal Docs</span>
              <Badge variant={legalAcceptances.length > 0 ? 'green' : 'gray'}>
                {legalAcceptances.length > 0 ? `${legalAcceptances.length} signed` : 'None'}
              </Badge>
            </div>
            {student.no_show_count > 0 && (
              <div>
                <span className="text-gray-400 block text-xs uppercase tracking-wide">No-Shows</span>
                <Badge variant="red">{student.no_show_count}</Badge>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-3">
          <Disclosure
            title="Instructor"
            summary={instructor
              ? `${instructor.first_name} ${instructor.last_name} — ${instructor.status || 'Active'}`
              : (student.instructor_name || 'Not assigned')}
          >
            {instructor ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400 text-xs">Name</span><p className="font-medium text-wfd-charcoal">{instructor.first_name} {instructor.last_name}</p></div>
                  <div><span className="text-gray-400 text-xs">Status</span><p className="font-medium text-wfd-charcoal">{instructor.status || '—'}</p></div>
                  <div><span className="text-gray-400 text-xs">Email</span><p className="font-medium text-wfd-charcoal">{instructor.email || '—'}</p></div>
                  <div><span className="text-gray-400 text-xs">Phone</span><p className="font-medium text-wfd-charcoal">{instructor.business_phone || '—'}</p></div>
                  {instructor.training_sites && (
                    <div className="col-span-2"><span className="text-gray-400 text-xs">Training Site</span><p className="font-medium text-wfd-charcoal">{instructor.training_sites.name}</p></div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  {instructor.email && <a href={`mailto:${instructor.email}`} className="text-xs px-3 py-1 rounded-full bg-wfd-crimson/10 text-wfd-crimson hover:bg-wfd-crimson/20 transition-colors">Email Instructor</a>}
                  {instructor.business_phone && <CopyButton text={instructor.business_phone} label="Copy Phone" />}
                  {instructor.email && <CopyButton text={instructor.email} label="Copy Email" />}
                </div>
              </div>
            ) : student.instructor_name ? (
              <div className="space-y-2">
                <p className="text-sm text-wfd-charcoal"><span className="text-gray-400">Name:</span> {student.instructor_name}</p>
                {student.instructor_contact && <p className="text-sm text-wfd-charcoal"><span className="text-gray-400">Contact:</span> {student.instructor_contact}</p>}
                <div className="flex items-center gap-2 text-xs text-amber-600 mt-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  Not linked to a registry record
                </div>
              </div>
            ) : <p className="text-sm text-gray-400">No instructor assigned</p>}
          </Disclosure>

          <Disclosure
            title="TEI / Training Site"
            summary={trainingSite ? `${trainingSite.name} — ${trainingSite.status || 'Active'}` : 'Not assigned'}
          >
            {trainingSite ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400 text-xs">Name</span><p className="font-medium text-wfd-charcoal">{trainingSite.name}</p></div>
                  <div><span className="text-gray-400 text-xs">Status</span><p className="font-medium text-wfd-charcoal">{trainingSite.status || '—'}</p></div>
                  <div className="col-span-2"><span className="text-gray-400 text-xs">Organization</span><p className="font-medium text-wfd-charcoal">{trainingSite.organization_name || '—'}</p></div>
                  {trainingSite.address && <div className="col-span-2"><span className="text-gray-400 text-xs">Address</span><p className="font-medium text-wfd-charcoal">{trainingSite.address}</p></div>}
                  {(trainingSite.city || trainingSite.state) && <div><span className="text-gray-400 text-xs">City</span><p className="font-medium text-wfd-charcoal">{[trainingSite.city, trainingSite.state].filter(Boolean).join(', ') || '—'}</p></div>}
                  {trainingSite.main_phone && <div><span className="text-gray-400 text-xs">Phone</span><p className="font-medium text-wfd-charcoal">{trainingSite.main_phone}</p></div>}
                </div>
                {trainingSite.main_phone && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                    <CopyButton text={trainingSite.main_phone} label="Copy Phone" />
                  </div>
                )}
              </div>
            ) : <p className="text-sm text-gray-400">No training site assigned</p>}
          </Disclosure>

          <Disclosure
            title="Training Class"
            summary={trainingClass ? `${trainingClass.name} — Start: ${trainingClass.class_start_date || 'N/A'}` : 'Not assigned'}
          >
            {trainingClass ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400 text-xs">Name</span><p className="font-medium text-wfd-charcoal">{trainingClass.name}</p></div>
                  <div><span className="text-gray-400 text-xs">Status</span><p className="font-medium text-wfd-charcoal">{trainingClass.status || '—'}</p></div>
                  <div><span className="text-gray-400 text-xs">Start Date</span><p className="font-medium text-wfd-charcoal">{trainingClass.class_start_date || '—'}</p></div>
                  <div><span className="text-gray-400 text-xs">Ride-Time Ends</span><p className="font-medium text-wfd-charcoal">{trainingClass.ride_time_end_date || '—'}</p></div>
                </div>
                {trainingClass.training_sites && <div className="text-sm"><span className="text-gray-400 text-xs">Training Site</span><p className="font-medium text-wfd-charcoal">{trainingClass.training_sites.name}</p></div>}
                {trainingClass.instructors && <div className="text-sm"><span className="text-gray-400 text-xs">Assigned Instructor</span><p className="font-medium text-wfd-charcoal">{trainingClass.instructors.first_name} {trainingClass.instructors.last_name}</p></div>}
              </div>
            ) : <p className="text-sm text-gray-400">No training class assigned</p>}
          </Disclosure>

          <LegalDocumentsSection
            acceptances={legalAcceptances}
            studentName={student.full_name}
            signatureIp={student.signature_ip}
            signatureTimestamp={student.signature_timestamp}
          />

          <AdminNotesSection notes={sortedNotes} studentId={student.id} />

          <OnboardingTestSection
            onboardingCompletedAt={student.onboarding_completed_at}
            quizFlags={quizFlags}
          />

          <RideHistorySection schedules={schedules} />
        </div>
      </div>
    </div>
  );
}

