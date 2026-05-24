const datosUsuario = document.getElementById("datosUsuario");
const ofertasContenedor = document.getElementById("ofertas");
const mensaje = document.getElementById("mensaje");
const cerrarSesion = document.getElementById("cerrarSesion");
const contadorOfertas = document.getElementById("contadorOfertas");
const totalOfertas = document.getElementById("totalOfertas");
const ofertasActivas = document.getElementById("ofertasActivas");
const totalPostulaciones = document.getElementById("totalPostulaciones");
const estudiante = JSON.parse(localStorage.getItem("estudiante"));
const API_BASE_URL = "http://localhost:3000";

if (!estudiante) {
  window.location.href = "index.html";
} else {
  datosUsuario.textContent = `${estudiante.nombre} - ${estudiante.correo}`;
  cargarOfertas();
  cargarEstadisticas();
}

async function cargarOfertas() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ofertas`);

    if (!response.ok) {
      throw new Error("No se pudieron cargar las ofertas.");
    }

    const ofertas = await response.json();
    const activas = ofertas.filter((oferta) => oferta.estado === "Activo");

    contadorOfertas.textContent = `${ofertas.length} ofertas registradas`;
    totalOfertas.textContent = ofertas.length;
    ofertasActivas.textContent = activas.length;

    ofertasContenedor.innerHTML = "";

    if (ofertas.length === 0) {
      ofertasContenedor.innerHTML = `
        <div class="empty-state">
          <p>No hay ofertas registradas por el momento.</p>
        </div>
      `;
      return;
    }

    ofertas.forEach((oferta) => {
      const card = document.createElement("div");
      card.className = "offer-card";

      const estaActiva = oferta.estado === "Activo";

      card.innerHTML = `
        <div class="offer-top">
          <h3>${oferta.titulo_puesto}</h3>
          <span class="${estaActiva ? "badge-active" : "badge-inactive"}">
            ${oferta.estado}
          </span>
        </div>

        <div class="offer-body">
          <p><strong>Empresa:</strong> ${oferta.empresa_nombre}</p>
          <p><strong>Descripción:</strong> ${oferta.descripcion}</p>
          <p><strong>Modalidad:</strong> ${oferta.modalidad}</p>
          <p><strong>Salario:</strong> ${oferta.salario || "No especificado"}</p>
        </div>

        <button 
          class="offer-button"
          type="button"
          ${!estaActiva ? "disabled" : ""}
          onclick="postular(${oferta.id})"
        >
          ${estaActiva ? "Postular" : "No disponible"}
        </button>
      `;

      ofertasContenedor.appendChild(card);
    });

  } catch (error) {
    mostrarMensaje("Error al cargar ofertas desde la API.", "error");
    console.error(error);
  }
}

async function cargarEstadisticas() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/estadisticas`);

    if (!response.ok) {
      totalPostulaciones.textContent = "-";
      return;
    }

    const data = await response.json();

    totalPostulaciones.textContent =
      data.reporte?.transacciones_de_postulacion_realizadas ?? "-";

  } catch (error) {
    totalPostulaciones.textContent = "-";
    console.error(error);
  }
}

async function postular(ofertaId) {
  try {
    limpiarMensaje();

    const response = await fetch(`${API_BASE_URL}/api/postular`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        estudiante_id: estudiante.id,
        oferta_id: ofertaId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      mostrarMensaje(data.error || "No se pudo registrar la postulación.", "error");
      return;
    }

    mostrarMensaje(data.mensaje || "Postulación registrada correctamente.", "success");

    await cargarOfertas();
    await cargarEstadisticas();

  } catch (error) {
    mostrarMensaje("Error al conectar con la API.", "error");
    console.error(error);
  }
}

cerrarSesion.addEventListener("click", () => {
  localStorage.removeItem("estudiante");
  window.location.href = "index.html";
});

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = `dashboard-message ${tipo}`;
}

function limpiarMensaje() {
  mensaje.textContent = "";
  mensaje.className = "dashboard-message";
}