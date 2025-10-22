import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const StudentQuizPlayPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // {position: 'A' | 'B' | 'C' | 'D'}
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [{ data: quiz, error: qErr }, { data: qs, error: qsErr }] = await Promise.all([
          supabase.from('quizzes').select('title').eq('id', quizId).eq('is_public', true).single(),
          supabase.from('quiz_questions').select('question, position').eq('quiz_id', quizId).order('position')
        ]);
        if (qErr) throw qErr;
        if (qsErr) throw qsErr;
        setTitle(quiz?.title || 'Quiz');
        setQuestions(qs || []);
      } catch (e) {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId]);

  const computedScore = useMemo(() => {
    let score = 0;
    for (const q of questions) {
      const body = q.question || {};
      const correct = (body.correta || '').toString().toUpperCase();
      const marked = (answers[q.position] || '').toString().toUpperCase();
      if (correct && marked && correct === marked) score += 1;
    }
    return score;
  }, [questions, answers]);

  const onMark = (pos, letter) => {
    setAnswers(prev => ({ ...prev, [pos]: letter }));
  };

  const submit = async () => {
    try {
      if (!user) return;
      setSubmitting(true);
      const normalized = questions.map((q) => ({
        qid: q.question?.id, // pode estar no corpo gerado
        position: q.position,
        marked: answers[q.position] || null,
        correct: q.question?.correta ? (q.question.correta.toString().toUpperCase() === (answers[q.position] || '').toString().toUpperCase()) : null
      }));
      const { error } = await supabase.from('quiz_attempts').insert({
        quiz_id: quizId,
        user_id: user.id,
        answers: normalized,
        score: computedScore,
      });
      if (error) throw error;
      navigate('/students/activities');
    } catch (e) {
      // noop
    } finally {
      setSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="text-sm text-muted-foreground">Pontuação: {computedScore}</div>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Nenhuma questão encontrada</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => {
            const body = q.question || {};
            const opts = body.alternativas || {};
            return (
              <Card key={q.position}>
                <CardHeader>
                  <CardTitle className="text-base">{q.position}. {body.enunciado || 'Pergunta'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {['A','B','C','D'].map((letter) => (
                      <button
                        key={letter}
                        onClick={() => onMark(q.position, letter)}
                        className={`text-left p-3 border rounded-lg transition-all ${answers[q.position] === letter ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <span className="font-semibold mr-2">{letter})</span>
                        <span>{opts[letter] || '—'}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <div className="flex justify-end">
            <Button onClick={submit} disabled={submitting} className="whitespace-nowrap inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg px-8 py-2">Enviar</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuizPlayPage;
