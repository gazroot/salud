/* Autenticación y protección de páginas para GitHub Pages. */
(() => {
  const LOGIN_FILE = 'login.html';
  const PUBLIC_FILES = new Set([LOGIN_FILE, 'recuperar-clave.html']);
  const currentFile = location.pathname.split('/').pop() || 'index.html';
  const isPublic = PUBLIC_FILES.has(currentFile);
  const client = () => window.saludSupabase;
  const loginUrl = () => new URL(LOGIN_FILE, location.href).href;
  const dashboardUrl = () => new URL('index.html', location.href).href;

  function status(message, isError = false) {
    const node = document.querySelector('[data-auth-message]');
    if (!node) return;
    node.textContent = message;
    node.className = 'mt-3 text-sm ' + (isError ? 'text-red-600' : 'text-emerald-700');
    node.hidden = false;
  }
  window.saludAuthMessage = status;
  window.saludLoginUrl = loginUrl;

  async function requireSession() {
    if (!client()) {
      if (window.saludConfigMissing) {
        document.body.insertAdjacentHTML('afterbegin', '<div style="padding:12px;background:#fff3cd;color:#664d03;text-align:center">Configura la clave publicable en <code>supabase-config.js</code> para conectar la aplicación.</div>');
      }
      return;
    }
    const { data: { session }, error } = await client().auth.getSession();
    if (error || !session) {
      const next = encodeURIComponent(location.href);
      location.replace(loginUrl() + '?next=' + next);
      return;
    }
    window.saludSession = session;
    addAccountBar(session.user);
    document.dispatchEvent(new CustomEvent('salud:ready', { detail: { user: session.user } }));
  }

  function addAccountBar(user) {
    if (document.getElementById('salud-account-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'salud-account-bar';
    bar.style.cssText = 'position:sticky;top:0;z-index:9999;display:flex;gap:12px;align-items:center;justify-content:flex-end;flex-wrap:wrap;padding:8px 16px;background:#eaf4ff;border-bottom:1px solid #cfe3fb;font:13px Arial,sans-serif;color:#123;';
    const email = document.createElement('span');
    email.textContent = 'Sesión: ' + (user.email || 'cuenta autenticada');
    const link = document.createElement('a');
    link.href = new URL('registros.html', location.href).href;
    link.textContent = 'Mis registros';
    link.style.cssText = 'font-weight:700;color:#0d47a1;text-decoration:underline';
    const logout = document.createElement('button');
    logout.type = 'button'; logout.textContent = 'Cerrar sesión';
    logout.style.cssText = 'border:0;border-radius:7px;background:#b42318;color:white;padding:7px 10px;cursor:pointer';
    logout.addEventListener('click', async () => {
      const { error } = await client().auth.signOut();
      if (error) alert('No se pudo cerrar sesión: ' + error.message);
      else location.replace(loginUrl());
    });
    bar.append(email, link, logout);
    document.body.prepend(bar);
  }

  async function initLoginPage() {
    if (!client()) {
      status('Falta configurar la clave publicable de Supabase en supabase-config.js.', true);
      return;
    }
    const { data: { session } } = await client().auth.getSession();
    if (session && currentFile === LOGIN_FILE) { location.replace(dashboardUrl()); return; }

    const signInForm = document.getElementById('signin-form');
    const signUpForm = document.getElementById('signup-form');
    const resetForm = document.getElementById('reset-form');
    const show = (id) => document.querySelectorAll('[data-auth-panel]').forEach(p => p.hidden = p.id !== id);
    document.querySelectorAll('[data-show-panel]').forEach(b => b.addEventListener('click', () => show(b.dataset.showPanel)));

    if (signInForm) signInForm.addEventListener('submit', async e => {
      e.preventDefault(); const btn = signInForm.querySelector('button[type=submit]'); btn.disabled = true;
      const email = signInForm.email.value.trim(); const password = signInForm.password.value;
      const { error } = await client().auth.signInWithPassword({ email, password });
      btn.disabled = false;
      if (error) return status('No se pudo iniciar sesión. Revisa el correo y la contraseña. ' + error.message, true);
      const requested = new URLSearchParams(location.search).get('next');
      let target = dashboardUrl();
      if (requested) { try { const candidate = new URL(requested); if (candidate.origin === location.origin && candidate.pathname.startsWith(location.pathname.replace(/[^/]*$/, ''))) target = candidate.href; } catch {} }
      location.replace(target);
    });

    if (signUpForm) signUpForm.addEventListener('submit', async e => {
      e.preventDefault(); const btn = signUpForm.querySelector('button[type=submit]'); btn.disabled = true;
      const email = signUpForm.email.value.trim(); const password = signUpForm.password.value; const confirm = signUpForm.confirmPassword.value;
      if (password.length < 10) { btn.disabled = false; return status('Usa una contraseña de al menos 10 caracteres.', true); }
      if (password !== confirm) { btn.disabled = false; return status('Las contraseñas no coinciden.', true); }
      const { data, error } = await client().auth.signUp({ email, password, options: { emailRedirectTo: new URL('login.html', location.href).href } });
      btn.disabled = false;
      if (error) return status('No se pudo crear la cuenta: ' + error.message, true);
      if (data.session) location.replace(dashboardUrl());
      else status('Cuenta creada. Revisa tu correo y confirma la dirección antes de iniciar sesión.');
    });

    if (resetForm) resetForm.addEventListener('submit', async e => {
      e.preventDefault(); const email = resetForm.email.value.trim();
      const { error } = await client().auth.resetPasswordForEmail(email, { redirectTo: new URL('recuperar-clave.html', location.href).href });
      if (error) return status('No se pudo enviar el correo: ' + error.message, true);
      status('Si el correo está registrado, recibirás instrucciones para recuperar el acceso.');
    });
  }

  async function initRecoveryPage() {
    if (!client()) return;
    const form = document.getElementById('new-password-form');
    if (!form) return;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const p = form.password.value; const c = form.confirmPassword.value;
      if (p.length < 10) return status('Usa una contraseña de al menos 10 caracteres.', true);
      if (p !== c) return status('Las contraseñas no coinciden.', true);
      const { error } = await client().auth.updateUser({ password: p });
      if (error) return status('No se pudo actualizar la contraseña: ' + error.message, true);
      status('Contraseña actualizada. Ya puedes iniciar sesión.');
      setTimeout(() => location.replace(loginUrl()), 1400);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (isPublic) {
      if (currentFile === LOGIN_FILE) initLoginPage();
      else initRecoveryPage();
    } else requireSession();
  });
})();
