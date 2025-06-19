// ===== CHATBOT CONFIGURATION =====
const CHATBOT_CONFIG = {
    name: 'Sofia',
    company: 'INNOVATECH',
    responseDelay: 1000,
    typingDelay: 2000,
    maxMessages: 50
};

// ===== PREDEFINED RESPONSES =====
const CHATBOT_RESPONSES = {
    // Saludos
    greetings: [
        '¡Hola! Soy Sofia, tu asistente virtual de INNOVATECH. ¿En qué puedo ayudarte hoy?',
        '¡Buen día! Soy Sofia y estoy aquí para ayudarte con cualquier consulta sobre nuestros servicios.',
        '¡Hola! ¿Cómo puedo asistirte hoy? Estoy aquí para resolver tus dudas sobre INNOVATECH.'
    ],
    
    // Despedidas
    farewells: [
        '¡Ha sido un placer ayudarte! No dudes en contactarnos si necesitas algo más.',
        '¡Hasta pronto! Esperamos poder trabajar contigo en tu próximo proyecto.',
        'Gracias por contactarnos. ¡Que tengas un excelente día!'
    ],
    
    // Servicios
    services: {
        web: 'Desarrollamos aplicaciones web modernas usando React, Vue.js, Node.js y tecnologías en la nube. Nuestras soluciones son escalables, seguras y optimizadas para rendimiento.',
        mobile: 'Creamos aplicaciones móviles nativas e híbridas para iOS y Android usando React Native y Flutter. Incluimos diseño UX/UI y integración con APIs.',
        erp: 'Nuestros sistemas ERP personalizados ayudan a gestionar todos los recursos empresariales: finanzas, inventarios, recursos humanos y reportes avanzados.',
        consultoria: 'Ofrecemos consultoría tecnológica para analizar tus necesidades y recomendar las mejores soluciones para optimizar tus procesos de negocio.'
    },
    
    // Información de la empresa
    company: {
        about: 'INNOVATECH es una empresa de desarrollo de software fundada en 2020. Nos especializamos en crear soluciones tecnológicas innovadoras para empresas de todos los tamaños.',
        team: 'Contamos con un equipo de desarrolladores senior especializados en tecnologías modernas como React, Node.js, Python, Flutter y cloud computing.',
        experience: 'Hemos completado más de 50 proyectos exitosos para 25+ clientes satisfechos en nuestros 5 años de experiencia.',
        location: 'Estamos ubicados en Cotoca, Santa Cruz, Bolivia. Trabajamos tanto local como remotamente con clientes internacionales.'
    },
    
    // Precios y presupuestos
    pricing: 'Los costos varían según la complejidad del proyecto. Ofrecemos presupuestos gratuitos y personalizados. ¿Te gustaría que un especialista se contacte contigo para evaluar tu proyecto?',
    
    // Contacto
    contact: 'Puedes contactarnos por:\n📧 Email: contacto@InnovaTech.com\n📱 Teléfono: +591 7000-0000\n📍 Dirección: Av. Principal 123, Cotoca, Santa Cruz\n\n¿Prefieres que te llame un especialista?',
    
    // Tiempo de desarrollo
    timeline: 'Los tiempos varían según el proyecto:\n• Páginas web: 2-4 semanas\n• Apps móviles: 6-12 semanas\n• Sistemas ERP: 3-8 meses\n\nPodemos darte un cronograma específico después de evaluar tus requerimientos.',
    
    // Tecnologías
    technologies: 'Trabajamos con tecnologías modernas:\n• Frontend: React, Vue.js, Angular\n• Backend: Node.js, Python, Java\n• Móvil: React Native, Flutter\n• Base de datos: PostgreSQL, MongoDB\n• Cloud: AWS, Azure, Google Cloud',
    
    // Soporte
    support: 'Ofrecemos diferentes niveles de soporte:\n• Soporte básico: Lun-Vie 9-18h\n• Soporte premium: 24/7\n• Mantenimiento preventivo\n• Actualizaciones y mejoras\n\n¿Qué tipo de soporte necesitas?',
    
    // Default response
    default: [
        'Interesante pregunta. Te conectaré con un especialista para darte una respuesta más detallada. ¿Cuál es tu email?',
        'No tengo información específica sobre eso, pero puedo conectarte con nuestro equipo técnico. ¿Te parece bien?',
        'Esa es una consulta muy específica. ¿Te gustaría que un experto se comunique contigo para darte todos los detalles?'
    ]
};

