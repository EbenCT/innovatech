// ===== FORMS.JS - FORMULARIO CON FORMSPREE + WHATSAPP =====

const FormsModule = (function() {
    'use strict';

    // ===== CONFIGURACIÓN =====
    const CONFIG = {
        // Formspree endpoint - CAMBIAR POR TU ID ÚNICO
        endpoint: 'https://formspree.io/f/xzzgkjzg', // 👈 CAMBIAR ESTO
        timeout: 15000,
        retries: 2,
        whatsapp: {
            numbers: [
                '+59163332108',
                '+59172474541'
            ]
        }
    };

    // ===== VARIABLES PRIVADAS =====
    let contactForm;
    let isSubmitting = false;

    // ===== INICIALIZACIÓN =====
    function init() {
        contactForm = document.getElementById('contactForm');
        
        if (!contactForm) {
            console.warn('⚠️ Formulario de contacto no encontrado');
            return;
        }

        setupFormValidation();
        setupFormSubmission();
        addFormStyles();
        showFormspreeInstructions();
        
        console.log('✅ FormsModule inicializado');
    }

    // ===== INSTRUCCIONES DE FORMSPREE =====
    function showFormspreeInstructions() {
        if (CONFIG.endpoint.includes('YOUR_FORM_ID')) {
            console.warn(`
🔧 CONFIGURACIÓN REQUERIDA - FORMSPREE:

1. Ve a: https://formspree.io/
2. Regístrate gratis con tu email
3. Crea un nuevo formulario
4. Copia tu endpoint (algo como: https://formspree.io/f/abcd1234)
5. Reemplaza en CONFIG.endpoint en forms.js

📧 Los emails llegarán a: ${CONFIG.whatsapp.numbers.join(', ')}
            `);
        }
    }

    // ===== CONFIGURACIÓN DE VALIDACIÓN =====
    function setupFormValidation() {
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', UtilsModule.debounce(clearFieldError, 300));
        });
    }

    // ===== CONFIGURACIÓN DE ENVÍO =====
    function setupFormSubmission() {
        contactForm.addEventListener('submit', handleFormSubmit);
        addHoneypotField();
    }

    // ===== VALIDACIÓN DE CAMPOS =====
    function validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');
        const isRequired = field.hasAttribute('required');
        
        clearFieldError({ target: field });
        
        if (isRequired && !value) {
            showFieldError(field, `El campo ${getFieldLabel(fieldName)} es requerido`);
            return false;
        }
        
        if (fieldName === 'email' && value && !UtilsModule.isValidEmail(value)) {
            showFieldError(field, 'Por favor, ingresa un email válido');
            return false;
        }
        
        if (fieldName === 'phone' && value && !UtilsModule.isValidPhone(value)) {
            showFieldError(field, 'Por favor, ingresa un teléfono válido');
            return false;
        }
        
        if (fieldName === 'name' && value && value.length < 2) {
            showFieldError(field, 'El nombre debe tener al menos 2 caracteres');
            return false;
        }
        
        if (fieldName === 'message' && value && value.length < 10) {
            showFieldError(field, 'El mensaje debe tener al menos 10 caracteres');
            return false;
        }
        
        field.classList.add('valid');
        return true;
    }

    function validateAllFields() {
        const inputs = contactForm.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateField({ target: input })) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    // ===== MANEJO DE ENVÍO =====
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        console.log('📤 Iniciando envío de formulario...');
        
        if (!validateAllFields()) {
            UtilsModule.showNotification(
                'Por favor, corrige los errores en el formulario antes de enviarlo.',
                'error'
            );
            return;
        }

        // Verificar configuración
        if (CONFIG.endpoint.includes('YOUR_FORM_ID')) {
            UtilsModule.showNotification(
                'El formulario no está configurado. Revisa la consola para instrucciones.',
                'warning'
            );
            showFormspreeInstructions();
            return;
        }
        
        isSubmitting = true;
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        setLoadingState(submitBtn, true);
        
        try {
            const formData = new FormData(contactForm);
            const response = await sendFormData(formData);
            
            if (response.ok) {
                handleFormSuccess();
            } else {
                const errorData = await response.json();
                handleFormError(errorData);
            }
            
        } catch (error) {
            console.error('❌ Error al enviar formulario:', error);
            handleFormError({ 
                message: 'Error de conexión. Por favor, intenta nuevamente.',
                error_code: 'CONNECTION_ERROR'
            });
        } finally {
            setLoadingState(submitBtn, false, originalText);
            isSubmitting = false;
        }
    }

    // ===== ENVÍO CON FORMSPREE =====
    async function sendFormData(formData, attempt = 1) {
        try {
            console.log(`📡 Enviando a Formspree... (intento ${attempt})`);
            
            const response = await fetch(CONFIG.endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('📬 Respuesta de Formspree:', response.status, response.statusText);
            
            if (response.ok) {
                console.log('✅ Formulario enviado exitosamente via Formspree');
                return response;
            } else {
                // Reintentar si es error temporal
                if (attempt < CONFIG.retries && response.status >= 500) {
                    console.log(`🔄 Reintentando envío (${attempt + 1}/${CONFIG.retries})...`);
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
                    return sendFormData(formData, attempt + 1);
                }
                
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            if (attempt < CONFIG.retries) {
                console.log(`🔄 Reintentando por error de red (${attempt + 1}/${CONFIG.retries})...`);
                await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
                return sendFormData(formData, attempt + 1);
            }
            
            throw error;
        }
    }

    // ===== MANEJO DE RESPUESTAS =====
    function handleFormSuccess() {
        console.log('🎉 Formulario enviado exitosamente');
        
        contactForm.reset();
        
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.classList.remove('valid', 'error');
        });
        
        const message = `🚀 ¡Mensaje enviado exitosamente!

✅ Tu mensaje ha sido recibido
📧 Te contactaremos pronto por email
⏱️ Tiempo de respuesta: 24-48 horas

¡Gracias por confiar en INNOVATECH!`;
        
        UtilsModule.showNotification(message, 'success', 8000);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        if (window.InnovaTechApp && window.InnovaTechApp.trackEvent) {
            window.InnovaTechApp.trackEvent('form_submit', 'contact', 'success');
        }
        
        // Mostrar opciones de contacto adicionales
        setTimeout(() => {
            showContactOptions();
        }, 3000);
    }

    function handleFormError(response) {
        console.error('❌ Error en el formulario:', response);
        
        let message = 'Error al enviar el formulario. ';
        
        if (response.errors) {
            message += 'Por favor, revisa los campos e intenta nuevamente.';
        } else {
            message += 'Por favor, intenta nuevamente o contáctanos directamente.';
        }
        
        UtilsModule.showNotification(message, 'error', 6000);
        
        if (window.InnovaTechApp && window.InnovaTechApp.trackEvent) {
            window.InnovaTechApp.trackEvent('form_error', 'contact', response.error_code || 'unknown');
        }
        
        setTimeout(() => {
            showAlternativeContact();
        }, 2000);
    }

    // ===== OPCIONES DE CONTACTO =====
    function showContactOptions() {
        const message = `💬 ¿Necesitas respuesta inmediata?

También puedes contactarnos por WhatsApp:

📱 WhatsApp 1: ${CONFIG.whatsapp.numbers[0]}
📱 WhatsApp 2: ${CONFIG.whatsapp.numbers[1]}
📧 Email: cayoeben64@gmail.com, nielsroy8@gmail.com

¡Estamos aquí para ayudarte!`;
        
        UtilsModule.showNotification(message, 'info', 10000);
        
        // Mostrar modal con enlaces directos
        showWhatsAppModal();
    }

    function showAlternativeContact() {
        const message = `Si tienes problemas con el formulario, contáctanos directamente:

📱 WhatsApp: ${CONFIG.whatsapp.numbers.join(', ')}
📧 Email: cayoeben64@gmail.com, nielsroy8@gmail.com
📍 Ubicación: Cotoca, Santa Cruz, Bolivia

¡Estaremos encantados de ayudarte!`;
        
        UtilsModule.showNotification(message.trim(), 'info', 12000);
        showWhatsAppModal();
    }

    // ===== MODAL DE WHATSAPP =====
    function showWhatsAppModal() {
        const modal = document.createElement('div');
        modal.className = 'whatsapp-modal-overlay';
        modal.innerHTML = `
            <div class="whatsapp-modal">
                <div class="modal-header">
                    <h3>💬 Contacto Directo</h3>
                    <button class="modal-close" onclick="this.closest('.whatsapp-modal-overlay').remove()">
                        ×
                    </button>
                </div>
                <div class="modal-body">
                    <p><strong>¿Necesitas ayuda inmediata?</strong></p>
                    <p>Contáctanos directamente por WhatsApp:</p>
                    
                    <div class="whatsapp-buttons">
                        ${CONFIG.whatsapp.numbers.map((number, index) => `
                            <a href="https://wa.me/${number.replace(/[^0-9]/g, '')}?text=Hola%20INNOVATECH,%20me%20interesa%20información%20sobre%20sus%20servicios" 
                               target="_blank" 
                               class="whatsapp-btn">
                                <span class="whatsapp-icon">📱</span>
                                <div>
                                    <div class="whatsapp-label">WhatsApp ${index + 1}</div>
                                    <div class="whatsapp-number">${number}</div>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                    
                    <div class="contact-info">
                        <h4>📧 Otros medios de contacto:</h4>
                        <p><strong>Email:</strong> cayoeben64@gmail.com, nielsroy8@gmail.com</p>
                        <p><strong>Ubicación:</strong> Cotoca, Santa Cruz, Bolivia</p>
                        <p><strong>Horario:</strong> Lunes a Viernes, 8:00 AM - 6:00 PM</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-cerrar después de 30 segundos
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 30000);
    }

    // ===== UTILIDADES DE UI =====
    function showFieldError(field, message) {
        clearFieldError({ target: field });
        
        field.classList.remove('valid');
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error-message';
        errorDiv.textContent = message;
        
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
        field.focus();
    }

    function clearFieldError(e) {
        const field = e.target;
        field.classList.remove('error');
        
        const errorMessage = field.parentNode.querySelector('.field-error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    function setLoadingState(button, isLoading, originalText = 'Enviar Mensaje') {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = `
                <span class="loading-spinner"></span>
                Enviando...
            `;
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.textContent = originalText;
            button.classList.remove('loading');
        }
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

    function addHoneypotField() {
        if (!contactForm.querySelector('input[name="_gotcha"]')) {
            const honeypot = document.createElement('input');
            honeypot.type = 'text';
            honeypot.name = '_gotcha';
            honeypot.style.cssText = 'display:none !important; position:absolute; left:-9999px;';
            honeypot.tabIndex = -1;
            honeypot.autocomplete = 'off';
            
            contactForm.appendChild(honeypot);
        }
    }

    function addFormStyles() {
        if (!document.querySelector('#form-styles')) {
            const style = document.createElement('style');
            style.id = 'form-styles';
            style.textContent = `
                .field-error-message {
                    color: #e74c3c;
                    font-size: 14px;
                    margin-top: 5px;
                    display: block;
                }
                
                .form-group input.error,
                .form-group textarea.error,
                .form-group select.error {
                    border-color: #e74c3c !important;
                    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2) !important;
                }
                
                .form-group input.valid,
                .form-group textarea.valid,
                .form-group select.valid {
                    border-color: #27ae60 !important;
                    box-shadow: 0 0 0 2px rgba(39, 174, 96, 0.2) !important;
                }
                
                .loading-spinner {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 2px solid #ffffff;
                    border-radius: 50%;
                    border-top-color: transparent;
                    animation: spin 1s linear infinite;
                    margin-right: 8px;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                /* Modal de WhatsApp */
                .whatsapp-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }
                
                .whatsapp-modal {
                    background: white;
                    border-radius: 12px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    animation: slideIn 0.3s ease;
                }
                
                .modal-header {
                    padding: 20px 20px 0;
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
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                }
                
                .modal-body {
                    padding: 20px;
                }
                
                .whatsapp-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin: 20px 0;
                }
                
                .whatsapp-btn {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: linear-gradient(135deg, #25D366, #128C7E);
                    color: white;
                    text-decoration: none;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
                }
                
                .whatsapp-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(37, 211, 102, 0.4);
                    color: white;
                }
                
                .whatsapp-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }
                
                .whatsapp-label {
                    font-weight: bold;
                    font-size: 16px;
                }
                
                .whatsapp-number {
                    font-size: 14px;
                    opacity: 0.9;
                }
                
                .contact-info {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 20px;
                }
                
                .contact-info h4 {
                    margin: 0 0 10px 0;
                    color: #1a237e;
                }
                
                .contact-info p {
                    margin: 5px 0;
                    font-size: 14px;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ===== API PÚBLICA =====
    return {
        init,
        validateField,
        validateAllFields,
        setLoadingState,
        showFieldError,
        clearFieldError,
        showAlternativeContact,
        showContactOptions,
        showWhatsAppModal,
        
        get isSubmitting() { return isSubmitting; },
        get contactForm() { return contactForm; },
        get config() { return CONFIG; }
    };
})();

window.FormsModule = FormsModule;