'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Preceptor {
  id: string;
  full_name: string;
  bio: string | null;
  image_url: string | null;
  specialty_tags: string[] | null;
  station_unit: string | null;
}

export function PreceptorGallery() {
  const [preceptors, setPreceptors] = useState<Preceptor[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('preceptors')
      .select('*')
      .eq('is_active', true)
      .order('full_name')
      .then(({ data }) => {
        if (data) setPreceptors(data);
      });
  }, []);

  return (
    <div>
      <h3 className="text-lg font-bold text-wfd-charcoal mb-4">Preceptor Gallery</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {preceptors.map((p) => (
          <Card key={p.id} hover className="p-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-bold">
                    {p.full_name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-wfd-charcoal">{p.full_name}</h4>
                {p.station_unit && (
                  <p className="text-xs text-gray-500 mt-0.5">{p.station_unit}</p>
                )}
                {p.bio && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.bio}</p>
                )}
                {p.specialty_tags && p.specialty_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.specialty_tags.map((tag) => (
                      <Badge key={tag} variant="crimson">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
