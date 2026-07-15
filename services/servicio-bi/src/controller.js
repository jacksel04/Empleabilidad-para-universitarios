import express from "express";
import "dotenv/config";

import {
  contarPostulaciones,
  contarEstudiantes,
  contarEmpresas,
  contarOfertas,
  contarOfertasActivas,
  contarEstudiantesVerificados,
  obtenerEstadosOfertas,
  obtenerModalidadesOfertas,
  obtenerEstadosPostulaciones,
  obtenerCarrerasEstudiantes,
  obtenerEstadosEmpresas
} from "./model.js";

import { supabase } from "./supabase.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3004;

// ===============================
// NORMALIZACIÓN DE DATOS
// ===============================

const normalizarEstadoOferta = (valor) => {
  const estado = String(valor || "")
    .trim()
    .toLowerCase();

  if (
    estado === "en proceso" ||
    estado === "en proceso de selección"
  ) {
    return "En proceso de selección";
  }

  if (estado === "activo" || estado === "activa") {
    return "Activo";
  }

  if (estado === "cerrado" || estado === "cerrada") {
    return "Cerrado";
  }

  return valor ? String(valor).trim() : "Sin especificar";
};

const normalizarModalidad = (valor) => {
  const modalidad = String(valor || "")
    .trim()
    .toLowerCase();

  if (modalidad === "hibrido" || modalidad === "híbrido") {
    return "Híbrido";
  }

  if (modalidad === "presencial") {
    return "Presencial";
  }

  if (modalidad === "remoto") {
    return "Remoto";
  }

  return valor ? String(valor).trim() : "Sin especificar";
};

const normalizarTexto = (valor) => {
  return valor ? String(valor).trim() : "Sin especificar";
};

// ===============================
// AGRUPACIÓN PARA GRÁFICOS
// ===============================

const agruparPorCampo = (
  registros = [],
  campo,
  normalizador = normalizarTexto
) => {
  const conteo = registros.reduce((resultado, registro) => {
    const categoria = normalizador(registro?.[campo]);

    resultado[categoria] = (resultado[categoria] || 0) + 1;

    return resultado;
  }, {});

  return Object.entries(conteo)
    .map(([categoria, total]) => ({
      categoria,
      total
    }))
    .sort((a, b) => b.total - a.total);
};

// ===============================
// ENDPOINT DE ESTADÍSTICAS
// ===============================

app.get("/api/estadisticas", async (req, res) => {
  try {
    const [
      postulacionesResult,
      estudiantesResult,
      empresasResult,
      ofertasResult,
      ofertasActivasResult,
      estudiantesVerificadosResult,
      estadosOfertasResult,
      modalidadesOfertasResult,
      estadosPostulacionesResult,
      carrerasEstudiantesResult,
      estadosEmpresasResult
    ] = await Promise.all([
      contarPostulaciones(supabase),
      contarEstudiantes(supabase),
      contarEmpresas(supabase),
      contarOfertas(supabase),
      contarOfertasActivas(supabase),
      contarEstudiantesVerificados(supabase),
      obtenerEstadosOfertas(supabase),
      obtenerModalidadesOfertas(supabase),
      obtenerEstadosPostulaciones(supabase),
      obtenerCarrerasEstudiantes(supabase),
      obtenerEstadosEmpresas(supabase)
    ]);

    const resultados = [
      postulacionesResult,
      estudiantesResult,
      empresasResult,
      ofertasResult,
      ofertasActivasResult,
      estudiantesVerificadosResult,
      estadosOfertasResult,
      modalidadesOfertasResult,
      estadosPostulacionesResult,
      carrerasEstudiantesResult,
      estadosEmpresasResult
    ];

    const errores = resultados
      .map((resultado) => resultado?.error)
      .filter(Boolean);

    if (errores.length > 0) {
      throw new Error(
        errores.map((error) => error.message).join(" | ")
      );
    }

    const totalPostulaciones = postulacionesResult.count || 0;
    const totalEstudiantes = estudiantesResult.count || 0;
    const totalEmpresas = empresasResult.count || 0;
    const totalOfertas = ofertasResult.count || 0;
    const ofertasActivas = ofertasActivasResult.count || 0;
    const estudiantesVerificados =
      estudiantesVerificadosResult.count || 0;

    return res.status(200).json({
      mensaje: "Métricas operativas generadas con éxito",

      reporte: {
        total_alumnos_registrados: totalEstudiantes,
        ofertas_laborales_disponibles: ofertasActivas,
        transacciones_de_postulacion_realizadas: totalPostulaciones
      },

      resumen: {
        total_estudiantes: totalEstudiantes,
        estudiantes_verificados: estudiantesVerificados,
        total_empresas: totalEmpresas,
        total_ofertas: totalOfertas,
        ofertas_activas: ofertasActivas,
        total_postulaciones: totalPostulaciones
      },

      graficos: {
        ofertas_por_estado: agruparPorCampo(
          estadosOfertasResult.data || [],
          "estado",
          normalizarEstadoOferta
        ),

        ofertas_por_modalidad: agruparPorCampo(
          modalidadesOfertasResult.data || [],
          "modalidad",
          normalizarModalidad
        ),

        postulaciones_por_estado: agruparPorCampo(
          estadosPostulacionesResult.data || [],
          "estado_evaluacion"
        ),

        estudiantes_por_carrera: agruparPorCampo(
          carrerasEstudiantesResult.data || [],
          "carrera"
        ),

        empresas_por_verificacion: agruparPorCampo(
          estadosEmpresasResult.data || [],
          "estado_verificacion"
        )
      }
    });
  } catch (error) {
    console.error("[Servicio BI]", error);

    return res.status(500).json({
      error: "No se pudieron generar las estadísticas.",
      detalle: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`[Servicio BI] Escuchando en el puerto ${PORT}`);
});