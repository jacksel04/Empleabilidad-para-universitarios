import {
  useEffect,
  useState
} from "react";

import {
  Navbar,
  Nav,
  Container,
  Button
} from "react-bootstrap";

import { Login } from "./pages/Login.jsx";
import { LoginAdmin } from "./pages/LoginAdmin.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { BolsaTrabajo } from "./pages/BolsaTrabajo.jsx";
import { Perfil } from "./pages/Perfil.jsx";
import { Postulaciones } from "./pages/Postulaciones.jsx";
import { PerfilEmpresa } from "./pages/PerfilEmpresa.jsx";
import { PanelAdmin } from "./pages/PanelAdmin.jsx";

import "./styles.css";

const obtenerTipoLoginDesdeRuta = () => {
  return window.location.pathname ===
    "/admin/login"
    ? "admin"
    : "publico";
};

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

  const obtenerVistaInicial = () => {
    const path =
      window.location.pathname.replace(
        /^\/+/,
        ""
      );

    return vistasPermitidas.includes(path)
      ? path
      : "dashboard";
  };

  const [estudiante, setEstudiante] =
    useState(null);

  const [vistaActual, setVistaActual] =
    useState(obtenerVistaInicial);

  const [tipoLogin, setTipoLogin] =
    useState(obtenerTipoLoginDesdeRuta);

  const obtenerVistaPorRol = (usuario) => {
    if (usuario?.rol === "admin") {
      return "panel-admin";
    }

    if (usuario?.rol === "empresa") {
      return "perfil-empresa";
    }

    return "dashboard";
  };

  const vistaPermitidaParaUsuario = (
    usuario,
    vista
  ) => {
    if (usuario?.rol === "admin") {
      return vista === "panel-admin";
    }

    if (usuario?.rol === "empresa") {
      return vista === "perfil-empresa";
    }

    return vistasEstudiante.includes(vista);
  };

  const redirigirAVista = (
    nuevaVista,
    metodo = "replace"
  ) => {
    setVistaActual(nuevaVista);

    const estado = {
      vista: nuevaVista
    };

    const ruta = `/${nuevaVista}`;

    if (metodo === "push") {
      window.history.pushState(
        estado,
        "",
        ruta
      );
    } else {
      window.history.replaceState(
        estado,
        "",
        ruta
      );
    }
  };

  const redirigirALogin = (
    nuevoTipo,
    metodo = "push"
  ) => {
    const ruta =
      nuevoTipo === "admin"
        ? "/admin/login"
        : "/login";

    setTipoLogin(nuevoTipo);

    const estado = {
      login: nuevoTipo
    };

    if (metodo === "replace") {
      window.history.replaceState(
        estado,
        "",
        ruta
      );
    } else {
      window.history.pushState(
        estado,
        "",
        ruta
      );
    }

    document.body.className =
      "login-body";
  };

  useEffect(() => {
    const usuarioGuardado =
      localStorage.getItem("estudiante");

    if (usuarioGuardado) {
      try {
        const usuario =
          JSON.parse(usuarioGuardado);

        setEstudiante(usuario);

        document.body.className =
          "dashboard-body";

        const vistaInicial =
          obtenerVistaInicial();

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

        localStorage.removeItem(
          "estudiante"
        );

        setEstudiante(null);

        redirigirALogin(
          "publico",
          "replace"
        );
      }
    } else {
      const loginInicial =
        obtenerTipoLoginDesdeRuta();

      setTipoLogin(loginInicial);

      document.body.className =
        "login-body";

      const rutaEsperada =
        loginInicial === "admin"
          ? "/admin/login"
          : "/login";

      if (
        window.location.pathname !==
        rutaEsperada
      ) {
        window.history.replaceState(
          {
            login: loginInicial
          },
          "",
          rutaEsperada
        );
      }
    }

    const manejarBotonNavegador = (
      evento
    ) => {
      const usuarioAlmacenado =
        localStorage.getItem("estudiante");

      if (!usuarioAlmacenado) {
        const loginSolicitado =
          obtenerTipoLoginDesdeRuta();

        setTipoLogin(loginSolicitado);

        document.body.className =
          "login-body";

        return;
      }

      try {
        const usuario =
          JSON.parse(usuarioAlmacenado);

        const vistaSolicitada =
          evento.state?.vista ||
          obtenerVistaInicial();

        if (
          vistaPermitidaParaUsuario(
            usuario,
            vistaSolicitada
          )
        ) {
          setVistaActual(
            vistaSolicitada
          );
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

        localStorage.removeItem(
          "estudiante"
        );

        setEstudiante(null);

        redirigirALogin(
          "publico",
          "replace"
        );
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

  const navegarA = (nuevaVista) => {
    if (!estudiante) {
      redirigirALogin("publico");
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

    redirigirAVista(
      nuevaVista,
      "push"
    );
  };

  const actualizarUsuarioActual = (
    usuarioActualizado
  ) => {
    setEstudiante(usuarioActualizado);

    localStorage.setItem(
      "estudiante",
      JSON.stringify(usuarioActualizado)
    );
  };

  const handleLoginSuccess = (
    usuario
  ) => {
    setEstudiante(usuario);

    document.body.className =
      "dashboard-body";

    const vistaDestino =
      obtenerVistaPorRol(usuario);

    redirigirAVista(
      vistaDestino,
      "push"
    );
  };

  const handleLogout = () => {
    const eraAdministrador =
      estudiante?.rol === "admin";

    localStorage.removeItem(
      "estudiante"
    );

    setEstudiante(null);
    setVistaActual("dashboard");

    redirigirALogin(
      eraAdministrador
        ? "admin"
        : "publico"
    );
  };

  const abrirLoginAdmin = () => {
    redirigirALogin("admin");
  };

  const volverLoginPublico = () => {
    redirigirALogin("publico");
  };

  if (!estudiante) {
    if (tipoLogin === "admin") {
      return (
        <LoginAdmin
          onLoginSuccess={
            handleLoginSuccess
          }
          onVolver={
            volverLoginPublico
          }
        />
      );
    }

    return (
      <Login
        onLoginSuccess={
          handleLoginSuccess
        }
        onAdminAccess={
          abrirLoginAdmin
        }
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
    if (esAdmin) {
      return <PanelAdmin />;
    }

    if (esEmpresa) {
      return renderPerfilEmpresa();
    }

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

              navegarA(
                vistaPrincipal
              );
            }}
            className="d-flex align-items-center"
            style={{
              cursor: "pointer"
            }}
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
              {esEstudiante && (
                <>
                  <Nav.Link
                    active={
                      vistaActual ===
                      "dashboard"
                    }
                    onClick={(event) => {
                      event.preventDefault();

                      navegarA(
                        "dashboard"
                      );
                    }}
                  >
                    Inicio
                  </Nav.Link>

                  <Nav.Link
                    active={
                      vistaActual ===
                      "bolsa"
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

                      navegarA(
                        "postulaciones"
                      );
                    }}
                  >
                    Mis Postulaciones
                  </Nav.Link>

                  <Nav.Link
                    active={
                      vistaActual ===
                      "perfil"
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

              {esEmpresa && (
                <Nav.Link
                  active={
                    vistaActual ===
                    "perfil-empresa"
                  }
                  onClick={(event) => {
                    event.preventDefault();

                    navegarA(
                      "perfil-empresa"
                    );
                  }}
                >
                  Perfil Empresa
                </Nav.Link>
              )}

              {esAdmin && (
                <Nav.Link
                  active={
                    vistaActual ===
                    "panel-admin"
                  }
                  onClick={(event) => {
                    event.preventDefault();

                    navegarA(
                      "panel-admin"
                    );
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
              Cerrar sesión
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