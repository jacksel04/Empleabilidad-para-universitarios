import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bbjawyjwjhzlvjtmcudp.supabase.co'; 

const supabaseKey = 'sb_secret_aEuXlbpFGJCrk0BK2QXQxQ_b5dIJ4gr';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // GET: Obtener estadísticas de la plataforma (Función de Agregación: COUNT)
  if (req.method === 'GET') {
    try {
        // Usamos la función de agregación COUNT en la tabla postulaciones
        const { count, error } = await supabase
            .from('postulaciones')
            .select('*', { count: 'exact', head: true });

        if (error) {
            throw error;
        }

        // Devolvemos el resultado matemático
        return res.status(200).json({
            mensaje: "Estadísticas calculadas con éxito",
            total_postulaciones_realizadas: count
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
  }

  // Si envían POST, PUT o DELETE a esta ruta, respondemos con error
  return res.status(405).json({ mensaje: 'Método no permitido para estadísticas' });
}