<?php
// ===== CONTACT.PHP - VERSIÓN DEBUG =====

// Mostrar errores para debug (remover en producción)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers CORS más permisivos
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Log para debug
error_log("=== CONTACT.PHP DEBUG ===");
error_log("Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
error_log("POST data: " . print_r($_POST, true));

// Responder a OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 'OK', 'method' => 'OPTIONS']);
    exit();
}

// Verificar si es GET (para debug)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'status' => 'Contact form endpoint is working',
        'method' => 'GET',
        'message' => 'Send POST request to submit form',
        'server_info' => [
            'php_version' => phpversion(),
            'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'method' => $_SERVER['REQUEST_METHOD']
        ]
    ]);
    exit();
}

// Procesar solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Solo POST es aceptado.',
        'method_received' => $_SERVER['REQUEST_METHOD'],
        'allowed_methods' => ['POST']
    ]);
    exit();
}

// ===== CONFIGURACIÓN =====
$config = [
    'recipient_emails' => [
        'abelito.alvarez41@gmail.com'
    ],
    'company' => [
        'name' => 'CODEPRIME',
        'email' => 'contacto@CODEPRIME.com',
        'phone' => '+591 7000-0000',
        'address' => 'Cotoca, Santa Cruz, Bolivia'
    ]
];

