/* Funcionalidad de Ajustes de Salud en Orden.
   Preferencias visuales/notificaciones se guardan en este navegador.
   Cambio de contraseña se realiza mediante Supabase Auth. */
(() => {
  'use strict';
  const KEY = 'salud-en-orden-ajustes-v1';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const norm = s => (s || '').replace(/\s+/g,' ').trim().toLowerCase();
  const buttonByText = (text) => $$('button').find(b => norm(b.innerText).includes(norm(text)));
  const allSections = $$('main section');
  const sectionFor = (text) => allSections.find(s => norm(s.innerText).includes(norm(text)));
  const notice = (message, error=false) => {
    let n = $('#ajustes-feedback');
    if (!n) { n=document.createElement('div'); n.id='ajustes-feedback'; n.setAttribute('role','status'); n.style.cssText='position:fixed;top:16px;right:16px;z-index:99999;max-width:min(90vw,440px);padding:12px 16px;border-radius:10px;background:#0d47a1;color:white;box-shadow:0 8px 24px #0002;font:500 14px Inter,sans-serif'; document.body.append(n); }
    n.style.background = error ? '#b42318' : '#0d47a1'; n.textContent=message; n.hidden=false;
    clearTimeout(notice.timer); notice.timer=setTimeout(()=>n.hidden=true,4200);
  };
  const defaults = {theme:'claro', palette:'azul', notifications:[true,true,true,false], profile:{}, eps:'', updatedAt:null};
  let state = {...defaults};
  try { const saved=JSON.parse(localStorage.getItem(KEY)||'{}'); state={...defaults,...saved,profile:{...defaults.profile,...(saved.profile||{})}}; } catch(e) { /* usar valores iniciales */ }

  const themeCards = () => {
    const heading = $$('label').find(x=>norm(x.innerText)==='modo de interfaz');
    if (!heading) return [];
    const grid=heading.parentElement.querySelector('.grid'); return grid ? [...grid.children].slice(0,3) : [];
  };
  function applyTheme(theme) {
    state.theme=theme;
    const dark = theme==='oscuro' || (theme==='automatico' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark',dark);
    document.body.style.backgroundColor=dark?'#111827':'#f7f9fb';
    document.body.style.color=dark?'#f3f4f6':'';
    themeCards().forEach((card,i)=>{
      const selected=['claro','oscuro','automatico'][i]===theme;
      card.style.cursor='pointer'; card.setAttribute('role','button'); card.tabIndex=0; card.setAttribute('aria-pressed',String(selected));
      card.style.border=selected?'2px solid #0d47a1':'1px solid #d1d5db';
      card.style.background=selected?'rgba(13,71,161,.07)':'';
      const status=card.querySelector('span:last-child'); if(status) status.textContent=selected?'✓ Seleccionado':'Hacer clic para activar';
      card.onclick=()=>{applyTheme(['claro','oscuro','automatico'][i]);persistVisuals();markDirty();};
      card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}};
    });
  }
  function applyPalette(palette) {
    state.palette=palette;
    const colors={azul:'#0d47a1',verde:'#1b6d24',contraste:'#191c1e'};
    document.documentElement.style.setProperty('--primary',colors[palette]||colors.azul);
    const label=$$('label').find(x=>norm(x.innerText).includes('paleta de acento'));
    const cards=label?.parentElement.querySelector('.grid');
    if(cards) [...cards.children].slice(0,3).forEach((card,i)=>{
      const selected=['azul','verde','contraste'][i]===palette;
      card.style.cursor='pointer';card.setAttribute('role','button');card.tabIndex=0;card.setAttribute('aria-pressed',String(selected));
      card.style.border=selected?'2px solid var(--primary)':'1px solid #d1d5db';
      card.onclick=()=>{applyPalette(['azul','verde','contraste'][i]);persistVisuals();markDirty();};
      card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}};
    });
  }
  function getNotificationInputs(){
    const sec=sectionFor('4. Notificaciones'); return sec ? $$('input[type="checkbox"]',sec) : [];
  }
  function markDirty(){ const bar=$('#save-settings-bar'); if(bar){bar.style.opacity='1';bar.querySelector('p').textContent='Hay cambios pendientes de configuración';} }
  function persistVisuals(){
    try {
      const saved=JSON.parse(localStorage.getItem(KEY)||'{}');
      const next={...saved,...state,theme:state.theme,palette:state.palette};
      localStorage.setItem(KEY,JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('salud:theme-change',{detail:next}));
    } catch(e) {}
  }
  function gather(){
    const inputs=$$('input[type="text"],input[type="email"],input[type="tel"]');
    const profile={}; inputs.forEach((el,i)=>{if(el.value!==undefined) profile[el.getAttribute('aria-label')||el.closest('label')?.innerText?.trim()||`campo${i}`]=el.value;});
    state.profileValues=inputs.map(el=>el.value);
    state.notifications=getNotificationInputs().map(el=>el.checked);
    const eps=sectionFor('3. EPS y Cobertura'); if(eps) state.eps=eps.querySelector('input,select')?.value||state.eps;
    state.updatedAt=new Date().toISOString();
  }
  function save(){
    gather();
    try { localStorage.setItem(KEY,JSON.stringify(state)); const bar=$('#save-settings-bar');if(bar)bar.style.opacity='.75';notice('Preferencias guardadas en este navegador. Para sincronizarlas entre dispositivos se necesita una tabla de preferencias en Supabase.'); }
    catch(e){notice('No fue posible guardar las preferencias en este navegador.',true);}
  }
  function restore(){
    try {localStorage.removeItem(KEY);}catch(e){}
    state={...defaults,profile:{}};
    applyTheme('claro');applyPalette('azul');getNotificationInputs().forEach((el,i)=>el.checked=defaults.notifications[i]??false);
    notice('Preferencias restablecidas. Pulsa Guardar para confirmar.');markDirty();
  }
  function loadSaved(){
    if(state.theme)applyTheme(state.theme);if(state.palette)applyPalette(state.palette);window.dispatchEvent(new CustomEvent('salud:theme-change',{detail:state}));
    const checks=getNotificationInputs();checks.forEach((el,i)=>{if(state.notifications[i]!==undefined)el.checked=state.notifications[i];});
    if(Array.isArray(state.profileValues)) $$('input[type="text"],input[type="email"],input[type="tel"]').forEach((el,i)=>{if(state.profileValues[i]!==undefined)el.value=state.profileValues[i];});
  }
  function wireTabs(){
    const bar=$$('main button').find(b=>norm(b.innerText).includes('apariencia y tema'))?.parentElement;
    if(!bar)return;
    const map=[['apariencia y tema','1. tema y apariencia'],['perfil y contacto','2. información personal'],['eps y cobertura','3. eps y cobertura'],['notificaciones','4. notificaciones'],['seguridad y 2fa','5. seguridad'],['conectividad de red','conectividad']];
    $$('button',bar).forEach(btn=>{btn.addEventListener('click',()=>{const key=map.find(([label])=>norm(btn.innerText).includes(label));if(!key)return;const target=sectionFor(key[1])||allSections.find(s=>norm(s.innerText).includes(key[0]));if(target){target.scrollIntoView({behavior:'smooth',block:'start'});$$('button',bar).forEach(b=>{b.classList.remove('bg-primary','text-on-primary','shadow-sm');b.classList.add('text-on-surface-variant');});btn.classList.add('bg-primary','text-on-primary','shadow-sm');}});});
  }
  function wirePassword(){
    const b=buttonByText('Cambiar Contraseña');if(!b)return;
    b.addEventListener('click',async()=>{
      const client=window.saludSupabase;if(!client){notice('No se pudo conectar con Supabase.',true);return;}
      const p1=prompt('Escribe tu nueva contraseña (mínimo 10 caracteres):');if(p1===null)return;
      if(p1.length<10){notice('La contraseña debe tener al menos 10 caracteres.',true);return;}
      const p2=prompt('Confirma la nueva contraseña:');if(p2===null)return;if(p1!==p2){notice('Las contraseñas no coinciden.',true);return;}
      b.disabled=true;try{const {error}=await client.auth.updateUser({password:p1});if(error)throw error;notice('Contraseña actualizada correctamente en Supabase.');}catch(e){notice('No se pudo actualizar la contraseña: '+(e.message||'error desconocido'),true);}finally{b.disabled=false;}
    });
  }
  function wireActions(){
    const saveButtons=$$('button').filter(b=>/guardar preferencias|guardar cambios/i.test(b.innerText));saveButtons.forEach(b=>b.addEventListener('click',save));
    const reset=buttonByText('Restablecer');if(reset)reset.addEventListener('click',restore);
    const discard=buttonByText('Descartar');if(discard)discard.addEventListener('click',()=>{try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');state={...defaults,...saved};loadSaved();notice('Se descartaron los cambios no guardados.');}catch(e){restore();}});
    getNotificationInputs().forEach(el=>el.addEventListener('change',markDirty));
    $$('input[type="text"],input[type="email"],input[type="tel"]').forEach(el=>el.addEventListener('input',markDirty));
    wirePassword();
  }
  document.addEventListener('DOMContentLoaded',()=>{loadSaved();wireTabs();wireActions();});
})();
