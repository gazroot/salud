/* Menú compartido de Salud en Orden. Mantiene el mismo estilo visual del menú de index.html. */
(() => {
  const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const links = [
    ['index.html', 'Dashboard', 'dashboard'],
    ['medicamento.html', 'Medicamentos', 'medication'],
    ['calendario.html', 'Calendario', 'calendar_month'],
    ['autorizaciones.html', 'Autorizaciones', 'verified'],
    ['ajustes.html', 'Ajustes', 'settings']
  ];

  function initMenu() {
    if (document.getElementById('salud-shared-sidebar')) return;
    const style = document.createElement('style');
    style.id = 'salud-shared-menu-styles';
    style.textContent = `
      #salud-shared-sidebar{box-sizing:border-box;display:flex;flex-direction:column;position:fixed;left:0;top:0;bottom:0;width:256px;height:100vh;z-index:1000;background:#f7f9fb;border-right:1px solid #e5e7eb;padding:24px 0;color:#374151;font-family:Inter,sans-serif;overflow-y:auto}
      #salud-shared-sidebar .salud-menu-brand{padding:0 24px;margin-bottom:32px}
      #salud-shared-sidebar .salud-menu-brand h1{font-size:20px;line-height:1.35;font-weight:700;color:#0d47a1;margin:0}
      #salud-shared-sidebar .salud-menu-brand p{font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;margin:5px 0 0}
      #salud-shared-sidebar nav{display:flex;flex-direction:column;gap:4px;padding:0 8px;flex:1}
      #salud-shared-sidebar nav a{box-sizing:border-box;display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:8px;text-decoration:none;color:#4b5563;font-size:14px;font-weight:500;transition:background .15s,color .15s}
      #salud-shared-sidebar nav a:hover{background:#f3f4f6;color:#0d47a1}
      #salud-shared-sidebar nav a.active{background:#e3f2fd;color:#0d47a1;font-weight:600}
      #salud-shared-sidebar .material-icons{font-size:21px;line-height:1}
      #salud-shared-sidebar .salud-menu-bottom{padding:16px 16px 0;margin-top:auto}
      #salud-shared-sidebar .salud-menu-divider{border-top:1px solid #e5e7eb;padding-top:12px}
      #salud-shared-sidebar .salud-menu-bottom a,#salud-shared-sidebar .salud-menu-bottom button{box-sizing:border-box;width:100%;display:flex;align-items:center;gap:12px;padding:10px 8px;border:0;border-radius:8px;background:transparent;text-decoration:none;text-align:left;color:#4b5563;font:500 13px Inter,sans-serif;cursor:pointer}
      #salud-shared-sidebar .salud-menu-bottom a:hover{background:#f3f4f6;color:#0d47a1}
      #salud-shared-sidebar .salud-menu-bottom button:hover{background:#fef2f2;color:#b91c1c}
      #salud-menu-toggle{display:none;position:fixed;top:12px;left:12px;z-index:1002;border:1px solid #e5e7eb;background:#fff;color:#0d47a1;border-radius:8px;padding:9px 12px;box-shadow:0 2px 8px #0f172a12;font:600 14px Inter,sans-serif;cursor:pointer}
      #salud-menu-overlay{display:none;position:fixed;inset:0;background:rgba(15,23,42,.48);z-index:999}
      #salud-menu-overlay.visible{display:block}
      @media(min-width:1024px){body{padding-left:256px!important}#salud-menu-toggle{display:none!important}#salud-menu-overlay{display:none!important}}
      @media(max-width:1023px){#salud-shared-sidebar{display:none;z-index:1000}#salud-shared-sidebar.open{display:flex}#salud-menu-toggle{display:inline-flex}body{padding-left:0!important}body>header{padding-left:70px!important}}
    `;
    document.head.appendChild(style);

    const sidebar = document.createElement('aside');
    sidebar.id = 'salud-shared-sidebar';
    sidebar.setAttribute('aria-label', 'Menú principal');
    sidebar.innerHTML = `
      <div class="salud-menu-brand">
        <h1>Tu salud a la mano</h1>
        <p>Clinical Portal</p>
      </div>
      <nav>${links.map(([href, label, icon]) => `
        <a href="${href}" class="${currentFile === href ? 'active' : ''}" ${currentFile === href ? 'aria-current="page"' : ''}>
          <span class="material-icons" aria-hidden="true">${icon}</span><span>${label}</span>
        </a>`).join('')}
      </nav>
      <div class="salud-menu-bottom">
        <div class="salud-menu-divider">
          <button id="salud-shared-logout" type="button"><span class="material-icons" aria-hidden="true">logout</span><span>Cerrar sesión</span></button>
        </div>
      </div>`;

    const overlay = document.createElement('div');
    overlay.id = 'salud-menu-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    const toggle = document.createElement('button');
    toggle.id = 'salud-menu-toggle';
    toggle.type = 'button';
    toggle.innerHTML = '<span class="material-icons" aria-hidden="true">menu</span> Menú';
    toggle.setAttribute('aria-label', 'Abrir menú');

    document.body.prepend(overlay);
    document.body.prepend(sidebar);
    document.body.prepend(toggle);

    const close = () => { sidebar.classList.remove('open'); overlay.classList.remove('visible'); };
    toggle.addEventListener('click', () => {
      const opening = !sidebar.classList.contains('open');
      sidebar.classList.toggle('open', opening);
      overlay.classList.toggle('visible', opening);
    });
    overlay.addEventListener('click', close);
    sidebar.querySelectorAll('nav a').forEach(a => a.addEventListener('click', close));

    const logout = document.getElementById('salud-shared-logout');
    logout.addEventListener('click', async () => {
      const client = window.saludSupabase;
      if (!client) { alert('No se pudo conectar con Supabase. Revisa supabase-config.js.'); return; }
      logout.disabled = true;
      logout.innerHTML = '<span class="material-icons" aria-hidden="true">hourglass_top</span><span>Cerrando sesión...</span>';
      try {
        const { error } = await client.auth.signOut();
        if (error) throw error;
        window.location.replace('login.html');
      } catch (error) {
        alert('No se pudo cerrar la sesión: ' + (error?.message || error));
        logout.disabled = false;
        logout.innerHTML = '<span class="material-icons" aria-hidden="true">logout</span><span>Cerrar sesión</span>';
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMenu);
  else initMenu();
})();
