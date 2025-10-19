import{s}from"./main-Bujpyeg-.js";class b{async getDashboardStats(t){try{const{data:e,error:r}=await s.from("school_teachers").select("user_id, status").eq("school_id",t).eq("status","active");if(r)throw r;const o=e?.map(l=>l.user_id)||[],{data:a,error:n}=await s.from("school_classes").select(`
          class_id,
          classes (
            id,
            name,
            created_by,
            subject
          )
        `).eq("school_id",t);if(n)throw n;const c=a?.map(l=>l.class_id)||[];let f=0;if(c.length>0){const{count:l,error:d}=await s.from("class_members").select("user_id",{count:"exact",head:!0}).in("class_id",c).eq("role","student");if(d)throw d;f=l||0}const m=new Date;m.setDate(m.getDate()-30);let h={total:0,onTime:0,late:0};if(c.length>0){const{data:l}=await s.from("activity_class_assignments").select("activity_id, activities (id, due_date)").in("class_id",c),d=l?.map(i=>i.activity_id)||[];if(d.length>0){const{data:i}=await s.from("submissions").select("id, submitted_at, activity_id").in("activity_id",d).eq("status","submitted").gte("submitted_at",m.toISOString());h.total=i?.length||0;const w=new Map(l?.map(u=>[u.activity_id,u.activities?.due_date])||[]);i?.forEach(u=>{const _=w.get(u.activity_id);if(_){const v=new Date(u.submitted_at),S=new Date(_);v<=S?h.onTime++:h.late++}})}}const y=h.total>0?Math.round(h.onTime/h.total*100):0;let g=null;if(c.length>0){const{data:l}=await s.from("activity_class_assignments").select("activity_id").in("class_id",c),d=l?.map(i=>i.activity_id)||[];if(d.length>0){const{data:i}=await s.from("submissions").select("grade").in("activity_id",d).not("grade","is",null);i&&i.length>0&&(g=(i.reduce((u,_)=>u+(_.grade||0),0)/i.length).toFixed(1))}}return{totalTeachers:o.length,totalStudents:f,totalClasses:c.length,onTimeRate:y,averageGrade:g,submissionsLast30Days:h.total,classIds:c,teacherIds:o}}catch(e){throw console.error("[SchoolService] Error getting dashboard stats:",e),e}}async getTeachers(t){try{const{data:e,error:r}=await s.from("school_teachers").select(`
          user_id,
          status,
          created_at,
          profiles (
            id,
            full_name,
            email,
            avatar_url
          )
        `).eq("school_id",t).order("created_at",{ascending:!1});if(r)throw r;return e?.map(o=>({id:o.user_id,name:o.profiles?.full_name||"Professor",email:o.profiles?.email||"",avatar:o.profiles?.avatar_url,status:o.status,joinedAt:o.created_at}))||[]}catch(e){throw console.error("[SchoolService] Error getting teachers:",e),e}}async getClasses(t){try{const{data:e,error:r}=await s.from("school_classes").select(`
          class_id,
          created_at,
          classes (
            id,
            name,
            subject,
            color,
            created_by,
            profiles (
              full_name
            )
          )
        `).eq("school_id",t).order("created_at",{ascending:!1});if(r)throw r;return await Promise.all((e||[]).map(async a=>{const{count:n}=await s.from("class_members").select("user_id",{count:"exact",head:!0}).eq("class_id",a.class_id).eq("role","student");return{id:a.class_id,name:a.classes?.name||"Turma",subject:a.classes?.subject,color:a.classes?.color,teacherName:a.classes?.profiles?.full_name||"Professor",studentCount:n||0,linkedAt:a.created_at}}))}catch(e){throw console.error("[SchoolService] Error getting classes:",e),e}}async linkTeacher(t,e){try{const{data:r,error:o}=await s.from("profiles").select("id, user_metadata->role").eq("email",e).maybeSingle();if(o)throw o;if(!r)throw new Error("Professor não encontrado com este email");const{data:a}=await s.from("school_teachers").select("user_id").eq("school_id",t).eq("user_id",r.id).maybeSingle();if(a)throw new Error("Professor já está vinculado a esta escola");const{error:n}=await s.from("school_teachers").insert({school_id:t,user_id:r.id,status:"active"});if(n)throw n;return{success:!0,teacherId:r.id}}catch(r){throw console.error("[SchoolService] Error linking teacher:",r),r}}async unlinkTeacher(t,e){try{const{error:r}=await s.from("school_teachers").delete().eq("school_id",t).eq("user_id",e);if(r)throw r;return{success:!0}}catch(r){throw console.error("[SchoolService] Error unlinking teacher:",r),r}}async linkClass(t,e){try{const{data:r,error:o}=await s.from("classes").select("id, created_by").eq("id",e).single();if(o)throw o;if(!r)throw new Error("Turma não encontrada");const{data:a}=await s.from("school_teachers").select("user_id").eq("school_id",t).eq("user_id",r.created_by).maybeSingle();if(!a)throw new Error("O professor desta turma não está vinculado à escola");const{data:n}=await s.from("school_classes").select("class_id").eq("school_id",t).eq("class_id",e).maybeSingle();if(n)throw new Error("Turma já está vinculada a esta escola");const{error:c}=await s.from("school_classes").insert({school_id:t,class_id:e});if(c)throw c;return{success:!0}}catch(r){throw console.error("[SchoolService] Error linking class:",r),r}}async unlinkClass(t,e){try{const{error:r}=await s.from("school_classes").delete().eq("school_id",t).eq("class_id",e);if(r)throw r;return{success:!0}}catch(r){throw console.error("[SchoolService] Error unlinking class:",r),r}}async getUserSchool(t){try{console.log("[SchoolService] Getting user school for:",t);try{const{data:e,error:r}=await s.from("schools").select("id, name, logo_url, settings").or(`owner_id.eq.${t}`);if(!r&&e&&e.length>0)return console.log("[SchoolService] Found owned school:",e[0]),{id:e[0].id,name:e[0].name,logo:e[0].logo_url,settings:e[0].settings,adminRole:"owner"}}catch(e){console.warn("[SchoolService] Error querying schools directly:",e)}try{const{data:e,error:r}=await s.from("schools").select("id, name, logo_url, settings");if(!r&&e&&e.length>0)return console.log("[SchoolService] Using first available school as fallback"),{id:e[0].id,name:e[0].name,logo:e[0].logo_url,settings:e[0].settings,adminRole:"admin"}}catch(e){console.warn("[SchoolService] Fallback query failed:",e)}return console.log("[SchoolService] No school found for user"),null}catch(e){return console.error("[SchoolService] Error getting user school:",e),null}}}const p=new b;export{p as s};
