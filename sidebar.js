// Gestor de conversaciones e historial
const GestorConversaciones = (function() {
    // Variables privadas
    let conversaciones = [];
    let conversacionActual = null;
    let sidebarElemento = null;
    let toggleButton = null;

    // Cargar conversaciones desde localStorage
    function cargarConversaciones() {
        const usuario = sessionStorage.getItem('usuario_logueado') || 'invitado';
        const clave = `conversaciones_${usuario}`;
        const guardadas = localStorage.getItem(clave);
        
        if (guardadas) {
            try {
                conversaciones = JSON.parse(guardadas);
            } catch (e) {
                console.error('Error al cargar conversaciones:', e);
                conversaciones = [];
            }
        }
        
        return conversaciones;
    }

    // Guardar conversaciones en localStorage
    function guardarConversaciones() {
        const usuario = sessionStorage.getItem('usuario_logueado') || 'invitado';
        const clave = `conversaciones_${usuario}`;
        localStorage.setItem(clave, JSON.stringify(conversaciones));
    }

    // Generar título automático basado en el primer mensaje
    function generarTitulo(mensaje) {
        if (!mensaje) return 'Nueva conversación';
        
        // Tomar las primeras palabras del mensaje
        let titulo = mensaje.substring(0, 30);
        if (mensaje.length > 30) {
            titulo += '...';
        }
        
        // Capitalizar primera letra
        return titulo.charAt(0).toUpperCase() + titulo.slice(1);
    }

    // Crear una nueva conversación
    function crearConversacion() {
        const nueva = {
            id: Date.now(),
            titulo: 'Nueva conversación',
            fecha: new Date().toISOString(),
            mensajes: []
        };
        
        conversaciones.unshift(nueva);
        guardarConversaciones();
        conversacionActual = nueva;
        
        renderizarLista();
        return nueva;
    }

    // Agregar mensaje a la conversación actual
    function agregarMensaje(rol, contenido) {
        if (!conversacionActual) {
            crearConversacion();
        }
        
        // Actualizar título si es el primer mensaje
        if (conversacionActual.mensajes.length === 0 && rol === 'user') {
            conversacionActual.titulo = generarTitulo(contenido);
        }
        
        conversacionActual.mensajes.push({
            rol: rol,
            contenido: contenido,
            fecha: new Date().toISOString()
        });
        
        // Actualizar fecha de modificación
        conversacionActual.fecha = new Date().toISOString();
        
        // Mover al inicio de la lista
        const indice = conversaciones.findIndex(c => c.id === conversacionActual.id);
        if (indice > 0) {
            conversaciones.splice(indice, 1);
            conversaciones.unshift(conversacionActual);
        }
        
        guardarConversaciones();
        renderizarLista();
        
        return conversacionActual;
    }

    // Obtener la conversación actual
    function getConversacionActual() {
        return conversacionActual;
    }

    // Obtener todos los mensajes de la conversación actual
    function getMensajes() {
        return conversacionActual ? conversacionActual.mensajes : [];
    }

    // Cargar una conversación específica
    function cargarConversacion(id) {
        const conv = conversaciones.find(c => c.id === id);
        if (conv) {
            conversacionActual = conv;
            renderizarLista();
            
            // Disparar evento para que otros módulos puedan cargar los mensajes
            window.dispatchEvent(new CustomEvent('cargarConversacion', { 
                detail: { conversacion: conv } 
            }));
            
            return conv;
        }
        return null;
    }

    // Eliminar una conversación
    function eliminarConversacion(id) {
        const indice = conversaciones.findIndex(c => c.id === id);
        if (indice !== -1) {
            conversaciones.splice(indice, 1);
            guardarConversaciones();
            
            // Si era la actual, crear nueva
            if (conversacionActual && conversacionActual.id === id) {
                if (conversaciones.length > 0) {
                    cargarConversacion(conversaciones[0].id);
                } else {
                    crearConversacion();
                }
            }
            
            renderizarLista();
            return true;
        }
        return false;
    }

    // Renombrar una conversación
    function renombrarConversacion(id, nuevoTitulo) {
        const conv = conversaciones.find(c => c.id === id);
        if (conv) {
            conv.titulo = nuevoTitulo;
            conv.fecha = new Date().toISOString();
            guardarConversaciones();
            renderizarLista();
            return true;
        }
        return false;
    }

    // Formatear fecha
    function formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        const ahora = new Date();
        const diffMs = ahora - fecha;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMs / 3600000);
        const diffDias = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHoras < 24) return `Hace ${diffHoras} h`;
        if (diffDias < 7) return `Hace ${diffDias} días`;
        
        return fecha.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short' 
        });
    }

    // Renderizar la lista de conversaciones
    function renderizarLista() {
        const container = document.getElementById('lista-conversaciones');
        if (!container) return;
        
        if (conversaciones.length === 0) {
            container.innerHTML = `
                <div class="sidebar-vacio">
                    <i class="fas fa-comments"></i>
                    <p>No hay conversaciones aún.<br>¡Inicia una nueva!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = conversaciones.map(conv => {
            const ultimoMensaje = conv.mensajes[conv.mensajes.length - 1];
            const preview = ultimoMensaje ? ultimoMensaje.contenido.substring(0, 40) : 'Sin mensajes';
            
            return `
                <div class="conversacion-item ${conversacionActual && conversacionActual.id === conv.id ? 'active' : ''}" 
                     data-id="${conv.id}" onclick="GestorConversaciones.cargarConversacion(${conv.id})">
                    <div class="conversacion-titulo">
                        <i class="fas fa-comment-dots"></i>
                        ${conv.titulo}
                    </div>
                    <div class="conversacion-fecha">${formatearFecha(conv.fecha)}</div>
                    <div class="conversacion-preview">${preview}...</div>
                    <div class="conversacion-acciones">
                        <button class="btn-accion" onclick="event.stopPropagation(); GestorConversaciones.renombrarConversacionPrompt(${conv.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-accion eliminar" onclick="event.stopPropagation(); GestorConversaciones.eliminarConversacion(${conv.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Crear elementos HTML del sidebar
    function crearSidebar() {
        // Crear botón toggle
        toggleButton = document.createElement('button');
        toggleButton.className = 'sidebar-toggle';
        toggleButton.id = 'sidebarToggle';
        toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
        toggleButton.onclick = toggleSidebar;
        document.body.appendChild(toggleButton);
        
        // Crear sidebar
        sidebarElemento = document.createElement('div');
        sidebarElemento.className = 'sidebar';
        sidebarElemento.id = 'sidebar';
        sidebarElemento.innerHTML = `
            <div class="sidebar-header">
                <h3><i class="fas fa-history"></i> Historial</h3>
                <button class="sidebar-close" onclick="GestorConversaciones.cerrarSidebar()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="sidebar-conversaciones" id="lista-conversaciones">
            </div>
            <div class="sidebar-nueva">
                <button class="btn-nueva-conversacion" onclick="GestorConversaciones.nuevaConversacion()">
                    <i class="fas fa-plus"></i> Nueva conversación
                </button>
            </div>
        `;
        document.body.appendChild(sidebarElemento);
        
        // Cargar conversaciones
        cargarConversaciones();
        
        // Si no hay conversación actual, crear una
        if (conversaciones.length === 0) {
            crearConversacion();
        } else {
            cargarConversacion(conversaciones[0].id);
        }
        
        renderizarLista();
    }

    // Toggle sidebar
    function toggleSidebar() {
        if (sidebarElemento) {
            sidebarElemento.classList.toggle('active');
            toggleButton.classList.toggle('active');
        }
    }

    // Cerrar sidebar
    function cerrarSidebar() {
        if (sidebarElemento) {
            sidebarElemento.classList.remove('active');
            toggleButton.classList.remove('active');
        }
    }

    // Abrir sidebar
    function abrirSidebar() {
        if (sidebarElemento) {
            sidebarElemento.classList.add('active');
            toggleButton.classList.add('active');
        }
    }

    // Prompt para renombrar
    function renombrarConversacionPrompt(id) {
        const conv = conversaciones.find(c => c.id === id);
        if (!conv) return;
        
        const nuevoTitulo = prompt('Ingresa el nuevo nombre:', conv.titulo);
        if (nuevoTitulo && nuevoTitulo.trim()) {
            renombrarConversacion(id, nuevoTitulo.trim());
        }
    }

    // Inicializar
    function inicializar() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', crearSidebar);
        } else {
            crearSidebar();
        }
    }

    // Inicializar
    inicializar();

    // API pública
    return {
        crearConversacion,
        nuevaConversacion: crearConversacion,
        agregarMensaje,
        getConversacionActual,
        getMensajes,
        cargarConversacion,
        eliminarConversacion,
        renombrarConversacion,
        renombrarConversacionPrompt,
        toggleSidebar,
        cerrarSidebar,
        abrirSidebar,
        getTodas: () => conversaciones
    };
})();

// Exportar globalmente
window.GestorConversaciones = GestorConversaciones;
