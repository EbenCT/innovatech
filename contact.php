<?php
// ===== CONFIGURACIÓN =====
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers para CORS y JSON
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

// Configuración de emails y WhatsApp
$config = [
    'emails' => [
        'cayoeben64@gmail.com',
        'nielsroy8@gmail.com'
    ],
    'whatsapp' => [
        '+59163332108',
        '+59172474541'
    ],
    'empresa' => [
        'nombre' => 'INNOVATECH',
        'email' => 'contacto@innovatech.com',
        'telefono' => '+591 7000-0000',
        'direccion' => 'Av. Principal 123, Cotoca, Santa Cruz, Bolivia'
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

// ===== VALIDACIÓN Y SANITIZACIÓN =====
function sanitize($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validate_phone($phone) {
    // Remover espacios y caracteres especiales
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    return strlen($phone) >= 8;
}

// ===== PROCESAR DATOS DEL FORMULARIO =====
try {
    // Recibir datos
    $nombre = sanitize($_POST['name'] ?? '');
    $email = sanitize($_POST['email'] ?? '');
    $telefono = sanitize($_POST['phone'] ?? '');
    $servicio = sanitize($_POST['service'] ?? '');
    $mensaje = sanitize($_POST['message'] ?? '');
    
    // Validaciones
    $errors = [];
    
    if (empty($nombre)) {
        $errors[] = 'El nombre es requerido';
    }
    
    if (empty($email) || !validate_email($email)) {
        $errors[] = 'Email válido es requerido';
    }
    
    if (!empty($telefono) && !validate_phone($telefono)) {
        $errors[] = 'Teléfono inválido';
    }
    
    if (empty($servicio)) {
        $errors[] = 'Selecciona un servicio';
    }
    
    if (empty($mensaje)) {
        $errors[] = 'El mensaje es requerido';
    }
    
    if (!empty($errors)) {
        echo json_encode([
            'success' => false, 
            'message' => 'Errores de validación',
            'errors' => $errors
        ]);
        exit();
    }
    
    // ===== PREPARAR MENSAJES =====
    $fecha = date('d/m/Y H:i:s');
    $servicios_map = [
        'web' => 'Desarrollo Web',
        'mobile' => 'Aplicación Móvil',
        'erp' => 'Sistema ERP',
        'consultoria' => 'Consultoría'
    ];
    $servicio_nombre = $servicios_map[$servicio] ?? $servicio;
    
    // ===== EMAIL TEMPLATE =====
    $email_subject = "🚀 Nuevo contacto desde INNOVATECH - $servicio_nombre";
    
    $email_body = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a237e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #1a237e; }
            .value { margin-top: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .whatsapp-btn { background: #25d366; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>🚀 INNOVATECH</h2>
                <p>Nuevo contacto desde la página web</p>
            </div>
            
            <div class='content'>
                <div class='field'>
                    <div class='label'>👤 Nombre:</div>
                    <div class='value'>$nombre</div>
                </div>
                
                <div class='field'>
                    <div class='label'>📧 Email:</div>
                    <div class='value'><a href='mailto:$email'>$email</a></div>
                </div>
                
                <div class='field'>
                    <div class='label'>📱 Teléfono:</div>
                    <div class='value'>$telefono</div>
                </div>
                
                <div class='field'>
                    <div class='label'>🛠️ Servicio:</div>
                    <div class='value'>$servicio_nombre</div>
                </div>
                
                <div class='field'>
                    <div class='label'>💬 Mensaje:</div>
                    <div class='value'>$mensaje</div>
                </div>
                
                <div class='field'>
                    <div class='label'>📅 Fecha:</div>
                    <div class='value'>$fecha</div>
                </div>
                
                <hr style='margin: 30px 0;'>
                
                <h3>📱 Contactar por WhatsApp:</h3>
                <p>Puedes responder directamente vía WhatsApp:</p>
                <a href='https://wa.me/59163332108?text=Hola $nombre, recibimos tu consulta sobre $servicio_nombre. ¿Cómo podemos ayudarte?' class='whatsapp-btn'>
                    WhatsApp +591 63332108
                </a>
                <a href='https://wa.me/59172474541?text=Hola $nombre, recibimos tu consulta sobre $servicio_nombre. ¿Cómo podemos ayudarte?' class='whatsapp-btn'>
                    WhatsApp +591 72474541
                </a>
            </div>
            
            <div class='footer'>
                <p>© " . date('Y') . " INNOVATECH - Innovación Tecnológica a tu Alcance</p>
                <p>Av. Principal 123, Cotoca, Santa Cruz, Bolivia</p>
            </div>
        </div>
    </body>
    </html>";
    
    // ===== HEADERS DEL EMAIL =====
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: INNOVATECH <{$config['empresa']['email']}>" . "\r\n";
    $headers .= "Reply-To: $email" . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // ===== ENVIAR EMAILS =====
    $emails_sent = 0;
    $email_errors = [];
    
    foreach ($config['emails'] as $to_email) {
        if (mail($to_email, $email_subject, $email_body, $headers)) {
            $emails_sent++;
        } else {
            $email_errors[] = "Error enviando a $to_email";
        }
    }
    
    // ===== GENERAR ENLACES DE WHATSAPP =====
    $whatsapp_message = "🚀 *NUEVO CONTACTO - INNOVATECH*\n\n";
    $whatsapp_message .= "👤 *Nombre:* $nombre\n";
    $whatsapp_message .= "📧 *Email:* $email\n";
    $whatsapp_message .= "📱 *Teléfono:* $telefono\n";
    $whatsapp_message .= "🛠️ *Servicio:* $servicio_nombre\n";
    $whatsapp_message .= "💬 *Mensaje:* $mensaje\n";
    $whatsapp_message .= "📅 *Fecha:* $fecha\n\n";
    $whatsapp_message .= "_Contactar directamente al cliente para dar seguimiento_";
    
    $whatsapp_encoded = urlencode($whatsapp_message);
    $whatsapp_links = [];
    
    foreach ($config['whatsapp'] as $whatsapp_number) {
        // Limpiar número para URL
        $clean_number = preg_replace('/[^0-9]/', '', $whatsapp_number);
        $whatsapp_links[] = "https://wa.me/$clean_number?text=$whatsapp_encoded";
    }
    
    // ===== GUARDAR EN LOG (OPCIONAL) =====
    $log_entry = [
        'timestamp' => $fecha,
        'nombre' => $nombre,
        'email' => $email,
        'telefono' => $telefono,
        'servicio' => $servicio_nombre,
        'mensaje' => $mensaje,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];
    
    // Crear directorio de logs si no existe
    $log_dir = 'logs';
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    // Guardar log
    $log_file = $log_dir . '/contactos_' . date('Y-m') . '.json';
    $existing_logs = [];
    
    if (file_exists($log_file)) {
        $existing_logs = json_decode(file_get_contents($log_file), true) ?: [];
    }
    
    $existing_logs[] = $log_entry;
    file_put_contents($log_file, json_encode($existing_logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    // ===== RESPUESTA EXITOSA =====
    $response = [
        'success' => true,
        'message' => '¡Mensaje enviado exitosamente!',
        'details' => [
            'emails_sent' => $emails_sent,
            'total_emails' => count($config['emails']),
            'whatsapp_numbers' => count($config['whatsapp']),
            'timestamp' => $fecha
        ]
    ];
    
    // Incluir errores si los hay
    if (!empty($email_errors)) {
        $response['warnings'] = $email_errors;
    }
    
    // Incluir enlaces de WhatsApp en desarrollo (opcional)
    if (isset($_GET['debug'])) {
        $response['whatsapp_links'] = $whatsapp_links;
    }
    
    echo json_encode($response);
    
} catch (Exception $e) {
    // ===== MANEJO DE ERRORES =====
    error_log("Error en formulario de contacto: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor',
        'error' => $e->getMessage()
    ]);
}
?>