import { createClient } from '@supabase/supabase-js';

import { registrarEstudiante, obtenerTodosEstudiantes, actualizarEstudiante, eliminarEstudiante } from '../models/estudiante';

const supabaseUrl = 'https://bbjawyjwjhzlvjtmcudp.supabase.co'; 

const supabaseKey = 'sb_secret_aEuXlbpFGJCrk0BK2QXQxQ_b5dIJ4gr';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { nombre, correo, telefono, carrera, ciclo } = req.body;

    if (!correo || !correo.endsWith('@unmsm.edu.pe')) {
      return res.status(400).json({ error: "Verificación fallida: Solo se permite el registro con correo institucional (@unmsm.edu.pe)." });
    }

    const telefonoRegex = /^[0-9]{9}$/;
    if (!telefono || !telefonoRegex.test(telefono)) {
      return res.status(400).json({ error: "Formato inválido: El número de teléfono debe contener exactamente 9 dígitos." });
    }

    if (!ciclo || ciclo < 1 || ciclo > 10) {
      return res.status(400).json({ error: "Dato inválido: El ciclo universitario debe estar entre 1 y 10." });
    }

    // Llamada al Modelo
    const { data, error } = await registrarEstudiante(supabase, { 
      nombre, correo, telefono, carrera, ciclo, perfil_verificado: true 
    });
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ mensaje: "Estudiante de la UNMSM registrado y verificado exitosamente", data });
  }

  if (req.method === 'GET') {
    const { data, error } = await obtenerTodosEstudiantes(supabase);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const { id, telefono, ciclo } = req.body; 
    const { data, error } = await actualizarEstudiante(supabase, id, { telefono, ciclo });
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ mensaje: "Perfil de estudiante actualizado", data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    const { error } = await eliminarEstudiante(supabase, id);
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ mensaje: "Cuenta de estudiante eliminada del sistema" });
  }

  res.status(405).json({ mensaje: 'Método HTTP no permitido' });
}