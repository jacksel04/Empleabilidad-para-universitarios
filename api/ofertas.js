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

  // Si envían otro método (PUT o DELETE), respondemos que aún no está soportado
  res.status(405).json({ mensaje: 'Método no permitido' });
}