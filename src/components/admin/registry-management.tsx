'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, EmptyState, FormField, SectionCard } from '@/components/ui';

type RegistryTable = 'training_sites' | 'instructors' | 'training_classes';
type RegistryStatus = 'pending' | 'active' | 'rejected' | 'suspended' | 'archived';

const emptySite = { name: '', organizationName: '', address: '', city: '', state: '', zipCode: '', mainPhone: '' };
const emptyInstructor = { trainingSiteId: '', firstName: '', lastName: '', email: '', mobilePhone: '', businessPhone: '', credentials: '', title: '', preferredContactMethod: 'email', preferredContactHours: '', contactInstructions: '' };
const emptyClass = { trainingSiteId: '', instructorId: '', name: '', classStartDate: '', rideTimeEndDate: '', notes: '' };

export function RegistryManagement() {
  const supabase = createClient() as any;
  const [sites, setSites] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [siteForm, setSiteForm] = useState(emptySite);
  const [instructorForm, setInstructorForm] = useState(emptyInstructor);
  const [classForm, setClassForm] = useState(emptyClass);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [{ data: siteRows }, { data: instructorRows }, { data: classRows }, { data: studentRows }] = await Promise.all([
      supabase.from('training_sites').select('*').order('created_at', { ascending: false }),
      supabase.from('instructors').select('*, training_sites(name)').order('created_at', { ascending: false }),
      supabase.from('training_classes').select('*, training_sites(name), instructors(first_name, last_name)').order('class_start_date', { ascending: false }),
      supabase.from('students').select('id, full_name, email, training_class_id').not('training_class_id', 'is', null),
    ]);

    setSites(siteRows ?? []);
    setInstructors(instructorRows ?? []);
    setClasses(classRows ?? []);
    setStudents(studentRows ?? []);
  };

  const request = async (body: any) => {
    setError(null);
    const response = await fetch('/api/admin/registry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.success !== true) {
      throw new Error(result?.error || 'Registry save failed.');
    }
  };

  const statusRequest = async (table: RegistryTable, id: string, status: RegistryStatus) => {
    setSaving(`${table}-${id}-${status}`);
    try {
      const response = await fetch('/api/admin/registry-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, id, status }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success !== true) throw new Error(result?.error || 'Status update failed.');
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Status update failed.');
    } finally {
      setSaving(null);
    }
  };

  const handleCreateSite = async (event: FormEvent) => {
    event.preventDefault();
    setSaving('site-create');
    try {
      await request({ table: 'training_sites', data: { ...siteForm, status: 'active' } });
      setSiteForm(emptySite);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Site create failed.');
    } finally {
      setSaving(null);
    }
  };

  const handleCreateInstructor = async (event: FormEvent) => {
    event.preventDefault();
    setSaving('instructor-create');
    try {
      await request({ table: 'instructors', data: { ...instructorForm, status: 'active' } });
      setInstructorForm(emptyInstructor);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Instructor create failed.');
    } finally {
      setSaving(null);
    }
  };

  const handleCreateClass = async (event: FormEvent) => {
    event.preventDefault();
    setSaving('class-create');
    try {
      await request({ table: 'training_classes', data: { ...classForm, status: 'active' } });
      setClassForm(emptyClass);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Class create failed.');
    } finally {
      setSaving(null);
    }
  };

  const editSiteName = async (site: any) => {
    const name = prompt('Training site name', site.name);
    if (!name) return;
    setSaving(`site-edit-${site.id}`);
    try {
      await request({
        table: 'training_sites',
        id: site.id,
        data: {
          name,
          organizationName: site.organization_name,
          address: site.address,
          city: site.city,
          state: site.state,
          zipCode: site.zip_code,
          mainPhone: site.main_phone ?? '',
          status: site.status,
        },
      });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Site edit failed.');
    } finally {
      setSaving(null);
    }
  };

  const editClassWindow = async (trainingClass: any) => {
    const classStartDate = prompt('Class start date (YYYY-MM-DD)', trainingClass.class_start_date);
    if (!classStartDate) return;
    const rideTimeEndDate = prompt('Ride-time end date (YYYY-MM-DD)', trainingClass.ride_time_end_date);
    if (!rideTimeEndDate) return;
    setSaving(`class-edit-${trainingClass.id}`);
    try {
      await request({
        table: 'training_classes',
        id: trainingClass.id,
        data: {
          trainingSiteId: trainingClass.training_site_id,
          instructorId: trainingClass.instructor_id,
          name: trainingClass.name,
          classStartDate,
          rideTimeEndDate,
          notes: trainingClass.notes ?? '',
          status: trainingClass.status,
        },
      });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Class edit failed.');
    } finally {
      setSaving(null);
    }
  };

  const studentsForClass = (classId: string) => students.filter((student) => student.training_class_id === classId);
  const instructorBelongsToSite = (instructorId: string, trainingSiteId: string) => instructors.some((instructor) => instructor.id === instructorId && instructor.training_site_id === trainingSiteId);
  const classInstructorOptions = classForm.trainingSiteId
    ? instructors.filter((instructor) => instructor.training_site_id === classForm.trainingSiteId)
    : [];

  const handleClassSiteChange = (trainingSiteId: string) => {
    setClassForm((current) => ({
      ...current,
      trainingSiteId,
      instructorId: current.instructorId && instructorBelongsToSite(current.instructorId, trainingSiteId) ? current.instructorId : '',
    }));
  };

  return (
    <div className="space-y-6">
      {error && <Alert tone="danger">{error}</Alert>}

      <SectionCard className="p-4">
        <h2 className="text-lg font-black text-wfd-charcoal">Create Training Site</h2>
        <form onSubmit={handleCreateSite} className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input label="Site name" required value={siteForm.name} onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })} />
          <Input label="Organization" required value={siteForm.organizationName} onChange={(e) => setSiteForm({ ...siteForm, organizationName: e.target.value })} />
          <Input label="Address" required value={siteForm.address} onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })} />
          <Input label="City" required value={siteForm.city} onChange={(e) => setSiteForm({ ...siteForm, city: e.target.value })} />
          <Input label="State" required value={siteForm.state} onChange={(e) => setSiteForm({ ...siteForm, state: e.target.value })} />
          <Input label="ZIP" required value={siteForm.zipCode} onChange={(e) => setSiteForm({ ...siteForm, zipCode: e.target.value })} />
          <Input label="Main phone" value={siteForm.mainPhone} onChange={(e) => setSiteForm({ ...siteForm, mainPhone: e.target.value })} />
          <Button type="submit" loading={saving === 'site-create'} className="self-end">Create Active Site</Button>
        </form>
      </SectionCard>

      <SectionCard className="p-4">
        <h2 className="text-lg font-black text-wfd-charcoal">Create Instructor</h2>
        <form onSubmit={handleCreateInstructor} className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Select label="Training site" required value={instructorForm.trainingSiteId} onChange={(value) => setInstructorForm({ ...instructorForm, trainingSiteId: value })} options={sites.map((site) => ({ value: site.id, label: site.name }))} />
          <Input label="First name" required value={instructorForm.firstName} onChange={(e) => setInstructorForm({ ...instructorForm, firstName: e.target.value })} />
          <Input label="Last name" required value={instructorForm.lastName} onChange={(e) => setInstructorForm({ ...instructorForm, lastName: e.target.value })} />
          <Input label="Email" type="email" required value={instructorForm.email} onChange={(e) => setInstructorForm({ ...instructorForm, email: e.target.value })} />
          <Input label="Mobile phone" required value={instructorForm.mobilePhone} onChange={(e) => setInstructorForm({ ...instructorForm, mobilePhone: e.target.value })} />
          <Input label="Credentials" required value={instructorForm.credentials} onChange={(e) => setInstructorForm({ ...instructorForm, credentials: e.target.value })} />
          <Input label="Title" required value={instructorForm.title} onChange={(e) => setInstructorForm({ ...instructorForm, title: e.target.value })} />
          <Input label="Contact hours" required value={instructorForm.preferredContactHours} onChange={(e) => setInstructorForm({ ...instructorForm, preferredContactHours: e.target.value })} />
          <Button type="submit" loading={saving === 'instructor-create'} className="self-end">Create Active Instructor</Button>
        </form>
      </SectionCard>

      <SectionCard className="p-4">
        <h2 className="text-lg font-black text-wfd-charcoal">Create Class</h2>
        <form onSubmit={handleCreateClass} className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Select label="Training site" required value={classForm.trainingSiteId} onChange={handleClassSiteChange} options={sites.map((site) => ({ value: site.id, label: site.name }))} />
          <Select label="Instructor" required value={classForm.instructorId} onChange={(value) => setClassForm({ ...classForm, instructorId: value })} options={classInstructorOptions.map((instructor) => ({ value: instructor.id, label: `${instructor.first_name} ${instructor.last_name}` }))} />
          <Input label="Class name" required value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} />
          <Input label="Class start" type="date" required value={classForm.classStartDate} onChange={(e) => setClassForm({ ...classForm, classStartDate: e.target.value })} />
          <Input label="Ride-time end" type="date" required value={classForm.rideTimeEndDate} onChange={(e) => setClassForm({ ...classForm, rideTimeEndDate: e.target.value })} />
          <Input label="Notes" value={classForm.notes} onChange={(e) => setClassForm({ ...classForm, notes: e.target.value })} />
          <Button type="submit" loading={saving === 'class-create'} className="self-end">Create Active Class</Button>
        </form>
        {classForm.trainingSiteId && classInstructorOptions.length === 0 && (
          <p className="mt-3 text-sm text-gray-500">No instructors are assigned to the selected training site.</p>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <RegistryList title="Training Sites" rows={sites} table="training_sites" saving={saving} onStatus={statusRequest} onEdit={editSiteName} renderDetail={(site) => `${site.organization_name} - ${site.city}, ${site.state}`} />
        <RegistryList title="Instructors" rows={instructors} table="instructors" saving={saving} onStatus={statusRequest} renderTitle={(instructor) => `${instructor.first_name} ${instructor.last_name}`} renderDetail={(instructor) => `${instructor.training_sites?.name ?? 'No site'} - ${instructor.email}`} />
        <RegistryList title="Classes" rows={classes} table="training_classes" saving={saving} onStatus={statusRequest} onEdit={editClassWindow} renderDetail={(trainingClass) => {
          const assigned = studentsForClass(trainingClass.id);
          return `${trainingClass.training_sites?.name ?? 'Site'} - ${trainingClass.class_start_date} to ${trainingClass.ride_time_end_date} - ${assigned.length} student${assigned.length === 1 ? '' : 's'}`;
        }} />
      </div>
    </div>
  );
}

