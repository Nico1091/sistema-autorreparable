// Función para llamar a Mistral en LM Studio
// Todas las IA usan: http://192.168.20.130:1234
const URL_BASE = "http://192.168.20.130:1234";

// Función para analizar viabilidad económica con Mistral
async function analizarViabilidadEconomica(codigo, descripcionPrograma) {
    const url = `${URL_BASE}/v1/chat/completions`;
    
    console.log(`[Mistral] Conectando a ${URL_BASE}...`);
    
    // Limitar el código para evitar errores 400 por prompt muy largo
    const codigoRecortado = codigo.length > 1500 ? codigo.substring(0, 1500) + '\n...[código truncado]' : codigo;
    
    const mensajeAnalisis = `Eres el ANALISTA FINANCIERO de Vector Prisma. Analiza la viabilidad económica del siguiente programa.

PROGRAMA: ${descripcionPrograma}

CÓDIGO:
${codigoRecortado}

Proporciona:
1. Costos estimados (desarrollo, infraestructura, mantenimiento)
2. ROI estimado
3. Porcentaje de riesgo (0-100%)
4. Si riesgo > 13%, incluye PLAN DE EMERGENCIA ECONÓMICO`;

    const Rol = {
        model: "mistralai/ministral-3-3b-instruct-2512",
        messages: [
            {
                role: "system", content: "Eres analista financiero experto. Responde en español con cifras concretas, análisis de riesgo y plan de emergencia si el riesgo supera 13%."
            },
            {
                role: "user", content: mensajeAnalisis
            }
        ],
        temperature: 0.6,
        max_tokens: 1500
    };

    try {
        console.log("[Mistral] Analizando viabilidad económica...");
        const respuesta = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Rol)
        });

        if (!respuesta.ok) {
            const errorText = await respuesta.text();
            console.error("[Mistral] Error HTTP:", respuesta.status, errorText);
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        
        if (datos && datos.choices && datos.choices.length > 0 && datos.choices[0].message) {
            console.log("[Mistral] Análisis completado");
            return datos.choices[0].message.content;
        } else {
            throw new Error("Respuesta inválida de Mistral");
        }

    } catch (error) {
        console.error("[Mistral] Error de conexión:", error);
        // Devolver un análisis básico si falla Mistral
        return "⚠️ No se pudo completar el análisis económico con Mistral.\n\n" +
            "ANÁLISIS BÁSICO:\n" +
            "- Se recomienda hacer un análisis manual de costos\n" +
            "- Considera: servidores, desarrollo, mantenimiento\n" +
            "- ROI varía según el tipo de aplicación\n" +
            "- Riesgo estimado: 50% (sin análisis disponible)";
    }
}

// Función para extraer el porcentaje de riesgo del análisis
function extraerPorcentajeRiesgo(analisis) {
    // Buscar patrón como "Riesgo: XX%" o "Porcentaje de Riesgo: XX%"
    const match = analisis.match(/(?:riesgo|riesgo financiero).*?(\d{1,3})%/i);
    if (match) {
        return parseInt(match[1]);
    }
    // Buscar cualquier porcentaje en el texto
    const match2 = analisis.match(/(\d{1,3})%/);
    if (match2) {
        return parseInt(match2[1]);
    }
    return 0;
}

// Función completa: Usuario → LLaMA (con memoria) → Qwen → Mistral (viabilidad económica)
async function generarProgramaConAnalisis(mensajeUsuario) {
    try {
        // Paso 1: Generar código con LLaMA (ahora con memoria y continuación)
        agregarMensajeAlChat('user', mensajeUsuario);
        agregarMensajeAlChat('assistant', '💻 <b>Iniciando Programador LLaMA...</b><br><small>El programa se escribirá poco a poco con memoria</small>');
        
        const codigoGenerado = await generarCodigoLLaMA(mensajeUsuario);
        
        if (!codigoGenerado) {
            throw new Error("No se pudo generar el código");
        }
        
        // Paso 2: Enviar a Qwen para aprobación
        agregarMensajeAlChat('assistant', '🔍 <b>Enviando a Qwen para revisión y aprobación...</b>');
        const aprobacionQwen = await aprobarCodigoQwen(codigoGenerado, mensajeUsuario);
        
        // Eliminar mensajes de progreso
        const historial = document.getElementById('historial-chat');
        const mensajes = historial.querySelectorAll('.mensaje-asistente');
        if (mensajes.length >= 1) {
            mensajes[mensajes.length - 1].remove();
        }
        
        // Mostrar código aprobado
        agregarMensajeAlChat('assistant', '✅ <b>Programa completado y aprobado por Qwen:</b>\n\n' + codigoGenerado);
        
        // Mostrar revisión de Qwen
        agregarMensajeAlChat('assistant', '📋 <b>Revisión de Qwen:</b>\n\n' + aprobacionQwen);
        
        // Paso 3: Análisis económico con Mistral
        agregarMensajeAlChat('assistant', '⚠️ <b>INSTRUCCIÓN:</b> Carga <b>mistralai_ministral-3-3b-instruct-2512</b> en LM Studio');
        agregarMensajeAlChat('assistant', '💼 <b>Analizando viabilidad económica con Mistral...</b>');
        
        const analisisEconomico = await analizarViabilidadEconomica(codigoGenerado, mensajeUsuario);
        
        // Eliminar mensaje de carga
        const ultimosMensajes = historial.querySelectorAll('.mensaje-asistente');
        if (ultimosMensajes.length > 0) {
            ultimosMensajes[ultimosMensajes.length - 1].remove();
        }
        
        // Mostrar análisis económico
        agregarMensajeAlChat('assistant', '📊 <b>ANÁLISIS DE VIABILIDAD ECONÓMICA:</b>\n\n' + analisisEconomico);
        
        // Verificar riesgo y mostrar advertencia si es necesario
        const porcentajeRiesgo = extraerPorcentajeRiesgo(analisisEconomico);
        if (porcentajeRiesgo > 13) {
            agregarMensajeAlChat('assistant', '⚠️ <b>ALERTA: Riesgo económico superior al 13% (' + porcentajeRiesgo + '%)</b>\n\nConsulta el plan de emergencia económica en el análisis de Mistral arriba.');
        }
        
        return { 
            codigo: codigoGenerado, 
            revisionQwen: aprobacionQwen,
            analisisEconomico: analisisEconomico,
            riesgo: porcentajeRiesgo
        };
        
    } catch (error) {
        console.error("[Sistema] Error en el flujo de generación:", error);
        agregarMensajeAlChat('assistant', '❌ <b>Error:</b> No se pudo completar el proceso. Verifica que LM Studio esté ejecutándose con los modelos cargados.');
    }
}

// Exportar funciones
window.generarProgramaConAnalisis = generarProgramaConAnalisis;
window.analizarViabilidadEconomica = analizarViabilidadEconomica;
