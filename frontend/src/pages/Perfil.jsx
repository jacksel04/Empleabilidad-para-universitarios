import { Container, Card, Row, Col, Badge, Button, Form, Alert } from "react-bootstrap";

export const Perfil = ({ estudiante }) => {
  return (
    <Container className="py-2">
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Mi Perfil Académico</h3>
        <p className="text-muted">Gestiona tu información personal y carga tu CV para los reclutadores.</p>
      </div>

      <Row className="g-4">
        <Col xs={12} lg={8}>
          <Card className="shadow-sm border-0 p-4 bg-white">
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
                  <Form.Label className="fw-semibold text-secondary">Código Universitario</Form.Label>
                  <Form.Control type="text" placeholder="Ej. 20200145" defaultValue={estudiante.id ? `ID-${estudiante.id}` : ""} disabled />
                </Form.Group>
              </Row>

              <Form.Group className="mb-4" controlId="formGridCV">
                <Form.Label className="fw-semibold text-secondary">Curriculum Vitae (PDF)</Form.Label>
                <Form.Control type="file" accept=".pdf" />
                <Form.Text className="text-muted">
                  Sube tu CV actualizado. Este archivo se guardará en el bucket de Amazon S3.
                </Form.Text>
              </Form.Group>

              <Button variant="primary" type="button" disabled>
                Guardar Cambios
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={12} lg={4}>
          <Card className="shadow-sm border-0 p-4 bg-light text-center">
            <div className="bg-secondary rounded-circle mx-auto d-flex align-items-center justify-content-center text-white fw-bold mb-3" style={{ width: "80px", height: "80px", fontSize: "2rem" }}>
              {estudiante.nombre?.charAt(0)}
            </div>
            <h6 className="fw-bold text-dark m-0">{estudiante.nombre}</h6>
            <p className="text-muted small mb-3">Estudiante / Egresado UNMSM</p>
            <Badge bg="info" className="p-2 text-dark">Perfil Regular</Badge>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};