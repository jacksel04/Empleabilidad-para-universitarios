import { useState, useEffect } from "react";
import { Container, Card, Row, Col, Badge, Button, Form, Alert, Spinner } from "react-bootstrap";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const formularioInicial = {
  nombre_empresa: "",
  ruc: "",
  sector: "",
  correo_contacto: "",
  telefono: "",
  descripcion: "",
  sitio_web: "",
  direccion: ""
};

export const PerfilEmpresa = () => {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [cargando, setCargando] = useState(false);
  const [notificacion, setNotificacion] = useState({ texto: "", tipo: "" });
  const [empresaRegistrada, setEmpresaRegistrada] = useState(null);

  useEffect(() => {
  document.body.className = "dashboard-body";
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const handleGuardarEmpresa = async () => {
    try {
      setCargando(true);
      setNotificacion({ texto: "", tipo: "" });

      if (!formulario.nombre_empresa || formulario.nombre_empresa.length < 3) {
        throw new Error("El nombre de la empresa debe tener al menos 3 caracteres.");
      }

      if (formulario.ruc && !/^[0-9]{11}$/.test(formulario.ruc)) {
        throw new Error("El RUC debe contener exactamente 11 dígitos.");
      }

      if (formulario.telefono && !/^[0-9]{9}$/.test(formulario.telefono)) {
        throw new Error("El teléfono debe contener exactamente 9 dígitos.");
      }

      const response = await fetch(`${API_BASE_URL}/api/empresas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formulario)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar el perfil de empresa.");
      }

      setEmpresaRegistrada(data.empresa);
      setFormulario(formularioInicial);
      setNotificacion({
        texto: "¡Perfil de empresa registrado correctamente!",
        tipo: "success"
      });

    } catch (error) {
      setNotificacion({ texto: error.message, tipo: "danger" });
    } finally {
      setCargando(false);
    }
  };

  const nombreVista = formulario.nombre_empresa || empresaRegistrada?.nombre_empresa || "Empresa Reclutadora";
  const sectorVista = formulario.sector || empresaRegistrada?.sector || "Sector empresarial";

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Perfil de Empresa</h3>
        <p className="text-muted">
          Registra la información institucional de una empresa reclutadora dentro de la plataforma.
        </p>
      </div>

      {notificacion.texto && (
        <Alert
          variant={notificacion.tipo}
          dismissible
          onClose={() => setNotificacion({ texto: "", tipo: "" })}
        >
          {notificacion.texto}
        </Alert>
      )}

      <Row className="g-4">
        <Col xs={12} lg={8}>
          <Card className="shadow-sm border-0 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-4">Datos de la Empresa</h5>

            <Form>
              <Row className="mb-3 g-3">
                <Form.Group as={Col} xs={12} md={8}>
                  <Form.Label className="fw-semibold text-secondary">
                    Nombre de Empresa
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre_empresa"
                    value={formulario.nombre_empresa}
                    onChange={handleChange}
                    placeholder="Ej. Soluciones Digitales Lima"
                  />
                </Form.Group>

                <Form.Group as={Col} xs={12} md={4}>
                  <Form.Label className="fw-semibold text-secondary">
                    RUC
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="ruc"
                    value={formulario.ruc}
                    onChange={handleChange}
                    placeholder="11 dígitos"
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3 g-3">
                <Form.Group as={Col} xs={12} md={6}>
                  <Form.Label className="fw-semibold text-secondary">
                    Sector
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="sector"
                    value={formulario.sector}
                    onChange={handleChange}
                    placeholder="Ej. Tecnología"
                  />
                </Form.Group>

                <Form.Group as={Col} xs={12} md={6}>
                  <Form.Label className="fw-semibold text-secondary">
                    Correo de Contacto
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="correo_contacto"
                    value={formulario.correo_contacto}
                    onChange={handleChange}
                    placeholder="contacto@empresa.pe"
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3 g-3">
                <Form.Group as={Col} xs={12} md={6}>
                  <Form.Label className="fw-semibold text-secondary">
                    Teléfono
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="telefono"
                    value={formulario.telefono}
                    onChange={handleChange}
                    placeholder="987654321"
                  />
                </Form.Group>

                <Form.Group as={Col} xs={12} md={6}>
                  <Form.Label className="fw-semibold text-secondary">
                    Sitio Web
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="sitio_web"
                    value={formulario.sitio_web}
                    onChange={handleChange}
                    placeholder="https://empresa.pe"
                  />
                </Form.Group>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-secondary">
                  Dirección
                </Form.Label>
                <Form.Control
                  type="text"
                  name="direccion"
                  value={formulario.direccion}
                  onChange={handleChange}
                  placeholder="Lima, Perú"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-secondary">
                  Descripción
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={handleChange}
                  placeholder="Describe brevemente la empresa y el tipo de oportunidades que ofrece."
                />
              </Form.Group>

              <Button
                variant="primary"
                type="button"
                onClick={handleGuardarEmpresa}
                disabled={cargando}
              >
                {cargando ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Guardando...
                  </>
                ) : (
                  "Guardar Perfil de Empresa"
                )}
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={12} lg={4}>
          <Card className="shadow-sm border-0 p-4 bg-light text-center h-100">
            <div
              className="bg-dark rounded-circle mx-auto d-flex align-items-center justify-content-center text-white fw-bold mb-3 shadow"
              style={{ width: "90px", height: "90px", fontSize: "2.5rem" }}
            >
              {nombreVista.charAt(0).toUpperCase()}
            </div>

            <h5 className="fw-bold text-dark m-0">
              {nombreVista}
            </h5>

            <p className="text-muted mb-3">
              {sectorVista}
            </p>

            <Badge bg="warning" className="p-2 mb-2 w-100">
              Estado: Pendiente de Verificación
            </Badge>

            {empresaRegistrada && (
              <Badge bg="success" className="p-2 w-100">
                Empresa registrada con ID: {empresaRegistrada.id}
              </Badge>
            )}

            <hr />

            <p className="text-muted small mb-0">
              Este módulo servirá para asociar empresas con ofertas laborales y procesos de selección.
            </p>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};