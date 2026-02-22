document.addEventListener('DOMContentLoaded', function () {
    const entrada_chat = document.getElementById('input_chat');
    const Enviar = document.querySelector('.boton_de_chat');
    if (!entrada_chat || !Enviar) return; //condicion para retornar el mensaje

    Enviar.addEventListener('click', function () {
        const mensaje = entrada_chat.value.trim();
        if (mensaje) {
            entrada_chat.disabled = true;
            Enviar.disabled = true;

            window.llamarQwen()
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