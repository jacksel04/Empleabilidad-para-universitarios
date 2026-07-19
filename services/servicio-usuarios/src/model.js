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
      upsert: true
    });

  if (error) throw error;

  // 2. Obtener la URL pública del archivo recién subido
  const { data: publicUrlData } = supabase.storage
    .from('curriculums')
    .getPublicUrl(`cvs/${fileName}`);

  return publicUrlData.publicUrl;
};

// ===============================
// MODELO DE EMPRESAS
// ===============================

// Columnas públicas de empresa.
// No se incluye password por seguridad.
const columnasEmpresaPublicas = `
  id,
  nombre_empresa,
  ruc,
  sector,
  correo_contacto,
  telefono,
  descripcion,
  sitio_web,
  direccion,
  estado_verificacion,
  created_at
`;

export const obtenerEmpresas = async (supabase) => {
  return await supabase
    .from('empresas')
    .select(columnasEmpresaPublicas)
    .order('created_at', { ascending: false });
};

export const crearEmpresa = async (supabase, datos) => {
  return await supabase
    .from('empresas')
    .insert([datos])
    .select(columnasEmpresaPublicas);
};

export const actualizarEmpresa = async (supabase, id, datos) => {
  return await supabase
    .from('empresas')
    .update(datos)
    .eq('id', id)
    .select(columnasEmpresaPublicas);
};