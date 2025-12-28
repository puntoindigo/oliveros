// Simple authentication
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'delfina2025'; // Cambia esto por una contraseña segura

const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        
        // Limpiar error anterior
        if (errorDiv) {
            errorDiv.classList.remove('show');
            errorDiv.textContent = '';
        }
        
        if (username === ADMIN_USER && password === ADMIN_PASS) {
            // Guardar sesión
            sessionStorage.setItem('adminLoggedIn', 'true');
            sessionStorage.setItem('adminUser', username);
            
            // Redirigir a galería (sin parámetros en URL)
            window.location.href = '/admin/galeria.html';
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
    window.location.href = '/admin/galeria.html';
}

// Limpiar URL si tiene parámetros
if (window.location.search) {
    window.history.replaceState({}, document.title, window.location.pathname);
}

