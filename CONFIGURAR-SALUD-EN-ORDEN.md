# Configuración de Salud en Orden con Supabase y GitHub Pages

## 1. Pegar la clave publicable
1. En Supabase abre **Project Settings → API Keys** (o **Connect**).
2. Copia la **Publishable key** (`sb_publishable_...`). No copies `service_role` ni ninguna secret key.
3. Abre `supabase-config.js` y reemplaza `PEGA_AQUI_TU_CLAVE_PUBLICABLE` por esa clave. La Project URL ya está configurada.

## 2. Configurar Auth en Supabase
En **Authentication → URL Configuration** establece:
- **Site URL:** `https://gazroot.github.io/salud/`
- **Redirect URLs:** agrega `https://gazroot.github.io/salud/**`

En **Authentication → Sign In / Providers → Email**, confirma que Email está habilitado. Para uso personal, deja habilitada la confirmación por correo. El correo de prueba de Supabase tiene límites; si los correos no llegan, revisa el proveedor/SMTP.

## 3. Publicar en GitHub Pages
Sube todos los archivos de esta carpeta a la raíz del repositorio `salud` (no subas solo `index.html`). En GitHub, abre **Settings → Pages** y confirma la rama/carpeta publicada. La URL esperada es `https://gazroot.github.io/salud/`.

## 4. Probar
1. Abre `https://gazroot.github.io/salud/login.html`.
2. Crea una cuenta con tu correo y una contraseña única de al menos 10 caracteres.
3. Confirma el correo si Supabase lo solicita y vuelve a iniciar sesión.
4. Abre **Mis registros**, guarda un registro de prueba y verifica en Supabase Table Editor que aparece asociado a tu usuario.
5. Inicia sesión desde el otro dispositivo y comprueba que ves el mismo registro.

## Archivos principales
- `login.html`: inicio de sesión, registro y solicitud de recuperación.
- `recuperar-clave.html`: formulario para cambiar contraseña desde el enlace de correo.
- `supabase-config.js`: URL y clave publicable.
- `auth.js`: sesión, cierre de sesión y protección de las páginas.
- `registros.html` / `registros.js`: formularios y consultas a las cinco tablas.

## Seguridad
- Las tablas deben tener RLS habilitado y políticas por `auth.uid()` (las políticas creadas en el paso anterior).
- Nunca publiques `service_role`, `sb_secret_...` ni la contraseña de la base de datos.
- La protección de páginas en JavaScript mejora la experiencia, pero la seguridad real de los datos depende de RLS en Supabase.
- Los paneles heredados aún contienen algunos bloques visuales de ejemplo; el aviso del dashboard lo indica. Usa Mis registros para guardar información real.
- Esta versión no sube archivos adjuntos ni envía recordatorios médicos. No introduzcas datos sensibles reales hasta verificar el acceso y RLS con una cuenta de prueba.
