// ===== NAVIGATION.JS - MÓDULO DE NAVEGACIÓN =====

const NavigationModule = (function() {
    'use strict';

    // ===== VARIABLES PRIVADAS =====
    let navbar, hamburger, navMenu, navLinks;
    let isMenuOpen = false;

    // ===== INICIALIZACIÓN =====
    function init() {
        // Obtener elementos
        navbar = document.getElementById('navbar');
        hamburger = document.getElementById('hamburger');
        navMenu = document.getElementById('nav-menu');
        navLinks = document.querySelectorAll('.nav-link');

        if (!navbar || !hamburger || !navMenu) {
            console.warn('⚠️ Elementos de navegación no encontrados');
            return;
        }

        setupEventListeners();
        setupSmoothScroll();
        console.log('✅ NavigationModule inicializado');
    }

    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
        // Toggle menú móvil
        hamburger.addEventListener('click', toggleMobileMenu);

        // Cerrar menú al hacer click en enlaces
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavLinkClick);
        });

        // Cerrar menú al hacer click fuera
        document.addEventListener('click', handleOutsideClick);

        // Manejar redimensionamiento
        window.addEventListener('resize', UtilsModule.debounce(handleWindowResize, 250));

        // Manejar tecla Escape
        document.addEventListener('keydown', handleKeyDown);
    }

    // ===== MENÚ MÓVIL =====
    function toggleMobileMenu() {
        isMenuOpen = !isMenuOpen;
        
        hamburger.classList.toggle('active', isMenuOpen);
        navMenu.classList.toggle('active', isMenuOpen);
        
        // Prevenir scroll del body cuando el menú está abierto
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        
        // Accesibilidad
        hamburger.setAttribute('aria-expanded', isMenuOpen);
        navMenu.setAttribute('aria-hidden', !isMenuOpen);
        
        // Enfocar primer enlace cuando se abre el menú
        if (isMenuOpen && navLinks.length > 0) {
            setTimeout(() => navLinks[0].focus(), 100);
        }
        
        console.log(`📱 Menú móvil ${isMenuOpen ? 'abierto' : 'cerrado'}`);
    }

    function closeMobileMenu() {
        if (isMenuOpen) {
            isMenuOpen = false;
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            
            hamburger.setAttribute('aria-expanded', 'false');
            navMenu.setAttribute('aria-hidden', 'true');
        }
    }

    // ===== MANEJO DE CLICKS =====
    function handleNavLinkClick(e) {
        const link = e.currentTarget;
        const href = link.getAttribute('href');
        
        // Si es un enlace interno (anchor)
        if (href && href.startsWith('#')) {
            e.preventDefault();
            
            const targetId = href.slice(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Cerrar menú móvil
                closeMobileMenu();
                
                // Scroll suave con offset para navbar fijo
                const navbarHeight = navbar.offsetHeight;
                UtilsModule.smoothScrollTo(targetElement, navbarHeight + 20);
                
                // Actualizar URL sin recargar página
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
                
                // Analytics
                if (window.InnovaTechApp && window.InnovaTechApp.trackEvent) {
                    window.InnovaTechApp.trackEvent('navigation_click', 'internal_link', targetId);
                }
            }
        } else {
            // Enlace externo - cerrar menú móvil
            closeMobileMenu();
        }
    }

    function handleOutsideClick(e) {
        // Cerrar menú si se hace click fuera del navbar
        if (isMenuOpen && navbar && !navbar.contains(e.target)) {
            closeMobileMenu();
        }
    }

    function handleKeyDown(e) {
        // Cerrar menú con tecla Escape
        if (e.key === 'Escape' && isMenuOpen) {
            closeMobileMenu();
            hamburger.focus(); // Devolver foco al botón hamburger
        }
        
        // Navegación con teclado en el menú
        if (isMenuOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            navigateWithKeyboard(e.key === 'ArrowDown' ? 1 : -1);
        }
    }

    function handleWindowResize() {
        // Cerrar menú móvil si se redimensiona a desktop
        if (window.innerWidth > 768 && isMenuOpen) {
            closeMobileMenu();
        }
    }

    // ===== NAVEGACIÓN CON TECLADO =====
    function navigateWithKeyboard(direction) {
        const focusableLinks = Array.from(navLinks).filter(link => 
            link.offsetParent !== null // Solo enlaces visibles
        );
        
        const currentIndex = focusableLinks.indexOf(document.activeElement);
        let nextIndex;
        
        if (currentIndex === -1) {
            nextIndex = direction > 0 ? 0 : focusableLinks.length - 1;
        } else {
            nextIndex = currentIndex + direction;
            if (nextIndex >= focusableLinks.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = focusableLinks.length - 1;
        }
        
        focusableLinks[nextIndex].focus();
    }

    // ===== SCROLL SUAVE =====
    function setupSmoothScroll() {
        // Configurar scroll suave para todos los enlaces internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href === '#') {
                    e.preventDefault();
                    return;
                }
                
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    
                    const navbarHeight = navbar ? navbar.offsetHeight : 0;
                    UtilsModule.smoothScrollTo(targetElement, navbarHeight + 20);
                    
                    // Actualizar URL
                    if (history.pushState) {
                        history.pushState(null, null, href);
                    }
                }
            });
        });
    }

    // ===== NAVEGACIÓN ACTIVA =====
    function updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.pageYOffset + (navbar ? navbar.offsetHeight : 0) + 50;
        
        let activeSection = null;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            
            if (scrollPos >= top && scrollPos < top + height) {
                activeSection = id;
            }
        });
        
        // Actualizar clases activas
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = href === `#${activeSection}`;
            
            link.classList.toggle('active', isActive);
            
            // Accesibilidad
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
    }

    // ===== ESTADOS DE NAVEGACIÓN =====
    function setLoadingState(isLoading) {
        if (navbar) {
            navbar.classList.toggle('loading', isLoading);
        }
    }

    function showNavigation() {
        if (navbar) {
            navbar.style.transform = 'translateY(0)';
            navbar.style.opacity = '1';
        }
    }

    function hideNavigation() {
        if (navbar) {
            navbar.style.transform = 'translateY(-100%)';
            navbar.style.opacity = '0';
        }
    }

    // ===== UTILIDADES =====
    function getCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.pageYOffset + (navbar ? navbar.offsetHeight : 0) + 50;
        
        for (const section of sections) {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            
            if (scrollPos >= top && scrollPos < top + height) {
                return section.getAttribute('id');
            }
        }
        
        return null;
    }

    function scrollToSection(sectionId, offset = 0) {
        const section = document.getElementById(sectionId);
        if (section) {
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            UtilsModule.smoothScrollTo(section, navbarHeight + offset);
            
            // Actualizar URL
            if (history.pushState) {
                history.pushState(null, null, `#${sectionId}`);
            }
            
            return true;
        }
        return false;
    }

    // ===== BREADCRUMBS (OPCIONAL) =====
    function updateBreadcrumbs() {
        const breadcrumbContainer = document.querySelector('.breadcrumbs');
        if (!breadcrumbContainer) return;
        
        const currentSection = getCurrentSection();
        const sectionTitles = {
            'inicio': 'Inicio',
            'quienes-somos': 'Quiénes Somos',
            'productos': 'Productos',
            'servicios': 'Servicios',
            'noticias': 'Noticias',
            'descargas': 'Descargas',
            'contacto': 'Contacto',
            'soporte': 'Soporte'
        };
        
        const title = sectionTitles[currentSection] || 'Inicio';
        breadcrumbContainer.innerHTML = `
            <span>INNOVATECH</span>
            <span class="separator">/</span>
            <span class="current">${title}</span>
        `;
    }

    // ===== API PÚBLICA =====
    return {
        init,
        toggleMobileMenu,
        closeMobileMenu,
        updateActiveNavigation,
        setLoadingState,
        showNavigation,
        hideNavigation,
        getCurrentSection,
        scrollToSection,
        updateBreadcrumbs,
        
        // Getters
        get isMenuOpen() { return isMenuOpen; },
        get navbar() { return navbar; },
        get navLinks() { return navLinks; }
    };
})();

// Disponible globalmente
window.NavigationModule = NavigationModule;