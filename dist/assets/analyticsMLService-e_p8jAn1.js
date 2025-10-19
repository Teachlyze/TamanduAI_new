import{s as p}from"./main-Bujpyeg-.js";const E=async(a,s)=>{try{const{data:n,error:t}=await p.from("submissions").select(`
        grade,
        submitted_at,
        activities!inner(class_id)
      `).eq("student_id",a).eq("activities.class_id",s).not("grade","is",null).order("submitted_at",{ascending:!0});if(t)throw t;if(!n||n.length<3)return{prediction:null,confidence:0,trend:"insufficient_data",message:"Mínimo 3 atividades necessárias"};const e=n.map(h=>parseFloat(h.grade)),r=e.length,o=e.slice(-5),m=o.reduce((h,y)=>h+y,0)/o.length,f=e.reduce((h,y)=>h+y,0)/r,c=m>f+5?"improving":m<f-5?"declining":"stable",u=[.1,.15,.2,.25,.3];let _=0;const l=e.slice(-5);for(let h=0;h<l.length;h++)_+=l[h]*(u[h]||.2);const d=e.reduce((h,y)=>h+Math.pow(y-f,2),0)/r,b=Math.sqrt(d),v=Math.max(0,Math.min(100,100-b*2));return{prediction:Math.round(_*10)/10,confidence:Math.round(v),trend:c,avgRecent:Math.round(m*10)/10,avgTotal:Math.round(f*10)/10,totalSubmissions:r,message:c==="improving"?"Aluno em evolução!":c==="declining"?"Atenção: queda de desempenho":"Desempenho estável"}}catch(n){return console.error("Erro ao prever desempenho:",n),null}},N=async a=>{try{const{data:s,error:n}=await p.from("class_members").select(`
        student_id,
        profiles!inner(name, email),
        classes!inner(id)
      `).eq("class_id",a);if(n)throw n;const t=[];for(const e of s){const{data:r}=await p.from("submissions").select("grade, submitted_at, status").eq("student_id",e.student_id).order("submitted_at",{ascending:!1}).limit(10);if(!r||r.length===0)continue;const o=r.filter(v=>v.grade!==null).map(v=>parseFloat(v.grade));if(o.length===0)continue;const m=o.reduce((v,h)=>v+h,0)/o.length,f=o.slice(0,3),c=f.reduce((v,h)=>v+h,0)/f.length,u=m<60,_=c<m-10,l=Math.max(...o)-Math.min(...o)>40;let d=0;const b=[];u&&(d+=3,b.push("Média baixa")),_&&(d+=2,b.push("Queda recente")),l&&(d+=1,b.push("Inconsistente")),d>0&&t.push({studentId:e.student_id,name:e.profiles.name,email:e.profiles.email,avgGrade:Math.round(m*10)/10,avgRecent:Math.round(c*10)/10,riskLevel:d>=4?"high":d>=2?"medium":"low",reasons:b,totalSubmissions:r.length})}return t.sort((e,r)=>{const o={high:3,medium:2,low:1};return o[r.riskLevel]-o[e.riskLevel]})}catch(s){return console.error("Erro ao identificar alunos em risco:",s),[]}},P=async a=>{try{const{data:s}=await p.from("class_members").select(`
        student_id,
        profiles!inner(name)
      `).eq("class_id",a);if(!s||s.length<3)return{clusters:[],message:"Mínimo 3 alunos necessários"};const n=[];for(const e of s){const{data:r}=await p.from("submissions").select("grade, submitted_at").eq("student_id",e.student_id).not("grade","is",null);if(!r||r.length===0)continue;const o=r.map(c=>parseFloat(c.grade)),m=o.reduce((c,u)=>c+u,0)/o.length,f=o.reduce((c,u)=>c+Math.pow(u-m,2),0)/o.length;n.push({studentId:e.student_id,name:e.profiles.name,avgGrade:m,consistency:100-Math.sqrt(f),totalSubmissions:r.length})}const t={excelente:n.filter(e=>e.avgGrade>=85),bom:n.filter(e=>e.avgGrade>=70&&e.avgGrade<85),regular:n.filter(e=>e.avgGrade>=60&&e.avgGrade<70),atencao:n.filter(e=>e.avgGrade<60)};return{clusters:[{name:"Excelente",color:"green",students:t.excelente,avgGrade:t.excelente.length>0?Math.round(t.excelente.reduce((e,r)=>e+r.avgGrade,0)/t.excelente.length*10)/10:0,count:t.excelente.length},{name:"Bom",color:"blue",students:t.bom,avgGrade:t.bom.length>0?Math.round(t.bom.reduce((e,r)=>e+r.avgGrade,0)/t.bom.length*10)/10:0,count:t.bom.length},{name:"Regular",color:"yellow",students:t.regular,avgGrade:t.regular.length>0?Math.round(t.regular.reduce((e,r)=>e+r.avgGrade,0)/t.regular.length*10)/10:0,count:t.regular.length},{name:"Atenção",color:"red",students:t.atencao,avgGrade:t.atencao.length>0?Math.round(t.atencao.reduce((e,r)=>e+r.avgGrade,0)/t.atencao.length*10)/10:0,count:t.atencao.length}],totalStudents:n.length}}catch(s){return console.error("Erro ao clusterizar alunos:",s),{clusters:[],message:"Erro ao processar"}}},x=a=>{if(!a)return{score:0,label:"neutral"};const s=a.toLowerCase(),n=["ruim","difícil","complicado","confuso","péssimo","horrível","não entendi","muito difícil","impossível","frustrado"],t=["bom","ótimo","excelente","legal","entendi","fácil","claro","adorei","perfeito","incrível"];let e=0;return n.forEach(r=>{s.includes(r)&&(e-=1)}),t.forEach(r=>{s.includes(r)&&(e+=1)}),{score:e,label:e<-1?"negative":e>1?"positive":"neutral",needsAttention:e<-1}},z=async(a,s)=>{try{const{data:n}=await p.from("submissions").select(`
        grade,
        activities!inner(
          title,
          activity_type,
          class_id
        )
      `).eq("student_id",a).eq("activities.class_id",s).not("grade","is",null);if(!n||n.length<3)return{recommendations:[],message:"Mais atividades necessárias para recomendações"};const t=n.filter(o=>parseFloat(o.grade)<70).map(o=>o.activities),e=[];return t.length>0&&e.push({type:"review",priority:"high",title:"Revisão Necessária",description:`Revisar conceitos de ${t.length} atividade(s) com baixo desempenho`,activities:t.slice(0,3)}),n.filter(o=>o.activities.activity_type==="quiz").length<3&&e.push({type:"practice",priority:"medium",title:"Prática com Quizzes",description:"Fazer mais quizzes para fixar conteúdo",suggestion:"Banco de Questões disponível"}),{recommendations:e,totalAnalyzed:n.length,weakAreas:t.length}}catch(n){return console.error("Erro ao gerar recomendações:",n),{recommendations:[],message:"Erro ao processar"}}},k=async a=>{try{const{data:s}=await p.from("class_members").select(`
        student_id,
        joined_at,
        profiles!inner(name, email)
      `).eq("class_id",a);if(!s)return[];const n=[],t=new Date;for(const e of s){const{data:r}=await p.from("submissions").select("submitted_at").eq("student_id",e.student_id).order("submitted_at",{ascending:!1}).limit(1).single();if(!r){n.push({studentId:e.student_id,name:e.profiles.name,email:e.profiles.email,riskLevel:"high",reason:"Nenhuma atividade realizada",daysSinceActivity:Math.floor((t-new Date(e.joined_at))/(1e3*60*60*24))});continue}const o=Math.floor((t-new Date(r.submitted_at))/(1e3*60*60*24));o>14&&n.push({studentId:e.student_id,name:e.profiles.name,email:e.profiles.email,riskLevel:o>30?"high":"medium",reason:`${o} dias sem atividade`,daysSinceActivity:o})}return n.sort((e,r)=>r.daysSinceActivity-e.daysSinceActivity)}catch(s){return console.error("Erro ao prever churn:",s),[]}},M=async a=>{try{const{data:s}=await p.from("submissions").select(`
        grade,
        submitted_at,
        student_id,
        activities!inner(class_id, activity_type)
      `).eq("activities.class_id",a).not("grade","is",null);if(!s||s.length===0)return null;const{data:n}=await p.from("xp_log").select("amount, source, student_id, created_at").in("student_id",[...new Set(s.map(i=>i.student_id))]),t=s.map(i=>parseFloat(i.grade)),e=t.reduce((i,g)=>i+g,0)/t.length,r=t.reduce((i,g)=>i+Math.pow(g-e,2),0)/t.length,o=Math.sqrt(r),m=n?.reduce((i,g)=>i+g.amount,0)||0,f={};n?.forEach(i=>{f[i.source]=(f[i.source]||0)+i.amount});const c=new Date,u=new Date(c.getTime()-28*24*60*60*1e3),l=s.filter(i=>new Date(i.submitted_at)>u).map(i=>parseFloat(i.grade)),d=l.length>0?l.reduce((i,g)=>i+g,0)/l.length:e,b=d>e+3?"improving":d<e-3?"declining":"stable",v=Math.min(5,m/1e3),h=e*.9+v*.1,y={"0-49":0,"50-69":0,"70-84":0,"85-100":0};t.forEach(i=>{const g=Math.round(i);g<=49?y["0-49"]++:g<=69?y["50-69"]++:g<=84?y["70-84"]++:y["85-100"]++});const S=s.slice().sort((i,g)=>new Date(i.submitted_at)-new Date(g.submitted_at));let A=0,G=0;for(let i=1;i<S.length;i++){const g=(new Date(S[i].submitted_at)-new Date(S[i-1].submitted_at))/864e5;isFinite(g)&&g>=0&&(A+=g,G++)}const D=G>0?Math.round(A/G*10)/10:null,w={};s.forEach(i=>{w[i.student_id]=(w[i.student_id]||0)+1});const q=Object.keys(w).length>0?Math.round(Object.values(w).reduce((i,g)=>i+g,0)/Object.keys(w).length*10)/10:0;return{avgGrade:Math.round(e*10)/10,adjustedAvg:Math.round(h*10)/10,stdDev:Math.round(o*10)/10,trend:b,totalSubmissions:s.length,totalStudents:new Set(s.map(i=>i.student_id)).size,totalXP:m,xpSources:f,gradeBuckets:y,avgDaysBetweenSubmissions:D,submissionsPerStudentAvg:q,consistency:o<15?"high":o<25?"medium":"low",engagement:m>5e3?"high":m>2e3?"medium":"low"}}catch(s){return console.error("Erro ao analisar turma:",s),null}},$=async a=>{try{const{data:s}=await p.from("classes").select("id, name").eq("teacher_id",a);if(!s||s.length===0)return null;const n=[];let t=0,e=0,r=0,o=0,m=0;for(const c of s){const u=await M(c.id);u&&(n.push({classId:c.id,className:c.name,...u}),t+=u.totalStudents,r+=u.totalSubmissions,o+=u.totalXP,m+=u.avgGrade);const{count:_}=await p.from("activities").select("*",{count:"exact",head:!0}).eq("class_id",c.id);e+=_||0}const f=n.length>0?m/n.length:0;return{teacherId:a,totalClasses:s.length,totalStudents:t,totalActivities:e,totalSubmissions:r,totalXP:o,avgGrade:Math.round(f*10)/10,classAnalyses:n,engagementScore:o/t||0,activityRate:e/s.length||0}}catch(s){return console.error("Erro ao analisar professor:",s),null}},O=async a=>{try{const{data:s}=await p.from("school_admins").select("teacher_id").eq("school_id",a);if(!s||s.length===0)return[];const n=s.map(e=>e.teacher_id),t=[];for(const e of n){const{data:r}=await p.from("profiles").select("name").eq("id",e).single(),o=await $(e);o&&r&&t.push({teacherId:e,name:r.name,...o})}return t.sort((e,r)=>r.avgGrade-e.avgGrade)}catch(s){return console.error("Erro ao comparar professores:",s),[]}},T=async a=>{try{const{data:s}=await p.from("classes").select(`
        id,
        name,
        teacher_id,
        profiles!classes_teacher_id_fkey(name)
      `).eq("school_id",a);if(!s||s.length===0)return[];const n=[];for(const t of s){const e=await M(t.id);e&&n.push({classId:t.id,className:t.name,teacherName:t.profiles?.name||"Professor",...e})}return n.sort((t,e)=>e.avgGrade-t.avgGrade)}catch(s){return console.error("Erro ao comparar turmas:",s),[]}},j=async(a,s="student")=>{try{const{data:{user:n}}=await p.auth.getUser();if(!n)throw new Error("Não autenticado");let t="";if(s==="student")t=`Analise este aluno e forneça insights educacionais:
      
Dados:
- Média: ${a.avgGrade}
- Tendência: ${a.trend}
- Total XP: ${a.totalXP||0}
- Submissões: ${a.totalSubmissions}
- Consistência: ${a.consistency||"N/A"}
 - Observação: XP tem peso menor (10%) em análises de desempenho.

Forneça em JSON:
{
  "strengths": ["força 1", "força 2"],
  "weaknesses": ["fraqueza 1", "fraqueza 2"],
  "recommendations": ["recomendação 1", "recomendação 2"],
  "motivationalMessage": "mensagem motivacional"
}`;else if(s==="class")t=`Analise esta turma e forneça insights educacionais:
      
Dados:
- Média: ${a.avgGrade}
- Desvio Padrão: ${a.stdDev}
- Tendência: ${a.trend}
- Total XP: ${a.totalXP}
- Alunos: ${a.totalStudents}
- Engajamento: ${a.engagement}
 - Fontes de XP (top 5): ${JSON.stringify(a.xpSources||{})}
 - Observação: XP tem peso reduzido (10%) para média ajustada.
 - Distribuição de notas: ${JSON.stringify(a.gradeBuckets||{})}
 - Dias médios entre submissões: ${a.avgDaysBetweenSubmissions??"N/D"}
 - Submissões por aluno (média): ${a.submissionsPerStudentAvg??"N/D"}

Forneça em JSON:
{
  "strengths": ["força 1", "força 2"],
  "concerns": ["preocupação 1", "preocupação 2"],
  "recommendations": ["recomendação 1", "recomendação 2"],
  "teachingTips": ["dica 1", "dica 2"]
}`;else if(s==="teacher"){const m=a.totalClasses??(a.classAnalyses?.length||0),f=(a.classAnalyses||[]).reduce((l,d)=>(l[d.trend||"stable"]=(l[d.trend||"stable"]||0)+1,l),{}),c=(a.classAnalyses||[]).slice().sort((l,d)=>(d.avgGrade||0)-(l.avgGrade||0))[0]||null,u=(a.classAnalyses||[]).slice().sort((l,d)=>(l.avgGrade||0)-(d.avgGrade||0))[0]||null,_=(a.classAnalyses||[]).reduce((l,d)=>{const b=d.xpSources||{};return Object.keys(b).forEach(v=>{l[v]=(l[v]||0)+b[v]}),l},{});t=`Analise este professor e forneça insights:
      
Dados:
- Turmas: ${a.totalClasses}
- Alunos: ${a.totalStudents}
- Média Geral: ${a.avgGrade}
- Total XP gerado: ${a.totalXP}
- Taxa de atividades: ${a.activityRate}
 - Tendências por turma: ${JSON.stringify(f)}
 - Turma com melhor desempenho: ${c?`${c.className} (média ${c.avgGrade}, engajamento ${c.engagement})`:"N/D"}
 - Turma com pior desempenho: ${u?`${u.className} (média ${u.avgGrade}, engajamento ${u.engagement})`:"N/D"}
 - Fontes de XP agregadas (top 5): ${JSON.stringify(Object.fromEntries(Object.entries(_).sort((l,d)=>d[1]-l[1]).slice(0,5)))}
 - Observação: XP influencia apenas 10% da média ajustada.

Forneça em JSON:
{
  "strengths": ["força 1", "força 2"],
  "improvements": ["melhoria 1", "melhoria 2"],
  "recommendations": ["recomendação 1", "recomendação 2"],
  "recognition": "mensagem de reconhecimento"
}`}const{data:e,error:r}=await p.functions.invoke("openai-chat",{body:{messages:[{role:"system",content:"Você é um especialista em análise educacional. Responda APENAS em JSON válido."},{role:"user",content:t}],temperature:.7}});if(r)throw r;const o=e.choices?.[0]?.message?.content||"{}";return JSON.parse(o)}catch(n){return console.error("Erro ao gerar insights AI:",n),null}},X={predictPerformance:E,identifyAtRiskStudents:N,clusterStudents:P,analyzeSentiment:x,generateRecommendations:z,predictChurn:k,analyzeClassPerformance:M,analyzeTeacherPerformance:$,compareTeachers:O,compareClasses:T,generateAIInsights:j,getStudentGradeBuckets};export{X as a};
