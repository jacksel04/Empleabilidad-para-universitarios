import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import "dotenv/config";

const app = express();

// Puerto dinámico para Render o puerto 3000 en local.
const PORT = process.env.PORT || 3000;

app.use(cors());

// Conserva la ruta original recibida por el Gateway.
const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl;
  }
};

// ===============================
// URLS DE LOS MICROSERVICIOS
// ===============================

// En desarrollo local se sobrescriben mediante el archivo .env.
// En producción se utilizan las direcciones de Render.
const USUARIOS_SERVICE_URL =
  process.env.USUARIOS_SERVICE_URL ||
  "https://servicio-usuarios-empleabilidad.onrender.com";

const OFERTAS_SERVICE_URL =
  process.env.OFERTAS_SERVICE_URL ||
  "https://servicio-ofertas-empleabilidad.onrender.com";

const POSTULACIONES_SERVICE_URL =
  process.env.POSTULACIONES_SERVICE_URL ||
  "https://servicio-postulaciones-empleabilidad.onrender.com";

const BI_SERVICE_URL =
  process.env.BI_SERVICE_URL ||
  "https://servicio-bi-empleabilidad.onrender.com";

// ===============================
// MICROSERVICIO DE USUARIOS
// ===============================

app.use(
  "/api/estudiantes",
  proxy(USUARIOS_SERVICE_URL, proxyOptions)
);

app.use(
  "/api/usuarios",
  proxy(USUARIOS_SERVICE_URL, proxyOptions)
);

app.use(
  "/api/empresas",
  proxy(USUARIOS_SERVICE_URL, proxyOptions)
);

app.use(
  "/api/administradores",
  proxy(USUARIOS_SERVICE_URL, proxyOptions)
);

// ===============================
// MICROSERVICIO DE OFERTAS
// ===============================

app.use(
  "/api/ofertas",
  proxy(OFERTAS_SERVICE_URL, proxyOptions)
);

// ===============================
// MICROSERVICIO DE POSTULACIONES
// ===============================

app.use(
  "/api/postular",
  proxy(POSTULACIONES_SERVICE_URL, proxyOptions)
);

app.use(
  "/api/postulaciones",
  proxy(POSTULACIONES_SERVICE_URL, proxyOptions)
);

// ===============================
// MICROSERVICIO BI
// ===============================

app.use(
  "/api/estadisticas",
  proxy(BI_SERVICE_URL, proxyOptions)
);

app.listen(PORT, () => {
  console.log(
    `[API Gateway] Escuchando en el puerto ${PORT}`
  );
});