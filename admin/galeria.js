// Configuración
const METADATA_FILE = 'galeria-metadata.json';

// Verificar autenticación
if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = '/admin/index.html';
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminUser');
        window.location.href = '/admin/index.html';
    });
}

// Botones de Blob Storage eliminados - solo usamos YouTube

// Estado
let archivos = [];
let metadata = {};
let archivoActual = null;

// Cargar archivos desde YouTube
async function cargarArchivos() {
    try {
        // PRIMERO: Intentar cargar desde YouTube (fuente principal)
        const youtubeResponse = await fetch('/api/youtube-videos');
        
        if (youtubeResponse.ok) {
            const youtubeData = await youtubeResponse.json();
            
            // Si YouTube está configurado y tiene videos, usarlo
            if (youtubeData.videos && youtubeData.videos.length > 0) {
                console.log('✅ Cargando videos desde YouTube:', youtubeData.videos.length);
                // Convertir videos de YouTube al formato esperado
                archivos = youtubeData.videos.map(video => ({
                    pathname: `youtube/${video.videoId}`,
                    url: video.embedUrl,
                    videoId: video.videoId,
                    title: video.title,
                    thumbnail: video.thumbnail,
                    esYoutube: true
                }));
                
                await cargarMetadata();
                mostrarArchivos();
                return;
            }
            
            // Si YouTube no está configurado, mostrar mensaje
            if (youtubeData.configuracionNecesaria) {
                document.getElementById('archivosList').innerHTML = 
                    `<p class="error">
                        ⚠️ YouTube no está configurado<br><br>
                        ${youtubeData.mensaje || 'Configura YouTube para usar los videos'}<br><br>
                        💡 <strong>Instrucciones:</strong><br>
                        ${(youtubeData.instrucciones || []).join('<br>')}<br><br>
                        Ver detalles en CONFIGURAR_YOUTUBE.md
                    </p>`;
                return;
            }
        }
        
        // Si YouTube falló completamente, mostrar error
        console.error('❌ Error cargando desde YouTube');
        document.getElementById('archivosList').innerHTML = 
            `<p class="error">
                ⚠️ Error cargando videos desde YouTube<br><br>
                Verifica la configuración en Vercel:<br>
                • YOUTUBE_API_KEY<br>
                • YOUTUBE_PLAYLIST_ID<br><br>
                <strong>Ver detalles en CONFIGURAR_YOUTUBE.md</strong>
            </p>`;
        return;
    } catch (error) {
        console.error('Error cargando archivos:', error);
        document.getElementById('archivosList').innerHTML = 
            `<p class="error">
                ❌ Error cargando videos: ${error.message}<br><br>
                💡 <strong>Verifica la configuración de YouTube:</strong><br>
                • YOUTUBE_API_KEY está configurada en Vercel<br>
                • YOUTUBE_PLAYLIST_ID está configurada en Vercel<br>
                • Has hecho redeploy después de agregar las variables<br><br>
                <strong>Ver instrucciones en CONFIGURAR_YOUTUBE.md</strong>
            </p>`;
    }
}

// Cargar metadata (títulos y comentarios) desde localStorage
async function cargarMetadata() {
    try {
        const savedMetadata = localStorage.getItem('galeria-metadata');
        if (savedMetadata) {
            metadata = JSON.parse(savedMetadata);
        } else {
            metadata = {};
        }
    } catch (error) {
        console.error('Error cargando metadata:', error);
        metadata = {};
    }
}

// Guardar metadata en localStorage
async function guardarMetadata() {
    try {
        localStorage.setItem('galeria-metadata', JSON.stringify(metadata));
        mostrarEstado('success', 'Cambios guardados correctamente');
    } catch (error) {
        console.error('Error guardando metadata:', error);
        mostrarEstado('error', `Error al guardar: ${error.message}. Intenta nuevamente.`);
    }
}

