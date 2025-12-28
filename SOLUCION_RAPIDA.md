# Solución Rápida: Desbloquear el Store

## Problema
Vercel muestra "Cannot create another store when usage threshold limit is reached" porque el límite es por **cuenta**, no por store individual.

## Solución Inmediata

### Opción 1: Eliminar Archivos Grandes (Recomendado)

1. **Ve al Admin:**
   - `tu-sitio.vercel.app/admin`
   - Haz login

2. **Haz clic en "Limpiar Store"** (botón naranja)

3. **Revisa el análisis:**
   - Verás los archivos más grandes
   - Te sugerirá eliminar archivos >100MB

4. **Confirma la eliminación:**
   - Se eliminarán automáticamente los archivos grandes
   - Esto liberará espacio inmediatamente

5. **Espera 2-5 minutos:**
   - Vercel necesita actualizar el espacio usado
   - Recarga la página del store en Vercel Dashboard
   - Debería mostrar menos de 1 GB

### Opción 2: Eliminar Manualmente desde Vercel

1. Ve a Storage → Browser → videos/
2. Haz clic en cada archivo grande:
   - `cab4-grande.mp4` (196 MB)
   - `cab3.mp4` (178 MB)
   - `cab2.mp4` (128 MB)
   - `cab5.mp4` (107 MB)
3. Haz clic en "Delete" o el ícono de basura
4. Confirma la eliminación

### Opción 3: Contactar Soporte de Vercel

Si ninguna opción funciona:

1. Ve a [vercel.com/support](https://vercel.com/support)
2. Explica que:
   - Eliminaste un store pero el espacio no se liberó
   - Necesitas que liberen el espacio manualmente
   - Menciona que es urgente

## Verificar que Funcionó

1. Ve a Storage → tu store
2. Revisa "Storage (average)"
3. Debería mostrar menos de "1 GB / 1 GB"
4. El store debería desbloquearse automáticamente

## Prevenir en el Futuro

1. **Comprime videos antes de subirlos:**
   - Usa HandBrake o FFmpeg
   - Reduce calidad/resolución si es necesario
   - Objetivo: videos <50MB cada uno

2. **Elimina videos antiguos regularmente:**
   - Usa el botón "Limpiar Store" periódicamente
   - Mantén solo los videos necesarios

3. **Considera actualizar el plan:**
   - Plan Pro ($20/mes) incluye más almacenamiento
   - O paga solo por el almacenamiento adicional

