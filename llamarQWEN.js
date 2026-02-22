const url_chat = "http://localhost:1234/v1/chat/completions";
/*Constante de url ubicacion donde se encuentra especificamente: 
1.la ubicacion y puertos en local
2.v1: la version especifica que se esta usando   
3.chat: la llamada a la ubicacion del chat
4.completions: la peticion de que complete las respuestas de manera estadistica
*/


async function llamarQwen() {
    /*Variable para guardar los chats*/
    const inputChat = document.getElementById('input_chat');
    const mensajeUsuario = inputChat.value.trim();
    if(window.sincronizarConVector){
        window.sincronizarConVector('user',mensajeUsuario);
    }


    /*funcion para sincronizar*/
    const Rol = {
        //Metodo para que el rol que debe cumplir el modelo
        model: "qwen/qwen2.5-coder-14b",
        //modelo que solicito se cargue especificacmente 
        messages: [
            {
                role: "system", content: "Eres Qwen un modelo gerente" +
                    //este es el rol que ocupa en el sistema este modelo
                    "cuya labor es encargarte de un departamento" +
                    "el cual es gerencia" +
                    "deberas tener un mandato el cual usaras para revisar y aprobar" +
                    "algo segun lo que observes o se te indique" +
                    "si es que tienes un modelo secretario debes revisar lo que te diga" +
                    "hacer una pequeña revision y aprobar" +
                    "de lo contrario debes revisar todo con detenimiento y tomar una decision" +
                    "si la decision es negativa deberas aclarar los puntos por los cuales es negativa" +
                    "y decirle al otro modelo del departamento correspondiente que haga las respectivas mejoras" +
                    "los departamentos de que deberas gerenciar son:" +
                    "departamento de estructura de evolucion: Encargado de la revision de viabilidad de los negocios propuestos" +
                    "departamento de celula legal proactiva:Encargado de la revision legal consulta de leyes mediante web scraping" +
                    "y analisis de estas sobre las cuales tu revisaras y comprobaras que sean o no correctas" +
                    "para dar aprobacion a este proyecto" +
                    "y el departamento de enjambre operativo: encargado del desarrollo de los programas" +
                    "y comprobacion de si estsos funcionan tu deberas asegurarte de la funcionalidad y cumplimento de estos junto a tu modelo secretoario si es que este esta aqui" +
                    "eres del departamento llamado: Orquestacion superior sobre ti pesa una responsabilidad muy grande para los desarrollos de todo no lo olvides" +
                    "Tu nombre es agente decisor superior"
            },
            {
                role: "user", content: document.getElementById('input_chat').value.trim()
                //Role que cumple para cumplir con las peticiones del usuario
            }

        ],
        temperature: 0.8
    };  // fin de la peticion de rol a cumplir por el modelo
    try {

        if (window.sincronizarConVector) {
            window.sincronizarConVector('user', mensajeUsuario);
        }
        //intentar cumplir con la funcion de peticion del usuario al sistema
        console.log("Enviando tu peticion al sistema local ... "); // Cambiar a animacion de cargando
        const respuesta = await fetch(url_chat, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Rol)
        });

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        // Verificar que la respuesta tenga el formato esperado
        console.log(datos.choices[0].message.content);
        if (datos && datos.choices && datos.choices.length > 0 && datos.choices[0].message) {

            /*Cambios De BD*/
            /*Constante para la base de datos*/
            const contenidoIA = datos.choices[0].message.content;
            if (window.sincronizarConVector) {
                window.sincronizarConVector('assistant', contenidoIA);
            }



            const PanelRespuestas = document.querySelector('.Panel_Answers');
            const id_Work = document.querySelector('.Identificador_tarea');
            if (PanelRespuestas && id_Work) {
                PanelRespuestas.style.display = 'block';
                id_Work.textContent = datos.choices[0].message.content;
                return datos;
            }

        } else {
            console.warn("La respuesta del servidor no tiene el formato esperado:", datos);
            throw new Error("Respuesta inválida del servidor");
        }

    } catch (error) {
        //Metodo de prevencion ante eventos no esperados en este modelo(Encapsulacion de errores)
        console.error("ERROR DE CONEXION", error);
        if (window.AccesoN && typeof window.AccesoN.activarAlerta === 'function') {
            window.AccesoN.activarAlerta();
        } else {
            alert("ERROR DE CONEXION: " + error.message);
        }
        throw error;
    }

}
// Exportar la funcion para uso externo
window.llamarQwen = llamarQwen;