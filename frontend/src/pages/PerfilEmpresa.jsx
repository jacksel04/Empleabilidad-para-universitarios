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
  direccion: "",
  password: "",
  confirmar_password: ""
};

export const PerfilEmpresa = ({ estudiante }) => {
  const empresaLogueada = estudiante?.rol === "empresa" ? estudiante.empresa : null;

  const [formulario, setFormulario] = useState(formularioInicial);
  const [cargando, setCargando] = useState(false);
  const [notificacion, setNotificacion] = useState({ texto: "", tipo: "" });
  const [empresaActual, setEmpresaActual] = useState(empresaLogueada);

  useEffect(() => {
    document.body.className = "dashboard-body";

    if (empresaLogueada) {
      setEmpresaActual(empresaLogueada);

      setFormulario({
        nombre_empresa: empresaLogueada.nombre_empresa || "",
        ruc: empresaLogueada.ruc || "",
        sector: empresaLogueada.sector || "",
        correo_contacto: empresaLogueada.correo_contacto || "",
        telefono: empresaLogueada.telefono || "",
        descripcion: empresaLogueada.descripcion || "",
        sitio_web: empresaLogueada.sitio_web || "",
        direccion: empresaLogueada.direccion || "",
        password: "",
        confirmar_password: ""
      });
    }
  }, [empresaLogueada]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const validarFormulario = () => {
    if (!empresaLogueada?.id) {
      throw new Error("No se encontró una empresa logueada para actualizar.");
    }

    if (!formulario.nombre_empresa || formulario.nombre_empresa.trim().length < 3) {
      throw new Error("El nombre de la empresa debe tener al menos 3 caracteres.");
    }

    if (!formulario.correo_contacto || !formulario.correo_contacto.trim()) {
      throw new Error("El correo de contacto es obligatorio.");
    }

    if (formulario.ruc && !/^[0-9]{11}$/.test(formulario.ruc)) {
      throw new Error("El RUC debe contener exactamente 11 dígitos.");
    }

    if (formulario.telefono && !/^[0-9]{9}$/.test(formulario.telefono)) {
      throw new Error("El teléfono debe contener exactamente 9 dígitos.");
    }

    if (formulario.password || formulario.confirmar_password) {
      if (formulario.password.length < 6) {
        throw new Error("La nueva contraseña debe tener al menos 6 caracteres.");
      }

      if (formulario.password !== formulario.confirmar_password) {
        throw new Error("Las contraseñas no coinciden.");
      }
    }
  };

  const construirDatosEmpresa = () => {
    const datosEmpresa = {
      nombre_empresa: formulario.nombre_empresa,
      ruc: formulario.ruc,
      sector: formulario.sector,
      correo_contacto: formulario.correo_contacto,
      telefono: formulario.telefono,
      descripcion: formulario.descripcion,
      sitio_web: formulario.sitio_web,
      direccion: formulario.direccion,
      estado_verificacion: empresaActual?.estado_verificacion || "Pendiente"
    };

    // Solo se envía password si la empresa realmente desea cambiarlo.
    if (formulario.password) {
      datosEmpresa.password = formulario.password;
    }

    return datosEmpresa;
  };

  const actualizarLocalStorage = (empresaActualizada) => {
    const usuarioActual = JSON.parse(localStorage.getItem("estudiante"));

    const usuarioActualizado = {
      ...usuarioActual,
      nombre: empresaActualizada.nombre_empresa,
      correo: empresaActualizada.correo_contacto,
      rol: "empresa",
      empresa: empresaActualizada
    };

    localStorage.setItem("estudiante", JSON.stringify(usuarioActualizado));
  };

  const handleActualizarEmpresa = async () => {
    try {
      setCargando(true);
      setNotificacion({ texto: "", tipo: "" });

      validarFormulario();

      const datosEmpresa = construirDatosEmpresa();

      const response = await fetch(`${API_BASE_URL}/api/empresas/${empresaLogueada.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosEmpresa)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el perfil de empresa.");
      }

      const empresaActualizada = data.empresa;

      setEmpresaActual(empresaActualizada);

      setFormulario({
        nombre_empresa: empresaActualizada.nombre_empresa || "",
        ruc: empresaActualizada.ruc || "",
        sector: empresaActualizada.sector || "",
        correo_contacto: empresaActualizada.correo_contacto || "",
        telefono: empresaActualizada.telefono || "",
        descripcion: empresaActualizada.descripcion || "",
        sitio_web: empresaActualizada.sitio_web || "",
        direccion: empresaActualizada.direccion || "",
        password: "",
        confirmar_password: ""
      });

      actualizarLocalStorage(empresaActualizada);

      setNotificacion({
        texto: "¡Perfil de empresa actualizado correctamente!",
        tipo: "success"
      });

    } catch (error) {
      setNotificacion({ texto: error.message, tipo: "danger" });
    } finally {
      setCargando(false);
    }
  };

  if (!empresaLogueada) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          Este módulo está disponible solo para empresas que hayan iniciado sesión.
        </Alert>
      </Container>
    );
  }

  const nombreVista = formulario.nombre_empresa || empresaActual?.nombre_empresa || "Empresa Reclutadora";
  const sectorVista = formulario.sector || empresaActual?.sector || "Sector empresarial";
  const estadoVista = empresaActual?.estado_verificacion || "Pendiente";

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Mi Perfil Empresarial</h3>
        <p className="text-muted">
          Gestiona la información institucional visible para estudiantes y egresados.
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
            <h5 className="fw-bold text-dark mb-4">Datos Actuales de la Empresa</h5>

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

              <h6 className="fw-bold text-dark mb-2">Cambio de Contraseña</h6>

              <p className="text-muted small mb-3">
                Deja estos campos vacíos si no deseas cambiar la contraseña actual.
              </p>

              <Row className="mb-4 g-3">
                <Form.Group as={Col} xs={12} md={6}>
                  <Form.Label className="fw-semibold text-secondary">
                    Nueva Contraseña
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formulario.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                  />
                </Form.Group>

                <Form.Group as={Col} xs={12} md={6}>
                  <Form.Label className="fw-semibold text-secondary">
                    Confirmar Nueva Contraseña
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmar_password"
                    value={formulario.confirmar_password}
                    onChange={handleChange}
                    placeholder="Repita la contraseña"
                  />
                </Form.Group>
              </Row>

              <Button
                variant="primary"
                type="button"
                onClick={handleActualizarEmpresa}
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
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Perfil de Empresa"
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

            <Badge
              bg={estadoVista === "Verificada" ? "success" : "warning"}
              className="p-2 mb-2 w-100"
            >
              Estado: {estadoVista}
            </Badge>

            <Badge bg="secondary" className="p-2 w-100">
              ID Empresa: {empresaLogueada.id}
            </Badge>

            <hr />

            <p className="text-muted small mb-0">
              Este módulo permite mantener actualizado el perfil institucional de la empresa
              para su participación en ofertas laborales y procesos de selección.
            </p>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};