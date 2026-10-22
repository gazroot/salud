/* Salud en Orden — configuración pública. Nunca pegues aquí service_role, sb_secret o contraseñas. */
(() => {
  const SUPABASE_URL = 'https://tumhcmhxmaburercohou.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_u8k-diFArHyCH1Qg_LQY7Q_UtW9865F';
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('No se cargó Supabase JS. Comprueba la conexión a Internet.');
    window.saludConfigError = 'No se pudo cargar la biblioteca de Supabase.';
    return;
  }
  if (!SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY.includes('PEGA_AQUI')) {
    window.saludConfigMissing = true;
    window.saludConfigError = 'Falta configurar la clave publicable en supabase-config.js.';
    return;
  }
  window.saludSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
})();
