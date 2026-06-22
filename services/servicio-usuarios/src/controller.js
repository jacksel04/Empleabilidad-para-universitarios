import express from 'express';
import 'dotenv/config';
import multer from 'multer'; 
// 👇 ASEGÚRATE DE QUE 'subirCVSupabase' ESTÉ EN ESTA LÍNEA 👇
import { 
  registrarEstudiante, 
  obtenerTodosEstudiantes, 
  actualizarEstudiante, 
  eliminarEstudiante, 
  subirCVSupabase,
  obtenerEmpresas,
  crearEmpresa,
  actualizarEmpresa
} from './model.js';
import { supabase } from './supabase.js';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;
// NUEVO: Configuración de multer para guardar el archivo en la memoria temporalmente (límite 5MB)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

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

// ACTUALIZADO: Endpoint para actualizar datos y recibir el archivo 'cv'
app.put('/api/estudiantes', upload.single('cv'), async (req, res) => {
  try {
    // Cuando usamos FormData, los datos de texto vienen en req.body
    const { id, telefono, ciclo } = req.body; 
    let datosActualizar = { telefono, ciclo };

    // Si el frontend envió un archivo PDF, lo subimos a Supabase Storage
    if (req.file) {
      const fileName = `estudiante_${id}_cv.pdf`;
      const cvUrl = await subirCVSupabase(supabase, req.file.buffer, fileName);
      // Agregamos la URL a los datos que vamos a guardar en la base de datos
      datosActualizar.cv_url = cvUrl; 
    }

    const { data, error } = await actualizarEstudiante(supabase, id, datosActualizar);
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ mensaje: "Perfil y CV actualizados correctamente", data });

  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor: " + error.message });
  }
});

app.delete('/api/estudiantes', async (req, res) => {
  const { id } = req.body;
  const { error } = await eliminarEstudiante(supabase, id);
    
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ mensaje: "Cuenta de estudiante eliminada del sistema" });
});

// ===============================
// RUTAS DE EMPRESAS
// ===============================

// Listar empresas
app.get('/api/empresas', async (req, res) => {
  try {
    const { data, error } = await obtenerEmpresas(supabase);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor: " + error.message });
  }
});

// Registrar perfil de empresa
app.post('/api/empresas', async (req, res) => {
  try {
    const {
      nombre_empresa,
      ruc,
      sector,
      correo_contacto,
      telefono,
      descripcion,
      sitio_web,
      direccion
    } = req.body;

    if (!nombre_empresa || nombre_empresa.length < 3) {
      return res.status(400).json({
        error: "El nombre de la empresa es obligatorio y debe tener al menos 3 caracteres."
      });
    }

    if (ruc && !/^[0-9]{11}$/.test(ruc)) {
      return res.status(400).json({
        error: "El RUC debe contener exactamente 11 dígitos."
      });
    }

    if (telefono && !/^[0-9]{9}$/.test(telefono)) {
      return res.status(400).json({
        error: "El teléfono debe contener exactamente 9 dígitos."
      });
    }

    const nuevaEmpresa = {
      nombre_empresa,
      ruc,
      sector,
      correo_contacto,
      telefono,
      descripcion,
      sitio_web,
      direccion,
      estado_verificacion: 'Pendiente'
    };

    const { data, error } = await crearEmpresa(supabase, nuevaEmpresa);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      mensaje: "Perfil de empresa registrado correctamente",
      empresa: data[0]
    });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor: " + error.message });
  }
});

// Actualizar perfil de empresa
app.put('/api/empresas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre_empresa,
      ruc,
      sector,
      correo_contacto,
      telefono,
      descripcion,
      sitio_web,
      direccion,
      estado_verificacion
    } = req.body;

    const datosActualizar = {
      nombre_empresa,
      ruc,
      sector,
      correo_contacto,
      telefono,
      descripcion,
      sitio_web,
      direccion,
      estado_verificacion
    };

    const { data, error } = await actualizarEmpresa(supabase, id, datosActualizar);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Empresa no encontrada." });
    }

    return res.status(200).json({
      mensaje: "Perfil de empresa actualizado correctamente",
      empresa: data[0]
    });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor: " + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Servicio Usuarios] Escuchando en el puerto ${PORT}`);
});