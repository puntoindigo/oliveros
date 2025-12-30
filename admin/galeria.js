// Configuración
const METADATA_FILE = 'galeria-metadata.json';
const VIDEOS_FOLDER = '/admin/videos/';

// Lista estática de videos (se actualiza manualmente si se agregan nuevos)
const VIDEOS_LIST = [
    'cab1.mp4',
    'cab2.mp4',
    'cab3.mp4',
    'cab4-grande.mp4',
    'cab5.mp4',
    'deposito.mp4',
    'material.mp4',
    'quincho.mp4',
    'recorrida.mp4'
];

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

// Estado
let archivos = [];
let metadata = {};
let archivoActual = null;
let fotosSubidas = []; // Array de fotos subidas para el archivo actual

// Cargar archivos locales estáticos
async function cargarArchivos() {
    try {
        // Convertir lista de videos al formato esperado
        // Intentar primero con ruta directa, luego con API como fallback
        archivos = VIDEOS_LIST.map(filename => ({
            pathname: `videos/${filename}`,
            url: `${VIDEOS_FOLDER}${filename}`,
            apiUrl: `/api/video?filename=${encodeURIComponent(filename)}`,
            filename: filename,
            nombreSinExtension: filename.replace(/\.[^/.]+$/, '')
        }));
        
        console.log('📹 Videos cargados:', archivos.length);
        console.log('📹 URLs de videos:', archivos.map(a => a.url));
        
        await cargarMetadata();
        mostrarArchivos();
    } catch (error) {
        console.error('Error cargando archivos:', error);
        document.getElementById('archivosList').innerHTML = 
            `<p class="error">
                ❌ Error cargando videos: ${error.message}
            </p>`;
    }
}

// Cargar metadata desde API (lee del JSON estático)
async function cargarMetadata() {
    try {
        const response = await fetch('/api/metadata');
        if (response.ok) {
            const jsonData = await response.json();
            metadata = jsonData;
            console.log('✅ Metadata cargada desde JSON');
        } else {
            console.log('ℹ️ No se encontró metadata, iniciando vacío');
            metadata = {};
        }
    } catch (error) {
        console.error('Error cargando metadata:', error);
        metadata = {};
    }
}

// Guardar metadata directamente en el JSON usando API
async function guardarMetadata() {
    try {
        const response = await fetch('/api/metadata', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadata)
        });

        if (response.ok) {
            const result = await response.json();
            mostrarEstado('success', '✅ Cambios guardados correctamente');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.details || errorData.mensaje || 'Error al guardar');
        }
    } catch (error) {
        console.error('Error guardando metadata:', error);
        mostrarEstado('error', `Error al guardar: ${error.message}. Verifica que GITHUB_TOKEN esté configurado en Vercel.`);
    }
}


