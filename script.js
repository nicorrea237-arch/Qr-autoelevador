// ==========================================
// CONFIGURACIÓN
// ==========================================

const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbw6a0pf5dYhZQjuh85gxOT8B5NV6yrOdch1S92V_ypxD5J2EZbnfOa7K1SiUBHE2xaqjA/exec";

// BANCO DE PREGUNTAS EXACTO POR TIPO DE EQUIPO Y NÚMERO
const BANCO_PREGUNTAS = {
    // 1. AUTOELEVADOR (Estándar)
    "autoelevador": [
        "1. Inspeccionar la carroceria (Choques, Raspones, protección faltante, etc).",
        "2. Verificar existencia y correcto estado de los espejos retrovisores.",
        "3. Verificar correcto estado y desgaste dentro de los parámetros de las cubiertas.",
        "4. Verificar correcto estado de las uñas y parrilla. Controlar la Fijación.",
        "5. Controlar existencia, estado y vencimiento del extintor.",
        "6. * Controlar nivel de aceite del motor y convertidor.",
        "7. * Controlar nivel de liquido refrigerante.",
        "8. Verificar correcto estado del asiento y cinturón de seguridad.",
        "9. Poner en marcha, prestar atención a ruidos extraños y verificar correcto avance y retroceso.",
        "10. * Verificar correcto funcionamiento de Freno de pie y mano.",
        "11. Verificar correcto funcionamiento de la sirena de retroceso.",
        "12. Verificar correcto funcionamiento de luces y bocinas.",
        "13. Controlar nivel de aceite hidraulico.",
        "14. Verificar correcto funcionamiento y regulación de láser delantero y trasero (si aplica)."
    ],

    // 2. AUTOELEVADOR ELÉCTRICO / AUTO ELEVADOR ELECTRICA
    "autoelevador electrico": [
        "1. Inspeccionar la carroceria (Choques, Raspones, protección faltante, etc).",
        "2. Verificar existencia y correcto estado de los espejos retrovisores.",
        "3. Verificar correcto estado y desgaste dentro de los parámetros de las cubiertas.",
        "4. Verificar voltaje de la bateria.",
        "5. Verificar el amperaje de la bateria.",
        "6. Verificar porcentaje de la bateria.",
        "7. Verificar correcto estado del asiento y cinturón de seguridad.",
        "8. Poner en marcha, prestar atención a ruidos extraños.",
        "9. * Verificar correcto funcionamiento de Freno.",
        "10. Verificar correcto funcionamiento de la sirena de retroceso.",
        "11. Verificar correcto funcionamiento de luces y bocinas.",
        "12. Verificar correcto control de los mandos.",
        "13. Verificar estado de magueras."
    ],

    // 3. APILADORA
    "apiladora": [
        "1. Inspeccionar la carroceria (Choques, Raspones, protección faltante, etc).",
        "2. Controlar nivel eletrolitico de bateria.",
        "3. Verificar correcto estado y desgaste dentro de los parámetros de las cubiertas.",
        "4. Verificar correcto estado de las uñas y parrilla. Controlar la Fijación.",
        "5. Controlar existencia, estado y vencimiento del extintor.",
        "6. Cotrol visual de las mangueras.",
        "7. Control del nivel de carga de la bateria.",
        "8. Verificar correcto estado del asiento y cinturón de seguridad (si aplica).",
        "9. Poner en marcha, prestar atención a ruidos extraños.",
        "10. * Verificar correcto funcionamiento de Freno.",
        "11. Verificar correcto funcionamiento de la sirena de retroceso.",
        "12. Verificar correcto funcionamiento de luces y bocinas."
    ],

    // 4. CAMIÓN PLANTA / CONTAINERA
    "camion planta": [
        "1. Inspeccionar la carroceria (Choques, Raspones, protección faltante, etc).",
        "2. Verificar existencia y correcto estado de los espejos retrovisores.",
        "3. Verificar correcto estado y desgaste dentro de los parámetros de las cubiertas.",
        "4. Controlar existencia, estado y vencimiento del extintor.",
        "5. * Controlar nivel de aceite del motor.",
        "6. * Controlar nivel de liquido refrigerante.",
        "7. Verificar correcto estado del asiento y cinturón de seguridad.",
        "8. Poner en marcha, prestar atención a ruidos extraños.",
        "9. * Verificar correcto funcionamiento de Freno de pie y mano.",
        "10. Verificar correcto funcionamiento de la sirena de retroceso.",
        "11. Verificar correcto funcionamiento de luces y bocinas.",
        "12. Controlar nivel de aceite hidraulico.",
        "13. Controlar nivel y estado de aceite diferencial.",
        "14. Controlar nivel y estado de aceite convertidor.",
        "15. Verificar nivel y estado de agua destilada."
    ],

    // 5. ZORRA (Usa la lista simplificada estándar)
    "zorra": [
        "1. Inspeccionar la carroceria y estructura general.",
        "2. Controlar estado de ruedas y rodamientos.",
        "3. Verificar correcto funcionamiento del sistema hidráulico de elevación y descenso.",
        "4. Controlar estado del timón/palanca de mando."
    ]
};
// ==========================================
// VARIABLES GLOBALES
// ==========================================

