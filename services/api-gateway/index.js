import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';

const app = express();

// Cambiamos el puerto fijo por el dinámico de Render
const PORT = process.env.PORT || 3000;

app.use(cors());

const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl;
  }
};

app.use('/api/estudiantes', proxy('https://servicio-usuarios-empleabilidad.onrender.com', proxyOptions));
app.use('/api/usuarios', proxy('https://servicio-usuarios-empleabilidad.onrender.com', proxyOptions));

app.use('/api/ofertas', proxy('https://servicio-ofertas-empleabilidad.onrender.com', proxyOptions));

// --- MICROSERVICIO DE POSTULACIONES ---
app.use('/api/postular', proxy('https://servicio-postulaciones-empleabilidad.onrender.com', proxyOptions));
// ¡ESTA ES LA LÍNEA NUEVA QUE DEBES AGREGAR!
app.use('/api/postulaciones', proxy('https://servicio-postulaciones-empleabilidad.onrender.com', proxyOptions)); 
// --------------------------------------

app.use('/api/estadisticas', proxy('https://servicio-bi-empleabilidad.onrender.com', proxyOptions));


app.listen(PORT, () => {
  console.log(`[API Gateway] Escuchando en el puerto ${PORT}`);
});