# Instrucciones para Recrear el Blob Store

## ⚠️ ADVERTENCIA
**Esto eliminará TODOS los videos y archivos del store actual.**
Asegúrate de tener backups si necesitas los videos después.

## Pasos Rápidos

### 1. Eliminar el Store Actual

1. Ve a Vercel Dashboard → Storage
2. Selecciona tu store "oliverovideos"
3. Ve a Settings (en el menú lateral)
4. Desplázate hasta el final de la página
5. Busca la sección "Danger Zone" o "Zona de Peligro"
6. Haz clic en "Delete Store" o "Eliminar Store"
7. Confirma la eliminación

### 2. Crear un Nuevo Store

1. En Storage, haz clic en "Create" o "Crear"
2. Selecciona "Blob Store"
3. Nombre: `oliverovideos` (o el que prefieras)
4. Región: IAD1 (o la más cercana)
5. Haz clic en "Create"

### 3. Conectar el Proyecto

1. En el nuevo store, ve a "Projects"
2. Haz clic en "Connect Project"
3. Selecciona "oliveros"
4. Esto creará automáticamente `BLOB_READ_WRITE_TOKEN`

### 4. Subir Videos Nuevamente

1. Ve a Browser → videos/
2. Sube los videos nuevamente
3. **IMPORTANTE:** Al subir, asegúrate de seleccionar "Public" en la opción de acceso
4. O usa el botón "Hacer Videos Públicos" después de subirlos

## Alternativa Más Rápida (Sin Perder Videos)

Si prefieres NO perder los videos, puedes:

1. **Eliminar solo los archivos más grandes:**
   - Usa el botón "Limpiar Store" en el admin
   - Identifica los archivos más grandes
   - Elimínalos manualmente desde Storage → Browser

2. **Comprimir videos antes de subirlos:**
   - Los videos grandes (196MB, 178MB) pueden comprimirse
   - Usa herramientas como HandBrake o FFmpeg
   - Reduce calidad/resolución si es necesario

## Después de Recrear

1. El store debería mostrar 0 GB inmediatamente
2. Los videos deberían funcionar correctamente
3. El admin debería funcionar sin cambios (solo cambia el store)

## Nota

Si recreas el store, el código seguirá funcionando porque:
- Las rutas de API no cambian
- Solo cambia el store ID (que se maneja automáticamente)
- El token se regenera automáticamente

