import { Groq } from 'groq-sdk';
import natural from 'natural';
import { publicarEvento } from './rabbitmq.js';
// Configuración de clientes y variables de entorno
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// En un entorno de microservicios, la IA le pide los datos al servicio correspondiente.
// Asegúrate de definir esta variable en tu archivo .env (ej. http://localhost:3002/api/bi)
const BI_SERVICE_URL = process.env.BI_SERVICE_URL || 'http://localhost:3002/api/bi';

export const obtenerBrujulaMercado = async (req, res) => {
  try {
    const { carrera, habilidades_estudiante } = req.body;

    if (!carrera) {
      return res.status(400).json({ error: "Falta la carrera del estudiante" });
    }

    // 1. EXTRAER DATOS (Llamada HTTP al Servicio BI)
    // El microservicio IA no toca la BD, le pide los datos procesados al Servicio BI.
    const response = await fetch(`${BI_SERVICE_URL}/ofertas/requisitos?carrera=${encodeURIComponent(carrera)}`);
    
    if (!response.ok) {
      throw new Error("No se pudo obtener la información del Servicio BI.");
    }
    const ofertas = await response.json();

    if (!ofertas || ofertas.length === 0) {
      return res.status(200).json({ 
        mensaje: "Actualmente no hay suficientes ofertas publicadas en tu carrera para realizar un análisis de mercado." 
      });
    }

    // 2. MOTOR MATEMÁTICO (TF-IDF con natural)
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();
    
    ofertas.forEach(oferta => {
      if (oferta.requisitos) {
        const textoLimpio = oferta.requisitos.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ");
        tfidf.addDocument(textoLimpio);
      }
    });

    const pesosPalabras = {};
    ofertas.forEach((_, index) => {
      const terminos = tfidf.listTerms(index);
      terminos.forEach(t => {
        const stopWords = ['con', 'para', 'los', 'las', 'una', 'uno', 'del', 'que', 'experiencia', 'conocimiento', 'años', 'manejo'];
        if (t.term.length > 2 && !stopWords.includes(t.term)) {
          pesosPalabras[t.term] = (pesosPalabras[t.term] || 0) + t.tfidf;
        }
      });
    });

    const topTecnologiasMercado = Object.entries(pesosPalabras)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 10);

    // 3. CALCULAR LA BRECHA
    const habilidadesAlumnoArray = habilidades_estudiante ? habilidades_estudiante.toLowerCase().split(',').map(s => s.trim()) : [];
    
    const brechaTecnologica = topTecnologiasMercado.filter(tech => 
      !habilidadesAlumnoArray.some(hab => hab.includes(tech))
    ).slice(0, 3);

    if (brechaTecnologica.length === 0) {
      return res.status(200).json({ 
        mensaje: "¡Felicidades! Tu perfil cubre las tecnologías más demandadas actualmente en tu carrera." 
      });
    }

    // 4. IA GENERATIVA (Groq)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un asesor de carrera técnico experto. Tu objetivo es explicarle al estudiante por qué debería aprender ciertas tecnologías específicas. Sé directo, profesional, motivador y usa máximo un párrafo corto."
        },
        {
          role: "user",
          content: `El estudiante de la carrera de ${carrera} ya sabe: ${habilidades_estudiante || 'Nada registrado aún'}. 
          Según el algoritmo TF-IDF de nuestra bolsa de trabajo, le falta aprender urgentemente estas tecnologías: ${brechaTecnologica.join(', ')}. 
          Redacta un consejo de 3 líneas indicándole que estas tecnologías son la clave para ser contratado en las ofertas actuales de su carrera en San Marcos.`
        }
      ],
      model: "openai/gpt-oss-120b",
    });

    const recomendacionIA = chatCompletion.choices[0].message.content;
    
    // Publicamos el evento en RabbitMQ avisando al sistema que se hizo un análisis
    publicarEvento('ia.brujula.generada', {
      carrera: carrera,
      tecnologias_faltantes: brechaTecnologica,
      fecha: new Date().toISOString()
    });

    // 5. RESPUESTA FINAL AL FRONTEND
    return res.status(200).json({ 
      top_faltante: brechaTecnologica,
      mensaje: recomendacionIA
    });

  } catch (error) {
    console.error("[Error en Brújula IA]:", error);
    return res.status(500).json({ error: "Error interno al procesar el análisis de mercado." });
  }
};

