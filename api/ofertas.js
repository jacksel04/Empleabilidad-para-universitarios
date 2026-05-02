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

  // CREATE: Crear una nueva oferta con Reglas de Negocio (Método POST)
  if (req.method === 'POST') {
    const { titulo_puesto, empresa_nombre, descripcion, modalidad, salario, requisitos, estado } = req.body;
    
    // --- REGLAS DE NEGOCIO ---
    
    // 1. Longitud mínima para evitar ofertas falsas
    if (!titulo_puesto || titulo_puesto.length < 5) {
      return res.status(400).json({ error: "Regla fallida: El título del puesto debe ser descriptivo (mínimo 5 caracteres)." });
    }

    // 2. Control de dominio (Lista blanca de modalidades)
    const modalidadesValidas = ['Presencial', 'Remoto', 'Híbrido'];
    if (!modalidadesValidas.includes(modalidad)) {
      return res.status(400).json({ 
        error: `Regla fallida: La modalidad '${modalidad}' no es válida. Use: Presencial, Remoto o Híbrido.` 
      });
    }

    // 3. Transparencia salarial obligatoria
    if (!salario) {
      return res.status(400).json({ error: "Regla fallida: Debe especificar un rango salarial o indicar 'A convenir'." });
    }

    // Si todo está correcto, insertamos
    const { data, error } = await supabase
      .from('ofertas')
      .insert([{ titulo_puesto, empresa_nombre, descripcion, modalidad, salario, requisitos, estado: estado || 'Activa' }]);
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ mensaje: "Oferta creada con éxito bajo los estándares de la plataforma", data });
  }

  // UPDATE: Actualizar el estado o detalles de una oferta (Método PUT)
  if (req.method === 'PUT') {
    const { id, titulo_puesto, empresa_nombre, descripcion, modalidad, salario, requisitos, estado } = req.body;
    
    const { data, error } = await supabase
      .from('ofertas')
      .update({ titulo_puesto, empresa_nombre, descripcion, modalidad, salario, requisitos, estado })
      .eq('id', id); 
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ mensaje: "Oferta actualizada correctamente", data });
  }

  // DELETE: Retirar la publicación de la oferta (Método DELETE)
  if (req.method === 'DELETE') {
    const { id } = req.body;
    
    const { error } = await supabase
      .from('ofertas')
      .delete()
      .eq('id', id); 
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ mensaje: "Oferta eliminada tras cierre del acuerdo" });
  }

  // Si envían otro método que no existe, respondemos con error
  res.status(405).json({ mensaje: 'Método no permitido' });
}