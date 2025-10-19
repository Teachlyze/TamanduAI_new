import{u as L,r as p,s as j,j as e,x as w,F as b,H as y,V as m,y as N,D as T,a0 as q,m as v,d as k,C as O,i as C}from"./main-7VZoQpWp.js";import{B as S}from"./badge-k0pzqXLv.js";import{E as B}from"./external-link-9OXNaoG2.js";const W=({userRole:i="student"})=>{const{user:o}=L(),[u,$]=p.useState([]),[D,f]=p.useState(!0);p.useEffect(()=>{if(o){_();const t=setInterval(_,6e4);return()=>clearInterval(t)}},[o,i]);const E=(t=new Date)=>["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][t.getDay()],_=async()=>{try{f(!0);const t=new Date,n=E(t),s=`${t.getHours().toString().padStart(2,"0")}:${t.getMinutes().toString().padStart(2,"0")}`,x=t.toISOString().split("T")[0];let l;i==="student"?l=j.from("class_members").select(`
            class_id,
            classes!inner (
              id,
              name,
              subject,
              color,
              is_online,
              meeting_link,
              meeting_days,
              meeting_start_time,
              meeting_end_time,
              vacation_start,
              vacation_end,
              cancelled_dates,
              profiles!classes_created_by_fkey (
                name
              )
            )
          `).eq("user_id",o.id).eq("classes.is_online",!0).filter("classes.meeting_days","cs",`{${n}}`):l=j.from("classes").select(`
            id,
            name,
            subject,
            color,
            is_online,
            meeting_link,
            meeting_days,
            meeting_start_time,
            meeting_end_time,
            vacation_start,
            vacation_end,
            cancelled_dates
          `).eq("created_by",o.id).eq("is_online",!0).filter("meeting_days","cs",`{${n}}`);const{data:d,error:r}=await l;if(r)throw r;let c=i==="student"?(d||[]).map(a=>a.classes):d||[];c=c.filter(a=>{if(a.vacation_start&&a.vacation_end){const g=new Date(a.vacation_start),h=new Date(a.vacation_end);if(t>=g&&t<=h)return!1}return a.cancelled_dates&&a.cancelled_dates.includes(x)?!1:a.meeting_end_time>=s}),c.sort((a,g)=>{const h=a.meeting_start_time||"00:00",I=g.meeting_start_time||"00:00";return h.localeCompare(I)}),$(c.slice(0,3))}catch(t){console.error("Error loading upcoming classes:",t)}finally{f(!1)}},U=t=>{const n=new Date,s=`${n.getHours().toString().padStart(2,"0")}:${n.getMinutes().toString().padStart(2,"0")}`;return s>=t.meeting_start_time&&s<=t.meeting_end_time},A=t=>t?t.substring(0,5):"",H=t=>{const n=new Date,[s,x]=t.split(":"),l=new Date;l.setHours(parseInt(s),parseInt(x),0);const d=l-n,r=Math.floor(d/6e4);return r<0?"Agora":r===0?"Começando":r<60?`em ${r} min`:`em ${Math.floor(r/60)}h${r%60}min`};return D?e.jsxs(w,{className:"bg-white/80 backdrop-blur-sm shadow-lg",children:[e.jsx(b,{children:e.jsxs(y,{className:"flex items-center gap-2",children:[e.jsx(m,{className:"w-5 h-5 text-blue-600"}),"Próximas Aulas Online"]})}),e.jsx(N,{className:"flex items-center justify-center p-12",children:e.jsx(T,{className:"w-6 h-6 animate-spin text-blue-600"})})]}):e.jsxs(w,{className:"bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300",children:[e.jsx(b,{children:e.jsxs(y,{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center",children:e.jsx(m,{className:"w-4 h-4 text-white"})}),e.jsx("span",{children:"Próximas Aulas Online"})]}),e.jsx(S,{variant:"secondary",className:"text-xs",children:"Hoje"})]})}),e.jsxs(N,{className:"space-y-3",children:[e.jsx(q,{mode:"popLayout",children:u.length===0?e.jsxs(v.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"text-center py-8",children:[e.jsx(k,{className:"w-12 h-12 text-muted-foreground mx-auto mb-3"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Nenhuma aula online programada para hoje"})]}):u.map((t,n)=>{const s=U(t);return e.jsxs(v.div,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},exit:{opacity:0,x:20},transition:{delay:n*.1},className:`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${s?"bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800":"bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`,children:[e.jsxs("div",{className:"flex items-center gap-3 flex-1 min-w-0",children:[e.jsx("div",{className:`w-1 h-12 rounded-full bg-${t.color}-500 flex-shrink-0`,style:{backgroundColor:`var(--${t.color}-500, #3b82f6)`}}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[e.jsx("p",{className:"font-semibold text-sm truncate",children:t.name}),s&&e.jsxs(S,{variant:"destructive",className:"animate-pulse text-xs whitespace-nowrap inline-flex items-center gap-1",children:[e.jsx(m,{className:"w-2 h-2"}),e.jsx("span",{children:"LIVE"})]})]}),e.jsxs("div",{className:"flex items-center gap-3 text-xs text-muted-foreground",children:[e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx(O,{className:"w-3 h-3"}),A(t.meeting_start_time)]}),i==="student"&&t.profiles?.name&&e.jsx("span",{className:"truncate",children:t.profiles.name}),!s&&e.jsx("span",{className:"text-blue-600 dark:text-blue-400 font-medium",children:H(t.meeting_start_time)})]})]})]}),e.jsxs(C,{size:"sm",onClick:()=>window.open(t.meeting_link,"_blank"),className:`whitespace-nowrap inline-flex items-center gap-2 flex-shrink-0 ${s?"bg-red-600 hover:bg-red-700 text-white":"bg-blue-600 hover:bg-blue-700 text-white"}`,children:[e.jsx(m,{className:"w-3 h-3"}),e.jsx("span",{className:"hidden sm:inline",children:s?"Entrar":i==="teacher"?"Iniciar":"Entrar"}),e.jsx(B,{className:"w-3 h-3"})]})]},t.id)})}),u.length>0&&e.jsxs(C,{variant:"outline",className:"w-full whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 mt-2",onClick:()=>window.location.href=i==="student"?"/students/calendar":"/dashboard/calendar",children:[e.jsx(k,{className:"w-4 h-4"}),e.jsx("span",{children:"Ver Agenda Completa"})]})]})]})};export{W as U};
