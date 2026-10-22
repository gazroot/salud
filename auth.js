/* Autenticación Supabase para Salud en Orden (GitHub Pages). */
(() => {
  const PUBLIC_FILES = new Set(['login.html', 'recuperar-clave.html']);
  const file = location.pathname.split('/').pop() || 'index.html';
  const isPublic = PUBLIC_FILES.has(file);
  const client = () => window.saludSupabase;
  const loginUrl = () => new URL('login.html', location.href).href;
  const homeUrl = () => new URL('index.html', location.href).href;
  function message(text, error=false) {
    const n = document.querySelector('[data-auth-message]');
    if (!n) return;
    n.textContent = text; n.hidden = false;
    n.className = 'mt-3 text-sm ' + (error ? 'text-red-600' : 'text-emerald-700');
  }
  window.saludAuthMessage = message;
  function showConfigError() {
    const b=document.createElement('div'); b.setAttribute('role','alert');
    b.style.cssText='position:relative;z-index:10000;padding:12px 16px;background:#fff4ce;color:#663c00;border:1px solid #f0d98c;font:14px/1.5 Arial,sans-serif';
    b.textContent=window.saludConfigError || 'Configura Supabase antes de utilizar la aplicación.';
    document.body.prepend(b);
  }
  function addSessionBar(user) {
    if (document.getElementById('salud-account-bar')) return;
    const bar=document.createElement('div'); bar.id='salud-account-bar';
    bar.style.cssText='position:sticky;top:0;z-index:9999;display:flex;gap:12px;align-items:center;justify-content:flex-end;flex-wrap:wrap;padding:8px 16px;background:#eaf4ff;border-bottom:1px solid #cfe3fb;font:13px Arial,sans-serif;color:#123';
    const email=document.createElement('span'); email.textContent='Sesión: '+(user.email||'cuenta autenticada');
    const logout=document.createElement('button'); logout.type='button'; logout.textContent='Cerrar sesión';
    logout.style.cssText='border:0;border-radius:7px;background:#b42318;color:white;padding:7px 10px;cursor:pointer';
    logout.addEventListener('click',async()=>{logout.disabled=true;const {error}=await client().auth.signOut();if(error){alert('No se pudo cerrar sesión: '+error.message);logout.disabled=false;}else location.replace(loginUrl());});
    bar.append(email,logout); document.body.prepend(bar);
    document.querySelectorAll('a[href="#"]').forEach(a=>{if(/logout|cerrar sesión/i.test(a.textContent)){a.href='login.html';a.addEventListener('click',async e=>{e.preventDefault();const {error}=await client().auth.signOut();if(error)alert(error.message);else location.replace(loginUrl());});}});
  }
  async function protectPage() {
    if (!client()) { showConfigError(); return; }
    const {data,error}=await client().auth.getSession();
    if(error || !data.session){const next=encodeURIComponent(location.href);location.replace(loginUrl()+'?next='+next);return;}
    window.saludSession=data.session;
    addSessionBar(data.session.user);
    document.dispatchEvent(new CustomEvent('salud:ready',{detail:{user:data.session.user}}));
  }
  async function initLogin() {
    if(!client()){message(window.saludConfigError||'Falta configurar Supabase.',true);return;}
    const {data}=await client().auth.getSession();
    if(data.session){location.replace(homeUrl());return;}
    const signin=document.getElementById('signin-form'), signup=document.getElementById('signup-form'), reset=document.getElementById('reset-form');
    const switchPanel=id=>document.querySelectorAll('[data-auth-panel]').forEach(p=>p.hidden=p.id!==id);
    document.querySelectorAll('[data-show-panel]').forEach(b=>b.addEventListener('click',()=>switchPanel(b.dataset.showPanel)));
    if(signin)signin.addEventListener('submit',async e=>{
      e.preventDefault();const btn=signin.querySelector('[type="submit"]');btn.disabled=true;
      const {error}=await client().auth.signInWithPassword({email:signin.elements.email.value.trim(),password:signin.elements.password.value});btn.disabled=false;
      if(error){message('No se pudo iniciar sesión. Verifica tus datos. '+error.message,true);return;}
      let target=homeUrl();const next=new URLSearchParams(location.search).get('next');
      if(next){try{const u=new URL(next);const base=location.pathname.replace(/[^/]*$/,'');if(u.origin===location.origin&&u.pathname.startsWith(base))target=u.href;}catch{}}
      location.replace(target);
    });
    if(signup)signup.addEventListener('submit',async e=>{
      e.preventDefault();const btn=signup.querySelector('[type="submit"]');const email=signup.elements.email.value.trim();const password=signup.elements.password.value;const confirm=signup.elements.confirmPassword.value;
      if(password.length<10){message('Usa una contraseña de al menos 10 caracteres.',true);return;}
      if(password!==confirm){message('Las contraseñas no coinciden.',true);return;}
      btn.disabled=true;const {data,error}=await client().auth.signUp({email,password,options:{emailRedirectTo:new URL('login.html',location.href).href}});btn.disabled=false;
      if(error){message('No se pudo crear la cuenta: '+error.message,true);return;}
      if(data.session)location.replace(homeUrl());else message('Cuenta creada. Revisa tu correo y confirma la dirección antes de iniciar sesión.');
    });
    if(reset)reset.addEventListener('submit',async e=>{e.preventDefault();const {error}=await client().auth.resetPasswordForEmail(reset.elements.email.value.trim(),{redirectTo:new URL('recuperar-clave.html',location.href).href});if(error)message('No se pudo enviar el correo: '+error.message,true);else message('Si el correo está registrado, recibirás instrucciones para recuperar el acceso.');});
  }
  async function initRecovery(){if(!client()){message(window.saludConfigError||'Falta configurar Supabase.',true);return;}const f=document.getElementById('new-password-form');if(!f)return;f.addEventListener('submit',async e=>{e.preventDefault();const p=f.elements.password.value,c=f.elements.confirmPassword.value;if(p.length<10)return message('Usa una contraseña de al menos 10 caracteres.',true);if(p!==c)return message('Las contraseñas no coinciden.',true);const {error}=await client().auth.updateUser({password:p});if(error)message('No se pudo actualizar la contraseña: '+error.message,true);else{message('Contraseña actualizada. Ya puedes iniciar sesión.');setTimeout(()=>location.replace(loginUrl()),1200);}});}
  document.addEventListener('DOMContentLoaded',()=>{if(isPublic){if(file==='login.html')initLogin();else initRecovery();}else protectPage();});
})();
