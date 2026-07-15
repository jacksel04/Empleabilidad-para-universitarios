export const contarPostulaciones = async (supabase) => {
  return await supabase.from('postulaciones').select('*', { count: 'exact', head: true });
};

export const contarEstudiantes = async (supabase) => {
  return await supabase.from('estudiantes').select('*', { count: 'exact', head: true });
};

export const contarOfertasActivas = async (supabase) => {
  return await supabase
    .from("ofertas")
    .select("*", { count: "exact", head: true })
    .eq("estado", "Activo");
};