// Mostrar lista de archivos
function mostrarArchivos() {
    const container = document.getElementById('archivosList');
    
    if (archivos.length === 0) {
        container.innerHTML = '<p>No hay videos disponibles.</p>';
        console.warn('⚠️ No hay videos en la lista');
        return;
    }
    
    console.log('📋 Mostrando', archivos.length, 'videos en la lista');
    
    container.innerHTML = archivos.map((archivo, index) => {
        const meta = metadata[archivo.pathname] || {};
        const displayTitle = meta.titulo || archivo.nombreSinExtension;
        
        return `
            <div class="archivo-item" data-index="${index}" data-path="${archivo.pathname}">
                <div class="archivo-item-name">${displayTitle}</div>
                <div class="archivo-item-tipo">Video</div>
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
    
    console.log('✅ Lista de videos renderizada');
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
    const nombreSinExtension = archivoActual.nombreSinExtension;
    
    document.getElementById('archivoNombre').textContent = archivoActual.filename;
    document.getElementById('archivoTitulo').value = meta.titulo || nombreSinExtension;
    document.getElementById('archivoComentarios').value = meta.comentarios || '';
    
    // Cargar fotos
    fotosSubidas = Array.isArray(meta.fotos) ? meta.fotos : [];
    console.log('📸 Fotos cargadas para', archivoActual.pathname, ':', fotosSubidas.length);
    mostrarFotos();
    
    // Cargar video
    document.getElementById('videoContainer').style.display = 'block';
    document.getElementById('imageContainer').style.display = 'none';
    
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.style.display = 'block';
    
    let errorShown = false;
    let usingApiRoute = false;
    
    // Manejar errores de forma silenciosa si ya estamos usando la API route
    videoPlayer.addEventListener('error', (e) => {
        // Solo mostrar error si no estamos usando la API route aún
        if (!usingApiRoute && !errorShown) {
            const errorCode = videoPlayer.error?.code;
            const errorMessage = videoPlayer.error?.message || '';
            
            // Ignorar errores de demuxer si el video se está cargando desde API
            if (errorMessage.includes('DEMUXER_ERROR') || errorMessage.includes('Could not open')) {
                // Intentar con API route inmediatamente
                console.log('⚠️ Video directo no disponible, usando API route');
                usingApiRoute = true;
                videoPlayer.src = archivoActual.apiUrl;
                videoPlayer.load();
                return;
            }
            
            // Solo mostrar errores críticos
            if (errorCode === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
                console.error('❌ Formato de video no soportado:', archivoActual.url);
                mostrarEstado('error', 'Formato de video no soportado');
                errorShown = true;
            }
        }
    }, { once: false });
    
    videoPlayer.addEventListener('loadstart', () => {
        console.log('🔄 Iniciando carga del video:', usingApiRoute ? archivoActual.apiUrl : archivoActual.url);
    });
    
    videoPlayer.addEventListener('canplay', () => {
        console.log('✅ Video listo para reproducir');
        errorShown = false; // Resetear flag si el video se carga correctamente
    });
    
    // Intentar primero con la API route directamente (más confiable con Git LFS)
    // Si prefieres intentar primero la ruta directa, cambia el orden
    videoPlayer.src = archivoActual.apiUrl;
    usingApiRoute = true;
    videoPlayer.load();
}

// Guardar cambios
document.getElementById('saveBtn').addEventListener('click', async () => {
    if (!archivoActual) return;
    
    const titulo = document.getElementById('archivoTitulo').value.trim();
    const comentarios = document.getElementById('archivoComentarios').value.trim();
    
    // Actualizar comentarios de fotos desde los textareas
    const fotoItems = document.querySelectorAll('.foto-item');
    fotoItems.forEach((item, index) => {
        const textarea = item.querySelector('.foto-comentario');
        if (textarea && fotosSubidas[index]) {
            fotosSubidas[index].comentario = textarea.value.trim();
        }
    });
    
    const nombreSinExtension = archivoActual.nombreSinExtension;
    const tituloFinal = titulo || nombreSinExtension;
    
    metadata[archivoActual.pathname] = {
        titulo: tituloFinal,
        comentarios,
        fotos: fotosSubidas,
        fechaActualizacion: new Date().toISOString()
    };
    
    mostrarEstado('saving', 'Guardando...');
    await guardarMetadata();
    mostrarArchivos(); // Refrescar lista
});

function mostrarEstado(tipo, mensaje) {
    // Crear toast notification si no existe
    let toast = document.getElementById('toastNotification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotification';
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: #2c5530;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-size: 1rem;
            font-weight: 500;
            opacity: 0;
            transition: all 0.3s ease;
            max-width: 90%;
            text-align: center;
        `;
        document.body.appendChild(toast);
    }
    
    // Actualizar contenido y estilo según el tipo
    toast.textContent = mensaje;
    
    if (tipo === 'success') {
        toast.style.background = '#2c5530';
        toast.style.color = 'white';
    } else if (tipo === 'error') {
        toast.style.background = '#c62828';
        toast.style.color = 'white';
    } else if (tipo === 'saving') {
        toast.style.background = '#ff9800';
        toast.style.color = 'white';
    }
    
    // Mostrar toast con animación
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    
    // Ocultar después de 3 segundos (solo para success)
    if (tipo === 'success') {
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-100px)';
        }, 3000);
    } else if (tipo === 'saving') {
        // Mantener visible mientras guarda
    } else {
        // Para errores, mantener visible más tiempo
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-100px)';
        }, 4000);
    }
    
    // También mostrar en el status del formulario
    const status = document.getElementById('saveStatus');
    if (status) {
        status.className = `save-status ${tipo}`;
        status.textContent = mensaje;
        status.style.display = 'block';
        
        if (tipo === 'success') {
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
        }
    }
}

// Inicializar drag & drop para fotos
function inicializarDragDrop() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    
    if (!dropZone || !fileInput) {
        console.warn('⚠️ Drop zone o file input no encontrados');
        return;
    }
    
    console.log('✅ Drag & drop inicializado');
    
    // Click en drop zone
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Selección de archivos
    fileInput.addEventListener('change', (e) => {
        manejarArchivos(e.target.files);
    });
    
    // Drag over
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    // Drag leave
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    // Drop
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        manejarArchivos(e.dataTransfer.files);
    });
}

