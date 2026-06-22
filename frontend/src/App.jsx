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
  // 1. Leemos la URL actual para saber en qué pestaña empezar si el usuario recarga la página
  const obtenerVistaInicial = () => {
    const path = window.location.pathname.replace("/", "");
    return ["dashboard", "bolsa", "perfil", "postulaciones", "perfil-empresa"].includes(path) ? path : "dashboard";
  };

  const [estudiante, setEstudiante] = useState(null);
  const [vistaActual, setVistaActual] = useState(obtenerVistaInicial());

  useEffect(() => {
    const estudianteGuardado = localStorage.getItem("estudiante");
    if (estudianteGuardado) {
      setEstudiante(JSON.parse(estudianteGuardado));
    }

    // Escuchamos cuando el usuario presiona el botón "Atrás" o "Adelante" del navegador
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

  // Función para cambiar de pestaña y actualizar la URL al mismo tiempo
  const navegarA = (nuevaVista) => {
    setVistaActual(nuevaVista);
    // Agrega la nueva página al historial del navegador sin recargar
    window.history.pushState({ vista: nuevaVista }, "", `/${nuevaVista}`);
  };

  const handleLoginSuccess = (datosEstudiante) => {
    setEstudiante(datosEstudiante);
    navegarA("dashboard"); 
  };

  const handleLogout = () => {
    localStorage.removeItem("estudiante");
    setEstudiante(null);
    navegarA("login"); // Regresa la URL al inicio
    document.body.className = "login-body";
  };

  if (!estudiante) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderVista = () => {
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
        return <Dashboard estudiante={estudiante} alCambiarVista={navegarA} />;
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm mb-4">
        <Container>
          {/* Al hacer clic en el logo, te lleva al menú principal (Dashboard) */}
          <Navbar.Brand 
            href="#home" 
            onClick={(e) => { e.preventDefault(); navegarA("dashboard"); }} 
            className="d-flex align-items-center"
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/logo-unmsm-blanco.png"
              width="35"
              height="35"
              className="d-inline-block align-top me-2"
              alt="UNMSM Logo"
              style={{ mixBlendMode: "lighten" }}
            />
            <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>Empleabilidad UNMSM</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto ms-3">
              <Nav.Link active={vistaActual === "dashboard"} onClick={(e) => { e.preventDefault(); navegarA("dashboard"); }}>
                Inicio
              </Nav.Link>
              <Nav.Link active={vistaActual === "bolsa"} onClick={(e) => { e.preventDefault(); navegarA("bolsa"); }}>
                Bolsa de Trabajo
              </Nav.Link>
              <Nav.Link active={vistaActual === "postulaciones"} onClick={(e) => { e.preventDefault(); navegarA("postulaciones"); }}>
                Mis Postulaciones
              </Nav.Link>
              <Nav.Link active={vistaActual === "perfil"} onClick={(e) => { e.preventDefault(); navegarA("perfil"); }}>
                Mi Perfil
              </Nav.Link>
              <Nav.Link active={vistaActual === "perfil-empresa"} onClick={(e) => { e.preventDefault(); navegarA("perfil-empresa"); }}>
                Perfil Empresa
              </Nav.Link>
            </Nav>
            
            <Navbar.Text className="me-3 text-light d-none d-md-inline" style={{ fontSize: "0.85rem" }}>
              Conectado como: <strong>{estudiante.nombre}</strong>
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