// ===== KEYWORDS MAPPING =====
const KEYWORDS = {
    greetings: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos', 'hey', 'ola'],
    farewells: ['adios', 'chau', 'hasta luego', 'nos vemos', 'gracias', 'bye'],
    services: {
        web: ['web', 'pagina', 'website', 'sitio', 'aplicacion web', 'plataforma'],
        mobile: ['movil', 'app', 'aplicacion', 'android', 'ios', 'telefono'],
        erp: ['erp', 'sistema', 'gestion', 'empresarial', 'inventario', 'finanzas'],
        consultoria: ['consultoria', 'asesoramiento', 'analisis', 'recomendacion']
    },
    company: {
        about: ['empresa', 'acerca', 'quienes son', 'historia', 'fundacion'],
        team: ['equipo', 'desarrolladores', 'programadores', 'staff'],
        experience: ['experiencia', 'proyectos', 'clientes', 'tiempo'],
        location: ['ubicacion', 'direccion', 'donde', 'oficina']
    },
    pricing: ['precio', 'costo', 'cuanto', 'tarifa', 'presupuesto', 'cotizacion'],
    contact: ['contacto', 'telefono', 'email', 'direccion', 'comunicarse'],
    timeline: ['tiempo', 'duracion', 'cronograma', 'cuando', 'demora'],
    technologies: ['tecnologia', 'lenguaje', 'framework', 'herramientas'],
    support: ['soporte', 'ayuda', 'mantenimiento', 'asistencia']
};

