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
    window.location.href = '/admin';
}

// Estado
let archivos = [];
let metadata = {};
let archivoActual = null;

// Control del menú burger
const burgerMenu = document.getElementById('burgerMenu');
const mobileMenu = document.getElementById('mobileMenu');

// El menú ya está abierto por defecto en el HTML, solo necesitamos el toggle
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

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        const confirmado = await mostrarConfirmacion('¿Estás seguro de cerrar sesión?', 'Cerrar Sesión');
        if (!confirmado) return;
        
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminUser');
        window.location.href = '/admin';
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
            mostrarEstado('success', '✅ Cambios guardados correctamente');
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
    try {
        await guardarMetadata();
        mostrarArchivos(); // Refrescar lista
        // El mensaje de éxito se muestra desde guardarMetadata()
    } catch (error) {
        // El error ya se maneja en guardarMetadata()
    }
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
        status.className = `mobile-save-status ${tipo}`;
        status.textContent = mensaje;
        status.style.display = 'block';
        
        if (tipo === 'success') {
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
        }
    }
}

// Inicializar
cargarArchivos();