// Manejar archivos seleccionados/arrastrados
async function manejarArchivos(files) {
    if (!archivoActual) {
        mostrarEstado('error', 'Por favor selecciona un archivo primero');
        return;
    }
    
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        mostrarEstado('error', 'Por favor selecciona solo archivos de imagen');
        return;
    }
    
    mostrarEstado('saving', `Subiendo ${imageFiles.length} foto(s)...`);
    
    const fotosSubidasAntes = fotosSubidas.length;
    
    for (const file of imageFiles) {
        try {
            console.log('📤 Subiendo foto:', file.name);
            const fotoData = await subirFoto(file);
            console.log('✅ Foto subida:', fotoData);
            
            fotosSubidas.push({
                id: Date.now() + Math.random(),
                nombre: file.name,
                url: fotoData.url,
                path: fotoData.path,
                comentario: '',
                fechaSubida: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error subiendo foto:', error);
            mostrarEstado('error', `Error subiendo ${file.name}: ${error.message}`);
        }
    }
    
    console.log('📸 Fotos subidas:', fotosSubidas.length, 'Total antes:', fotosSubidasAntes);
    
    // Actualizar metadata
    if (archivoActual) {
        metadata[archivoActual.pathname] = {
            ...metadata[archivoActual.pathname],
            fotos: fotosSubidas
        };
    }
    
    // Mostrar fotos
    mostrarFotos();
    
    // Guardar automáticamente después de subir
    if (archivoActual && fotosSubidas.length > fotosSubidasAntes) {
        await guardarMetadata();
        mostrarEstado('success', `${imageFiles.length} foto(s) subida(s) correctamente`);
    }
}

// Subir foto a GitHub
async function subirFoto(file) {
    // Convertir archivo a base64
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result.split(',')[1]; // Remover data:image/...;base64,
            
            const response = await fetch('/api/upload-foto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    file: base64,
                    fileName: file.name,
                    fileType: file.type,
                    archivoPath: archivoActual.pathname
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                reject(new Error(errorData.details || errorData.mensaje || 'Error al subir foto'));
                return;
            }
            
            resolve(await response.json());
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Mostrar fotos en la lista
function mostrarFotos() {
    const fotosList = document.getElementById('fotosList');
    if (!fotosList) {
        console.error('❌ No se encontró el contenedor fotosList');
        return;
    }
    
    console.log('🖼️ Mostrando fotos:', fotosSubidas.length);
    
    if (fotosSubidas.length === 0) {
        fotosList.innerHTML = '';
        return;
    }
    
    fotosList.innerHTML = fotosSubidas.map((foto, index) => {
        const comentarioEscapado = (foto.comentario || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        return `
        <div class="foto-item" data-index="${index}">
            <div class="foto-preview">
                <img src="${foto.url}" alt="${foto.nombre}" onerror="console.error('Error cargando imagen:', '${foto.url}'); this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3EImagen%3C/text%3E%3C/svg%3E'">
                <button class="btn-delete-foto" onclick="eliminarFoto(${index})" title="Eliminar foto">×</button>
            </div>
            <div class="foto-info">
                <p class="foto-nombre">${foto.nombre}</p>
                <textarea 
                    class="foto-comentario" 
                    placeholder="Comentario sobre esta foto..."
                    oninput="actualizarComentarioFoto(${index}, this.value)"
                >${comentarioEscapado}</textarea>
            </div>
        </div>
    `;
    }).join('');
    
    console.log('✅ Fotos renderizadas en el DOM');
}

// Actualizar comentario de una foto
window.actualizarComentarioFoto = function(index, comentario) {
    console.log('📝 Actualizando comentario de foto', index, comentario);
    if (fotosSubidas[index]) {
        fotosSubidas[index].comentario = comentario;
        if (archivoActual) {
            metadata[archivoActual.pathname] = {
                ...metadata[archivoActual.pathname],
                fotos: fotosSubidas
            };
        }
    }
};

// Eliminar foto
window.eliminarFoto = async function(index) {
    if (!confirm('¿Estás seguro de eliminar esta foto?')) return;
    
    const foto = fotosSubidas[index];
    if (!foto) return;
    
    try {
        // Eliminar del servidor
        const response = await fetch('/api/delete-foto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ path: foto.path })
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar foto del servidor');
        }
        
        // Eliminar del array local
        fotosSubidas.splice(index, 1);
        mostrarFotos();
        
        // Guardar cambios
        if (archivoActual) {
            metadata[archivoActual.pathname] = {
                ...metadata[archivoActual.pathname],
                fotos: fotosSubidas
            };
            await guardarMetadata();
            mostrarEstado('success', 'Foto eliminada correctamente');
        }
    } catch (error) {
        console.error('Error eliminando foto:', error);
        mostrarEstado('error', `Error al eliminar foto: ${error.message}`);
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        cargarArchivos();
        inicializarDragDrop();
    });
} else {
    cargarArchivos();
    inicializarDragDrop();
}
