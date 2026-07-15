import { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000";

export const LoginAdmin = ({
  onLoginSuccess,
  onVolver
}) => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [errors, setErrors] = useState({
    correo: "",
    password: ""
  });

  const [isLoading, setIsLoading] =
    useState(false);

  const [isSuccess, setIsSuccess] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const correoLimpio =
      correo.trim().toLowerCase();

    const passwordLimpia = password.trim();

    const nuevosErrores = {
      correo: "",
      password: ""
    };

    let formularioValido = true;

    if (!correoLimpio) {
      nuevosErrores.correo =
        "Ingrese el correo administrativo.";

      formularioValido = false;
    }

    if (!passwordLimpia) {
      nuevosErrores.password =
        "Ingrese la contraseña administrativa.";

      formularioValido = false;
    }

    setErrors(nuevosErrores);

    if (!formularioValido) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/administradores/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            correo: correoLimpio,
            password: passwordLimpia
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          correo:
            data.error ||
            "Las credenciales administrativas son incorrectas.",
          password: ""
        });

        setIsLoading(false);
        return;
      }

      const administrador =
        data.administrador;

      const usuarioAdmin = {
        id: administrador.id,
        nombre: administrador.nombre,
        correo: administrador.correo,
        estado: administrador.estado,
        rol: "admin"
      };

      localStorage.setItem(
        "estudiante",
        JSON.stringify(usuarioAdmin)
      );

      setIsSuccess(true);
      document.body.className =
        "dashboard-body";

      setTimeout(() => {
        onLoginSuccess(usuarioAdmin);
      }, 900);
    } catch (error) {
      console.error(
        "Error en el login administrativo:",
        error
      );

      setErrors({
        correo:
          "No se pudo conectar con el servidor.",
        password: ""
      });

      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="hero-content">
          <img
            src="/logo-unmsm-blanco.png"
            alt="Escudo de la Universidad Nacional Mayor de San Marcos"
            className="unmsm-logo"
          />

          <h1>
            Administración de Empleabilidad UNMSM
          </h1>

          <p>
            Espacio reservado para la supervisión
            de indicadores, usuarios, empresas,
            ofertas laborales y postulaciones
            registradas en la plataforma.
          </p>

          <div className="hero-summary">
            <span>Indicadores operativos</span>
            <span>Supervisión de la plataforma</span>
            <span>Acceso restringido</span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="card-accent"></div>

          <div className="login-header">
            <div className="logo">
              <svg
                width="52"
                height="52"
                viewBox="0 0 52 52"
                fill="none"
              >
                <circle
                  cx="26"
                  cy="26"
                  r="26"
                  fill="url(#adminGradient)"
                />

                <path
                  d="M17 24V20C17 15.03 21.03 11 26 11C30.97 11 35 15.03 35 20V24"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <rect
                  x="14"
                  y="23"
                  width="24"
                  height="18"
                  rx="3"
                  fill="white"
                />

                <circle
                  cx="26"
                  cy="31"
                  r="2.5"
                  fill="#1E3A8A"
                />

                <path
                  d="M26 33.5V37"
                  stroke="#1E3A8A"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <defs>
                  <linearGradient
                    id="adminGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#18324F"
                    />

                    <stop
                      offset="100%"
                      stopColor="#287F7A"
                    />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h2>Acceso administrativo</h2>

            <p>
              Ingrese las credenciales asignadas
              al administrador de la plataforma
            </p>
          </div>

          {!isSuccess ? (
            <>
              <form
                className="login-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div
                  className={`form-field ${
                    errors.correo ? "error" : ""
                  }`}
                >
                  <input
                    type="email"
                    id="correoAdmin"
                    name="correoAdmin"
                    required
                    autoComplete="username"
                    placeholder=" "
                    value={correo}
                    onChange={(event) =>
                      setCorreo(event.target.value)
                    }
                    disabled={isLoading}
                  />

                  <label htmlFor="correoAdmin">
                    Correo administrativo
                  </label>

                  <div className="field-line"></div>

                  <span
                    className={`error-message ${
                      errors.correo ? "show" : ""
                    }`}
                  >
                    {errors.correo}
                  </span>
                </div>

                <div
                  className={`form-field ${
                    errors.password
                      ? "error"
                      : ""
                  }`}
                >
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    id="passwordAdmin"
                    name="passwordAdmin"
                    required
                    autoComplete="current-password"
                    placeholder=" "
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    disabled={isLoading}
                  />

                  <label htmlFor="passwordAdmin">
                    Contraseña administrativa
                  </label>

                  <button
                    type="button"
                    className={`password-reveal ${
                      showPassword
                        ? "reveal-active"
                        : ""
                    }`}
                    aria-label={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword
                      ? "Ocultar"
                      : "Ver"}
                  </button>

                  <div className="field-line"></div>

                  <span
                    className={`error-message ${
                      errors.password
                        ? "show"
                        : ""
                    }`}
                  >
                    {errors.password}
                  </span>
                </div>

                <button
                  type="submit"
                  className={`signin-button ${
                    isLoading ? "loading" : ""
                  }`}
                  disabled={isLoading}
                >
                  <span className="button-text">
                    Iniciar Sesión
                  </span>

                  <div className="button-loader">
                    <div className="loader-circle"></div>
                  </div>
                </button>
              </form>

              <div className="login-note">
                <p>
                  Este acceso está reservado para
                  personal autorizado. Las cuentas
                  administrativas no pueden
                  registrarse desde la plataforma.
                </p>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  textAlign: "center"
                }}
              >
                <button
                  type="button"
                  onClick={onVolver}
                  disabled={isLoading}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#1E3A8A",
                    fontWeight: "600",
                    cursor: "pointer",
                    textDecoration: "underline"
                  }}
                >
                  Volver al acceso principal
                </button>
              </div>
            </>
          ) : (
            <div className="success-state show">
              <div className="success-visual">
                <svg
                  width="42"
                  height="42"
                  viewBox="0 0 42 42"
                  fill="none"
                >
                  <circle
                    cx="21"
                    cy="21"
                    r="21"
                    fill="url(#adminSuccessGradient)"
                  />

                  <path
                    d="M13 21L18.5 26.5L29 16"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <defs>
                    <linearGradient
                      id="adminSuccessGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor="#287F7A"
                      />

                      <stop
                        offset="100%"
                        stopColor="#18324F"
                      />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <h3>
                Inicio de sesión exitoso
              </h3>

              <p>
                Redirigiendo al Panel
                Administrativo...
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};