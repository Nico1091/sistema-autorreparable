const urlModels = "http://localhost:1234/v1/models";
const RequestModel = ["deepseek/deepseek-r1-0528-qwen3-8b",
    "mistralai_ministral-3-3b-instruct-2512",
    "deepseek/deepseek-r1-0528-qwen3-8b",
    "qwen/qwen2.5-coder-14b"
];
async function Conexion() {
    try {
        const response = await fetch(urlModels, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer not-needed"
            }
        });

        if (response.ok) {
            const data = await response.json();
            const ServerModels = data.data.map(m => m.id);
            const comprobacionServer = RequestModel.every(mod => ServerModels.includes(mod));
            if (comprobacionServer) {
                window.AccesoN.AlertaDesactivada();
            } else {
                const faltantes = RequestModel.filter(mod => !ServerModels.includes(mod));
                console.warn("Faltan modelos criticos", faltantes);
                window.AccesoN.activarAlerta();
            }
        } else {
            window.AccesoN.activarAlerta();
        }
    } catch (error) {
        window.AccesoN.activarAlerta();
    }
}

setInterval(Conexion, 4000);
Conexion();