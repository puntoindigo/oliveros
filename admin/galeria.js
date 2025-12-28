// Configuración - REEMPLAZA ESTOS VALORES
const BLOB_STORE_ID = 'store_1noPrVsRhcvtAmRY'; // Tu Store ID de Vercel
const METADATA_FILE = 'galeria-metadata.json';

// Verificar autenticación
if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUser');
    window.location.href = 'index.html';
});

// Estado
let archivos = [];
let metadata = {};
let archivoActual = null;

// Cargar archivos desde Vercel Blob
async function cargarArchivos() {
    try {
        const response = await fetch('/api/listar-archivos');
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const data = await response.json();
        archivos = data.archivos || [];
        
        await cargarMetadata();
        mostrarArchivos();
    } catch (error) {
        console.error('Error cargando archivos:', error);
        document.getElementById('archivosList').innerHTML = 
            '<p class="error">Error cargando archivos. Verifica la configuración.</p>';
    }
}

// Cargar metadata (títulos y comentarios)
async function cargarMetadata() {
    try {
        const response = await fetch('/api/cargar-metadata');
        if (response.ok) {
            const data = await response.json();
            metadata = data.metadata || {};
        } else {
            metadata = {};
        }
    } catch (error) {
        console.error('Error cargando metadata:', error);
        metadata = {};
    }
}

// Guardar metadata
async function guardarMetadata() {
    try {
        const response = await fetch('/api/guardar-metadata', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(metadata)
        });
        
        if (!response.ok) {
            throw new Error('Error guardando metadata');
        }
        
        mostrarEstado('success', 'Cambios guardados correctamente');
    } catch (error) {
        console.error('Error guardando metadata:', error);
        mostrarEstado('error', 'Error al guardar. Intenta nuevamente.');
    }
}

// Mostrar lista de archivos
function mostrarArchivos() {
    const container = document.getElementById('archivosList');
    
    if (archivos.length === 0) {
        container.innerHTML = '<p>No hay archivos disponibles. Sube videos/fotos desde el dashboard de Vercel.</p>';
        return;
    }
    
    container.innerHTML = archivos.map((archivo, index) => {
        const nombre = archivo.pathname.split('/').pop();
        const nombreSinExtension = nombre.replace(/\.[^/.]+$/, ''); // Remover extensión
        const tipo = nombre.split('.').pop().toLowerCase();
        const esVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(tipo);
        const meta = metadata[archivo.pathname] || {};
        
        return `
            <div class="archivo-item" data-index="${index}" data-path="${archivo.pathname}">
                <div class="archivo-item-name">${meta.titulo || nombreSinExtension}</div>
                <div class="archivo-item-tipo">${esVideo ? 'Video' : 'Imagen'}</div>
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
    const nombreArchivo = archivoActual.pathname.split('/').pop();
    const nombreSinExtension = nombreArchivo.replace(/\.[^/.]+$/, ''); // Remover extensión
    
    document.getElementById('archivoNombre').textContent = nombreArchivo;
    document.getElementById('archivoTitulo').value = meta.titulo || nombreSinExtension;
    document.getElementById('archivoComentarios').value = meta.comentarios || '';
    
    // Cargar media
    const url = archivoActual.url;
    const tipo = archivoActual.pathname.split('.').pop().toLowerCase();
    const esVideo = ['mp4', 'mov', 'avi'].includes(tipo);
    
    if (esVideo) {
        document.getElementById('videoContainer').style.display = 'block';
        document.getElementById('imageContainer').style.display = 'none';
        document.getElementById('videoPlayer').src = url;
    } else {
        document.getElementById('videoContainer').style.display = 'none';
        document.getElementById('imageContainer').style.display = 'block';
        document.getElementById('imagePreview').src = url;
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

