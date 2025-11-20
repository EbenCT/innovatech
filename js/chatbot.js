// ===== CHATBOT.JS - VERSIÓN MÓVIL MEJORADA =====

// ===== CONFIGURACIÓN GEMINI AI =====
const GEMINI_CONFIG = {
    apiKey: 'AIzaSyBGlm-5AWPOqQC8cNNLlJTMbvmsGNn5-T4',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    maxTokens: 1000,
    temperature: 0.7
};

// ===== CONTEXTO DE LA EMPRESA =====
const COMPANY_CONTEXT = `
Eres Sofia, asistente virtual de CODEPRIME, una empresa de desarrollo de software ubicada en Cotoca, Santa Cruz, Bolivia.

INFORMACIÓN DE LA EMPRESA:
- Nombre: CODEPRIME
- Fundada: 2020
- Ubicación: Av. Principal 123, Cotoca, Santa Cruz, Bolivia
- Email: contacto@CODEPRIME.com
- Teléfono: +591 7000-0000

SERVICIOS:
1. Desarrollo Web (React, Vue.js, Node.js) - 2-4 semanas
2. Aplicaciones Móviles (React Native, Flutter) - 6-12 semanas  
3. Sistemas ERP personalizados - 3-8 meses
4. Consultoría tecnológica

TECNOLOGÍAS:
- Frontend: React, Vue.js, Angular
- Backend: Node.js, Python, Java
- Móvil: React Native, Flutter
- Bases de datos: PostgreSQL, MongoDB
- Cloud: AWS, Azure, Google Cloud

INSTRUCCIONES:
- Responde de manera profesional pero amigable
- Mantén las respuestas concisas (máximo 3-4 líneas)
- Si no tienes información específica, ofrece conectar con un especialista
- Siempre menciona que puedes proporcionar presupuestos gratuitos
- Usa emojis moderadamente para hacer la conversación más amigable
`;

