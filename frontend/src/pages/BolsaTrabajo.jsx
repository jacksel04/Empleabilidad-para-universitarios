import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Button, Alert } from "react-bootstrap";

const API_BASE_URL = "https://empleabilidad-para-universitarios.onrender.com";

export const BolsaTrabajo = ({ estudiante, alCambiarVista }) => {
  const [ofertas, setOfertas] = useState([]);
  const [notificacion, setNotificacion] = useState({ texto: "", tipo: "" });

  useEffect(() => {
    cargarOfertasBolsa();
  }, []);

  const cargarOfertasBolsa = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ofertas`);
      if (res.ok) {
        const data = await res.json();
        setOfertas(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostularBolsa = async (ofertaId) => {
    try {
      setNotificacion({ texto: "", tipo: "" });
      const response = await fetch(`${API_BASE_URL}/api/postular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estudiante_id: estudiante.id,
          oferta_id: ofertaId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setNotificacion({ texto: data.error || "No se pudo postular.", tipo: "danger" });
        return;
      }

      setNotificacion({ texto: "¡Postulación registrada de manera exitosa!", tipo: "success" });
    } catch (error) {
      setNotificacion({ texto: "Error al conectar con el servidor.", tipo: "danger" });
    }
  };

  return (
    <Container className="py-2">
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Bolsa de Trabajo</h3>
        <p className="text-muted">Explora y aplica a las ofertas laborales disponibles para la comunidad de San Marcos.</p>
      </div>

      {notificacion.texto && (
        <Alert variant={notificacion.tipo} dismissible onClose={() => setNotificacion({ texto: "", tipo: "" })}>
          {notificacion.texto}
        </Alert>
      )}

      <Row className="g-4">
        {ofertas.map((oferta) => {
          const esActiva = oferta.estado === "Activo";
          return (
            <Col xs={12} md={6} key={oferta.id}>
              <Card className="h-100 shadow-sm border-0 bg-white">
                <Card.Body className="p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold text-dark m-0">{oferta.titulo_puesto}</h5>
                      <Badge bg={esActiva ? "success" : "secondary"}>{oferta.estado}</Badge>
                    </div>
                    <h6 className="text-primary mb-3">{oferta.empresa_nombre}</h6>
                    <Card.Text className="text-secondary small">{oferta.descripcion}</Card.Text>
                    
                    <div className="bg-light p-2 rounded mb-3" style={{ fontSize: "0.85rem" }}>
                      <div><strong>Modalidad:</strong> {oferta.modalidad}</div>
                      <div><strong>Salario:</strong> {oferta.salario || "No especificado"}</div>
                    </div>
                  </div>

                  <Button 
                    variant={esActiva ? "primary" : "secondary"} 
                    className="w-100 mt-2" 
                    disabled={!esActiva}
                    onClick={() => handlePostularBolsa(oferta.id)}
                  >
                    {esActiva ? "Enviar Postulación" : "Convocatoria Cerrada"}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};