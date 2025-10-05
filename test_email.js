import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' // Do supabase status

const supabase = createClient(supabaseUrl, supabaseKey)

async function testEmail() {
  console.log('🚀 Testando envio via Resend...')
  
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to: 'pedrovictor94442500@gmail.com', // Seu email
      subject: 'Hello World - Teste Supabase + Resend',
      html: '<p>Congrats on sending your <strong>first email</strong> via Supabase Edge Function!</p>',
      text: 'Congrats on sending your first email via Supabase Edge Function!',
      from: 'onboarding@resend.dev' // Opcional
    }
  })
  
  if (error) {
    console.error('❌ Erro:', error)
  } else {
    console.log('✅ Sucesso!', data)
    console.log('📧 Verifique seu email:', 'pedrovictor94442500@gmail.com')
  }
}

testEmail()