function Select({ label, value, options, onChange, required }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void; required?: boolean }) {
  return (
    <FormField label={label}>
      <select required={required} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson">
        <option value="">Select...</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </FormField>
  );
}

function RegistryList({ title, rows, table, saving, onStatus, onEdit, renderTitle, renderDetail }: { title: string; rows: any[]; table: RegistryTable; saving: string | null; onStatus: (table: RegistryTable, id: string, status: RegistryStatus) => void; onEdit?: (row: any) => void; renderTitle?: (row: any) => string; renderDetail: (row: any) => string }) {
  return (
    <SectionCard className="p-4">
      <h2 className="font-black text-wfd-charcoal">{title}</h2>
      <div className="mt-3 space-y-3">
        {rows.length === 0 && <EmptyState title="No records yet" />}
        {rows.map((row) => (
          <div key={row.id} className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-wfd-charcoal">{renderTitle ? renderTitle(row) : row.name}</p>
                <p className="text-xs text-gray-500">{renderDetail(row)}</p>
              </div>
              <Badge variant={row.status === 'active' ? 'green' : row.status === 'pending' ? 'gold' : row.status === 'suspended' ? 'orange' : 'gray'}>{row.status}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {onEdit && <Button size="sm" variant="secondary" onClick={() => onEdit(row)} loading={saving === `${table === 'training_sites' ? 'site' : 'class'}-edit-${row.id}`}>Edit</Button>}
              <Button size="sm" onClick={() => onStatus(table, row.id, 'active')} loading={saving === `${table}-${row.id}-active`}>Approve</Button>
              <Button size="sm" variant="secondary" onClick={() => onStatus(table, row.id, 'suspended')} loading={saving === `${table}-${row.id}-suspended`}>Suspend</Button>
              <Button size="sm" variant="secondary" onClick={() => onStatus(table, row.id, 'archived')} loading={saving === `${table}-${row.id}-archived`}>Archive</Button>
              <Button size="sm" variant="danger" onClick={() => onStatus(table, row.id, 'rejected')} loading={saving === `${table}-${row.id}-rejected`}>Reject</Button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
