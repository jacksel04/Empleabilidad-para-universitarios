import express from 'express';
import 'dotenv/config';
import { registrarEstudiante, obtenerTodosEstudiantes, actualizarEstudiante, eliminarEstudiante } from './model.js';
import { supabase } from './supabase.js';

const app = express();
app.use(express.json());
const PORT = 3001;

app.post('/api/estudiantes', async (req, res) => {
  const { nombre, correo, telefono, carrera, ciclo, password } = req.body;

  if (!correo || !correo.endsWith('@unmsm.edu.pe')) {
    return res.status(400).json({ error: "Verificación fallida: Solo se permite el registro con correo institucional (@unmsm.edu.pe)." });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Dato inválido: La contraseña es obligatoria y debe tener al menos 6 caracteres." });
  }

  const telefonoRegex = /^[0-9]{9}$/;
  if (!telefono || !telefonoRegex.test(telefono)) {
    return res.status(400).json({ error: "Formato inválido: El número de teléfono debe contener exactamente 9 dígitos." });
  }

  if (!ciclo || ciclo < 1 || ciclo > 10) {
    return res.status(400).json({ error: "Dato inválido: El ciclo universitario debe estar entre 1 y 10." });
  }

  const { data, error } = await registrarEstudiante(supabase, { 
    nombre, correo, telefono, carrera, ciclo, password, perfil_verificado: true 
  });
    
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ mensaje: "Estudiante de la UNMSM registrado y verificado exitosamente", data });
});

app.get('/api/estudiantes', async (req, res) => {
  const { data, error } = await obtenerTodosEstudiantes(supabase);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
});

app.put('/api/estudiantes', async (req, res) => {
  const { id, telefono, ciclo } = req.body; 
  const { data, error } = await actualizarEstudiante(supabase, id, { telefono, ciclo });
    
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ mensaje: "Perfil de estudiante actualizado", data });
});

app.delete('/api/estudiantes', async (req, res) => {
  const { id } = req.body;
  const { error } = await eliminarEstudiante(supabase, id);
    
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ mensaje: "Cuenta de estudiante eliminada del sistema" });
});

app.listen(PORT, () => {
  console.log(`[Servicio Usuarios] Escuchando en el puerto ${PORT}`);
});