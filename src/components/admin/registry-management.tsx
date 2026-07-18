'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Alert, Badge, Button, ConfirmDialog, DataTable, DataTableCell, DataTableHead, DataTableRow, EmptyState, FactGrid, FactItem, FormField, LoadingState, Modal, PageHeader, SectionCard, StatusBanner, Tabs } from '@/components/ui';
import { Input } from '@/components/ui/input';

type RegistryTable = 'training_sites' | 'instructors' | 'training_classes';
type RegistryStatus = 'pending' | 'active' | 'rejected' | 'suspended' | 'archived';
type RegistryView = 'classes' | 'instructors' | 'sites';
type ClassLifecycle = 'upcoming' | 'in_progress' | 'expired';

type Site = {
  id: string;
  name: string;
  organization_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  main_phone: string | null;
  status: RegistryStatus;
};

type Instructor = {
  id: string;
  training_site_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  mobile_phone: string;
  business_phone: string | null;
  credentials: string;
  title: string;
  preferred_contact_method: string;
  preferred_contact_hours: string;
  contact_instructions: string | null;
  status: RegistryStatus;
  training_sites: Pick<Site, 'name'> | null;
};

type Student = { id: string; full_name: string; email: string; training_class_id: string | null };

type TrainingClass = {
  id: string;
  training_site_id: string;
  instructor_id: string;
  name: string;
  class_start_date: string;
  ride_time_end_date: string;
  notes: string | null;
  status: RegistryStatus;
  training_sites: Pick<Site, 'name'> | null;
  instructors: Pick<Instructor, 'first_name' | 'last_name'> | null;
};

type SiteForm = { name: string; organizationName: string; address: string; city: string; state: string; zipCode: string; mainPhone: string };
type InstructorForm = { trainingSiteId: string; firstName: string; lastName: string; email: string; mobilePhone: string; businessPhone: string; credentials: string; title: string; preferredContactMethod: string; preferredContactHours: string; contactInstructions: string };
type ClassForm = { trainingSiteId: string; instructorId: string; name: string; classStartDate: string; rideTimeEndDate: string; notes: string };
type Editor = { table: RegistryTable; row?: Site | Instructor | TrainingClass } | null;
type PendingAction = { table: RegistryTable; id: string; status: RegistryStatus; title: string } | null;

const emptySite = (): SiteForm => ({ name: '', organizationName: '', address: '', city: '', state: '', zipCode: '', mainPhone: '' });
const emptyInstructor = (): InstructorForm => ({ trainingSiteId: '', firstName: '', lastName: '', email: '', mobilePhone: '', businessPhone: '', credentials: '', title: '', preferredContactMethod: 'email', preferredContactHours: '', contactInstructions: '' });
const emptyClass = (): ClassForm => ({ trainingSiteId: '', instructorId: '', name: '', classStartDate: '', rideTimeEndDate: '', notes: '' });

const tabs: { value: RegistryView; label: string }[] = [
  { value: 'classes', label: 'Classes' },
  { value: 'instructors', label: 'Instructors' },
  { value: 'sites', label: 'Training Sites' },
];

const statusLabels: Record<RegistryStatus, string> = { pending: 'Pending', active: 'Active', rejected: 'Rejected', suspended: 'Suspended', archived: 'Archived' };

function localDate() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function lifecycleFor(trainingClass: TrainingClass): ClassLifecycle {
  const today = localDate();
  if (trainingClass.ride_time_end_date < today) return 'expired';
  if (trainingClass.class_start_date > today) return 'upcoming';
  return 'in_progress';
}

function statusVariant(status: RegistryStatus) {
  return status === 'active' ? 'green' : status === 'pending' ? 'gold' : status === 'suspended' ? 'orange' : status === 'rejected' ? 'red' : 'gray';
}

function lifecycleLabel(lifecycle: ClassLifecycle) {
  return lifecycle === 'in_progress' ? 'In progress' : lifecycle[0].toUpperCase() + lifecycle.slice(1);
}

function lifecycleVariant(lifecycle: ClassLifecycle) {
  return lifecycle === 'in_progress' ? 'blue' : lifecycle === 'upcoming' ? 'gold' : 'gray';
}

function titleFor(row: Site | Instructor | TrainingClass, table: RegistryTable) {
  if (table === 'instructors') return `${(row as Instructor).first_name} ${(row as Instructor).last_name}`;
  return (row as Site | TrainingClass).name;
}

