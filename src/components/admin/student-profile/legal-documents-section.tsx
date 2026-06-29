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
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-wfd-charcoal mb-2">Signed Legal Documents</h3>
        <p className="text-sm text-gray-400">No signed legal documents</p>
      </div>
    );
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
      <div className="border border-gray-200 rounded-lg p-4 print:border-none print:p-0">
        <h3 className="font-semibold text-wfd-charcoal mb-3">Signed Legal Documents</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2 px-3 font-medium text-gray-500">Document</th>
                <th className="py-2 px-3 font-medium text-gray-500">Status</th>
                <th className="py-2 px-3 font-medium text-gray-500">Signed Date</th>
                <th className="py-2 px-3 font-medium text-gray-500 print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody>
              {acceptances.map((acc) => (
                <tr key={acc.id} className="border-b border-gray-100">
                  <td className="py-2 px-3 font-medium text-wfd-charcoal">
                    {acc.legal_documents?.title || 'Unknown'}
                  </td>
                  <td className="py-2 px-3">
                    <Badge variant="green">Signed</Badge>
                  </td>
                  <td className="py-2 px-3 text-gray-500 text-xs">
                    {formatDate(acc.accepted_at)}
                  </td>
                  <td className="py-2 px-3 print:hidden">
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => handleView(acc)}>
                        View
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handlePrint(acc)}>
                        Print
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Signed as: {studentName} &middot; IP: {signatureIp || 'N/A'} &middot; {signatureTimestamp ? formatDate(signatureTimestamp) : 'N/A'}
        </p>
      </div>

      {viewDoc && !printing && (
        <Modal open={true} title={viewDoc.legal_documents?.title || 'Document'} onClose={() => setViewDoc(null)}>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap text-sm">
            {viewDoc.legal_documents?.body_text}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
            <p><strong>Signed by:</strong> {studentName}</p>
            <p><strong>Signed on:</strong> {formatDate(viewDoc.accepted_at)}</p>
            {signatureIp && <p><strong>IP Address:</strong> {signatureIp}</p>}
          </div>
        </Modal>
      )}
    </>
  );
}
