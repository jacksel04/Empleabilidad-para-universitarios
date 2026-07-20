import express from 'express';
import 'dotenv/config';
import { obtenerTodasOfertas, crearOferta, actualizarOferta, eliminarOferta, obtenerOfertasParaIA } from './model.js';
import { supabase } from './supabase.js';
import { conectarRabbitMQ, publicarEvento } from './rabbitmq.js';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3002;

app.get('/api/ofertas', async (req, res) => {
  const { data, error } = await obtenerTodasOfertas(supabase);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
});

// Ruta que alimenta la Brújula de Mercado
app.get('/api/ofertas/requisitos', async (req, res) => {
  const { carrera } = req.query;
  const { data, error } = await obtenerOfertasParaIA(supabase, carrera);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data || []);
});

// Ruta que alimenta el Matchmaker
app.get('/api/ofertas/match', async (req, res) => {
  const { carrera } = req.query;
  const { data, error } = await obtenerOfertasParaIA(supabase, carrera);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data || []);
});

app.post('/api/ofertas', async (req, res) => {
  const { titulo_puesto, empresa_nombre, descripcion, modalidad, salario, requisitos, estado } = req.body;
  
  if (!titulo_puesto || titulo_puesto.length < 5) {
    return res.status(400).json({ error: "Regla fallida: El título del puesto debe ser descriptivo (mínimo 5 caracteres)." });
  }

  const modalidadesValidas = ['Presencial', 'Remoto', 'Híbrido'];
  if (!modalidadesValidas.includes(modalidad)) {
    return res.status(400).json({ error: `Regla fallida: La modalidad '${modalidad}' no es válida. Use: Presencial, Remoto o Híbrido.` });
  }

  if (!salario) {
    return res.status(400).json({ error: "Regla fallida: Debe especificar un rango salarial o indicar 'A convenir'." });
  }

  const { data, error } = await crearOferta(supabase, { 
    titulo_puesto, empresa_nombre, descripcion, modalidad, salario, requisitos, estado: estado || 'Activa' 
  });
    
  if (error) return res.status(500).json({ error: error.message });
  publicarEvento('oferta.creada', {
    oferta_id: data[0]?.id,
    titulo_puesto,
    empresa_nombre,
    modalidad,
    timestamp: new Date().toISOString()
  });
  
  return res.status(201).json({ mensaje: "Oferta creada con éxito bajo los estándares de la plataforma", data });
});

  
app.put('/api/ofertas', async (req, res) => {
  const { id, titulo_puesto, empresa_nombre, descripcion, modalidad, salario, requisitos, estado } = req.body;
  const { data, error } = await actualizarOferta(supabase, id, { 
    titulo_puesto, empresa_nombre, descripcion, modalidad, salario, requisitos, estado 
  });
    
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ mensaje: "Oferta actualizada correctamente", data });
});

app.delete('/api/ofertas', async (req, res) => {
  const { id } = req.body;
  const { error } = await eliminarOferta(supabase, id);
    
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ mensaje: "Oferta eliminada tras cierre del acuerdo" });
});

app.delete('/api/ofertas', async (req, res) => {
  const { id } = req.body;
  const { error } = await eliminarOferta(supabase, id);
    
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ mensaje: "Oferta eliminada tras cierre del acuerdo" });
});
await conectarRabbitMQ();



app.listen(PORT, () => {
  console.log(`[Servicio Ofertas] Escuchando en el puerto ${PORT}`);
});