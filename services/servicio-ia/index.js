import express from 'express';
import cors from 'cors';
import 'dotenv/config';

// 👇 AQUÍ ESTÁ LA CORRECCIÓN: Apuntar a la carpeta src/
import { conectarRabbitMQ } from './src/rabbitmq.js';

// Importamos los 3 controladores 
import { 
  obtenerBrujulaMercado, 
  calcularMatchOfertas,
  calcularMatchPostulantes 
} from './src/controller.js';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// --- RUTAS DEL SERVICIO IA ---

// 1. Brújula del Mercado (Para el estudiante)
app.post('/api/ia/brujula', obtenerBrujulaMercado);

// 2. Matchmaker Semántico (Para que el estudiante busque ofertas)
app.post('/api/ia/match-ofertas', calcularMatchOfertas);

// 3. Matchmaker Semántico (Para que la empresa filtre postulantes)
app.post('/api/ia/match-postulantes', calcularMatchPostulantes);

app.listen(PORT, async () => {
  console.log(`[Servicio IA] Escuchando en el puerto ${PORT}`);
  // Iniciamos la conexión a RabbitMQ
  await conectarRabbitMQ();
});