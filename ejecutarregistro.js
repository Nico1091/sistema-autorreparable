async function ejecutarRegistro() {
    const user = document.getElementById('reg_usuario').value;
    const mail = document.getElementById('reg_correo').value;
    const pass = document.getElementById('reg_pass').value;

    if (!user || !mail || !pass) {
        //Aclararle a l usuario que rellemne todos los campos
        return
    }

    await window.registro(user, mail, pass);
}

