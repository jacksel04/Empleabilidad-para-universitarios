import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner } from "react-bootstrap";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const BolsaTrabajo = ({ estudiante, alCambiarVista }) => {
  const [ofertas, setOfertas] = useState([]);
  const [notificacion, setNotificacion] = useState({ texto: "", tipo: "" });
  const [cargandoId, setCargandoId] = useState(null); // Controla qué botón está cargando
  const [cargandoPagina, setCargandoPagina] = useState(true);
  // --- NUEVO: ESTADOS PARA LA IA ---
  const [ofertasIA, setOfertasIA] = useState([]);
  const [loadingIA, setLoadingIA] = useState(false);
  const [usandoIA, setUsandoIA] = useState(false);
  useEffect(() => {
    cargarOfertasBolsa();
  }, []);

  const cargarOfertasBolsa = async () => {
    try {
      setCargandoPagina(true);
      const res = await fetch(`${API_BASE_URL}/api/ofertas`);
      if (res.ok) {
        const data = await res.json();
        setOfertas(data);
      }
    } catch (error) {
      console.error("Error al obtener ofertas:", error);
      setNotificacion({ texto: "Error al cargar la bolsa de trabajo.", tipo: "danger" });
    } finally {
      setCargandoPagina(false);
    }
  };

  const handlePostularBolsa = async (ofertaId) => {
    if (!estudiante || !estudiante.id) {
      setNotificacion({ texto: "No se identificó al estudiante. Por favor, reinicia sesión.", tipo: "warning" });
      return;
    }

    try {
      setCargandoId(ofertaId); // Inicia el loader en el botón específico
      setNotificacion({ texto: "", tipo: "" });
      
      const response = await fetch(`${API_BASE_URL}/api/postular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estudiante_id: estudiante.id,
          oferta_id: ofertaId
        })
      });

      // Manejo seguro en caso de que el servidor devuelva HTML en lugar de JSON (Ej: Errores 502 de Render)
      let data;
      try {
        data = await response.json();
      } catch (err) {
        throw new Error("El servidor no devolvió una respuesta válida. Intenta nuevamente.");
      }

      if (!response.ok) {
        setNotificacion({ texto: data.error || "No se pudo completar la postulación.", tipo: "danger" });
        return;
      }

      // Éxito: Mostrar alerta y recargar las ofertas para que el botón pase a "Convocatoria Cerrada"
      setNotificacion({ texto: "¡Postulación registrada de manera exitosa!", tipo: "success" });
      await cargarOfertasBolsa();

    } catch (error) {
      setNotificacion({ texto: error.message || "Error al conectar con el servidor.", tipo: "danger" });
    } finally {
      setCargandoId(null); // Apaga el loader del botón
    }
  };


  // --- NUEVO: FUNCIÓN PARA EJECUTAR EL ORDENAMIENTO IA ---
  const ordenarConIA = async () => {
    // Validación inicial: La IA necesita datos para trabajar
    if (!estudiante || !estudiante.carrera || !estudiante.habilidades) {
      setNotificacion({ 
        texto: "Debes tener tu carrera y habilidades registradas en la pestaña 'Perfil' para usar la IA.", 
        tipo: "warning" 
      });
      return;
    }

    setLoadingIA(true);
    setUsandoIA(true);
    setNotificacion({ texto: "", tipo: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/api/ia/match-ofertas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrera: estudiante.carrera,
          habilidades_estudiante: estudiante.habilidades
        })
      });

      const data = await response.json();
      if (response.ok && data.resultados) {
        setOfertasIA(data.resultados);
        if (data.resultados.length === 0) {
          setNotificacion({ texto: "No encontramos ofertas con suficiente afinidad (mayor al 20%) para tu perfil actual.", tipo: "info" });
        }
      } else {
        throw new Error(data.error || "Error procesando el match con IA.");
      }
    } catch (error) {
      console.error("Error IA:", error);
      setNotificacion({ texto: "Hubo un problema al conectar con el motor de IA.", tipo: "danger" });
      setUsandoIA(false); // Desactivar si falla
    } finally {
      setLoadingIA(false);
    }
  };

  // Variable para determinar qué lista iterar (la normal o la de la IA)
  const ofertasA_Mostrar = usandoIA ? ofertasIA : ofertas;

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Bolsa de Trabajo</h3>
        <p className="text-muted">Explora y aplica a las ofertas laborales disponibles para la comunidad de San Marcos.</p>
      </div>
      {/* --- NUEVO: CONTROLES DE LA IA EN LA INTERFAZ --- */}
      <div className="mb-4 d-flex gap-2 flex-wrap">
        <Button 
          variant="success" 
          onClick={ordenarConIA} 
          disabled={loadingIA}
          className="fw-bold shadow-sm"
        >
          {loadingIA ? (
            <><Spinner as="span" animation="border" size="sm" className="me-2" /> Analizando compatibilidad...</>
          ) : (
            "🤖 Ordenar por Afinidad IA"
          )}
        </Button>

        {usandoIA && (
          <Button 
            variant="outline-danger" 
            onClick={() => { setUsandoIA(false); setOfertasIA([]); setNotificacion({texto:"", tipo:""}); }}
            disabled={loadingIA}
          >
            Volver a lista normal
          </Button>
        )}
      </div>

      {notificacion.texto && (
        <Alert variant={notificacion.tipo} dismissible onClose={() => setNotificacion({ texto: "", tipo: "" })}>
          {notificacion.texto}
        </Alert>
      )}

      {cargandoPagina ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">Cargando vacantes disponibles...</p>
        </div>
      ) : ofertasA_Mostrar.length === 0 ? (
        <Alert variant="info" className="text-center border-0 shadow-sm">
          {usandoIA ? "La IA no encontró matches exactos. Ajusta tus habilidades en tu perfil." : "No hay ofertas laborales publicadas en este momento. Vuelve más tarde."}
        </Alert>
      ) : (
        <Row className="g-4">
          {ofertasA_Mostrar.map((oferta) => {
            // Nota: La IA devuelve 'id_oferta' en lugar de 'id', así que normalizamos aquí
            const idReal = usandoIA ? oferta.id_oferta : oferta.id;
            const esActiva = usandoIA ? true : (oferta.estado === "Activo" || oferta.estado === "Activa");
            const estaCargandoEsteBoton = cargandoId === idReal;
            return (
              <Col xs={12} md={6} key={oferta.id}>
                <Card className="h-100 shadow-sm border-0 bg-white">
                  <Card.Body className="p-4 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="fw-bold text-dark m-0">{oferta.titulo_puesto}</h5>
                        {usandoIA ? (
                          <Badge bg="success" className="px-3 py-2" style={{ fontSize: "0.9rem" }}>
                            {oferta.match_porcentaje}% MATCH
                          </Badge>
                        ) : (
                          <Badge bg={esActiva ? "success" : "secondary"}>
                            {oferta.estado || "No definido"}
                          </Badge>
                        )}
                      </div>

                      <h6 className="text-primary mb-3">{oferta.empresa_nombre || oferta.empresa}</h6>
                      {/* --- NUEVO: JUSTIFICACIÓN DE LA IA --- */}
                      {usandoIA ? (
                        <div className="bg-light p-3 rounded mb-3 border-start border-4 border-success">
                          <p className="text-secondary small fst-italic mb-0">
                            🤖 "{oferta.justificacion}"
                          </p>
                        </div>
                      ) : (
                        <>
                          <Card.Text className="text-secondary small">{oferta.descripcion}</Card.Text>
                          <div className="bg-light p-2 rounded mb-3" style={{ fontSize: "0.85rem" }}>
                            <div><strong>Modalidad:</strong> {oferta.modalidad}</div>
                            <div><strong>Salario:</strong> {oferta.salario || "A convenir"}</div>
                          </div>
                        </>
                      )}
                      {/* -------------------------------------- */}
                    </div>

                    <Button 
                      variant={esActiva ? "primary" : "secondary"} 
                      className="w-100 mt-2" 
                      disabled={!esActiva || estaCargandoEsteBoton}
                      onClick={() => handlePostularBolsa(oferta.id)}
                    >
                      {estaCargandoEsteBoton ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                          Procesando...
                        </>
                      ) : esActiva ? (
                        "Enviar Postulación"
                      ) : (
                        "Convocatoria Cerrada / En Proceso"
                      )}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};