<?php
// API de login para Vector Prisma
// Verifica las credenciales del usuario en la base de datos

// CORS headers - permitir solicitudes desde cualquier origen
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'Error',
        'msj' => 'Método no permitido'
    ]);
    exit();
}

// Obtener datos del cuerpo de la petición
$input = json_decode(file_get_contents('php://input'), true);

// Validar que se enviaron los datos requeridos
if (!isset($input['usuario']) || !isset($input['password'])) {
    echo json_encode([
        'status' => 'Error',
        'msj' => 'Faltan datos requeridos'
    ]);
    exit();
}

$usuario = $input['usuario'];
$password = $input['password'];

// Configuración de la base de datos
$servername = "localhost";
$username = "postvent_root";
$password_db = "VectorPrisma2024!";
$dbname = "postvent_vectorprisma";

// Crear conexión
$conn = new mysqli($servername, $username, $password_db, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode([
        'status' => 'Error',
        'msj' => 'Error de conexión a la base de datos'
    ]);
    exit();
}

// Buscar usuario en la base de datos
$stmt = $conn->prepare("SELECT usuario, password FROM registros WHERE usuario = ? LIMIT 1");
$stmt->bind_param("s", $usuario);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // Usuario no encontrado
    echo json_encode([
        'status' => 'Error',
        'msj' => 'Usuario o contraseña incorrectos'
    ]);
    $stmt->close();
    $conn->close();
    exit();
}

$row = $result->fetch_assoc();

// Verificar contraseña (comparación directa ya que está tokenizada)
if ($row['password'] === $password) {
    // Credenciales correctas
    echo json_encode([
        'status' => 'Exito',
        'msj' => 'Login exitoso',
        'usuario' => $row['usuario']
    ]);
} else {
    // Contraseña incorrecta
    echo json_encode([
        'status' => 'Error',
        'msj' => 'Usuario o contraseña incorrectos'
    ]);
}

$stmt->close();
$conn->close();
?>
