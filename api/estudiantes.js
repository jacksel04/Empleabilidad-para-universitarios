import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bbjawyjwjhzlvjtmcudp.supabase.co'; 

const supabaseKey = 'sb_secret_aEuXlbpFGJCrk0BK2QXQxQ_b5dIJ4gr';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  
  // ==========================================
  // CREATE: Registrar estudiante con Reglas de Negocio
  // ==========================================
  if (req.method === 'POST') {
    const { nombre, correo, telefono, carrera, ciclo } = req.body;

    // --- REGLAS DE NEGOCIO (Módulo de Verificación) ---

    // 1. Validar correo institucional UNMSM
    if (!correo || !correo.endsWith('@unmsm.edu.pe')) {
      return res.status(400).json({ 
        error: "Verificación fallida: Solo se permite el registro con correo institucional (@unmsm.edu.pe)." 
      });
    }

    // 2. Validar formato de teléfono de Perú (9 dígitos numéricos)
    const telefonoRegex = /^[0-9]{9}$/;
    if (!telefono || !telefonoRegex.test(telefono)) {
      return res.status(400).json({ 
        error: "Formato inválido: El número de teléfono debe contener exactamente 9 dígitos." 
      });
    }

    // 3. Validar ciclo académico
    if (!ciclo || ciclo < 1 || ciclo > 10) {
      return res.status(400).json({ 
        error: "Dato inválido: El ciclo universitario debe estar entre 1 y 10." 
      });
    }

    // Si pasa todas las reglas, se inserta en la base de datos
    const { data, error } = await supabase
      .from('estudiantes')
      .insert([{ 
          nombre, 
          correo, 
          telefono, 
          carrera, 
          ciclo, 
          perfil_verificado: true // Se autoverifica al cumplir las reglas
      }]);
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ mensaje: "Estudiante de la UNMSM registrado y verificado exitosamente", data });
  }

  // ==========================================
  // READ: Obtener lista de estudiantes
  // ==========================================
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('estudiantes').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // ==========================================
  // UPDATE: Actualizar datos del estudiante
  // ==========================================
  if (req.method === 'PUT') {
    const { id, telefono, ciclo } = req.body; // Generalmente solo actualizan esto
    
    const { data, error } = await supabase
      .from('estudiantes')
      .update({ telefono, ciclo })
      .eq('id', id);
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ mensaje: "Perfil de estudiante actualizado", data });
  }

  // ==========================================
  // DELETE: Dar de baja al estudiante
  // ==========================================
  if (req.method === 'DELETE') {
    const { id } = req.body;
    
    const { error } = await supabase
      .from('estudiantes')
      .delete()
      .eq('id', id);
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ mensaje: "Cuenta de estudiante eliminada del sistema" });
  }

  // Respuesta por defecto si usan otro método
  res.status(405).json({ mensaje: 'Método HTTP no permitido' });
}