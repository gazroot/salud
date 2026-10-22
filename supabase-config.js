/* Salud en Orden — configuración pública del navegador.
   Usa únicamente la Project URL y la publishable key (sb_publishable_...).
   NUNCA pongas aquí service_role, una secret key ni la contraseña de la base de datos. */
(() => {
  const SUPABASE_URL = 'https://tumhcmhxmaburercohou.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'PEGA_AQUI_TU_CLAVE_PUBLICABLE';
  if (!window.supabase?.createClient) {
    console.error('No se cargó la biblioteca de Supabase. Comprueba la conexión a Internet.');
    return;
  }
  if (!SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY.includes('PEGA_AQUI')) {
    console.warn('Falta pegar la clave publicable de Supabase en supabase-config.js.');
    window.saludConfigMissing = true;
    return;
  }
  window.saludSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
})();
