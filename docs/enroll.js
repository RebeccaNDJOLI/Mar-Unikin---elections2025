// enroll.js – Minuteur déclenché après quiz, sécurité, IP, blocage navigation

let timer = 240;
let timerInterval;
let hasSubmitted = false;

window.addEventListener("DOMContentLoaded", () => {
  preventExit();
  blockBackNavigation();
  const form = document.getElementById("enrollForm");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
});

function startTimer() {
  const timerElement = document.getElementById("timer");

  if (!timerElement) return;

  timerElement.textContent = `Temps restant : ${timer}s`;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer--;
    timerElement.textContent = `Temps restant : ${timer}s`;
    if (timer <= 0) {
      clearInterval(timerInterval);
      alert("⏳ Temps écoulé. Vous ne pouvez plus vous enrôler.");
      window.location.href = "index.html";
    }
  }, 1000);
}

function preventExit() {
  window.addEventListener("beforeunload", (e) => {
    e.preventDefault();
    e.returnValue = "⚠️ Si vous quittez la page, votre droit d’enrôlement sera annulé.";
  });
}

function blockBackNavigation() {
  history.pushState(null, null, location.href);
  window.onpopstate = function () {
    history.go(1);
    alert("🚫 Vous ne pouvez pas revenir à cette page. Droit d’enrôlement perdu.");
    window.location.href = "index.html";
  };
}

function getIP() {
  return fetch("https://api.ipify.org?format=json")
    .then((res) => res.json())
    .then((data) => data.ip)
    .catch(() => "inconnue");
}

async function handleSubmit(e) {
  e.preventDefault();
  console.log("✅ Formulaire soumis !");

  if (hasSubmitted) return;
  hasSubmitted = true;

  const form = document.getElementById("enrollForm");
  const formData = new FormData(form);
  const data = {};

  formData.forEach((value, key) => {
    data[key] = value;
  });

  // Ajout des réponses quiz si disponibles
  const q1 = document.getElementById("quizAnswer")?.value.trim();
  const q2 = document.getElementById("prof-evie")?.value.trim();
  const q3 = document.getElementById("coordo-mar")?.value.trim();
  if (q1 && q2 && q3) {
    data["quizAnswer"] = q1;
    data["prof-evie"] = q2;
    data["coordo-mar"] = q3;
  }

  data.ip = await getIP();

  const scriptURL = "https://script.google.com/macros/s/AKfycbxhc6nrYPQF8gYnIB6cTSdXz67SxX3UK9q9jLTYYKiHv1WcWU5XsS-pzTUMQ7AlPafjCA/exec";

  fetch(scriptURL, {
    method: "POST",
    redirect: "follow",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
  })  
    
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "unauthorized") {
        alert("❌ Vos réponses aux questions de sécurité sont incorrectes.");
        window.location.href = "index.html";
      } else if (res.status === "blocked") {
        alert("❌ Cette adresse IP a déjà été utilisée pour un enrôlement.");
        window.location.href = "index.html";
      } else {
        alert("✅ Enrôlement réussi. Vous allez recevoir un email de confirmation.");
        window.location.href = "index.html";
      }
    })
    .catch((err) => {
      console.error("Erreur lors de l’envoi du formulaire :", err);
      alert("⚠️ Une erreur s’est produite. Veuillez réessayer ultérieurement.");
    });
}

// Déclenché après validation du quiz
function displayEnrollmentForm() {
  document.getElementById("enrollForm")?.addEventListener("submit", handleSubmit);
  document.getElementById("quiz-section").style.display = "none";
  document.getElementById("form-section").style.display = "block";
  startTimer();
}
