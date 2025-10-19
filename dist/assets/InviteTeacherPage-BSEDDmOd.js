import{u as C,r as n,j as e,a2 as b,ay as E,c as P,e as j,W as S,m as A,ac as i,s as d}from"./main-Bujpyeg-.js";import{P as c}from"./PremiumCard-BaDWg06v.js";import{P as z}from"./PremiumButton-skKgx_xy.js";import{M as N}from"./mail-Cln78fkU.js";import{U as $}from"./user-plus-B5t61OuG.js";import{S as I}from"./send-D6bioMOQ.js";const B=()=>{const{user:m}=C(),[T,D]=n.useState(!1),[x,p]=n.useState(!1),[l,y]=n.useState([]),[a,r]=n.useState({email:"",teacherName:"",message:""}),w=async s=>{if(s.preventDefault(),!a.email||!a.teacherName){i({title:"Erro",description:"Preencha todos os campos obrigatórios.",variant:"destructive"});return}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)){i({title:"Erro",description:"Email inválido.",variant:"destructive"});return}p(!0);try{const{data:t,error:g}=await d.from("schools").select("name, owner_id").eq("owner_id",m.id).single();if(g)throw g;const u=`${Date.now()}-${Math.random().toString(36).substring(7)}`,o=`${window.location.origin}/register/teacher?invite=${u}&school=${t.name}`,{error:f}=await d.from("teacher_invites").insert({school_id:m.id,email:a.email,teacher_name:a.teacherName,invite_token:u,status:"pending",expires_at:new Date(Date.now()+7*24*60*60*1e3).toISOString()});if(f)throw f;const{data:R,error:v}=await d.functions.invoke("send-email-v2",{body:{to:a.email,subject:`Convite para ser Professor na ${t.name} - TamanduAI`,html:`
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Convite para Professor</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎓 TamanduAI</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Plataforma de Educação Inteligente</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Olá, ${a.teacherName}! 👋</h2>
                  
                  <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                    Você foi convidado(a) para fazer parte do corpo docente da <strong style="color: #667eea;">${t.name}</strong> na plataforma TamanduAI!
                  </p>
                  
                  ${a.message?`
                  <div style="background: #f3f4f6; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px;">
                    <p style="color: #374151; margin: 0; font-style: italic; line-height: 1.6;">
                      "${a.message}"
                    </p>
                  </div>
                  `:""}
                  
                  <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 12px; padding: 25px; margin: 30px 0;">
                    <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">O que você pode fazer na TamanduAI:</h3>
                    <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Criar e gerenciar turmas</li>
                      <li>Publicar atividades e quizzes interativos</li>
                      <li>Acompanhar o desempenho dos alunos com analytics avançado</li>
                      <li>Sistema de gamificação e missões</li>
                      <li>Chatbot IA para suporte aos alunos</li>
                      <li>E muito mais!</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="${o}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                      Aceitar Convite
                    </a>
                  </div>
                  
                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 30px;">
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                      <strong>⏰ Importante:</strong> Este convite expira em 7 dias.
                    </p>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                    Se você não reconhece este convite ou não deseja aceitar, pode ignorar este email.
                  </p>
                </div>
                
                <!-- Footer -->
                <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                    © 2025 TamanduAI - Plataforma de Educação Inteligente
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                    Link do convite: <span style="color: #667eea;">${o}</span>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `}});v?(console.error("Erro ao enviar email:",v),i({title:"Convite Criado",description:`Convite salvo! Link: ${o} (copie e envie manualmente)`,variant:"default"})):(i({title:"✅ Email Enviado!",description:`Convite enviado para ${a.email}`,variant:"success"}),y(k=>[...k,{email:a.email,name:a.teacherName,sentAt:new Date,link:o}])),r({email:"",teacherName:"",message:""})}catch(t){console.error("Erro ao enviar convite:",t),i({title:"Erro",description:"Não foi possível enviar o convite. Tente novamente.",variant:"destructive"})}finally{p(!1)}};return e.jsxs("div",{className:"p-6 space-y-6",children:[e.jsx("div",{className:"bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-2xl text-white",children:e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur",children:e.jsx(N,{className:"w-8 h-8"})}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold",children:"Convidar Professores"}),e.jsx("p",{className:"text-white/90 mt-1",children:"Envie convites por email para novos professores"})]})]})}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e.jsx(c,{variant:"elevated",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-6",children:[e.jsx("div",{className:"w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center",children:e.jsx($,{className:"w-6 h-6 text-white"})}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-xl font-bold",children:"Novo Convite"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Preencha os dados do professor"})]})]}),e.jsxs("form",{onSubmit:w,className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium mb-2",children:"Email do Professor *"}),e.jsx(b,{type:"email",value:a.email,onChange:s=>r({...a,email:s.target.value}),placeholder:"professor@exemplo.com",required:!0})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium mb-2",children:"Nome do Professor *"}),e.jsx(b,{value:a.teacherName,onChange:s=>r({...a,teacherName:s.target.value}),placeholder:"João Silva",required:!0})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium mb-2",children:"Mensagem Personalizada (opcional)"}),e.jsx(E,{value:a.message,onChange:s=>r({...a,message:s.target.value}),placeholder:"Adicione uma mensagem de boas-vindas...",className:"min-h-[100px]"})]}),e.jsx("div",{className:"bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800",children:e.jsxs("div",{className:"flex items-start gap-2",children:[e.jsx(P,{className:"w-5 h-5 text-blue-600 mt-0.5"}),e.jsxs("div",{className:"text-sm text-blue-800 dark:text-blue-200",children:[e.jsx("strong",{children:"Como funciona:"})," O professor receberá um email com link de cadastro. O convite expira em 7 dias."]})]})}),e.jsxs(z,{type:"submit",className:"w-full bg-gradient-to-r from-purple-600 to-indigo-600",loading:x,children:[e.jsx(I,{className:"w-4 h-4 mr-2"}),x?"Enviando...":"Enviar Convite"]})]})]})}),e.jsx(c,{variant:"elevated",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-6",children:[e.jsx("div",{className:"w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center",children:e.jsx(j,{className:"w-6 h-6 text-white"})}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-xl font-bold",children:"Convites Enviados"}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:[l.length," nesta sessão"]})]})]}),l.length===0?e.jsxs("div",{className:"text-center py-12",children:[e.jsx(N,{className:"w-16 h-16 mx-auto text-muted-foreground/30 mb-4"}),e.jsx("p",{className:"text-muted-foreground",children:"Nenhum convite enviado ainda"})]}):e.jsx("div",{className:"space-y-3",children:e.jsx(S,{children:l.map((s,h)=>e.jsxs(A.div,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},className:"p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800",children:[e.jsx("div",{className:"flex items-start justify-between",children:e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[e.jsx(j,{className:"w-4 h-4 text-green-600"}),e.jsx("span",{className:"font-semibold",children:s.name})]}),e.jsx("p",{className:"text-sm text-muted-foreground",children:s.email}),e.jsxs("p",{className:"text-xs text-muted-foreground mt-1",children:["Enviado às ",s.sentAt.toLocaleTimeString("pt-BR")]})]})}),e.jsx("div",{className:"mt-3 p-2 bg-white dark:bg-black/20 rounded text-xs font-mono break-all",children:s.link})]},h))})})]})})]}),e.jsx(c,{variant:"elevated",children:e.jsxs("div",{className:"p-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10",children:[e.jsx("h3",{className:"text-lg font-bold mb-4",children:"📧 Como funciona o sistema de convites?"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx("div",{className:"w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold",children:"1"}),e.jsx("span",{className:"font-semibold",children:"Envie o Convite"})]}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Preencha o email e nome do professor. Uma mensagem será enviada automaticamente via Resend."})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx("div",{className:"w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold",children:"2"}),e.jsx("span",{className:"font-semibold",children:"Professor Recebe"})]}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"O professor recebe um email com link exclusivo para se cadastrar na plataforma vinculado à sua escola."})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx("div",{className:"w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold",children:"3"}),e.jsx("span",{className:"font-semibold",children:"Cadastro Completo"})]}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Após o cadastro, o professor já pode criar turmas e começar a usar a plataforma!"})]})]})]})})]})};export{B as default};
