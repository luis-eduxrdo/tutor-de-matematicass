const key="tutorMateRequests";const read=()=>JSON.parse(localStorage.getItem(key)||"[]");const save=x=>{let a=read();a.push(x);localStorage.setItem(key,JSON.stringify(a))};
document.getElementById("contactForm").addEventListener("submit",e=>{e.preventDefault();save({...Object.fromEntries(new FormData(e.target).entries()),fecha:new Date().toLocaleString("es-CO")});document.getElementById("formMessage").textContent="¡Gracias! La solicitud quedó guardada en este navegador.";e.target.reset()});
document.querySelectorAll(".request[data-service]").forEach(b=>b.addEventListener("click",()=>{document.getElementById("serviceSelect").value=b.dataset.service;document.getElementById("contacto").scrollIntoView({behavior:"smooth"})}));
document.getElementById("adminForm").addEventListener("submit",e=>{e.preventDefault();if(document.getElementById("adminUser").value==="admin"&&document.getElementById("adminPass").value==="mate123"){document.getElementById("dashboard").classList.remove("hidden");document.getElementById("requestCount").textContent=read().length+" solicitudes guardadas en este navegador." ;document.getElementById("adminMessage").textContent="Acceso de demostración correcto."}else document.getElementById("adminMessage").textContent="Datos incorrectos. Prueba admin / mate123."});
document.getElementById("viewRequests").addEventListener("click",()=>{let a=read();document.getElementById("requestList").innerHTML=a.length?a.map(x=>`<li><b>${x.nombre}</b> — ${x.nivel}, ${x.servicio}<br>${x.mensaje}<br><small>${x.fecha}</small></li>`).join(""):"<li>Aún no hay solicitudes.</li>"});
document.getElementById("assistantForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = document.getElementById("question").value.trim();
  const answer = document.getElementById("answer");

  if (!question) {
    answer.textContent = "Escribe una pregunta de matemáticas.";
    return;
  }

  answer.textContent = "Pensando...";

  try {
    const response = await fetch(
      "https://tutor-matematicas-backend-zsd9.onrender.com/api/assistant",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo obtener una respuesta.");
    }

    answer.textContent = data.answer;
  } catch (error) {
    answer.textContent = error.message;
  }
});
document.getElementById("menuBtn").addEventListener("click",()=>document.getElementById("nav").classList.toggle("open"));document.querySelectorAll("#nav a").forEach(a=>a.addEventListener("click",()=>document.getElementById("nav").classList.remove("open")));