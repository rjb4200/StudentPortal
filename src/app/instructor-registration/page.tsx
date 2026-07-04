'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type RegistrySite = {
  id: string;
  name: string;
  organization_name: string;
  city: string;
  state: string;
};

type RegistryInstructor = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  credentials: string;
  title: string;
  training_site_id: string;
};

const initialInstructorForm = {
  firstName: '',
  lastName: '',
  email: '',
  mobilePhone: '',
  businessPhone: '',
  credentials: '',
  title: '',
  preferredContactMethod: 'email',
  preferredContactHours: '',
  contactInstructions: '',
};

const initialSiteForm = {
  name: '',
  organizationName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  mainPhone: '',
};

const initialClassForm = {
  name: '',
  classStartDate: '',
  rideTimeEndDate: '',
  notes: '',
};

export default function InstructorRegistrationPage() {
  const [step, setStep] = useState(1);
  const [siteMode, setSiteMode] = useState<'existing' | 'new'>('existing');
  const [instructorMode, setInstructorMode] = useState<'existing' | 'new'>('existing');
  const [sites, setSites] = useState<RegistrySite[]>([]);
  const [instructors, setInstructors] = useState<RegistryInstructor[]>([]);
  const [existingSiteId, setExistingSiteId] = useState('');
  const [existingInstructorId, setExistingInstructorId] = useState('');
  const [siteForm, setSiteForm] = useState(initialSiteForm);
  const [instructorForm, setInstructorForm] = useState(initialInstructorForm);
  const [classForm, setClassForm] = useState(initialClassForm);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [mouRepName, setMouRepName] = useState('');
  const [mouRepTitle, setMouRepTitle] = useState('');
  const [mouSignature, setMouSignature] = useState('');
  const [mouBody, setMouBody] = useState('');
  const [loadingMou, setLoadingMou] = useState(true);

  useEffect(() => {
    async function loadSites() {
      setLoadingOptions(true);
      const response = await fetch('/api/instructor/register');
      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.success) {
        setSites(payload.sites ?? []);
      }
      setLoadingOptions(false);
    }
    loadSites();
  }, []);

  useEffect(() => {
    if (siteMode !== 'existing' || !existingSiteId) {
      setInstructors([]);
      setExistingInstructorId('');
      if (siteMode === 'new') setInstructorMode('new');
      return;
    }

    async function loadInstructors() {
      setLoadingInstructors(true);
      const response = await fetch(`/api/instructor/register?trainingSiteId=${encodeURIComponent(existingSiteId)}`);
      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.success) {
        setInstructors(payload.instructors ?? []);
      } else {
        setInstructors([]);
      }
      setExistingInstructorId('');
      setLoadingInstructors(false);
    }

    loadInstructors();
  }, [existingSiteId, siteMode]);

  const selectedSite = useMemo(
    () => sites.find((site) => site.id === existingSiteId),
    [existingSiteId, sites]
  );

  const selectedInstructor = useMemo(
    () => instructors.find((instructor) => instructor.id === existingInstructorId),
    [existingInstructorId, instructors]
  );

  const sameNameWarning = useMemo(() => {
    if (siteMode !== 'existing' || instructorMode !== 'new') return false;
    const first = instructorForm.firstName.trim().toLowerCase();
    const last = instructorForm.lastName.trim().toLowerCase();
    if (!first || !last) return false;
    return instructors.some(
      (instructor) => instructor.first_name.trim().toLowerCase() === first && instructor.last_name.trim().toLowerCase() === last
    );
  }, [instructorForm.firstName, instructorForm.lastName, instructorMode, instructors, siteMode]);

  const updateSite = (key: keyof typeof initialSiteForm, value: string) => {
    setSiteForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateInstructor = (key: keyof typeof initialInstructorForm, value: string) => {
    setInstructorForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateClass = (key: keyof typeof initialClassForm, value: string) => {
    setClassForm((prev) => ({ ...prev, [key]: value }));
  };

  const canContinueSite = siteMode === 'existing'
    ? Boolean(existingSiteId)
    : Boolean(siteForm.name && siteForm.organizationName && siteForm.address && siteForm.city && siteForm.state && siteForm.zipCode);

  const canContinueInstructor = instructorMode === 'existing'
    ? Boolean(existingInstructorId)
    : Boolean(
        instructorForm.firstName &&
        instructorForm.lastName &&
        instructorForm.email &&
        instructorForm.mobilePhone &&
        instructorForm.credentials &&
        instructorForm.title &&
        instructorForm.preferredContactMethod &&
        instructorForm.preferredContactHours
      );

  const goNextFromClass = async () => {
    const classOk = Boolean(classForm.name && classForm.classStartDate && classForm.rideTimeEndDate);
    if (!classOk) {
      setError('Complete all class fields before continuing.');
      return;
    }
    setError('');
    setLoadingMou(true);
    try {
      const response = await fetch('/api/settings?key=mou_template_body');
      const payload = await response.json().catch(() => null);
      if (payload?.value) setMouBody(payload.value);
    } catch {}
    setLoadingMou(false);
    const repName = instructorMode === 'existing'
      ? `${selectedInstructor?.first_name ?? ''} ${selectedInstructor?.last_name ?? ''}`.trim()
      : `${instructorForm.firstName} ${instructorForm.lastName}`.trim();
    setMouRepName(repName);
    setMouRepTitle(instructorMode === 'existing' ? (selectedInstructor?.title ?? '') : instructorForm.title);
    setStep(4);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const sitePayload = siteMode === 'existing'
      ? { mode: 'existing' as const, trainingSiteId: existingSiteId }
      : { mode: 'new' as const, ...siteForm };

    const instructorPayload = instructorMode === 'existing'
      ? { mode: 'existing' as const, instructorId: existingInstructorId }
      : { mode: 'new' as const, ...instructorForm };

    const response = await fetch('/api/instructor/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site: sitePayload,
        instructor: instructorPayload,
        class: classForm,
        mou: {
          effectiveDate: new Date().toISOString().split('T')[0],
          trainingOrganizationName: siteMode === 'existing' ? (selectedSite?.organization_name ?? '') : siteForm.organizationName,
          representativeName: mouRepName,
          representativeTitle: mouRepTitle,
          representativeSignature: mouSignature,
          mouBodySnapshot: mouBody,
        },
      }),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok || result?.success !== true) {
      setError(result?.error || 'Unable to submit registration.');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  const goNextFromSite = () => {
    if (!canContinueSite) {
      setError('Select an existing TEI or complete the new TEI fields.');
      return;
    }
    setError('');
    setStep(2);
  };

  const goNextFromInstructor = () => {
    if (!canContinueInstructor) {
      setError('Select an existing instructor for this TEI or complete the new instructor fields.');
      return;
    }
    setError('');
    setStep(3);
  };

  if (submitted) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-wfd-sage/30 bg-wfd-sage/10 p-5 text-center">
          <h2 className="text-xl font-bold text-wfd-charcoal">Registration Submitted</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Your TEI, instructor, and class information has been submitted for admin review along with your signed MOU. Students cannot register until the class is approved and the class start date has been reached. You will receive an email when the class is approved. A completed MOU with both party signatures will be emailed after the WFEMS signer has signed.
          </p>
        </div>
        <Link href="/" className="block text-center text-sm font-semibold text-wfd-crimson hover:underline">
          Return to portal home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-1 font-serif text-xl font-bold text-wfd-charcoal">Instructor - Register Your Class</h2>
      <p className="mb-6 text-sm text-gray-500">
        Select the TEI first, then choose an instructor record scoped to that TEI before registering the class.
      </p>

      <div className="mb-5 grid grid-cols-4 gap-2 text-center text-xs font-bold uppercase tracking-wide text-gray-500">
        <div className={step === 1 ? 'rounded-full bg-wfd-crimson px-3 py-2 text-white' : 'rounded-full bg-gray-100 px-3 py-2'}>1 TEI</div>
        <div className={step === 2 ? 'rounded-full bg-wfd-crimson px-3 py-2 text-white' : 'rounded-full bg-gray-100 px-3 py-2'}>2 Instructor</div>
        <div className={step === 3 ? 'rounded-full bg-wfd-crimson px-3 py-2 text-white' : 'rounded-full bg-gray-100 px-3 py-2'}>3 Class</div>
        <div className={step === 4 ? 'rounded-full bg-wfd-crimson px-3 py-2 text-white' : 'rounded-full bg-gray-100 px-3 py-2'}>4 MOU</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wide text-wfd-crimson">Step 1: Select or register TEI</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700">
                <input
                  type="radio"
                  className="mr-2"
                  checked={siteMode === 'existing'}
                  onChange={() => setSiteMode('existing')}
                />
                Select Existing TEI
              </label>
              <label className="rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700">
                <input
                  type="radio"
                  className="mr-2"
                  checked={siteMode === 'new'}
                  onChange={() => setSiteMode('new')}
                />
                Register New TEI
              </label>
            </div>

            {siteMode === 'existing' ? (
              <label className="block text-sm font-medium text-gray-700">
                Existing TEI
                <select
                  required
                  disabled={loadingOptions}
                  value={existingSiteId}
                  onChange={(event) => setExistingSiteId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson"
                >
                  <option value="">{loadingOptions ? 'Loading TEIs...' : 'Select TEI...'}</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name} - {site.city}, {site.state}
                    </option>
                  ))}
                </select>
                {selectedSite && <span className="mt-1 block text-xs text-gray-500">{selectedSite.organization_name}</span>}
              </label>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input label="Training site name" required value={siteForm.name} onChange={(e) => updateSite('name', e.target.value)} />
                <Input label="Organization/school name" required value={siteForm.organizationName} onChange={(e) => updateSite('organizationName', e.target.value)} />
                <Input label="Address" required value={siteForm.address} onChange={(e) => updateSite('address', e.target.value)} />
                <Input label="City" required value={siteForm.city} onChange={(e) => updateSite('city', e.target.value)} />
                <Input label="State" required value={siteForm.state} onChange={(e) => updateSite('state', e.target.value)} />
                <Input label="ZIP code" required value={siteForm.zipCode} onChange={(e) => updateSite('zipCode', e.target.value)} />
                <Input label="Main site phone (optional)" type="tel" value={siteForm.mainPhone} onChange={(e) => updateSite('mainPhone', e.target.value)} />
              </div>
            )}

            <Button type="button" onClick={goNextFromSite} className="w-full">Continue to Instructor</Button>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wide text-wfd-crimson">Step 2: Select or register instructor</h3>
            {siteMode === 'new' ? (
              <p className="rounded-lg border border-wfd-gold/30 bg-wfd-gold/10 p-3 text-sm text-wfd-charcoal">
                New TEIs require a new instructor registration. If the same person teaches at another TEI, this creates a separate instructor record.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700">
                  <input
                    type="radio"
                    className="mr-2"
                    checked={instructorMode === 'existing'}
                    onChange={() => setInstructorMode('existing')}
                  />
                  Select Existing Instructor for this TEI
                </label>
                <label className="rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700">
                  <input
                    type="radio"
                    className="mr-2"
                    checked={instructorMode === 'new'}
                    onChange={() => setInstructorMode('new')}
                  />
                  Register New Instructor
                </label>
              </div>
            )}

            {instructorMode === 'existing' && siteMode === 'existing' ? (
              <label className="block text-sm font-medium text-gray-700">
                Existing instructor for selected TEI
                <select
                  required
                  disabled={loadingInstructors}
                  value={existingInstructorId}
                  onChange={(event) => setExistingInstructorId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson"
                >
                  <option value="">{loadingInstructors ? 'Loading instructors...' : 'Select instructor...'}</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.first_name} {instructor.last_name} - {instructor.email}
                    </option>
                  ))}
                </select>
                {selectedInstructor && (
                  <span className="mt-1 block text-xs text-gray-500">
                    {selectedInstructor.title} - {selectedInstructor.credentials}
                  </span>
                )}
              </label>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input label="First name" required value={instructorForm.firstName} onChange={(e) => updateInstructor('firstName', e.target.value)} />
                  <Input label="Last name" required value={instructorForm.lastName} onChange={(e) => updateInstructor('lastName', e.target.value)} />
                  <Input label="Email" type="email" required value={instructorForm.email} onChange={(e) => updateInstructor('email', e.target.value)} />
                  <Input label="Mobile phone" type="tel" required value={instructorForm.mobilePhone} onChange={(e) => updateInstructor('mobilePhone', e.target.value)} />
                  <Input label="Business phone (optional)" type="tel" value={instructorForm.businessPhone} onChange={(e) => updateInstructor('businessPhone', e.target.value)} />
                  <Input label="Credentials/certifications" required value={instructorForm.credentials} onChange={(e) => updateInstructor('credentials', e.target.value)} />
                  <Input label="Position/title" required value={instructorForm.title} onChange={(e) => updateInstructor('title', e.target.value)} />
                  <label className="block text-sm font-medium text-gray-700">
                    Preferred contact method
                    <select
                      required
                      value={instructorForm.preferredContactMethod}
                      onChange={(e) => updateInstructor('preferredContactMethod', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson"
                    >
                      <option value="email">Email</option>
                      <option value="mobile_phone">Mobile phone</option>
                      <option value="business_phone">Business phone</option>
                    </select>
                  </label>
                  <Input label="Preferred contact hours" required value={instructorForm.preferredContactHours} onChange={(e) => updateInstructor('preferredContactHours', e.target.value)} />
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  Additional contact instructions (optional)
                  <textarea value={instructorForm.contactInstructions} onChange={(e) => updateInstructor('contactInstructions', e.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" />
                </label>
                {sameNameWarning && (
                  <p className="rounded-lg border border-wfd-gold/30 bg-wfd-gold/10 p-3 text-sm text-wfd-charcoal">
                    Another instructor with this name already exists for the selected TEI. Continue only if this should be a separate instructor record.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>Back to TEI</Button>
              <Button type="button" onClick={goNextFromInstructor}>Continue to Class</Button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wide text-wfd-crimson">Step 3: Register class</h3>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              <p><span className="font-bold">TEI:</span> {siteMode === 'existing' ? selectedSite?.name : siteForm.name}</p>
              <p><span className="font-bold">Instructor:</span> {instructorMode === 'existing' ? `${selectedInstructor?.first_name ?? ''} ${selectedInstructor?.last_name ?? ''}`.trim() : `${instructorForm.firstName} ${instructorForm.lastName}`.trim()}</p>
            </div>
            <div className="rounded-lg border border-wfd-gold/30 bg-wfd-gold/10 p-3 text-sm leading-6 text-wfd-charcoal">
              Student access is controlled by the class start date, portal admin approval, and ride-time end date. Verify these dates carefully before submitting because they determine when students can register, schedule ride time, and access the portal.
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input label="Class name" required value={classForm.name} onChange={(e) => updateClass('name', e.target.value)} />
              <div>
                <Input label="Beginning-of-class date" type="date" required value={classForm.classStartDate} onChange={(e) => updateClass('classStartDate', e.target.value)} />
                <p className="mt-1 text-xs leading-5 text-gray-500">Students cannot register before this date, and portal admin approval is also required.</p>
              </div>
              <div>
                <Input label="End-of-ride-time date" type="date" required value={classForm.rideTimeEndDate} onChange={(e) => updateClass('rideTimeEndDate', e.target.value)} />
                <p className="mt-1 text-xs leading-5 text-gray-500">Students may only schedule and ride during the approved ride-time period. Portal access expires after this date.</p>
              </div>
            </div>
            <label className="block text-sm font-medium text-gray-700">
              Class notes/instructions (optional)
              <textarea value={classForm.notes} onChange={(e) => updateClass('notes', e.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" />
            </label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Button type="button" variant="secondary" onClick={() => setStep(2)}>Back to Instructor</Button>
              <Button type="button" onClick={goNextFromClass}>Continue to MOU</Button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wide text-wfd-crimson">Step 4: Review and sign MOU</h3>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              <p><span className="font-bold">TEI:</span> {siteMode === 'existing' ? selectedSite?.name : siteForm.name}</p>
              <p><span className="font-bold">Instructor:</span> {instructorMode === 'existing' ? `${selectedInstructor?.first_name ?? ''} ${selectedInstructor?.last_name ?? ''}`.trim() : `${instructorForm.firstName} ${instructorForm.lastName}`.trim()}</p>
              <p><span className="font-bold">Class:</span> {classForm.name} ({classForm.classStartDate} to {classForm.rideTimeEndDate})</p>
            </div>
            {loadingMou ? (
              <p className="text-sm text-gray-500">Loading MOU template...</p>
            ) : (
              <>
                <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">
                    {mouBody}
                  </pre>
                </div>
                <div className="rounded-lg border border-wfd-gold/30 bg-wfd-gold/10 p-3 text-sm leading-6 text-wfd-charcoal">
                  By signing below, you certify you are authorized to execute this Memorandum of Understanding on behalf of the training organization. A completed copy with both party signatures will be emailed to you after the WFEMS signer has signed.
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input label="Representative name" required value={mouRepName} onChange={(e) => setMouRepName(e.target.value)} />
                  <Input label="Representative title" required value={mouRepTitle} onChange={(e) => setMouRepTitle(e.target.value)} />
                </div>
                <Input
                  label={`Electronic signature - type "${mouRepName}" to sign`}
                  required
                  value={mouSignature}
                  onChange={(e) => setMouSignature(e.target.value)}
                  placeholder={mouRepName}
                />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(3)}>Back to Class</Button>
                  <Button type="submit" loading={submitting} disabled={mouSignature !== mouRepName || !mouSignature}>Submit Registration</Button>
                </div>
              </>
            )}
          </section>
        )}

        {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </form>
    </div>
  );
}
