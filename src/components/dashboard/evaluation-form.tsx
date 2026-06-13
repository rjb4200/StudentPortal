'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EvaluationFormProps {
  studentId: string;
}

const categories = [
  { key: 'clinical_rating', label: 'Clinical Performance' },
  { key: 'teaching_rating', label: 'Teaching Quality' },
  { key: 'safety_rating', label: 'Safety Adherence' },
  { key: 'overall_rating', label: 'Overall Experience' },
];

export function EvaluationForm({ studentId }: EvaluationFormProps) {
  const [preceptors, setPreceptors] = useState<any[]>([]);
  const [preceptorId, setPreceptorId] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('preceptors')
      .select('id, full_name')
      .eq('is_active', true)
      .order('full_name')
      .then(({ data }) => {
        if (data) setPreceptors(data);
      });
  }, []);

  const setRating = (key: string, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!preceptorId) {
      setError('Please select a preceptor.');
      return;
    }
    if (categories.some((c) => !ratings[c.key])) {
      setError('Please provide ratings for all categories.');
      return;
    }

    setLoading(true);
    setError('');

    const supabase = createClient();
    const isFlagged = (ratings.overall_rating || 0) < 3;

    const { error: insertError } = await supabase.from('evaluations').insert({
      preceptor_id: preceptorId,
      student_id: studentId,
      clinical_rating: ratings.clinical_rating,
      teaching_rating: ratings.teaching_rating,
      safety_rating: ratings.safety_rating,
      overall_rating: ratings.overall_rating,
      comments: comments.trim() || null,
      is_flagged: isFlagged,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    if (isFlagged) {
      try {
        await fetch('/api/notify/flagged-evaluation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, preceptorId, overallRating: ratings.overall_rating }),
        });
      } catch {}
    }

    try {
      await fetch('/api/notify/evaluation-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, preceptorId }),
      });
    } catch {}

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <Card className="p-6 text-center">
        <div className="text-3xl mb-2">&#10003;</div>
        <h3 className="text-lg font-bold text-green-700 mb-1">Evaluation Submitted</h3>
        <p className="text-sm text-gray-500">Thank you for your feedback.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-wfd-charcoal mb-4">Submit Evaluation</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preceptor</label>
          <select
            value={preceptorId}
            onChange={(e) => setPreceptorId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wfd-crimson outline-none text-gray-900"
          >
            <option value="">Select a preceptor...</option>
            {preceptors.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>
        </div>

        {categories.map((cat) => (
          <div key={cat.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{cat.label}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(cat.key, n)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                    ratings[cat.key] === n
                      ? 'bg-wfd-crimson text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comments (optional)
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wfd-crimson outline-none text-gray-900 resize-none"
            placeholder="Any additional feedback..."
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        <Button onClick={handleSubmit} loading={loading} className="w-full">
          Submit Evaluation
        </Button>
      </div>
    </Card>
  );
}
