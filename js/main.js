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

// ===== MANEJO DE FORMULARIOS MEJORADO =====

// Configuración
const FORM_CONFIG = {
    endpoint: 'contact.php', // Archivo PHP que acabamos de crear
    timeout: 10000, // 10 segundos
    retries: 2
};

// Actualizar función de envío de formulario
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
    
    // Mostrar estado de carga
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    setLoadingState(submitBtn, true);
    
    // Enviar formulario
    sendFormData(formData)
        .then(response => {
            if (response.success) {
                handleFormSuccess(response);
            } else {
                handleFormError(response);
            }
        })
        .catch(error => {
            handleFormError({ message: 'Error de conexión. Verifica tu internet.' });
            console.error('Error:', error);
        })
        .finally(() => {
            setLoadingState(submitBtn, false, originalText);
        });
}

// Función para enviar datos del formulario
async function sendFormData(formData, attempt = 1) {
    try {
        const response = await fetch(FORM_CONFIG.endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        // Reintentar si falló y tenemos intentos disponibles
        if (attempt < FORM_CONFIG.retries) {
            console.warn(`Intento ${attempt} falló, reintentando...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            return sendFormData(formData, attempt + 1);
        }
        
        throw error;
    }
}

// Manejar respuesta exitosa
function handleFormSuccess(response) {
    // Resetear formulario
    contactForm.reset();
    
    // Mensaje de éxito detallado
    let successMessage = '¡Mensaje enviado exitosamente! 🚀\n\n';
    
    if (response.details) {
        successMessage += `✅ Emails enviados: ${response.details.emails_sent}/${response.details.total_emails}\n`;
        successMessage += `📱 WhatsApp notificado: ${response.details.whatsapp_numbers} números\n`;
        successMessage += `🕐 Enviado: ${response.details.timestamp}`;
    }
    
    successMessage += '\n\nTe contactaremos pronto. ¡Gracias por confiar en INNOVATECH!';
    
    showNotification(successMessage, 'success', 8000);
    
    // Opcional: Mostrar modal de confirmación con más detalles
    showSuccessModal(response);
    
    // Analytics/tracking
    trackFormSubmission('success', response);
    
    // Opcional: Redirigir después de unos segundos
    // setTimeout(() => window.location.href = '#inicio', 3000);
}

// Manejar errores del formulario
function handleFormError(response) {
    let errorMessage = response.message || 'Error al enviar el formulario';
    
    if (response.errors && Array.isArray(response.errors)) {
        errorMessage += ':\n• ' + response.errors.join('\n• ');
    }
    
    showNotification(errorMessage, 'error', 6000);
    
    // Analytics/tracking
    trackFormSubmission('error', response);
    
    // Mostrar información de contacto alternativa
    setTimeout(() => {
        showAlternativeContact();
    }, 2000);
}

// Estados de carga del botón
function setLoadingState(button, isLoading, originalText = 'Enviar Mensaje') {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `
            <span class="loading-spinner"></span>
            Enviando...
        `;
        button.style.opacity = '0.7';
    } else {
        button.disabled = false;
        button.textContent = originalText;
        button.style.opacity = '1';
    }
}

// Modal de éxito con detalles
function showSuccessModal(response) {
    const modal = document.createElement('div');
    modal.className = 'success-modal-overlay';
    modal.innerHTML = `
        <div class="success-modal">
            <div class="modal-header">
                <h3>🚀 ¡Mensaje Enviado!</h3>
                <button class="modal-close" onclick="this.closest('.success-modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="success-animation">
                    <i class="fas fa-check-circle"></i>
                </div>
                <p><strong>Tu mensaje ha sido enviado exitosamente a nuestro equipo.</strong></p>
                
                <div class="success-details">
                    <div class="detail-item">
                        <i class="fas fa-envelope"></i>
                        <span>Emails enviados: ${response.details?.emails_sent || 0}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fab fa-whatsapp"></i>
                        <span>WhatsApp notificado: ${response.details?.whatsapp_numbers || 0} números</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>Tiempo estimado de respuesta: 2-4 horas</span>
                    </div>
                </div>
                
                <div class="next-steps">
                    <h4>📋 Próximos pasos:</h4>
                    <ul>
                        <li>Revisaremos tu consulta</li>
                        <li>Te contactaremos por WhatsApp o email</li>
                        <li>Programaremos una llamada si es necesario</li>
                    </ul>
                </div>
                
                <div class="contact-reminder">
                    <p><strong>¿Necesitas hablar ahora?</strong></p>
                    <div class="quick-contact">
                        <a href="https://wa.me/59163332108" class="btn btn-whatsapp" target="_blank">
                            <i class="fab fa-whatsapp"></i>
                            WhatsApp +591 63332108
                        </a>
                        <a href="https://wa.me/59172474541" class="btn btn-whatsapp" target="_blank">
                            <i class="fab fa-whatsapp"></i>
                            WhatsApp +591 72474541
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Estilos del modal
    const modalStyles = `
        <style>
        .success-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .success-modal {
            background: white;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            animation: slideIn 0.3s ease;
        }
        
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h3 {
            margin: 0;
            color: #1a237e;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #666;
        }
        
        .modal-body {
            padding: 20px;
            text-align: center;
        }
        
        .success-animation i {
            font-size: 64px;
            color: #28a745;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        
        .success-details {
            margin: 20px 0;
            text-align: left;
        }
        
        .detail-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            padding: 8px;
            background: #f8f9fa;
            border-radius: 6px;
        }
        
        .detail-item i {
            margin-right: 10px;
            width: 20px;
            color: #1a237e;
        }
        
        .next-steps {
            text-align: left;
            margin: 20px 0;
        }
        
        .next-steps ul {
            padding-left: 20px;
        }
        
        .contact-reminder {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .quick-contact {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn-whatsapp {
            background: #25d366;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 6px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-whatsapp:hover {
            background: #128c7e;
            color: white;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', modalStyles);
    document.body.appendChild(modal);
    
    // Cerrar modal al hacer click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Auto-cerrar después de 30 segundos
    setTimeout(() => {
        if (document.body.contains(modal)) {
            modal.remove();
        }
    }, 30000);
}

// Mostrar contacto alternativo en caso de error
function showAlternativeContact() {
    const notification = document.createElement('div');
    notification.className = 'alternative-contact-notification';
    notification.innerHTML = `
        <div class="alt-contact-content">
            <h4>📞 Contáctanos directamente:</h4>
            <div class="contact-options">
                <a href="https://wa.me/59163332108" target="_blank">
                    <i class="fab fa-whatsapp"></i> +591 63332108
                </a>
                <a href="https://wa.me/59172474541" target="_blank">
                    <i class="fab fa-whatsapp"></i> +591 72474541
                </a>
                <a href="mailto:cayoeben64@gmail.com">
                    <i class="fas fa-envelope"></i> cayoeben64@gmail.com
                </a>
                <a href="mailto:nielsroy8@gmail.com">
                    <i class="fas fa-envelope"></i> nielsroy8@gmail.com
                </a>
            </div>
            <button onclick="this.closest('.alternative-contact-notification').remove()">
                Cerrar
            </button>
        </div>
    `;
    
    // Estilos para el contacto alternativo
    const altContactStyles = `
        <style>
        .alternative-contact-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border: 2px solid #1a237e;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            z-index: 9999;
            max-width: 350px;
            animation: slideInRight 0.5s ease;
        }
        
        .alt-contact-content h4 {
            margin: 0 0 15px 0;
            color: #1a237e;
        }
        
        .contact-options {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .contact-options a {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            background: #f8f9fa;
            border-radius: 6px;
            text-decoration: none;
            color: #333;
            transition: all 0.3s ease;
        }
        
        .contact-options a:hover {
            background: #1a237e;
            color: white;
        }
        
        .alternative-contact-notification button {
            margin-top: 15px;
            width: 100%;
            padding: 8px;
            background: #1a237e;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', altContactStyles);
    document.body.appendChild(notification);
    
    // Auto-remover después de 15 segundos
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.remove();
        }
    }, 15000);
}

// Función para tracking/analytics
function trackFormSubmission(status, response) {
    // Integrar con Google Analytics, Facebook Pixel, etc.
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
            event_category: 'contact',
            event_label: status,
            value: status === 'success' ? 1 : 0
        });
    }
    
    console.log('Form submission tracked:', { status, response });
}

// CSS para el spinner de carga
const loadingStyles = `
<style>
.loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #ffffff;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', loadingStyles);