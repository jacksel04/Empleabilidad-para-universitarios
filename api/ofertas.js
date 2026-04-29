import { createClient } from '@supabase/supabase-js';

// 1. Aquí va tu URL completa
const supabaseUrl = 'https://bbjawyjwjhzlvjtmcudp.supabase.co'; 

// 2. Aquí va tu SECRET KEY (sb_secret_...)
const supabaseKey = 'sb_secret_aEuXlbpFGJCrk0BK2QXQxQ_b5dIJ4gr'; 

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // READ: Obtener todas las ofertas (Método GET)
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('ofertas').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // CREATE: Crear una nueva oferta (Método POST)
  if (req.method === 'POST') {
    const { titulo_puesto, empresa_nombre, descripcion, modalidad, estado } = req.body;
    
    const { data, error } = await supabase
      .from('ofertas')
      .insert([{ titulo_puesto, empresa_nombre, descripcion, modalidad, estado }]);
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ mensaje: "Oferta creada con éxito", data });
  }

  // UPDATE: Actualizar el estado o detalles de una oferta (Método PUT)
  if (req.method === 'PUT') {
    // Requerimos el 'id' para saber exactamente qué oferta actualizar
    const { id, titulo_puesto, empresa_nombre, descripcion, modalidad, estado } = req.body;
    
    const { data, error } = await supabase
      .from('ofertas')
      .update({ titulo_puesto, empresa_nombre, descripcion, modalidad, estado })
      .eq('id', id); // El .eq() asegura que solo se actualice la fila con ese ID
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ mensaje: "Oferta actualizada correctamente", data });
  }

  // DELETE: Retirar la publicación de la oferta (Método DELETE)
  if (req.method === 'DELETE') {
    // Solo necesitamos el 'id' para borrarla
    const { id } = req.body;
    
    const { error } = await supabase
      .from('ofertas')
      .delete()
      .eq('id', id); // Busca por ID y la elimina
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ mensaje: "Oferta eliminada tras cierre del acuerdo" });
  }

  // Si envían otro método que no existe, respondemos con error
  res.status(405).json({ mensaje: 'Método no permitido' });
}