// Mostrar lista de archivos
function mostrarArchivos() {
    const container = document.getElementById('archivosList');
    
    if (archivos.length === 0) {
        container.innerHTML = '<p>No hay videos disponibles. Agrega videos a tu playlist de YouTube.</p>';
        return;
    }
    
    container.innerHTML = archivos.map((archivo, index) => {
        // Para YouTube, usar el título del video o el título personalizado
        const meta = metadata[archivo.pathname] || {};
        const displayTitle = meta.titulo || archivo.title || archivo.pathname.split('/').pop();
        const tipo = archivo.esYoutube ? 'Video' : (archivo.pathname.split('.').pop().toLowerCase() === 'jpg' || archivo.pathname.split('.').pop().toLowerCase() === 'png' ? 'Imagen' : 'Video');
        
        return `
            <div class="archivo-item" data-index="${index}" data-path="${archivo.pathname}">
                <div class="archivo-item-name">${displayTitle}</div>
                <div class="archivo-item-tipo">${tipo}</div>
            </div>
        `;
    }).join('');
    
    // Agregar event listeners
    document.querySelectorAll('.archivo-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            seleccionarArchivo(index);
        });
    });
}

// Seleccionar archivo
function seleccionarArchivo(index) {
    archivoActual = archivos[index];
    
    // Actualizar UI
    document.querySelectorAll('.archivo-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    
    // Mostrar editor
    document.getElementById('noSelection').style.display = 'none';
    document.getElementById('editorContainer').style.display = 'block';
    
    // Cargar datos
    const meta = metadata[archivoActual.pathname] || {};
    const displayName = archivoActual.title || archivoActual.pathname.split('/').pop();
    const nombreSinExtension = displayName.replace(/\.[^/.]+$/, ''); // Remover extensión si tiene
    
    document.getElementById('archivoNombre').textContent = displayName;
    document.getElementById('archivoTitulo').value = meta.titulo || nombreSinExtension;
    document.getElementById('archivoComentarios').value = meta.comentarios || '';
    
    // Cargar media - YouTube o archivo normal
    if (archivoActual.esYoutube && archivoActual.videoId) {
        // Video de YouTube
        document.getElementById('videoContainer').style.display = 'block';
        document.getElementById('imageContainer').style.display = 'none';
        document.getElementById('videoPlayer').style.display = 'none';
        
        const youtubeContainer = document.getElementById('youtubeContainer');
        youtubeContainer.innerHTML = `
            <iframe 
                width="100%" 
                height="500" 
                src="https://www.youtube.com/embed/${archivoActual.videoId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    } else {
        // Archivo normal (video o imagen)
        const url = archivoActual.url;
        const tipo = archivoActual.pathname.split('.').pop().toLowerCase();
        const esVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(tipo);
        
        if (esVideo) {
            document.getElementById('videoContainer').style.display = 'block';
            document.getElementById('imageContainer').style.display = 'none';
            document.getElementById('youtubeContainer').innerHTML = '';
            const videoPlayer = document.getElementById('videoPlayer');
            videoPlayer.style.display = 'block';
            videoPlayer.src = url;
            videoPlayer.load();
        } else {
            document.getElementById('videoContainer').style.display = 'none';
            document.getElementById('imageContainer').style.display = 'block';
            document.getElementById('imagePreview').src = url;
        }
    }
}

// Guardar cambios
document.getElementById('saveBtn').addEventListener('click', async () => {
    if (!archivoActual) return;
    
    const titulo = document.getElementById('archivoTitulo').value.trim();
    const comentarios = document.getElementById('archivoComentarios').value.trim();
    
    // Si el título está vacío, usar nombre sin extensión
    const nombreArchivo = archivoActual.pathname.split('/').pop();
    const nombreSinExtension = nombreArchivo.replace(/\.[^/.]+$/, '');
    const tituloFinal = titulo || nombreSinExtension;
    
    metadata[archivoActual.pathname] = {
        titulo: tituloFinal,
        comentarios,
        fechaActualizacion: new Date().toISOString()
    };
    
    mostrarEstado('saving', 'Guardando...');
    await guardarMetadata();
    mostrarArchivos(); // Refrescar lista
});

function mostrarEstado(tipo, mensaje) {
    const status = document.getElementById('saveStatus');
    status.className = `save-status ${tipo}`;
    status.textContent = mensaje;
    
    if (tipo === 'success') {
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }
}

// Inicializar
cargarArchivos();

