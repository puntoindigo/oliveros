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
let layoutActual = 'small'; // Layout por defecto: small, list, large

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
    
    // Remover listeners anteriores para evitar duplicados
    const canplayHandler = () => {
        console.log('✅ Video listo para reproducir');
        errorShown = false; // Resetear flag si el video se carga correctamente
    };
    
    // Remover listener anterior si existe
    videoPlayer.removeEventListener('canplay', canplayHandler);
    videoPlayer.addEventListener('canplay', canplayHandler, { once: true });
    
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
    // Verificar tamaño del archivo (máximo 10MB para evitar problemas)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        throw new Error(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). El tamaño máximo es 10MB.`);
    }
    
    // Convertir archivo a base64
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
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
                    // Manejar diferentes tipos de errores
                    if (response.status === 413) {
                        throw new Error('El archivo es demasiado grande. Intenta con una imagen más pequeña o comprímela antes de subirla.');
                    }
                    
                    let errorMessage = 'Error al subir foto';
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.details || errorData.mensaje || errorMessage;
                    } catch (e) {
                        // Si no se puede parsear el JSON, usar el status text
                        errorMessage = `Error ${response.status}: ${response.statusText}`;
                    }
                    throw new Error(errorMessage);
                }
                
                resolve(await response.json());
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsDataURL(file);
    });
}

// Obtener nombre legible para la foto
function obtenerNombreLegible(foto, index) {
    // Si es una captura, mostrar "Captura" con número
    if (foto.nombre.startsWith('captura_')) {
        return `Captura ${index + 1}`;
    }
    // Si tiene extensión, quitarla
    const nombreSinExtension = foto.nombre.replace(/\.[^/.]+$/, '');
    // Limpiar caracteres especiales y guiones
    return nombreSinExtension.replace(/[_-]/g, ' ').trim() || `Foto ${index + 1}`;
}

