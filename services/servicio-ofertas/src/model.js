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
  // 1. Corregimos 'Activa' a 'Activo' (como está en tu BD)
  // 2. Agregamos la columna 'carrera' al select por si acaso
  let query = supabase
    .from('ofertas')
    .select('id, titulo_puesto, empresa_nombre, requisitos, descripcion, carrera')
    .eq('estado', 'Activo'); 
  
  // Si nos envían una carrera, filtramos directamente por la columna 'carrera'
  if (carrera) {
    query = query.eq('carrera', carrera);
  }
  
  return await query;
};