'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { Button } from './button';

const cx = (...classes: Array<string | undefined | false>) => classes.filter(Boolean).join(' ');

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <header className="flex flex-col gap-3 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold text-wfd-charcoal">{title}</h1>{description && <p className="mt-1 text-sm text-gray-600">{description}</p>}</div>{actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}</header>;
}

export function SectionCard({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx('rounded-lg border border-gray-200 border-l-4 border-l-wfd-crimson bg-white shadow-sm', className)}>{children}</section>;
}

export function StatusBanner({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'success' | 'warning' | 'danger' | 'neutral' }) {
  const tones = { success: 'border-wfd-sage/40 bg-wfd-sage/10 text-wfd-charcoal', warning: 'border-wfd-gold/50 bg-wfd-gold/10 text-wfd-charcoal', danger: 'border-wfd-crimson/40 bg-wfd-crimson/10 text-wfd-charcoal', neutral: 'border-gray-200 bg-gray-50 text-wfd-charcoal' };
  return <div className={cx('rounded-lg border p-4', tones[tone])}>{children}</div>;
}

export function Alert({ title, children, tone = 'info' }: { title?: string; children: ReactNode; tone?: 'info' | 'warning' | 'danger' }) {
  const tones = { info: 'border-blue-200 bg-blue-50 text-blue-950', warning: 'border-wfd-gold/50 bg-wfd-gold/10 text-wfd-charcoal', danger: 'border-wfd-crimson/40 bg-wfd-crimson/10 text-wfd-charcoal' };
  return <div role="alert" className={cx('rounded-lg border p-4 text-sm', tones[tone])}>{title && <p className="font-semibold">{title}</p>}<div className={title ? 'mt-1' : ''}>{children}</div></div>;
}

export function EmptyState({ title = 'Nothing to display', description, action }: { title?: string; description?: string; action?: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center"><p className="font-semibold text-wfd-charcoal">{title}</p>{description && <p className="mt-1 text-sm text-gray-600">{description}</p>}{action && <div className="mt-4">{action}</div>}</div>;
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) { return <div role="status" className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">{label}</div>; }

export function FactGrid({ children, className }: { children: ReactNode; className?: string }) { return <div className={cx('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>{children}</div>; }
export function FactItem({ label, children }: { label: string; children: ReactNode }) { return <div className="rounded-lg bg-gray-50/70 p-3"><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-wfd-crimson/70">{label}</span><div className="font-semibold text-wfd-charcoal">{children}</div></div>; }

export function DataTable({ children, className }: { children: ReactNode; className?: string }) { return <div className="overflow-x-auto"><table className={cx('w-full text-left text-sm', className)}>{children}</table></div>; }
export function DataTableHead({ children }: { children: ReactNode }) { return <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">{children}</thead>; }
export function DataTableRow({ children, className }: { children: ReactNode; className?: string }) { return <tr className={cx('border-b border-gray-100 last:border-0 hover:bg-gray-50/70', className)}>{children}</tr>; }
export function DataTableCell({ children, header = false, className }: { children: ReactNode; header?: boolean; className?: string }) { const Tag = header ? 'th' : 'td'; return <Tag className={cx('px-4 py-3', className)}>{children}</Tag>; }

export function Tabs({ tabs, value, onChange }: { tabs: { value: string; label: string }[]; value: string; onChange: (value: string) => void }) { return <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-gray-200">{tabs.map(tab => <button key={tab.value} role="tab" aria-selected={value === tab.value} onClick={() => onChange(tab.value)} className={cx('whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-wfd-crimson focus:ring-offset-2', value === tab.value ? 'border-wfd-crimson text-wfd-crimson' : 'border-transparent text-gray-600 hover:text-wfd-charcoal')}>{tab.label}</button>)}</div>; }
export function FormField({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) { return <label className="block text-sm font-semibold text-wfd-charcoal"><span className="mb-1 block">{label}</span>{children}{hint && <span className="mt-1 block text-xs font-normal text-gray-500">{hint}</span>}</label>; }

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onClose, loading }: { open: boolean; title: string; description: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void; loading?: boolean }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open) cancelRef.current?.focus(); }, [open]);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation" onKeyDown={event => { if (event.key === 'Escape' && !loading) onClose(); }}><button aria-label="Close confirmation" className="absolute inset-0 cursor-default bg-black/50" onClick={onClose} disabled={loading} /><div role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"><h2 id="confirm-dialog-title" className="text-lg font-bold text-wfd-charcoal">{title}</h2><p className="mt-2 text-sm text-gray-600">{description}</p><div className="mt-6 flex justify-end gap-3"><Button ref={cancelRef} variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button><Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button></div></div></div>;
}
