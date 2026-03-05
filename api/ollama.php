<?php
// api/ollama.php - Proxy para conectar al Ollama local del servidor

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = file_get_contents('php://input');

// URL de Ollama en el servidor (puede ser local o remoto)
$ollama_url = 'http://localhost:11434/v1/chat/completions';

$ch = curl_init($ollama_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 120);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo json_encode([
        'error' => 'Error de conexión: ' . curl_error($ch),
        'msj' => 'No se pudo conectar a Ollama'
    ]);
} else {
    http_response_code($http_code);
    echo $response;
}

curl_close($ch);
?>
