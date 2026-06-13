'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PreceptorAnalytics() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: evals } = await supabase
      .from('evaluations')
      .select('preceptor_id, clinical_rating, teaching_rating, safety_rating, overall_rating, preceptors!inner(full_name)');

    if (!evals) return;

    const grouped: Record<string, { name: string; ratings: number[]; clinical: number[]; teaching: number[]; safety: number[]; overall: number[] }> = {};

    evals.forEach((e: any) => {
      const id = e.preceptor_id;
      const name = e.preceptors?.full_name || 'Unknown';
      if (!grouped[id]) {
        grouped[id] = { name, ratings: [], clinical: [], teaching: [], safety: [], overall: [] };
      }
      grouped[id].ratings.push(e.overall_rating);
      grouped[id].clinical.push(e.clinical_rating);
      grouped[id].teaching.push(e.teaching_rating);
      grouped[id].safety.push(e.safety_rating);
      grouped[id].overall.push(e.overall_rating);
    });

    const scores = Object.entries(grouped)
      .map(([id, data]) => {
        const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
        return {
          id,
          name: data.name,
          avgClinical: avg(data.clinical),
          avgTeaching: avg(data.teaching),
          avgSafety: avg(data.safety),
          avgOverall: avg(data.overall),
          count: data.ratings.length,
        };
      })
      .sort((a, b) => b.avgOverall - a.avgOverall);

    setLeaderboard(scores);
  };

  const exportCSV = () => {
    const headers = 'Preceptor,Avg Clinical,Avg Teaching,Avg Safety,Avg Overall,Evaluations\n';
    const rows = leaderboard
      .map((l) => `${l.name},${l.avgClinical.toFixed(1)},${l.avgTeaching.toFixed(1)},${l.avgSafety.toFixed(1)},${l.avgOverall.toFixed(1)},${l.count}`)
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preceptor-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text('WFD EMS — Preceptor Analytics Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

      const cols = ['Preceptor', 'Avg Overall', 'Clinical', 'Teaching', 'Safety', '# Evals'];
      const rows = leaderboard.map((l) => [
        l.name,
        l.avgOverall.toFixed(1),
        l.avgClinical.toFixed(1),
        l.avgTeaching.toFixed(1),
        l.avgSafety.toFixed(1),
        String(l.count),
      ]);

      let y = 36;
      doc.setFontSize(8);
      (doc as any).autoTable({
        head: [cols],
        body: rows,
        startY: y,
        theme: 'striped',
      });

      doc.save(`preceptor-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch {}
    setExporting(false);
  };

  const maxBarWidth = 200;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-bold text-wfd-charcoal mb-4">Preceptor Leaderboard</h3>
        {leaderboard.length === 0 ? (
          <p className="text-gray-400 text-sm">No evaluation data yet.</p>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-6">{i + 1}.</span>
                <span className="text-sm font-medium text-wfd-charcoal w-32 truncate">{p.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="bg-wfd-crimson h-full rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${Math.min(100, (p.avgOverall / 5) * 100)}%` }}
                  >
                    <span className="text-[10px] text-white font-bold">{p.avgOverall.toFixed(1)}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{p.count} evals</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-bold text-wfd-charcoal mb-4">Export</h3>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={exportCSV}>
            Export to CSV
          </Button>
          <Button variant="secondary" onClick={exportPDF} loading={exporting}>
            Export to PDF
          </Button>
        </div>
      </Card>
    </div>
  );
}
