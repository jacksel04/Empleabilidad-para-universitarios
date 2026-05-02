import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bbjawyjwjhzlvjtmcudp.supabase.co'; 

const supabaseKey = 'sb_secret_aEuXlbpFGJCrk0BK2QXQxQ_b5dIJ4gr';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
        // 1. Agregación: Contar TODAS las postulaciones
        const { count: totalPostulaciones, error: errPostulaciones } = await supabase
            .from('postulaciones')
            .select('*', { count: 'exact', head: true });

        // 2. Agregación: Contar TODOS los estudiantes registrados
        const { count: totalEstudiantes, error: errEstudiantes } = await supabase
            .from('estudiantes')
            .select('*', { count: 'exact', head: true });

        // 3. Agregación Filtrada: Contar SOLO las ofertas que siguen "Activas"
        const { count: ofertasActivas, error: errOfertas } = await supabase
            .from('ofertas')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'Activa');

        // Si alguna de las 3 consultas falla, lanzamos error
        if (errPostulaciones || errEstudiantes || errOfertas) {
            throw new Error("Error al calcular las funciones de agregación en la base de datos.");
        }

        // Devolvemos el reporte completo al Panel de Administración
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

  // Si mandan POST o PUT aquí, lo bloqueamos
  return res.status(405).json({ mensaje: 'Método no permitido para este endpoint de lectura' });
}