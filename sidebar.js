// Gestor de conversaciones e historial
const GestorConversaciones = (function() {
    // Variables privadas
    let conversaciones = [];
    let conversacionActual = null;
    let sidebarElemento = null;
    let toggleButton = null;
    let usuarioActual = null;

    // Obtener usuario actual
    function getUsuarioActual() {
        return sessionStorage.getItem('usuario_logueado') || 'invitado';
    }

    // Cargar conversaciones desde localStorage
    function cargarConversaciones() {
        usuarioActual = getUsuarioActual();
        const clave = `conversaciones_${usuarioActual}`;
        const guardadas = localStorage.getItem(clave);
        
        if (guardadas) {
            try {
                conversaciones = JSON.parse(guardadas);
            } catch (e) {
                console.error('Error al cargar conversaciones:', e);
                conversaciones = [];
            }
        } else {
            conversaciones = [];
        }
        
        return conversaciones;
    }

    // Guardar conversaciones en localStorage
    function guardarConversaciones() {
        if (!usuarioActual) {
            usuarioActual = getUsuarioActual();
        }
        const clave = `conversaciones_${usuarioActual}`;
        localStorage.setItem(clave, JSON.stringify(conversaciones));
    }

    // Recargar conversaciones (para cuando cambia el usuario)
    function recargarParaUsuario() {
        cargarConversaciones();
        
        // Actualizar nombre de usuario en el sidebar
        actualizarUsuario();
        
        // Si no hay conversación actual, crear una
        if (conversaciones.length === 0) {
            crearConversacion();
        } else {
            cargarConversacion(conversaciones[0].id);
        }
        
        renderizarLista();
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
        
        // Obtener nombre de usuario para mostrar
        const nombreUsuario = sessionStorage.getItem('usuario_logueado') || 'Invitado';
        
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
            <div class="sidebar-usuario">
                <i class="fas fa-user-circle"></i>
                <span>${nombreUsuario}</span>
            </div>
            <div class="sidebar-conversaciones" id="lista-conversaciones">
            </div>
            <div class="sidebar-nueva">
                <button class="btn-nueva-conversacion" onclick="GestorConversaciones.nuevaConversacion()">
                    <i class="fas fa-plus"></i> Nueva conversación
                </button>
                <button class="btn-nueva-conversacion btn-logout" onclick="cerrarSesion()" style="margin-top: 10px; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)">
                    <i class="fas fa-sign-out-alt"></i> Cerrar sesión
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

    // Actualizar nombre de usuario en el sidebar
    function actualizarUsuario() {
        const nombreUsuario = sessionStorage.getItem('usuario_logueado') || 'Invitado';
        const elementoUsuario = document.querySelector('.sidebar-usuario span');
        if (elementoUsuario) {
            elementoUsuario.textContent = nombreUsuario;
        }
        
        // Actualizar visibilidad del botón de logout en sidebar
        const btnLogout = document.querySelector('.btn-logout');
        if (btnLogout) {
            if (nombreUsuario && nombreUsuario !== 'Invitado') {
                btnLogout.style.display = 'flex';
            } else {
                btnLogout.style.display = 'none';
            }
        }
        
        // Notificar que el usuario cambió para actualizar UI
        window.dispatchEvent(new CustomEvent('usuarioActualizado', { 
            detail: { usuario: nombreUsuario } 
        }));
    }

    // Inicializar
    function inicializar() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', crearSidebar);
        } else {
            crearSidebar();
        }
        
        // Escuchar cambios en sessionStorage (cuando usuario inicia/cierra sesión)
        window.addEventListener('storage', function(e) {
            if (e.key === 'usuario_logueado') {
                // El usuario cambió, recargar conversaciones
                recargarParaUsuario();
            }
        });
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
        recargarParaUsuario,
        actualizarUsuario,
        getTodas: () => conversaciones
    };
})();

// Exportar globalmente
window.GestorConversaciones = GestorConversaciones;
