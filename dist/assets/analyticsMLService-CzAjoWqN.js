import{s as h}from"./main-Cv3DLBs1.js";const E=async(r,s)=>{try{const{data:a,error:t}=await h.from("submissions").select(`
        grade,
        submitted_at,
        activities!inner(class_id)
      `).eq("student_id",r).eq("activities.class_id",s).not("grade","is",null).order("submitted_at",{ascending:!0});if(t)throw t;if(!a||a.length<3)return{prediction:null,confidence:0,trend:"insufficient_data",message:"Mínimo 3 atividades necessárias"};const e=a.map(v=>parseFloat(v.grade)),n=e.length,o=e.slice(-5),c=o.reduce((v,_)=>v+_,0)/o.length,d=e.reduce((v,_)=>v+_,0)/n,l=c>d+5?"improving":c<d-5?"declining":"stable",g=[.1,.15,.2,.25,.3];let y=0;const u=e.slice(-5);for(let v=0;v<u.length;v++)y+=u[v]*(g[v]||.2);const m=e.reduce((v,_)=>v+Math.pow(_-d,2),0)/n,b=Math.sqrt(m),p=Math.max(0,Math.min(100,100-b*2));return{prediction:Math.round(y*10)/10,confidence:Math.round(p),trend:l,avgRecent:Math.round(c*10)/10,avgTotal:Math.round(d*10)/10,totalSubmissions:n,message:l==="improving"?"Aluno em evolução!":l==="declining"?"Atenção: queda de desempenho":"Desempenho estável"}}catch(a){return console.error("Erro ao prever desempenho:",a),null}},N=async r=>{try{const{data:s,error:a}=await h.from("class_members").select(`
        user_id,
        role,
        profiles:user_id(full_name, email)
      `).eq("class_id",r).eq("role","student");if(a)throw a;const t=[];for(const e of s){const{data:n}=await h.from("submissions").select("grade, submitted_at, status").eq("student_id",e.user_id).order("submitted_at",{ascending:!1}).limit(10);if(!n||n.length===0)continue;const o=n.filter(p=>p.grade!==null).map(p=>parseFloat(p.grade));if(o.length===0)continue;const c=o.reduce((p,v)=>p+v,0)/o.length,d=o.slice(0,3),l=d.reduce((p,v)=>p+v,0)/d.length,g=c<60,y=l<c-10,u=Math.max(...o)-Math.min(...o)>40;let m=0;const b=[];g&&(m+=3,b.push("Média baixa")),y&&(m+=2,b.push("Queda recente")),u&&(m+=1,b.push("Inconsistente")),m>0&&t.push({studentId:e.user_id,name:e.profiles?.full_name,email:e.profiles?.email,avgGrade:Math.round(c*10)/10,avgRecent:Math.round(l*10)/10,riskLevel:m>=4?"high":m>=2?"medium":"low",reasons:b,totalSubmissions:n.length})}return t.sort((e,n)=>{const o={high:3,medium:2,low:1};return o[n.riskLevel]-o[e.riskLevel]})}catch(s){return console.error("Erro ao identificar alunos em risco:",s),[]}},P=async r=>{try{const{data:s}=await h.from("class_members").select(`
        student_id,
        profiles!inner(full_name)
      `).eq("class_id",r);if(!s||s.length<3)return{clusters:[],message:"Mínimo 3 alunos necessários"};const a=[];for(const e of s){const{data:n}=await h.from("submissions").select("grade, submitted_at").eq("student_id",e.student_id).not("grade","is",null);if(!n||n.length===0)continue;const o=n.map(l=>parseFloat(l.grade)),c=o.reduce((l,g)=>l+g,0)/o.length,d=o.reduce((l,g)=>l+Math.pow(g-c,2),0)/o.length;a.push({studentId:e.student_id,name:e.profiles.full_name,avgGrade:c,consistency:100-Math.sqrt(d),totalSubmissions:n.length})}const t={excelente:a.filter(e=>e.avgGrade>=85),bom:a.filter(e=>e.avgGrade>=70&&e.avgGrade<85),regular:a.filter(e=>e.avgGrade>=60&&e.avgGrade<70),atencao:a.filter(e=>e.avgGrade<60)};return{clusters:[{name:"Excelente",color:"green",students:t.excelente,avgGrade:t.excelente.length>0?Math.round(t.excelente.reduce((e,n)=>e+n.avgGrade,0)/t.excelente.length*10)/10:0,count:t.excelente.length},{name:"Bom",color:"blue",students:t.bom,avgGrade:t.bom.length>0?Math.round(t.bom.reduce((e,n)=>e+n.avgGrade,0)/t.bom.length*10)/10:0,count:t.bom.length},{name:"Regular",color:"yellow",students:t.regular,avgGrade:t.regular.length>0?Math.round(t.regular.reduce((e,n)=>e+n.avgGrade,0)/t.regular.length*10)/10:0,count:t.regular.length},{name:"Atenção",color:"red",students:t.atencao,avgGrade:t.atencao.length>0?Math.round(t.atencao.reduce((e,n)=>e+n.avgGrade,0)/t.atencao.length*10)/10:0,count:t.atencao.length}],totalStudents:a.length}}catch(s){return console.error("Erro ao clusterizar alunos:",s),{clusters:[],message:"Erro ao processar"}}},x=r=>{if(!r)return{score:0,label:"neutral"};const s=r.toLowerCase(),a=["ruim","difícil","complicado","confuso","péssimo","horrível","não entendi","muito difícil","impossível","frustrado"],t=["bom","ótimo","excelente","legal","entendi","fácil","claro","adorei","perfeito","incrível"];let e=0;return a.forEach(n=>{s.includes(n)&&(e-=1)}),t.forEach(n=>{s.includes(n)&&(e+=1)}),{score:e,label:e<-1?"negative":e>1?"positive":"neutral",needsAttention:e<-1}},z=async(r,s)=>{try{const{data:a}=await h.from("submissions").select(`
        grade,
        activities!inner(
          title,
          activity_type,
          class_id
        )
      `).eq("student_id",r).eq("activities.class_id",s).not("grade","is",null);if(!a||a.length<3)return{recommendations:[],message:"Mais atividades necessárias para recomendações"};const t=a.filter(o=>parseFloat(o.grade)<70).map(o=>o.activities),e=[];return t.length>0&&e.push({type:"review",priority:"high",title:"Revisão Necessária",description:`Revisar conceitos de ${t.length} atividade(s) com baixo desempenho`,activities:t.slice(0,3)}),a.filter(o=>o.activities.activity_type==="quiz").length<3&&e.push({type:"practice",priority:"medium",title:"Prática com Quizzes",description:"Fazer mais quizzes para fixar conteúdo",suggestion:"Banco de Questões disponível"}),{recommendations:e,totalAnalyzed:a.length,weakAreas:t.length}}catch(a){return console.error("Erro ao gerar recomendações:",a),{recommendations:[],message:"Erro ao processar"}}},k=async r=>{try{const{data:s}=await h.from("class_members").select(`
        student_id,
        joined_at,
        profiles!inner(full_name, email)
      `).eq("class_id",r);if(!s)return[];const a=[],t=new Date;for(const e of s){const{data:n}=await h.from("submissions").select("submitted_at").eq("student_id",e.student_id).order("submitted_at",{ascending:!1}).limit(1).single();if(!n){a.push({studentId:e.student_id,name:e.profiles.full_name,email:e.profiles.email,riskLevel:"high",reason:"Nenhuma atividade realizada",daysSinceActivity:Math.floor((t-new Date(e.joined_at))/(1e3*60*60*24))});continue}const o=Math.floor((t-new Date(n.submitted_at))/(1e3*60*60*24));o>14&&a.push({studentId:e.student_id,name:e.profiles.full_name,email:e.profiles.email,riskLevel:o>30?"high":"medium",reason:`${o} dias sem atividade`,daysSinceActivity:o})}return a.sort((e,n)=>n.daysSinceActivity-e.daysSinceActivity)}catch(s){return console.error("Erro ao prever churn:",s),[]}},M=async r=>{try{const{data:s}=await h.from("submissions").select(`
        grade,
        submitted_at,
        student_id,
        activities!inner(class_id, activity_type)
      `).eq("activities.class_id",r).not("grade","is",null);if(!s||s.length===0)return null;const{data:a}=await h.from("xp_log").select("amount, source, student_id, created_at").in("student_id",[...new Set(s.map(i=>i.student_id))]),t=s.map(i=>parseFloat(i.grade)),e=t.reduce((i,f)=>i+f,0)/t.length,n=t.reduce((i,f)=>i+Math.pow(f-e,2),0)/t.length,o=Math.sqrt(n),c=a?.reduce((i,f)=>i+f.amount,0)||0,d={};a?.forEach(i=>{d[i.source]=(d[i.source]||0)+i.amount});const l=new Date,g=new Date(l.getTime()-28*24*60*60*1e3),u=s.filter(i=>new Date(i.submitted_at)>g).map(i=>parseFloat(i.grade)),m=u.length>0?u.reduce((i,f)=>i+f,0)/u.length:e,b=m>e+3?"improving":m<e-3?"declining":"stable",p=Math.min(5,c/1e3),v=e*.9+p*.1,_={"0-49":0,"50-69":0,"70-84":0,"85-100":0};t.forEach(i=>{const f=Math.round(i);f<=49?_["0-49"]++:f<=69?_["50-69"]++:f<=84?_["70-84"]++:_["85-100"]++});const S=s.slice().sort((i,f)=>new Date(i.submitted_at)-new Date(f.submitted_at));let A=0,G=0;for(let i=1;i<S.length;i++){const f=(new Date(S[i].submitted_at)-new Date(S[i-1].submitted_at))/864e5;isFinite(f)&&f>=0&&(A+=f,G++)}const q=G>0?Math.round(A/G*10)/10:null,w={};s.forEach(i=>{w[i.student_id]=(w[i.student_id]||0)+1});const D=Object.keys(w).length>0?Math.round(Object.values(w).reduce((i,f)=>i+f,0)/Object.keys(w).length*10)/10:0;return{avgGrade:Math.round(e*10)/10,adjustedAvg:Math.round(v*10)/10,stdDev:Math.round(o*10)/10,trend:b,totalSubmissions:s.length,totalStudents:new Set(s.map(i=>i.student_id)).size,totalXP:c,xpSources:d,gradeBuckets:_,avgDaysBetweenSubmissions:q,submissionsPerStudentAvg:D,consistency:o<15?"high":o<25?"medium":"low",engagement:c>5e3?"high":c>2e3?"medium":"low"}}catch(s){return console.error("Erro ao analisar turma:",s),null}},$=async r=>{try{const{data:s}=await h.from("classes").select("id, name").eq("created_by",r);if(!s||s.length===0)return null;const a=[];let t=0,e=0,n=0,o=0,c=0;for(const l of s){const g=await M(l.id);g&&(a.push({classId:l.id,className:l.name,...g}),t+=g.totalStudents,n+=g.totalSubmissions,o+=g.totalXP,c+=g.avgGrade);const{count:y}=await h.from("activities").select("*",{count:"exact",head:!0}).eq("class_id",l.id);e+=y||0}const d=a.length>0?c/a.length:0;return{teacherId:r,totalClasses:s.length,totalStudents:t,totalActivities:e,totalSubmissions:n,totalXP:o,avgGrade:Math.round(d*10)/10,classAnalyses:a,engagementScore:o/t||0,activityRate:e/s.length||0}}catch(s){return console.error("Erro ao analisar professor:",s),null}},O=async r=>{try{const{data:s}=await h.from("school_teachers").select("user_id, status").eq("school_id",r).eq("status","active");if(!s||s.length===0)return[];const a=s.map(e=>e.user_id),t=[];for(const e of a){const{data:n}=await h.from("profiles").select("name").eq("id",e).single(),o=await $(e);o&&n&&t.push({teacherId:e,name:n.name,...o})}return t.sort((e,n)=>n.avgGrade-e.avgGrade)}catch(s){return console.error("Erro ao comparar professores:",s),[]}},T=async r=>{try{const{data:s}=await h.from("school_classes").select("class_id").eq("school_id",r),a=(s||[]).map(c=>c.class_id);if(!a||a.length===0)return[];const{data:t}=await h.from("classes").select("id, name, created_by").in("id",a),e=[...new Set((t||[]).map(c=>c.created_by).filter(Boolean))];let n={};if(e.length>0){const{data:c}=await h.from("profiles").select("id, name").in("id",e);n=(c||[]).reduce((d,l)=>(d[l.id]=l.name,d),{})}const o=[];for(const c of t||[]){const d=await M(c.id);d&&o.push({classId:c.id,className:c.name,teacherName:n[c.created_by]||"Professor",...d})}return o.sort((c,d)=>d.avgGrade-c.avgGrade)}catch(s){return console.error("Erro ao comparar turmas:",s),[]}},j=async(r,s="student")=>{try{const{data:{user:a}}=await h.auth.getUser();if(!a)throw new Error("Não autenticado");let t="";if(s==="student")t=`Analise este aluno e forneça insights educacionais:
      
Dados:
- Média: ${r.avgGrade}
- Tendência: ${r.trend}
- Total XP: ${r.totalXP||0}
- Submissões: ${r.totalSubmissions}
- Consistência: ${r.consistency||"N/A"}
 - Observação: XP tem peso menor (10%) em análises de desempenho.

Forneça em JSON:
{
  "strengths": ["força 1", "força 2"],
  "weaknesses": ["fraqueza 1", "fraqueza 2"],
  "recommendations": ["recomendação 1", "recomendação 2"],
  "motivationalMessage": "mensagem motivacional"
}`;else if(s==="class")t=`Analise esta turma e forneça insights educacionais:
      
Dados:
- Média: ${r.avgGrade}
- Desvio Padrão: ${r.stdDev}
- Tendência: ${r.trend}
- Total XP: ${r.totalXP}
- Alunos: ${r.totalStudents}
- Engajamento: ${r.engagement}
 - Fontes de XP (top 5): ${JSON.stringify(r.xpSources||{})}
 - Observação: XP tem peso reduzido (10%) para média ajustada.
 - Distribuição de notas: ${JSON.stringify(r.gradeBuckets||{})}
 - Dias médios entre submissões: ${r.avgDaysBetweenSubmissions??"N/D"}
 - Submissões por aluno (média): ${r.submissionsPerStudentAvg??"N/D"}

Forneça em JSON:
{
  "strengths": ["força 1", "força 2"],
  "concerns": ["preocupação 1", "preocupação 2"],
  "recommendations": ["recomendação 1", "recomendação 2"],
  "teachingTips": ["dica 1", "dica 2"]
}`;else if(s==="teacher"){const c=r.totalClasses??(r.classAnalyses?.length||0),d=(r.classAnalyses||[]).reduce((u,m)=>(u[m.trend||"stable"]=(u[m.trend||"stable"]||0)+1,u),{}),l=(r.classAnalyses||[]).slice().sort((u,m)=>(m.avgGrade||0)-(u.avgGrade||0))[0]||null,g=(r.classAnalyses||[]).slice().sort((u,m)=>(u.avgGrade||0)-(m.avgGrade||0))[0]||null,y=(r.classAnalyses||[]).reduce((u,m)=>{const b=m.xpSources||{};return Object.keys(b).forEach(p=>{u[p]=(u[p]||0)+b[p]}),u},{});t=`Analise este professor e forneça insights:
      
Dados:
- Turmas: ${r.totalClasses}
- Alunos: ${r.totalStudents}
- Média Geral: ${r.avgGrade}
- Total XP gerado: ${r.totalXP}
- Taxa de atividades: ${r.activityRate}
 - Tendências por turma: ${JSON.stringify(d)}
 - Turma com melhor desempenho: ${l?`${l.className} (média ${l.avgGrade}, engajamento ${l.engagement})`:"N/D"}
 - Turma com pior desempenho: ${g?`${g.className} (média ${g.avgGrade}, engajamento ${g.engagement})`:"N/D"}
 - Fontes de XP agregadas (top 5): ${JSON.stringify(Object.fromEntries(Object.entries(y).sort((u,m)=>m[1]-u[1]).slice(0,5)))}
 - Observação: XP influencia apenas 10% da média ajustada.

Forneça em JSON:
{
  "strengths": ["força 1", "força 2"],
  "improvements": ["melhoria 1", "melhoria 2"],
  "recommendations": ["recomendação 1", "recomendação 2"],
  "recognition": "mensagem de reconhecimento"
}`}const{data:e,error:n}=await h.functions.invoke("openai-chat",{body:{messages:[{role:"system",content:"Você é um especialista em análise educacional. Responda APENAS em JSON válido."},{role:"user",content:t}],temperature:.7}});if(n)throw n;const o=e.choices?.[0]?.message?.content||"{}";return JSON.parse(o)}catch(a){return console.error("Erro ao gerar insights AI:",a),null}},X={predictPerformance:E,identifyAtRiskStudents:N,clusterStudents:P,analyzeSentiment:x,generateRecommendations:z,predictChurn:k,analyzeClassPerformance:M,analyzeTeacherPerformance:$,compareTeachers:O,compareClasses:T,generateAIInsights:j,getStudentGradeBuckets:I};async function I(r,s){try{const{data:a,error:t}=await h.from("submissions").select("grade, activities!inner(class_id)").eq("student_id",r).eq("activities.class_id",s).not("grade","is",null);if(t)throw t;const e={"0-49":0,"50-69":0,"70-84":0,"85-100":0};return(a||[]).forEach(n=>{const o=Math.round(parseFloat(n.grade));o<=49?e["0-49"]++:o<=69?e["50-69"]++:o<=84?e["70-84"]++:e["85-100"]++}),e}catch(a){return console.error("Erro ao calcular buckets do aluno:",a),{"0-49":0,"50-69":0,"70-84":0,"85-100":0}}}export{X as a};
