let timer = 360;
let timerInterval;
let hasVoted = false;

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("voteCandidatesForm");
  if (form) {
    form.addEventListener("submit", handleVoteSubmit);
  }
  startTimer();
  preventExit();
  blockBackNavigation();
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
      alert("⏳ Temps écoulé. Votre droit de vote est annulé.");
      window.location.href = "index.html";
    }
  }, 1000);
}

function preventExit() {
  window.addEventListener("beforeunload", (e) => {
    e.preventDefault();
    e.returnValue = "⚠️ Si vous quittez la page, votre vote sera annulé.";
  });
}

function blockBackNavigation() {
  history.pushState(null, null, location.href);
  window.onpopstate = function () {
    history.go(1);
    alert("🚫 Retour interdit. Votre session de vote est perdue.");
    window.location.href = "index.html";
  };
}

async function handleVoteSubmit(e) {
  e.preventDefault();

  if (hasVoted) return;
  hasVoted = true;

  const form = document.getElementById("voteCandidatesForm");
  const formData = new FormData(form);
  const data = {};

  formData.forEach((value, key) => {
    data[key] = value;
  });

  const scriptURL = "https://script.google.com/macros/s/AKfycbzRvdaeUXXgQ4w2GjiUNFxIAFtIsukTjkxnxZccoQ81MCwpth7NjZosq8N63JxEW7XMdg/exec";

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
      if (res.status === "blocked") {
        alert("❌ Cette adresse IP a déjà voté.");
        window.location.href = "index.html";
      } else {
        alert("✅ Merci pour votre vote !");
        window.location.href = "index.html";
      }
    })
    .catch((err) => {
      console.error("Erreur lors de l’envoi du formulaire :", err);
      alert("⚠️ Une erreur s’est produite. Veuillez réessayer plus tard.");
    });
}
