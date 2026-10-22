# Salud en Orden — conectar a Supabase y GitHub Pages

## 1. Configura la clave publicable

Abre `supabase-config.js` y reemplaza `PEGA_AQUI_TU_CLAVE_PUBLICABLE` por la clave **Publishable** del proyecto `https://tumhcmhxmaburercohou.supabase.co`. En Supabase está en Project Settings → API Keys o Connect. Usa solo la clave publicable (`sb_publishable_...` o la clave `anon` pública legacy si ese panel la ofrece). **Nunca uses `service_role`, `sb_secret_...` ni la contraseña de la base de datos.**

## 2. Configura Authentication

En Supabase → Authentication → URL Configuration:
- Site URL: `https://gazroot.github.io/salud/`
- Redirect URLs: `https://gazroot.github.io/salud/**`

En Authentication → Sign In / Providers, habilita Email. Puedes mantener Confirm email activado.

## 3. Publica

Sube el contenido de esta carpeta `salud-main` a la raíz del repositorio GitHub `salud` (no subas solo el ZIP). Conserva los archivos HTML actualizados. En Settings → Pages, confirma que Pages publique desde la rama/carpeta que contiene `index.html`.

## 4. Archivos principales
- `login.html`: registro, inicio de sesión y solicitud de recuperación.
- `recuperar-clave.html`: establece nueva contraseña tras el enlace de correo.
- `supabase-config.js`: URL y clave publicable.
- `auth.js`: protege las páginas principales con sesión Supabase.
- `app.js`: CRUD de medidas, citas, medicamentos, órdenes y perfil usando Supabase.

## 5. Tablas esperadas
`perfiles`, `medidas_salud`, `citas`, `medicamentos`, `ordenes_salud`. Este proyecto espera las columnas creadas en el SQL inicial de Salud en Orden y RLS activado. Cada tabla de registros debe tener `usuario_id` con `default auth.uid()` y las políticas RLS que limitan las filas al usuario autenticado.

## 6. Prueba segura
1. Abre `https://gazroot.github.io/salud/login.html`.
2. Registra una cuenta con un correo que controles y confirma el correo si se solicita.
3. Inicia sesión.
4. Crea una medida de prueba sin información médica real, recarga y verifica que aparezca.
5. Abre la misma URL en otro dispositivo e inicia sesión con la misma cuenta.
6. Verifica que solo aparezcan tus registros.

## Nota importante
Las páginas HTML originales contienen tarjetas de demostración estáticas que forman parte del diseño. Las secciones añadidas con el título “Mis datos guardados en la nube” o similares sí leen/escriben en Supabase. Antes de usar datos de salud reales, verifica RLS, autenticación, recuperación de contraseña y privacidad. Los documentos adjuntos aún no se suben a Storage; esta versión guarda sus metadatos.


Nota de esta revisión: las páginas medicamento.html y autorizaciones.html se limpiaron de datos de demostración. Sus listas y formularios los genera app.js usando las tablas medicamentos y ordenes_salud de Supabase.
