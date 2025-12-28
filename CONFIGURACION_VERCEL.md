# Configuración de Vercel para el Admin

## Conexión del Proyecto al Blob Store

**IMPORTANTE:** El token se configura automáticamente cuando conectas el proyecto al Blob Store. No necesitas buscarlo manualmente.

### Pasos para Conectar el Proyecto:

1. **Ve al Dashboard de Vercel**
   - Accede a tu proyecto "oliveros"
   - Ve a la pestaña **"Storage"** (en el menú superior)

2. **Selecciona tu Blob Store**
   - Haz clic en tu store "oliverovideos" (o el nombre que tenga)

3. **Ve a la pestaña "Projects"** (en el menú lateral izquierdo)
   - Aquí deberías ver tu proyecto "oliveros" listado
   - Si NO aparece, necesitas conectarlo:
     - Haz clic en "Connect Project" o similar
     - Selecciona el proyecto "oliveros"
     - Esto creará automáticamente la variable `BLOB_READ_WRITE_TOKEN`

4. **Verifica la Conexión:**
   - En la página del store, ve a "Projects"
   - Deberías ver "oliveros" con "BLOB_READ_WRITE_TOKEN" en la columna "Info"
   - Los ambientes deberían mostrar: Production, Preview, Development

### Si el Token NO se Genera Automáticamente:

Si después de conectar el proyecto aún tienes errores, puedes crear el token manualmente:

1. Ve a Storage → tu store → Settings
2. Busca la sección "Tokens" o "API Keys"
3. Crea un nuevo token con permisos de lectura/escritura
4. Copia el token y agrégalo como variable de entorno en tu proyecto:
   - Proyecto → Settings → Environment Variables
   - Nombre: `BLOB_READ_WRITE_TOKEN`
   - Valor: [pega el token]
   - Ambientes: Production, Preview, Development

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

