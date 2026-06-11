import { useState } from "react";
import { Container, Card, Row, Col, Badge, Button, Form, Alert, Spinner } from "react-bootstrap";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const Perfil = ({ estudiante }) => {
  // Estados para los campos editables
  const [telefono, setTelefono] = useState(estudiante.telefono || "");
  const [ciclo, setCiclo] = useState(estudiante.ciclo || "");
  const [archivoCV, setArchivoCV] = useState(null);
  
  // Estados de la interfaz
  const [cargando, setCargando] = useState(false);
  const [notificacion, setNotificacion] = useState({ texto: "", tipo: "" });

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      setNotificacion({ texto: "El archivo debe ser un PDF válido.", tipo: "danger" });
      setArchivoCV(null);
      e.target.value = null; // Resetea el input
    } else {
      setArchivoCV(file);
    }
  };

  const handleGuardarCambios = async () => {
    if (!estudiante || !estudiante.id) return;

    try {
      setCargando(true);
      setNotificacion({ texto: "", tipo: "" });

      // Usamos FormData porque estamos enviando un archivo PDF mezclado con texto
      const formData = new FormData();
      formData.append("id", estudiante.id);
      formData.append("telefono", telefono);
      formData.append("ciclo", ciclo);
      if (archivoCV) {
        formData.append("cv", archivoCV); // "cv" es el nombre que espera multer en el backend
      }

      const response = await fetch(`${API_BASE_URL}/api/estudiantes`, {
        method: "PUT",
        // OJO: Al usar FormData con fetch, NO se debe enviar el header 'Content-Type'. 
        // El navegador lo genera automáticamente con los boundaries correctos.
        body: formData
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error al actualizar el perfil.");

      setNotificacion({ texto: "¡Perfil y CV actualizados exitosamente!", tipo: "success" });
      setArchivoCV(null); // Limpiamos el archivo subido de la memoria visual

      // Opcional: Aquí podrías actualizar el objeto 'estudiante' global si manejas un contexto
      
    } catch (error) {
      setNotificacion({ texto: error.message, tipo: "danger" });
    } finally {
      setCargando(false);
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
          <Card className="shadow-sm border-0 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-4">Datos del Estudiante</h5>
            <Form>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridNombre">
                  <Form.Label className="fw-semibold text-secondary">Nombre Completo</Form.Label>
                  {/* Nombre y correo suelen estar bloqueados para no romper la identidad en BD */}
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

              {/* CAMPOS EDITABLES */}
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

              <Form.Group className="mb-4" controlId="formGridCV">
                <Form.Label className="fw-semibold text-secondary">Actualizar Curriculum Vitae (PDF)</Form.Label>
                <Form.Control type="file" accept=".pdf" onChange={handleArchivoChange} />
                <Form.Text className="text-muted d-block mt-2">
                  Sube tu CV actualizado. Este archivo será visible para las empresas en la bolsa de trabajo.
                </Form.Text>
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

              {/* Si ya tiene un CV subido anteriormente, le damos un botón para verlo */}
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
        </Col>

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
                <Badge bg="info" className="p-2 w-100">CV Cargado en Sistema</Badge>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};