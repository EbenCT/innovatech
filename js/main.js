// ===== VARIABLES GLOBALES =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contactForm');

// ===== INICIALIZACION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupScrollEffects();
    setupFormValidation();
    checkPWAInstallation();
});

// ===== INICIALIZAR APLICACIÓN =====
function initializeApp() {
    // Añadir clases para animaciones
    addAnimationClasses();
    
    // Configurar navegación activa
    updateActiveNavLink();
    
    // Mostrar elementos con delay
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    console.log('INNOVATECH - Website loaded successfully');
}

// ===== CONFIGURAR EVENT LISTENERS =====
function setupEventListeners() {
    // Menú hamburguesa
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Cerrar menú móvil al hacer click en enlaces
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });
    
    // Cerrar menú móvil al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!navbar.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Resize window
    window.addEventListener('resize', handleWindowResize);
    
    // Prevenir envío de formularios por defecto
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
}

// ===== EFECTOS DE SCROLL =====
function setupScrollEffects() {
    window.addEventListener('scroll', function() {
        updateNavbarOnScroll();
        updateActiveNavLink();
        revealAnimatedElements();
    });
}

// ===== NAVEGACIÓN MÓVIL =====
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== NAVBAR SCROLL EFFECT =====
function updateNavbarOnScroll() {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// ===== NAVEGACIÓN ACTIVA =====
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ===== SMOOTH SCROLL =====
function handleSmoothScroll(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80; // Ajuste para navbar fijo
        
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
        
        closeMobileMenu();
    }
}

// ===== ANIMACIONES DE ENTRADA =====
function addAnimationClasses() {
    const animatedElements = document.querySelectorAll(
        '.product-card, .service-item, .news-card, .download-card, .support-card, .stat-item'
    );
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
    });
}

function revealAnimatedElements() {
    const animatedElements = document.querySelectorAll(
        '.product-card, .service-item, .news-card, .download-card, .support-card, .stat-item'
    );
    
    animatedElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.style.transition = 'all 0.6s ease';
        }
    });
}

// ===== MANEJO DE FORMULARIOS =====
function setupFormValidation() {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearError);
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.getAttribute('name');
    
    clearError(e);
    
    if (field.hasAttribute('required') && !value) {
        showError(field, `El campo ${getFieldLabel(fieldName)} es requerido`);
        return false;
    }
    
    if (fieldName === 'email' && value && !isValidEmail(value)) {
        showError(field, 'Ingresa un email válido');
        return false;
    }
    
    if (fieldName === 'phone' && value && !isValidPhone(value)) {
        showError(field, 'Ingresa un teléfono válido');
        return false;
    }
    
    return true;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    let isValid = true;
    
    // Validar todos los campos
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Por favor, corrige los errores en el formulario', 'error');
        return;
    }
    
    // Mostrar loading
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    // Simular envío (aquí conectarías con tu backend)
    setTimeout(() => {
        // Resetear formulario
        contactForm.reset();
        
        // Restaurar botón
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Mostrar éxito
        showNotification('¡Mensaje enviado exitosamente! Te contactaremos pronto.', 'success');
        
        // Log para desarrollo
        console.log('Formulario enviado:', Object.fromEntries(formData));
    }, 2000);
}

// ===== UTILIDADES DE VALIDACIÓN =====
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
}

function getFieldLabel(fieldName) {
    const labels = {
        'name': 'Nombre',
        'email': 'Email',
        'phone': 'Teléfono',
        'service': 'Servicio',
        'message': 'Mensaje'
    };
    return labels[fieldName] || fieldName;
}

function showError(field, message) {
    clearError({ target: field });
    
    field.style.borderColor = '#dc3545';
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#dc3545';
    errorElement.style.fontSize = '14px';
    errorElement.style.marginTop = '5px';
    
    field.parentNode.appendChild(errorElement);
}

function clearError(e) {
    const field = e.target;
    field.style.borderColor = '';
    
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

// ===== NOTIFICACIONES =====
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        minWidth: '300px',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    // Colores según tipo
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// ===== RESPONSIVE HANDLING =====
function handleWindowResize() {
    // Cerrar menú móvil en resize
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
    
    // Actualizar animaciones
    setTimeout(revealAnimatedElements, 100);
}

// ===== PWA INSTALLATION =====
let deferredPrompt;

function checkPWAInstallation() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt();
    });
    
    window.addEventListener('appinstalled', (evt) => {
        console.log('PWA installed successfully');
        hideInstallPrompt();
    });
}

function showInstallPrompt() {
    // Crear botón de instalación
    const installButton = document.createElement('button');
    installButton.textContent = '📱 Instalar App';
    installButton.className = 'install-btn';
    installButton.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 20px;
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        transition: all 0.3s ease;
        display: none;
    `;
    
    // Mostrar solo en móviles
    if (window.innerWidth <= 768) {
        installButton.style.display = 'block';
    }
    
    installButton.addEventListener('click', installPWA);
    document.body.appendChild(installButton);
    
    // Animación de entrada
    setTimeout(() => {
        installButton.style.transform = 'translateY(0)';
        installButton.style.opacity = '1';
    }, 1000);
}

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        });
    }
}

function hideInstallPrompt() {
    const installBtn = document.querySelector('.install-btn');
    if (installBtn) {
        installBtn.remove();
    }
}

// ===== UTILIDADES GENERALES =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ===== LAZY LOADING =====
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ===== PERFORMANCE MONITORING =====
function logPerformanceMetrics() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Performance Metrics:');
            console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
            console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.fetchStart, 'ms');
            console.log('First Paint:', performance.getEntriesByType('paint')[0]?.startTime || 'N/A', 'ms');
        }, 1000);
    });
}

// ===== DARK MODE TOGGLE (OPCIONAL) =====
function setupDarkMode() {
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
        
        // Cargar preferencia guardada
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
        }
    }
}

function toggleDarkMode() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ===== ANALYTICS (PARA IMPLEMENTAR) =====
function trackEvent(action, category, label) {
    // Aquí puedes integrar Google Analytics, Facebook Pixel, etc.
    console.log('Event tracked:', { action, category, label });
    
    // Ejemplo para Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

// ===== EXPORT FUNCTIONS =====
window.InnovaTechApp = {
    showNotification,
    trackEvent,
    toggleDarkMode,
    debounce,
    throttle
};

// ===== INICIALIZAR FUNCIONES ADICIONALES =====
document.addEventListener('DOMContentLoaded', function() {
    setupLazyLoading();
    logPerformanceMetrics();
    setupDarkMode();
});

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}