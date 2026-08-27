// ==========================================
// CONFIGURACIÓN
// ==========================================

// URL de implementación de Google Apps Script
const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbyOHMdai5Nh2hs-yC-sRu9qjLod9uGFRyVeE_pkjhGLb_If4KXtISXGfGT82i8YvwOe/exec";

// ==========================================
// VARIABLES GLOBAL
// ==========================================

let respuestas = {};
let modoActual = "operario";

// ==========================================
// INICIO Y CARGA AUTOMÁTICA
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    cargarEquipo();
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 1000);
});

// Respaldo de ejecución inmediata
cargarEquipo();


// ==========================================
// OBTENER EQUIPO DESDE LA URL (QR)
// ==========================================

function cargarEquipo() {
    const parametros = new URLSearchParams(window.location.search);
    const equipo = parametros.get("equipo");
    const elemento = document.getElementById("nombreEquipo");

    if (!elemento) return;

    if (equipo) {
        elemento.textContent = equipo;
    } else {
        elemento.textContent = "Equipo no identificado";
    }
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

function seleccionar(boton, resultado) {
    const pregunta = boton.closest(".pregunta");
    if (!pregunta) return;

    const preguntasPagina = Array.from(document.querySelectorAll(".pregunta"));
    const numero = preguntasPagina.indexOf(pregunta) + 1;

    respuestas[numero] = resultado === "ok" ? "OK" : "NO OK";

    // Quitar selección previa en la misma pregunta
    const botones = pregunta.querySelectorAll("button");
    botones.forEach(function (btn) {
        btn.classList.remove("seleccionado");
    });

    // Marcar botón activo
    boton.classList.add("seleccionado");
}


// ==========================================
// CAMBIAR A MODO OPERARIO
// ==========================================

function mostrarOperario() {
    modoActual = "operario";

    const botones = document.querySelectorAll(".modo-btn");
    botones.forEach(function (boton) {
        boton.classList.remove("activo");
    });
    if (botones[0]) botones[0].classList.add("activo");

    const operarioForm = document.getElementById("operarioForm");
    const supervisorPanel = document.getElementById("supervisorPanel");

    if (operarioForm) operarioForm.style.display = "block";
    if (supervisorPanel) supervisorPanel.style.display = "none";
}


// ==========================================
// CAMBIAR A MODO SUPERVISOR
// ==========================================

function mostrarSupervisor() {
    modoActual = "supervisor";

    const botones = document.querySelectorAll(".modo-btn");
    botones.forEach(function (boton) {
        boton.classList.remove("activo");
    });
    if (botones[1]) botones[1].classList.add("activo");

    const operarioForm = document.getElementById("operarioForm");
    const supervisorPanel = document.getElementById("supervisorPanel");

    if (operarioForm) operarioForm.style.display = "none";
    if (supervisorPanel) {
        supervisorPanel.style.display = "block";
        cargarUltimoControl();
    }
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

    const cantidadPreguntas = document.querySelectorAll(".pregunta").length;

    for (let i = 1; i <= cantidadPreguntas; i++) {
        if (!respuestas[i]) {
            alert("Debe responder todas las preguntas.\n\nFalta responder la pregunta Nº " + i);
            return;
        }
    }

    const parametros = new URLSearchParams(window.location.search);
    const equipo = parametros.get("equipo");

    if (!equipo) {
        alert("No se pudo identificar el equipo.");
        return;
    }

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
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(datos)
        });

        alert("CONTROL REGISTRADO CORRECTAMENTE\n\nEquipo: " + equipo + "\nOperario: " + operario + "\nResultado: " + resultadoGeneral);

        // Limpiar selecciones
        respuestas = {};
        document.querySelectorAll(".opciones button").forEach(function (boton) {
            boton.classList.remove("seleccionado");
        });

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
// CARGAR ÚLTIMO CONTROL PARA SUPERVISOR
// ==========================================

async function cargarUltimoControl() {
    const parametros = new URLSearchParams(window.location.search);
    const equipo = parametros.get("equipo");

    if (!equipo) {
        alert("No se pudo identificar el equipo.");
        return;
    }

    try {
        const respuesta = await fetch(
            URL_APPS_SCRIPT + "?accion=ultimoControl&equipo=" + encodeURIComponent(equipo)
        );

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


// ==========================================
// MOSTRAR DATOS AL SUPERVISOR
// ==========================================

function mostrarControlSupervisor(datos) {
    const elEquipo = document.getElementById("supervisorEquipo");
    const elOperario = document.getElementById("supervisorOperario");
    const elFecha = document.getElementById("supervisorFecha");
    const elResultado = document.getElementById("supervisorResultado");
    const elObs = document.getElementById("revisionObservaciones");

    if (elEquipo) elEquipo.textContent = datos.equipo || "-";
    if (elOperario) elOperario.textContent = datos.operario || "-";
    if (elFecha) elFecha.textContent = datos.fechaHora || "-";
    if (elResultado) elResultado.textContent = datos.resultado || "-";

    const r = datos.respuestas || {};

    mostrarRespuesta("revCarroceria", r[1]);
    mostrarRespuesta("revEspejos", r[2]);
    mostrarRespuesta("revCubiertas", r[3]);
    mostrarRespuesta("revUnias", r[4]);
    mostrarRespuesta("revExtintor", r[5]);
    mostrarRespuesta("revAceiteMotor", r[6]);
    mostrarRespuesta("revRefrigerante", r[7]);
    mostrarRespuesta("revAsiento", r[8]);
    mostrarRespuesta("revAvance", r[9]);
    mostrarRespuesta("revFreno", r[10]);
    mostrarRespuesta("revSirena", r[11]);
    mostrarRespuesta("revLuces", r[12]);
    mostrarRespuesta("revAceiteHidraulico", r[13]);
    mostrarRespuesta("revLaser", r[14]);

    if (elObs) elObs.textContent = datos.observaciones || "Sin observaciones.";

    window.controlActualId = datos.id || "";
}


// ==========================================
// DAR ESTILO A LAS RESPUESTAS (OK / NO OK)
// ==========================================

function mostrarRespuesta(id, valor) {
    const elemento = document.getElementById(id);
    if (!elemento) return;

    elemento.textContent = valor || "-";
    elemento.style.background = "";
    elemento.style.color = "";

    if (valor === "OK") {
        elemento.style.background = "#d1e7dd";
        elemento.style.color = "#0f5132";
    }

    if (valor === "NO OK") {
        elemento.style.background = "#f8d7da";
        elemento.style.color = "#842029";
    }
}


// ==========================================
// ESTADO SI NO HAY CONTROLE
// ==========================================

function mostrarSinControl() {
    const elEquipo = document.getElementById("supervisorEquipo");
    const elOperario = document.getElementById("supervisorOperario");
    const elFecha = document.getElementById("supervisorFecha");
    const elResultado = document.getElementById("supervisorResultado");
    const elObs = document.getElementById("revisionObservaciones");

    if (elEquipo) elEquipo.textContent = new URLSearchParams(window.location.search).get("equipo") || "-";
    if (elOperario) elOperario.textContent = "Sin controles";
    if (elFecha) elFecha.textContent = "-";
    if (elResultado) elResultado.textContent = "PENDIENTE";
    if (elObs) elObs.textContent = "No existe un control realizado para este equipo.";
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
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
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