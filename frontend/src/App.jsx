import { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Login } from "./pages/Login.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { BolsaTrabajo } from "./pages/BolsaTrabajo.jsx";
import { Perfil } from "./pages/Perfil.jsx";
import { Postulaciones } from "./pages/Postulaciones.jsx";
import { PerfilEmpresa } from "./pages/PerfilEmpresa.jsx";
import "./styles.css";

function App() {
  // Lee la URL actual para saber en qué vista iniciar
  const obtenerVistaInicial = () => {
    const path = window.location.pathname.replace("/", "");

    return ["dashboard", "bolsa", "perfil", "postulaciones", "perfil-empresa"].includes(path)
      ? path
      : "dashboard";
  };

  const [estudiante, setEstudiante] = useState(null);
  const [vistaActual, setVistaActual] = useState(obtenerVistaInicial());

  useEffect(() => {
    const estudianteGuardado = localStorage.getItem("estudiante");

    if (estudianteGuardado) {
      const usuario = JSON.parse(estudianteGuardado);
      setEstudiante(usuario);

      // Si el usuario guardado es empresa y está en una vista de estudiante,
      // lo enviamos automáticamente al perfil de empresa.
      const vistasEstudiante = ["dashboard", "bolsa", "perfil", "postulaciones"];

      if (usuario.rol === "empresa" && vistasEstudiante.includes(obtenerVistaInicial())) {
        setVistaActual("perfil-empresa");
        window.history.replaceState({ vista: "perfil-empresa" }, "", "/perfil-empresa");
      }
    }

    // Escucha los botones Atrás / Adelante del navegador
    const manejarBotonNavegador = (evento) => {
      if (evento.state && evento.state.vista) {
        setVistaActual(evento.state.vista);
      } else {
        setVistaActual(obtenerVistaInicial());
      }
    };

    window.addEventListener("popstate", manejarBotonNavegador);

    return () => window.removeEventListener("popstate", manejarBotonNavegador);
  }, []);

  // Cambia de vista y actualiza la URL
  const navegarA = (nuevaVista) => {
    setVistaActual(nuevaVista);
    window.history.pushState({ vista: nuevaVista }, "", `/${nuevaVista}`);
  };

  // Inicio de sesión con redirección según rol
  const handleLoginSuccess = (datosEstudiante) => {
    setEstudiante(datosEstudiante);

    if (datosEstudiante.rol === "empresa") {
      navegarA("perfil-empresa");
    } else {
      navegarA("dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("estudiante");
    setEstudiante(null);
    navegarA("login");
    document.body.className = "login-body";
  };

  if (!estudiante) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const esEmpresa = estudiante.rol === "empresa";

  const renderVista = () => {
    // Seguridad básica del frontend:
    // si una empresa intenta entrar a rutas de estudiante, se le muestra Perfil Empresa.
    if (esEmpresa && vistaActual !== "perfil-empresa") {
      return <PerfilEmpresa estudiante={estudiante} alCambiarVista={navegarA} />;
    }

    switch (vistaActual) {
      case "dashboard":
        return <Dashboard estudiante={estudiante} alCambiarVista={navegarA} />;

      case "bolsa":
        return <BolsaTrabajo estudiante={estudiante} alCambiarVista={navegarA} />;

      case "perfil":
        return <Perfil estudiante={estudiante} alCambiarVista={navegarA} />;

      case "perfil-empresa":
        return <PerfilEmpresa estudiante={estudiante} alCambiarVista={navegarA} />;

      case "postulaciones":
        return <Postulaciones estudiante={estudiante} alCambiarVista={navegarA} />;

      default:
        return esEmpresa
          ? <PerfilEmpresa estudiante={estudiante} alCambiarVista={navegarA} />
          : <Dashboard estudiante={estudiante} alCambiarVista={navegarA} />;
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm mb-4">
        <Container>
          <Navbar.Brand
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              navegarA(esEmpresa ? "perfil-empresa" : "dashboard");
            }}
            className="d-flex align-items-center"
            style={{ cursor: "pointer" }}
          >
            <img
              src="/logo-unmsm-blanco.png"
              width="35"
              height="35"
              className="d-inline-block align-top me-2"
              alt="UNMSM Logo"
              style={{ mixBlendMode: "lighten" }}
            />

            <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>
              Empleabilidad UNMSM
            </span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto ms-3">
              {/* MENÚ PARA ESTUDIANTE */}
              {!esEmpresa && (
                <>
                  <Nav.Link
                    active={vistaActual === "dashboard"}
                    onClick={(e) => {
                      e.preventDefault();
                      navegarA("dashboard");
                    }}
                  >
                    Inicio
                  </Nav.Link>

                  <Nav.Link
                    active={vistaActual === "bolsa"}
                    onClick={(e) => {
                      e.preventDefault();
                      navegarA("bolsa");
                    }}
                  >
                    Bolsa de Trabajo
                  </Nav.Link>

                  <Nav.Link
                    active={vistaActual === "postulaciones"}
                    onClick={(e) => {
                      e.preventDefault();
                      navegarA("postulaciones");
                    }}
                  >
                    Mis Postulaciones
                  </Nav.Link>

                  <Nav.Link
                    active={vistaActual === "perfil"}
                    onClick={(e) => {
                      e.preventDefault();
                      navegarA("perfil");
                    }}
                  >
                    Mi Perfil
                  </Nav.Link>
                </>
              )}

              {/* MENÚ PARA EMPRESA */}
              {esEmpresa && (
                <Nav.Link
                  active={vistaActual === "perfil-empresa"}
                  onClick={(e) => {
                    e.preventDefault();
                    navegarA("perfil-empresa");
                  }}
                >
                  Perfil Empresa
                </Nav.Link>
              )}
            </Nav>

            <Navbar.Text
              className="me-3 text-light d-none d-md-inline"
              style={{ fontSize: "0.85rem" }}
            >
              Conectado como: <strong>{estudiante.nombre}</strong>
              {" "}
              <span className="text-warning">
                ({esEmpresa ? "Empresa" : "Estudiante"})
              </span>
            </Navbar.Text>

            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="container-dinamico">
        {renderVista()}
      </div>
    </>
  );
}

export default App;