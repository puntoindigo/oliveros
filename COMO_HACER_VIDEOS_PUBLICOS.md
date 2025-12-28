# Cómo Hacer los Videos Públicos en Vercel Blob Storage

## Problema
Los videos dan error 403 (Forbidden) porque no tienen acceso público.

## Solución: Hacer los Videos Públicos

### Opción 1: Desde el Dashboard (Recomendado)

1. **Ve a Storage → Browser**
   - En el menú lateral izquierdo, haz clic en "Browser"
   - Navega a la carpeta `videos/`

2. **Selecciona cada video**
   - Haz clic en el nombre del archivo (ej: `cab1.mp4`)
   - Se abrirá un panel lateral con los detalles del archivo

3. **Cambia el acceso a "Public"**
   - Busca la opción "Access" o "Acceso"
   - Cambia de "Private" a "Public"
   - Guarda los cambios

4. **Repite para todos los videos**
   - Haz esto para cada archivo: `cab1.mp4`, `cab2.mp4`, `cab3.mp4`, etc.

### Opción 2: Usando la API (Más Rápido)

Si tienes muchos videos, puedo crear un script que los haga públicos automáticamente usando la API de Vercel Blob.

### Opción 3: Al Subir Nuevos Videos

Cuando subas nuevos videos:
1. En el diálogo de subida, busca la opción "Access"
2. Selecciona "Public" antes de subir
3. Todos los videos nuevos serán públicos automáticamente

## Verificar que Funcionó

Después de hacer los videos públicos:
1. Copia la URL de un video (debería verse en el panel de detalles)
2. Pégala en el navegador
3. Deberías poder ver el video directamente

## Nota Importante

- Los archivos públicos son accesibles por cualquiera que tenga la URL
- Si necesitas privacidad, considera usar URLs firmadas con expiración
- Para este caso (galería admin), los videos públicos están bien

