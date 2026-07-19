// ===============================
// MÉTRICAS GENERALES
// ===============================

export const contarPostulaciones = async (supabase) => {
  return await supabase
    .from("postulaciones")
    .select("*", { count: "exact", head: true });
};

export const contarEstudiantes = async (supabase) => {
  return await supabase
    .from("estudiantes")
    .select("*", { count: "exact", head: true });
};

export const contarEmpresas = async (supabase) => {
  return await supabase
    .from("empresas")
    .select("*", { count: "exact", head: true });
};

export const contarOfertas = async (supabase) => {
  return await supabase
    .from("ofertas")
    .select("*", { count: "exact", head: true });
};

export const contarOfertasActivas = async (supabase) => {
  return await supabase
    .from("ofertas")
    .select("*", { count: "exact", head: true })
    .eq("estado", "Activo");
};

export const contarEstudiantesVerificados = async (supabase) => {
  return await supabase
    .from("estudiantes")
    .select("*", { count: "exact", head: true })
    .eq("perfil_verificado", true);
};

// ===============================
// DATOS PARA GRÁFICOS
// ===============================

export const obtenerEstadosOfertas = async (supabase) => {
  return await supabase
    .from("ofertas")
    .select("estado");
};

export const obtenerModalidadesOfertas = async (supabase) => {
  return await supabase
    .from("ofertas")
    .select("modalidad");
};

export const obtenerEstadosPostulaciones = async (supabase) => {
  return await supabase
    .from("postulaciones")
    .select("estado_evaluacion");
};

export const obtenerCarrerasEstudiantes = async (supabase) => {
  return await supabase
    .from("estudiantes")
    .select("carrera");
};

export const obtenerEstadosEmpresas = async (supabase) => {
  return await supabase
    .from("empresas")
    .select("estado_verificacion");
};

// Trae solo los requisitos de las ofertas de una carrera
export const obtenerRequisitosPorCarrera = async (supabase, carrera) => {
  return await supabase
    .from("ofertas")
    .select("requisitos")
    .eq("estado", "Activo")
    .eq("carrera", carrera); // ¡Requiere que agregues esta columna en Supabase!
};

// Trae la info base de las ofertas para cruzar datos
export const obtenerOfertasParaMatch = async (supabase, carrera) => {
  return await supabase
    .from("ofertas")
    .select("id, titulo_puesto, empresa_nombre, requisitos")
    .eq("estado", "Activo")
    .eq("carrera", carrera); // ¡Requiere que agregues esta columna en Supabase!
};