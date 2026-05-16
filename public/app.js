const form = document.getElementById("loginForm");
const correoInput = document.getElementById("correo");
const passwordInput = document.getElementById("password");
const correoError = document.getElementById("correoError");
const passwordError = document.getElementById("passwordError");
const successMessage = document.getElementById("successMessage");
const passwordToggle = document.getElementById("passwordToggle");
const signinButton = document.querySelector(".signin-button");
const loginForm = document.querySelector(".login-form");

passwordToggle.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  passwordToggle.classList.toggle("reveal-active");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  limpiarErrores();

  const correo = correoInput.value.trim();
  const password = passwordInput.value.trim();

  let valido = true;

  if (!correo) {
    mostrarError(correoInput, correoError, "Ingrese su correo institucional.");
    valido = false;
  } else if (!correo.endsWith("@unmsm.edu.pe")) {
    mostrarError(correoInput, correoError, "Debe usar un correo @unmsm.edu.pe.");
    valido = false;
  }

  if (!password) {
    mostrarError(passwordInput, passwordError, "Ingrese su contraseña.");
    valido = false;
  }

  if (!valido) return;

  try {
    signinButton.classList.add("loading");
    signinButton.disabled = true;

    const response = await fetch("/api/estudiantes");

    if (!response.ok) {
      throw new Error("No se pudo obtener la lista de estudiantes.");
    }

    const estudiantes = await response.json();

    // Lógica actualizada: Valida correo Y contraseña
    const estudiante = estudiantes.find(
      (item) => item.correo?.toLowerCase() === correo.toLowerCase() && item.password === password
    );

    if (!estudiante) {
      mostrarError(correoInput, correoError, "El correo no se encuentra registrado.");
      signinButton.classList.remove("loading");
      signinButton.disabled = false;
      return;
    }

    localStorage.setItem("estudiante", JSON.stringify(estudiante));

    loginForm.style.display = "none";
    successMessage.classList.add("show");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1200);

  } catch (error) {
    mostrarError(correoInput, correoError, "Error al conectar con la API.");
    console.error(error);
  } finally {
    signinButton.classList.remove("loading");
    signinButton.disabled = false;
  }
});

function mostrarError(input, errorElement, mensaje) {
  input.parentElement.classList.add("error");
  errorElement.textContent = mensaje;
  errorElement.classList.add("show");
}

function limpiarErrores() {
  document.querySelectorAll(".form-field").forEach((field) => {
    field.classList.remove("error");
  });

  document.querySelectorAll(".error-message").forEach((error) => {
    error.textContent = "";
    error.classList.remove("show");
  });
}