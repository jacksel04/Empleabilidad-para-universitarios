import express from 'express';
import 'dotenv/config';
import { contarPostulaciones, contarEstudiantes, contarOfertasActivas } from './model.js';
import { supabase } from './supabase.js';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3004;

app.get('/api/estadisticas', async (req, res) => {
  try {
    const { count: totalPostulaciones, error: errPostulaciones } = await contarPostulaciones(supabase);
    const { count: totalEstudiantes, error: errEstudiantes } = await contarEstudiantes(supabase);
    const { count: ofertasActivas, error: errOfertas } = await contarOfertasActivas(supabase);

    if (errPostulaciones || errEstudiantes || errOfertas) {
      throw new Error("Error al calcular las funciones de agregación en la base de datos.");
    }

    return res.status(200).json({
      mensaje: "Métricas operativas generadas con éxito",
      reporte: {
        total_alumnos_registrados: totalEstudiantes,
        ofertas_laborales_disponibles: ofertasActivas,
        transacciones_de_postulacion_realizadas: totalPostulaciones
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Servicio BI] Escuchando en el puerto ${PORT}`);
});