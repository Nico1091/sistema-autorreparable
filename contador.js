// Barra de progreso de tokens gastados
// Este módulo cuenta los tokens utilizados en las conversaciones con Qwen
// Límite: 200,000 tokens

const BarraTokens = (function() {
    // Constantes privadas
    const LIMITE_TOKENS = 200000;
    
    // Variables privadas
    let tokensInput = 0;
    let tokensOutput = 0;
    let barraElemento = null;

    // Función para estimar tokens (aproximación: ~3.5 caracteres por token)
    function estimarTokens(texto) {
        if (!texto || typeof texto !== 'string') return 0;
        return Math.ceil(texto.length / 3.5);
    }

    // Función para crear el elemento HTML de la barra
    function crearBarra() {
        const barra = document.createElement('div');
        barra.className = 'barra-tokens';
        barra.id = 'barraTokens';
        
        // Verificar si hay usuario logueado
        const usuarioLogueado = sessionStorage.getItem('usuario_logueado');
        const botonIngreso = usuarioLogueado 
            ? '' 
            : `<button class="boton-ingreso" onclick="window.location.href='ingreso.html'">
                <i class="fas fa-sign-in-alt"></i> Ingrese
               </button>`;
        
        barra.innerHTML = `
            <div class="barra-tokens-container">
                <div class="barra-tokens-label">
                    <div class="titulo">
                        <i class="fas fa-coins"></i>
                        Tokens Gastados
                    </div>
                    <div class="contador">
                        <span id="tokens-contador">0</span> / <span class="limite">${LIMITE_TOKENS.toLocaleString()}</span>
                    </div>
                </div>
                <div class="barra-fondo">
                    <div class="barra-relleno" id="barra-relleno"></div>
                </div>
                <div class="barra-porcentaje" id="barra-porcentaje">0%</div>
                ${botonIngreso}
            </div>
        `;
        document.body.appendChild(barra);
        barraElemento = barra;
        return barra;
    }

    // Función para formatear números con animación de contador
    function formatearNumeroConAnimacion(elemento, valorActual, valorNuevo, duracion = 500) {
        if (!elemento) return;
        
        const inicio = valorActual;
        const fin = valorNuevo;
        const incremento = (fin - inicio) / (duracion / 16);
        let actual = inicio;
        
        function actualizar() {
            actual += incremento;
            if ((incremento > 0 && actual >= fin) || (incremento < 0 && actual <= fin)) {
                actual = fin;
                elemento.textContent = Math.floor(fin).toLocaleString();
            } else {
                elemento.textContent = Math.floor(actual).toLocaleString();
                requestAnimationFrame(actualizar);
            }
        }
        
        actualizar();
    }

    // Función para actualizar la visualización
    function actualizarDisplay() {
        if (!barraElemento) return;
        
        const contadorEl = document.getElementById('tokens-contador');
        const rellenoEl = document.getElementById('barra-relleno');
        const porcentajeEl = document.getElementById('barra-porcentaje');
        
        const totalTokens = tokensInput + tokensOutput;
        const porcentaje = Math.min((totalTokens / LIMITE_TOKENS) * 100, 100);
        
        // Actualizar contador con animación
        const valorAnterior = parseInt(contadorEl?.textContent.replace(/,/g, '') || '0');
        formatearNumeroConAnimacion(contadorEl, valorAnterior, totalTokens);
        
        // Actualizar barra de progreso
        if (rellenoEl) {
            rellenoEl.style.width = porcentaje + '%';
            
            // Cambiar color cuando se acerca al límite
            if (porcentaje >= 90) {
                rellenoEl.classList.add('lleno');
            } else {
                rellenoEl.classList.remove('lleno');
            }
        }
        
        // Actualizar porcentaje
        if (porcentajeEl) {
            porcentajeEl.textContent = porcentaje.toFixed(1) + '%';
        }
        
        console.log(`[Barra Tokens] Total: ${totalTokens.toLocaleString()} / ${LIMITE_TOKENS.toLocaleString()} (${porcentaje.toFixed(1)}%)`);
    }

    // Función para añadir tokens del input (mensaje del usuario)
    function agregarTokensInput(texto) {
        const tokens = estimarTokens(texto);
        tokensInput += tokens;
        actualizarDisplay();
    }

    // Función para añadir tokens del output (respuesta del modelo)
    function agregarTokensOutput(texto) {
        const tokens = estimarTokens(texto);
        tokensOutput += tokens;
        actualizarDisplay();
    }

    // Función para obtener el total de tokens
    function getTotalTokens() {
        return tokensInput + tokensOutput;
    }

    // Función para obtener breakdown
    function getBreakdown() {
        return {
            input: tokensInput,
            output: tokensOutput,
            total: tokensInput + tokensOutput,
            limite: LIMITE_TOKENS,
            porcentaje: Math.min((tokensInput + tokensOutput) / LIMITE_TOKENS * 100, 100)
        };
    }

    // Función para resetear el contador
    function resetear() {
        tokensInput = 0;
        tokensOutput = 0;
        actualizarDisplay();
        console.log('[Barra Tokens] Contador reseteado');
    }

    // Inicialización
    function inicializar() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', crearBarra);
        } else {
            crearBarra();
        }
        console.log('[Barra Tokens] Inicializada - Límite: ' + LIMITE_TOKENS.toLocaleString() + ' tokens');
    }

    // Función para actualizar visibilidad del botón de ingreso
    function actualizarBotonIngreso() {
        if (!barraElemento) return;
        
        const usuarioLogueado = sessionStorage.getItem('usuario_logueado');
        const boton = barraElemento.querySelector('.boton-ingreso');
        
        if (boton) {
            if (usuarioLogueado) {
                boton.style.display = 'none';
            } else {
                boton.style.display = 'block';
            }
        }
    }

    // Hook para integrar con llamarQwen
    function hookLlamarQwen() {
        const originalFuncion = window.llamarQwen;
        
        if (originalFuncion) {
            window.llamarQwen = async function() {
                // Contar tokens del input antes de enviar
                const inputChat = document.getElementById('input_chat');
                if (inputChat && inputChat.value.trim()) {
                    // Contar también el system prompt (aproximado)
                    const systemPrompt = "Responde siempre en español. Eres Qwen un modelo gerente cuya labor es encargarte de un departamento el cual es gerencia deberas tener un mandato el cual usaras para revisar y aprobar algo segun lo que observes o se te indique si es que tienes un modelo secretaria debes revisar lo que te diga hacer una pequena revision y aprobar de lo contrario debes revisar todo con detenimiento y tomar una decision si la decision es negativa deberas aclarar los puntos por los cuales es negativa y decirle al otro modelo del departamento correspondiente que haga las respectivas mejoras los departamentos de que deberas gerenciar son: departamento de estructura de evolucion: Encargado de la revision de viabilidad de los negocios propuestos departamento de celula legal proactiva:Encargado de la revision legal consulta de leyes mediante web scraping y analisis de estas sobre las cuales tu revisaras y comprobaras que sean o no correctas para dar aprobacion a este proyecto y el departamento de enjambre operativo: encargado del desarrollo de los programas y comprobacion de si estos funcionan tu deberas asegurarte de la funcionalidad y cumplimiento de estos junto a tu modelo secretoario si es que este esta aqui eres del departamento llamado: Orquestacion superior sobre ti pesa una responsabilidad muy grande para los desarrollos de todo no lo olvides Tu nombre es agente decisor superior";
                    agregarTokensInput(systemPrompt);
                    agregarTokensInput(inputChat.value.trim());
                }
                
                try {
                    const resultado = await originalFuncion.apply(this, arguments);
                    
                    // Contar tokens de la respuesta
                    if (resultado && resultado.choices && resultado.choices[0] && resultado.choices[0].message) {
                        const contenido = resultado.choices[0].message.content;
                        if (contenido) {
                            agregarTokensOutput(contenido);
                        }
                    }
                    
                    return resultado;
                } catch (error) {
                    console.error('[Barra Tokens] Error en llamada a Qwen:', error);
                    throw error;
                }
            };
            console.log('[Barra Tokens] Hookeado a llamarQwen');
        }
    }

    // Inicializar automáticamente
    inicializar();

    // API pública
    return {
        agregarTokensInput,
        agregarTokensOutput,
        getTotalTokens,
        getBreakdown,
        resetear,
        hookLlamarQwen,
        actualizarBotonIngreso,
        LIMITE: LIMITE_TOKENS
    };
})();

// Auto-hookear cuando esté disponible
if (window.llamarQwen) {
    BarraTokens.hookLlamarQwen();
} else {
    window.addEventListener('load', function() {
        BarraTokens.hookLlamarQwen();
    });
}

// Exportar para acceso global
window.BarraTokens = BarraTokens;
