import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner } from "react-bootstrap";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const BolsaTrabajo = ({ estudiante, alCambiarVista }) => {
  const [ofertas, setOfertas] = useState([]);
  const [notificacion, setNotificacion] = useState({ texto: "", tipo: "" });
  const [cargandoId, setCargandoId] = useState(null); // Controla qué botón está cargando
  const [cargandoPagina, setCargandoPagina] = useState(true);

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

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Bolsa de Trabajo</h3>
        <p className="text-muted">Explora y aplica a las ofertas laborales disponibles para la comunidad de San Marcos.</p>
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
      ) : ofertas.length === 0 ? (
        <Alert variant="info" className="text-center border-0 shadow-sm">
          No hay ofertas laborales publicadas en este momento. Vuelve más tarde.
        </Alert>
      ) : (
        <Row className="g-4">
          {ofertas.map((oferta) => {
            // Soportamos tanto "Activo" como "Activa" para evitar bugs por errores de tipeo en BD
            const esActiva = oferta.estado === "Activo" || oferta.estado === "Activa";
            const estaCargandoEsteBoton = cargandoId === oferta.id;

            return (
              <Col xs={12} md={6} key={oferta.id}>
                <Card className="h-100 shadow-sm border-0 bg-white">
                  <Card.Body className="p-4 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="fw-bold text-dark m-0">{oferta.titulo_puesto}</h5>
                        <Badge bg={esActiva ? "success" : "secondary"}>
                          {oferta.estado || "No definido"}
                        </Badge>
                      </div>
                      <h6 className="text-primary mb-3">{oferta.empresa_nombre}</h6>
                      <Card.Text className="text-secondary small">{oferta.descripcion}</Card.Text>
                      
                      <div className="bg-light p-2 rounded mb-3" style={{ fontSize: "0.85rem" }}>
                        <div><strong>Modalidad:</strong> {oferta.modalidad}</div>
                        <div><strong>Salario:</strong> {oferta.salario || "A convenir"}</div>
                      </div>
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