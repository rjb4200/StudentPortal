'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LegalDoc {
  id: string;
  accepted_at: string;
  legal_documents: {
    id: string;
    title: string;
    body_text: string;
  } | null;
}

interface LegalDocumentsSectionProps {
  acceptances: LegalDoc[];
  studentName: string;
  signatureIp: string | null;
  signatureTimestamp: string | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function LegalDocumentsSection({
  acceptances,
  studentName,
  signatureIp,
  signatureTimestamp,
}: LegalDocumentsSectionProps) {
  const [viewDoc, setViewDoc] = useState<LegalDoc | null>(null);
  const [printing, setPrinting] = useState(false);

  if (acceptances.length === 0) {
    return <p className="text-sm text-gray-400 py-2">No signed legal documents</p>;
  }

  function logAction(action: string) {
    fetch('/api/admin/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    }).catch(() => {});
  }

  function handleView(doc: LegalDoc) {
    setViewDoc(doc);
    logAction('viewed_legal_document');
  }

  function handlePrint(doc: LegalDoc) {
    setViewDoc(doc);
    setPrinting(true);
    logAction('printed_legal_document');
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 200);
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-wfd-crimson/20 text-left">
              <th className="py-2.5 px-3 font-semibold text-wfd-crimson/80 text-xs uppercase tracking-wide">Document</th>
              <th className="py-2.5 px-3 font-semibold text-wfd-crimson/80 text-xs uppercase tracking-wide">Status</th>
              <th className="py-2.5 px-3 font-semibold text-wfd-crimson/80 text-xs uppercase tracking-wide">Signed Date</th>
              <th className="py-2.5 px-3 font-semibold text-wfd-crimson/80 text-xs uppercase tracking-wide print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody>
            {acceptances.map((acc) => (
              <tr key={acc.id} className="border-b border-gray-100 even:bg-gray-50/30">
                <td className="py-2.5 px-3 font-semibold text-wfd-charcoal">
                  {acc.legal_documents?.title || 'Unknown'}
                </td>
                <td className="py-2.5 px-3">
                  <Badge variant="green">Signed</Badge>
                </td>
                <td className="py-2.5 px-3 text-gray-500 text-xs">
                  {formatDate(acc.accepted_at)}
                </td>
                <td className="py-2.5 px-3 print:hidden">
                  <div className="flex gap-1">
                    <Button size="sm" variant="secondary" onClick={() => handleView(acc)}>View</Button>
                    <Button size="sm" variant="secondary" onClick={() => handlePrint(acc)}>Print</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
        <span className="font-semibold text-wfd-charcoal">Signed as: {studentName}</span>
        <span>IP: {signatureIp || 'N/A'}</span>
        {signatureTimestamp && <span>{formatDate(signatureTimestamp)}</span>}
      </div>

      {viewDoc && !printing && (
        <Modal open={true} title={viewDoc.legal_documents?.title || 'Document'} onClose={() => setViewDoc(null)}>
          <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
            {viewDoc.legal_documents?.body_text}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
            <p><strong className="text-wfd-charcoal">Signed by:</strong> {studentName}</p>
            <p><strong className="text-wfd-charcoal">Signed on:</strong> {formatDate(viewDoc.accepted_at)}</p>
            {signatureIp && <p><strong className="text-wfd-charcoal">IP Address:</strong> {signatureIp}</p>}
          </div>
        </Modal>
      )}
    </>
  );
}
