# Instrucciones para Subir Videos a Vercel Blob Storage

## Opción 1: Desde el Dashboard de Vercel (Más Fácil)

1. **Ve al Dashboard de Vercel**
   - Accede a [vercel.com](https://vercel.com)
   - Selecciona tu proyecto "oliveros"

2. **Ve a Storage**
   - En el menú superior, haz clic en "Storage"
   - Selecciona tu store de Blob Storage

3. **Crea una Carpeta**
   - Haz clic en "Browser"
   - Crea una carpeta llamada `videos` (o el nombre que prefieras)

4. **Sube los Archivos**
   - Haz clic en "Upload" o arrastra los archivos
   - Sube todos tus videos y fotos
   - Los videos pueden ser de cualquier tamaño (80-300MB está bien)

5. **Verifica**
   - Una vez subidos, deberías verlos en la lista
   - Copia el nombre exacto de cada archivo (lo necesitarás)

## Opción 2: Desde el Código (Avanzado)

Si prefieres subir desde código, puedo crear una página de administración para subir archivos directamente.

## Configuración Necesaria

Después de subir los videos, necesitas:

1. **Store ID**: Ya lo tienes (`store_1noPrVsRhcvtAmRY`)
2. **Ruta de los archivos**: Ejemplo `videos/cab1.mp4`
3. **Actualizar el código**: Cambiar `prefix: 'videos/'` en `galeria.js` si usas otra carpeta

## Notas Importantes

- ✅ Los videos se almacenan en Vercel Blob Storage
- ✅ Streaming automático (no necesita descargar todo)
- ✅ Sin límite de tamaño por archivo
- ✅ Los archivos son públicos por defecto (puedes cambiarlo)
- ✅ El JSON de metadata se guarda automáticamente

## Estructura de Archivos

```
videos/
├── cab1.mp4
├── cab2.mp4
├── cab3.mp4
├── foto1.jpg
└── ...
```

## Próximos Pasos

1. Sube tus videos/fotos a Vercel Blob Storage
2. Accede a `/admin` en tu sitio
3. Login con usuario: `admin` / contraseña: `delfina2025`
4. Selecciona un archivo para verlo y agregar título/comentarios

