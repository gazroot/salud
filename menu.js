/* Menú único de Salud en Orden para las páginas secundarias. */
(() => {
  const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (currentFile === 'index.html' || ['login.html','recuperar-clave.html'].includes(currentFile)) return;
  const links = [
    ['index.html', 'Dashboard', '▦'],
    ['medicamento.html', 'Medicamentos', '＋'],
    ['calendario.html', 'Calendario', '▦'],
    ['autorizaciones.html', 'Autorizaciones', '✓'],
    ['ajustes.html', 'Ajustes', '⚙']
  ];
  function init() {
    if (document.getElementById('salud-app-sidebar')) return;
    const style = document.createElement('style');
    style.textContent = `
      #salud-app-sidebar{position:fixed!important;left:0!important;top:0!important;bottom:0!important;width:256px!important;height:100vh!important;z-index:1000!important;display:flex!important;flex-direction:column!important;box-sizing:border-box!important;background:var(--salud-card,#f7f9fb)!important;border-right:1px solid var(--salud-border,#e5e7eb)!important;padding:24px 0!important;overflow-y:auto!important;font-family:Inter,system-ui,sans-serif!important;color:var(--salud-text,#334155)!important;transform:none!important}
      #salud-app-sidebar .salud-brand{padding:0 24px;margin-bottom:4px;font-size:20px;font-weight:700;color:var(--salud-primary,#0d47a1)}
      #salud-app-sidebar .salud-subtitle{padding:0 24px;margin-bottom:38px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--salud-muted,#64748b)}
      #salud-app-sidebar nav{display:grid;gap:4px;padding:0 8px}
      #salud-app-sidebar nav a{display:flex;align-items:center;gap:14px;padding:15px 16px;border-radius:10px;text-decoration:none;color:var(--salud-muted,#475569);font-size:14px;font-weight:500}
      #salud-app-sidebar nav a:hover{background:var(--salud-hover,#eef2f7)}
      #salud-app-sidebar nav a.active{background:var(--salud-active-bg,#e3f2fd);color:var(--salud-primary,#0d47a1);font-weight:600}
      #salud-app-sidebar .salud-bottom{margin-top:auto;padding:18px 12px 0;border-top:1px solid var(--salud-border,#e5e7eb)}
      #salud-app-sidebar .salud-emergency{display:block;width:100%;margin-bottom:14px;padding:13px 8px;border:1px solid #fee2e2;border-radius:14px;background:var(--salud-emergency-bg,#fff5f5);color:#dc2626;text-align:center;font-size:13px;font-weight:700;cursor:pointer}
      #salud-app-sidebar .salud-logout{width:100%;padding:12px 10px;border:0;background:transparent;color:var(--salud-muted,#475569);text-align:left;font:500 14px Inter,system-ui,sans-serif;cursor:pointer}
      #salud-app-sidebar .salud-account{padding:8px 12px 0;font-size:11px;color:var(--salud-muted,#64748b);overflow-wrap:anywhere}
      #salud-menu-toggle{position:fixed;top:12px;left:12px;z-index:1002;display:none;border:1px solid #dbe3ef;background:#fff;color:#0d47a1;border-radius:10px;padding:9px 12px;box-shadow:0 2px 8px #0f172a12;font:600 14px Inter,system-ui,sans-serif;cursor:pointer}
      #salud-menu-overlay{position:fixed;inset:0;background:#0f172a70;z-index:999;display:none}
      @media(min-width:1024px){body{padding-left:0!important}body>main{margin-left:256px!important;width:calc(100% - 256px)!important;min-width:0!important}body>div:not(#salud-menu-overlay):not(#salud-app-sidebar):not(#salud-menu-toggle){ } }
      @media(max-width:1023px){#salud-app-sidebar{transform:translateX(-105%)!important;transition:transform .22s ease!important}#salud-app-sidebar.open{transform:translateX(0)!important}#salud-menu-toggle{display:block}#salud-menu-overlay.visible{display:block}body>main{margin-left:0!important;width:100%!important;padding-top:48px!important}}
    `;
    document.head.appendChild(style);
    const sidebar=document.createElement('aside'); sidebar.id='salud-app-sidebar'; sidebar.setAttribute('aria-label','Menú principal');
    sidebar.innerHTML=`<div class="salud-brand">Tu salud a la mano</div><div class="salud-subtitle">Clinical Portal</div><nav>${links.map(([href,label,icon])=>`<a href="${href}" class="${currentFile===href?'active':''}" ${currentFile===href?'aria-current="page"':''}><span style="width:22px;text-align:center;font-size:19px" aria-hidden="true">${icon}</span><span>${label}</span></a>`).join('')}</nav><div class="salud-bottom"><button type="button" class="salud-emergency" id="salud-emergency-button">＋ &nbsp; Contacto de emergencia</button><button type="button" class="salud-logout" id="salud-shared-logout">↪ &nbsp; Cerrar sesión</button><div class="salud-account" id="salud-shared-account">Sesión: comprobando...</div></div>`;
    const overlay=document.createElement('div');overlay.id='salud-menu-overlay';
    const toggle=document.createElement('button');toggle.id='salud-menu-toggle';toggle.type='button';toggle.textContent='☰ Menú';toggle.setAttribute('aria-label','Abrir menú');
    document.body.prepend(overlay);document.body.prepend(sidebar);document.body.prepend(toggle);
    const close=()=>{sidebar.classList.remove('open');overlay.classList.remove('visible')};
    toggle.addEventListener('click',()=>{sidebar.classList.toggle('open');overlay.classList.toggle('visible')});overlay.addEventListener('click',close);sidebar.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',close));
    const setUser=user=>{const el=document.getElementById('salud-shared-account');if(el)el.textContent='Sesión: '+(user?.email||'cuenta autenticada')};
    if(window.saludSession?.user)setUser(window.saludSession.user);
    document.addEventListener('salud:ready',e=>setUser(e.detail?.user));
    document.getElementById('salud-emergency-button').addEventListener('click',()=>alert('Si estás en una emergencia en Colombia, llama al 123.'));
    document.getElementById('salud-shared-logout').addEventListener('click',async()=>{const btn=document.getElementById('salud-shared-logout');const client=window.saludSupabase;if(!client){alert('No se pudo conectar con Supabase.');return}btn.disabled=true;btn.textContent='Cerrando sesión…';try{const {error}=await client.auth.signOut();if(error)throw error;location.replace('login.html')}catch(e){alert('No se pudo cerrar sesión: '+(e?.message||e));btn.disabled=false;btn.textContent='↪  Cerrar sesión'}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
