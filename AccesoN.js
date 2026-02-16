(function(){
    const llamarPantalla = () => document.getElementById("estado");
    const llamarInterfaz = () => document.getElementById("interfaz-operativa"); // Nueva referencia

    const AccesoN = {
        activarAlerta: () => {
            const el = llamarPantalla();
            const ui = llamarInterfaz();
            if(el) el.style.display = "flex";
            if(ui) ui.style.display = "none"; // Oculta el contenido del index
        },
        AlertaDesactivada: () => {
            const el = llamarPantalla();
            const ui = llamarInterfaz();
            if(el) el.style.display = "none";
            if(ui) ui.style.display = "block"; // Muestra el contenido del index
        }
    };
    window.AccesoN = Object.freeze(AccesoN);
})();