// ===== CLASE CHATBOT MEJORADA =====
class GeminiChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        this.conversationHistory = [];
        this.isMobile = window.innerWidth <= 480;
        
        this.initializeElements();
        this.setupEventListeners();
        this.addWelcomeMessage();
        this.setupMobileOptimizations();
    }
    
    initializeElements() {
        this.chatbotButton = document.getElementById('chatbot-button');
        this.chatbotWindow = document.getElementById('chatbot-window');
        this.chatbotClose = document.getElementById('chatbot-close');
        this.chatbotMessages = document.getElementById('chatbot-messages');
        this.chatbotInput = document.getElementById('chatbot-input');
        this.chatbotSend = document.getElementById('chatbot-send');
        
        if (!this.chatbotButton || !this.chatbotWindow) {
            console.error('❌ Elementos del chatbot no encontrados');
            return;
        }
    }
    
    setupEventListeners() {
        // Event listeners básicos
        this.chatbotButton.addEventListener('click', () => this.toggleChat());
        this.chatbotClose.addEventListener('click', () => this.toggleChat());
        this.chatbotSend.addEventListener('click', () => this.sendMessage());
        
        // Enter para enviar (pero no en móvil)
        this.chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !this.isMobile) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize del textarea
        this.chatbotInput.addEventListener('input', () => {
            this.autoResizeInput();
        });
        
        // Detectar cambios de orientación/tamaño
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Prevenir zoom en iOS
        if (this.isMobile) {
            this.chatbotInput.addEventListener('focus', () => {
                this.preventZoom();
            });
        }
    }
    
    setupMobileOptimizations() {
        this.isMobile = window.innerWidth <= 480;
        
        if (this.isMobile) {
            // Agregar clase para móvil
            document.body.classList.add('chatbot-mobile');
            
            // Cambiar placeholder en móvil
            if (this.chatbotInput) {
                this.chatbotInput.placeholder = 'Escribe aquí...';
            }
            
            // Configurar viewport para móvil
            this.setupMobileViewport();
        }
    }
    
    setupMobileViewport() {
        // Prevenir scroll del body cuando el chat está abierto
        if (this.isOpen && this.isMobile) {
            document.body.style.overflow = 'hidden';
        }
    }
    
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 480;
        
        if (wasMobile !== this.isMobile) {
            this.setupMobileOptimizations();
            
            // Si cambió de móvil a desktop y el chat está abierto, ajustar
            if (this.isOpen) {
                this.adjustChatPosition();
            }
        }
    }
    
    adjustChatPosition() {
        if (this.isMobile) {
            // En móvil, el chat ocupa toda la pantalla
            this.chatbotWindow.style.position = 'fixed';
            this.chatbotWindow.style.top = '60px';
            this.chatbotWindow.style.left = '8px';
            this.chatbotWindow.style.right = '8px';
            this.chatbotWindow.style.bottom = '8px';
            this.chatbotWindow.style.width = 'auto';
            this.chatbotWindow.style.height = 'auto';
        } else {
            // En desktop, posición normal
            this.chatbotWindow.style.position = 'fixed';
            this.chatbotWindow.style.top = 'auto';
            this.chatbotWindow.style.left = 'auto';
            this.chatbotWindow.style.right = '20px';
            this.chatbotWindow.style.bottom = '80px';
            this.chatbotWindow.style.width = '380px';
            this.chatbotWindow.style.height = '500px';
        }
    }
    
    toggleChat() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.openChat();
        } else {
            this.closeChat();
        }
    }
    
    openChat() {
        this.chatbotWindow.classList.add('active');
        this.chatbotWindow.style.display = 'flex';
        
        // Ajustar posición según dispositivo
        this.adjustChatPosition();
        
        // En móvil, prevenir scroll del body
        if (this.isMobile) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('chatbot-open');
        }
        
        // Enfocar input después de abrir
        setTimeout(() => {
            if (this.chatbotInput && !this.isMobile) {
                this.chatbotInput.focus();
            }
        }, 300);
        
        // Scroll al último mensaje
        this.scrollToBottom();
        
        console.log('💬 Chatbot abierto');
    }
    
    closeChat() {
        this.chatbotWindow.classList.remove('active');
        
        // Animación de cierre
        setTimeout(() => {
            this.chatbotWindow.style.display = 'none';
        }, 300);
        
        // Restaurar scroll del body
        if (this.isMobile) {
            document.body.style.overflow = '';
            document.body.classList.remove('chatbot-open');
        }
        
        console.log('💬 Chatbot cerrado');
    }
    
    autoResizeInput() {
        const input = this.chatbotInput;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 80) + 'px';
    }
    
    preventZoom() {
        // En iOS, establecer font-size mínimo de 16px previene el zoom
        if (this.isMobile && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
            this.chatbotInput.style.fontSize = '16px';
        }
    }
    
    async sendMessage() {
        const message = this.chatbotInput.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Limpiar input
        this.chatbotInput.value = '';
        this.autoResizeInput();
        
        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        
        // Mostrar indicador de escritura
        this.showTypingIndicator();
        
        try {
            // Generar respuesta
            const response = await this.generateResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            console.error('❌ Error al generar respuesta:', error);
            this.hideTypingIndicator();
            this.addMessage(this.getFallbackResponse(), 'bot');
        }
        
        // En móvil, mantener el input visible
        if (this.isMobile) {
            setTimeout(() => {
                this.chatbotInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }
    
    async generateResponse(userMessage) {
        if (!GEMINI_CONFIG.apiKey || GEMINI_CONFIG.apiKey.includes('YOUR_API_KEY')) {
            return this.getLocalResponse(userMessage);
        }
        
        try {
            const response = await fetch(`${GEMINI_CONFIG.apiUrl}?key=${GEMINI_CONFIG.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${COMPANY_CONTEXT}\n\nUsuario: ${userMessage}\nSofia:`
                        }]
                    }],
                    generationConfig: {
                        temperature: GEMINI_CONFIG.temperature,
                        maxOutputTokens: GEMINI_CONFIG.maxTokens
                    }
                })
            });
            
            if (!response.ok) throw new Error('API Error');
            
            const data = await response.json();
            return data.candidates[0].content.parts[0].text.trim();
            
        } catch (error) {
            console.error('❌ Error con Gemini API:', error);
            return this.getLocalResponse(userMessage);
        }
    }
    
    getLocalResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Respuestas básicas predefinidas
        const responses = {
            'hola': '¡Hola! 👋 Soy Sofia, tu asistente virtual de CODEPRIME. ¿En qué puedo ayudarte?',
            'servicios': 'Ofrecemos desarrollo web, apps móviles, sistemas ERP y consultoría tecnológica. ¿Te interesa algún servicio en particular? 💻',
            'precios': 'Los precios varían según el proyecto. ¿Podrías contarme más sobre lo que necesitas? Te preparo un presupuesto gratuito 💰',
            'contacto': 'Puedes contactarnos:\n📧 contacto@CODEPRIME.com\n📱 +591 7000-0000\n📍 Cotoca, Santa Cruz, Bolivia',
            'tiempo': 'Los tiempos dependen del proyecto:\n🌐 Web: 2-4 semanas\n📱 App móvil: 6-12 semanas\n🏢 ERP: 3-8 meses',
            'tecnologias': 'Trabajamos con React, Vue.js, React Native, Node.js, Python y más. ¿Tienes alguna preferencia tecnológica? ⚡',
            'ubicacion': 'Estamos ubicados en Av. Principal 123, Cotoca, Santa Cruz, Bolivia 🇧🇴',
            'gracias': '¡De nada! 😊 Estoy aquí para ayudarte. ¿Hay algo más en lo que pueda asistirte?',
            'adios': '¡Hasta pronto! 👋 No dudes en contactarnos cuando necesites. ¡Que tengas un excelente día!'
        };
        
        // Buscar coincidencias
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }
        
        // Respuesta por defecto
        return 'Gracias por tu mensaje. Un especialista te contactará pronto para brindarte información detallada. ¿Hay algo específico en lo que pueda ayudarte? 🤔';
    }
    
    getFallbackResponse() {
        const fallbackResponses = [
            "Lo siento, tuve un problema técnico. ¿Podrías repetir tu pregunta? 🔧",
            "Disculpa, no pude procesar tu mensaje. Un especialista se contactará contigo pronto. 📞",
            "Parece que hay un problema con mi conexión. ¿Te gustaría que te llame un experto? ☎️"
        ];
        
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        this.chatbotSend.disabled = true;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;
        
        this.chatbotMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        this.chatbotSend.disabled = false;
        
        const typingIndicator = this.chatbotMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        // Formatear mensaje
        const formattedText = this.formatMessage(text);
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${formattedText}
                <span class="message-time">${this.getCurrentTime()}</span>
            </div>
        `;
        
        this.chatbotMessages.appendChild(messageDiv);
        this.messages.push({ text, sender, timestamp: new Date() });
        
        this.scrollToBottom();
        
        // Limitar mensajes mostrados (importante para móviles)
        if (this.messages.length > 50) {
            const firstMessage = this.chatbotMessages.firstChild;
            if (firstMessage) {
                this.chatbotMessages.removeChild(firstMessage);
                this.messages.shift();
            }
        }
    }
    
    formatMessage(text) {
        // Formatear el texto para mejor presentación
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
            .replace(/([^\s@]+@[^\s@]+\.[^\s@]+)/g, '<a href="mailto:$1">$1</a>')
            .replace(/(\+?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9})/g, '<a href="tel:$1">$1</a>');
    }
    
    getCurrentTime() {
        return new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    scrollToBottom() {
        // Usar requestAnimationFrame para mejor rendimiento
        requestAnimationFrame(() => {
            if (this.chatbotMessages) {
                this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
            }
        });
    }
    
    addWelcomeMessage() {
        setTimeout(() => {
            const welcomeMessages = [
                "¡Hola! 👋 Soy Sofia, tu asistente virtual de CODEPRIME.",
                "Estoy aquí para ayudarte con información sobre nuestros servicios de desarrollo de software. ¿En qué puedo asistirte? 😊"
            ];
            
            welcomeMessages.forEach((message, index) => {
                setTimeout(() => {
                    this.addMessage(message, 'bot');
                }, index * 1500);
            });
        }, 1000);
    }
    
    // ===== MÉTODOS ADICIONALES PARA MÓVIL =====
    
    handleMobileKeyboard() {
        // Detectar cuando se abre/cierra el teclado virtual
        if (this.isMobile && 'visualViewport' in window) {
            window.visualViewport.addEventListener('resize', () => {
                const viewport = window.visualViewport;
                const isKeyboardOpen = viewport.height < window.innerHeight * 0.75;
                
                if (isKeyboardOpen && this.isOpen) {
                    // Ajustar chat cuando se abre el teclado
                    this.chatbotWindow.style.height = `${viewport.height - 60}px`;
                    this.scrollToBottom();
                } else if (this.isOpen) {
                    // Restaurar altura normal
                    this.chatbotWindow.style.height = 'auto';
                }
            });
        }
    }
    
    addMobileGestures() {
        if (!this.isMobile) return;
        
        let startY;
        let currentY;
        
        // Deslizar hacia abajo para cerrar (solo en móvil)
        this.chatbotWindow.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        this.chatbotWindow.addEventListener('touchmove', (e) => {
            if (!startY) return;
            
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            
            // Solo permitir deslizar hacia abajo desde la parte superior
            if (diff > 0 && this.chatbotMessages.scrollTop === 0) {
                e.preventDefault();
                this.chatbotWindow.style.transform = `translateY(${Math.min(diff, 100)}px)`;
                this.chatbotWindow.style.opacity = 1 - (diff / 200);
            }
        }, { passive: false });
        
        this.chatbotWindow.addEventListener('touchend', () => {
            if (!startY || !currentY) return;
            
            const diff = currentY - startY;
            
            if (diff > 100) {
                // Cerrar chat si se deslizó suficiente
                this.toggleChat();
            }
            
            // Restaurar posición
            this.chatbotWindow.style.transform = '';
            this.chatbotWindow.style.opacity = '';
            
            startY = null;
            currentY = null;
        }, { passive: true });
    }
    
    setupAccessibility() {
        // Mejorar accesibilidad
        this.chatbotButton.setAttribute('aria-label', 'Abrir asistente virtual');
        this.chatbotButton.setAttribute('role', 'button');
        
        this.chatbotWindow.setAttribute('role', 'dialog');
        this.chatbotWindow.setAttribute('aria-labelledby', 'chatbot-title');
        
        this.chatbotMessages.setAttribute('role', 'log');
        this.chatbotMessages.setAttribute('aria-live', 'polite');
        
        this.chatbotInput.setAttribute('aria-label', 'Escribir mensaje');
        this.chatbotSend.setAttribute('aria-label', 'Enviar mensaje');
        
        // Manejo de teclas de escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.toggleChat();
            }
        });
    }
    
    // ===== INICIALIZACIÓN COMPLETA =====
    init() {
        if (!this.chatbotButton || !this.chatbotWindow) {
            console.error('❌ Elementos del chatbot no encontrados');
            return;
        }
        
        this.setupMobileOptimizations();
        this.handleMobileKeyboard();
        this.addMobileGestures();
        this.setupAccessibility();
        
        console.log('✅ Gemini Chatbot inicializado correctamente');
        
        // Verificar configuración de API
        if (!GEMINI_CONFIG.apiKey || GEMINI_CONFIG.apiKey.includes('YOUR_API_KEY')) {
            console.warn('⚠️ Recuerda configurar tu API key de Gemini en GEMINI_CONFIG.apiKey');
        }
    }
}

// ===== ESTILOS ADICIONALES PARA MÓVIL =====
function addMobileChatbotStyles() {
    if (document.querySelector('#mobile-chatbot-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'mobile-chatbot-styles';
    style.textContent = `
        /* Estilos adicionales para móvil */
        .chatbot-mobile #chatbot-window {
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .chatbot-open {
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
        }
        
        @media (max-width: 480px) {
            .chatbot-mobile .message {
                font-size: 14px;
                line-height: 1.4;
            }
            
            .chatbot-mobile .message-time {
                font-size: 11px;
            }
            
            .chatbot-mobile #chatbot-input {
                font-size: 16px !important; /* Evita zoom en iOS */
                border-radius: 20px;
                padding: 10px 15px;
            }
            
            .chatbot-mobile #chatbot-send {
                border-radius: 20px;
                min-width: 44px; /* Tamaño mínimo de touch target */
                height: 44px;
            }
            
            .chatbot-mobile .chatbot-input {
                padding: 12px;
                background: #f8f9fa;
            }
            
            /* Mejorar contraste en móvil */
            .chatbot-mobile .bot-message {
                background: #ffffff;
                border: 1px solid #e1e5e9;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            
            .chatbot-mobile .user-message {
                background: linear-gradient(135deg, #1a237e, #3f51b5);
                box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            }
        }
        
        /* Animaciones optimizadas para móvil */
        @media (max-width: 480px) and (prefers-reduced-motion: no-preference) {
            .chatbot-mobile #chatbot-window.active {
                animation: mobileSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
        }
        
        @keyframes mobileSlideUp {
            from {
                opacity: 0;
                transform: translateY(100%);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Ajustes para teclado virtual */
        @media (max-width: 480px) {
            .keyboard-open #chatbot-window {
                height: calc(var(--vh, 1vh) * 100 - 60px) !important;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Agregar estilos móviles
    addMobileChatbotStyles();
    
    // Detectar altura real del viewport en móviles
    function setVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
        setTimeout(setVH, 100);
    });
    
    // Inicializar chatbot
    const chatbot = new GeminiChatbot();
    chatbot.init();
    
    // Hacer disponible globalmente para debug
    window.chatbot = chatbot;
});