
const API = "https://tutor-matematicas-backend-zsd9.onrender.com";
const tokenKey = "tutorMateAdminToken";

const getToken = () => localStorage.getItem(tokenKey);

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Ocurrió un error al conectar con el servidor.");
  }

  return data;
}

// REGISTRAR SOLICITUDES EN MONGODB
document.getElementById("contactForm").addEventListener("submit", async e => {
  e.preventDefault();

  const form = e.target;
  const message = document.getElementById("formMessage");
  const datos = Object.fromEntries(new FormData(form).entries());

  message.textContent = "Enviando solicitud...";

  try {
    await apiRequest("/api/requests", {
      method: "POST",
      body: JSON.stringify({
        nombre: datos.nombre,
        correo: datos.correo,
        nivel: datos.nivel,
        servicio: datos.servicio,
        mensaje: datos.mensaje
      })
    });

    message.textContent = "¡Gracias! Tu solicitud fue guardada correctamente.";
    form.reset();
  } catch (error) {
    message.textContent = error.message;
  }
});

// BOTONES DE SERVICIOS
document.querySelectorAll(".request[data-service]").forEach(b => {
  b.addEventListener("click", () => {
    document.getElementById("serviceSelect").value = b.dataset.service;
    document.getElementById("contacto").scrollIntoView({
      behavior: "smooth"
    });
  });
});

// INICIO DE SESIÓN DEL ADMINISTRADOR
document.getElementById("adminForm").addEventListener("submit", async e => {
  e.preventDefault();

  const message = document.getElementById("adminMessage");
  const correo = document.getElementById("adminUser").value.trim();
  const password = document.getElementById("adminPass").value;

  message.textContent = "Verificando acceso...";

  try {
    const data = await apiRequest("/api/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ correo, password })
    });

    localStorage.setItem(tokenKey, data.token);

    document.getElementById("dashboard").classList.remove("hidden");
    message.textContent = "Acceso correcto.";

    await cargarSolicitudes();
  } catch (error) {
    localStorage.removeItem(tokenKey);
    message.textContent = error.message;
  }
});

// CERRAR SESIÓN DEL ADMINISTRADOR
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem(tokenKey);

  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("adminForm").reset();
  document.getElementById("adminMessage").textContent =
    "Sesión cerrada correctamente.";

  document.getElementById("requestList").replaceChildren();
  document.getElementById("requestCount").textContent = "";
});

// CONSULTAR SOLICITUDES

async function cargarSolicitudes() {
  const count = document.getElementById("requestCount");
  const list = document.getElementById("requestList");

  count.textContent = "Consultando solicitudes...";
  list.replaceChildren();

  try {
    const solicitudes = await apiRequest("/api/requests");

    count.textContent =
      solicitudes.length + " solicitudes registradas en la base de datos.";

    if (!solicitudes.length) {
      const li = document.createElement("li");
      li.textContent = "Aún no hay solicitudes.";
      list.appendChild(li);
      return;
    }

    solicitudes.forEach(x => {
      const li = document.createElement("li");

      const nombre = document.createElement("b");
      nombre.textContent = x.nombre || "Sin nombre";

      const detalle = document.createElement("p");
      detalle.textContent =
        `${x.nivel} — ${x.servicio}. ${x.mensaje}`;

      const fecha = document.createElement("small");
      fecha.textContent = x.createdAt
        ? new Date(x.createdAt).toLocaleString("es-CO")
        : "Fecha no disponible";

      const estado = document.createElement("p");
      estado.textContent = "Estado: " + (x.estado || "Nueva");

      li.append(nombre, detalle, fecha, estado);

      ["Nueva", "En proceso", "Atendida"].forEach(valor => {
        const boton = document.createElement("button");

        boton.type = "button";
        boton.className = "request";
        boton.textContent = valor;

        boton.addEventListener("click", async () => {
          boton.disabled = true;

          try {
            await apiRequest(`/api/requests/${x._id}/status`, {
              method: "PATCH",
              body: JSON.stringify({ estado: valor })
            });

            await cargarSolicitudes();
          } catch (error) {
            alert(error.message);
            boton.disabled = false;
          }
        });

        li.appendChild(boton);
      });

      list.appendChild(li);
    });

  } catch (error) {
    count.textContent = error.message;
  }
}

document.getElementById("viewRequests").addEventListener("click", cargarSolicitudes);

// ASISTENTE DEMOSTRATIVO
document.getElementById("assistantForm").addEventListener("submit", e => {
  e.preventDefault();

  let q = document.getElementById("question").value.toLowerCase();
  let a;

  if (q.includes("fraccion")) {
    a = "Para sumar fracciones con igual denominador, suma los numeradores y conserva el denominador. Ejemplo: 2/5 + 1/5 = 3/5.";
  } else if (q.includes("ecuacion") || q.includes("despejar")) {
    a = "Ejemplo: x + 4 = 9. Resta 4 en ambos lados y obtienes x = 5.";
  } else if (q.includes("multiplic")) {
    a = "Multiplicar es sumar varias veces: 3 × 4 = 4 + 4 + 4 = 12.";
  } else if (q.includes("division") || q.includes("dividir")) {
    a = "Dividir es repartir en partes iguales: 12 ÷ 3 = 4.";
  } else if (q.includes("porcentaje")) {
    a = "20% de 50 = 0,20 × 50 = 10.";
  } else if (q.includes("area")) {
    a = "El área de un rectángulo es base por altura. Ejemplo: 5 × 3 = 15 unidades cuadradas.";
  } else {
    a = "Puedo orientarte con fracciones, ecuaciones, multiplicación, división, porcentajes y áreas.";
  }

  document.getElementById("answer").textContent =
    a + " — Asistente demostrativo, no es IA generativa.";
});

// MENÚ
document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("nav").classList.toggle("open");
});

document.querySelectorAll("#nav a").forEach(a => {
  a.addEventListener("click", () => {
    document.getElementById("nav").classList.remove("open");
  });
});
