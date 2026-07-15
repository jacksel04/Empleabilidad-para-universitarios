import { useEffect, useState } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

import { Login } from "./pages/Login.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { BolsaTrabajo } from "./pages/BolsaTrabajo.jsx";
import { Perfil } from "./pages/Perfil.jsx";
import { Postulaciones } from "./pages/Postulaciones.jsx";
import { PerfilEmpresa } from "./pages/PerfilEmpresa.jsx";
import { PanelAdmin } from "./pages/PanelAdmin.jsx";

import "./styles.css";

function App() {
  const vistasPermitidas = [
    "dashboard",
    "bolsa",
    "perfil",
    "postulaciones",
    "perfil-empresa",
    "panel-admin"
  ];

  const vistasEstudiante = [
    "dashboard",
    "bolsa",
    "perfil",
    "postulaciones"
  ];

  // Lee la URL actual para determinar la vista inicial.
  const obtenerVistaInicial = () => {
    const path = window.location.pathname.replace("/", "");

    return vistasPermitidas.includes(path)
      ? path
      : "dashboard";
  };

  /*
   * Se conserva el nombre "estudiante" para no romper el flujo existente.
   * Esta variable puede almacenar temporalmente estudiantes,
   * empresas o administradores.
   */
  const [estudiante, setEstudiante] = useState(null);
  const [vistaActual, setVistaActual] = useState(
    obtenerVistaInicial()
  );

  // Define la pantalla principal correspondiente a cada rol.
  const obtenerVistaPorRol = (usuario) => {
    if (usuario?.rol === "admin") {
      return "panel-admin";
    }

    if (usuario?.rol === "empresa") {
      return "perfil-empresa";
    }

    return "dashboard";
  };

  // Determina si un usuario puede acceder a una vista.
  const vistaPermitidaParaUsuario = (usuario, vista) => {
    if (usuario?.rol === "admin") {
      return vista === "panel-admin";
    }

    if (usuario?.rol === "empresa") {
      return vista === "perfil-empresa";
    }

    return vistasEstudiante.includes(vista);
  };

  // Cambia la vista y actualiza la URL.
  const redirigirAVista = (
    nuevaVista,
    metodo = "replace"
  ) => {
    setVistaActual(nuevaVista);

    const estado = { vista: nuevaVista };
    const ruta = `/${nuevaVista}`;

    if (metodo === "push") {
      window.history.pushState(estado, "", ruta);
    } else {
      window.history.replaceState(estado, "", ruta);
    }
  };

  useEffect(() => {
    const usuarioGuardado =
      localStorage.getItem("estudiante");

    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);

        setEstudiante(usuario);

        const vistaInicial = obtenerVistaInicial();

        if (
          vistaPermitidaParaUsuario(
            usuario,
            vistaInicial
          )
        ) {
          setVistaActual(vistaInicial);
        } else {
          redirigirAVista(
            obtenerVistaPorRol(usuario)
          );
        }
      } catch (error) {
        console.error(
          "Error al leer el usuario guardado:",
          error
        );

        localStorage.removeItem("estudiante");
        setEstudiante(null);
        setVistaActual("dashboard");
      }
    }

    // Controla los botones Atrás y Adelante del navegador.
    const manejarBotonNavegador = (evento) => {
      const usuarioAlmacenado =
        localStorage.getItem("estudiante");

      if (!usuarioAlmacenado) {
        setVistaActual("dashboard");
        return;
      }

      try {
        const usuario = JSON.parse(
          usuarioAlmacenado
        );

        const vistaSolicitada =
          evento.state?.vista ||
          obtenerVistaInicial();

        if (
          vistaPermitidaParaUsuario(
            usuario,
            vistaSolicitada
          )
        ) {
          setVistaActual(vistaSolicitada);
        } else {
          redirigirAVista(
            obtenerVistaPorRol(usuario)
          );
        }
      } catch (error) {
        console.error(
          "Error al validar la navegación:",
          error
        );

        localStorage.removeItem("estudiante");
        setEstudiante(null);
        setVistaActual("dashboard");
      }
    };

    window.addEventListener(
      "popstate",
      manejarBotonNavegador
    );

    return () => {
      window.removeEventListener(
        "popstate",
        manejarBotonNavegador
      );
    };
  }, []);

  // Navegación interna con validación por rol.
  const navegarA = (nuevaVista) => {
    if (!estudiante) {
      redirigirAVista("dashboard", "push");
      return;
    }

    if (
      !vistaPermitidaParaUsuario(
        estudiante,
        nuevaVista
      )
    ) {
      redirigirAVista(
        obtenerVistaPorRol(estudiante),
        "push"
      );
      return;
    }

    redirigirAVista(nuevaVista, "push");
  };

  // Permite actualizar los datos del usuario actual.
  const actualizarUsuarioActual = (
    usuarioActualizado
  ) => {
    setEstudiante(usuarioActualizado);

    localStorage.setItem(
      "estudiante",
      JSON.stringify(usuarioActualizado)
    );
  };

  // Redirección después del login según el rol.
  const handleLoginSuccess = (usuario) => {
    setEstudiante(usuario);

    const vistaDestino =
      obtenerVistaPorRol(usuario);

    redirigirAVista(
      vistaDestino,
      "push"
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("estudiante");

    setEstudiante(null);
    setVistaActual("dashboard");

    window.history.pushState(
      { vista: "login" },
      "",
      "/login"
    );

    document.body.className = "login-body";
  };

  if (!estudiante) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const esEmpresa =
    estudiante.rol === "empresa";

  const esAdmin =
    estudiante.rol === "admin";

  const esEstudiante =
    !esEmpresa && !esAdmin;

  const obtenerNombreRol = () => {
    if (esAdmin) {
      return "Administrador";
    }

    if (esEmpresa) {
      return "Empresa";
    }

    return "Estudiante";
  };

  const renderPerfilEmpresa = () => (
    <PerfilEmpresa
      estudiante={estudiante}
      alCambiarVista={navegarA}
      onActualizarUsuario={
        actualizarUsuarioActual
      }
    />
  );

  const renderVista = () => {
    // El administrador solo puede visualizar su panel.
    if (esAdmin) {
      return <PanelAdmin />;
    }

    // La empresa solo puede visualizar su perfil.
    if (esEmpresa) {
      return renderPerfilEmpresa();
    }

    // Flujo correspondiente al estudiante.
    switch (vistaActual) {
      case "dashboard":
        return (
          <Dashboard
            estudiante={estudiante}
            alCambiarVista={navegarA}
          />
        );

      case "bolsa":
        return (
          <BolsaTrabajo
            estudiante={estudiante}
            alCambiarVista={navegarA}
          />
        );

      case "perfil":
        return (
          <Perfil
            estudiante={estudiante}
            alCambiarVista={navegarA}
          />
        );

      case "postulaciones":
        return (
          <Postulaciones
            estudiante={estudiante}
            alCambiarVista={navegarA}
          />
        );

      default:
        return (
          <Dashboard
            estudiante={estudiante}
            alCambiarVista={navegarA}
          />
        );
    }
  };

  const vistaPrincipal = esAdmin
    ? "panel-admin"
    : esEmpresa
      ? "perfil-empresa"
      : "dashboard";

  return (
    <>
      <Navbar
        bg="dark"
        variant="dark"
        expand="lg"
        className="shadow-sm mb-4"
      >
        <Container>
          <Navbar.Brand
            href="#home"
            onClick={(event) => {
              event.preventDefault();
              navegarA(vistaPrincipal);
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
              style={{
                mixBlendMode: "lighten"
              }}
            />

            <span
              style={{
                fontSize: "0.95rem",
                fontWeight: "600"
              }}
            >
              Empleabilidad UNMSM
            </span>
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
          />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto ms-3">
              {/* MENÚ PARA ESTUDIANTE */}
              {esEstudiante && (
                <>
                  <Nav.Link
                    active={
                      vistaActual === "dashboard"
                    }
                    onClick={(event) => {
                      event.preventDefault();
                      navegarA("dashboard");
                    }}
                  >
                    Inicio
                  </Nav.Link>

                  <Nav.Link
                    active={
                      vistaActual === "bolsa"
                    }
                    onClick={(event) => {
                      event.preventDefault();
                      navegarA("bolsa");
                    }}
                  >
                    Bolsa de Trabajo
                  </Nav.Link>

                  <Nav.Link
                    active={
                      vistaActual ===
                      "postulaciones"
                    }
                    onClick={(event) => {
                      event.preventDefault();
                      navegarA("postulaciones");
                    }}
                  >
                    Mis Postulaciones
                  </Nav.Link>

                  <Nav.Link
                    active={
                      vistaActual === "perfil"
                    }
                    onClick={(event) => {
                      event.preventDefault();
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
                  active={
                    vistaActual ===
                    "perfil-empresa"
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    navegarA("perfil-empresa");
                  }}
                >
                  Perfil Empresa
                </Nav.Link>
              )}

              {/* MENÚ PARA ADMINISTRADOR */}
              {esAdmin && (
                <Nav.Link
                  active={
                    vistaActual ===
                    "panel-admin"
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    navegarA("panel-admin");
                  }}
                >
                  Panel Administrativo
                </Nav.Link>
              )}
            </Nav>

            <Navbar.Text
              className="me-3 text-light d-none d-md-inline"
              style={{
                fontSize: "0.85rem"
              }}
            >
              Conectado como:{" "}
              <strong>
                {estudiante.nombre}
              </strong>{" "}
              <span className="text-warning">
                ({obtenerNombreRol()})
              </span>
            </Navbar.Text>

            <Button
              variant="outline-light"
              size="sm"
              onClick={handleLogout}
            >
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