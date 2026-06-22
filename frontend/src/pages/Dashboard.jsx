import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const Dashboard = ({ estudiante, alCambiarVista }) => {
  const [stats, setStats] = useState({ totalOfertas: 0, ofertasActivas: 0, totalPostulaciones: "-" });
  const [ultimasOfertas, setUltimasOfertas] = useState([]);

  useEffect(() => {
    document.body.className = "dashboard-body";
    cargarDatosResumen();
  }, []);

  const cargarDatosResumen = async () => {
    try {
      // 1. Cargar Ofertas para sacar las 3 últimas
      const resOfertas = await fetch(`${API_BASE_URL}/api/ofertas`);
      if (resOfertas.ok) {
        const data = await resOfertas.json();
        const activas = data.filter((o) => o.estado === "Activo");
        setStats(prev => ({ ...prev, totalOfertas: data.length, ofertasActivas: activas.length }));
        // Guardamos solo las últimas 3 registradas
        setUltimasOfertas(data.slice(-3).reverse());
      }

      // 2. Cargar Estadísticas generales
      const resStats = await fetch(`${API_BASE_URL}/api/estadisticas`);
      if (resStats.ok) {
        const data = await resStats.json();
        setStats(prev => ({
          ...prev,
          totalPostulaciones: data.reporte?.transacciones_de_postulacion_realizadas ?? "-"
        }));
      }
    } catch (error) {
      console.error("Error al cargar resumen del dashboard:", error);
    }
  };

  return (
    <Container className="py-2">
      {/* BANNER DE BIENVENIDA */}
      <div className="bg-white p-4 rounded shadow-sm mb-4 border-start border-primary border-4">
        <span className="text-muted text-uppercase d-block" style={{ fontSize: "0.75rem" }}>Panel Principal</span>
        <h2 className="fw-bold text-dark">¡Bienvenido de vuelta, {estudiante.nombre}!</h2>
        <p className="text-secondary m-0">
          Este es tu centro de mando. Aquí tienes un resumen de las vacantes actuales y el estado de la plataforma.
        </p>
      </div>

      {/* FILA DE ESTADÍSTICAS (KPI CARDS EN BOOTSTRAP) */}
      <Row className="mb-4 g-3">
        <Col xs={12} md={4}>
          <Card className="text-white bg-primary shadow-sm h-100 border-0">
            <Card.Body className="d-flex flex-column justify-content-between p-4">
              <span className="text-white-50 text-uppercase fw-semibold" style={{ fontSize: "0.8rem" }}>Total Ofertas</span>
              <h1 className="display-4 fw-bold m-0 my-2">{stats.totalOfertas}</h1>
              <small className="text-white-50">Registradas globalmente</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="text-white bg-success shadow-sm h-100 border-0">
            <Card.Body className="d-flex flex-column justify-content-between p-4">
              <span className="text-white-50 text-uppercase fw-semibold" style={{ fontSize: "0.8rem" }}>Ofertas Activas</span>
              <h1 className="display-4 fw-bold m-0 my-2">{stats.ofertasActivas}</h1>
              <small className="text-white-50">Disponibles para postulación</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="text-white bg-dark shadow-sm h-100 border-0">
            <Card.Body className="d-flex flex-column justify-content-between p-4">
              <span className="text-white-50 text-uppercase fw-semibold" style={{ fontSize: "0.8rem" }}>Postulaciones de la App</span>
              <h1 className="display-4 fw-bold m-0 my-2">{stats.totalPostulaciones}</h1>
              <small className="text-white-50">Procesadas por el microservicio</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* SECCIÓN INFERIOR: ÚLTIMAS VACANTES Y ACCESOS RÁPIDOS */}
      <Row className="g-4">
        <Col xs={12} lg={8}>
          <Card className="shadow-sm border-0 bg-white">
            <Card.Header className="bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold m-0 text-dark">Últimas Ofertas Publicadas</h5>
              <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => alCambiarVista("bolsa")}>
                Ver todas →
              </Button>
            </Card.Header>
            <Card.Body className="p-4 pt-2">
              {ultimasOfertas.length === 0 ? (
                <p className="text-muted">Cargando últimas ofertas...</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {ultimasOfertas.map((oferta) => (
                    <div key={oferta.id} className="p-3 bg-light rounded border d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="fw-bold mb-1 text-dark">{oferta.titulo_puesto}</h6>
                        <p className="text-muted small m-0">{oferta.empresa_nombre} • {oferta.modalidad}</p>
                      </div>
                      <Badge bg={oferta.estado === "Activo" ? "success" : "secondary"}>
                        {oferta.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={4}>
          <Card className="shadow-sm border-0 bg-white h-100">
            <Card.Header className="bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold m-0 text-dark">Accesos Directos</h5>
            </Card.Header>
            <Card.Body className="p-4 pt-2 d-flex flex-column gap-2">
              <Button variant="outline-primary" className="text-start py-3" onClick={() => alCambiarVista("bolsa")}>
                🔍 Buscar Ofertas Laborales
              </Button>
              <Button variant="outline-success" className="text-start py-3" onClick={() => alCambiarVista("postulaciones")}>
                📝 Ver Estado de Postulaciones
              </Button>
              <Button variant="outline-dark" className="text-start py-3" onClick={() => alCambiarVista("perfil")}>
                👤 Completar mi Perfil / CV
              </Button>
              <Button variant="outline-secondary" className="text-start py-3" onClick={() => alCambiarVista("perfil-empresa")}>
                🏢 Registrar Perfil de Empresa
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};