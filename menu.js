/* Menú lateral único para las páginas secundarias de Salud en Orden.
   Elimina primero los menús originales de cada página y después crea uno común. */
(() => {
  const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const links = [
    ['index.html', 'dashboard', 'Dashboard'],
    ['medicamento.html', 'medication', 'Medicamentos'],
    ['calendario.html', 'calendar_month', 'Calendario'],
    ['autorizaciones.html', 'verified', 'Autorizaciones'],
    ['ajustes.html', 'settings', 'Ajustes']
  ];

  function removeOldSidebars() {
    // Las páginas antiguas usan <nav> o <aside> fijo a la izquierda.
    document.querySelectorAll('body > nav, body > aside').forEach(el => {
      if (el.id === 'salud-shared-sidebar' || el.id === 'salud-mobile-overlay') return;
      const cls = typeof el.className === 'string' ? el.className : '';
      const fixedLeft = cls.includes('fixed') && cls.includes('left-0') && cls.includes('top-0');
      const wideSidebar = cls.includes('w-64') || /width\s*:\s*256px/i.test(el.getAttribute('style') || '');
      if (fixedLeft && wideSidebar) el.remove();
    });
  }

  function initMenu() {
    if (document.getElementById('salud-shared-sidebar')) return;
    removeOldSidebars();

    const style = document.createElement('style');
    style.id = 'salud-shared-menu-style';
    style.textContent = `
      #salud-shared-sidebar{position:fixed;inset:0 auto 0 0;width:256px;height:100vh;background:#f7f9fb;border-right:1px solid #e5e7eb;z-index:1000;display:flex;flex-direction:column;padding:24px 0;box-sizing:border-box;transform:translateX(-105%);transition:transform .22s ease;overflow-y:auto;color:#1f2937;font-family:Inter,system-ui,sans-serif}
      #salud-shared-sidebar.open{transform:translateX(0)}
      #salud-shared-sidebar .salud-brand{padding:0 24px;margin:0 0 4px;font-size:20px;line-height:1.4;font-weight:700;color:#0d47a1}
      #salud-shared-sidebar .salud-subtitle{padding:0 24px;margin:0 0 30px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280}
      #salud-shared-sidebar nav{display:grid;gap:4px;padding:0 8px}
      #salud-shared-sidebar nav a{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:8px;text-decoration:none;color:#4b5563;font-size:14px;font-weight:500}
      #salud-shared-sidebar nav a:hover{background:#f3f4f6}
      #salud-shared-sidebar nav a.active{background:#e3f2fd;color:#0d47a1;font-weight:600}
      #salud-shared-sidebar .salud-icon{width:22px;text-align:center;font-size:18px}
      #salud-shared-sidebar .salud-menu-bottom{margin-top:auto;padding:16px 12px 0;border-top:1px solid #e5e7eb}
      #salud-shared-sidebar .salud-emergency{width:100%;border:1px solid #fee2e2;background:#fef2f2;color:#dc2626;padding:12px 10px;border-radius:12px;font:700 13px Inter,system-ui,sans-serif;cursor:pointer;margin-bottom:14px}
      #salud-shared-sidebar .salud-logout{width:100%;border:0;background:transparent;color:#4b5563;padding:12px;text-align:left;border-radius:8px;font:500 14px Inter,system-ui,sans-serif;cursor:pointer}
      #salud-shared-sidebar .salud-logout:hover{background:#f3f4f6}
      #salud-menu-toggle{position:fixed;top:12px;left:12px;z-index:1002;border:1px solid #e5e7eb;background:#f7f9fb;color:#0d47a1;border-radius:10px;padding:9px 12px;box-shadow:0 2px 8px #0f172a12;font:600 14px Inter,system-ui,sans-serif;cursor:pointer}
      #salud-menu-overlay{position:fixed;inset:0;background:#0f172a70;z-index:999;display:none}
      #salud-menu-overlay.visible{display:block}
      @media(min-width:1024px){#salud-shared-sidebar{transform:translateX(0)}#salud-menu-toggle{display:none}#salud-menu-overlay{display:none!important}body{padding-left:256px!important}}
      @media(max-width:1023px){body{padding-left:0!important}body>header{padding-left:70px!important}}
    `;
    document.head.appendChild(style);

    const sidebar = document.createElement('aside');
    sidebar.id = 'salud-shared-sidebar';
    sidebar.setAttribute('aria-label', 'Menú principal');
    const iconMap = { dashboard: '▦', medication: '✚', calendar_month: '▦', verified: '✓', settings: '⚙' };
    sidebar.innerHTML = `
      <div class="salud-brand">Tu salud a la mano</div>
      <div class="salud-subtitle">Clinical Portal</div>
      <nav>${links.map(([href, icon, label]) => `<a href="${href}" class="${currentFile === href ? 'active' : ''}" ${currentFile === href ? 'aria-current="page"' : ''}><span class="salud-icon" aria-hidden="true">${iconMap[icon]}</span><span>${label}</span></a>`).join('')}</nav>
      <div class="salud-menu-bottom">
        <button class="salud-emergency" id="salud-shared-emergency" type="button">✚ &nbsp; Contacto de emergencia</button>
        <button class="salud-logout" id="salud-shared-logout" type="button">⇥ &nbsp; Cerrar sesión</button>
      </div>`;
    const overlay = document.createElement('div'); overlay.id = 'salud-menu-overlay';
    const toggle = document.createElement('button'); toggle.id = 'salud-menu-toggle'; toggle.type = 'button'; toggle.textContent = '☰ Menú'; toggle.setAttribute('aria-label', 'Abrir menú');
    document.body.prepend(overlay); document.body.prepend(sidebar); document.body.prepend(toggle);

    const close = () => { sidebar.classList.remove('open'); overlay.classList.remove('visible'); };
    toggle.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('visible'); });
    overlay.addEventListener('click', close);
    sidebar.querySelectorAll('nav a').forEach(a => a.addEventListener('click', close));

    document.getElementById('salud-shared-emergency').addEventListener('click', () => {
      alert('Si estás ante una emergencia médica, comunícate con el número de emergencias de tu localidad.');
    });
    const logout = document.getElementById('salud-shared-logout');
    logout.addEventListener('click', async () => {
      const client = window.saludSupabase;
      if (!client) { alert('No se pudo conectar con Supabase. Revisa supabase-config.js.'); return; }
      logout.disabled = true; logout.textContent = 'Cerrando sesión…';
      try { const { error } = await client.auth.signOut(); if (error) throw error; location.replace('login.html'); }
      catch (error) { alert('No se pudo cerrar la sesión: ' + (error?.message || error)); logout.disabled = false; logout.textContent = '⇥  Cerrar sesión'; }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMenu); else initMenu();
})();
