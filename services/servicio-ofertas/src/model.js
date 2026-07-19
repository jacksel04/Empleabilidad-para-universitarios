export const obtenerTodasOfertas = async (supabase) => {
  return await supabase.from('ofertas').select('*');
};

export const crearOferta = async (supabase, datos) => {
  return await supabase.from('ofertas').insert([datos]);
};

export const actualizarOferta = async (supabase, id, datos) => {
  return await supabase.from('ofertas').update(datos).eq('id', id);
};

export const eliminarOferta = async (supabase, id) => {
  return await supabase.from('ofertas').delete().eq('id', id);
};

export const obtenerOfertasParaIA = async (supabase, carrera) => {
  // Filtramos solo las ofertas activas
  let query = supabase.from('ofertas').select('id, titulo_puesto, empresa_nombre, requisitos, descripcion').eq('estado', 'Activa');
  
  // Si nos envían una carrera, buscamos coincidencias
  if (carrera) {
    query = query.or(`titulo_puesto.ilike.%${carrera}%,descripcion.ilike.%${carrera}%,requisitos.ilike.%${carrera}%`);
  }
  
  return await query;
};