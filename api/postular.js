import { createClient } from '@supabase/supabase-js';

// 1. Aquí va tu URL completa
const supabaseUrl = 'https://bbjawyjwjhzlvjtmcudp.supabase.co'; 

// 2. Aquí va tu SECRET KEY (sb_secret_...)
const supabaseKey = 'sb_secret_aEuXlbpFGJCrk0BK2QXQxQ_b5dIJ4gr'; 

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { estudiante_id, oferta_id } = req.body;

    // Iniciamos la lógica de transacción
    // 1. Insertar la postulación en la tabla intermedia
    const { data: postulacion, error: errorPost } = await supabase
      .from('postulaciones')
      .insert([{ estudiante_id, oferta_id }]);

    // Si falla el paso 1, se detiene todo
    if (errorPost) return res.status(500).json({ error: errorPost.message });

    // 2. Simular actualización de estado de la oferta (Parte de la transacción)
    const { error: errorOferta } = await supabase
      .from('ofertas')
      .update({ estado: 'En Proceso' })
      .eq('id', oferta_id);

    // Si falla el paso 2, devuelve error
    if (errorOferta) return res.status(500).json({ error: errorOferta.message });

    // Si ambos pasos son exitosos, responde con éxito
    return res.status(201).json({ mensaje: "Transacción completada: Postulación registrada y oferta actualizada" });
  }
  
  res.status(405).json({ mensaje: 'Método no permitido' });
}