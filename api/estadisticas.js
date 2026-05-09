
import { createClient } from '@supabase/supabase-js';
import { contarPostulaciones, contarEstudiantes, contarOfertasActivas } from '../models/estadistica';

import { supabase } from './supabaseClient.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
        // Llamamos al Modelo
        const { count: totalPostulaciones, error: errPostulaciones } = await contarPostulaciones(supabase);
        const { count: totalEstudiantes, error: errEstudiantes } = await contarEstudiantes(supabase);
        const { count: ofertasActivas, error: errOfertas } = await contarOfertasActivas(supabase);

        if (errPostulaciones || errEstudiantes || errOfertas) {
            throw new Error("Error al calcular las funciones de agregación en la base de datos.");
        }

        // Vista: JSON Response
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
  }
  return res.status(405).json({ mensaje: 'Método no permitido para este endpoint de lectura' });
}