import { Container, Card, Table, Badge } from "react-bootstrap";

export const Postulaciones = ({ estudiante }) => {
  // Simulamos un historial conectado al microservicio de postulaciones RDS
  const postulacionesSimuladas = [
    { id: 1, puesto: "Desarrollador Frontend Junior", empresa: "Interbank", fecha: "24/05/2026", estado: "En Revisión", variante: "warning" },
    { id: 2, puesto: "Practicante de Sistemas", empresa: "Alicorp", fecha: "10/05/2026", estado: "Aceptado", variante: "success" }
  ];

  // ¡Asegúrate de que este 'return' esté presente, es lo que dibuja la pantalla!
  return (
    <Container className="py-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Mis Postulaciones</h3>
        <p className="text-muted">Monitorea en tiempo real el progreso de tus aplicaciones laborales.</p>
      </div>

      <Card className="shadow-sm border-0 bg-white">
        <Card.Body className="p-4">
          <h5 className="fw-bold text-dark mb-3">Historial de Aplicaciones</h5>
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
              {postulacionesSimuladas.map((post) => (
                <tr key={post.id}>
                  <td><strong>00{post.id}</strong></td>
                  <td>{post.puesto}</td>
                  <td>{post.empresa}</td>
                  <td>{post.fecha}</td>
                  <td>
                    <Badge bg={post.variante} className="p-2 text-dark">
                      {post.estado}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};