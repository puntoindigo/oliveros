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

// Cargar archivos locales estáticos
async function cargarArchivos() {
    try {
        // Convertir lista de videos al formato esperado
        archivos = VIDEOS_LIST.map(filename => ({
            pathname: `videos/${filename}`,
            url: `${VIDEOS_FOLDER}${filename}`,
            filename: filename,
            nombreSinExtension: filename.replace(/\.[^/.]+$/, '')
        }));
        
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

// Cargar metadata desde JSON estático y localStorage
async function cargarMetadata() {
    try {
        // Intentar cargar desde JSON estático primero
        try {
            const jsonResponse = await fetch(`${VIDEOS_FOLDER}../${METADATA_FILE}`);
            if (jsonResponse.ok) {
                const jsonData = await jsonResponse.json();
                metadata = jsonData;
                console.log('✅ Metadata cargada desde JSON estático');
            }
        } catch (error) {
            console.log('ℹ️ No se encontró JSON estático, usando localStorage');
        }
        
        // Cargar desde localStorage como respaldo/complemento
        const savedMetadata = localStorage.getItem('galeria-metadata');
        if (savedMetadata) {
            const localMetadata = JSON.parse(savedMetadata);
            // Combinar: localStorage tiene prioridad sobre JSON estático
            metadata = { ...metadata, ...localMetadata };
        }
        
        if (Object.keys(metadata).length === 0) {
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

// Descargar metadata como JSON
function descargarMetadata() {
    const dataStr = JSON.stringify(metadata, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = METADATA_FILE;
    link.click();
    URL.revokeObjectURL(url);
}

// Mostrar lista de archivos
function mostrarArchivos() {
    const container = document.getElementById('archivosList');
    
    if (archivos.length === 0) {
        container.innerHTML = '<p>No hay videos disponibles.</p>';
        return;
    }
    
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
    
    // Cargar video
    document.getElementById('videoContainer').style.display = 'block';
    document.getElementById('imageContainer').style.display = 'none';
    document.getElementById('youtubeContainer').innerHTML = '';
    
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.style.display = 'block';
    videoPlayer.src = archivoActual.url;
    videoPlayer.load();
}

// Guardar cambios
document.getElementById('saveBtn').addEventListener('click', async () => {
    if (!archivoActual) return;
    
    const titulo = document.getElementById('archivoTitulo').value.trim();
    const comentarios = document.getElementById('archivoComentarios').value.trim();
    
    const nombreSinExtension = archivoActual.nombreSinExtension;
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
    status.style.display = 'block';
    
    if (tipo === 'success') {
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }
}

// Inicializar
cargarArchivos();
