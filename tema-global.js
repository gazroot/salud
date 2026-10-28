/* Tema global de Salud en Orden: se aplica en todas las páginas, incluida la barra lateral. */
(() => {
  'use strict';
  const KEY = 'salud-en-orden-ajustes-v1';
  const palettes = {
    azul: {primary:'#0d47a1', secondary:'#1b6d24'},
    verde: {primary:'#1b6d24', secondary:'#0d47a1'},
    contraste: {primary:'#191c1e', secondary:'#191c1e'}
  };
  const css = `
    :root{--salud-primary:#0d47a1;--salud-secondary:#1b6d24;--salud-page:#f7f9fb;--salud-card:#fff;--salud-text:#172033;--salud-muted:#64748b;--salud-border:#e2e8f0;--salud-hover:#eef2f7;--salud-active-bg:#e3f2fd;--salud-emergency-bg:#fff5f5}
    html[data-salud-theme="oscuro"]{color-scheme:dark}
    html[data-salud-theme="claro"]{color-scheme:light}
    body{background:var(--salud-page)!important;color:var(--salud-text)}
    .bg-primary{background-color:var(--salud-primary)!important}
    .text-primary{color:var(--salud-primary)!important}
    .border-primary{border-color:var(--salud-primary)!important}
    .ring-primary{--tw-ring-color:var(--salud-primary)!important}
    .bg-secondary{background-color:var(--salud-secondary)!important}
    .text-secondary{color:var(--salud-secondary)!important}
    button:focus-visible,a:focus-visible,[role="button"]:focus-visible{outline:3px solid var(--salud-primary)!important;outline-offset:2px}
    html[data-salud-theme="oscuro"] body{background:#111827!important;color:#f3f4f6!important}
    html[data-salud-theme="oscuro"]{--salud-muted:#cbd5e1;--salud-border:#374151;--salud-hover:#374151;--salud-active-bg:#263b55;--salud-emergency-bg:#3f2024}
    html[data-salud-theme="oscuro"] #salud-app-sidebar{background:#1f2937!important;color:#f3f4f6!important;border-color:#374151!important}
    html[data-salud-theme="oscuro"] #salud-app-sidebar nav a{color:#cbd5e1!important}
    html[data-salud-theme="oscuro"] #salud-app-sidebar nav a.active{background:#263b55!important;color:#bfdbfe!important}
    html[data-salud-theme="oscuro"] #salud-app-sidebar .salud-brand{color:#93c5fd!important}
    html[data-salud-theme="oscuro"] #salud-app-sidebar .salud-subtitle,
    html[data-salud-theme="oscuro"] #salud-app-sidebar .salud-account{color:#cbd5e1!important}
    html[data-salud-theme="oscuro"] #salud-menu-toggle{background:#1f2937!important;color:#bfdbfe!important;border-color:#374151!important}
    html[data-salud-theme="oscuro"] #salud-account-bar{background:#1f2937!important;color:#f3f4f6!important;border-color:#374151!important}
    html[data-salud-theme="oscuro"] #salud-account-bar span{color:#f3f4f6!important}
    html[data-salud-theme="oscuro"] #salud-account-bar button{background:#b42318!important;color:#fff!important}
    html[data-salud-theme="oscuro"] main,
    html[data-salud-theme="oscuro"] main>div{color:#f3f4f6}
    html[data-salud-theme="oscuro"] main section,
    html[data-salud-theme="oscuro"] main article,
    html[data-salud-theme="oscuro"] main .bg-white,
    html[data-salud-theme="oscuro"] main .bg-surface-container-lowest,
    html[data-salud-theme="oscuro"] main .bg-surface-container-low,
    html[data-salud-theme="oscuro"] main .bg-gray-50,
    html[data-salud-theme="oscuro"] main .bg-gray-100{background-color:#1f2937!important;color:#f3f4f6!important;border-color:#374151!important}
    html[data-salud-theme="oscuro"] main .bg-blue-50,
    html[data-salud-theme="oscuro"] main .bg-green-50,
    html[data-salud-theme="oscuro"] main .bg-amber-50,
    html[data-salud-theme="oscuro"] main .bg-red-50{background-color:#273449!important}
    html[data-salud-theme="oscuro"] main input,
    html[data-salud-theme="oscuro"] main select,
    html[data-salud-theme="oscuro"] main textarea{background-color:#111827!important;color:#f9fafb!important;border-color:#4b5563!important}
    html[data-salud-theme="oscuro"] main input::placeholder,
    html[data-salud-theme="oscuro"] main textarea::placeholder{color:#9ca3af!important}
    html[data-salud-theme="oscuro"] main .text-gray-900,
    html[data-salud-theme="oscuro"] main .text-gray-800,
    html[data-salud-theme="oscuro"] main .text-on-surface,
    html[data-salud-theme="oscuro"] main h1,
    html[data-salud-theme="oscuro"] main h2,
    html[data-salud-theme="oscuro"] main h3,
    html[data-salud-theme="oscuro"] main h4{color:#f3f4f6!important}
    html[data-salud-theme="oscuro"] main .text-gray-700,
    html[data-salud-theme="oscuro"] main .text-gray-600,
    html[data-salud-theme="oscuro"] main .text-gray-500,
    html[data-salud-theme="oscuro"] main .text-slate-500,
    html[data-salud-theme="oscuro"] main .text-on-surface-variant{color:#cbd5e1!important}
    html[data-salud-theme="oscuro"] main .border-gray-100,
    html[data-salud-theme="oscuro"] main .border-gray-200,
    html[data-salud-theme="oscuro"] main .border-surface-container-low,
    html[data-salud-theme="oscuro"] main .border-surface-container{border-color:#374151!important}
    html[data-salud-theme="oscuro"] main .bg-surface-container,
    html[data-salud-theme="oscuro"] main .bg-surface-container-high,
    html[data-salud-theme="oscuro"] main .bg-surface-container-highest{background-color:#374151!important;color:#f3f4f6!important}
    html[data-salud-theme="oscuro"] main .text-primary{color:#93c5fd!important}
    html[data-salud-theme="oscuro"] main .text-secondary{color:#86efac!important}
    html[data-salud-theme="oscuro"] main button.bg-primary{background-color:var(--salud-primary)!important;color:#fff!important}
    html[data-salud-theme="oscuro"] main .bg-primary\\/10,
    html[data-salud-theme="oscuro"] main .bg-primary\\/5{background-color:#263b55!important}
    html[data-salud-theme="oscuro"] main .bg-secondary\\/10,
    html[data-salud-theme="oscuro"] main .bg-secondary\\/15{background-color:#1e3a2a!important}
    html[data-salud-theme="oscuro"] body>div[role="status"]{box-shadow:0 8px 24px #0008}
  `;
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch (_) { return {}; }
  }
  function apply(settings) {
    const theme = ['claro','oscuro','automatico'].includes(settings.theme) ? settings.theme : 'claro';
    const dark = theme === 'oscuro' || (theme === 'automatico' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const palette = palettes[settings.palette] ? settings.palette : 'azul';
    const colors = palettes[palette];
    document.documentElement.dataset.saludTheme = dark ? 'oscuro' : 'claro';
    document.documentElement.dataset.saludThemeChoice = theme;
    document.documentElement.dataset.saludPalette = palette;
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.setProperty('--salud-primary', colors.primary);
    document.documentElement.style.setProperty('--salud-secondary', colors.secondary);
    document.documentElement.style.setProperty('--salud-muted', dark ? '#cbd5e1' : '#64748b');
    document.documentElement.style.setProperty('--salud-border', dark ? '#374151' : '#e2e8f0');
    document.documentElement.style.setProperty('--salud-hover', dark ? '#374151' : '#eef2f7');
    document.documentElement.style.setProperty('--salud-active-bg', dark ? '#263b55' : '#e3f2fd');
    document.documentElement.style.setProperty('--salud-emergency-bg', dark ? '#3f2024' : '#fff5f5');
    document.documentElement.style.setProperty('--primary', colors.primary);
    document.documentElement.style.setProperty('--secondary', colors.secondary);
    document.documentElement.style.setProperty('--salud-page', dark ? '#111827' : '#f7f9fb');
    document.documentElement.style.setProperty('--salud-card', dark ? '#1f2937' : '#ffffff');
    document.documentElement.style.setProperty('--salud-text', dark ? '#f3f4f6' : '#172033');
    if (settings.palette === 'contraste') {
      document.documentElement.style.setProperty('--salud-page', dark ? '#000000' : '#ffffff');
      document.documentElement.style.setProperty('--salud-card', dark ? '#111111' : '#ffffff');
      document.documentElement.style.setProperty('--salud-text', dark ? '#ffffff' : '#000000');
    }
  }
  if (!document.getElementById('salud-global-theme-style')) {
    const style = document.createElement('style');
    style.id = 'salud-global-theme-style';
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }
  const settings = read();
  apply(settings);
  window.saludApplyTheme = apply;
  window.addEventListener('storage', e => { if (e.key === KEY) apply(read()); });
  window.addEventListener('salud:theme-change', e => apply(e.detail || read()));
  if (window.matchMedia) {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => { if (read().theme === 'automatico') apply(read()); };
    if (media.addEventListener) media.addEventListener('change', update);
    else if (media.addListener) media.addListener(update);
  }
})();
