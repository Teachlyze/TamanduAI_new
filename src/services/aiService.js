// Simple AI service placeholder. Replace with real Edge Function or external API as needed.
import { supabase } from '@/lib/supabaseClient';

/**
 * Ask the class-contextual AI assistant a question.
 * If an Edge Function named 'class-ai' exists, this will invoke it; otherwise returns a mock.
 */
export async function askClassAI({ classId, question }) {
  try {
    // Try Edge Function if present
    const { data, error } = await supabase.functions.invoke('class-ai', {
      body: { classId, question },
    });
    if (!error && data) return data;
  } catch (e) {
    // ignore; fallback below
  }
  // Fallback mock to avoid breaking UI
  return { answer: 'Assistente IA (demo): esta é uma resposta simulada baseada no contexto da turma.' };
}
