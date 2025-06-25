<?php
// ===== CONFIGURACIÓN =====
error_reporting(E_ALL);
ini_set('display_errors', 0); // Cambiar a 1 solo para debug

// Headers para CORS y JSON
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json; charset=UTF-8');

// Configuración
$config = [
    'emails' => [
        'cayoeben64@gmail.com',
        'nielsroy8@gmail.com'
    ],
    'empresa' => [
        'nombre' => 'INNOVATECH',
        'email' => 'contacto@innovatech.com',
        'telefono' => '+591 7000-0000',
        'direccion' => 'Av. Principal 123, Cotoca, Santa Cruz, Bolivia'
    ],
    'smtp' => [
        'host' => 'smtp.gmail.com',
        'port' => 587,
        'username' => 'tu-email@gmail.com', // Cambiar por tu email
        'password' => 'tu-app-password',    // App Password de Gmail
        'encryption' => 'tls'
    ]
];

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo procesar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

// ===== FUNCIONES DE VALIDACIÓN =====
function sanitize($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validate_phone($phone) {
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    return strlen($phone) >= 8;
}

// ===== FUNCIÓN SIMPLE DE ENVÍO DE EMAIL =====
function send_simple_email($to, $subject, $message, $headers) {
    // Configurar parámetros adicionales para mail()
    $parameters = "-f contacto@" . $_SERVER['HTTP_HOST'];
    
    // Intentar envío
    $sent = mail($to, $subject, $message, $headers, $parameters);
    
    // Log del intento
    error_log("Email attempt to $to: " . ($sent ? 'SUCCESS' : 'FAILED'));
    
    return $sent;
}

// ===== PROCESAR FORMULARIO =====
try {
    // Obtener datos del formulario
    $nombre = sanitize($_POST['name'] ?? '');
    $email = sanitize($_POST['email'] ?? '');
    $telefono = sanitize($_POST['phone'] ?? '');
    $servicio = sanitize($_POST['service'] ?? '');
    $mensaje = sanitize($_POST['message'] ?? '');
    
    // Validaciones
    $errors = [];
    
    if (empty($nombre)) $errors[] = 'El nombre es requerido';
    if (empty($email) || !validate_email($email)) $errors[] = 'Email válido es requerido';
    if (!empty($telefono) && !validate_phone($telefono)) $errors[] = 'Teléfono inválido';
    if (empty($servicio)) $errors[] = 'Selecciona un servicio';
    if (empty($mensaje)) $errors[] = 'El mensaje es requerido';
    
    // Si hay errores, retornar
    if (!empty($errors)) {
        echo json_encode([
            'success' => false, 
            'message' => 'Errores de validación',
            'errors' => $errors
        ]);
        exit();
    }
    
    // ===== PREPARAR EMAILS =====
    $fecha = date('d/m/Y H:i:s');
    $servicios_map = [
        'web' => 'Desarrollo Web',
        'mobile' => 'Aplicación Móvil',
        'erp' => 'Sistema ERP',
        'consultoria' => 'Consultoría IT'
    ];
    $servicio_nombre = $servicios_map[$servicio] ?? 'Otro servicio';
    
    // Headers para el email
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: INNOVATECH Website <contacto@" . $_SERVER['HTTP_HOST'] . ">\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // Mensaje HTML para la empresa
    $html_message = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .info-row { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #667eea; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>🚀 NUEVO CONTACTO - INNOVATECH</h2>
                <p>Formulario de contacto del sitio web</p>
            </div>
            <div class='content'>
                <div class='info-row'>
                    <strong>👤 Nombre:</strong> $nombre
                </div>
                <div class='info-row'>
                    <strong>📧 Email:</strong> $email
                </div>
                <div class='info-row'>
                    <strong>📱 Teléfono:</strong> " . ($telefono ?: 'No proporcionado') . "
                </div>
                <div class='info-row'>
                    <strong>🛠️ Servicio:</strong> $servicio_nombre
                </div>
                <div class='info-row'>
                    <strong>💬 Mensaje:</strong><br>
                    " . nl2br($mensaje) . "
                </div>
                <div class='info-row'>
                    <strong>🕐 Fecha:</strong> $fecha
                </div>
                <div class='info-row'>
                    <strong>🌐 IP:</strong> " . $_SERVER['REMOTE_ADDR'] . "
                </div>
            </div>
            <div class='footer'>
                <p>Este mensaje fue enviado desde el formulario de contacto de INNOVATECH</p>
                <p>Responder directamente a: $email</p>
            </div>
        </div>
    </body>
    </html>";
    
    // Asunto del email
    $subject = "🚀 Nuevo contacto: $servicio_nombre - $nombre";
    
    // ===== ENVIAR EMAILS =====
    $emails_sent = 0;
    $total_emails = count($config['emails']);
    
    foreach ($config['emails'] as $recipient) {
        if (send_simple_email($recipient, $subject, $html_message, $headers)) {
            $emails_sent++;
        }
    }
    
    // ===== RESPUESTA DE CONFIRMACIÓN AL CLIENTE =====
    $client_subject = "✅ Confirmación de contacto - INNOVATECH";
    $client_headers = "MIME-Version: 1.0\r\n";
    $client_headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $client_headers .= "From: INNOVATECH <contacto@" . $_SERVER['HTTP_HOST'] . ">\r\n";
    
    $client_message = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .highlight { background: white; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0; }
            .contact-info { background: white; padding: 15px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>🚀 INNOVATECH</h2>
                <p>¡Gracias por contactarnos!</p>
            </div>
            <div class='content'>
                <div class='highlight'>
                    <h3>✅ Tu mensaje ha sido recibido</h3>
                    <p>Hola <strong>$nombre</strong>,</p>
                    <p>Hemos recibido tu consulta sobre <strong>$servicio_nombre</strong> y nuestro equipo la revisará pronto.</p>
                </div>
                
                <div class='contact-info'>
                    <h4>📞 Información de contacto:</h4>
                    <p><strong>Email:</strong> cayoeben64@gmail.com, nielsroy8@gmail.com</p>
                    <p><strong>Teléfono:</strong> +591 7000-0000</p>
                    <p><strong>Ubicación:</strong> Cotoca, Santa Cruz, Bolivia</p>
                </div>
                
                <p><strong>⏱️ Tiempo de respuesta:</strong> 24-48 horas hábiles</p>
                <p>Nos pondremos en contacto contigo pronto para discutir tu proyecto.</p>
            </div>
        </div>
    </body>
    </html>";
    
    // Enviar confirmación al cliente
    send_simple_email($email, $client_subject, $client_message, $client_headers);
    
    // ===== GUARDAR EN LOG (OPCIONAL) =====
    $log_entry = date('Y-m-d H:i:s') . " | $nombre | $email | $servicio_nombre | IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
    @file_put_contents('contact_log.txt', $log_entry, FILE_APPEND | LOCK_EX);
    
    // ===== RESPUESTA EXITOSA =====
    echo json_encode([
        'success' => true,
        'message' => '¡Mensaje enviado exitosamente!',
        'details' => [
            'emails_sent' => $emails_sent,
            'total_emails' => $total_emails,
            'timestamp' => $fecha,
            'service' => $servicio_nombre
        ]
    ]);

} catch (Exception $e) {
    // Log del error
    error_log("Contact form error: " . $e->getMessage());
    
    // Respuesta de error
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor. Por favor, intenta más tarde.',
        'error_code' => 'SERVER_ERROR'
    ]);
}
?>