let respuestas = {};
let modoActual = "operario";
let preguntasActuales = [];

// ==========================================
// INICIO Y CARGA AUTOMÁTICA
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    cargarEquipoYPreguntas();
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 1000);
});

// ==========================================
// OBTENER EQUIPO DESDE LA URL Y CARGAR PREGUNTAS
// ==========================================

function cargarEquipoYPreguntas() {
    const parametros = new URLSearchParams(window.location.search);
    const equipo = parametros.get("equipo") || "";
    const elemento = document.getElementById("nombreEquipo");

    // Normalizar texto: minúsculas y sin tildes
    let textoBusqueda = equipo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (textoBusqueda.includes("electrica") || textoBusqueda.includes("electrico")) {
        preguntasActuales = BANCO_PREGUNTAS["autoelevador electrico"];
    } else if (textoBusqueda.includes("apiladora") || textoBusqueda.includes("apilador")) {
        preguntasActuales = BANCO_PREGUNTAS["apiladora"];
    } else if (textoBusqueda.includes("camion") || textoBusqueda.includes("containera")) {
        preguntasActuales = BANCO_PREGUNTAS["camion planta"];
    } else if (textoBusqueda.includes("zorra")) {
        preguntasActuales = BANCO_PREGUNTAS["zorra"];
    } else if (textoBusqueda.includes("autoelevador")) {
        preguntasActuales = BANCO_PREGUNTAS["autoelevador"];
    } else {
        preguntasActuales = BANCO_PREGUNTAS["autoelevador"]; // Por defecto
    }

    if (elemento) {
        elemento.textContent = equipo ? equipo : "Equipo no identificado";
    }

    renderizarPreguntas();
}
// ==========================================
// RENDERIZAR DINÁMICAMENTE EN EL DOM
// ==========================================

function renderizarPreguntas() {
    const contenedor = document.getElementById("contenedorPreguntas");
    if (!contenedor) return;

    contenedor.innerHTML = ""; // Limpiar contenido

    preguntasActuales.forEach((textoPregunta, index) => {
        const num = index + 1;
        const divPregunta = document.createElement("div");
        divPregunta.className = "pregunta";
        divPregunta.innerHTML = `
            <p>${textoPregunta}</p>
            <div class="opciones">
                <button type="button" onclick="seleccionar(this, ${num}, 'ok')">OK</button>
                <button type="button" onclick="seleccionar(this, ${num}, 'nook')">NO OK</button>
            </div>
        `;
        contenedor.appendChild(divPregunta);
    });
}

// ==========================================
// FECHA Y HORA EN VIVO
// ==========================================

