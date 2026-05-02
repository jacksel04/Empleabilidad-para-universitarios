import { createClient } from '@supabase/supabase-js';

// 1. Aquí va tu URL completa
const supabaseUrl = 'https://bbjawyjwjhzlvjtmcudp.supabase.co'; 

// 2. Aquí va tu SECRET KEY (sb_secret_...)
const supabaseKey = 'sb_secret_aEuXlbpFGJCrk0BK2QXQxQ_b5dIJ4gr'; 

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { estudiante_id, oferta_id } = req.body;

    // Validación de datos básicos
    if (!estudiante_id || !oferta_id) {
      return res.status(400).json({ error: "Faltan identificadores: Se requiere estudiante_id y oferta_id." });
    }

    // --- REGLAS DE NEGOCIO PREVIAS A LA TRANSACCIÓN ---

    // Regla 1: Validar que la oferta exista y esté 'Activa'
    const { data: oferta, error: errorOferta } = await supabase
      .from('ofertas')
      .select('estado')
      .eq('id', oferta_id)
      .single(); 

    if (errorOferta || !oferta) {
      return res.status(404).json({ error: "La oferta laboral no existe en la base de datos." });
    }
    
    if (oferta.estado !== 'Activa') {
      return res.status(400).json({ 
        error: "Regla fallida: No se pueden recibir postulaciones. La oferta se encuentra en estado: " + oferta.estado 
      });
    }

    // Regla 2: Evitar postulaciones duplicadas
    const { data: postExiste } = await supabase
      .from('postulaciones')
      .select('id')
      .eq('estudiante_id', estudiante_id)
      .eq('oferta_id', oferta_id)
      .single();
      
    if (postExiste) {
      return res.status(400).json({ error: "Regla fallida: El estudiante ya se encuentra postulado a esta oferta." });
    }

    // --- INICIO DE LA TRANSACCIÓN ---
    
    // Paso A: Insertar la postulación en la tabla intermedia
    const { error: errorPost } = await supabase
      .from('postulaciones')
      .insert([{ estudiante_id, oferta_id, estado_evaluacion: 'Pendiente' }]);

    // Si falla el paso A, se detiene todo
    if (errorPost) return res.status(500).json({ error: "Error en transacción (Paso A): " + errorPost.message });

    // Paso B: Simular actualización de estado de la oferta (Parte de la transacción)
    const { error: errorUpdate } = await supabase
      .from('ofertas')
      .update({ estado: 'En proceso de selección' })
      .eq('id', oferta_id);

    // Si falla el paso B, devuelve error
    if (errorUpdate) return res.status(500).json({ error: "Error en transacción (Paso B): " + errorUpdate.message });

    // Si ambos pasos son exitosos, responde con éxito
    return res.status(201).json({ mensaje: "Transacción completada: Postulación registrada y oferta actualizada a 'En proceso de selección'" });
  }
  
  res.status(405).json({ mensaje: 'Método no permitido' });
}