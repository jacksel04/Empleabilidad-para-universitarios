import { Groq } from 'groq-sdk';
import natural from 'natural';
import { supabase } from './supabase.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const obtenerBrujulaMercado = async (req, res) => {
  try {
    const { carrera, habilidades_estudiante } = req.body;

    if (!carrera) {
      return res.status(400).json({ error: "Falta la carrera del estudiante" });
    }

    // 1. EXTRAER DATOS (Filtrado Duro por Carrera)
    // Obtenemos solo los requisitos de las ofertas activas para esta carrera
    const { data: ofertas, error } = await supabase
      .from('ofertas')
      .select('requisitos')
      .eq('estado', 'Activo')
      .eq('carrera', carrera);

    if (error) throw error;

    if (!ofertas || ofertas.length === 0) {
      return res.status(200).json({ 
        mensaje: "Actualmente no hay suficientes ofertas publicadas en tu carrera para realizar un análisis de mercado." 
      });
    }

    // 2. MOTOR MATEMÁTICO (TF-IDF con natural)
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();
    
    // Añadimos cada oferta como un documento matemático
    ofertas.forEach(oferta => {
      if (oferta.requisitos) {
        // Limpiamos un poco el texto de caracteres especiales
        const textoLimpio = oferta.requisitos.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ");
        tfidf.addDocument(textoLimpio);
      }
    });

    // Calculamos el peso total de las palabras en todo el corpus (todas las ofertas)
    const pesosPalabras = {};
    ofertas.forEach((_, index) => {
      const terminos = tfidf.listTerms(index);
      terminos.forEach(t => {
        // Ignoramos palabras genéricas (stop-words básicos en español) o muy cortas
        const stopWords = ['con', 'para', 'los', 'las', 'una', 'uno', 'del', 'que', 'experiencia', 'conocimiento', 'años', 'manejo'];
        if (t.term.length > 2 && !stopWords.includes(t.term)) {
          pesosPalabras[t.term] = (pesosPalabras[t.term] || 0) + t.tfidf;
        }
      });
    });

    // Ordenamos las tecnologías de mayor a menor peso
    const topTecnologiasMercado = Object.entries(pesosPalabras)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 10); // Tomamos el Top 10 matemático

    // 3. CALCULAR LA BRECHA (Lo que el mercado pide vs lo que el alumno tiene)
    const habilidadesAlumnoArray = habilidades_estudiante ? habilidades_estudiante.toLowerCase().split(',').map(s => s.trim()) : [];
    
    // Filtramos las tecnologías que el alumno ya domina
    const brechaTecnologica = topTecnologiasMercado.filter(tech => 
      !habilidadesAlumnoArray.some(hab => hab.includes(tech))
    ).slice(0, 3); // Nos quedamos con las 3 faltantes más importantes

    // Si el alumno ya sabe todo lo que pide el mercado:
    if (brechaTecnologica.length === 0) {
      return res.status(200).json({ 
        mensaje: "¡Felicidades! Tu perfil cubre las tecnologías más demandadas actualmente en tu carrera." 
      });
    }

    // 4. IA GENERATIVA (Capa de Comunicación final con Groq)
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
      model: "llama3-8b-8192",
    });

    const recomendacionIA = chatCompletion.choices[0].message.content;

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