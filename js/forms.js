// ===== FORMS.JS - MÓDULO DE FORMULARIOS =====

const FormsModule = (function() {
    'use strict';

    // ===== CONFIGURACIÓN =====
    const CONFIG = {
        endpoint: './contact.php',
        timeout: 15000,
        retries: 2
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
        console.log('✅ FormsModule inicializado');
    }

    // ===== CONFIGURACIÓN DE VALIDACIÓN =====
    function setupFormValidation() {
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Validación en tiempo real
            input.addEventListener('blur', validateField);
            input.addEventListener('input', UtilsModule.debounce(clearFieldError, 300));
            
            // Prevenir envío con Enter en inputs (excepto textarea)
            if (input.tagName !== 'TEXTAREA') {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const submitBtn = contactForm.querySelector('button[type="submit"]');
                        if (submitBtn) submitBtn.click();
                    }
                });
            }
        });
    }

    // ===== CONFIGURACIÓN DE ENVÍO =====
    function setupFormSubmission() {
        contactForm.addEventListener('submit', handleFormSubmit);
        
        // Agregar campo honeypot si no existe
        addHoneypotField();
    }

    // ===== VALIDACIÓN DE CAMPOS =====
    function validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');
        const isRequired = field.hasAttribute('required');
        
        // Limpiar error previo
        clearFieldError({ target: field });
        
        // Validar campo requerido
        if (isRequired && !value) {
            showFieldError(field, `El campo ${getFieldLabel(fieldName)} es requerido`);
            return false;
        }
        
        // Validaciones específicas
        if (fieldName === 'email' && value && !UtilsModule.isValidEmail(value)) {
            showFieldError(field, 'Por favor, ingresa un email válido');
            return false;
        }
        
        if (fieldName === 'phone' && value && !UtilsModule.isValidPhone(value)) {
            showFieldError(field, 'Por favor, ingresa un teléfono válido (mínimo 8 dígitos)');
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
        
        // Validación exitosa - marcar como válido
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

    // ===== MANEJO DE ENVÍO DEL FORMULARIO =====
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Prevenir envíos múltiples
        if (isSubmitting) {
            return;
        }
        
        console.log('📤 Iniciando envío de formulario...');
        
        // Validar todos los campos
        if (!validateAllFields()) {
            UtilsModule.showNotification(
                'Por favor, corrige los errores en el formulario antes de enviarlo.',
                'error'
            );
            return;
        }
        
        isSubmitting = true;
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Mostrar estado de carga
        setLoadingState(submitBtn, true);
        
        try {
            // Preparar datos del formulario
            const formData = new FormData(contactForm);
            
            // Sanitizar datos
            for (const [key, value] of formData.entries()) {
                if (typeof value === 'string') {
                    formData.set(key, UtilsModule.sanitizeInput(value));
                }
            }
            
            // Enviar formulario
            const response = await sendFormData(formData);
            
            if (response.success) {
                handleFormSuccess(response);
            } else {
                handleFormError(response);
            }
            
        } catch (error) {
            console.error('❌ Error al enviar formulario:', error);
            handleFormError({ 
                message: 'Error de conexión. Por favor, verifica tu internet e intenta nuevamente.',
                error_code: 'CONNECTION_ERROR'
            });
        } finally {
            setLoadingState(submitBtn, false, originalText);
            isSubmitting = false;
        }
    }

    // ===== ENVÍO DE DATOS =====
    async function sendFormData(formData, attempt = 1) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
        
        try {
            console.log(`📡 Enviando datos... (intento ${attempt})`);
            
            const response = await fetch(CONFIG.endpoint, {
                method: 'POST',
                body: formData,
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            // Verificar tipo de contenido
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('El servidor no devolvió una respuesta JSON válida');
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Error HTTP ${response.status}`);
            }
            
            console.log('✅ Formulario enviado exitosamente:', data);
            return data;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            // Manejar timeout
            if (error.name === 'AbortError') {
                throw new Error('Tiempo de espera agotado. El servidor tardó demasiado en responder.');
            }
            
            // Reintentar en caso de error de red
            if (attempt < CONFIG.retries && 
                (error.message.includes('fetch') || 
                 error.message.includes('network') ||
                 error.message.includes('conexión'))) {
                
                console.log(`🔄 Reintentando envío (${attempt + 1}/${CONFIG.retries})...`);
                await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
                return sendFormData(formData, attempt + 1);
            }
            
            throw error;
        }
    }

    // ===== MANEJO DE RESPUESTAS =====
    function handleFormSuccess(response) {
        console.log('🎉 Formulario enviado exitosamente');
        
        // Limpiar formulario
        contactForm.reset();
        
        // Remover clases de validación
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.classList.remove('valid', 'error');
        });
        
        // Mensaje de éxito personalizado
        let message = '🚀 ¡Mensaje enviado exitosamente!\n\n';
        message += '✅ Te contactaremos pronto\n';
        
        if (response.details) {
            message += `📧 Emails enviados: ${response.details.emails_sent}/${response.details.total_emails}\n`;
            message += `🕐 Enviado: ${response.details.timestamp}`;
        }
        
        message += '\n\n¡Gracias por confiar en INNOVATECH!';
        
        UtilsModule.showNotification(message, 'success', 8000);
        
        // Scroll al inicio de la página
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Analytics
        if (window.InnovaTechApp && window.InnovaTechApp.trackEvent) {
            window.InnovaTechApp.trackEvent('form_submit', 'contact', 'success');
        }
        
        // Mostrar modal de confirmación (opcional)
        showSuccessModal(response);
    }

    function handleFormError(response) {
        console.error('❌ Error en el formulario:', response);
        
        let message = response.message || 'Error al enviar el formulario';
        
        // Mostrar errores específicos si existen
        if (response.errors && Array.isArray(response.errors)) {
            message += ':\n\n• ' + response.errors.join('\n• ');
        }
        
        UtilsModule.showNotification(message, 'error', 6000);
        
        // Analytics
        if (window.InnovaTechApp && window.InnovaTechApp.trackEvent) {
            window.InnovaTechApp.trackEvent('form_error', 'contact', response.error_code || 'unknown');
        }
        
        // Mostrar información de contacto alternativa después de un momento
        setTimeout(() => {
            showAlternativeContact();
        }, 3000);
    }

    // ===== UTILIDADES DE UI =====
    function showFieldError(field, message) {
        // Remover error previo
        clearFieldError({ target: field });
        
        // Marcar campo como error
        field.classList.remove('valid');
        field.classList.add('error');
        
        // Crear mensaje de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error-message';
        errorDiv.textContent = message;
        
        // Insertar después del campo
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
        
        // Enfocar el campo con error
        field.focus();
    }

    function clearFieldError(e) {
        const field = e.target;
        
        // Remover clases de error
        field.classList.remove('error');
        
        // Remover mensaje de error
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

    // ===== MODAL DE ÉXITO =====
    function showSuccessModal(response) {
        const modal = document.createElement('div');
        modal.className = 'success-modal-overlay';
        modal.innerHTML = `
            <div class="success-modal">
                <div class="modal-header">
                    <h3>🚀 ¡Mensaje Enviado!</h3>
                    <button class="modal-close" onclick="this.closest('.success-modal-overlay').remove()">
                        ×
                    </button>
                </div>
                <div class="modal-body">
                    <div class="success-icon">✅</div>
                    <p><strong>Tu mensaje ha sido enviado exitosamente a nuestro equipo.</strong></p>
                    
                    <div class="success-details">
                        <div class="detail-item">
                            <span class="icon">📧</span>
                            <span>Emails enviados: ${response.details?.emails_sent || 1}/${response.details?.total_emails || 1}</span>
                        </div>
                        <div class="detail-item">
                            <span class="icon">🕐</span>
                            <span>Enviado: ${response.details?.timestamp || new Date().toLocaleString()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="icon">⏱️</span>
                            <span>Tiempo de respuesta: 24-48 horas hábiles</span>
                        </div>
                    </div>
                    
                    <div class="contact-info">
                        <h4>📞 Información de contacto:</h4>
                        <p><strong>Email:</strong> cayoeben64@gmail.com, nielsroy8@gmail.com</p>
                        <p><strong>Teléfono:</strong> +591 7000-0000</p>
                        <p><strong>Ubicación:</strong> Cotoca, Santa Cruz, Bolivia</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="this.closest('.success-modal-overlay').remove()" class="btn-primary">
                        Entendido
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-cerrar después de 15 segundos
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 15000);
    }

    // ===== CONTACTO ALTERNATIVO =====
    function showAlternativeContact() {
        const message = `
Si tienes problemas con el formulario, también puedes contactarnos directamente:

📧 Email: cayoeben64@gmail.com, nielsroy8@gmail.com
📱 Teléfono: +591 7000-0000
📍 Ubicación: Cotoca, Santa Cruz, Bolivia

¡Estaremos encantados de ayudarte!
        `;
        
        UtilsModule.showNotification(message.trim(), 'info', 12000);
    }

    // ===== UTILIDADES =====
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
        // Campo honeypot para prevenir spam
        if (!contactForm.querySelector('input[name="website"]')) {
            const honeypot = document.createElement('input');
            honeypot.type = 'text';
            honeypot.name = 'website';
            honeypot.style.cssText = 'display:none !important; position:absolute; left:-9999px;';
            honeypot.tabIndex = -1;
            honeypot.autocomplete = 'off';
            
            contactForm.appendChild(honeypot);
        }
    }

    function addFormStyles() {
        // Agregar estilos necesarios para el formulario
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
                
                .success-modal-overlay {
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
                    text-align: center;
                }
                
                .success-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }
                
                .success-details {
                    text-align: left;
                    margin: 20px 0;
                }
                
                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin: 10px 0;
                    padding: 8px 12px;
                    background: #f8f9fa;
                    border-radius: 6px;
                }
                
                .contact-info {
                    text-align: left;
                    margin-top: 20px;
                    padding: 15px;
                    background: #e3f2fd;
                    border-radius: 8px;
                }
                
                .contact-info h4 {
                    margin: 0 0 10px 0;
                    color: #1a237e;
                }
                
                .modal-footer {
                    padding: 0 20px 20px;
                    text-align: center;
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, #1a237e, #3f51b5);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
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
        
        // Getters
        get isSubmitting() { return isSubmitting; },
        get contactForm() { return contactForm; },
        get config() { return CONFIG; }
    };
})();

// Disponible globalmente
window.FormsModule = FormsModule;