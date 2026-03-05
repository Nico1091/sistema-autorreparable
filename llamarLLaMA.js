// Función para llamar a LLaMA en LM Studio
// LM Studio típicamente corre en puerto 1234 o 1235
const url_llama = "http://localhost:1235/v1/chat/completions";

// Detectar automáticamente el puerto disponible
async function detectarPuertoLMStudio() {
    const puertos = [1235, 1234, 8080];
    
    for (const puerto of puertos) {
        try {
            const response = await fetch(`http://localhost:${puerto}/v1/models`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            if (response.ok) {
                console.log(`[LLaMA] Puerto detectado: ${puerto}`);
                return puerto;
            }
        } catch (e) {
            // Puerto no disponible, continuar
        }
    }
    return 1235; // Puerto por defecto
}

// Función principal para generar código con LLaMA
async function generarCodigoLLaMA(mensajeUsuario) {
    let puerto = await detectarPuertoLMStudio();
    const url = `http://localhost:${puerto}/v1/chat/completions`;
    
    console.log(`[LLaMA] Conectando a LM Studio en puerto ${puerto}...`);
    
    const Rol = {
        model: "meta-llama-3.1-8b-instruct",
        messages: [
            {
                role: "system", content: "Eres un asistente de programación experto. " +
                    "Tu función es escribir código limpio, funcional y bien documentado. " +
                    "Responde siempre en español. " +
                    "Cuando el usuario pida un programa, escribe el código completo y funcional. " +
                    "Si el usuario describe lo que quiere, crea un programa que cumpla con esos requisitos. " +
                    "Devuelve solo el código sin explicaciones adicionales, a menos que el usuario pida explicaciones."
            },
            {
                role: "user", content: mensajeUsuario
            }
        ],
        temperature: 0.7,
        max_tokens: 2000
    };

    try {
        console.log("[LLaMA] Solicitando código...");
        const respuesta = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Rol)
        });

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        
        if (datos && datos.choices && datos.choices.length > 0 && datos.choices[0].message) {
            console.log("[LLaMA] Código generado exitosamente");
            return datos.choices[0].message.content;
        } else {
            throw new Error("Respuesta inválida de LLaMA");
        }

    } catch (error) {
        console.error("[LLaMA] Error de conexión:", error);
        throw error;
    }
}

// Función para enviar código a Qwen para aprobación
async function aprobarCodigoQwen(codigo, descripcion) {
    const url = "http://localhost:1234/v1/chat/completions";
    
    const mensaje = `Por favor revisa y aprueba el siguiente código:\n\n${codigo}\n\nDescripción del programa: ${descripcion}`;
    
    const Rol = {
        model: "qwen/qwen2.5-coder-14b",
        messages: [
            {
                role: "system", content: "Responde siempre en español. Eres Qwen, el agente decisor superior. " +
                    "Tu labor es revisar código generado por otros modelos y aprobarlo o rechazarlo. " +
                    "Si el código es correcto y funcional, apruébalo y explica brevemente por qué es correcto. " +
                    "Si hay errores o mejoras necesarias, recházalo y explica qué cambios se deben hacer. " +
                    "Sé preciso y conciso en tu revisión."
            },
            {
                role: "user", content: mensaje
            }
        ],
        temperature: 0.5,
        max_tokens: 1000
    };

    try {
        console.log("[Qwen] Revisando código...");
        const respuesta = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Rol)
        });

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        
        if (datos && datos.choices && datos.choices.length > 0 && datos.choices[0].message) {
            console.log("[Qwen] Revisión completada");
            return datos.choices[0].message.content;
        } else {
            throw new Error("Respuesta inválida de Qwen");
        }

    } catch (error) {
        console.error("[Qwen] Error de conexión:", error);
        throw error;
    }
}

// Función principal: usuario → LLaMA genera → Qwen aprueba → usuario ve resultado
async function generarYaprobarPrograma(mensajeUsuario) {
    try {
        // Paso 1: Mostrar mensaje de que se está generando código
        agregarMensajeAlChat('user', mensajeUsuario);
        agregarMensajeAlChat('assistant', '⏳ <b>Generando código con LLaMA...</b>');
        
        // Paso 2: Generar código con LLaMA
        const codigoGenerado = await generarCodigoLLaMA(mensajeUsuario);
        
        // Paso 3: Enviar a Qwen para aprobación
        agregarMensajeAlChat('assistant', '🔍 <b>Enviando a Qwen para revisión y aprobación...</b>');
        const aprobacionQwen = await aprobarCodigoQwen(codigoGenerado, mensajeUsuario);
        
        // Paso 4: Mostrar resultado final al usuario
        // Eliminar los mensajes de progreso
        const historial = document.getElementById('historial-chat');
        const mensajes = historial.querySelectorAll('.mensaje-asistente');
        if (mensajes.length >= 2) {
            mensajes[mensajes.length - 1].remove();
            mensajes[mensajes.length - 2].remove();
        }
        
        // Mostrar código aprobado
        agregarMensajeAlChat('assistant', '✅ <b>Programa aprobado por Qwen:</b>\n\n' + codigoGenerado);
        
        // También mostrar la revisión de Qwen
        agregarMensajeAlChat('assistant', '📋 <b>Revisión de Qwen:</b>\n\n' + aprobacionQwen);
        
        return { codigo: codigoGenerado, revision: aprobacionQwen };
        
    } catch (error) {
        console.error("[Sistema] Error en el flujo de generación:", error);
        agregarMensajeAlChat('assistant', '❌ <b>Error:</b> No se pudo completar el proceso. Asegúrate de que LM Studio esté ejecutándose con el modelo cargado.');
    }
}

// Exportar funciones
window.generarYaprobarPrograma = generarYaprobarPrograma;
window.generarCodigoLLaMA = generarCodigoLLaMA;
window.aprobarCodigoQwen = aprobarCodigoQwen;
