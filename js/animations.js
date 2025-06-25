// ===== ANIMATIONS.JS - MÓDULO DE ANIMACIONES =====

const AnimationsModule = (function() {
    'use strict';

    // ===== VARIABLES PRIVADAS =====
    let animatedElements = [];
    let observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    // ===== INICIALIZACIÓN =====
    function init() {
        setupAnimatedElements();
        setupIntersectionObserver();
        setupScrollAnimations();
        setupHoverEffects();
        console.log('✅ AnimationsModule inicializado');
    }

    // ===== CONFIGURAR ELEMENTOS ANIMADOS =====
    function setupAnimatedElements() {
        // Seleccionar elementos que se animarán al entrar en el viewport
        const selectors = [
            '.product-card',
            '.service-item', 
            '.news-card',
            '.download-card',
            '.support-card',
            '.stat-item',
            '.team-member',
            '.feature-card',
            '.testimonial-card'
        ];

        animatedElements = document.querySelectorAll(selectors.join(', '));
        
        // Preparar elementos para animación
        animatedElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            element.setAttribute('data-animation-delay', index * 100); // Delay escalonado
        });

        console.log(`🎭 ${animatedElements.length} elementos preparados para animación`);
    }

    // ===== INTERSECTION OBSERVER =====
    function setupIntersectionObserver() {
        if (!window.IntersectionObserver) {
            // Fallback para navegadores antiguos
            revealAllElements();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateElementIn(entry.target);
                    observer.unobserve(entry.target); // Solo animar una vez
                }
            });
        }, observerOptions);

        // Observar todos los elementos animados
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    // ===== ANIMACIONES DE ENTRADA =====
    function animateElementIn(element) {
        const delay = parseInt(element.getAttribute('data-animation-delay')) || 0;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.classList.add('animated-in');
            
            // Trigger evento personalizado
            element.dispatchEvent(new CustomEvent('elementAnimatedIn'));
        }, delay);
    }

    function revealAllElements() {
        // Fallback: mostrar todos los elementos inmediatamente
        animatedElements.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    // ===== ANIMACIONES DE SCROLL =====
    function setupScrollAnimations() {
        // Parallax suave para hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            window.addEventListener('scroll', UtilsModule.throttle(() => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                heroSection.style.transform = `translateY(${rate}px)`;
            }, 16));
        }

        // Animación de contadores
        setupCounterAnimations();
        
        // Animación de barras de progreso
        setupProgressBarAnimations();
    }

    // ===== ANIMACIONES DE CONTADORES =====
    function setupCounterAnimations() {
        const counters = document.querySelectorAll('.counter, [data-counter]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target') || counter.textContent.replace(/\D/g, ''));
            const duration = parseInt(counter.getAttribute('data-duration')) || 2000;
            const suffix = counter.getAttribute('data-suffix') || '';
            
            counter.textContent = '0' + suffix;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(counter, target, duration, suffix);
                        observer.unobserve(counter);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }

    function animateCounter(element, target, duration, suffix) {
        const start = Date.now();
        const startValue = 0;
        
        function updateCounter() {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (target - startValue) * easeProgress);
            
            element.textContent = currentValue.toLocaleString() + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString() + suffix;
            }
        }
        
        updateCounter();
    }

    // ===== ANIMACIONES DE BARRAS DE PROGRESO =====
    function setupProgressBarAnimations() {
        const progressBars = document.querySelectorAll('.progress-bar, [data-progress]');
        
        progressBars.forEach(bar => {
            const percentage = parseInt(bar.getAttribute('data-progress') || bar.style.width);
            bar.style.width = '0%';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateProgressBar(bar, percentage);
                        observer.unobserve(bar);
                    }
                });
            });
            
            observer.observe(bar);
        });
    }

    function animateProgressBar(element, targetPercentage) {
        const duration = 1500;
        const start = Date.now();
        
        function updateProgress() {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeProgress = 1 - Math.pow(1 - progress, 2);
            const currentPercentage = targetPercentage * easeProgress;
            
            element.style.width = currentPercentage + '%';
            
            if (progress < 1) {
                requestAnimationFrame(updateProgress);
            }
        }
        
        updateProgress();
    }

    // ===== EFECTOS HOVER =====
    function setupHoverEffects() {
        // Efecto hover para tarjetas
        const cards = document.querySelectorAll('.product-card, .service-item, .news-card, .download-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
                card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '';
            });
        });

        // Efecto hover para botones
        const buttons = document.querySelectorAll('.btn, button');
        
        buttons.forEach(button => {
            if (!button.classList.contains('no-hover-effect')) {
                button.addEventListener('mouseenter', () => {
                    button.style.transform = 'translateY(-2px)';
                    button.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                });
                
                button.addEventListener('mouseleave', () => {
                    button.style.transform = 'translateY(0)';
                    button.style.boxShadow = '';
                });
            }
        });

        // Efecto ripple para botones
        setupRippleEffect();
    }

    // ===== EFECTO RIPPLE =====
    function setupRippleEffect() {
        const rippleButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
        
        rippleButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    pointer-events: none;
                `;
                
                // Asegurar posición relativa en el botón
                if (getComputedStyle(this).position === 'static') {
                    this.style.position = 'relative';
                }
                
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                // Remover el ripple después de la animación
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }

    // ===== ANIMACIONES DE LOADING =====
    function showLoadingAnimation() {
        const loader = document.createElement('div');
        loader.className = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <div class="loader-text">Cargando...</div>
            </div>
        `;
        
        document.body.appendChild(loader);
        return loader;
    }

    function hideLoadingAnimation() {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    }

    // ===== ANIMACIONES DE TEXTO =====
    function setupTextAnimations() {
        const typewriterElements = document.querySelectorAll('.typewriter');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            const speed = parseInt(element.getAttribute('data-speed')) || 50;
            
            element.textContent = '';
            element.style.borderRight = '2px solid';
            element.style.animation = 'blink 1s infinite';
            
            typewriterEffect(element, text, speed);
        });
    }

    function typewriterEffect(element, text, speed) {
        let i = 0;
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                // Remover cursor después de completar
                setTimeout(() => {
                    element.style.borderRight = 'none';
                    element.style.animation = 'none';
                }, 1000);
            }
        }
        
        // Observar cuando el elemento entre en vista
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    type();
                    observer.unobserve(element);
                }
            });
        });
        
        observer.observe(element);
    }

    // ===== ANIMACIONES DE PARTÍCULAS =====
    function setupParticleAnimation(container) {
        if (!container) return;
        
        const particleCount = 50;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                pointer-events: none;
            `;
            
            container.appendChild(particle);
            particles.push({
                element: particle,
                x: Math.random() * container.offsetWidth,
                y: Math.random() * container.offsetHeight,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2
            });
        }
        
        function animateParticles() {
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Rebotar en los bordes
                if (particle.x <= 0 || particle.x >= container.offsetWidth) {
                    particle.vx *= -1;
                }
                if (particle.y <= 0 || particle.y >= container.offsetHeight) {
                    particle.vy *= -1;
                }
                
                particle.element.style.left = particle.x + 'px';
                particle.element.style.top = particle.y + 'px';
            });
            
            requestAnimationFrame(animateParticles);
        }
        
        animateParticles();
    }

    // ===== ANIMACIONES DE MODAL =====
    function animateModalIn(modal) {
        modal.style.cssText = `
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        });
    }

    function animateModalOut(modal) {
        return new Promise(resolve => {
            modal.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                resolve();
            }, 300);
        });
    }

    // ===== ANIMACIONES DE NOTIFICACIÓN =====
    function animateNotificationIn(notification) {
        notification.style.cssText += `
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
    }

    function animateNotificationOut(notification) {
        return new Promise(resolve => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(resolve, 300);
        });
    }

    // ===== REVEAL ELEMENTS (LLAMADO DESDE SCROLL) =====
    function revealElements() {
        // Esta función es llamada desde el scroll handler del main.js
        // Aquí puedes agregar lógica adicional de animaciones basadas en scroll
        
        // Ejemplo: Fade in para elementos con clase .fade-in-on-scroll
        const fadeElements = document.querySelectorAll('.fade-in-on-scroll:not(.faded-in)');
        
        fadeElements.forEach(element => {
            if (UtilsModule.isElementInViewport(element)) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                element.classList.add('faded-in');
            }
        });
    }

    // ===== PRESETS DE ANIMACIÓN =====
    const animationPresets = {
        fadeIn: {
            from: { opacity: 0 },
            to: { opacity: 1 },
            duration: 600
        },
        slideInUp: {
            from: { opacity: 0, transform: 'translateY(30px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
            duration: 600
        },
        slideInLeft: {
            from: { opacity: 0, transform: 'translateX(-30px)' },
            to: { opacity: 1, transform: 'translateX(0)' },
            duration: 600
        },
        slideInRight: {
            from: { opacity: 0, transform: 'translateX(30px)' },
            to: { opacity: 1, transform: 'translateX(0)' },
            duration: 600
        },
        zoomIn: {
            from: { opacity: 0, transform: 'scale(0.8)' },
            to: { opacity: 1, transform: 'scale(1)' },
            duration: 600
        },
        bounce: {
            from: { transform: 'scale(1)' },
            to: { transform: 'scale(1.1)' },
            duration: 200,
            yoyo: true
        }
    };

    function animateElement(element, preset, callback) {
        const animation = animationPresets[preset];
        if (!animation) return;
        
        // Aplicar estilos iniciales
        Object.assign(element.style, animation.from);
        element.style.transition = `all ${animation.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        requestAnimationFrame(() => {
            Object.assign(element.style, animation.to);
            
            if (callback) {
                setTimeout(callback, animation.duration);
            }
            
            // Efecto yoyo si está especificado
            if (animation.yoyo) {
                setTimeout(() => {
                    Object.assign(element.style, animation.from);
                }, animation.duration);
            }
        });
    }

    // ===== AGREGAR ESTILOS CSS =====
    function addAnimationStyles() {
        if (!document.querySelector('#animation-styles')) {
            const style = document.createElement('style');
            style.id = 'animation-styles';
            style.textContent = `
                @keyframes ripple {
                    to { transform: scale(4); opacity: 0; }
                }
                
                @keyframes blink {
                    0%, 50% { border-color: transparent; }
                    51%, 100% { border-color: currentColor; }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                .page-loader {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(26, 35, 126, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    transition: opacity 0.3s ease;
                }
                
                .loader-content {
                    text-align: center;
                    color: white;
                }
                
                .loader-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    border-top: 4px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                
                .loader-text {
                    font-size: 18px;
                    font-weight: 600;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .fade-in-on-scroll {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.6s ease;
                }
                
                .faded-in {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }
                
                .animated-in {
                    animation: slideInUp 0.6s ease forwards;
                }
                
                /* Efectos hover mejorados */
                .product-card, .service-item, .news-card, .download-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .btn, button {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                
                /* Animaciones de entrada escalonadas */
                .stagger-animation > * {
                    opacity: 0;
                    transform: translateY(20px);
                    animation: slideInUp 0.6s ease forwards;
                }
                
                .stagger-animation > *:nth-child(1) { animation-delay: 0.1s; }
                .stagger-animation > *:nth-child(2) { animation-delay: 0.2s; }
                .stagger-animation > *:nth-child(3) { animation-delay: 0.3s; }
                .stagger-animation > *:nth-child(4) { animation-delay: 0.4s; }
                .stagger-animation > *:nth-child(5) { animation-delay: 0.5s; }
                .stagger-animation > *:nth-child(6) { animation-delay: 0.6s; }
            `;
            document.head.appendChild(style);
        }
    }

    // Agregar estilos al inicializar
    addAnimationStyles();

    // ===== API PÚBLICA =====
    return {
        init,
        revealElements,
        animateElementIn,
        animateElement,
        animateModalIn,
        animateModalOut,
        animateNotificationIn,
        animateNotificationOut,
        showLoadingAnimation,
        hideLoadingAnimation,
        setupTextAnimations,
        setupParticleAnimation,
        
        // Presets
        presets: animationPresets,
        
        // Getters
        get animatedElements() { return animatedElements; }
    };
})();

// Disponible globalmente
window.AnimationsModule = AnimationsModule;