document.addEventListener('DOMContentLoaded', function () {
    const entrada_chat = document.getElementById('input_chat');
    const Enviar = document.querySelector('.boton_de_chat');
    if (!entrada_chat || !Enviar) return; //condicion para retornar el mensaje

    // Palabras clave que indican solicitud de programa/código
    const palabrasClavePrograma = [
        'programa', 'código', 'codigo', 'script', 'aplicación', 'app', 'crear',
        'hacer un', 'desarrolla', 'escribe', 'genera', 'build', 'desarrollo',
        'programar', 'software', 'página', 'pagina', 'web', 'juego', 'game',
        'calculadora', 'formulario', 'login', 'registro', 'base de datos',
        'python', 'javascript', 'html', 'css', 'java', 'c++', 'php', 'ruby'
    ];

    function esSolicitudDePrograma(mensaje) {
        const mensajeLower = mensaje.toLowerCase();
        return palabrasClavePrograma.some(palabra => mensajeLower.includes(palabra));
    }

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

            // Verificar si es una solicitud de programa
            if (esSolicitudDePrograma(mensaje) && window.generarYaprobarPrograma) {
                // Usar el flujo LLaMA + Qwen
                window.generarYaprobarPrograma(mensaje)
                    .then(() => {
                        entrada_chat.disabled = false;
                        Enviar.disabled = false;
                        entrada_chat.value = '';
                        entrada_chat.focus();
                    })
                    .catch((error) => {
                        console.error('Error en generación de programa:', error);
                        entrada_chat.disabled = false;
                        Enviar.disabled = false;
                    });
            } else {
                // Flujo normal con Qwen
                window.llamarQwen()
                    .then((resultado) => {
                        // Guardar respuesta del asistente en la conversación
                        if (resultado && resultado.choices && resultado.choices[0] && resultado.choices[0].message) {
                            const respuesta = resultado.choices[0].message.content;
                            if (respuesta) {
                                if (window.GestorConversaciones) {
                                    window.GestorConversaciones.agregarMensaje('assistant', respuesta);
                                }
                                // También mostrar en el chat
                                agregarMensajeAlChat('assistant', respuesta);
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
    mensajeDiv.style.padding = '14px 18px';
    mensajeDiv.style.borderRadius = '12px';
    mensajeDiv.style.maxWidth = '85%';
    mensajeDiv.style.fontSize = '15px';
    mensajeDiv.style.lineHeight = '1.6';
    mensajeDiv.style.fontFamily = "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif";
    mensajeDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
    
    // Detectar si el contenido tiene código
    const tieneCodigo = contenido.includes('```') || contenido.includes('function') || contenido.includes('def ') || contenido.includes('class ') || contenido.includes('const ') || contenido.includes('let ') || contenido.includes('var ');
    
    if (rol === 'user') {
        mensajeDiv.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        mensajeDiv.style.marginLeft = 'auto';
        mensajeDiv.style.textAlign = 'right';
        mensajeDiv.style.color = '#ffffff';
        mensajeDiv.innerHTML = `<strong style="font-size:13px;opacity:0.9">Tú:</strong><br><span style="font-size:15px">${contenido}</span>`;
    } else {
        mensajeDiv.style.background = '#ffffff';
        mensajeDiv.style.marginRight = 'auto';
        mensajeDiv.style.border = '1px solid #e8e8e8';
        
        // Si tiene código, aplicar formato especial
        if (tieneCodigo) {
            let contenidoFormateado = contenido
                .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background:#1e1e1e;color:#d4d4d4;padding:12px;border-radius:8px;overflow-x:auto;font-size:13px;margin:10px 0"><code>$2</code></pre>')
                .replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:13px;color:#e83e8c">$1</code>');
            mensajeDiv.innerHTML = `<strong style="font-size:13px;color:#6c5ce7;font-weight:600">Qwen:</strong><br><span style="font-size:15px;color:#2d3436">${contenidoFormateado}</span>`;
        } else {
            mensajeDiv.innerHTML = `<strong style="font-size:13px;color:#6c5ce7;font-weight:600">Qwen:</strong><br><span style="font-size:15px;color:#2d3436">${contenido}</span>`;
        }
    }
    
    historial.appendChild(mensajeDiv);
    
    // Auto scroll al final
    historial.scrollTop = historial.scrollHeight;
}

// Exportar para uso global
window.agregarMensajeAlChat = agregarMensajeAlChat;
