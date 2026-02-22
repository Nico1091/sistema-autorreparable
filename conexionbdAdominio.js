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
const url_regis = "http://postvental.com.co/registro.php";

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

        if (resultado.status == "Exito") {
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