const url = "http://localhost:1234/v1/models";
async function Conexion(){
    try{
       const response = await fetch(url);
      
       if(response.ok ) {
        window.AccesoN.AlertaDesactivada();
       } else {
        window.AccesoN.activarAlerta();
       }
    } catch (error) {
        window.AccesoN.activarAlerta();
    }
}

setInterval(Conexion,4000);
Conexion();