function actualizarFechaHora() {
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString("es-AR");
    const hora = ahora.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    const fechaElemento = document.getElementById("fecha");
    const horaElemento = document.getElementById("hora");

    if (fechaElemento) fechaElemento.textContent = fecha;
    if (horaElemento) horaElemento.textContent = hora;
}

// ==========================================
// SELECCIONAR OK / NO OK
// ==========================================

function seleccionar(boton, numeroPregunta, resultado) {
    respuestas[numeroPregunta] = resultado === "ok" ? "OK" : "NO OK";

    const opcionesDiv = boton.closest(".opciones");
    if (!opcionesDiv) return;

    const botones = opcionesDiv.querySelectorAll("button");
    botones.forEach(btn => btn.classList.remove("seleccionado"));

    boton.classList.add("seleccionado");
}

// ==========================================
// CAMBIAR MODOS (OPERARIO / SUPERVISOR)
// ==========================================

function mostrarOperario() {
    modoActual = "operario";
    actualizarBotonesModo(0);
    document.getElementById("operarioForm").style.display = "block";
    document.getElementById("supervisorPanel").style.display = "none";
}

function mostrarSupervisor() {
    modoActual = "supervisor";
    actualizarBotonesModo(1);
    document.getElementById("operarioForm").style.display = "none";
    document.getElementById("supervisorPanel").style.display = "block";
    cargarUltimoControl();
}

function actualizarBotonesModo(indiceActivo) {
    const botones = document.querySelectorAll(".modo-btn");
    botones.forEach(b => b.classList.remove("activo"));
    if (botones[indiceActivo]) botones[indiceActivo].classList.add("activo");
}

// ==========================================
// ENVIAR CONTROL DE OPERARIO
// ==========================================

async function enviarControl() {
    const operarioInput = document.getElementById("operario");
    const observacionesElemento = document.querySelector(".observaciones textarea");

    const operario = operarioInput ? operarioInput.value.trim() : "";
    const observaciones = observacionesElemento ? observacionesElemento.value.trim() : "";

    if (!operario) {
        alert("Ingrese el nombre del operario.");
        if (operarioInput) operarioInput.focus();
        return;
    }

    for (let i = 1; i <= preguntasActuales.length; i++) {
        if (!respuestas[i]) {
            alert("Debe responder todas las preguntas.\n\nFalta responder la pregunta Nº " + i);
            return;
        }
    }

    const parametros = new URLSearchParams(window.location.search);
    const equipo = parametros.get("equipo") || "Desconocido";

    const resultadoGeneral = Object.values(respuestas).includes("NO OK") ? "NO OK" : "OK";

    const datos = {
        accion: "guardarControl",
        equipo: equipo,
        operario: operario,
        fechaHora: new Date().toISOString(),
        resultado: resultadoGeneral,
        respuestas: respuestas,
        observaciones: observaciones
    };

    const botonEnviar = document.querySelector(".enviar button");
    if (botonEnviar) {
        botonEnviar.disabled = true;
        botonEnviar.textContent = "GUARDANDO...";
    }

    try {
        await fetch(URL_APPS_SCRIPT, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(datos)
        });

        alert("CONTROL REGISTRADO CORRECTAMENTE\n\nEquipo: " + equipo + "\nOperario: " + operario + "\nResultado: " + resultadoGeneral);

        respuestas = {};
        document.querySelectorAll(".opciones button").forEach(btn => btn.classList.remove("seleccionado"));
        if (operarioInput) operarioInput.value = "";
        if (observacionesElemento) observacionesElemento.value = "";

    } catch (error) {
        console.error(error);
        alert("Se produjo un error al enviar el control.");
    }

    if (botonEnviar) {
        botonEnviar.disabled = false;
        botonEnviar.textContent = "ENVIAR CONTROL";
    }
}

// ==========================================
// CARGAR Y MOSTRAR ÚLTIMO CONTROL (SUPERVISOR)
// ==========================================

