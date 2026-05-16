import { createClient } from '@supabase/supabase-js';
import { obtenerEstadoOferta, verificarPostulacionExistente, insertarPostulacion, actualizarEstadoOferta } from '../models/postulacion.js';
import { supabase } from './supabaseClient.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      let body = req.body;

      if (typeof body === "string") {
        body = JSON.parse(body);
      }

      const { estudiante_id, oferta_id } = body || {};

    if (!estudiante_id || !oferta_id) {
      return res.status(400).json({ error: "Faltan identificadores: Se requiere estudiante_id y oferta_id." });
    }

    // Regla 1
    const { data: oferta, error: errorOferta } = await obtenerEstadoOferta(supabase, oferta_id); 
    if (errorOferta || !oferta) {
      return res.status(404).json({ error: "La oferta laboral no existe en la base de datos." });
    }
    if (oferta.estado !== 'Activo') { // Respetando tu lógica original
      return res.status(400).json({ error: "Regla fallida: No se pueden recibir postulaciones. La oferta se encuentra en estado: " + oferta.estado });
    }

    // Regla 2
    const { data: postExiste } = await verificarPostulacionExistente(supabase, estudiante_id, oferta_id);
    if (postExiste) {
      return res.status(400).json({ error: "Regla fallida: El estudiante ya se encuentra postulado a esta oferta." });
    }

    // Paso A
    const { error: errorPost } = await insertarPostulacion(supabase, { 
        estudiante_id, oferta_id, estado_evaluacion: 'Pendiente' 
    });
    if (errorPost) return res.status(500).json({ error: "Error en transacción (Paso A): " + errorPost.message });

    // Paso B
          const { error: errorUpdate } = await actualizarEstadoOferta(supabase, oferta_id, 'En proceso de selección');
          if (errorUpdate) {
            return res.status(500).json({ error: "Error en transacción (Paso B): " + errorUpdate.message });
          }

          return res.status(201).json({ 
            mensaje: "Transacción completada: Postulación registrada y oferta actualizada a 'En proceso de selección'" 
          });

        } catch (error) {
          return res.status(500).json({ error: "Error interno: " + error.message });
        }
      }

      return res.status(405).json({ mensaje: 'Método no permitido' });
}