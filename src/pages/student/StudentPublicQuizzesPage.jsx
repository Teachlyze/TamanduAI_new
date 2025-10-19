import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const StudentPublicQuizzesPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('quizzes')
          .select('id, title, topic, grade, difficulty, created_at')
          .eq('is_public', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setQuizzes(data || []);
      } catch (e) {
        // noop: UI simples
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = quizzes.filter(q => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      q.title?.toLowerCase().includes(s) ||
      q.topic?.toLowerCase().includes(s) ||
      q.grade?.toLowerCase().includes(s) ||
      q.difficulty?.toLowerCase().includes(s)
    );
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quizzes Públicos</h1>
        <div className="w-64">
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white dark:bg-slate-900 text-foreground border-border rounded-lg" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Nenhum quiz público encontrado</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((q) => (
            <Card key={q.id} className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate(`/students/quizzes/${q.id}`)}>
              <CardHeader>
                <CardTitle className="line-clamp-1">{q.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  {q.topic && <div>Tema: {q.topic}</div>}
                  <div>Nível: {q.grade || 'n/d'}</div>
                  <div>Dificuldade: {q.difficulty || 'n/d'}</div>
                  <div className="text-xs">Criado em {new Date(q.created_at).toLocaleDateString('pt-BR')}</div>
                </div>
                <Button className="mt-4 w-full whitespace-nowrap inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg" onClick={(e) => { e.stopPropagation(); navigate(`/students/quizzes/${q.id}`); }}>Fazer Quiz</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentPublicQuizzesPage;
