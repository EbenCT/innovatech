// ===== CONFIGURACIÓN GEMINI AI =====
const GEMINI_CONFIG = {
    apiKey: 'AIzaSyDtVbJLqjH_HiNXnW3v_l7YbtFoC7exxts', // Reemplaza con tu clave API
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    maxTokens: 1000,
    temperature: 0.7
};

// ===== CONTEXTO DE LA EMPRESA =====
const COMPANY_CONTEXT = `
Eres Sofia, asistente virtual de INNOVATECH, una empresa de desarrollo de software ubicada en Cotoca, Santa Cruz, Bolivia.

INFORMACIÓN DE LA EMPRESA:
- Nombre: INNOVATECH
- Fundada: 2020
- Ubicación: Av. Principal 123, Cotoca, Santa Cruz, Bolivia
- Email: contacto@InnovaTech.com
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
        this.chatbotClose.addEventListener('click', () => this.toggleChat());
        this.chatbotSend.addEventListener('click', () => this.sendMessage());
        
        this.chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Auto-resize del input
        this.chatbotInput.addEventListener('input', () => {
            this.chatbotInput.style.height = 'auto';
            this.chatbotInput.style.height = this.chatbotInput.scrollHeight + 'px';
        });
    }
    
    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatbotWindow.style.display = this.isOpen ? 'flex' : 'none';
        
        if (this.isOpen) {
            this.chatbotInput.focus();
            this.scrollToBottom();
        }
    }
    
    addWelcomeMessage() {
        const welcomeMessage = "¡Hola! 👋 Soy Sofia, tu asistente virtual de INNOVATECH. ¿En qué puedo ayudarte hoy?";
        this.addMessage(welcomeMessage, 'bot');
    }
    
    async sendMessage() {
        const message = this.chatbotInput.value.trim();
        
        if (!message) return;
        
        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        this.chatbotInput.value = '';
        this.chatbotInput.style.height = 'auto';
        
        // Mostrar indicador de escritura
        this.showTypingIndicator();
        
        try {
            // Obtener respuesta de Gemini
            const response = await this.getGeminiResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            console.error('Error al obtener respuesta:', error);
            this.hideTypingIndicator();
            this.addMessage(this.getFallbackResponse(message), 'bot');
        }
    }
    
    async getGeminiResponse(userMessage) {
        // Agregar mensaje al historial de conversación
        this.conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });
        
        // Preparar el prompt con contexto
        const fullPrompt = `${COMPANY_CONTEXT}\n\nUsuario: ${userMessage}`;
        
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: fullPrompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: GEMINI_CONFIG.temperature,
                maxOutputTokens: GEMINI_CONFIG.maxTokens,
            }
        };
        
        const response = await fetch(`${GEMINI_CONFIG.apiUrl}?key=${GEMINI_CONFIG.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0) {
            const botResponse = data.candidates[0].content.parts[0].text;
            
            // Agregar respuesta del bot al historial
            this.conversationHistory.push({
                role: 'model',
                parts: [{ text: botResponse }]
            });
            
            return botResponse;
        } else {
            throw new Error('No se recibió respuesta válida');
        }
    }
    
    getFallbackResponse(message) {
        // Respuestas de respaldo si falla Gemini
        const fallbackResponses = [
            "Disculpa, estoy teniendo problemas técnicos. ¿Podrías repetir tu pregunta? 🔧",
            "Lo siento, no pude procesar tu mensaje. Un especialista se contactará contigo pronto. 📞",
            "Parece que hay un problema con mi conexión. ¿Te gustaría que te llame un experto? ☎️"
        ];
        
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        if (sender === 'bot') {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>${this.formatMessage(text)}</p>
                    <span class="message-time">${this.getCurrentTime()}</span>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${this.formatMessage(text)}</p>
                    <span class="message-time">${this.getCurrentTime()}</span>
                </div>
                <div class="message-avatar">
                    <i class="fas fa-user"></i>
                </div>
            `;
        }
        
        this.chatbotMessages.appendChild(messageDiv);
        this.messages.push({ text, sender, timestamp: new Date() });
        
        this.scrollToBottom();
        
        // Limitar mensajes mostrados
        if (this.messages.length > 50) {
            this.chatbotMessages.removeChild(this.chatbotMessages.firstChild);
            this.messages.shift();
        }
    }
    
    formatMessage(text) {
        // Formatear el texto para mejor presentación
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
            .replace(/([^\s@]+@[^\s@]+\.[^\s@]+)/g, '<a href="mailto:$1">$1</a>');
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.chatbotMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    getCurrentTime() {
        return new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
        }, 100);
    }
    
    // Método para limpiar conversación
    clearConversation() {
        this.messages = [];
        this.conversationHistory = [];
        this.chatbotMessages.innerHTML = '';
        this.addWelcomeMessage();
    }
    
    // Método para exportar conversación
    exportConversation() {
        const conversation = this.messages.map(msg => ({
            text: msg.text,
            sender: msg.sender,
            time: msg.timestamp.toLocaleString('es-ES')
        }));
        
        return JSON.stringify(conversation, null, 2);
    }
}

// ===== CSS ADICIONAL PARA EL TYPING INDICATOR =====
const additionalCSS = `
<style>
.typing-indicator .message-content {
    background: #f1f3f4;
    padding: 12px 16px;
}

.typing-dots {
    display: flex;
    gap: 4px;
    align-items: center;
}

.typing-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #666;
    animation: typing 1.5s infinite;
}

.typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%, 60%, 100% {
        transform: scale(1);
        opacity: 0.5;
    }
    30% {
        transform: scale(1.2);
        opacity: 1;
    }
}

.message-content p {
    margin: 0;
    line-height: 1.4;
}

.message-time {
    font-size: 11px;
    color: #888;
    margin-top: 4px;
    display: block;
}

.message-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1a237e;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
}

.user-message .message-avatar {
    background: #00bcd4;
}
</style>
`;

// Inyectar CSS adicional
document.head.insertAdjacentHTML('beforeend', additionalCSS);

// ===== INICIALIZACIÓN =====
let geminiChatbot;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar que existe la API key
    if (GEMINI_CONFIG.apiKey === 'AIzaSyDtVbJLqjH_HiNXnW3v_l7YbtFoC7exxts') {
        console.warn('⚠️ Recuerda configurar tu API key de Gemini en GEMINI_CONFIG.apiKey');
    }
    
    // Inicializar chatbot
    setTimeout(() => {
        geminiChatbot = new GeminiChatbot();
        console.log('✅ Gemini Chatbot inicializado correctamente');
    }, 1000);
});

// ===== API PÚBLICA =====
window.GeminiChatbot = GeminiChatbot;
window.ChatbotAPI = {
    sendMessage: (message) => geminiChatbot?.addMessage(message, 'bot'),
    clearChat: () => geminiChatbot?.clearConversation(),
    exportChat: () => geminiChatbot?.exportConversation(),
    isOpen: () => geminiChatbot?.isOpen || false,
    toggleChat: () => geminiChatbot?.toggleChat()
};