// ===== FUNCIONES =====
function sanitize($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validatePhone($phone) {
    $cleanPhone = preg_replace('/[^0-9+]/', '', $phone);
    return strlen($cleanPhone) >= 8;
}

function sendSimpleEmail($to, $subject, $message, $headers) {
    // Para debug, simular envío exitoso
    error_log("EMAIL SIMULADO - To: $to, Subject: $subject");
    
    // En servidor real, descomentar esta línea:
    // $sent = mail($to, $subject, $message, $headers);
    
    // Para debug, siempre retornar true
    $sent = true;
    
    error_log("Email simulado enviado a: $to - " . ($sent ? 'SUCCESS' : 'FAILED'));
    return $sent;
}

// ===== PROCESAMIENTO =====
try {
    // Debug: mostrar datos recibidos
    error_log("POST data recibida: " . json_encode($_POST));
    
    // Obtener datos
    $nombre = sanitize($_POST['name'] ?? '');
    $email = sanitize($_POST['email'] ?? '');
    $telefono = sanitize($_POST['phone'] ?? '');
    $servicio = sanitize($_POST['service'] ?? '');
    $mensaje = sanitize($_POST['message'] ?? '');
    
    // Debug
    error_log("Datos procesados - Nombre: $nombre, Email: $email, Servicio: $servicio");
    
    // Validaciones básicas
    $errors = [];
    
    if (empty($nombre) || strlen($nombre) < 2) {
        $errors[] = 'El nombre es requerido (mínimo 2 caracteres)';
    }
    
    if (empty($email) || !validateEmail($email)) {
        $errors[] = 'Email válido es requerido';
    }
    
    if (empty($servicio)) {
        $errors[] = 'Debes seleccionar un servicio';
    }
    
    if (empty($mensaje) || strlen($mensaje) < 10) {
        $errors[] = 'El mensaje es requerido (mínimo 10 caracteres)';
    }
    
    if (!empty($telefono) && !validatePhone($telefono)) {
        $errors[] = 'Formato de teléfono inválido';
    }
    
    // Verificar honeypot
    if (!empty($_POST['website'])) {
        error_log("SPAM detectado - Honeypot activado");
        $errors[] = 'Spam detectado';
    }
    
    if (!empty($errors)) {
        echo json_encode([
            'success' => false,
            'message' => 'Errores de validación',
            'errors' => $errors,
            'debug_data' => $_POST
        ]);
        exit();
    }
    
    // Mapear servicios
    $serviciosMap = [
        'web' => 'Desarrollo Web',
        'mobile' => 'Aplicación Móvil',
        'erp' => 'Sistema ERP',
        'consultoria' => 'Consultoría IT'
    ];
    
    $servicioNombre = $serviciosMap[$servicio] ?? 'Otro servicio';
    $fecha = date('d/m/Y H:i:s');
    
    // Preparar headers
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: CODEPRIME Website <contacto@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ">\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // Mensaje HTML simple
    $htmlMessage = "
    <html>
    <head><meta charset='UTF-8'></head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6;'>
        <h2 style='color: #1a237e;'>🚀 Nuevo Contacto - CODEPRIME</h2>
        
        <div style='background: #f9f9f9; padding: 20px; border-radius: 8px;'>
            <p><strong>👤 Nombre:</strong> $nombre</p>
            <p><strong>📧 Email:</strong> $email</p>
            <p><strong>📱 Teléfono:</strong> " . ($telefono ?: 'No proporcionado') . "</p>
            <p><strong>🛠️ Servicio:</strong> $servicioNombre</p>
            <p><strong>🕐 Fecha:</strong> $fecha</p>
            <p><strong>🌐 IP:</strong> " . ($_SERVER['REMOTE_ADDR'] ?? 'localhost') . "</p>
            
            <div style='margin-top: 20px;'>
                <strong>💬 Mensaje:</strong><br>
                <div style='background: white; padding: 15px; border-radius: 5px; margin-top: 10px;'>
                    " . nl2br($mensaje) . "
                </div>
            </div>
        </div>
        
        <p style='margin-top: 20px; color: #666; font-size: 14px;'>
            Responder directamente a: $email
        </p>
    </body>
    </html>";
    
    // Enviar emails
    $emailsSent = 0;
    $totalEmails = count($config['recipient_emails']);
    
    foreach ($config['recipient_emails'] as $recipient) {
        $subject = "🚀 CODEPRIME - Nuevo contacto: $servicioNombre - $nombre";
        
        if (sendSimpleEmail($recipient, $subject, $htmlMessage, $headers)) {
            $emailsSent++;
        }
    }
    
    // Email de confirmación al cliente
    $clientSubject = "✅ Confirmación de contacto - CODEPRIME";
    $clientMessage = "
    <html>
    <head><meta charset='UTF-8'></head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6;'>
        <h2 style='color: #1a237e;'>🚀 CODEPRIME</h2>
        <p>Hola <strong>$nombre</strong>,</p>
        
        <div style='background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;'>
            <h3 style='color: #1976d2; margin: 0 0 10px 0;'>✅ Tu mensaje ha sido recibido</h3>
            <p>Hemos recibido tu consulta sobre <strong>$servicioNombre</strong> y nuestro equipo la revisará pronto.</p>
        </div>
        
        <div style='background: #f9f9f9; padding: 15px; border-radius: 8px;'>
            <h4>📞 Información de contacto:</h4>
            <p><strong>Email:</strong> " . implode(', ', $config['recipient_emails']) . "</p>
            <p><strong>Teléfono:</strong> {$config['company']['phone']}</p>
            <p><strong>Ubicación:</strong> {$config['company']['address']}</p>
        </div>
        
        <p><strong>⏱️ Tiempo de respuesta:</strong> 24-48 horas hábiles</p>
        <p>¡Gracias por confiar en CODEPRIME!</p>
    </body>
    </html>";
    
    $clientHeaders = str_replace("Reply-To: $email\r\n", "", $headers);
    sendSimpleEmail($email, $clientSubject, $clientMessage, $clientHeaders);
    
    // Log de éxito
    $logEntry = "$fecha | $nombre | $email | $servicioNombre | IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'localhost') . "\n";
    @file_put_contents('contact_log.txt', $logEntry, FILE_APPEND | LOCK_EX);
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => '¡Mensaje enviado exitosamente!',
        'details' => [
            'emails_sent' => $emailsSent,
            'total_emails' => $totalEmails,
            'timestamp' => $fecha,
            'service' => $servicioNombre,
            'confirmation_sent' => true
        ],
        'debug_info' => [
            'php_version' => phpversion(),
            'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'method' => $_SERVER['REQUEST_METHOD'],
            'form_data_received' => !empty($_POST)
        ]
    ]);

} catch (Exception $e) {
    error_log("Error en contact.php: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor: ' . $e->getMessage(),
        'error_code' => 'SERVER_ERROR',
        'debug_info' => [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
}
?>