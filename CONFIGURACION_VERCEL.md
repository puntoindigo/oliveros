# Configuración de Vercel para el Admin

## Variables de Entorno Necesarias

Para que las API routes funcionen correctamente, necesitas configurar las siguientes variables de entorno en Vercel:

1. **Ve al Dashboard de Vercel**
   - Accede a tu proyecto "oliveros"
   - Ve a Settings → Environment Variables

2. **Agrega la variable:**
   - **Nombre:** `BLOB_READ_WRITE_TOKEN`
   - **Valor:** Tu token de Blob Storage (lo encuentras en Storage → Settings → Tokens)
   - **Ambiente:** Production, Preview, Development (marca los tres)

## Verificar Blob Storage

1. **Asegúrate de que los videos estén públicos:**
   - Ve a Storage → Browser
   - Selecciona cada archivo
   - Verifica que el acceso sea "public"

2. **Verifica las URLs:**
   - Los videos deben tener URLs públicas accesibles
   - Formato: `https://[store-id].public.blob.vercel-storage.com/videos/[nombre].mp4`

## Troubleshooting

### Error 403 en videos:
- Verifica que los archivos tengan acceso "public" en Blob Storage
- Verifica que las URLs se generen correctamente en el API

### Error 500 al guardar:
- Verifica que `BLOB_READ_WRITE_TOKEN` esté configurado en Vercel
- Verifica que el token tenga permisos de escritura

### Error 405:
- Las API routes deberían funcionar automáticamente con Vercel
- Verifica que los archivos estén en `/api/` y exporten `export default async function handler`