// Mostrar fotos en la lista según el layout actual
function mostrarFotos() {
    const fotosList = document.getElementById('fotosList');
    if (!fotosList) {
        console.error('❌ No se encontró el contenedor fotosList');
        return;
    }
    
    console.log('🖼️ Mostrando fotos:', fotosSubidas.length, 'Layout:', layoutActual);
    
    // Actualizar clase del contenedor según el layout
    fotosList.className = `fotos-list fotos-layout-${layoutActual}`;
    
    if (fotosSubidas.length === 0) {
        fotosList.innerHTML = '';
        return;
    }
    
    if (layoutActual === 'small') {
        // Layout pequeño: fotos chicas con descripción acotada y posibilidad de ampliar
        fotosList.innerHTML = fotosSubidas.map((foto, index) => {
            const comentarioEscapado = (foto.comentario || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            const nombreLegible = obtenerNombreLegible(foto, index);
            const comentarioPreview = (foto.comentario || '').substring(0, 50) + ((foto.comentario || '').length > 50 ? '...' : '');
            return `
            <div class="foto-item foto-item-small" data-index="${index}">
                <div class="foto-preview-small" onclick="ampliarFoto(${index})">
                    <img src="${foto.url}" alt="${nombreLegible}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3EImagen%3C/text%3E%3C/svg%3E'">
                    <button class="btn-delete-foto" onclick="event.stopPropagation(); eliminarFoto(${index})" title="Eliminar foto">×</button>
                </div>
                <div class="foto-info-small">
                    <p class="foto-nombre-small" title="${nombreLegible}">${nombreLegible.length > 20 ? nombreLegible.substring(0, 20) + '...' : nombreLegible}</p>
                    <p class="foto-comentario-preview">${comentarioPreview || 'Sin notas'}</p>
                    <textarea 
                        class="foto-comentario-small" 
                        placeholder="Notas"
                        oninput="actualizarComentarioFoto(${index}, this.value)"
                        onclick="event.stopPropagation()"
                    >${comentarioEscapado}</textarea>
                </div>
            </div>
        `;
        }).join('');
    } else if (layoutActual === 'list') {
        // Layout lista: tipo Windows
        fotosList.innerHTML = fotosSubidas.map((foto, index) => {
            const comentarioEscapado = (foto.comentario || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            const nombreLegible = obtenerNombreLegible(foto, index);
            return `
            <div class="foto-item foto-item-list" data-index="${index}">
                <div class="foto-preview-list">
                    <img src="${foto.url}" alt="${nombreLegible}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3EImagen%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="foto-info-list">
                    <div class="foto-header-list">
                        <p class="foto-nombre-list">${nombreLegible}</p>
                        <button class="btn-delete-foto-list" onclick="eliminarFoto(${index})" title="Eliminar foto">×</button>
                    </div>
                    <textarea 
                        class="foto-comentario-list" 
                        placeholder="Notas"
                        oninput="actualizarComentarioFoto(${index}, this.value)"
                    >${comentarioEscapado}</textarea>
                </div>
            </div>
        `;
        }).join('');
    } else {
        // Layout grande: como estaba antes
        fotosList.innerHTML = fotosSubidas.map((foto, index) => {
            const comentarioEscapado = (foto.comentario || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            const nombreLegible = obtenerNombreLegible(foto, index);
            return `
            <div class="foto-item foto-item-large" data-index="${index}">
                <div class="foto-preview">
                    <img src="${foto.url}" alt="${nombreLegible}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3EImagen%3C/text%3E%3C/svg%3E'">
                    <button class="btn-delete-foto" onclick="eliminarFoto(${index})" title="Eliminar foto">×</button>
                </div>
                <div class="foto-info">
                    <p class="foto-nombre">${nombreLegible}</p>
                    <textarea 
                        class="foto-comentario" 
                        placeholder="Notas"
                        oninput="actualizarComentarioFoto(${index}, this.value)"
                    >${comentarioEscapado}</textarea>
                </div>
            </div>
        `;
        }).join('');
    }
    
    console.log('✅ Fotos renderizadas en el DOM');
}

// Cambiar layout
function cambiarLayout(layout) {
    layoutActual = layout;
    
    // Actualizar botones activos
    document.querySelectorAll('.layout-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.layout === layout);
    });
    
    // Re-renderizar fotos
    mostrarFotos();
}

// Ampliar foto (modal)
window.ampliarFoto = function(index) {
    const foto = fotosSubidas[index];
    if (!foto) return;
    
    // Crear modal si no existe
    let modal = document.getElementById('fotoModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'fotoModal';
        modal.className = 'foto-modal';
        modal.innerHTML = `
            <div class="foto-modal-content">
                <button class="foto-modal-close" onclick="cerrarFotoModal()">×</button>
                <img id="fotoModalImg" src="" alt="">
                <div class="foto-modal-info">
                    <p id="fotoModalNombre"></p>
                    <textarea id="fotoModalComentario" placeholder="Comentario..." oninput="actualizarComentarioFotoDesdeModal()"></textarea>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Llenar modal
    const nombreLegible = obtenerNombreLegible(foto, index);
    document.getElementById('fotoModalImg').src = foto.url;
    document.getElementById('fotoModalNombre').textContent = nombreLegible;
    document.getElementById('fotoModalComentario').value = foto.comentario || '';
    document.getElementById('fotoModalComentario').placeholder = 'Notas';
    modal.dataset.index = index;
    modal.style.display = 'flex';
};

window.cerrarFotoModal = function() {
    const modal = document.getElementById('fotoModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.actualizarComentarioFotoDesdeModal = function() {
    const modal = document.getElementById('fotoModal');
    if (!modal) return;
    const index = parseInt(modal.dataset.index);
    const comentario = document.getElementById('fotoModalComentario').value;
    actualizarComentarioFoto(index, comentario);
};

// Cerrar modal con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        cerrarFotoModal();
    }
});

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

// Mostrar modal de confirmación
function mostrarConfirmacion(mensaje, titulo = 'Confirmar') {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const title = document.getElementById('confirmModalTitle');
        const message = document.getElementById('confirmModalMessage');
        const btnCancel = document.getElementById('confirmModalCancel');
        const btnOk = document.getElementById('confirmModalOk');
        
        title.textContent = titulo;
        message.textContent = mensaje;
        modal.style.display = 'flex';
        
        const cleanup = () => {
            modal.style.display = 'none';
            btnCancel.onclick = null;
            btnOk.onclick = null;
        };
        
        btnCancel.onclick = () => {
            cleanup();
            resolve(false);
        };
        
        btnOk.onclick = () => {
            cleanup();
            resolve(true);
        };
    });
}

// Eliminar foto
window.eliminarFoto = async function(index) {
    const foto = fotosSubidas[index];
    if (!foto) return;
    
    const confirmado = await mostrarConfirmacion('¿Estás seguro de eliminar esta foto?', 'Eliminar foto');
    if (!confirmado) return;
    
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

// Inicializar botones de layout
function inicializarLayoutButtons() {
    document.querySelectorAll('.layout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cambiarLayout(btn.dataset.layout);
        });
    });
}

// Inicializar botón de captura
function inicializarCaptura() {
    const captureBtn = document.getElementById('captureBtn');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoCanvas = document.getElementById('videoCanvas');
    
    if (!captureBtn || !videoPlayer || !videoCanvas) return;
    
    captureBtn.addEventListener('click', async () => {
        if (videoPlayer.readyState < 2) {
            mostrarEstado('error', 'Espera a que el video se cargue completamente');
            return;
        }
        
        try {
            // Verificar que el video tenga dimensiones válidas
            if (videoPlayer.videoWidth === 0 || videoPlayer.videoHeight === 0) {
                mostrarEstado('error', 'El video aún no tiene dimensiones válidas. Espera un momento.');
                return;
            }
            
            // Configurar canvas con las dimensiones del video
            videoCanvas.width = videoPlayer.videoWidth;
            videoCanvas.height = videoPlayer.videoHeight;
            
            // Dibujar frame actual del video en el canvas
            const ctx = videoCanvas.getContext('2d');
            
            // Intentar capturar el frame
            try {
                ctx.drawImage(videoPlayer, 0, 0, videoCanvas.width, videoCanvas.height);
            } catch (drawError) {
                console.error('Error dibujando en canvas:', drawError);
                mostrarEstado('error', 'No se pudo capturar el frame. El video puede tener restricciones CORS.');
                return;
            }
            
            // Convertir canvas a blob con manejo de errores CORS
            try {
                videoCanvas.toBlob(async (blob) => {
                    if (!blob) {
                        mostrarEstado('error', 'Error al convertir la captura a imagen');
                        return;
                    }
                    
                    // Crear un File desde el blob
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const fileName = `captura_${archivoActual.nombreSinExtension}_${timestamp}.png`;
                    const file = new File([blob], fileName, { type: 'image/png' });
                    
                    mostrarEstado('saving', 'Guardando captura...');
                    
                    // Subir como foto nueva
                    try {
                        const fotoData = await subirFoto(file);
                        fotosSubidas.push({
                            id: Date.now() + Math.random(),
                            nombre: fileName,
                            url: fotoData.url,
                            path: fotoData.path,
                            comentario: '', // Sin comentario automático, solo placeholder
                            fechaSubida: new Date().toISOString()
                        });
                        
                        // Actualizar metadata y guardar
                        if (archivoActual) {
                            metadata[archivoActual.pathname] = {
                                ...metadata[archivoActual.pathname],
                                fotos: fotosSubidas
                            };
                            await guardarMetadata();
                        }
                        
                        mostrarFotos();
                        mostrarEstado('success', 'Captura guardada correctamente');
                    } catch (error) {
                        console.error('Error subiendo captura:', error);
                        mostrarEstado('error', `Error al guardar captura: ${error.message}`);
                    }
                }, 'image/png');
            } catch (blobError) {
                console.error('Error convirtiendo canvas a blob:', blobError);
                // Si falla por CORS, intentar usar un método alternativo
                mostrarEstado('error', 'Error de seguridad CORS. El video debe servirse desde el mismo origen.');
            }
        } catch (error) {
            console.error('Error capturando video:', error);
            mostrarEstado('error', `Error al capturar: ${error.message}`);
        }
    });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        cargarArchivos();
        inicializarDragDrop();
        inicializarLayoutButtons();
        inicializarCaptura();
    });
} else {
    cargarArchivos();
    inicializarDragDrop();
    inicializarLayoutButtons();
    inicializarCaptura();
}
