import { useState, useEffect } from "react";
import { Container, Card, Table, Badge, Spinner, Alert } from "react-bootstrap";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const Postulaciones = ({ estudiante }) => {
  const [postulaciones, setPostulaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Al montar el componente, cargamos los datos
    if (estudiante && estudiante.id) {
      cargarMisPostulaciones();
    }
  }, [estudiante]);

  const cargarMisPostulaciones = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${API_BASE_URL}/api/postulaciones/${estudiante.id}`);
      
      if (!response.ok) {
        throw new Error("No se pudo obtener el historial de postulaciones.");
      }
      
      const data = await response.json();
      setPostulaciones(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Función para determinar el color de la etiqueta según el estado en BD
  const obtenerColorBadge = (estado) => {
    const est = estado ? estado.toLowerCase() : 'pendiente';
    if (est.includes('pendiente') || est.includes('revisión')) return 'warning';
    if (est.includes('aceptado') || est.includes('contratado')) return 'success';
    if (est.includes('rechazado')) return 'danger';
    if (est.includes('proceso')) return 'info';
    return 'secondary';
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Mis Postulaciones</h3>
        <p className="text-muted">Monitorea en tiempo real el progreso de tus aplicaciones laborales.</p>
      </div>

      <Card className="shadow-sm border-0 bg-white">
        <Card.Body className="p-4">
          <h5 className="fw-bold text-dark mb-3">Historial de Aplicaciones</h5>
          
          {cargando && (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-2">Cargando tu historial...</p>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {!cargando && !error && postulaciones.length === 0 && (
            <Alert variant="info" className="text-center border-0 shadow-sm">
              Aún no tienes postulaciones registradas. ¡Visita la Bolsa de Trabajo para empezar!
            </Alert>
          )}

          {!cargando && !error && postulaciones.length > 0 && (
            <Table responsive striped bordered hover className="m-0 align-middle">
              <thead className="table-dark">
                <tr>
                  <th># ID</th>
                  <th>Puesto Laboral</th>
                  <th>Empresa</th>
                  <th>Fecha de Aplicación</th>
                  <th>Estado del Proceso</th>
                </tr>
              </thead>
              <tbody>
                {postulaciones.map((post) => (
                  <tr key={post.id}>
                    <td><strong>{post.id}</strong></td>
                    {/* Accedemos al objeto anidado 'ofertas' que trajo Supabase */}
                    <td>{post.ofertas?.titulo_puesto || "No disponible"}</td>
                    <td>{post.ofertas?.empresa_nombre || "No disponible"}</td>
                    <td>
                      {post.fecha_postulacion 
                        ? new Date(post.fecha_postulacion).toLocaleDateString() 
                        : new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Badge bg={obtenerColorBadge(post.estado_evaluacion)} className="p-2 text-dark">
                        {post.estado_evaluacion}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};