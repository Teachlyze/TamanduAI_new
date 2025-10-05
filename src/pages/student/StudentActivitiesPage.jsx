import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2 } from 'lucide-react';

export default function StudentActivitiesPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // TODO: Fetch student-visible activities. Placeholder list for now.
        const fake = [];
        if (mounted) setItems(fake);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Minhas Atividades</h1>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Carregando...
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Sem atividades no momento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">Quando seu professor publicar novas atividades, elas aparecerão aqui.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((a) => (
              <Card key={a.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <CardTitle className="text-base">{a.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{a.description}</p>
                  <div className="mt-4">
                    <Button onClick={() => navigate(`/dashboard/activities/${a.id}`)}>Abrir</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