// ===== CHATBOT CLASS =====
class InnovaTechChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        this.userAwaitingResponse = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.addWelcomeMessage();
    }
    
    initializeElements() {
        this.chatbotButton = document.getElementById('chatbot-button');
        this.chatbotWindow = document.getElementById('chatbot-window');
        this.chatbotClose = document.getElementById('chatbot-close');
        this.chatbotMessages = document.getElementById('chatbot-messages');
        this.chatbotInput = document.getElementById('chatbot-input');
        this.chatbotSend = document.getElementById('chatbot-send');
    }
    
    setupEventListeners() {
        this.chatbotButton.addEventListener('click', () => this.toggleChat());
        this.chatbotClose.addEventListener('click', () => this.closeChat());
        this.chatbotSend.addEventListener('click', () => this.sendMessage());
        
        this.chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        this.chatbotInput.addEventListener('input', () => this.handleTyping());
    }
    
    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatbotWindow.classList.toggle('active', this.isOpen);
        
        if (this.isOpen) {
            this.chatbotInput.focus();
            this.trackEvent('chatbot_opened');
        } else {
            this.trackEvent('chatbot_closed');
        }
    }
    
    closeChat() {
        this.isOpen = false;
        this.chatbotWindow.classList.remove('active');
        this.trackEvent('chatbot_closed');
    }
    
    addWelcomeMessage() {
        const welcomeMessage = CHATBOT_RESPONSES.greetings[0];
        this.addMessage(welcomeMessage, 'bot');
    }
    
    sendMessage() {
        const message = this.chatbotInput.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Añadir mensaje del usuario
        this.addMessage(message, 'user');
        this.chatbotInput.value = '';
        
        // Procesar respuesta
        this.processUserMessage(message);
        
        // Track event
        this.trackEvent('message_sent', message);
    }
    
    addMessage(text, sender, delay = 0) {
        setTimeout(() => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${sender}-message`;
            messageElement.textContent = text;
            
            this.chatbotMessages.appendChild(messageElement);
            this.scrollToBottom();
            
            // Limitar número de mensajes
            if (this.chatbotMessages.children.length > CHATBOT_CONFIG.maxMessages) {
                this.chatbotMessages.removeChild(this.chatbotMessages.firstChild);
            }
            
            this.messages.push({ text, sender, timestamp: new Date() });
        }, delay);
    }
    
    processUserMessage(message) {
        this.showTypingIndicator();
        
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        }, CHATBOT_CONFIG.responseDelay);
    }
    
    generateResponse(message) {
        const normalizedMessage = this.normalizeText(message);
        
        // Detectar intención
        const intent = this.detectIntent(normalizedMessage);
        
        switch (intent.type) {
            case 'greeting':
                return this.getRandomResponse(CHATBOT_RESPONSES.greetings);
                
            case 'farewell':
                return this.getRandomResponse(CHATBOT_RESPONSES.farewells);
                
            case 'service':
                return CHATBOT_RESPONSES.services[intent.subtype];
                
            case 'company':
                return CHATBOT_RESPONSES.company[intent.subtype];
                
            case 'pricing':
                return CHATBOT_RESPONSES.pricing;
                
            case 'contact':
                return CHATBOT_RESPONSES.contact;
                
            case 'timeline':
                return CHATBOT_RESPONSES.timeline;
                
            case 'technologies':
                return CHATBOT_RESPONSES.technologies;
                
            case 'support':
                return CHATBOT_RESPONSES.support;
                
            default:
                return this.getRandomResponse(CHATBOT_RESPONSES.default);
        }
    }
    
    detectIntent(message) {
        // Detectar saludos
        if (this.containsKeywords(message, KEYWORDS.greetings)) {
            return { type: 'greeting' };
        }
        
        // Detectar despedidas
        if (this.containsKeywords(message, KEYWORDS.farewells)) {
            return { type: 'farewell' };
        }
        
        // Detectar servicios
        for (const [service, keywords] of Object.entries(KEYWORDS.services)) {
            if (this.containsKeywords(message, keywords)) {
                return { type: 'service', subtype: service };
            }
        }
        
        // Detectar información de empresa
        for (const [info, keywords] of Object.entries(KEYWORDS.company)) {
            if (this.containsKeywords(message, keywords)) {
                return { type: 'company', subtype: info };
            }
        }
        
        // Detectar otras intenciones
        if (this.containsKeywords(message, KEYWORDS.pricing)) {
            return { type: 'pricing' };
        }
        
        if (this.containsKeywords(message, KEYWORDS.contact)) {
            return { type: 'contact' };
        }
        
        if (this.containsKeywords(message, KEYWORDS.timeline)) {
            return { type: 'timeline' };
        }
        
        if (this.containsKeywords(message, KEYWORDS.technologies)) {
            return { type: 'technologies' };
        }
        
        if (this.containsKeywords(message, KEYWORDS.support)) {
            return { type: 'support' };
        }
        
        return { type: 'unknown' };
    }
    
    containsKeywords(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }
    
    normalizeText(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remover acentos
            .replace(/[^\w\s]/g, ' ') // Remover puntuación
            .replace(/\s+/g, ' ') // Normalizar espacios
            .trim();
    }
    
    getRandomResponse(responses) {
        if (Array.isArray(responses)) {
            return responses[Math.floor(Math.random() * responses.length)];
        }
        return responses;
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        const typingElement = document.createElement('div');
        typingElement.className = 'message bot-message typing-indicator';
        typingElement.innerHTML = '<span></span><span></span><span></span>';
        typingElement.id = 'typing-indicator';
        
        // Estilos para el indicador
        const style = document.createElement('style');
        style.textContent = `
            .typing-indicator span {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #666;
                margin: 0 1px;
                animation: typing 1.4s infinite;
            }
            .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
            .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
            
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
                30% { transform: translateY(-10px); opacity: 1; }
            }
        `;
        
        if (!document.querySelector('#typing-styles')) {
            style.id = 'typing-styles';
            document.head.appendChild(style);
        }
        
        this.chatbotMessages.appendChild(typingElement);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }
    
    handleTyping() {
        // Aquí puedes añadir lógica para sugerencias mientras el usuario escribe
        const inputValue = this.chatbotInput.value.toLowerCase();
        
        // Mostrar sugerencias rápidas (opcional)
        if (inputValue.length > 2) {
            this.showQuickSuggestions(inputValue);
        }
    }
    
    showQuickSuggestions(input) {
        // Implementar sugerencias rápidas basadas en el input
        const suggestions = [];
        
        if (input.includes('precio') || input.includes('costo')) {
            suggestions.push('¿Cuánto cuesta desarrollar una app?');
        }
        
        if (input.includes('tiempo') || input.includes('cuando')) {
            suggestions.push('¿Cuánto tiempo toma un proyecto?');
        }
        
        if (input.includes('contacto')) {
            suggestions.push('¿Cómo puedo contactarlos?');
        }
        
        // Mostrar sugerencias (implementar UI si se desea)
    }
    
    scrollToBottom() {
        this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    }
    
    trackEvent(action, label = '') {
        // Integración con analytics
        if (typeof window.InnovaTechApp !== 'undefined') {
            window.InnovaTechApp.trackEvent(action, 'chatbot', label);
        }
        
        console.log('Chatbot Event:', { action, label });
    }
    
    // Método para añadir respuestas personalizadas
    addCustomResponse(keywords, response) {
        // Permitir añadir respuestas dinámicamente
        CHATBOT_RESPONSES.custom = CHATBOT_RESPONSES.custom || {};
        CHATBOT_RESPONSES.custom[keywords.join('_')] = response;
    }
    
    // Método para exportar conversación
    exportConversation() {
        const conversation = this.messages.map(msg => ({
            text: msg.text,
            sender: msg.sender,
            time: msg.timestamp.toLocaleString()
        }));
        
        return JSON.stringify(conversation, null, 2);
    }
    
    // Método para limpiar conversación
    clearConversation() {
        this.messages = [];
        this.chatbotMessages.innerHTML = '';
        this.addWelcomeMessage();
    }
}

// ===== UTILIDADES ADICIONALES =====

// Detectar si el usuario está en móvil
function isMobile() {
    return window.innerWidth <= 768;
}

// Formatear respuestas con enlaces
function formatResponse(text) {
    // Convertir URLs a enlaces
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    text = text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
    
    // Convertir emails a enlaces
    const emailRegex = /([^\s@]+@[^\s@]+\.[^\s@]+)/g;
    text = text.replace(emailRegex, '<a href="mailto:$1">$1</a>');
    
    return text;
}

// ===== INICIALIZACIÓN =====
let chatbot;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar chatbot después de que se cargue el DOM
    setTimeout(() => {
        chatbot = new InnovaTechChatbot();
        console.log('InnovaTech Chatbot initialized successfully');
    }, 1000);
});

// ===== EXPORT =====
window.InnovaTechChatbot = InnovaTechChatbot;

// ===== API PARA INTEGRACIONES EXTERNAS =====
window.ChatbotAPI = {
    sendMessage: (message) => chatbot?.addMessage(message, 'bot'),
    clearChat: () => chatbot?.clearConversation(),
    exportChat: () => chatbot?.exportConversation(),
    isOpen: () => chatbot?.isOpen || false,
    toggleChat: () => chatbot?.toggleChat()
};