document.addEventListener('DOMContentLoaded', function () {
    const entrada_chat = document.getElementById('input_chat');
    const Enviar = document.querySelector('.boton_de_chat');
    if (!entrada_chat || !Enviar) return; //condicion para retornar el mensaje

    Enviar.addEventListener('click', function () {
        const mensaje = entrada_chat.value.trim();
        if (mensaje) {
            entrada_chat.disabled = true;
            Enviar.disabled = true;

            // Guardar mensaje del usuario en la conversación
            if (window.GestorConversaciones) {
                window.GestorConversaciones.agregarMensaje('user', mensaje);
                
                // Mostrar mensaje en el chat
                agregarMensajeAlChat('user', mensaje);
            }

            window.llamarQwen()
                .then((resultado) => {
                    // Guardar respuesta del asistente en la conversación
                    if (resultado && resultado.choices && resultado.choices[0] && resultado.choices[0].message) {
                        const respuesta = resultado.choices[0].message.content;
                        if (respuesta && window.GestorConversaciones) {
                            window.GestorConversaciones.agregarMensaje('assistant', respuesta);
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error en llamada Qwen:', error);
                })
                .finally(() => {
                    entrada_chat.disabled = false;
                    Enviar.disabled = false;
                    entrada_chat.value = '';
                    entrada_chat.focus();
                });
        }
    });
    entrada_chat.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            Enviar.click();
        }
    });
});

// Función para agregar mensajes al chat
function agregarMensajeAlChat(rol, contenido) {
    const historial = document.getElementById('historial-chat');
    if (!historial) return;
    
    const mensajeDiv = document.createElement('div');
    mensajeDiv.style.marginBottom = '15px';
    mensajeDiv.style.padding = '12px';
    mensajeDiv.style.borderRadius = '10px';
    mensajeDiv.style.maxWidth = '80%';
    
    if (rol === 'user') {
        mensajeDiv.style.background = 'rgba(102, 126, 234, 0.2)';
        mensajeDiv.style.marginLeft = 'auto';
        mensajeDiv.style.textAlign = 'right';
        mensajeDiv.innerHTML = `<strong style="color:#667eea">Tú:</strong><br><span style="color:#333">${contenido}</span>`;
    } else {
        mensajeDiv.style.background = 'rgba(255, 255, 255, 0.1)';
        mensajeDiv.style.marginRight = 'auto';
        mensajeDiv.innerHTML = `<strong style="color:#764ba2">Qwen:</strong><br><span style="color:#333">${contenido}</span>`;
    }
    
    historial.appendChild(mensajeDiv);
    
    // Auto scroll al final
    historial.scrollTop = historial.scrollHeight;
}

// Exportar para uso global
window.agregarMensajeAlChat = agregarMensajeAlChat;
