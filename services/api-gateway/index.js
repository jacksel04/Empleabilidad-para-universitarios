import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';

const app = express();
const PORT = 3000;
// Configuración para que el Gateway no recorte la ruta
app.use(cors());
const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl;
  }
};
// El Gateway escucha la ruta 
app.use('/api/estudiantes', proxy('http://localhost:3001', proxyOptions));
app.use('/api/usuarios', proxy('http://localhost:3001', proxyOptions));
app.use('/api/ofertas', proxy('http://localhost:3002', proxyOptions));
app.use('/api/postular', proxy('http://localhost:3003', proxyOptions));
app.use('/api/estadisticas', proxy('http://localhost:3004', proxyOptions));

app.listen(PORT, () => {
  console.log(`[API Gateway] Escuchando en http://localhost:${PORT}`);
});