// Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Form validation and submission
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const formData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            fechaEntrada: document.getElementById('fechaEntrada').value,
            fechaSalida: document.getElementById('fechaSalida').value,
            personas: document.getElementById('personas').value,
            tipoCabana: document.getElementById('tipoCabana').value,
            mensaje: document.getElementById('mensaje').value
        };
        
        // Validate dates
        const fechaEntrada = new Date(formData.fechaEntrada);
        const fechaSalida = new Date(formData.fechaSalida);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (fechaEntrada < today) {
            alert('La fecha de entrada no puede ser anterior a hoy.');
            return;
        }
        
        if (fechaSalida <= fechaEntrada) {
            alert('La fecha de salida debe ser posterior a la fecha de entrada.');
            return;
        }
        
        // Calculate nights
        const nights = Math.ceil((fechaSalida - fechaEntrada) / (1000 * 60 * 60 * 24));
        
        if (nights < 2) {
            alert('El mínimo de alojamiento es de 2 noches.');
            return;
        }
        
        // Create WhatsApp message
        const whatsappMessage = `Hola, me interesa hacer una reserva en La Delfina Cabañas.%0A%0A` +
            `Nombre: ${formData.nombre}%0A` +
            `Email: ${formData.email}%0A` +
            `Teléfono: ${formData.telefono}%0A` +
            `Fecha de entrada: ${formData.fechaEntrada}%0A` +
            `Fecha de salida: ${formData.fechaSalida}%0A` +
            `Noches: ${nights}%0A` +
            `Personas: ${formData.personas}%0A` +
            `Tipo de cabaña: ${formData.tipoCabana}%0A` +
            `Mensaje: ${formData.mensaje || 'Sin mensaje adicional'}`;
        
        // Open WhatsApp
        const whatsappUrl = `https://wa.me/541166882626?text=${whatsappMessage}`;
        window.open(whatsappUrl, '_blank');
        
        // Show success message
        alert('¡Gracias por tu consulta! Se abrirá WhatsApp para que puedas completar tu reserva.');
        
        // Reset form
        contactForm.reset();
    });
}

// Set minimum date for date inputs
const fechaEntradaInput = document.getElementById('fechaEntrada');
const fechaSalidaInput = document.getElementById('fechaSalida');

if (fechaEntradaInput) {
    const today = new Date().toISOString().split('T')[0];
    fechaEntradaInput.setAttribute('min', today);
    
    fechaEntradaInput.addEventListener('change', function() {
        if (this.value) {
            const minSalida = new Date(this.value);
            minSalida.setDate(minSalida.getDate() + 1);
            fechaSalidaInput.setAttribute('min', minSalida.toISOString().split('T')[0]);
        }
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.cabana-card, .servicio-item, .tarifa-card, .testimonio-card');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Las imágenes ya tienen loading="lazy" en el HTML, no necesitamos código adicional

// Add active class to current section in navigation
const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// Add loading state to buttons
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
    button.addEventListener('click', function() {
        if (this.type === 'submit') {
            this.style.opacity = '0.7';
            this.style.pointerEvents = 'none';
            
            setTimeout(() => {
                this.style.opacity = '1';
                this.style.pointerEvents = 'auto';
            }, 2000);
        }
    });
});

// Hero Carousel
let currentSlide = 0;
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots = document.querySelectorAll('.hero-dot');
const totalSlides = heroSlides.length;

function showSlide(index) {
    heroSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    heroDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    currentSlide = index;
}

function nextSlide() {
    const next = (currentSlide + 1) % totalSlides;
    showSlide(next);
}

// Auto-advance carousel
setInterval(nextSlide, 5000);

// Dot navigation
heroDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
    });
});

// Gallery Modal
const galleryItems = document.querySelectorAll('.gallery-item');
const galleryModal = document.getElementById('galleryModal');
const galleryModalImage = document.getElementById('galleryModalImage');
const galleryClose = document.querySelector('.gallery-close');
const galleryPrev = document.querySelector('.gallery-prev');
const galleryNext = document.querySelector('.gallery-next');
const galleryCurrent = document.getElementById('galleryCurrent');
const galleryTotal = document.getElementById('galleryTotal');

let currentGalleryIndex = 0;
const galleryImages = Array.from(galleryItems).map(item => ({
    src: item.querySelector('img').src,
    alt: item.querySelector('img').alt
}));

galleryTotal.textContent = galleryImages.length;

function openGalleryModal(index) {
    currentGalleryIndex = index;
    updateGalleryModal();
    galleryModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeGalleryModal() {
    galleryModal.classList.remove('active');
    document.body.style.overflow = '';
}

function updateGalleryModal() {
    galleryModalImage.src = galleryImages[currentGalleryIndex].src;
    galleryModalImage.alt = galleryImages[currentGalleryIndex].alt;
    galleryCurrent.textContent = currentGalleryIndex + 1;
}

function showPrevImage() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
    updateGalleryModal();
}

function showNextImage() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
    updateGalleryModal();
}

// Open modal on gallery item click
galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        openGalleryModal(index);
    });
});

// Close modal
galleryClose.addEventListener('click', closeGalleryModal);
galleryPrev.addEventListener('click', showPrevImage);
galleryNext.addEventListener('click', showNextImage);

// Close modal on background click
galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) {
        closeGalleryModal();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (galleryModal.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeGalleryModal();
        } else if (e.key === 'ArrowLeft') {
            showPrevImage();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        }
    }
});

// Social Share Functionality
const socialShareButtons = document.querySelectorAll('.social-share-btn');

function getShareUrl(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Cabañas La Delfina - Alquiler de Cabañas en Oliveros, Santa Fe');
    const description = encodeURIComponent('El lugar ideal para tu descanso. Conexión con la naturaleza, río, arboleda, pileta. Escapadas de fin de semana, feriados largos y vacaciones.');
    
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
        whatsapp: `https://wa.me/?text=${title}%20${url}`
    };
    
    return shareUrls[platform] || url;
}

socialShareButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = button.getAttribute('data-platform');
        const shareUrl = getShareUrl(platform);
        
        // Abrir ventana de compartir
        const width = 600;
        const height = 400;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        window.open(
            shareUrl,
            'Compartir',
            `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,scrollbars=1,resizable=1`
        );
    });
});

