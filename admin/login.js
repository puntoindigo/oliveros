// Simple authentication
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'delfina2025'; // Cambia esto por una contraseña segura

const loginForm = document.getElementById('loginForm');

// Cargar credenciales guardadas al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    const savedCredentials = localStorage.getItem('adminCredentials');
    if (savedCredentials) {
        try {
            const creds = JSON.parse(savedCredentials);
            if (creds.username) {
                document.getElementById('username').value = creds.username;
            }
            if (creds.password) {
                document.getElementById('password').value = creds.password;
                document.getElementById('rememberMe').checked = true;
            }
        } catch (error) {
            console.error('Error cargando credenciales guardadas:', error);
        }
    }
});

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const errorDiv = document.getElementById('loginError');
        
        // Limpiar error anterior
        if (errorDiv) {
            errorDiv.classList.remove('show');
            errorDiv.textContent = '';
        }
        
        if (username === ADMIN_USER && password === ADMIN_PASS) {
            // Guardar credenciales si el checkbox está marcado
            if (rememberMe) {
                localStorage.setItem('adminCredentials', JSON.stringify({
                    username: username,
                    password: password
                }));
            } else {
                // Si no está marcado, eliminar credenciales guardadas
                localStorage.removeItem('adminCredentials');
            }
            
            // Guardar sesión
            sessionStorage.setItem('adminLoggedIn', 'true');
            sessionStorage.setItem('adminUser', username);
            
            // Detectar si es móvil y redirigir a la versión correspondiente
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
            
            if (isMobile) {
                window.location.href = '/admin/galeria-mobile';
            } else {
                window.location.href = '/admin/galeria';
            }
        } else {
            if (errorDiv) {
                errorDiv.textContent = 'Usuario o contraseña incorrectos';
                errorDiv.classList.add('show');
            }
            
            // Limpiar campos después de error
            const passwordField = document.getElementById('password');
            if (passwordField) {
                passwordField.value = '';
            }
        }
        
        return false;
    });
}

// Verificar si ya está logueado
if (sessionStorage.getItem('adminLoggedIn') === 'true') {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (isMobile) {
        window.location.href = '/admin/galeria-mobile';
    } else {
        window.location.href = '/admin/galeria';
    }
}

// Limpiar URL si tiene parámetros
if (window.location.search) {
    window.history.replaceState({}, document.title, window.location.pathname);
}

