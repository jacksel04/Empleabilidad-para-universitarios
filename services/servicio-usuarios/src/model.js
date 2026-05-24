export const registrarEstudiante = async (supabase, datos) => {
  return await supabase.from('estudiantes').insert([datos]);
};

export const obtenerTodosEstudiantes = async (supabase) => {
  return await supabase.from('estudiantes').select('*');
};

export const actualizarEstudiante = async (supabase, id, datos) => {
  return await supabase.from('estudiantes').update(datos).eq('id', id);
};

export const eliminarEstudiante = async (supabase, id) => {
  return await supabase.from('estudiantes').delete().eq('id', id);
};