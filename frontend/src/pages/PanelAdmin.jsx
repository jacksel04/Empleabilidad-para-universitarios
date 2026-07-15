import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Row,
  Spinner
} from "react-bootstrap";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const PALETA = {
  azul: "#234A78",
  azulOscuro: "#18324F",
  turquesa: "#287F7A",
  dorado: "#B5853F",
  rojo: "#A95656",
  gris: "#667085",
  texto: "#27364A",
  fondo: "#F4F6F8",
  borde: "#DDE3EA",
  blanco: "#FFFFFF"
};

const COLORES_GRAFICOS = [
  PALETA.azul,
  PALETA.turquesa,
  PALETA.dorado,
  PALETA.rojo,
  PALETA.gris
];

const estiloCard = {
  border: `1px solid ${PALETA.borde}`,
  borderRadius: "10px",
  backgroundColor: PALETA.blanco,
  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)"
};

const TarjetaResumen = ({
  titulo,
  valor,
  descripcion,
  color = PALETA.azul
}) => {
  return (
    <Col xs={12} sm={6} xl={4}>
      <Card
        className="h-100"
        style={{
          ...estiloCard,
          borderTop: `4px solid ${color}`
        }}
      >
        <Card.Body className="px-4 py-3">
          <p
            className="mb-1"
            style={{
              color: PALETA.gris,
              fontSize: "0.9rem",
              fontWeight: "500"
            }}
          >
            {titulo}
          </p>

          <h2
            className="mb-1"
            style={{
              color: PALETA.azulOscuro,
              fontSize: "1.8rem",
              fontWeight: "700"
            }}
          >
            {valor ?? 0}
          </h2>

          <small style={{ color: PALETA.gris }}>
            {descripcion}
          </small>
        </Card.Body>
      </Card>
    </Col>
  );
};