async function cargarUltimoControl() {
    const parametros = new URLSearchParams(window.location.search);
    const equipo = parametros.get("equipo");

    if (!equipo) {
        mostrarSinControl();
        return;
    }

    try {
        const respuesta = await fetch(URL_APPS_SCRIPT + "?accion=ultimoControl&equipo=" + encodeURIComponent(equipo));
        const datos = await respuesta.json();

        if (!datos.existe) {
            mostrarSinControl();
            return;
        }

        mostrarControlSupervisor(datos);
    } catch (error) {
        console.error(error);
        alert("No se pudo cargar el último control.");
    }
}

function mostrarControlSupervisor(datos) {
    document.getElementById("supervisorEquipo").textContent = datos.equipo || "-";
    document.getElementById("supervisorOperario").textContent = datos.operario || "-";
    document.getElementById("supervisorFecha").textContent = datos.fechaHora || "-";
    document.getElementById("supervisorResultado").textContent = datos.resultado || "-";
    document.getElementById("revisionObservaciones").textContent = datos.observaciones || "Sin observaciones.";

    const contenedorRevision = document.getElementById("contenedorRevision");
    contenedorRevision.innerHTML = "";

    const r = datos.respuestas || {};

    // Generar la lista de respuestas dinámicamente
    preguntasActuales.forEach((pregunta, index) => {
        const num = index + 1;
        const valor = r[num] || "-";
        
        const li = document.createElement("li");
        
        let estilo = "";
        if (valor === "OK") estilo = 'style="background: #d1e7dd; color: #0f5132;"';
        if (valor === "NO OK") estilo = 'style="background: #f8d7da; color: #842029;"';

        li.innerHTML = `<span>${pregunta}</span> <strong ${estilo}>${valor}</strong>`;
        contenedorRevision.appendChild(li);
    });

    window.controlActualId = datos.id || "";
}

function mostrarSinControl() {
    document.getElementById("supervisorEquipo").textContent = new URLSearchParams(window.location.search).get("equipo") || "-";
    document.getElementById("supervisorOperario").textContent = "Sin controles";
    document.getElementById("supervisorFecha").textContent = "-";
    document.getElementById("supervisorResultado").textContent = "PENDIENTE";
    document.getElementById("revisionObservaciones").textContent = "No existe un control realizado para este equipo.";
    document.getElementById("contenedorRevision").innerHTML = "<li>No hay respuestas registradas.</li>";
}

// ==========================================
// CONFIRMAR REVISIÓN DE SUPERVISOR
// ==========================================

async function confirmarRevision() {
    const supervisorInput = document.getElementById("nombreSupervisor");
    const supervisor = supervisorInput ? supervisorInput.value.trim() : "";

    if (!supervisor) {
        alert("Ingrese el nombre del supervisor.");
        if (supervisorInput) supervisorInput.focus();
        return;
    }

    if (!window.controlActualId) {
        alert("No hay un control disponible para revisar.");
        return;
    }

    const datos = {
        accion: "confirmarRevision",
        id: window.controlActualId,
        supervisor: supervisor,
        fechaHora: new Date().toISOString()
    };

    const boton = document.querySelector(".confirmar-revision");
    if (boton) {
        boton.disabled = true;
        boton.textContent = "GUARDANDO...";
    }

    try {
        await fetch(URL_APPS_SCRIPT, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(datos)
        });

        alert("REVISIÓN CONFIRMADA CORRECTAMENTE\n\nSupervisor: " + supervisor);

        if (boton) boton.textContent = "✓ REVISIÓN CONFIRMADA";
        if (supervisorInput) supervisorInput.disabled = true;

    } catch (error) {
        console.error(error);
        alert("No se pudo registrar la revisión.");
        if (boton) {
            boton.disabled = false;
            boton.textContent = "✓ CONFIRMAR REVISIÓN";
        }
    }
}
