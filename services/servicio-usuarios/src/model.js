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

export const subirCVSupabase = async (supabase, fileBuffer, fileName) => {
  // 1. Subir el archivo al bucket 'curriculums'
  const { data, error } = await supabase.storage
    .from('curriculums')
    .upload(`cvs/${fileName}`, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true // Sobreescribe si el estudiante sube un CV actualizado
    });

  if (error) throw error;

  // 2. Obtener la URL pública del archivo recién subido
  const { data: publicUrlData } = supabase.storage
    .from('curriculums')
    .getPublicUrl(`cvs/${fileName}`);

  return publicUrlData.publicUrl;
};