function actionsFor(status: RegistryStatus): { status: RegistryStatus; label: string; confirm: boolean }[] {
  if (status === 'pending') return [{ status: 'active', label: 'Approve', confirm: false }, { status: 'rejected', label: 'Reject', confirm: true }, { status: 'archived', label: 'Archive', confirm: true }];
  if (status === 'active') return [{ status: 'suspended', label: 'Suspend', confirm: true }, { status: 'archived', label: 'Archive', confirm: true }];
  const actions: { status: RegistryStatus; label: string; confirm: boolean }[] = [{ status: 'active', label: 'Reactivate', confirm: false }, { status: 'archived', label: 'Archive', confirm: true }];
  return actions.filter((action) => !(status === 'archived' && action.status === 'archived'));
}

export function RegistryManagement() {
  const supabase = createClient() as any;
  const [sites, setSites] = useState<Site[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [classes, setClasses] = useState<TrainingClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedView, setSelectedView] = useState<RegistryView>('classes');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RegistryStatus>('all');
  const [lifecycleFilter, setLifecycleFilter] = useState<'all' | ClassLifecycle>('all');
  const [editor, setEditor] = useState<Editor>(null);
  const [siteForm, setSiteForm] = useState<SiteForm>(emptySite);
  const [instructorForm, setInstructorForm] = useState<InstructorForm>(emptyInstructor);
  const [classForm, setClassForm] = useState<ClassForm>(emptyClass);
  const [detailClass, setDetailClass] = useState<TrainingClass | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: siteRows, error: siteError }, { data: instructorRows, error: instructorError }, { data: classRows, error: classError }, { data: studentRows, error: studentError }] = await Promise.all([
      supabase.from('training_sites').select('*').order('created_at', { ascending: false }),
      supabase.from('instructors').select('*, training_sites(name)').order('created_at', { ascending: false }),
      supabase.from('training_classes').select('*, training_sites(name), instructors(first_name, last_name)').order('class_start_date', { ascending: false }),
      supabase.from('students').select('id, full_name, email, training_class_id').not('training_class_id', 'is', null),
    ]);

    const loadError = siteError || instructorError || classError || studentError;
    if (loadError) setError(loadError.message || 'Unable to load the registry.');
    setSites((siteRows ?? []) as Site[]);
    setInstructors((instructorRows ?? []) as Instructor[]);
    setClasses((classRows ?? []) as TrainingClass[]);
    setStudents((studentRows ?? []) as Student[]);
    setLoading(false);
  };

  const request = async (body: unknown) => {
    setError(null);
    const response = await fetch('/api/admin/registry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.success !== true) throw new Error(result?.error || 'Registry save failed.');
  };

  const statusRequest = async (table: RegistryTable, id: string, status: RegistryStatus) => {
    setSaving(`${table}-${id}-${status}`);
    setError(null);
    try {
      const response = await fetch('/api/admin/registry-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, id, status }) });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success !== true) throw new Error(result?.error || 'Status update failed.');
      setPendingAction(null);
      await loadAll();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Status update failed.');
    } finally {
      setSaving(null);
    }
  };

  const openEditor = (table: RegistryTable, row?: Site | Instructor | TrainingClass) => {
    setError(null);
    if (table === 'training_sites') {
      const site = row as Site | undefined;
      setSiteForm(site ? { name: site.name, organizationName: site.organization_name, address: site.address, city: site.city, state: site.state, zipCode: site.zip_code, mainPhone: site.main_phone ?? '' } : emptySite());
    } else if (table === 'instructors') {
      const instructor = row as Instructor | undefined;
      setInstructorForm(instructor ? { trainingSiteId: instructor.training_site_id ?? '', firstName: instructor.first_name, lastName: instructor.last_name, email: instructor.email, mobilePhone: instructor.mobile_phone, businessPhone: instructor.business_phone ?? '', credentials: instructor.credentials, title: instructor.title, preferredContactMethod: instructor.preferred_contact_method, preferredContactHours: instructor.preferred_contact_hours, contactInstructions: instructor.contact_instructions ?? '' } : emptyInstructor());
    } else {
      const trainingClass = row as TrainingClass | undefined;
      setClassForm(trainingClass ? { trainingSiteId: trainingClass.training_site_id, instructorId: trainingClass.instructor_id, name: trainingClass.name, classStartDate: trainingClass.class_start_date, rideTimeEndDate: trainingClass.ride_time_end_date, notes: trainingClass.notes ?? '' } : emptyClass());
    }
    setEditor({ table, row });
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!editor) return;
    const id = editor.row?.id;
    setSaving(`${editor.table}-save`);
    try {
      const status = editor.row?.status ?? 'active';
      const data = editor.table === 'training_sites'
        ? { ...siteForm, status }
        : editor.table === 'instructors'
          ? { ...instructorForm, status }
          : { ...classForm, status };
      await request({ table: editor.table, ...(id ? { id } : {}), data });
      setEditor(null);
      await loadAll();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Registry save failed.');
    } finally {
      setSaving(null);
    }
  };

  const studentsForClass = (classId: string) => students.filter((student) => student.training_class_id === classId);
  const classInstructorOptions = classForm.trainingSiteId ? instructors.filter((instructor) => instructor.training_site_id === classForm.trainingSiteId) : [];
  const pendingCount = [...sites, ...instructors, ...classes].filter((row) => row.status === 'pending').length;
  const activeExpired = classes.filter((trainingClass) => trainingClass.status === 'active' && lifecycleFor(trainingClass) === 'expired');
  const emptyClasses = classes.filter((trainingClass) => studentsForClass(trainingClass.id).length === 0);
  const inProgressCount = classes.filter((trainingClass) => trainingClass.status === 'active' && lifecycleFor(trainingClass) === 'in_progress').length;

  const filteredClasses = classes.filter((trainingClass) => {
    const haystack = `${trainingClass.name} ${trainingClass.training_sites?.name ?? ''} ${trainingClass.instructors ? `${trainingClass.instructors.first_name} ${trainingClass.instructors.last_name}` : ''}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (statusFilter === 'all' || trainingClass.status === statusFilter) && (lifecycleFilter === 'all' || lifecycleFor(trainingClass) === lifecycleFilter);
  });
  const filteredInstructors = instructors.filter((instructor) => `${instructor.first_name} ${instructor.last_name} ${instructor.email} ${instructor.training_sites?.name ?? ''}`.toLowerCase().includes(query.toLowerCase()) && (statusFilter === 'all' || instructor.status === statusFilter));
  const filteredSites = sites.filter((site) => `${site.name} ${site.organization_name} ${site.city} ${site.state}`.toLowerCase().includes(query.toLowerCase()) && (statusFilter === 'all' || site.status === statusFilter));

  const changeView = (view: string) => {
    setSelectedView(view as RegistryView);
    setQuery('');
    setStatusFilter('all');
    setLifecycleFilter('all');
  };

  const statusAction = (table: RegistryTable, row: Site | Instructor | TrainingClass, action: { status: RegistryStatus; label: string; confirm: boolean }) => {
    if (action.confirm) {
      setPendingAction({ table, id: row.id, status: action.status, title: titleFor(row, table) });
      return;
    }
    void statusRequest(table, row.id, action.status);
  };

  const editorTitle = editor ? `${editor.row ? 'Edit' : 'Add'} ${editor.table === 'training_classes' ? 'Class' : editor.table === 'instructors' ? 'Instructor' : 'Training Site'}` : '';
  const editorSaving = editor ? saving === `${editor.table}-save` : false;

  return (
    <div className="space-y-6">
      <PageHeader title="Registry" description="Manage training classes, instructors, and training sites." actions={<Button onClick={() => openEditor(selectedView === 'classes' ? 'training_classes' : selectedView === 'instructors' ? 'instructors' : 'training_sites')}>Add {selectedView === 'classes' ? 'Class' : selectedView === 'instructors' ? 'Instructor' : 'Training Site'}</Button>} />
      {error && <Alert title="Registry action failed" tone="danger">{error}</Alert>}

      <FactGrid className="lg:grid-cols-4">
        <FactItem label="In progress">{inProgressCount} active classes</FactItem>
        <FactItem label="Needs archive">{activeExpired.length} expired active classes</FactItem>
        <FactItem label="Empty classes">{emptyClasses.length} without students</FactItem>
        <FactItem label="Pending review">{pendingCount} registry records</FactItem>
      </FactGrid>

      {activeExpired.length > 0 || pendingCount > 0 || emptyClasses.length > 0 ? (
        <StatusBanner tone="warning">
          <p className="font-semibold">Registry attention needed</p>
          <p className="mt-1 text-sm">{activeExpired.length > 0 && `${activeExpired.length} active class${activeExpired.length === 1 ? '' : 'es'} ${activeExpired.length === 1 ? 'has' : 'have'} expired. `}{emptyClasses.length > 0 && `${emptyClasses.length} class${emptyClasses.length === 1 ? '' : 'es'} ${emptyClasses.length === 1 ? 'has' : 'have'} no enrolled students. `}{pendingCount > 0 && `${pendingCount} record${pendingCount === 1 ? '' : 's'} await review.`}</p>
          {activeExpired.length > 0 && <Button size="sm" variant="secondary" className="mt-3" onClick={() => { setSelectedView('classes'); setStatusFilter('active'); setLifecycleFilter('expired'); }}>Review expired classes</Button>}
        </StatusBanner>
      ) : <StatusBanner tone="success">No registry records require attention.</StatusBanner>}

      <Tabs tabs={tabs} value={selectedView} onChange={changeView} />
      <SectionCard className="p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
          <Input label={`Search ${selectedView === 'classes' ? 'classes, sites, or instructors' : selectedView === 'instructors' ? 'instructors' : 'training sites'}`} value={query} onChange={(event) => setQuery(event.target.value)} />
          <Select label="Status" value={statusFilter} onChange={(value) => setStatusFilter(value as 'all' | RegistryStatus)} options={[{ value: 'all', label: 'All statuses' }, ...Object.entries(statusLabels).map(([value, label]) => ({ value, label }))]} />
          {selectedView === 'classes' ? <Select label="Lifecycle" value={lifecycleFilter} onChange={(value) => setLifecycleFilter(value as 'all' | ClassLifecycle)} options={[{ value: 'all', label: 'All lifecycles' }, { value: 'upcoming', label: 'Upcoming' }, { value: 'in_progress', label: 'In progress' }, { value: 'expired', label: 'Expired' }]} /> : <div className="hidden md:block" />}
        </div>

        {loading ? <div className="mt-4"><LoadingState label="Loading registry records..." /></div> : selectedView === 'classes' ? <ClassesView rows={filteredClasses} studentsForClass={studentsForClass} saving={saving} onEdit={(row) => openEditor('training_classes', row)} onDetail={setDetailClass} onStatus={statusAction} /> : selectedView === 'instructors' ? <InstructorsView rows={filteredInstructors} saving={saving} onEdit={(row) => openEditor('instructors', row)} onStatus={statusAction} /> : <SitesView rows={filteredSites} instructors={instructors} classes={classes} saving={saving} onEdit={(row) => openEditor('training_sites', row)} onStatus={statusAction} />}
      </SectionCard>

      <Modal open={editor !== null} onClose={() => !editorSaving && setEditor(null)} title={editorTitle}>
        <form onSubmit={handleSave} className="space-y-4">
          {editor?.table === 'training_sites' && <SiteFields form={siteForm} onChange={setSiteForm} />}
          {editor?.table === 'instructors' && <InstructorFields form={instructorForm} onChange={setInstructorForm} sites={sites} />}
          {editor?.table === 'training_classes' && <ClassFields form={classForm} onChange={setClassForm} sites={sites} instructors={classInstructorOptions} />}
          <div className="flex justify-end gap-2 border-t border-gray-200 pt-4"><Button type="button" variant="secondary" onClick={() => setEditor(null)} disabled={editorSaving}>Cancel</Button><Button type="submit" loading={editorSaving}>{editor?.row ? 'Save changes' : 'Create record'}</Button></div>
        </form>
      </Modal>

      <Modal open={detailClass !== null} onClose={() => setDetailClass(null)} title={detailClass?.name}>
        {detailClass && <ClassDetail trainingClass={detailClass} students={studentsForClass(detailClass.id)} />}
      </Modal>

      <ConfirmDialog open={pendingAction !== null} title={`${pendingAction?.status === 'archived' ? 'Archive' : pendingAction?.status === 'suspended' ? 'Suspend' : 'Reject'} registry record`} description={`${pendingAction?.title ?? 'This record'} will be ${pendingAction?.status}. This can affect class availability and related records.`} confirmLabel={pendingAction?.status === 'archived' ? 'Archive record' : pendingAction?.status === 'suspended' ? 'Suspend record' : 'Reject record'} loading={pendingAction ? saving === `${pendingAction.table}-${pendingAction.id}-${pendingAction.status}` : false} onClose={() => !saving && setPendingAction(null)} onConfirm={() => pendingAction && void statusRequest(pendingAction.table, pendingAction.id, pendingAction.status)} />
    </div>
  );
}

function ClassesView({ rows, studentsForClass, saving, onEdit, onDetail, onStatus }: { rows: TrainingClass[]; studentsForClass: (classId: string) => Student[]; saving: string | null; onEdit: (row: TrainingClass) => void; onDetail: (row: TrainingClass) => void; onStatus: (table: RegistryTable, row: TrainingClass, action: { status: RegistryStatus; label: string; confirm: boolean }) => void }) {
  if (rows.length === 0) return <div className="mt-4"><EmptyState title="No classes match these filters" description="Adjust the search or filter controls to find another class." /></div>;
  return <>
    <div className="mt-4 hidden lg:block"><DataTable><DataTableHead><DataTableRow><DataTableCell header>Class</DataTableCell><DataTableCell header>Site</DataTableCell><DataTableCell header>Instructor</DataTableCell><DataTableCell header>Window</DataTableCell><DataTableCell header>Status</DataTableCell><DataTableCell header>Students</DataTableCell><DataTableCell header>Actions</DataTableCell></DataTableRow></DataTableHead><tbody>{rows.map((row) => <DataTableRow key={row.id}><DataTableCell><button className="font-semibold text-wfd-charcoal hover:text-wfd-crimson focus:outline-none focus:ring-2 focus:ring-wfd-crimson" onClick={() => onDetail(row)}>{row.name}</button></DataTableCell><DataTableCell>{row.training_sites?.name ?? 'No site'}</DataTableCell><DataTableCell>{row.instructors ? `${row.instructors.first_name} ${row.instructors.last_name}` : 'No instructor'}</DataTableCell><DataTableCell><span className="block whitespace-nowrap">{row.class_start_date}</span><span className="block text-xs text-gray-500">to {row.ride_time_end_date}</span></DataTableCell><DataTableCell><div className="flex flex-wrap gap-1"><Badge variant={statusVariant(row.status)}>{statusLabels[row.status]}</Badge><Badge variant={lifecycleVariant(lifecycleFor(row))}>{lifecycleLabel(lifecycleFor(row))}</Badge></div></DataTableCell><DataTableCell>{studentsForClass(row.id).length}</DataTableCell><DataTableCell><RecordActions table="training_classes" row={row} saving={saving} onEdit={onEdit} onStatus={onStatus} /></DataTableCell></DataTableRow>)}</tbody></DataTable></div>
    <div className="mt-4 space-y-3 lg:hidden">{rows.map((row) => <article key={row.id} className="rounded-lg border border-gray-200 p-3"><div className="flex items-start justify-between gap-3"><button className="text-left font-semibold text-wfd-charcoal hover:text-wfd-crimson focus:outline-none focus:ring-2 focus:ring-wfd-crimson" onClick={() => onDetail(row)}>{row.name}</button><div className="flex flex-wrap justify-end gap-1"><Badge variant={statusVariant(row.status)}>{statusLabels[row.status]}</Badge><Badge variant={lifecycleVariant(lifecycleFor(row))}>{lifecycleLabel(lifecycleFor(row))}</Badge></div></div><p className="mt-2 text-sm text-gray-600">{row.training_sites?.name ?? 'No site'} · {row.instructors ? `${row.instructors.first_name} ${row.instructors.last_name}` : 'No instructor'}</p><p className="mt-1 text-sm text-gray-600">{row.class_start_date} to {row.ride_time_end_date} · {studentsForClass(row.id).length} students</p><div className="mt-3"><RecordActions table="training_classes" row={row} saving={saving} onEdit={onEdit} onStatus={onStatus} /></div></article>)}</div>
  </>;
}

function InstructorsView({ rows, saving, onEdit, onStatus }: { rows: Instructor[]; saving: string | null; onEdit: (row: Instructor) => void; onStatus: (table: RegistryTable, row: Instructor, action: { status: RegistryStatus; label: string; confirm: boolean }) => void }) {
  if (rows.length === 0) return <div className="mt-4"><EmptyState title="No instructors match these filters" /></div>;
  return <div className="mt-4"><DataTable><DataTableHead><DataTableRow><DataTableCell header>Instructor</DataTableCell><DataTableCell header>Training site</DataTableCell><DataTableCell header>Contact</DataTableCell><DataTableCell header>Status</DataTableCell><DataTableCell header>Actions</DataTableCell></DataTableRow></DataTableHead><tbody>{rows.map((row) => <DataTableRow key={row.id}><DataTableCell><p className="font-semibold">{row.first_name} {row.last_name}</p><p className="text-xs text-gray-500">{row.credentials} · {row.title}</p></DataTableCell><DataTableCell>{row.training_sites?.name ?? 'No site assigned'}</DataTableCell><DataTableCell><a className="text-wfd-crimson underline" href={`mailto:${row.email}`}>{row.email}</a><p className="text-xs text-gray-500">{row.mobile_phone}</p></DataTableCell><DataTableCell><Badge variant={statusVariant(row.status)}>{statusLabels[row.status]}</Badge></DataTableCell><DataTableCell><RecordActions table="instructors" row={row} saving={saving} onEdit={onEdit} onStatus={onStatus} /></DataTableCell></DataTableRow>)}</tbody></DataTable></div>;
}

function SitesView({ rows, instructors, classes, saving, onEdit, onStatus }: { rows: Site[]; instructors: Instructor[]; classes: TrainingClass[]; saving: string | null; onEdit: (row: Site) => void; onStatus: (table: RegistryTable, row: Site, action: { status: RegistryStatus; label: string; confirm: boolean }) => void }) {
  if (rows.length === 0) return <div className="mt-4"><EmptyState title="No training sites match these filters" /></div>;
  return <div className="mt-4"><DataTable><DataTableHead><DataTableRow><DataTableCell header>Training site</DataTableCell><DataTableCell header>Location</DataTableCell><DataTableCell header>Registry use</DataTableCell><DataTableCell header>Status</DataTableCell><DataTableCell header>Actions</DataTableCell></DataTableRow></DataTableHead><tbody>{rows.map((row) => <DataTableRow key={row.id}><DataTableCell><p className="font-semibold">{row.name}</p><p className="text-xs text-gray-500">{row.organization_name}</p></DataTableCell><DataTableCell>{row.city}, {row.state}<p className="text-xs text-gray-500">{row.main_phone ?? 'No phone'}</p></DataTableCell><DataTableCell>{instructors.filter((instructor) => instructor.training_site_id === row.id).length} instructors · {classes.filter((trainingClass) => trainingClass.training_site_id === row.id).length} classes</DataTableCell><DataTableCell><Badge variant={statusVariant(row.status)}>{statusLabels[row.status]}</Badge></DataTableCell><DataTableCell><RecordActions table="training_sites" row={row} saving={saving} onEdit={onEdit} onStatus={onStatus} /></DataTableCell></DataTableRow>)}</tbody></DataTable></div>;
}

function RecordActions({ table, row, saving, onEdit, onStatus }: { table: RegistryTable; row: Site | Instructor | TrainingClass; saving: string | null; onEdit: (row: any) => void; onStatus: (table: RegistryTable, row: any, action: { status: RegistryStatus; label: string; confirm: boolean }) => void }) {
  return <div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => onEdit(row)}>Edit</Button>{actionsFor(row.status).map((action) => <Button key={action.status} size="sm" variant={action.status === 'rejected' || action.status === 'archived' ? 'danger' : action.status === 'active' ? 'sage' : 'secondary'} loading={saving === `${table}-${row.id}-${action.status}`} onClick={() => onStatus(table, row, action)}>{action.label}</Button>)}</div>;
}

function ClassDetail({ trainingClass, students }: { trainingClass: TrainingClass; students: Student[] }) {
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Detail label="Training site">{trainingClass.training_sites?.name ?? 'No site'}</Detail><Detail label="Instructor">{trainingClass.instructors ? `${trainingClass.instructors.first_name} ${trainingClass.instructors.last_name}` : 'No instructor'}</Detail><Detail label="Class start">{trainingClass.class_start_date}</Detail><Detail label="Ride-time end">{trainingClass.ride_time_end_date}</Detail></div>{trainingClass.notes && <Detail label="Notes">{trainingClass.notes}</Detail>}<div><h4 className="font-semibold text-wfd-charcoal">Enrolled students ({students.length})</h4>{students.length === 0 ? <p className="mt-1 text-sm text-gray-600">No students are linked to this class.</p> : <ul className="mt-2 space-y-2">{students.map((student) => <li key={student.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"><div><p className="font-medium">{student.full_name}</p><p className="text-xs text-gray-500">{student.email}</p></div><Link className="text-sm font-semibold text-wfd-crimson underline" href={`/admin/students/${student.id}`}>View profile</Link></li>)}</ul>}</div></div>;
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) { return <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p><div className="mt-1 text-sm text-wfd-charcoal">{children}</div></div>; }

function SiteFields({ form, onChange }: { form: SiteForm; onChange: (form: SiteForm) => void }) { return <div className="grid gap-3 sm:grid-cols-2"><Input label="Site name" required value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} /><Input label="Organization" required value={form.organizationName} onChange={(event) => onChange({ ...form, organizationName: event.target.value })} /><Input label="Address" required value={form.address} onChange={(event) => onChange({ ...form, address: event.target.value })} /><Input label="City" required value={form.city} onChange={(event) => onChange({ ...form, city: event.target.value })} /><Input label="State" required value={form.state} onChange={(event) => onChange({ ...form, state: event.target.value })} /><Input label="ZIP" required value={form.zipCode} onChange={(event) => onChange({ ...form, zipCode: event.target.value })} /><Input label="Main phone" value={form.mainPhone} onChange={(event) => onChange({ ...form, mainPhone: event.target.value })} /></div>; }

function InstructorFields({ form, onChange, sites }: { form: InstructorForm; onChange: (form: InstructorForm) => void; sites: Site[] }) { return <div className="grid gap-3 sm:grid-cols-2"><Select label="Training site" required value={form.trainingSiteId} onChange={(value) => onChange({ ...form, trainingSiteId: value })} options={sites.map((site) => ({ value: site.id, label: site.name }))} /><Input label="First name" required value={form.firstName} onChange={(event) => onChange({ ...form, firstName: event.target.value })} /><Input label="Last name" required value={form.lastName} onChange={(event) => onChange({ ...form, lastName: event.target.value })} /><Input label="Email" type="email" required value={form.email} onChange={(event) => onChange({ ...form, email: event.target.value })} /><Input label="Mobile phone" required value={form.mobilePhone} onChange={(event) => onChange({ ...form, mobilePhone: event.target.value })} /><Input label="Business phone" value={form.businessPhone} onChange={(event) => onChange({ ...form, businessPhone: event.target.value })} /><Input label="Credentials" required value={form.credentials} onChange={(event) => onChange({ ...form, credentials: event.target.value })} /><Input label="Title" required value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} /><Select label="Preferred contact" required value={form.preferredContactMethod} onChange={(value) => onChange({ ...form, preferredContactMethod: value })} options={[{ value: 'email', label: 'Email' }, { value: 'mobile', label: 'Mobile phone' }, { value: 'business', label: 'Business phone' }]} /><Input label="Contact hours" required value={form.preferredContactHours} onChange={(event) => onChange({ ...form, preferredContactHours: event.target.value })} /><TextArea label="Contact instructions" value={form.contactInstructions} onChange={(value) => onChange({ ...form, contactInstructions: value })} /></div>; }

function ClassFields({ form, onChange, sites, instructors }: { form: ClassForm; onChange: (form: ClassForm) => void; sites: Site[]; instructors: Instructor[] }) { return <div className="grid gap-3 sm:grid-cols-2"><Select label="Training site" required value={form.trainingSiteId} onChange={(trainingSiteId) => onChange({ ...form, trainingSiteId, instructorId: trainingSiteId === form.trainingSiteId ? form.instructorId : '' })} options={sites.map((site) => ({ value: site.id, label: site.name }))} /><Select label="Instructor" required value={form.instructorId} onChange={(instructorId) => onChange({ ...form, instructorId })} options={instructors.map((instructor) => ({ value: instructor.id, label: `${instructor.first_name} ${instructor.last_name}` }))} /><Input label="Class name" required value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} /><Input label="Class start" type="date" required value={form.classStartDate} onChange={(event) => onChange({ ...form, classStartDate: event.target.value })} /><Input label="Ride-time end" type="date" required value={form.rideTimeEndDate} onChange={(event) => onChange({ ...form, rideTimeEndDate: event.target.value })} /><TextArea label="Notes" value={form.notes} onChange={(value) => onChange({ ...form, notes: value })} /></div>; }

function Select({ label, value, options, onChange, required }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void; required?: boolean }) { return <FormField label={label}><select required={required} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson"><option value="">Select...</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></FormField>; }

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <FormField label={label}><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" /></FormField>; }
