/* Funciones de Salud en Orden conectadas a Supabase. Los datos médicos no se guardan en localStorage. */
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
  let calendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let user = null, db = { profile:null, measures:[], appointments:[], medications:[], orders:[] };
  const client = () => window.saludSupabase;
  const table = { measures:'medidas_salud', appointments:'citas', medications:'medicamentos', orders:'ordenes_salud' };
  const page = () => (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  function toast(text, bad=false) { let n=$('#salud-toast'); if(!n){n=document.createElement('div');n.id='salud-toast';n.style.cssText='position:fixed;bottom:18px;right:18px;z-index:10001;padding:12px 16px;border-radius:12px;background:#0d47a1;color:white;box-shadow:0 8px 24px #0003;max-width:min(90vw,520px)';document.body.append(n);} n.style.background=bad?'#b42318':'#0d47a1';n.textContent=text;n.hidden=false;clearTimeout(window.__saludToastTimer);window.__saludToastTimer=setTimeout(()=>n.hidden=true,4500); }
  function card(title, html) { return `<section style="background:white;border:1px solid #e2e8f0;border-radius:16px;padding:18px;margin:16px 0;color:#172033"><h2 style="font-size:20px;font-weight:700;margin:0 0 12px">${esc(title)}</h2>${html}</section>`; }
  const input=(label,name,type='text',required=false,attrs='')=>`<label style="display:grid;gap:5px;font-size:14px;font-weight:600">${esc(label)}<input name="${name}" type="${type}" ${required?'required':''} ${attrs} style="padding:10px;border:1px solid #cbd5e1;border-radius:9px;width:100%;box-sizing:border-box;font-weight:400"></label>`;
  const textarea=(label,name)=>`<label style="display:grid;gap:5px;font-size:14px;font-weight:600">${esc(label)}<textarea name="${name}" rows="2" style="padding:10px;border:1px solid #cbd5e1;border-radius:9px;width:100%;box-sizing:border-box;font-weight:400"></textarea></label>`;
  function formModal(title, fields, submitLabel, onSubmit) {
    $('#salud-modal')?.remove(); const w=document.createElement('div');w.id='salud-modal';w.style.cssText='position:fixed;inset:0;background:#0f172a99;z-index:10000;display:grid;place-items:center;padding:16px';
    w.innerHTML=`<section role="dialog" aria-modal="true" style="background:white;color:#172033;width:min(560px,100%);max-height:90vh;overflow:auto;border-radius:16px;padding:22px"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><h2 style="font-size:22px;font-weight:700">${esc(title)}</h2><button type="button" data-close aria-label="Cerrar" style="font-size:26px">×</button></div><form id="salud-data-form" style="display:grid;gap:12px;margin-top:16px">${fields}<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px"><button type="button" data-close style="padding:10px 14px;border:1px solid #cbd5e1;border-radius:9px">Cancelar</button><button type="submit" style="padding:10px 14px;background:#0d47a1;color:white;border-radius:9px;font-weight:600">${esc(submitLabel)}</button></div></form></section>`;
    document.body.append(w);w.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>w.remove());w.onclick=e=>{if(e.target===w)w.remove();};w.querySelector('form').onsubmit=async e=>{e.preventDefault();const btn=e.submitter;btn.disabled=true;const data=Object.fromEntries(new FormData(e.currentTarget));try{await onSubmit(data);w.remove();await refresh();toast('Registro guardado en tu cuenta.');}catch(err){toast('No se pudo guardar: '+(err.message||'comprueba la conexión y las políticas RLS.'),true);btn.disabled=false;}};
  }
  async function insert(kind, payload) { const {error}=await client().from(table[kind]).insert(payload); if(error)throw error; }
  async function remove(kind,id) { if(!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.'))return;const {error}=await client().from(table[kind]).delete().eq('id',id).eq('usuario_id',user.id);if(error){toast('No se pudo eliminar: '+error.message,true);return;}await refresh();toast('Registro eliminado.'); }
  function button(text, fn) { const b=document.createElement('button');b.type='button';b.textContent=text;b.style.cssText='padding:10px 13px;border-radius:9px;background:#0d47a1;color:white;font-weight:600;margin:3px 5px 8px 0';b.addEventListener('click',fn);return b; }
  function recordList(rows, kind, titleFn, detailFn) {
    if(!rows.length)return '<p style="color:#64748b">Todavía no hay registros guardados.</p>';
    return `<div style="display:grid;gap:10px">${rows.map(r=>`<article style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;border:1px solid #e2e8f0;border-radius:12px;padding:12px"><div style="min-width:0"><strong>${esc(titleFn(r))}</strong><p style="font-size:14px;color:#475569;margin-top:4px;overflow-wrap:anywhere">${esc(detailFn(r))}</p></div><button type="button" data-delete-kind="${kind}" data-delete-id="${r.id}" style="color:#b91c1c;border:1px solid #fecaca;border-radius:8px;padding:6px 9px;flex-shrink:0">Eliminar</button></article>`).join('')}</div>`;
  }
  function bindDeletes(root) { root.querySelectorAll('[data-delete-kind]').forEach(b=>b.addEventListener('click',()=>remove(b.dataset.deleteKind, b.dataset.deleteId))); }
  function addMeasure() { formModal('Registrar medida de salud',input('Fecha','fecha','date',true,`value="${today()}"`)+input('Peso (kg)','peso','number',false,'step="0.1" min="0"')+input('Presión sistólica (mmHg)','presion_sistolica','number',false,'min="0"')+input('Presión diastólica (mmHg)','presion_diastolica','number',false,'min="0"')+input('Pulso (latidos/min)','pulso','number',false,'min="0"')+input('Temperatura (°C)','temperatura','number',false,'step="0.1"')+textarea('Notas','notas'),'Guardar medida',d=>insert('measures',clean(d,['peso','presion_sistolica','presion_diastolica','pulso','temperatura']))); }
  function addAppointment(prefillDate=today()) { formModal('Nueva cita médica',input('Fecha','fecha','date',true,`value="${prefillDate}"`)+input('Hora','hora','time',true)+input('Profesional o centro médico','profesional','text',true)+input('Motivo o especialidad','motivo','text',true)+input('Lugar','lugar')+`<label style="display:grid;gap:5px;font-size:14px;font-weight:600">Estado<select name="estado" style="padding:10px;border:1px solid #cbd5e1;border-radius:9px"><option>Programada</option><option>Realizada</option><option>Cancelada</option></select></label>`+textarea('Notas','notas'),'Guardar cita',d=>insert('appointments',d)); }
  function addMedication() { formModal('Añadir medicamento',input('Nombre','nombre','text',true)+input('Dosis prescrita','dosis','text',false)+input('Frecuencia indicada','frecuencia','text',false)+input('Hora habitual','hora','time')+input('Fecha de inicio','fecha_inicio','date')+input('Fecha de fin','fecha_fin','date')+textarea('Notas','notas'),'Guardar medicamento',d=>insert('medications',d)); }
  function addOrder() { formModal('Añadir orden o documento',input('Nombre','nombre','text',true)+input('Tipo','tipo','text')+input('Fecha','fecha','date',false,`value="${today()}"`)+input('Estado','estado','text',false,'value="Pendiente"')+textarea('Notas','notas'),'Guardar orden',d=>insert('orders',d)); }
  function clean(data, numericKeys=[]) { for(const k of Object.keys(data)){if(data[k]==='')data[k]=null;else if(numericKeys.includes(k))data[k]=Number(data[k]);}return data; }
  async function loadRows(kind, orderField) { const {data,error}=await client().from(table[kind]).select('*').order(orderField,{ascending:false});if(error)throw error;return data||[]; }
  async function refresh() {
    if(!client()||!user)return;
    try {
      const [m,a,med,o,p]=await Promise.all([
        loadRows('measures','fecha'),loadRows('appointments','fecha'),loadRows('medications','creado_en'),loadRows('orders','fecha'),
        client().from('perfiles').select('*').eq('id',user.id).maybeSingle()
      ]);
      if(p.error)throw p.error;db={measures:m,appointments:a,medications:med,orders:o,profile:p.data};renderPage();
    } catch(e) { const box=$('#salud-db-status'); if(box)box.textContent='No se pudieron cargar los datos desde Supabase: '+e.message; else toast('Error consultando Supabase: '+e.message,true); }
  }
  function renderPage() {
    $('#salud-db-panel')?.remove();const path=page();const main=$('main')||document.body;const panel=document.createElement('section');panel.id='salud-db-panel';panel.style.cssText='max-width:1100px;margin:20px auto;padding:0 18px 30px;box-sizing:border-box;width:100%;color:#172033';
    let html='';
    if(path==='index.html'||path==='' ) {
      const last=db.measures[0], upcoming=db.appointments.filter(a=>a.estado!=='Cancelada'&&a.fecha>=today()).sort((x,y)=>(x.fecha+(x.hora||'')).localeCompare(y.fecha+(y.hora||'')));
      html+=card('Mis datos guardados en la nube',`<p style="color:#64748b;margin-bottom:10px">Cuenta: ${esc(user.email)}. Estos registros se sincronizan al iniciar sesión en otro dispositivo.</p><div id="salud-actions"></div>`);
      html+=card('Última medida',last?`<p><strong>Fecha:</strong> ${esc(last.fecha)} · <strong>Peso:</strong> ${esc(last.peso??'—')} kg · <strong>Presión:</strong> ${esc(last.presion_sistolica??'—')}/${esc(last.presion_diastolica??'—')} · <strong>Pulso:</strong> ${esc(last.pulso??'—')} · <strong>Temperatura:</strong> ${esc(last.temperatura??'—')} °C</p><p style="color:#64748b;margin-top:6px">${esc(last.notas||'Sin notas')}</p>`:'Aún no has guardado medidas.');
      html+=card('Próximas citas',recordList(upcoming,'appointments',r=>r.motivo, r=>`${r.fecha} ${r.hora||''} · ${r.profesional} · ${r.estado}`));
      panel.innerHTML=html;main.append(panel);$('#salud-actions',panel).append(button('＋ Registrar medida',addMeasure),button('＋ Nueva cita',addAppointment));bindDeletes(panel);return;
    }
    if(path.includes('calendario')) {
      const year=calendarCursor.getFullYear(), month=calendarCursor.getMonth();
      const monthName=new Intl.DateTimeFormat('es-CO',{month:'long',year:'numeric'}).format(calendarCursor);
      const firstDay=(new Date(year,month,1).getDay()+6)%7, daysInMonth=new Date(year,month+1,0).getDate();
      const byDate={}; db.appointments.forEach(a=>{if(a.fecha)(byDate[a.fecha] ||= []).push(a);});
      const weekdays=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
      let cells=weekdays.map(d=>`<div style="padding:8px;text-align:center;font-size:12px;font-weight:700;color:#64748b">${d}</div>`).join('');
      for(let i=0;i<firstDay;i++) cells+=`<div aria-hidden="true" style="min-height:90px;border:1px solid #eef2f7;border-radius:10px;background:#f8fafc"></div>`;
      for(let day=1;day<=daysInMonth;day++){
        const dateKey=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const events=byDate[dateKey]||[], isToday=dateKey===today();
        cells+=`<div style="min-height:90px;border:1px solid ${isToday?'#0d47a1':'#e2e8f0'};border-radius:10px;padding:6px;background:${isToday?'#eff6ff':'white'};min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:3px"><strong style="font-size:13px">${day}</strong><button type="button" data-add-date="${dateKey}" aria-label="Agendar el ${dateKey}" style="font-size:11px;color:#0d47a1;border:1px solid #bfdbfe;border-radius:6px;padding:2px 5px">+</button></div>
        ${events.map(a=>`<div title="${esc(a.profesional||'')}" style="overflow-wrap:anywhere;margin-top:5px;padding:4px;border-radius:5px;background:${a.estado==='Cancelada'?'#f1f5f9':'#dbeafe'};color:#1e3a8a;font-size:11px">${esc((a.hora?a.hora+' · ':'')+(a.motivo||'Cita médica'))}</div>`).join('')}</div>`;
      }
      const upcoming=db.appointments.filter(a=>a.estado!=='Cancelada'&&a.fecha>=today()).sort((a,b)=>(a.fecha+(a.hora||'')).localeCompare(b.fecha+(b.hora||'')));
      html=card('Calendario de citas',`<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px"><div style="display:flex;align-items:center;gap:8px"><button id="calendar-prev" type="button" aria-label="Mes anterior" style="padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px">‹</button><h3 style="font-size:20px;font-weight:700;text-transform:capitalize;margin:0">${esc(monthName)}</h3><button id="calendar-next" type="button" aria-label="Mes siguiente" style="padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px">›</button><button id="calendar-today" type="button" style="padding:8px 10px;border:1px solid #cbd5e1;border-radius:8px">Hoy</button></div><button id="calendar-add" type="button" style="padding:10px 13px;border-radius:9px;background:#0d47a1;color:white;font-weight:600">＋ Agendar cita</button></div><div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;overflow-x:auto">${cells}</div><h3 style="font-size:18px;font-weight:700;margin:24px 0 12px">Próximas citas</h3>${recordList(upcoming,'appointments',r=>r.motivo||'Cita médica',r=>`${r.fecha} ${r.hora||''} · ${r.profesional||'Profesional no indicado'} · ${r.lugar||'Lugar no indicado'} · ${r.estado||'Programada'}${r.notas?' · '+r.notas:''}`)}`);
      panel.innerHTML=html;main.append(panel);bindDeletes(panel);
      $('#calendar-prev',panel).onclick=()=>{calendarCursor=new Date(year,month-1,1);renderPage();};
      $('#calendar-next',panel).onclick=()=>{calendarCursor=new Date(year,month+1,1);renderPage();};
      $('#calendar-today',panel).onclick=()=>{calendarCursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);renderPage();};
      $('#calendar-add',panel).onclick=()=>addAppointment(today());
      panel.querySelectorAll('[data-add-date]').forEach(b=>b.onclick=()=>addAppointment(b.dataset.addDate));
      return;
    }
    if(path.includes('medicamento')) {
      html=card('Mis medicamentos guardados',`<p style="color:#64748b;margin-bottom:10px">Registra únicamente las indicaciones que te haya dado tu profesional de salud.</p><div id="salud-actions"></div>${recordList(db.medications,'medications',r=>r.nombre,r=>`${r.dosis||'Dosis no indicada'} · ${r.frecuencia||'Frecuencia no indicada'} · ${r.hora||''} · ${r.fecha_inicio||''}${r.fecha_fin?' a '+r.fecha_fin:''}${r.notas?' · '+r.notas:''}`)}`);panel.innerHTML=html;main.append(panel);$('#salud-actions',panel).append(button('＋ Añadir medicamento',addMedication));bindDeletes(panel);return;
    }
    if(path.includes('autorizaciones')) {
      html=card('Mis órdenes y documentos',`<p style="color:#64748b;margin-bottom:10px">Aquí puedes registrar datos de órdenes o autorizaciones. Esta pantalla no sube archivos adjuntos todavía.</p><div id="salud-actions"></div>${recordList(db.orders,'orders',r=>r.nombre,r=>`${r.tipo||'Sin tipo'} · ${r.fecha||''} · ${r.estado||'Pendiente'}${r.notas?' · '+r.notas:''}`)}`);panel.innerHTML=html;main.append(panel);$('#salud-actions',panel).append(button('＋ Añadir orden',addOrder));bindDeletes(panel);return;
    }
    if(path.includes('ajustes')) {
      const p=db.profile||{};
      html=card('Mi perfil personal sincronizado',`<p style="color:#64748b;margin-bottom:10px">Los datos se guardan en tu perfil privado de Supabase.</p><form id="salud-profile-form" style="display:grid;gap:12px;max-width:560px">${input('Nombre para mostrar','nombre','text',false,`value="${esc(p.nombre||'')}"`)}${input('EPS (opcional)','eps','text',false,`value="${esc(p.eps||'')}"`)}${input('Contacto de emergencia','contacto_emergencia','text',false,`value="${esc(p.contacto_emergencia||'')}"`)}${input('Teléfono de emergencia','telefono_emergencia','tel',false,`value="${esc(p.telefono_emergencia||'')}"`)}<button type="submit" style="padding:11px 16px;background:#0d47a1;color:white;border-radius:9px;font-weight:600">Guardar perfil en la nube</button></form><p id="salud-db-status" role="status" style="font-size:13px;color:#64748b;margin-top:10px"></p>`);panel.innerHTML=html;main.append(panel);
      $('#salud-profile-form',panel).addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));const payload={id:user.id,nombre:d.nombre||null,eps:d.eps||null,contacto_emergencia:d.contacto_emergencia||null,telefono_emergencia:d.telefono_emergencia||null,actualizado_en:new Date().toISOString()};const {error}=await client().from('perfiles').upsert(payload,{onConflict:'id'});if(error)toast('No se pudo guardar el perfil: '+error.message,true);else{toast('Perfil sincronizado correctamente.');await refresh();}});
      const old=$('#salud-db-status',panel);if(old)old.textContent='';return;
    }
  }
  document.addEventListener('salud:ready', async e=>{user=e.detail.user;await refresh();});
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('a[href="#"]').forEach(a=>{if(/logout|cerrar sesión/i.test(a.textContent))a.addEventListener('click',async ev=>{ev.preventDefault();const {error}=await client().auth.signOut();if(error)toast(error.message,true);else location.href='login.html';});});
    document.querySelectorAll('button').forEach(b=>{if(/emergency contact|contacto de emergencia/i.test(b.textContent))b.addEventListener('click',()=>{const phone=db.profile?.telefono_emergencia;if(phone&&confirm('¿Llamar a tu contacto de emergencia?'))location.href='tel:'+phone.replace(/[^+\d]/g,'');else if(!phone)alert('Primero registra un teléfono de emergencia en Ajustes. Si existe una emergencia inmediata en Colombia, llama al 123.');});});
  });
})();
