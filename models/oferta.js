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