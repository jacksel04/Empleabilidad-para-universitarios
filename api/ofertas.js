import { createClient } from '@supabase/supabase-js';
import { obtenerTodasOfertas, crearOferta, actualizarOferta, eliminarOferta } from '../models/oferta';

import { supabase } from './supabaseClient.js';


export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await obtenerTodasOfertas(supabase);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
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
    return res.status(201).json({ mensaje: "Oferta creada con éxito bajo los estándares de la plataforma", data });
  }

  if (req.method === 'PUT') {
    const { id, titulo_puesto, empresa_nombre, descripcion, modalidad, salario, requisitos, estado } = req.body;
    const { data, error } = await actualizarOferta(supabase, id, { 
        titulo_puesto, empresa_nombre, descripcion, modalidad, salario, requisitos, estado 
    });
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ mensaje: "Oferta actualizada correctamente", data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    const { error } = await eliminarOferta(supabase, id);
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ mensaje: "Oferta eliminada tras cierre del acuerdo" });
  }

  res.status(405).json({ mensaje: 'Método no permitido' });
}