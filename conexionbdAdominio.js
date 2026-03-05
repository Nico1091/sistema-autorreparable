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
            //Condicional para ver si es o no exitosa la consulta 
            console.log("El cliente ingreso al sistema");
        } else {
            console.log("Error en registro: ", resultado.msj);

        }
    } catch (error) {
        console.error("fallo de conexion en el modulo registro");
    }
}
window.registro = registro;
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