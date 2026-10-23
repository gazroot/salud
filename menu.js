/* Menú compartido de Salud en Orden. Compatible con GitHub Pages y Supabase. */
(() => {
  const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const links = [
    ['index.html', 'Inicio', 'dashboard'],
    ['calendario.html', 'Citas y calendario', 'calendar_month'],
    ['medicamento.html', 'Medicamentos', 'medication'],
    ['autorizaciones.html', 'Órdenes y autorizaciones', 'description'],
    ['ajustes.html', 'Ajustes', 'settings']
  ];
  function initMenu() {
    if (document.getElementById('salud-shared-sidebar')) return;
    const style = document.createElement('style');
    style.textContent = `
      #salud-shared-sidebar{position:fixed;inset:0 auto 0 0;width:264px;background:#fff;border-right:1px solid #e2e8f0;z-index:1000;display:flex;flex-direction:column;padding:22px 16px;box-sizing:border-box;transform:translateX(-105%);transition:transform .22s ease;overflow-y:auto;color:#172554;font-family:Inter,system-ui,sans-serif}
      #salud-shared-sidebar.open{transform:translateX(0)}
      #salud-shared-sidebar .salud-brand{font-size:18px;font-weight:800;letter-spacing:.02em;margin:0 8px 6px}
      #salud-shared-sidebar .salud-subtitle{font-size:12px;color:#64748b;margin:0 8px 28px}
      #salud-shared-sidebar nav{display:grid;gap:6px}
      #salud-shared-sidebar nav a{display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;text-decoration:none;color:#475569;font-size:14px;font-weight:600}
      #salud-shared-sidebar nav a:hover{background:#f1f5f9}
      #salud-shared-sidebar nav a.active{background:#e8f0fe;color:#174ea6}
      #salud-shared-sidebar .salud-menu-bottom{margin-top:auto;padding-top:20px;border-top:1px solid #e2e8f0}
      #salud-shared-sidebar button{width:100%;border:0;background:transparent;color:#b42318;padding:12px;text-align:left;border-radius:10px;font:600 14px Inter,system-ui,sans-serif;cursor:pointer}
      #salud-shared-sidebar button:hover{background:#fef2f2}
      #salud-menu-toggle{position:fixed;top:14px;left:14px;z-index:1002;border:1px solid #dbe3ef;background:#fff;color:#1e3a8a;border-radius:10px;padding:9px 12px;box-shadow:0 2px 8px #0f172a12;font:600 14px Inter,system-ui,sans-serif;cursor:pointer}
      #salud-menu-overlay{position:fixed;inset:0;background:#0f172a70;z-index:999;display:none}
      #salud-menu-overlay.visible{display:block}
      @media(min-width:1024px){#salud-shared-sidebar{transform:translateX(0)}#salud-menu-toggle{display:none}#salud-menu-overlay{display:none!important}body{padding-left:264px!important}}
      @media(max-width:1023px){body{padding-left:0!important}body>header{padding-left:70px!important}}
    `;
    document.head.appendChild(style);
    const sidebar = document.createElement('aside'); sidebar.id='salud-shared-sidebar'; sidebar.setAttribute('aria-label','Menú principal');
    sidebar.innerHTML = `<div class="salud-brand">Salud en Orden</div><div class="salud-subtitle">Tu salud, organizada</div><nav>${links.map(([href,label,ico])=>`<a href="${href}" class="${currentFile===href?'active':''}" ${currentFile===href?'aria-current="page"':''}><span aria-hidden="true">${({dashboard:'⌂',calendar_month:'▦',medication:'＋',description:'▤',settings:'⚙'})[ico]}</span><span>${label}</span></a>`).join('')}</nav><div class="salud-menu-bottom"><button id="salud-shared-logout" type="button">↪ &nbsp; Cerrar sesión</button></div>`;
    const overlay=document.createElement('div'); overlay.id='salud-menu-overlay';
    const toggle=document.createElement('button'); toggle.id='salud-menu-toggle'; toggle.type='button'; toggle.textContent='☰ Menú'; toggle.setAttribute('aria-label','Abrir menú');
    document.body.prepend(overlay); document.body.prepend(sidebar); document.body.prepend(toggle);
    const close=()=>{sidebar.classList.remove('open');overlay.classList.remove('visible')};
    toggle.addEventListener('click',()=>{sidebar.classList.toggle('open');overlay.classList.toggle('visible')}); overlay.addEventListener('click',close);
    sidebar.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',close));
    const logout=document.getElementById('salud-shared-logout');
    logout.addEventListener('click',async()=>{
      const client=window.saludSupabase;
      if(!client){alert('No se pudo conectar con Supabase. Revisa supabase-config.js.');return}
      logout.disabled=true; logout.textContent='Cerrando sesión…';
      try{const {error}=await client.auth.signOut();if(error)throw error;location.replace('login.html')}
      catch(error){alert('No se pudo cerrar la sesión: '+(error?.message||error));logout.disabled=false;logout.textContent='↪   Cerrar sesión'}
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initMenu); else initMenu();
})();
