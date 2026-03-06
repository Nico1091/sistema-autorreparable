// Mercado.js - Conexión a tasas de mercado y Mistral para análisis
const URL_MISTRAL = "http://192.168.20.130:1234/v1/chat/completions";
const MODELO_MISTRAL = "mistralai_ministral-3-3b-instruct-2512";

// Datos actuales del mercado
let datosMercado = {
    tasas: [],
    criptos: [],
    materias: [],
    indices: []
};

// Función para agregar mensaje al análisis
function agregarMensajeAnalisis(mensaje, esIA = false, titulo = "") {
    const container = document.getElementById('analisis-ia');
    const div = document.createElement('div');
    div.className = esIA ? 'mensaje-ia' : 'mensaje-sistema';
    
    if (esIA && titulo) {
        div.innerHTML = `
            <h4><i class="fas fa-brain"></i> ${titulo}</h4>
            <p>${mensaje}</p>
            <div class="fecha">${new Date().toLocaleString()}</div>
        `;
    } else {
        div.innerHTML = `<p>${mensaje}</p>`;
    }
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// Función para agregar alerta
function agregarAlerta(titulo, mensaje, esImportante = false) {
    const container = document.getElementById('alertas');
    
    // Remover mensaje de info si existe
    const infoMsg = container.querySelector('.alerta-info');
    if (infoMsg) infoMsg.remove();
    
    const div = document.createElement('div');
    div.className = esImportante ? 'alerta-importante' : 'alerta-info';
    div.innerHTML = `
        <h4><i class="fas fa-exclamation-triangle"></i> ${titulo}</h4>
        <p>${mensaje}</p>
    `;
    
    container.insertBefore(div, container.firstChild);
}

// ==================== TASAS DE CAMBIO ====================
async function actualizarTasas() {
    const container = document.getElementById('tasas-cambio');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';
    
    try {
        // Usar API pública de tasas de cambio
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        
        const tasas = [
            { nombre: 'USD/EUR', valor: data.rates.EUR, simbolo: '€' },
            { nombre: 'USD/COP', valor: data.rates.COP, simbolo: '$' },
            { nombre: 'USD/MXN', valor: data.rates.MXN, simbolo: '$' },
            { nombre: 'USD/GBP', valor: data.rates.GBP, simbolo: '£' },
            { nombre: 'USD/JPY', valor: data.rates.JPY, simbolo: '¥' }
        ];
        
        datosMercado.tasas = tasas;
        
        container.innerHTML = tasas.map(t => `
            <div class="tasa-item">
                <div class="tasa-nombre">
                    <i class="fas fa-money-bill-wave"></i>
                    ${t.nombre}
                </div>
                <div class="tasa-valor">
                    ${t.simbolo}${t.valor.toFixed(2)}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        container.innerHTML = '<div class="loading">Error al cargar tasas</div>';
        console.error('Error tasas:', error);
    }
}

// ==================== CRIPTOMONEDAS ====================
async function actualizarCriptos() {
    const container = document.getElementById('criptomonedas');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';
    
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,ripple&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        
        const criptos = [
            { nombre: 'Bitcoin', simbolo: 'BTC', datos: data.bitcoin },
            { nombre: 'Ethereum', simbolo: 'ETH', datos: data.ethereum },
            { nombre: 'Solana', simbolo: 'SOL', datos: data.solana },
            { nombre: 'Cardano', simbolo: 'ADA', datos: data.cardano },
            { nombre: 'Ripple', simbolo: 'XRP', datos: data.ripple }
        ];
        
        datosMercado.criptos = criptos;
        
        container.innerHTML = criptos.map(c => {
            const cambio = c.datos.usd_24h_change || 0;
            const esPositivo = cambio >= 0;
            return `
                <div class="tasa-item">
                    <div class="tasa-nombre">
                        <i class="fab fa-bitcoin"></i>
                        ${c.nombre} (${c.simbolo})
                    </div>
                    <div class="tasa-valor">
                        $${c.datos.usd.toLocaleString()}
                        <span class="tasa-cambio ${esPositivo ? 'positivo' : 'negativo'}">
                            ${esPositivo ? '▲' : '▼'} ${Math.abs(cambio).toFixed(2)}%
                        </span>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        container.innerHTML = '<div class="loading">Error al cargar criptomonedas</div>';
        console.error('Error criptos:', error);
    }
}

// ==================== MATERIAS PRIMAS ====================
async function actualizarMaterias() {
    const container = document.getElementById('materias-primas');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';
    
    // Simulación de materias primas (API de commodities no siempre disponible)
    const materias = [
        { nombre: 'Oro', simbolo: 'XAU', valor: 2034.50, cambio: 0.45 },
        { nombre: 'Plata', simbolo: 'XAG', valor: 22.85, cambio: -0.23 },
        { nombre: 'Petroleo WTI', simbolo: 'WTI', valor: 78.45, cambio: 1.12 },
        { nombre: 'Petroleo Brent', simbolo: 'BRT', valor: 82.30, cambio: 0.98 },
        { nombre: 'Cobre', simbolo: 'HG', valor: 3.85, cambio: -0.15 }
    ];
    
    datosMercado.materias = materias;
    
    container.innerHTML = materias.map(m => {
        const esPositivo = m.cambio >= 0;
        return `
            <div class="tasa-item">
                <div class="tasa-nombre">
                    <i class="fas fa-cube"></i>
                    ${m.nombre}
                </div>
                <div class="tasa-valor">
                    $${m.valor.toFixed(2)}
                    <span class="tasa-cambio ${esPositivo ? 'positivo' : 'negativo'}">
                        ${esPositivo ? '▲' : '▼'} ${Math.abs(m.cambio).toFixed(2)}%
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== ÍNDICES BURSÁTILES ====================
async function actualizarIndices() {
    const container = document.getElementById('indices-bursatiles');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';
    
    // Simulación de índices (se necesitan APIs de pago para datos reales)
    const indices = [
        { nombre: 'S&P 500', valor: 4927.93, cambio: 0.25 },
        { nombre: 'NASDAQ', valor: 15628.95, cambio: 0.45 },
        { nombre: 'DOW JONES', valor: 38654.42, cambio: 0.15 },
        { nombre: 'FTSE 100', valor: 7635.09, cambio: -0.32 },
        { nombre: 'DAX', valor: 16961.39, cambio: 0.18 }
    ];
    
    datosMercado.indices = indices;
    
    container.innerHTML = indices.map(i => {
        const esPositivo = i.cambio >= 0;
        return `
            <div class="tasa-item">
                <div class="tasa-nombre">
                    <i class="fas fa-building"></i>
                    ${i.nombre}
                </div>
                <div class="tasa-valor">
                    ${i.valor.toLocaleString()}
                    <span class="tasa-cambio ${esPositivo ? 'positivo' : 'negativo'}">
                        ${esPositivo ? '▲' : '▼'} ${Math.abs(i.cambio).toFixed(2)}%
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== ACTUALIZAR TODO ====================
async function actualizarTodo() {
    await Promise.all([
        actualizarTasas(),
        actualizarCriptos(),
        actualizarMaterias(),
        actualizarIndices()
    ]);
    
    // Análisis automático con Mistral (solo una vez al inicio)
    setTimeout(() => {
        analisisMercadoAutomatico();
    }, 3000);
    
    // Actualizar análisis cada 4 minutos
    setInterval(() => {
        actualizarTasas().then(() => actualizarCriptos().then(() => analisisMercadoAutomatico()));
    }, 240000);
}

// ==================== MISTRAL PARA ANÁLISIS ====================
async function analisisMercadoAutomatico() {
    agregarMensajeAnalisis('⏳ Conectando con Mistral para análisis de mercado...');
    
    const prompt = `Datos mercado: BTC ${datosMercado.criptos[0]?.datos.usd || 'N/A'}, ETH ${datosMercado.criptos[1]?.datos.usd || 'N/A'}. Oro ${datosMercado.materias[0]?.valor || 'N/A'}. S&P 500 ${datosMercado.indices[0]?.valor || 'N/A'}. Resumen rápido: ¿qué oportunidades hay ahora?`;

    try {
        const response = await fetch(URL_MISTRAL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODELO_MISTRAL,
                messages: [
                    {
                        role: "system",
                        content: "Eres un experto analista financiero. Analiza datos del mercado y proporciona recomendaciones de inversión claras y concisas. Si detectas una oportunidad importante, adviértelo."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.6,
                max_tokens: 300
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        const analisis = data.choices[0].message.content;
        
        agregarMensajeAnalisis(analisis, true, 'Análisis de Mistral');
        
        // Verificar si hay alertas importantes
        if (analisis.toLowerCase().includes('oportunidad') || 
            analisis.toLowerCase().includes('recomendación') ||
            analisis.toLowerCase().includes('importante')) {
            agregarAlerta('🎯 Oportunidad Detectada', 'Mistral ha identificado algo importante. Revisa el análisis above.', true);
        }
        
    } catch (error) {
        console.error('Error Mistral:', error);
        agregarMensajeAnalisis(`⚠️ Error al conectar con Mistral: ${error.message}. Asegúrate de tener mistralai_ministral-3-3b-instruct-2512 cargado en LM Studio.`);
    }
}

// ==================== ANÁLISIS PROFUNDO ====================
async function pedirAnalisisProfundo() {
    const input = document.getElementById('pregunta-analisis');
    const pregunta = input.value.trim();
    
    if (!pregunta) {
        alert('Por favor escribe una pregunta sobre el mercado');
        return;
    }
    
    agregarMensajeAnalisis(`🔍 Pregunta: ${pregunta}`);
    input.value = '';
    
    // Incluir datos actuales del mercado
    const prompt = `${pregunta} - Datos clave: ${datosMercado.criptos.map(c => `${c.simbolo}: ${c.datos.usd}`).join(', ')}`;

    try {
        agregarMensajeAnalisis('⏳ Mistral analizando...');
        
        const response = await fetch(URL_MISTRAL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODELO_MISTRAL,
                messages: [
                    {
                        role: "system",
                        content: "Eres un asesor financiero experto. Responde en español de forma clara y útil."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        const analisis = data.choices[0].message.content;
        
        agregarMensajeAnalisis(analisis, true, 'Respuesta de Mistral');
        
    } catch (error) {
        console.error('Error análisis:', error);
        agregarMensajeAnalisis(`⚠️ Error: ${error.message}`);
    }
}

// Exportar funciones
window.actualizarTodo = actualizarTodo;
window.actualizarTasas = actualizarTasas;
window.actualizarCriptos = actualizarCriptos;
window.actualizarMaterias = actualizarMaterias;
window.actualizarIndices = actualizarIndices;
window.pedirAnalisisProfundo = pedirAnalisisProfundo;
