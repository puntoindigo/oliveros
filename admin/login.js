// Simple authentication
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'delfina2025'; // Cambia esto por una contraseña segura

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    // Limpiar error anterior
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
    
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        // Guardar sesión
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminUser', username);
        
        // Redirigir a galería (sin parámetros en URL)
        window.location.href = 'galeria.html';
    } else {
        errorDiv.textContent = 'Usuario o contraseña incorrectos';
        errorDiv.classList.add('show');
        
        // Limpiar campos después de error
        document.getElementById('password').value = '';
    }
});

// Verificar si ya está logueado
if (sessionStorage.getItem('adminLoggedIn') === 'true') {
    window.location.href = 'galeria.html';
}

// Limpiar URL si tiene parámetros
if (window.location.search) {
    window.history.replaceState({}, document.title, window.location.pathname);
}

