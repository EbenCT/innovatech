// ===== MAIN.JS - ARCHIVO PRINCIPAL =====
// Importar módulos (cargar después de este archivo)
// Orden de carga: utils.js -> navigation.js -> forms.js -> animations.js -> main.js

// ===== VARIABLES GLOBALES =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contactForm');

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('🚀 INNOVATECH - Inicializando aplicación...');
    
    // Inicializar módulos
    if (typeof NavigationModule !== 'undefined') {
        NavigationModule.init();
    }
    
    if (typeof FormsModule !== 'undefined') {
        FormsModule.init();
    }
    
    if (typeof AnimationsModule !== 'undefined') {
        AnimationsModule.init();
    }
    
    // Configurar funcionalidades adicionales
    setupScrollEffects();
    setupPWA();
    setupPerformanceMonitoring();
    
    // Mostrar aplicación
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    console.log('✅ INNOVATECH - Aplicación inicializada correctamente');
}

// ===== EFECTOS DE SCROLL =====
function setupScrollEffects() {
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                updateNavbarOnScroll();
                updateActiveNavLink();
                
                if (typeof AnimationsModule !== 'undefined') {
                    AnimationsModule.revealElements();
                }
                
                ticking = false;
            });
            ticking = true;
        }
    });
}

function updateNavbarOnScroll() {
    const scrolled = window.pageYOffset > 50;
    navbar.classList.toggle('scrolled', scrolled);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.pageYOffset + 100;
    
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
        
        if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) navLink.classList.add('active');
        }
    });
}

// ===== PWA SETUP =====
function setupPWA() {
    // Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registrado:', registration);
                })
                .catch(error => {
                    console.log('❌ Service Worker falló:', error);
                });
        });
    }
    
    // PWA Install
    checkPWAInstallation();
}

function checkPWAInstallation() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        const installBtn = document.querySelector('.install-app-btn');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.addEventListener('click', () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('✅ PWA instalada');
                    }
                    deferredPrompt = null;
                });
            });
        }
    });
}

// ===== PERFORMANCE MONITORING =====
function setupPerformanceMonitoring() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const paintEntries = performance.getEntriesByType('paint');
            
            console.log('📊 Performance Metrics:');
            console.log('Page Load:', Math.round(perfData.loadEventEnd - perfData.fetchStart) + 'ms');
            console.log('DOM Ready:', Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart) + 'ms');
            
            if (paintEntries.length > 0) {
                console.log('First Paint:', Math.round(paintEntries[0].startTime) + 'ms');
            }
        }, 1000);
    });
}

// ===== ANALYTICS =====
function trackEvent(action, category, label) {
    console.log('📈 Event tracked:', { action, category, label });
    
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', action, { category, label });
    }
}

// ===== EXPORT GLOBAL =====
window.InnovaTechApp = {
    trackEvent,
    version: '2.0.0',
    modules: {
        navigation: () => NavigationModule,
        forms: () => FormsModule,
        animations: () => AnimationsModule,
        utils: () => UtilsModule
    }
};