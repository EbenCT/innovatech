// ===== UTILS.JS - MÓDULO DE UTILIDADES =====

const UtilsModule = (function() {
    'use strict';

    // ===== NOTIFICACIONES =====
    function showNotification(message, type = 'info', duration = 5000) {
        // Remover notificación previa
        const existingNotification = document.querySelector('.notification-toast');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification-toast notification-${type}`;
        
        // Configurar estilos base
        const baseStyles = {
            position: 'fixed',
            top: '20px',
            right: '20px',
            maxWidth: '400px',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            zIndex: '9999',
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.4',
            whiteSpace: 'pre-line',
            transform: 'translateX(100%)',
            opacity: '0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        };
        
        // Aplicar estilos base
        Object.assign(notification.style, baseStyles);
        
        // Estilos por tipo
        const typeStyles = {
            success: {
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                color: 'white',
                border: '1px solid #4CAF50'
            },
            error: {
                background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                color: 'white',
                border: '1px solid #f44336'
            },
            info: {
                background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                color: 'white',
                border: '1px solid #2196F3'
            },
            warning: {
                background: 'linear-gradient(135deg, #FF9800, #F57C00)',
                color: 'white',
                border: '1px solid #FF9800'
            }
        };
        
        // Aplicar estilos del tipo
        Object.assign(notification.style, typeStyles[type] || typeStyles.info);
        
        // Agregar icono
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        const icon = icons[type] || icons.info;
        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 10px;">
                <span style="font-size: 16px; flex-shrink: 0;">${icon}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">
                        ${type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                    <div>${message}</div>
                </div>
                <button onclick="this.closest('.notification-toast').remove()" 
                        style="background: none; border: none; color: inherit; font-size: 18px; cursor: pointer; opacity: 0.7; padding: 0; margin-left: 10px;">
                    ×
                </button>
            </div>
        `;
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Animar entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });
        
        // Auto-remover
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
        
        return notification;
    }

    // ===== VALIDACIONES =====
    function isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        // Aceptar números con formato internacional, nacional, con espacios, guiones, etc.
        const cleanPhone = phone.replace(/[^0-9+]/g, '');
        return cleanPhone.length >= 8 && cleanPhone.length <= 15;
    }

    function sanitizeInput(input) {
        return input.trim()
                   .replace(/[<>]/g, '') // Remover < y >
                   .replace(/script/gi, '') // Remover "script"
                   .slice(0, 1000); // Limitar longitud
    }

    // ===== UTILIDADES DE RENDIMIENTO =====
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
        };
    }

    // ===== DETECCIÓN DE DISPOSITIVOS =====
    function isMobile() {
        return window.innerWidth <= 768;
    }

    function isTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    function getBrowserInfo() {
        const ua = navigator.userAgent;
        return {
            isChrome: /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor),
            isFirefox: /Firefox/.test(ua),
            isSafari: /Safari/.test(ua) && /Apple Computer/.test(navigator.vendor),
            isEdge: /Edg/.test(ua),
            isMobile: isMobile(),
            isTouch: isTouch()
        };
    }

    // ===== UTILIDADES DE DOM =====
    function createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    function getElements(selector) {
        return document.querySelectorAll(selector);
    }

    function getElement(selector) {
        return document.querySelector(selector);
    }

    // ===== UTILIDADES DE ALMACENAMIENTO =====
    function setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('No se pudo guardar en localStorage:', e);
            return false;
        }
    }

    function getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('No se pudo leer de localStorage:', e);
            return defaultValue;
        }
    }

    function removeStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('No se pudo remover de localStorage:', e);
            return false;
        }
    }

    // ===== UTILIDADES DE FECHA =====
    function formatDate(date, locale = 'es-ES') {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    }

    function timeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
        
        const intervals = {
            año: 31536000,
            mes: 2592000,
            semana: 604800,
            día: 86400,
            hora: 3600,
            minuto: 60
        };
        
        for (const [unit, seconds] of Object.entries(intervals)) {
            const interval = Math.floor(diffInSeconds / seconds);
            if (interval >= 1) {
                return `hace ${interval} ${unit}${interval > 1 ? (unit === 'mes' ? 'es' : 's') : ''}`;
            }
        }
        
        return 'hace un momento';
    }

    // ===== UTILIDADES DE URL =====
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }

    function updateURL(params) {
        const url = new URL(window.location);
        for (const [key, value] of Object.entries(params)) {
            if (value === null || value === undefined) {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, value);
            }
        }
        window.history.pushState(null, '', url);
    }

    // ===== UTILIDADES DE SCROLL =====
    function smoothScrollTo(element, offset = 0) {
        const targetElement = typeof element === 'string' ? 
            document.querySelector(element) : element;
            
        if (!targetElement) return;
        
        const targetPosition = targetElement.offsetTop - offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    function isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // ===== API PÚBLICA =====
    return {
        // Notificaciones
        showNotification,
        
        // Validaciones
        isValidEmail,
        isValidPhone,
        sanitizeInput,
        
        // Rendimiento
        debounce,
        throttle,
        
        // Dispositivos
        isMobile,
        isTouch,
        getBrowserInfo,
        
        // DOM
        createElement,
        getElements,
        getElement,
        
        // Almacenamiento
        setStorage,
        getStorage,
        removeStorage,
        
        // Fechas
        formatDate,
        timeAgo,
        
        // URL
        getQueryParams,
        updateURL,
        
        // Scroll
        smoothScrollTo,
        isElementInViewport
    };
})();

// Disponible globalmente
window.UtilsModule = UtilsModule;