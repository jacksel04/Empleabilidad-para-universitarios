import { useState, useEffect } from "react";
import { Container, Card, Table, Badge, Spinner, Alert, Button } from "react-bootstrap";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const Postulaciones = ({ estudiante }) => {
  const [postulaciones, setPostulaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  // --- NUEVO: Estado para saber si la IA está analizando ---
  const [ordenandoIA, setOrdenandoIA] = useState(false);
  const esEmpresa = estudiante?.rol === "empresa";
  useEffect(() => {
    // Al montar el componente, cargamos los datos
    if (estudiante && estudiante.id) {
      cargarMisPostulaciones();
    }
  }, [estudiante]);

  const cargarMisPostulaciones = async () => {
    try {
      setCargando(true);
      // Si es empresa, debería llamar a un endpoint diferente que devuelva a sus postulantes.
      // Aquí asumo que tu API maneja la misma ruta o que la ajustarás según tu Backend.
      const endpoint = esEmpresa 
        ? `${API_BASE_URL}/api/empresa/${estudiante.id}/postulantes` 
        : `${API_BASE_URL}/api/postulaciones/${estudiante.id}`;

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error("No se pudo obtener la información.");
      }
      
      const data = await response.json();
      setPostulaciones(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // --- Función para que la Empresa ordene candidatos con IA ---
  const ordenarCandidatosIA = async () => {
    try {
      setOrdenandoIA(true);
      setError(null);

      // Aquí conectaremos con el Microservicio IA (Lo programaremos más adelante)
      const response = await fetch(`${API_BASE_URL}/api/ia/match-postulantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresa_id: estudiante.id, postulantes: postulaciones })
      });

      if (!response.ok) throw new Error("Error al analizar candidatos con IA.");

      const dataOrdenada = await response.json();
      setPostulaciones(dataOrdenada);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setOrdenandoIA(false);
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
        <h3 className="fw-bold text-dark">
          {esEmpresa ? "Gestión de Postulantes" : "Mis Postulaciones"}
        </h3>
        <p className="text-muted">
          {esEmpresa 
            ? "Revisa y analiza a los candidatos que han aplicado a tus ofertas." 
            : "Monitorea en tiempo real el progreso de tus aplicaciones laborales."}
        </p>
      </div>

      <Card className="shadow-sm border-0 bg-white">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark m-0">
              {esEmpresa ? "Lista de Candidatos" : "Historial de Aplicaciones"}
            </h5>

            {/* --- NUEVO: Botón de IA exclusivo para Empresas --- */}
            {esEmpresa && postulaciones.length > 0 && (
              <Button 
                variant="success" 
                onClick={ordenarCandidatosIA}
                disabled={ordenandoIA || cargando}
                className="fw-bold"
              >
                {ordenandoIA ? (
                  <><Spinner as="span" animation="border" size="sm" className="me-2"/> Analizando compatibilidad...</>
                ) : (
                  "🤖 Filtrar mejores candidatos"
                )}
              </Button>
            )}
            {/* -------------------------------------------------- */}
          </div>
          
          {cargando && (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-2">Cargando datos...</p>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {!cargando && !error && postulaciones.length === 0 && (
            <Alert variant="info" className="text-center border-0 shadow-sm">
              {esEmpresa 
                ? "Aún no tienes postulantes para tus vacantes." 
                : "Aún no tienes postulaciones registradas. ¡Visita la Bolsa de Trabajo para empezar!"}
            </Alert>
          )}

          {!cargando && !error && postulaciones.length > 0 && (
            <Table responsive striped bordered hover className="m-0 align-middle">
              <thead className="table-dark">
                <tr>
                  <th># ID</th>
                  {/* --- NUEVO: Cabeceras dinámicas según el Rol --- */}
                  {esEmpresa ? (
                    <>
                      <th>Candidato</th>
                      <th>Puesto Aplicado</th>
                      <th>Match IA</th>
                    </>
                  ) : (
                    <>
                      <th>Puesto Laboral</th>
                      <th>Empresa</th>
                    </>
                  )}
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {postulaciones.map((post) => (
                  <tr key={post.id}>
                    <td><strong>{post.id}</strong></td>
                    
                    {/* --- NUEVO: Celdas dinámicas según el Rol --- */}
                    {esEmpresa ? (
                      <>
                        <td>{post.estudiante_nombre || "Candidato"}</td>
                        <td>{post.ofertas?.titulo_puesto || "No disponible"}</td>
                        <td>
                          {post.match_ia ? (
                            <Badge bg="success" className="p-2">{post.match_ia}%</Badge>
                          ) : (
                            <span className="text-muted small">Sin calcular</span>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{post.ofertas?.titulo_puesto || "No disponible"}</td>
                        <td>{post.ofertas?.empresa_nombre || "No disponible"}</td>
                      </>
                    )}

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