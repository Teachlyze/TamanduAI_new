import{s as o}from"./main-C_d-NeC0.js";const U={async get(t,e={}){const[r,s]=t.replace(/^\//,"").split("/"),{params:a={},select:n="*"}=e;let i=o.from(r).select(n);Object.entries(a).forEach(([c,l])=>{if(l!=null)if(c.endsWith("_eq")){const d=c.replace("_eq","");i=i.eq(d,l)}else if(c.endsWith("_neq")){const d=c.replace("_neq","");i=i.neq(d,l)}else if(c.endsWith("_gt")){const d=c.replace("_gt","");i=i.gt(d,l)}else if(c.endsWith("_gte")){const d=c.replace("_gte","");i=i.gte(d,l)}else if(c.endsWith("_lt")){const d=c.replace("_lt","");i=i.lt(d,l)}else if(c.endsWith("_lte")){const d=c.replace("_lte","");i=i.lte(d,l)}else if(c.endsWith("_like")){const d=c.replace("_like","");i=i.like(d,l)}else if(c.endsWith("_ilike")){const d=c.replace("_ilike","");i=i.ilike(d,l)}else i=i.eq(c,l)}),s&&(i=i.eq("id",s).single());const{data:u,error:w}=await i;if(w)throw w;return{data:u}},async post(t,e){const[r]=t.replace(/^\//,"").split("/"),{data:s,error:a}=await o.from(r).insert(e).select();if(a)throw a;return{data:s}},async put(t,e){const[r,s]=t.replace(/^\//,"").split("/"),{data:a,error:n}=await o.from(r).update(e).eq("id",s).select();if(n)throw n;return{data:a}},async delete(t){const[e,r]=t.replace(/^\//,"").split("/"),{error:s}=await o.from(e).delete().eq("id",r);if(s)throw s;return{data:null}}},h=async(t,e,r,s="read")=>{try{const{data:{session:a}}=await o.auth.getSession();if(!a?.user)throw new Error("Usuário não autenticado");switch(t){case"class":{const{data:n,error:i}=await o.from("classes").select("created_by, id").eq("id",e).single();if(i)throw i;if(s==="write"){if(n.created_by!==r)throw new Error("Apenas o professor pode modificar esta turma")}else{if(n.created_by===r)return!0;const{data:u}=await o.from("class_members").select("id").eq("class_id",e).eq("user_id",r).eq("role","student").single();if(!u)throw new Error("Você não tem acesso a esta turma")}break}case"activity":{const{data:n,error:i}=await o.from("activities").select(`
            id,
            created_by
          `).eq("id",e).single();if(i)throw i;if(n.created_by===r)return!0;const{data:u}=await o.from("activity_class_assignments").select("class_id").eq("activity_id",e);if(u&&u.length>0){const w=u.map(d=>d.class_id),{data:c}=await o.from("classes").select("id").in("id",w).eq("created_by",r);if(c&&c.length>0)return!0;const{data:l}=await o.from("class_members").select("id").in("class_id",w).eq("user_id",r).eq("role","student");if(l&&l.length>0)return!0}throw new Error("Você não tem acesso a esta atividade")}case"submission":{const{data:n,error:i}=await o.from("submissions").select("student_id").eq("id",e).single();if(i)throw i;if(n.student_id!==r)throw new Error("Você só pode acessar suas próprias submissões");break}default:throw new Error(`Tipo de recurso não suportado: ${t}`)}return!0}catch(a){throw console.error("Erro na validação de acesso:",a),a}},_=async(t,e,r="read")=>h("class",t,e,r),p=async(t,e,r="read")=>h("activity",t,e,r),g=3,b=1e3,y=5*60*1e3,m=new Map,q=t=>new Promise(e=>setTimeout(e,t)),E=async(t,e=g)=>{for(let r=0;r<e;r++)try{return await t()}catch(s){if(r===e-1||!(s.message?.includes("network")||s.message?.includes("timeout")||s.message?.includes("temporarily")))throw s;await q(b*(r+1))}},v=t=>{const e=m.get(t);return e&&Date.now()-e.timestamp<y?e.data:(m.delete(t),null)},A=(t,e)=>{m.set(t,{data:e,timestamp:Date.now()})},f=async()=>{try{const{data:{user:t},error:e}=await o.auth.getUser();if(e)return console.warn("Error getting current user:",e.message),null;if(!t){const{data:{session:r},error:s}=await o.auth.getSession();return s?(console.warn("Error getting session:",s.message),null):r?.user||null}return t}catch(t){return console.error("Unexpected error in getCurrentUser:",t),null}},x=async t=>{if(!t)throw new Error("Class ID is required");const e=await f();if(!e)throw new Error("Usuário não autenticado");await _(t,e.id,"read");const r=`class_export_${t}_${e.id}`,s=v(r);if(s)return s;try{return await E(async()=>{const{data:a,error:n}=await o.from("classes").select("id, name, subject, created_by, created_at").eq("id",t).single();if(n)throw n;if(!a)throw new Error("Turma não encontrada");const{data:i,error:u}=await o.from("class_members").select(`
          student:profiles (
            id,
            full_name,
            avatar_url,
            created_at
          )
        `).eq("class_id",t).eq("role","student");if(u)throw u;const{data:w,error:c}=await o.from("activities").select(`
            id,
            title,
            activity_type,
            created_at,
            due_date,
            status,
            created_by
          `).in("id",activityIds).order("created_at",{ascending:!1});if(c)throw c;const l={class:{id:a.id,name:a.name,subject:a.subject,created_at:a.created_at},students:i?.map(d=>d.student).filter(Boolean)||[],activities:w||[],exported_at:new Date().toISOString(),exported_by:e.id};return A(r,l),l})}catch(a){throw console.error("Error exporting class data:",a),new Error("Falha ao exportar dados da turma: "+a.message)}},R=async t=>{const e=await f();if(!e)throw new Error("Usuário não autenticado");if(!t)throw new Error("Class ID é obrigatório");await _(t,e.id,"read");const{data:r,error:s}=await o.from("classes").select("id, name, subject, created_by, created_at, is_active, color").eq("id",t).single();if(s)throw s;const[{data:a},{data:n}]=await Promise.all([o.from("class_members").select("id").eq("class_id",t).eq("role","student"),o.from("activity_class_assignments").select("activity_id").eq("class_id",t)]);return{...r,students_count:a?.length||0,activities_count:n?.length||0}},S=async t=>{const e=await f();if(!e)throw new Error("Usuário não autenticado");await _(t,e.id,"read");const{data:r,error:s}=await o.from("class_members").select(`
      user:profiles(
        id,
        full_name,
        avatar_url,
        created_at
      )
    `).eq("class_id",t).eq("role","student");if(s)throw s;return(r||[]).map(a=>a.user).filter(Boolean)},W=async t=>{const e=await f();if(!e)throw new Error("Usuário não autenticado");if(t&&await _(t,e.id,"read"),!t){const{data:a,error:n}=await o.from("activities").select("id, title, description, instructions, due_date, status, created_at, updated_at").eq("created_by",e.id).order("created_at",{ascending:!1});if(n)throw n;return a||[]}const{data:r,error:s}=await o.from("activity_class_assignments").select(`
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
    `).eq("class_id",t).eq("activities.status","published").order("assigned_at",{ascending:!1});if(s)throw s;return r||[]},C=async t=>{const e=await f();if(!e)throw new Error("Usuário não autenticado");const{data:r,error:s}=await o.from("activities").select("id, title, description, instructions, schema, status, created_by, created_at, updated_at, due_date, total_points").eq("id",t).or(`created_by.eq.${e.id},status.eq.published`).single();if(s)throw s;return r},T=async({activity_id:t,answers:e,hcaptchaToken:r})=>{const s=await f();if(!s)throw new Error("Usuário não autenticado");await p(t,s.id,"read");try{const{data:a,error:n}=await o.from("submissions").insert({student_id:s.id,activity_id:t,data:e??null,submitted_at:new Date().toISOString()}).select("id, student_id, activity_id, submitted_at, status").single();if(n)throw console.error("Error submitting activity:",n.message),n;return a}catch(a){throw console.error("Error in submitActivity:",a),a}},j=C;export{R as a,S as b,f as c,j as d,x as e,U as f,W as g,T as s};
