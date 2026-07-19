import { useState } from "react";
import { Container, Card, Row, Col, Badge, Button, Form, Alert, Spinner, ListGroup } from "react-bootstrap";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const Perfil = ({ estudiante, onActualizarUsuario }) => {
  // Estados para los campos editables
  const [telefono, setTelefono] = useState(estudiante.telefono || "");
  const [ciclo, setCiclo] = useState(estudiante.ciclo || "");
  const [carrera, setCarrera] = useState(estudiante.carrera || "");
  const [archivoCV, setArchivoCV] = useState(null);
  
  // Estado para habilidades
  const [habilidades, setHabilidades] = useState(estudiante.habilidades || ""); 
  const [interesesLaborales, setInteresesLaborales] = useState(estudiante.intereses_laborales || "");
  
  // Estados de la interfaz
  const [cargando, setCargando] = useState(false);
  const [notificacion, setNotificacion] = useState({ texto: "", tipo: "" });

  // --- NUEVO: ESTADOS PARA LA BRÚJULA IA ---
  const [cargandoIA, setCargandoIA] = useState(false);
  const [brujulaData, setBrujulaData] = useState(null);
  const [errorIA, setErrorIA] = useState("");

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      setNotificacion({ texto: "El archivo debe ser un PDF válido.", tipo: "danger" });
      setArchivoCV(null);
      e.target.value = null; 
    } else {
      setArchivoCV(file);
    }
  };

  const handleGuardarCambios = async () => {
    if (!estudiante || !estudiante.id) return;

    try {
      setCargando(true);
      setNotificacion({ texto: "", tipo: "" });

      const formData = new FormData();
      formData.append("id", estudiante.id);
      formData.append("telefono", telefono);
      formData.append("ciclo", ciclo);
      formData.append("carrera", carrera);
      formData.append("habilidades", habilidades);
      formData.append("intereses_laborales", interesesLaborales);
      if (archivoCV) {
        formData.append("cv", archivoCV);
      }

      const response = await fetch(`${API_BASE_URL}/api/estudiantes`, {
        method: "PUT",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error al actualizar el perfil.");
      if (onActualizarUsuario) {
        onActualizarUsuario({
          ...estudiante,
          telefono: telefono,
          ciclo: ciclo,
          carrera: carrera,
          habilidades: habilidades,
          intereses_laborales: interesesLaborales
        });
      }
      setNotificacion({ texto: "¡Perfil y CV actualizados exitosamente!", tipo: "success" });
      setArchivoCV(null); 
      
    } catch (error) {
      setNotificacion({ texto: error.message, tipo: "danger" });
    } finally {
      setCargando(false);
    }
  };

  // --- NUEVO: FUNCIÓN PARA LLAMAR AL SERVICIO DE IA ---
  const handleAnalisisIA = async () => {
    if (!estudiante.carrera) {
      setErrorIA("Tu perfil debe tener una carrera asignada para realizar el análisis de mercado.");
      return;
    }

    try {
      setCargandoIA(true);
      setErrorIA("");
      
      const response = await fetch(`https://servicio-ia-empleabilidad.onrender.com/api/ia/brujula`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrera: estudiante.carrera,
          habilidades_estudiante: habilidades // Le mandamos lo que tenga escrito, incluso si es poco
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error al conectar con la IA.");

      setBrujulaData(data);

    } catch (error) {
      setErrorIA(error.message);
    } finally {
      setCargandoIA(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Mi Perfil Académico</h3>
        <p className="text-muted">Gestiona tu información personal y carga tu CV para los reclutadores.</p>
      </div>

      {notificacion.texto && (
        <Alert variant={notificacion.tipo} dismissible onClose={() => setNotificacion({ texto: "", tipo: "" })}>
          {notificacion.texto}
        </Alert>
      )}

      <Row className="g-4">
        <Col xs={12} lg={8}>
          {/* TARJETA 1: DATOS DEL ESTUDIANTE */}
          <Card className="shadow-sm border-0 p-4 bg-white mb-4">
            <h5 className="fw-bold text-dark mb-4">Datos del Estudiante</h5>
            <Form>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridNombre">
                  <Form.Label className="fw-semibold text-secondary">Nombre Completo</Form.Label>
                  <Form.Control type="text" defaultValue={estudiante.nombre} disabled />
                </Form.Group>
              </Row>

              <Row className="mb-3 g-3">
                <Form.Group as={Col} xs={12} md={6} controlId="formGridCorreo">
                  <Form.Label className="fw-semibold text-secondary">Correo Institucional</Form.Label>
                  <Form.Control type="email" defaultValue={estudiante.correo} disabled />
                </Form.Group>

                <Form.Group as={Col} xs={12} md={6} controlId="formGridCodigo">
                  <Form.Label className="fw-semibold text-secondary">ID Universitario</Form.Label>
                  <Form.Control type="text" defaultValue={estudiante.id ? `00${estudiante.id}` : ""} disabled />
                </Form.Group>
              </Row>

              <Row className="mb-4 g-3">
                <Form.Group as={Col} xs={12} md={6} controlId="formGridTelefono">
                  <Form.Label className="fw-semibold text-secondary">Teléfono</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={telefono} 
                    onChange={(e) => setTelefono(e.target.value)} 
                    placeholder="Ej. 987654321" 
                  />
                </Form.Group>

                <Form.Group as={Col} xs={12} md={6} controlId="formGridCiclo">
                  <Form.Label className="fw-semibold text-secondary">Ciclo Actual</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="1" max="10"
                    value={ciclo} 
                    onChange={(e) => setCiclo(e.target.value)} 
                  />
                </Form.Group>
              </Row>

              <Form.Group className="mb-4" controlId="formGridCarrera">
                <Form.Label className="fw-semibold text-secondary">Carrera Profesional</Form.Label>
                <Form.Control 
                  type="text" 
                  value={carrera} 
                  onChange={(e) => setCarrera(e.target.value)} 
                  placeholder="Ej: Ingeniería de Sistemas, Administración..." 
                />
              </Form.Group>
              
              <Form.Group className="mb-4" controlId="formGridHabilidades">
                <Form.Label className="fw-semibold text-secondary">Mis Habilidades Técnicas</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2} 
                  value={habilidades} 
                  onChange={(e) => setHabilidades(e.target.value)} 
                  placeholder="Ej: Java, React, SQL, Metodologías Ágiles" 
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formGridIntereses">
                <Form.Label className="fw-semibold text-secondary">Mis Intereses Laborales</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2} 
                  value={interesesLaborales} 
                  onChange={(e) => setInteresesLaborales(e.target.value)} 
                  placeholder="Ej: Desarrollo Backend, Ciencia de Datos, Gestión de Proyectos" 
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formGridCV">
                <Form.Label className="fw-semibold text-secondary">Actualizar Curriculum Vitae (PDF)</Form.Label>
                <Form.Control type="file" accept=".pdf" onChange={handleArchivoChange} />
              </Form.Group>

              <Button 
                variant="primary" 
                type="button" 
                onClick={handleGuardarCambios}
                disabled={cargando}
              >
                {cargando ? (
                  <><Spinner as="span" animation="border" size="sm" className="me-2" /> Guardando...</>
                ) : "Guardar Cambios"}
              </Button>

              {estudiante.cv_url && (
                <Button 
                  variant="outline-secondary" 
                  className="ms-3" 
                  href={estudiante.cv_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  📄 Ver mi CV actual
                </Button>
              )}
            </Form>
          </Card>

          {/* --- NUEVO: SECCIÓN BRÚJULA IA --- */}
          <Card className="shadow-sm border-0 p-4 bg-white border-top border-primary border-4">
            <div className="d-flex align-items-center mb-3">
              <span style={{ fontSize: "2rem", marginRight: "15px" }}>🤖</span>
              <div>
                <h5 className="fw-bold text-dark mb-0">Brújula del Mercado Estudiantil</h5>
                <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>Nuestra IA analiza las ofertas actuales de tu carrera y te recomienda qué aprender.</p>
              </div>
            </div>

            <Button 
              variant="dark" 
              onClick={handleAnalisisIA}
              disabled={cargandoIA}
              className="w-100 mb-4 fw-bold"
            >
              {cargandoIA ? (
                <><Spinner as="span" animation="border" size="sm" className="me-2" /> Analizando mercado en tiempo real...</>
              ) : "✨ Descubrir qué tecnologías me faltan"}
            </Button>

            {errorIA && <Alert variant="danger">{errorIA}</Alert>}

            {brujulaData && (
              <div className="bg-light p-4 rounded border">
                {brujulaData.top_faltante && brujulaData.top_faltante.length > 0 ? (
                  <>
                    <h6 className="fw-bold text-primary mb-3">Tecnologías más demandadas que aún no registras:</h6>
                    <ListGroup horizontal className="mb-4 justify-content-center">
                      {brujulaData.top_faltante.map((tech, index) => (
                        <ListGroup.Item key={index} className="bg-white fw-bold shadow-sm rounded mx-1 text-uppercase">
                          {tech}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </>
                ) : null}
                
                <h6 className="fw-bold text-dark">Consejo de tu Asesor IA:</h6>
                <p className="fst-italic text-secondary mb-0">"{brujulaData.mensaje}"</p>
              </div>
            )}
          </Card>
        </Col>

        {/* COLUMNA DERECHA: RESUMEN DE PERFIL */}
        <Col xs={12} lg={4}>
          <Card className="shadow-sm border-0 p-4 bg-light text-center h-100">
            <div className="bg-primary rounded-circle mx-auto d-flex align-items-center justify-content-center text-white fw-bold mb-3 shadow" style={{ width: "90px", height: "90px", fontSize: "2.5rem" }}>
              {estudiante.nombre?.charAt(0).toUpperCase()}
            </div>
            <h5 className="fw-bold text-dark m-0">{estudiante.nombre}</h5>
            <p className="text-muted mb-3">{estudiante.carrera || "Estudiante UNMSM"}</p>
            <div>
              <Badge bg={estudiante.perfil_verificado ? "success" : "warning"} className="p-2 mb-2 w-100">
                {estudiante.perfil_verificado ? "✓ Cuenta Verificada" : "Pendiente de Verificación"}
              </Badge>
              {estudiante.cv_url && (
                <Badge bg="info" className="p-2 mb-2 w-100">CV Cargado en Sistema</Badge>
              )}
              {(estudiante.habilidades && estudiante.intereses_laborales) && (
                <Badge bg="primary" className="p-2 w-100">🤖 Perfil IA Optimizado</Badge>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};