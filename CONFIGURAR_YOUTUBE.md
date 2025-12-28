# Configurar YouTube para los Videos

## Ventajas de Usar YouTube

✅ **Gratis e ilimitado** - Sin límites de almacenamiento  
✅ **Streaming automático** - Optimizado para web  
✅ **Sin problemas de espacio** - YouTube maneja todo  
✅ **Fácil de usar** - Solo subes y listo  

## Pasos para Configurar

### 1. Crear una Playlist en YouTube

1. Ve a [YouTube](https://youtube.com)
2. Haz clic en tu perfil → **YouTube Studio**
3. Ve a **Content** → **Playlists**
4. Crea una nueva playlist (ej: "Cabañas La Delfina - Videos")
5. **Copia el ID de la playlist** de la URL:
   - Ejemplo: `https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxx`
   - El ID es: `PLxxxxxxxxxxxxx`

### 2. Subir Videos a la Playlist

1. Sube tus videos a YouTube normalmente
2. Al subir cada video, agrégalo a la playlist que creaste
3. O después de subir, ve a la playlist y agrega los videos

### 3. Obtener API Key de YouTube

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Habilita **YouTube Data API v3**:
   - Ve a "APIs & Services" → "Library"
   - Busca "YouTube Data API v3"
   - Haz clic en "Enable"
4. Crea una API Key:
   - Ve a "APIs & Services" → "Credentials"
   - Haz clic en "Create Credentials" → "API Key"
   - Copia la API Key

### 4. Configurar en Vercel

1. Ve a Vercel Dashboard → tu proyecto "oliveros"
2. Ve a **Settings** → **Environment Variables**
3. Agrega:
   - **Nombre:** `YOUTUBE_API_KEY`
   - **Valor:** [Pega tu API Key]
   - **Ambientes:** Production, Preview, Development

### 5. Configurar en el Código

Edita `/api/youtube-videos.js` y cambia:
```javascript
const { playlistId } = req.query;
```

Por:
```javascript
const playlistId = 'TU_PLAYLIST_ID_AQUI'; // Tu ID de playlist
```

O mejor aún, agrega otra variable de entorno:
- **Nombre:** `YOUTUBE_PLAYLIST_ID`
- **Valor:** [Tu ID de playlist]

## Alternativa: Usar Canal en Lugar de Playlist

Si prefieres usar todos los videos de tu canal:

1. Obtén tu **Channel ID**:
   - Ve a YouTube Studio → Settings → Channel
   - Copia el Channel ID
2. En el código, usa `channelId` en lugar de `playlistId`

## Actualizar el Admin

Después de configurar, el admin automáticamente:
- Listará todos los videos de tu playlist/canal
- Los mostrará con el reproductor de YouTube
- Mantendrá los títulos y comentarios (guardados localmente)

## Notas Importantes

- Los videos deben ser **públicos** o **no listados** (no privados)
- La API Key tiene límites gratuitos (10,000 unidades/día) - suficiente para uso normal
- Los títulos y comentarios se guardan localmente, no en YouTube
- Puedes editar títulos/comentarios desde el admin normalmente

