'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Report = {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reporterName: string;
  postContent: string | null;
};

export default function ModerationPanel(props: { reports: Report[] }) {
  const [reports, setReports] = useState(props.reports);
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(reportId: string, status: string) {
    setUpdating(reportId);
    const supabase = createClient();

    await supabase
      .schema('moderation')
      .from('reports')
      .update({ status })
      .eq('id', reportId);

    setUpdating(null);
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
  }

  if (reports.length === 0) {
    return <p className="empty-state">Aucun signalement pour le moment.</p>;
  }

  return (
    <div>
      {reports.map((r) => (
        <div key={r.id} className="moderation-card">
          <div className="moderation-meta">
            <span className={'listing-tag status-' + r.status}>{r.status}</span>
            <span className="listing-tag">{r.target_type}</span>
            <span className="listing-tag">{r.reason}</span>
          </div>

          <p className="hint">
            Signale par {r.reporterName} le {new Date(r.created_at).toLocaleDateString('fr-FR')}
          </p>

          {r.details && <p className="listing-desc" style={{ marginTop: 8 }}>{r.details}</p>}

          {r.postContent !== null && (
            <div className="moderation-content">{r.postContent}</div>
          )}

          <div className="moderation-actions">
            <button type="button" onClick={() => updateStatus(r.id, 'reviewing')} disabled={updating === r.id}>
              En cours
            </button>
            <button type="button" onClick={() => updateStatus(r.id, 'actioned')} disabled={updating === r.id}>
              Traite
            </button>
            <button type="button" onClick={() => updateStatus(r.id, 'dismissed')} disabled={updating === r.id}>
              Rejeter
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
