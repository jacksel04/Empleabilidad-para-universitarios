export const obtenerEstadoOferta = async (supabase, id) => {
  return await supabase.from('ofertas').select('estado').eq('id', id).single();
};

export const verificarPostulacionExistente = async (supabase, estudiante_id, oferta_id) => {
  return await supabase.from('postulaciones')
    .select('id')
    .eq('estudiante_id', estudiante_id)
    .eq('oferta_id', oferta_id)
    .single();
};

export const insertarPostulacion = async (supabase, datos) => {
  return await supabase.from('postulaciones').insert([datos]);
};

export const actualizarEstadoOferta = async (supabase, id, nuevoEstado) => {
  return await supabase.from('ofertas').update({ estado: nuevoEstado }).eq('id', id);
};