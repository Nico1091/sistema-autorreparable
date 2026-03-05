// Función de tokenización snake-256
// Combina SHA-256 con formato estilo snake
async function tokenizarSnake256(entrada) {
    // Convertir a string y codificar
    const encoder = new TextEncoder();
    const data = encoder.encode(entrada);
    
    // Hash SHA-256 usando Web Crypto API
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    // Convertir a hex
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Formato "snake-256": grupos de 8 caracteres separados por guiones bajos
    // Ejemplo: a1b2c3d4_e5f6g7h8_i9j0k1l2_m3n4o5p6
    const grupos = [];
    for (let i = 0; i < hashHex.length; i += 8) {
        grupos.push(hashHex.substring(i, i + 8));
    }
    
    return grupos.join('_');
}

// Función para tokenizar todos los datos del usuario
async function tokenizarDatosUsuario(usuario, correo, password) {
    const tokenUsuario = await tokenizarSnake256(usuario);
    const tokenCorreo = await tokenizarSnake256(correo);
    const tokenPassword = await tokenizarSnake256(password);
    
    return {
        usuario: tokenUsuario,
        correo: tokenCorreo,
        password: tokenPassword
    };
}

async function ejecutarRegistro() {
    const user = document.getElementById('reg_usuario').value;
    const mail = document.getElementById('reg_correo').value;
    const pass = document.getElementById('reg_pass').value;

    if (!user || !mail || !pass) {
        //Aclararle a l usuario que rellemne todos los campos
        return;
    }

    // Tokenizar los datos del usuario antes de enviarlos
    const datosTokenizados = await tokenizarDatosUsuario(user, mail, pass);
    
    await window.registro(
        datosTokenizados.usuario, 
        datosTokenizados.correo, 
        datosTokenizados.password
    );
}