// Función auxiliar matemática pura: Similitud del Coseno Mejorada
const calcularSimilitudCoseno = (texto1, texto2) => {
  const tokenize = (text) => {
    // 1. Regex mejorado para incluir letras con tildes y ñ
    const palabras = text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ").match(/[a-záéíóúñü\d]+/g) || [];
    
    // 2. Filtro de palabras basura (Stop Words) y palabras muy cortas
    const stopWords = ['con', 'para', 'los', 'las', 'una', 'uno', 'del', 'que', 'el', 'la', 'en', 'de', 'y', 'a', 'o', 'su', 'se', 'al', 'es', 'por'];
    return palabras.filter(w => w.length > 2 && !stopWords.includes(w));
  };

  const tokens1 = tokenize(texto1);
  const tokens2 = tokenize(texto2);
  
  const vocabulario = Array.from(new Set([...tokens1, ...tokens2]));
  
  const vector1 = vocabulario.map(t => tokens1.filter(w => w === t).length);
  const vector2 = vocabulario.map(t => tokens2.filter(w => w === t).length);
  
  const productoPunto = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
  const magnitud1 = Math.sqrt(vector1.reduce((sum, val) => sum + (val * val), 0));
  const magnitud2 = Math.sqrt(vector2.reduce((sum, val) => sum + (val * val), 0));
  
  if (magnitud1 === 0 || magnitud2 === 0) return 0;
  return productoPunto / (magnitud1 * magnitud2);
};

export const calcularMatchOfertas = async (req, res) => {
  try {
    const { carrera, habilidades_estudiante, intereses_estudiante } = req.body;

    // 📍 PUNTO 1: Saber qué datos llegan desde el frontend
    console.log("\n[IA-DEBUG 1] --- NUEVA PETICION DE MATCH ---");
    console.log(`[IA-DEBUG 1] Carrera: "${carrera}"`);
    console.log(`[IA-DEBUG 1] Habilidades: "${habilidades_estudiante}"`);
    console.log(`[IA-DEBUG 1] Intereses: "${intereses_estudiante}"`);

    if (!carrera) return res.status(400).json({ error: "Carrera es requerida." });

    // 1. FILTRO DURO (Llamada HTTP al Servicio BI)
    const urlConsulta = `${BI_SERVICE_URL}/ofertas/match?carrera=${encodeURIComponent(carrera)}`;
    console.log(`[IA-DEBUG 2] Consultando BI en: ${urlConsulta}`);
    
    const response = await fetch(urlConsulta);
    
    if (!response.ok) {
      console.error(`[IA-DEBUG 2] ERROR HTTP DE BI: ${response.status}`);
      throw new Error("No se pudo obtener las ofertas del Servicio BI.");
    }
    
    const ofertas = await response.json();

    // 📍 PUNTO 3: Saber cuántas ofertas devolvió la Base de Datos para esa carrera
    console.log(`[IA-DEBUG 3] Ofertas encontradas en BD para esa carrera: ${ofertas ? ofertas.length : 0}`);

    if (!ofertas || ofertas.length === 0) {
      console.log("[IA-DEBUG 3] Terminando temprano: El Servicio BI no encontró ninguna oferta.");
      return res.status(200).json({ resultados: [] });
    }

    // 2. MOTOR MATEMÁTICO: Calcular Match % para cada oferta
    const textoPerfilAlumno = `${habilidades_estudiante || ''} ${intereses_estudiante || ''}`;
    
    let ofertasConMatch = ofertas.map(oferta => {
      const textoOferta = `${oferta.titulo_puesto} ${oferta.requisitos || ''}`;
      const similitud = calcularSimilitudCoseno(textoPerfilAlumno, textoOferta);
      const porcentaje = Math.round(similitud * 100);
      
      return { ...oferta, match: porcentaje };
    });

    // 📍 PUNTO 4: Espiar los puntajes antes de que el filtro los elimine
    console.log(`[IA-DEBUG 4] Puntajes calculados antes de filtrar (>20%):`);
    ofertasConMatch.forEach(o => {
      console.log(`   - ID: ${o.id} | Puesto: ${o.titulo_puesto} | MATCH: ${o.match}%`);
    });

    ofertasConMatch = ofertasConMatch
      .filter(o => o.match > 20)
      .sort((a, b) => b.match - a.match)
      .slice(0, 5);

    // 📍 PUNTO 5: Saber cuántas ofertas superaron la prueba del 20%
    console.log(`[IA-DEBUG 5] Ofertas que superaron el 20%: ${ofertasConMatch.length}`);

    if (ofertasConMatch.length === 0) {
       console.log("[IA-DEBUG 5] Terminando temprano: Ninguna oferta alcanzó el 20% de match.");
       return res.status(200).json({ resultados: [] });
    }

    // 3. IA GENERATIVA (Groq)
    console.log(`[IA-DEBUG 6] Pidiendo justificaciones a Groq para ${ofertasConMatch.length} ofertas...`);
    const promptDatos = ofertasConMatch.map(o => ({
      id: o.id,
      puesto: o.titulo_puesto,
      requisitos: o.requisitos
    }));

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un analista de reclutamiento. Recibirás un perfil y un arreglo de ofertas. Devuelve ESTRICTAMENTE un JSON con un arreglo de objetos. Cada objeto debe tener 'id' (el id de la oferta) y 'justificacion' (1 oración corta y profesional de por qué el perfil encaja con esa oferta). No escribas nada de texto fuera del JSON."
        },
        {
          role: "user",
          content: `Perfil: [Habilidades: ${habilidades_estudiante}, Intereses: ${intereses_estudiante}]. Ofertas: ${JSON.stringify(promptDatos)}`
        }
      ],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" }
    });

    let justificacionesIA = [];
    try {
      const contenidoRaw = chatCompletion.choices?.[0]?.message?.content || '{}';
      const iaRespuestaParsed = JSON.parse(contenidoRaw);

      // CORRECCIÓN CRÍTICA: Buscar de forma segura un Arreglo en la respuesta
      if (Array.isArray(iaRespuestaParsed.justificaciones)) {
        justificacionesIA = iaRespuestaParsed.justificaciones;
      } else if (Array.isArray(iaRespuestaParsed)) {
        justificacionesIA = iaRespuestaParsed;
      } else {
        // Busca si alguna de las propiedades dentro del objeto devuelto es un Arreglo
        const posibleArreglo = Object.values(iaRespuestaParsed).find(v => Array.isArray(v));
        justificacionesIA = posibleArreglo || [];
      }

      console.log(`[IA-DEBUG 7] Groq respondió exitosamente y se procesó el arreglo.`);
    } catch (parseError) {
      console.log("[IA-DEBUG 7] Error parseando JSON de la IA, devolviendo vacio", parseError);
    }

    // 4. UNIR MATEMÁTICA CON JUSTIFICACIÓN Y ENVIAR
    const resultadosFinales = ofertasConMatch.map(oferta => {
      const matchIA = justificacionesIA.find(j => j.id === oferta.id);
      return {
        id_oferta: oferta.id,
        titulo: oferta.titulo_puesto,
        empresa: oferta.empresa_nombre,
        match_porcentaje: oferta.match,
        justificacion: matchIA ? matchIA.justificacion : "Afinidad calculada según las tecnologías de tu perfil."
      };
    });

    console.log(`[IA-DEBUG 8] === FIN DEL PROCESO === Enviando ${resultadosFinales.length} ofertas al frontend.\n`);
    return res.status(200).json({ resultados: resultadosFinales });

  } catch (error) {
    console.error("[Error en Matchmaker]:", error);
    return res.status(500).json({ error: "Error procesando el match semántico." });
  }
};