const GraficoBarras = ({
  titulo,
  datos,
  color = PALETA.azul
}) => {
  return (
    <Card className="h-100" style={estiloCard}>
      <Card.Body className="p-4">
        <Card.Title
          className="mb-3"
          style={{
            color: PALETA.texto,
            fontSize: "1rem",
            fontWeight: "600"
          }}
        >
          {titulo}
        </Card.Title>

        {datos?.length ? (
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datos}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 5
                }}
                barCategoryGap="28%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E9EF"
                  vertical={false}
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{
                    fontSize: 11,
                    fill: PALETA.gris
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  type="category"
                  dataKey="categoria"
                  width={175}
                  tick={{
                    fontSize: 11,
                    fill: PALETA.gris
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  formatter={(valor) => [valor, "Cantidad"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: `1px solid ${PALETA.borde}`,
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)"
                  }}
                />

                <Bar
                  dataKey="total"
                  name="Cantidad"
                  fill={color}
                  radius={[0, 6, 6, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Alert variant="secondary" className="mb-0">
            No hay información disponible.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

const GraficoCircular = ({
  titulo,
  datos
}) => {
  return (
    <Card className="h-100" style={estiloCard}>
      <Card.Body className="p-4">
        <Card.Title
          className="mb-3"
          style={{
            color: PALETA.texto,
            fontSize: "1rem",
            fontWeight: "600"
          }}
        >
          {titulo}
        </Card.Title>

        {datos?.length ? (
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datos}
                  dataKey="total"
                  nameKey="categoria"
                  cx="50%"
                  cy="45%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  label={false}
                  labelLine={false}
                >
                  {datos.map((item, index) => (
                    <Cell
                      key={`${item.categoria}-${index}`}
                      fill={
                        COLORES_GRAFICOS[
                          index % COLORES_GRAFICOS.length
                        ]
                      }
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(valor, nombre) => [valor, nombre]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: `1px solid ${PALETA.borde}`,
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)"
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "0.82rem",
                    color: PALETA.gris,
                    paddingTop: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Alert variant="secondary" className="mb-0">
            No hay información disponible.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export const PanelAdmin = () => {
  const [estadisticas, setEstadisticas] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const cargarEstadisticas = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/estadisticas`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detalle ||
          data.error ||
          "No se pudieron cargar las estadísticas."
        );
      }

      setEstadisticas(data);
    } catch (errorConsulta) {
      console.error(
        "Error al cargar el Panel Administrativo:",
        errorConsulta
      );

      setError(
        errorConsulta.message ||
        "No se pudo conectar con el Servicio BI."
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner
          animation="border"
          role="status"
          style={{ color: PALETA.azul }}
        />

        <p className="mt-3 mb-0">
          Cargando indicadores administrativos...
        </p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>
            No se pudo cargar el panel
          </Alert.Heading>

          <p>{error}</p>

          <Button
            variant="outline-danger"
            onClick={cargarEstadisticas}
          >
            Reintentar
          </Button>
        </Alert>
      </Container>
    );
  }

  const resumen =
    estadisticas?.resumen || {};

  const graficos =
    estadisticas?.graficos || {};

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        backgroundColor: PALETA.fondo,
        padding: "28px 18px 48px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1240px",
          margin: "0 auto"
        }}
      >
        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
          style={{
            backgroundColor: PALETA.blanco,
            border: `1px solid ${PALETA.borde}`,
            borderRadius: "10px",
            padding: "20px 22px",
            borderLeft: `5px solid ${PALETA.azul}`,
            boxShadow:
              "0 2px 8px rgba(15, 23, 42, 0.04)"
          }}
        >
          <div>
            <h1
              className="mb-1"
              style={{
                color: PALETA.azulOscuro,
                fontSize: "1.55rem",
                fontWeight: "700"
              }}
            >
              Panel Administrativo
            </h1>

            <p
              className="mb-0"
              style={{
                color: PALETA.gris,
                fontSize: "0.92rem"
              }}
            >
              Indicadores generales de estudiantes,
              empresas, ofertas y postulaciones.
            </p>
          </div>

          <Button
            variant="outline-primary"
            onClick={cargarEstadisticas}
            style={{
              color: PALETA.azul,
              borderColor: PALETA.azul,
              borderRadius: "7px",
              padding: "8px 15px",
              fontWeight: "500"
            }}
          >
            Actualizar indicadores
          </Button>
        </div>

        <h2
          className="mb-3"
          style={{
            color: PALETA.texto,
            fontSize: "1rem",
            fontWeight: "600"
          }}
        >
          Resumen general
        </h2>

        <Row className="g-3 mb-4">
          <TarjetaResumen
            titulo="Estudiantes registrados"
            valor={resumen.total_estudiantes}
            descripcion={`${resumen.estudiantes_verificados || 0} perfiles verificados`}
            color={PALETA.azul}
          />

          <TarjetaResumen
            titulo="Empresas registradas"
            valor={resumen.total_empresas}
            descripcion="Organizaciones registradas"
            color={PALETA.turquesa}
          />

          <TarjetaResumen
            titulo="Ofertas laborales"
            valor={resumen.total_ofertas}
            descripcion={`${resumen.ofertas_activas || 0} ofertas activas`}
            color={PALETA.dorado}
          />

          <TarjetaResumen
            titulo="Ofertas activas"
            valor={resumen.ofertas_activas}
            descripcion="Disponibles para postulación"
            color={PALETA.azul}
          />

          <TarjetaResumen
            titulo="Postulaciones"
            valor={resumen.total_postulaciones}
            descripcion="Solicitudes registradas"
            color={PALETA.turquesa}
          />

          <TarjetaResumen
            titulo="Perfiles verificados"
            valor={resumen.estudiantes_verificados}
            descripcion="Estudiantes validados"
            color={PALETA.dorado}
          />
        </Row>

        <h2
          className="mb-3"
          style={{
            color: PALETA.texto,
            fontSize: "1rem",
            fontWeight: "600"
          }}
        >
          Indicadores de ofertas
        </h2>

        <Row className="g-4 mb-4">
          <Col xs={12} lg={6}>
            <GraficoBarras
              titulo="Ofertas por estado"
              datos={graficos.ofertas_por_estado}
              color={PALETA.azul}
            />
          </Col>

          <Col xs={12} lg={6}>
            <GraficoCircular
              titulo="Ofertas por modalidad"
              datos={graficos.ofertas_por_modalidad}
            />
          </Col>
        </Row>

        <h2
          className="mb-3"
          style={{
            color: PALETA.texto,
            fontSize: "1rem",
            fontWeight: "600"
          }}
        >
          Indicadores de seguimiento
        </h2>

        <Row className="g-4 mb-4">
          <Col xs={12} lg={6}>
            <GraficoBarras
              titulo="Postulaciones por estado"
              datos={
                graficos.postulaciones_por_estado
              }
              color={PALETA.turquesa}
            />
          </Col>

          <Col xs={12} lg={6}>
            <GraficoCircular
              titulo="Empresas por verificación"
              datos={
                graficos.empresas_por_verificacion
              }
            />
          </Col>
        </Row>

        <Row className="g-4">
          <Col xs={12}>
            <GraficoBarras
              titulo="Estudiantes por carrera"
              datos={
                graficos.estudiantes_por_carrera
              }
              color={PALETA.azul}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};