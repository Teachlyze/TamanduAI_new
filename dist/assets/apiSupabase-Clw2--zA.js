import{s as i}from"./main-Cv3DLBs1.js";const h=async(t,e,s,r="read")=>{try{const{data:{session:a}}=await i.auth.getSession();if(!a?.user)throw new Error("Usuário não autenticado");switch(t){case"class":{const{data:o,error:n}=await i.from("classes").select("created_by, id").eq("id",e).single();if(n)throw n;if(r==="write"){if(o.created_by!==s)throw new Error("Apenas o professor pode modificar esta turma")}else{if(o.created_by===s)return!0;const{data:c}=await i.from("class_members").select("id").eq("class_id",e).eq("user_id",s).eq("role","student").single();if(!c)throw new Error("Você não tem acesso a esta turma")}break}case"activity":{const{data:o,error:n}=await i.from("activities").select(`
            id,
            created_by
          `).eq("id",e).single();if(n)throw n;if(o.created_by===s)return!0;const{data:c}=await i.from("activity_class_assignments").select("class_id").eq("activity_id",e);if(c&&c.length>0){const w=c.map(m=>m.class_id),{data:u}=await i.from("classes").select("id").in("id",w).eq("created_by",s);if(u&&u.length>0)return!0;const{data:l}=await i.from("class_members").select("id").in("class_id",w).eq("user_id",s).eq("role","student");if(l&&l.length>0)return!0}throw new Error("Você não tem acesso a esta atividade")}case"submission":{const{data:o,error:n}=await i.from("submissions").select("student_id").eq("id",e).single();if(n)throw n;if(o.student_id!==s)throw new Error("Você só pode acessar suas próprias submissões");break}default:throw new Error(`Tipo de recurso não suportado: ${t}`)}return!0}catch(a){throw console.error("Erro na validação de acesso:",a),a}},_=async(t,e,s="read")=>h("class",t,e,s),g=async(t,e,s="read")=>h("activity",t,e,s),y=3,b=1e3,p=5*60*1e3,f=new Map,v=t=>new Promise(e=>setTimeout(e,t)),E=async(t,e=y)=>{for(let s=0;s<e;s++)try{return await t()}catch(r){if(s===e-1||!(r.message?.includes("network")||r.message?.includes("timeout")||r.message?.includes("temporarily")))throw r;await v(b*(s+1))}},q=t=>{const e=f.get(t);return e&&Date.now()-e.timestamp<p?e.data:(f.delete(t),null)},A=(t,e)=>{f.set(t,{data:e,timestamp:Date.now()})},d=async()=>{try{const{data:{user:t},error:e}=await i.auth.getUser();if(e)return console.warn("Error getting current user:",e.message),null;if(!t){const{data:{session:s},error:r}=await i.auth.getSession();return r?(console.warn("Error getting session:",r.message),null):s?.user||null}return t}catch(t){return console.error("Unexpected error in getCurrentUser:",t),null}},U=async t=>{if(!t)throw new Error("Class ID is required");const e=await d();if(!e)throw new Error("Usuário não autenticado");await _(t,e.id,"read");const s=`class_export_${t}_${e.id}`,r=q(s);if(r)return r;try{return await E(async()=>{const{data:a,error:o}=await i.from("classes").select("id, name, subject, created_by, created_at").eq("id",t).single();if(o)throw o;if(!a)throw new Error("Turma não encontrada");const{data:n,error:c}=await i.from("class_members").select(`
          student:profiles (
            id,
            full_name,
            avatar_url,
            created_at
          )
        `).eq("class_id",t).eq("role","student");if(c)throw c;const{data:w,error:u}=await i.from("activities").select(`
            id,
            title,
            activity_type,
            created_at,
            due_date,
            status,
            created_by
          `).in("id",activityIds).order("created_at",{ascending:!1});if(u)throw u;const l={class:{id:a.id,name:a.name,subject:a.subject,created_at:a.created_at},students:n?.map(m=>m.student).filter(Boolean)||[],activities:w||[],exported_at:new Date().toISOString(),exported_by:e.id};return A(s,l),l})}catch(a){throw console.error("Error exporting class data:",a),new Error("Falha ao exportar dados da turma: "+a.message)}},x=async t=>{const e=await d();if(!e)throw new Error("Usuário não autenticado");if(!t)throw new Error("Class ID é obrigatório");await _(t,e.id,"read");const{data:s,error:r}=await i.from("classes").select("id, name, subject, created_by, created_at, is_active, color").eq("id",t).single();if(r)throw r;const[{data:a},{data:o}]=await Promise.all([i.from("class_members").select("id").eq("class_id",t).eq("role","student"),i.from("activity_class_assignments").select("activity_id").eq("class_id",t)]);return{...s,students_count:a?.length||0,activities_count:o?.length||0}},R=async t=>{const e=await d();if(!e)throw new Error("Usuário não autenticado");await _(t,e.id,"read");const{data:s,error:r}=await i.from("class_members").select(`
      user:profiles(
        id,
        full_name,
        avatar_url,
        created_at
      )
    `).eq("class_id",t).eq("role","student");if(r)throw r;return(s||[]).map(a=>a.user).filter(Boolean)},S=async t=>{const e=await d();if(!e)throw new Error("Usuário não autenticado");if(t&&await _(t,e.id,"read"),!t){const{data:a,error:o}=await i.from("activities").select("id, title, description, instructions, due_date, status, created_at, updated_at").eq("created_by",e.id).order("created_at",{ascending:!1});if(o)throw o;return a||[]}const{data:s,error:r}=await i.from("activity_class_assignments").select(`
      id,
      activity_id,
      class_id,
      assigned_at,
      activities!inner(
        id,
        title,
        description,
        instructions,
        due_date,
        total_points,
        status,
        published_at,
        created_at
      )
    `).eq("class_id",t).eq("activities.status","published").order("assigned_at",{ascending:!1});if(r)throw r;return s||[]},C=async t=>{const e=await d();if(!e)throw new Error("Usuário não autenticado");const{data:s,error:r}=await i.from("activities").select("id, title, description, instructions, schema, status, created_by, created_at, updated_at, due_date, total_points").eq("id",t).or(`created_by.eq.${e.id},status.eq.published`).single();if(r)throw r;return s},T=async({activity_id:t,answers:e,hcaptchaToken:s})=>{const r=await d();if(!r)throw new Error("Usuário não autenticado");await g(t,r.id,"read");try{const{data:a,error:o}=await i.from("submissions").insert({student_id:r.id,activity_id:t,data:e??null,submitted_at:new Date().toISOString()}).select("id, student_id, activity_id, submitted_at, status").single();if(o)throw console.error("Error submitting activity:",o.message),o;return a}catch(a){throw console.error("Error in submitActivity:",a),a}},j=C;export{x as a,R as b,d as c,j as d,U as e,S as g,T as s};