export const calcularMatchPostulantes = async (req, res) => {
  try {
    const { empresa_id, postulantes } = req.body;

    if (!postulantes || postulantes.length === 0) {
      return res.status(400).json({ error: "No hay postulantes para analizar." });
    }

    // 1. MOTOR MATEMÁTICO: Evaluamos cada postulante contra la oferta a la que aplicó
    // Aquí no hacemos fetch a BD, porque el microservicio principal (o frontend)
    // ya nos envía toda la información ("postulantes") necesaria en el req.body.
    let postulantesConMatch = postulantes.map(post => {
      const textoOferta = `${post.ofertas?.titulo_puesto || ''} ${post.ofertas?.requisitos || ''}`;
      const textoCandidato = `${post.estudiante_habilidades || ''} ${post.estudiante_intereses || ''}`;
      
      const similitud = calcularSimilitudCoseno(textoCandidato, textoOferta);
      const porcentaje = Math.round(similitud * 100);
      
      return { ...post, match_ia: porcentaje };
    });

    // 2. ORDENAR LOS MEJORES
    postulantesConMatch.sort((a, b) => b.match_ia - a.match_ia);

    return res.status(200).json(postulantesConMatch);

  } catch (error) {
    console.error("[Error en Matchmaker Empresa]:", error);
    return res.status(500).json({ error: "Error procesando el match de postulantes." });
  }
};