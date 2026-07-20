import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import 'dotenv/config';

const app = express();

// Puerto dinámico para Render o 3000 local
const PORT = process.env.PORT || 3000;

app.use(cors());

const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl;
  }
};

// URLs de microservicios
// En local puedes sobrescribirlas con .env
// En producción usará Render por defecto
const USUARIOS_SERVICE_URL =
  process.env.USUARIOS_SERVICE_URL || 'https://servicio-usuarios-empleabilidad.onrender.com';

const OFERTAS_SERVICE_URL =
  process.env.OFERTAS_SERVICE_URL || 'https://servicio-ofertas-empleabilidad.onrender.com';

const POSTULACIONES_SERVICE_URL =
  process.env.POSTULACIONES_SERVICE_URL || 'https://servicio-postulaciones-empleabilidad.onrender.com';

const BI_SERVICE_URL =
  process.env.BI_SERVICE_URL || 'https://servicio-bi-empleabilidad.onrender.com';

const IA_SERVICE_URL =
  process.env.IA_SERVICE_URL || 'https://servicio-ia-empleabilidad.onrender.com';

/*
const NOTIFICACIONES_SERVICE_URL =
  process.env.NOTIFICACIONES_SERVICE_URL || 'https://servicio-notificaciones-empleabilidad.onrender.com';


// --- MICROSERVICIO DE NOTIFICACIONES ---
app.use('/api/notificaciones', proxy(NOTIFICACIONES_SERVICE_URL, proxyOptions));

*/

// --- MICROSERVICIO DE USUARIOS ---
app.use('/api/estudiantes', proxy(USUARIOS_SERVICE_URL, proxyOptions));
app.use('/api/usuarios', proxy(USUARIOS_SERVICE_URL, proxyOptions));
app.use("/api/administradores", proxy(USUARIOS_SERVICE_URL, proxyOptions));

// --- NUEVA RUTA: PERFIL DE EMPRESA ---

app.use('/api/empresas', proxy(USUARIOS_SERVICE_URL, proxyOptions));

// --- MICROSERVICIO DE OFERTAS ---
app.use('/api/ofertas', proxy(OFERTAS_SERVICE_URL, proxyOptions));

// --- MICROSERVICIO DE POSTULACIONES ---
app.use('/api/postular', proxy(POSTULACIONES_SERVICE_URL, proxyOptions));
app.use('/api/postulaciones', proxy(POSTULACIONES_SERVICE_URL, proxyOptions));

// --- MICROSERVICIO BI ---
app.use('/api/estadisticas', proxy(BI_SERVICE_URL, proxyOptions));

app.use('/api/ia', proxy(IA_SERVICE_URL, proxyOptions));

app.listen(PORT, () => {
  console.log(`[API Gateway] Escuchando en el puerto ${PORT}`);
});