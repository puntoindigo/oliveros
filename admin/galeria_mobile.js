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

// Abrir menú por defecto al cargar si no hay archivo seleccionado
window.addEventListener('DOMContentLoaded', () => {
    const noSelection = document.getElementById('noSelection');
    if (noSelection && noSelection.style.display !== 'none') {
        burgerMenu.classList.add('active');
        mobileMenu.classList.add('open');
    }
});

// Estado
let archivos = [];
let metadata = {};
let archivoActual = null;

// Control del menú burger
const burgerMenu = document.getElementById('burgerMenu');
const mobileMenu = document.getElementById('mobileMenu');

// Abrir menú por defecto cuando no hay archivo seleccionado
const noSelection = document.getElementById('noSelection');
if (noSelection && noSelection.style.display !== 'none') {
    burgerMenu.classList.add('active');
    mobileMenu.classList.add('open');
}

burgerMenu.addEventListener('click', () => {
    burgerMenu.classList.toggle('active');
    mobileMenu.classList.toggle('open');
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !burgerMenu.contains(e.target)) {
        burgerMenu.classList.remove('active');
        mobileMenu.classList.remove('open');
    }
});

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminUser');
        window.location.href = '/admin/index.html';
    });
}

// Cargar archivos locales estáticos
async function cargarArchivos() {
    try {
        archivos = VIDEOS_LIST.map(filename => ({
            pathname: `videos/${filename}`,
            url: `${VIDEOS_FOLDER}${filename}`,
            apiUrl: `/api/video?filename=${encodeURIComponent(filename)}`,
            filename: filename,
            nombreSinExtension: filename.replace(/\.[^/.]+$/, '')
        }));
        
        await cargarMetadata();
        mostrarArchivos();
    } catch (error) {
        console.error('Error cargando archivos:', error);
        document.getElementById('archivosList').innerHTML = 
            `<li class="mobile-archivo-item">
                <span class="mobile-archivo-item-name">Error cargando videos</span>
            </li>`;
    }
}

// Cargar metadata desde API (lee del JSON estático)
async function cargarMetadata() {
    try {
        const response = await fetch('/api/metadata');
        if (response.ok) {
            const jsonData = await response.json();
            metadata = jsonData;
        } else {
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
            mostrarEstado('success', result.message || 'Cambios guardados correctamente');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.details || errorData.mensaje || 'Error al guardar');
        }
    } catch (error) {
        console.error('Error guardando metadata:', error);
        mostrarEstado('error', `Error al guardar: ${error.message}`);
    }
}

// Mostrar lista de archivos en el menú mobile
function mostrarArchivos() {
    const container = document.getElementById('archivosList');
    
    if (archivos.length === 0) {
        container.innerHTML = '<li class="mobile-archivo-item"><span class="mobile-archivo-item-name">No hay videos disponibles</span></li>';
        return;
    }
    
    container.innerHTML = archivos.map((archivo, index) => {
        const meta = metadata[archivo.pathname] || {};
        const displayTitle = meta.titulo || archivo.nombreSinExtension;
        
        return `
            <li class="mobile-archivo-item" data-index="${index}" data-path="${archivo.pathname}">
                <span class="mobile-archivo-item-name">${displayTitle}</span>
                <span class="mobile-archivo-item-tipo">Video</span>
            </li>
        `;
    }).join('');
    
    // Agregar event listeners
    document.querySelectorAll('.mobile-archivo-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            seleccionarArchivo(index);
        });
    });
}

// Seleccionar archivo
function seleccionarArchivo(index) {
    archivoActual = archivos[index];
    
    // Cerrar menú mobile al seleccionar
    burgerMenu.classList.remove('active');
    mobileMenu.classList.remove('open');
    
    // Actualizar UI del menú
    document.querySelectorAll('.mobile-archivo-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    
    // Mostrar editor
    document.getElementById('noSelection').style.display = 'none';
    document.getElementById('editorContainer').style.display = 'block';
    
    // Scroll al inicio
    window.scrollTo(0, 0);
    
    // Cargar datos
    const meta = metadata[archivoActual.pathname] || {};
    const nombreSinExtension = archivoActual.nombreSinExtension;
    
    document.getElementById('archivoTitulo').value = meta.titulo || nombreSinExtension;
    document.getElementById('archivoComentarios').value = meta.comentarios || '';
    
    // Cargar video
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.style.display = 'block';
    
    let errorShown = false;
    let usingApiRoute = false;
    
    // Manejar errores
    videoPlayer.addEventListener('error', (e) => {
        if (!usingApiRoute && !errorShown) {
            const errorMessage = videoPlayer.error?.message || '';
            
            if (errorMessage.includes('DEMUXER_ERROR') || errorMessage.includes('Could not open')) {
                usingApiRoute = true;
                videoPlayer.src = archivoActual.apiUrl;
                videoPlayer.load();
                return;
            }
            
            if (videoPlayer.error?.code === 4) {
                mostrarEstado('error', 'Formato de video no soportado');
                errorShown = true;
            }
        }
    }, { once: false });
    
    videoPlayer.addEventListener('canplay', () => {
        errorShown = false;
    });
    
    // Cargar video desde API route
    videoPlayer.src = archivoActual.apiUrl;
    usingApiRoute = true;
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
    status.className = `mobile-save-status ${tipo}`;
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

