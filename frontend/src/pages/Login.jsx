import { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000";

export const Login = ({
  onLoginSuccess,
  onAdminAccess
}) => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] =
    useState("");

  const [remember, setRemember] =
    useState(false);

  const [rol, setRol] =
    useState("estudiante");

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
        rol === "estudiante"
          ? "Ingrese su correo institucional."
          : "Ingrese el correo de contacto de la empresa.";

      formularioValido = false;
    }

    if (
      rol === "estudiante" &&
      correoLimpio &&
      !correoLimpio.endsWith(
        "@unmsm.edu.pe"
      )
    ) {
      nuevosErrores.correo =
        "Debe usar un correo @unmsm.edu.pe.";

      formularioValido = false;
    }

    if (!passwordLimpia) {
      nuevosErrores.password =
        rol === "estudiante"
          ? "Ingrese su contraseña."
          : "Ingrese la contraseña de la empresa.";

      formularioValido = false;
    }

    setErrors(nuevosErrores);

    if (!formularioValido) {
      return;
    }

    try {
      setIsLoading(true);

      if (rol === "estudiante") {
        // 1. Apuntamos a la nueva ruta usando POST y enviando solo las credenciales
        const response = await fetch(
          `${API_BASE_URL}/api/estudiantes/login`,
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
            correo: data.error || "El correo no se encuentra registrado o la contraseña es incorrecta.",
            password: ""
          });

          setIsLoading(false);
          return;
        }

        const usuarioConRol = {
          ...estudianteEncontrado,
          rol: "estudiante"
        };

        localStorage.setItem(
          "estudiante",
          JSON.stringify(usuarioConRol)
        );

        setIsSuccess(true);

        document.body.className =
          "dashboard-body";

        setTimeout(() => {
          onLoginSuccess(usuarioConRol);
        }, 900);

        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/empresas/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            correo_contacto:
              correoLimpio,
            password: passwordLimpia
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          correo:
            data.error ||
            "La empresa no se encuentra registrada o la contraseña es incorrecta.",
          password: ""
        });

        setIsLoading(false);
        return;
      }

      const empresa = data.empresa;

      const usuarioEmpresa = {
        id: empresa.id,
        nombre: empresa.nombre_empresa,
        correo: empresa.correo_contacto,
        rol: "empresa",
        empresa
      };

      localStorage.setItem(
        "estudiante",
        JSON.stringify(usuarioEmpresa)
      );

      setIsSuccess(true);

      document.body.className =
        "dashboard-body";

      setTimeout(() => {
        onLoginSuccess(usuarioEmpresa);
      }, 900);
    } catch (error) {
      console.error(
        "Error durante el login:",
        error
      );

      setErrors({
        correo:
          "Error al conectar con la API.",
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
            Plataforma de Empleabilidad UNMSM
          </h1>

          <p>
            Conecta estudiantes, egresados y
            empresas con oportunidades laborales,
            permitiendo consultar ofertas,
            postular y gestionar procesos desde
            una plataforma web.
          </p>

          <div className="hero-summary">
            <span>Acceso académico</span>
            <span>Empresas reclutadoras</span>
            <span>Postulación en línea</span>
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
                  fill="url(#gradient)"
                />

                <path
                  d="M16 28L26 16L36 28H31V36H21V28H16Z"
                  fill="white"
                />

                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#1E3A8A"
                    />

                    <stop
                      offset="100%"
                      stopColor="#4ECDC4"
                    />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h2>Iniciar sesión</h2>

            <p>
              {rol === "estudiante"
                ? "Acceso para estudiantes y egresados"
                : "Acceso para empresas reclutadoras"}
            </p>
          </div>

          {!isSuccess ? (
            <>
              <form
                className="login-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="form-field">
                  <select
                    id="rol"
                    name="rol"
                    value={rol}
                    onChange={(event) => {
                      setRol(
                        event.target.value
                      );

                      setCorreo("");
                      setPassword("");

                      setErrors({
                        correo: "",
                        password: ""
                      });
                    }}
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border:
                        "1px solid #ddd",
                      backgroundColor: "white",
                      fontSize: "0.95rem"
                    }}
                  >
                    <option value="estudiante">
                      Estudiante / Egresado
                    </option>

                    <option value="empresa">
                      Empresa Reclutadora
                    </option>
                  </select>
                </div>

                <div
                  className={`form-field ${
                    errors.correo
                      ? "error"
                      : ""
                  }`}
                >
                  <input
                    type="email"
                    id="correo"
                    name="correo"
                    required
                    autoComplete="email"
                    placeholder=" "
                    value={correo}
                    onChange={(event) =>
                      setCorreo(
                        event.target.value
                      )
                    }
                    disabled={isLoading}
                  />

                  <label htmlFor="correo">
                    {rol === "estudiante"
                      ? "Correo institucional"
                      : "Correo de empresa"}
                  </label>

                  <div className="field-line"></div>

                  <span
                    className={`error-message ${
                      errors.correo
                        ? "show"
                        : ""
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
                    id="password"
                    name="password"
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

                  <label htmlFor="password">
                    {rol === "estudiante"
                      ? "Contraseña"
                      : "Contraseña de empresa"}
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

                <div className="form-actions">
                  <label className="remember-checkbox">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) =>
                        setRemember(
                          event.target.checked
                        )
                      }
                    />

                    <span className="checkbox-custom"></span>

                    <span className="checkbox-label">
                      Recordarme
                    </span>
                  </label>

                  <a
                    href="#"
                    className="forgot-password"
                    onClick={(event) =>
                      event.preventDefault()
                    }
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <button
                  type="submit"
                  className={`signin-button ${
                    isLoading ? "loading" : ""
                  }`}
                  disabled={isLoading}
                >
                  <span className="button-text">
                    Iniciar sesión
                  </span>

                  <div className="button-loader">
                    <div className="loader-circle"></div>
                  </div>
                </button>
              </form>

              <div className="login-note">
                <p>
                  {rol === "estudiante"
                    ? "Ingresa con un correo institucional registrado en la plataforma."
                    : "Ingresa con el correo de contacto y la contraseña de la empresa."}
                  {" "}
                  Esta versión corresponde a un
                  prototipo académico conectado a
                  API y Supabase.
                </p>
              </div>

              <div className="signup-prompt">
                <span>
                  ¿Aún no tienes perfil?  
                </span>

                <a
                  href="#"
                  className="signup-link"
                  onClick={(event) =>
                    event.preventDefault()
                  }
                >
                  Solicita tu registro 
                </a>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  paddingTop: "16px",
                  borderTop:
                    "1px solid #E5E7EB",
                  textAlign: "center"
                }}
              >
                <button
                  type="button"
                  onClick={onAdminAccess}
                  disabled={isLoading}
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    color: "#475569",
                    fontSize: "0.86rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    textDecoration:
                      "underline"
                  }}
                >
                  Acceso administrativo
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
                    fill="url(#successGradient)"
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
                      id="successGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor="#4ECDC4"
                      />

                      <stop
                        offset="100%"
                        stopColor="#1E3A8A"
                      />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <h3>
                Inicio de sesión exitoso
              </h3>

              <p>
                {rol === "estudiante"
                  ? "Redirigiendo al panel principal..."
                  : "Redirigiendo al perfil de empresa..."}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};