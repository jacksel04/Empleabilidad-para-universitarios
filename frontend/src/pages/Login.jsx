import { useState } from 'react';

const API_BASE_URL = "https://empleabilidad-para-universitarios.onrender.com";

// 1. AQUÍ AGREGAMOS { onLoginSuccess } PARA RECIBIRLO DESDE APP.JSX
export const Login = ({ onLoginSuccess }) => {
  // Estados para controlar los inputs
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  
  // Estados para controlar la interfaz (cargas, errores, visibilidad)
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ correo: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({ correo: '', password: '' });

    let isValid = true;
    let newErrors = { correo: '', password: '' };

    // Validaciones idénticas a tu app.js original
    if (!correo.trim()) {
      newErrors.correo = "Ingrese su correo institucional.";
      isValid = false;
    } else if (!correo.trim().endsWith("@unmsm.edu.pe")) {
      newErrors.correo = "Debe usar un correo @unmsm.edu.pe.";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Ingrese su contraseña.";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/estudiantes`);

      if (!response.ok) {
        throw new Error("No se pudo obtener la lista de estudiantes.");
      }

      const estudiantes = await response.json();
      
      const estudiante = estudiantes.find(
        (item) => item.correo?.toLowerCase() === correo.trim().toLowerCase() && item.password === password.trim()
      );

      if (!estudiante) {
        setErrors({ ...newErrors, correo: "El correo no se encuentra registrado o la contraseña es incorrecta." });
        setIsLoading(false);
        return;
      }

      // Éxito
      localStorage.setItem("estudiante", JSON.stringify(estudiante));
      setIsSuccess(true);
      
      // 2. AQUÍ CAMBIAMOS LA CLASE DEL BODY Y EJECUTAMOS ONLOGINSUCCESS
      document.body.className = "dashboard-body";
      
      setTimeout(() => {
        // En lugar de window.location.href, usamos la función de React
        onLoginSuccess(estudiante);
      }, 1200);

    } catch (error) {
      setErrors({ ...newErrors, correo: "Error al conectar con la API." });
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className="login-page">
        
        {/* --- LADO IZQUIERDO: HERO --- */}
        <section className="login-hero">
          <div className="hero-content">
            <img 
              src="/logo-unmsm-blanco.png" 
              alt="Escudo de la Universidad Nacional Mayor de San Marcos" 
              className="unmsm-logo"
            />
            <h1>Plataforma de Empleabilidad UNMSM</h1>
            <p>
              Conecta estudiantes y egresados con oportunidades laborales, permitiendo
              consultar ofertas, postular y hacer seguimiento desde una plataforma web.
            </p>
            <div className="hero-summary">
              <span>Acceso académico</span>
              <span>Ofertas laborales</span>
              <span>Postulación en línea</span>
            </div>
          </div>
        </section>

        {/* --- LADO DERECHO: PANEL --- */}
        <section className="login-panel">
          <div className="login-card">
            <div className="card-accent"></div>

            <div className="login-header">
              <div className="logo">
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <circle cx="26" cy="26" r="26" fill="url(#gradient)" />
                  <path d="M16 28L26 16L36 28H31V36H21V28H16Z" fill="white" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1E3A8A" />
                      <stop offset="100%" stopColor="#4ECDC4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h2>Iniciar sesión</h2>
              <p>Acceso para estudiantes y egresados</p>
            </div>

            {/* Condicional de React: Si NO es éxito, muestra el formulario. Si SÍ es éxito, muestra el mensaje */}
            {!isSuccess ? (
              <>
                <form className="login-form" id="loginForm" onSubmit={handleSubmit} noValidate>
                  
                  {/* Input Correo */}
                  <div className={`form-field ${errors.correo ? 'error' : ''}`}>
                    <input 
                      type="email" 
                      id="correo" 
                      name="correo" 
                      required 
                      autoComplete="email"
                      placeholder=" "
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      disabled={isLoading}
                    />
                    <label htmlFor="correo">Correo institucional</label>
                    <div className="field-line"></div>
                    <span className={`error-message ${errors.correo ? 'show' : ''}`} id="correoError">
                      {errors.correo}
                    </span>
                  </div>

                  {/* Input Password */}
                  <div className={`form-field ${errors.password ? 'error' : ''}`}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="password" 
                      name="password" 
                      required 
                      autoComplete="current-password"
                      placeholder=" "
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <label htmlFor="password">Contraseña</label>
                    <button 
                      type="button" 
                      className={`password-reveal ${showPassword ? 'reveal-active' : ''}`} 
                      id="passwordToggle" 
                      aria-label="Mostrar u ocultar contraseña"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      👁
                    </button>
                    <div className="field-line"></div>
                    <span className={`error-message ${errors.password ? 'show' : ''}`} id="passwordError">
                      {errors.password}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="form-actions">
                    <label className="remember-checkbox">
                      <input 
                        type="checkbox" 
                        id="remember" 
                        name="remember" 
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      <span className="checkbox-custom"></span>
                      <span className="checkbox-label">Recordarme</span>
                    </label>
                    <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
                  </div>

                  {/* Botón Submit */}
                  <button type="submit" className={`signin-button ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                    <span className="button-text">Iniciar sesión</span>
                    <div className="button-loader">
                      <div className="loader-circle"></div>
                    </div>
                  </button>
                </form>

                <div className="login-note">
                  <p>
                    Ingresa con un correo registrado en la plataforma. Esta versión corresponde
                    a un prototipo académico conectado a API y Supabase.
                  </p>
                </div>

                <div className="signup-prompt">
                  <span>¿Aún no tienes perfil?</span>
                  <a href="#" className="signup-link">Solicita tu registro</a>
                </div>
              </>
            ) : (
              /* Mensaje de Éxito */
              <div className="success-state show" id="successMessage">
                <div className="success-visual">
                  <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                    <circle cx="21" cy="21" r="21" fill="url(#successGradient)" />
                    <path 
                      d="M13 21L18.5 26.5L29 16" 
                      stroke="white" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4ECDC4" />
                        <stop offset="100%" stopColor="#1E3A8A" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h3>Inicio de sesión exitoso</h3>
                <p>Redirigiendo al panel principal...</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};