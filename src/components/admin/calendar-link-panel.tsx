'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, EmptyState } from '@/components/ui';

type FeedType = 'student' | 'training_site' | 'aggregate';

type FeedState = {
  id: string | null;
  token: string | null;
  feed_type: FeedType;
  entity_id: string | null;
  generated_at: string | null;
  emailed_at: string | null;
  created_at: string | null;
};

type StudentOption = { id: string; full_name: string; email: string };
type SiteOption = { id: string; name: string };

export function CalendarLinkPanel() {
  const [expanded, setExpanded] = useState(false);
  const [feedType, setFeedType] = useState<FeedType>('student');
  const [entityId, setEntityId] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedState | null>(null);
  const [feedUrl, setFeedUrl] = useState<string | null>(null);
  const [recipient, setRecipient] = useState('');
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState(false);

  const feedLabel = feedType === 'student' ? 'Student' : feedType === 'training_site' ? 'Training Site' : 'Admin';

  // Load entity options when feed type changes
  useEffect(() => {
    setEntityId(null);
    setFeed(null);
    setFeedUrl(null);
    setError(null);
    setRevokeConfirm(false);

    if (feedType === 'student') {
      setLoading(true);
      fetch('/api/admin/calendar-feeds/entities?type=student')
        .then((r) => r.json())
        .then((d) => { if (d.students) setStudents(d.students); })
        .finally(() => setLoading(false));
    } else if (feedType === 'training_site') {
      setLoading(true);
      fetch('/api/admin/calendar-feeds/entities?type=training_site')
        .then((r) => r.json())
        .then((d) => { if (d.sites) setSites(d.sites); })
        .finally(() => setLoading(false));
    } else {
      // Admin aggregate - no entity selector
      loadFeed();
    }
  }, [feedType]);

  // Load feed when entity is selected
  useEffect(() => {
    if (feedType === 'aggregate' || entityId) {
      loadFeed();
    }
  }, [entityId]);

  const loadFeed = async () => {
    if (feedType !== 'aggregate' && !entityId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ feed_type: feedType });
      if (entityId) params.set('entity_id', entityId);
      const res = await fetch(`/api/admin/calendar-feeds?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load feed');
      setFeed(data.feed);
      setFeedUrl(data.feedUrl);
      if (data.feed?.emailed_at && !recipient) {
        // Don't populate recipient; leave it to admin to enter
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleRotate = async () => {
    setLoading(true);
    setError(null);
    setRevokeConfirm(false);
    try {
      const res = await fetch('/api/admin/calendar-feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feed_type: feedType, entity_id: entityId ?? null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rotate token');
      setFeed(data.feed);
      setFeedUrl(data.feedUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to rotate token');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeConfirm) {
      setRevokeConfirm(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/calendar-feeds', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feed_type: feedType, entity_id: entityId ?? null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to revoke token');
      setFeed(null);
      setFeedUrl(null);
      setRevokeConfirm(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to revoke token');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!feedUrl) return;
    await navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    if (!recipient.trim() || !feed?.token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/calendar-feeds/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feed_type: feedType, entity_id: entityId ?? null, recipient: recipient.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');
      setFeed((prev) => prev ? { ...prev, emailed_at: data.emailed_at } : null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const hasToken = feed?.token != null;
  const wasEmailed = feed?.emailed_at != null;

  return (
    <Card className="p-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between text-left font-black text-wfd-charcoal"
      >
        <span className="text-lg">Calendar Links</span>
        <span className="text-xl">{expanded ? '▼' : '▲'}</span>
      </button>

      {!expanded && (
        <p className="mt-1 text-xs text-gray-500">Manage student, training site, and admin calendar feed links.</p>
      )}

      {expanded && (
        <div className="mt-4 space-y-5">
          {/* Feed type selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">Feed Type</label>
            <div className="mt-2 flex gap-2">
              {(['student', 'training_site', 'aggregate'] as FeedType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFeedType(type)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-bold capitalize transition-colors ${
                    feedType === type
                      ? 'border-wfd-crimson bg-wfd-crimson/10 text-wfd-crimson'
                      : 'border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {type === 'training_site' ? 'TEI' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Entity selector */}
          {feedType !== 'aggregate' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">
                Select {feedLabel}
              </label>
              <div className="mt-2">
                {feedType === 'student' ? (
                  <select
                    value={entityId ?? ''}
                    onChange={(e) => setEntityId(e.target.value || null)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  >
                    <option value="">-- Select a student --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={entityId ?? ''}
                    onChange={(e) => setEntityId(e.target.value || null)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  >
                    <option value="">-- Select a training site --</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && <Alert tone="danger">{error}</Alert>}

          {/* Feed status and controls (only when entity is selected or aggregate) */}
          {(feedType === 'aggregate' || entityId) && (
            <>
              {/* Status */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-bold text-wfd-charcoal">
                  {hasToken
                    ? `Active — generated ${feed?.generated_at ? new Date(feed.generated_at).toLocaleDateString() : 'unknown'}`
                    : feed?.generated_at === null && feed?.created_at
                      ? 'Revoked'
                      : 'No link generated'}
                </p>
              </div>

              {/* URL and Copy */}
              {hasToken && feedUrl && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">Calendar Feed URL</label>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 break-all rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">{feedUrl}</code>
                    <Button size="sm" variant="secondary" onClick={handleCopy} disabled={!feedUrl}>
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Rotate / Revoke */}
              <div className="flex gap-2">
                {hasToken && (
                  <>
                    <Button size="sm" onClick={handleRotate} loading={loading}>Rotate</Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleRevoke}
                      loading={loading && revokeConfirm}
                    >
                      {revokeConfirm ? 'Confirm Revoke?' : 'Revoke'}
                    </Button>
                  </>
                )}
                {!hasToken && (
                  <Button size="sm" onClick={handleRotate} loading={loading}>Generate Link</Button>
                )}
              </div>

              {/* Email section */}
              {hasToken && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-sm font-bold text-wfd-charcoal">Email Calendar Link</p>
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-gray-600">
                      Recipient Email
                      <input
                        type="email"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="recipient@example.com"
                        className="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
                      />
                    </label>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" onClick={handleSendEmail} loading={loading} disabled={!recipient.trim() || !hasToken}>
                      Send Link
                    </Button>
                    {wasEmailed && (
                      <Button size="sm" variant="secondary" onClick={handleSendEmail} loading={loading} disabled={!recipient.trim()}>
                        Resend
                      </Button>
                    )}
                  </div>
                  {wasEmailed && (
                    <p className="mt-2 text-xs text-gray-500">
                      Last emailed: {new Date(feed!.emailed_at!).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Empty state when no entity selected */}
          {feedType !== 'aggregate' && !entityId && !loading && (
            <EmptyState title={`Select a ${feedLabel.toLowerCase()} to manage their calendar link`} />
          )}
        </div>
      )}
    </Card>
  );
}
