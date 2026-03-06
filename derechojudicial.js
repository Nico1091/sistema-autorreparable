// derechojudicial.js - Noticias judiciales de Colombia y análisis con IA
const URL_DOLPHIN = "http://192.168.20.130:1234/v1/chat/completions";
const MODELO_DOLPHIN = "dolphin-2.9-llama3-8b-old";

// Noticias judiciales de Colombia (simuladas para demo - se pueden conectar a APIs reales)
let noticiasCargadas = [];

// Función para agregar mensaje al chat
function agregarMensaje(mensaje, tipo = 'sistema', titulo = '') {
    const container = document.getElementById('mensajes-analisis');
    const div = document.createElement('div');
    div.className = `mensaje-${tipo}`;
    
    if (tipo === 'ia' && titulo) {
        div.innerHTML = `
            <h4><i class="fas fa-robot"></i> ${titulo}</h4>
            <p>${mensaje}</p>
        `;
    } else if (tipo === 'sistema') {
        div.innerHTML = `<p><i class="fas fa-info-circle"></i> ${mensaje}</p>`;
    } else {
        div.innerHTML = `<p>${mensaje}</p>`;
    }
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// Función para cargar noticias judiciales
async function cargarNoticias() {
    const container = document.getElementById('noticias-container');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando noticias judiciales...</div>';
    
    try {
        // Noticias judiciales de Colombia (simuladas para demo)
        // En producción, conectar a APIs de noticias como NewsAPI o similares
        const noticias = [
            {
                titulo: "Corte Constitucional ordena protección de derechos de comunidad indígena en Amazonas",
                fecha: "5 de Marzo, 2026",
                fuente: "Corte Constitucional"
            },
            {
                titulo: "Nuevo Código Electoral: Senado aprueba reformas al sistema de votaciones",
                fecha: "4 de Marzo, 2026",
                fuente: "Congreso Colombia"
            },
            {
                titulo: "Fiscalía General investiga casos de corrupción en contratos de infraestructura vial",
                fecha: "4 de Marzo, 2026",
                fuente: "Fiscalía General"
            },
            {
                titulo: "Corte Suprema de Justicia emite fallo sobre derechos laborales en economía gig",
                fecha: "3 de Marzo, 2026",
                fuente: "Corte Suprema"
            },
            {
                titulo: "Consejo de Estado ordena medidas cautelares por desastre ambiental en Putumayo",
                fecha: "3 de Marzo, 2026",
                fuente: "Consejo de Estado"
            },
            {
                titulo: "Ministra de Justicia presenta proyecto de ley de reforma procesal penal",
                fecha: "2 de Marzo, 2026",
                fuente: "Ministerio de Justicia"
            },
            {
                titulo: "Tribunal Administrativo de Cundinamarca falla a favor de usuarios bancarios",
                fecha: "2 de Marzo, 2026",
                fuente: "Tribunal Admin."
            },
            {
                titulo: "Defensoría del Pueblo alerta sobre situación de derechos humanos en frontera",
                fecha: "1 de Marzo, 2026",
                fuente: "Defensoría del Pueblo"
            },
            {
                titulo: "Procuraduría General abre investigación a funcionarios por irregularidades en educación",
                fecha: "1 de Marzo, 2026",
                fuente: "Procuraduría"
            },
            {
                titulo: "Corte Constitucional declara inexequible norma sobre propiedad horizontal",
                fecha: "28 de Febrero, 2026",
                fuente: "Corte Constitucional"
            }
        ];
        
        noticiasCargadas = noticias;
        
        container.innerHTML = noticias.map((noticia, index) => `
            <div class="noticia-card" onclick="analizarNoticia(${index})">
                <div class="noticia-fecha">
                    <i class="fas fa-calendar-alt"></i>
                    ${noticia.fecha}
                </div>
                <div class="noticia-titulo">${noticia.titulo}</div>
                <div class="noticia-fuente">
                    <i class="fas fa-newspaper"></i>
                    ${noticia.fuente}
                </div>
            </div>
        `).join('');
        
        agregarMensaje('Noticias judiciales cargadas. Haz clic en una noticia para analizarla o pregunta directamente sobre derecho judicial.', 'sistema');
        
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="loading">Error al cargar noticias. Intenta de nuevo.</div>';
    }
}

// Función para analizar una noticia específica
async function analizarNoticia(index) {
    const noticia = noticiasCargadas[index];
    if (!noticia) return;
    
    const pregunta = `Analiza la siguiente noticia judicial colombiana y explica sus implicaciones legales: "${noticia.titulo}" (Fuente: ${noticia.fuente})`;
    await enviarAIAutomatico(pregunta);
}

// Función para enviar pregunta automática
async function enviarAIAutomatico(pregunta) {
    agregarMensaje(pregunta, 'usuario');
    await procesarPregunta(pregunta);
}

// Función para enviar pregunta desde el input
async function enviarPregunta() {
    const input = document.getElementById('pregunta-analisis');
    const pregunta = input.value.trim();
    
    if (!pregunta) return;
    
    input.value = '';
    agregarMensaje(pregunta, 'usuario');
    await procesarPregunta(pregunta);
}

// Función principal para procesar preguntas con Dolphin
async function procesarPregunta(pregunta) {
    agregarMensaje('⏳ Consultando análisis jurídico con Dolphin...', 'sistema');
    
    // Construir contexto con noticias si están disponibles
    let contexto = '';
    if (noticiasCargadas.length > 0) {
        const titulosNoticias = noticiasCargadas.map(n => `- ${n.titulo} (${n.fuente})`).join('\n');
        contexto = `\n\nNoticias judiciales recientes de Colombia:\n${titulosNoticias}`;
    }
    
    const prompt = `Eres un asistente legal experto en derecho colombiano. Respondes en español de forma clara y precisa sobre temas judiciales, procesos legales, fallos judiciales, y legislación colombiana.${contexto}

Usuario pregunta: "${pregunta}"

Proporciona un análisis detallado y preciso sobre este tema de derecho judicial colombiano. Si es sobre un proceso legal específico, menciona los pasos, requisitos y entidades involucradas.`;
    
    try {
        const response = await fetch(URL_DOLPHIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODELO_DOLPHIN,
                messages: [
                    {
                        role: "system",
                        content: "Eres un asistente legal experto en derecho colombiano. Conoces la Constitución Política, códigos civiles, comerciales, penal, procedimiento penal, y demás legislación colombiana. Respondes de forma clara, precisa y útil."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        const respuesta = data.choices[0].message.content;
        
        // Remover mensaje de loading
        const mensajes = document.querySelectorAll('.mensaje-sistema');
        if (mensajes.length > 0) {
            const ultimo = mensajes[mensajes.length - 1];
            if (ultimo.textContent.includes('Consultando')) {
                ultimo.remove();
            }
        }
        
        agregarMensaje(respuesta, 'ia', 'Análisis de Dolphin');
        
    } catch (error) {
        console.error('Error Dolphin:', error);
        agregarMensaje(`⚠️ Error al conectar con Dolphin: ${error.message}. Asegúrate de tener dolphin-2.9-llama3-8b-old cargado en LM Studio.`, 'sistema');
    }
}

// Inicializar al cargar la página
window.onload = function() {
    cargarNoticias();
};

// Exportar funciones
window.cargarNoticias = cargarNoticias;
window.enviarPregunta = enviarPregunta;
window.analizarNoticia = analizarNoticia;
