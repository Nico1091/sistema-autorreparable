// Función de tokenización snake-256
// Combina SHA-256 con formato estilo snake
async function tokenizarSnake256(entrada) {
    const encoder = new TextEncoder();
    const data = encoder.encode(entrada);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const grupos = [];
    for (let i = 0; i < hashHex.length; i += 8) {
        grupos.push(hashHex.substring(i, i + 8));
    }
    return grupos.join('_');
}

//Constante de conexion a la base de datos
const url_bd = "https://postvental.com.co/guardar.php";
/**
* Sincronizacion de memoria con el dominio remoto 
* @param {string} rol - 'usuario' o 'Asistente'
* @param {string} contenido -El mensaje a guardar
*/
async function sincronizarConVector(rol, contenido) {
    try {
        const respuesta = await fetch(url_bd, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                rol: rol,
                contenido: contenido,
                modelo: "qwen/qwen2.5-coder-14b"
            })
        });
        const resultado = await respuesta.json();
        console.log("Respuesta bd", resultado.msj || "Sincronizando");
    } catch (error) {
        console.error("Fallo critico en la base de datos");
    }
}

window.sincronizarConVector = sincronizarConVector;

/** Esta es la conexion a registro de la base de datos de mi dominio web */
const url_regis = "https://postvental.com.co/registro.php";

/**
 * Registra un nuevo cliente en la base de datos Vector
 * @param {string} usuario
 * @param {string} correo
 * @param {string} password
 */


async function registro(usuario, correo, password) {
    try {
        const respuesta = await fetch(url_regis, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuario: usuario,
                correo: correo,
                password: password
            })
        });
        const resultado = await respuesta.json();
        console.log("Estado de registro:", resultado.msj);

        if (resultado.status === "Exito") {
            // Guardar también en localStorage para login offline
            const usuariosRegistrados = JSON.parse(localStorage.getItem('usuarios_registrados') || '[]');
            usuariosRegistrados.push({ usuario: usuario, correo: correo, password: password });
            localStorage.setItem('usuarios_registrados', JSON.stringify(usuariosRegistrados));
            console.log("Usuario guardado en localStorage para login offline");
            return true;
        } else {
            alert('Error en el registro: ' + resultado.msj);
            return false;
        }
    } catch (error) {
        console.error("fallo de conexion en el modulo registro");
        alert('Error de conexión. Por favor intente más tarde.');
    }
}
window.registro = registro;

// URL para login (servidor remoto)
const url_login = "https://postvental.com.co/login.php";

/**
 * Verifica las credenciales del usuario en la base de datos
 * @param {string} usuario
 * @param {string} password
 * @returns {Promise<boolean>}
 */
async function verificarCredenciales(usuario, password) {
    try {
        // Tokenizar las credenciales
        const tokenUsuario = await tokenizarSnake256(usuario);
        const tokenPassword = await tokenizarSnake256(password);
        
        // Primero verificar localmente si hay usuarios registrados
        const usuariosRegistrados = JSON.parse(localStorage.getItem('usuarios_registrados') || '[]');
        const usuarioEncontrado = usuariosRegistrados.find(u => 
            u.usuario === tokenUsuario && u.password === tokenPassword
        );
        
        if (usuarioEncontrado) {
            // Login local exitoso
            sessionStorage.setItem('usuario_logueado', usuario);
            sessionStorage.setItem('token_usuario', tokenUsuario);
            console.log("Login local exitoso");
            return true;
        }
        
        // Si no está en local, intentar en el servidor
        const respuesta = await fetch(url_login, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuario: tokenUsuario,
                password: tokenPassword
            })
        });
        const resultado = await respuesta.json();
        console.log("Estado de login:", resultado.msj);

        if (resultado.status === "Exito") {
            // Guardar sesión del usuario
            sessionStorage.setItem('usuario_logueado', usuario);
            sessionStorage.setItem('token_usuario', tokenUsuario);
            // También guardar localmente para futuras verificaciones
            usuariosRegistrados.push({ usuario: tokenUsuario, password: tokenPassword });
            localStorage.setItem('usuarios_registrados', JSON.stringify(usuariosRegistrados));
            return true;
        } else {
            alert(resultado.msj || 'Usuario o contraseña incorrectos');
            return false;
        }
    } catch (error) {
        console.error("Fallo de conexión en el módulo login:", error);
        // Intentar login local como fallback
        const usuariosRegistrados = JSON.parse(localStorage.getItem('usuarios_registrados') || '[]');
        const tokenUsuario = await tokenizarSnake256(usuario);
        const tokenPassword = await tokenizarSnake256(password);
        const usuarioEncontrado = usuariosRegistrados.find(u => 
            u.usuario === tokenUsuario && u.password === tokenPassword
        );
        if (usuarioEncontrado) {
            sessionStorage.setItem('usuario_logueado', usuario);
            sessionStorage.setItem('token_usuario', tokenUsuario);
            alert('Login exitoso (modo offline)');
            return true;
        }
        alert('Error de conexión. Por favor intente más tarde.');
        return false;
    }
}
window.verificarCredenciales = verificarCredenciales;

function irARegistro() {
    window.location.href = "Registro_usuario.html";
}
window.irARegistro = irARegistro;

// Exportar función de tokenización para uso global
window.tokenizarSnake256 = tokenizarSnake256;

/**
 * Sincroniza una sesión de usuario con token snake-256
 * @param {string} usuario - Nombre de usuario (se tokeniza automáticamente)
 * @param {string} contenido - Contenido del mensaje
 */
async function sincronizarSesionUsuarioTokenizada(usuario, contenido) {
    try {
        const tokenUsuario = await tokenizarSnake256(usuario);
        const respuesta = await fetch(url_bd, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                rol: "usuario_tokenizado",
                contenido: contenido,
                modelo: "qwen/qwen2.5-coder-14b",
                token_usuario: tokenUsuario
            })
        });
        const resultado = await respuesta.json();
        console.log("Sesión de usuario tokenizada sincronizada:", resultado.msj || "Sincronizando");
    } catch (error) {
        console.error("Fallo crítico en la sincronización de sesión tokenizada");
    }
}
window.sincronizarSesionUsuarioTokenizada = sincronizarSesionUsuarioTokenizada;