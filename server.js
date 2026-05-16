import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import estudiantesHandler from './api/estudiantes.js';
import ofertasHandler from './api/ofertas.js';
import postularHandler from './api/postular.js';
import estadisticasHandler from './api/estadisticas.js';

dotenv.config();

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

app.all('/api/estudiantes', estudiantesHandler);
app.all('/api/ofertas', ofertasHandler);
app.all('/api/postular', postularHandler);
app.all('/api/estadisticas', estadisticasHandler);

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});