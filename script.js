const body = document.body;
body.classList.add("is-loading");

window.addEventListener("load", () => {
  const loader = document.querySelector(".loader");
  window.setTimeout(() => {
    loader?.classList.add("is-hidden");
    body.classList.remove("is-loading");
  }, 650);
});

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const canvas = document.querySelector("[data-network-canvas]");
const ctx = canvas?.getContext("2d");
let points = [];
let animationFrame = 0;

const resizeCanvas = () => {
  if (!canvas || !ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(canvas.offsetWidth * ratio);
  canvas.height = Math.floor(canvas.offsetHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const density = Math.max(38, Math.floor(canvas.offsetWidth / 30));
  points = Array.from({ length: density }, () => ({
    x: Math.random() * canvas.offsetWidth,
    y: Math.random() * canvas.offsetHeight,
    vx: (Math.random() - 0.5) * 0.42,
    vy: (Math.random() - 0.5) * 0.42,
  }));
};

const drawNetwork = () => {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

  points.forEach((point) => {
    point.x += point.vx;
    point.y += point.vy;

    if (point.x < 0 || point.x > canvas.offsetWidth) point.vx *= -1;
    if (point.y < 0 || point.y > canvas.offsetHeight) point.vy *= -1;
  });

  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const a = points[i];
      const b = points[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (distance < 150) {
        const alpha = 1 - distance / 150;
        ctx.strokeStyle = `rgba(0, 188, 212, ${alpha * 0.28})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  points.forEach((point, index) => {
    const pulse = Math.sin(Date.now() / 700 + index) * 0.7 + 1.6;
    ctx.fillStyle = index % 3 === 0 ? "rgba(30, 136, 229, 0.8)" : "rgba(255, 255, 255, 0.55)";
    ctx.beginPath();
    ctx.arc(point.x, point.y, pulse, 0, Math.PI * 2);
    ctx.fill();
  });

  animationFrame = requestAnimationFrame(drawNetwork);
};

if (canvas && ctx) {
  resizeCanvas();
  drawNetwork();
  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationFrame);
    resizeCanvas();
    drawNetwork();
  });
}

const form = document.querySelector("[data-contact-form]");
const note = document.querySelector("[data-form-note]");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const topic = String(data.get("topic") || "").trim();
  const message = String(data.get("message") || "").trim();

  if (!name || !email || !topic || !message) {
    if (note) note.textContent = "Merci de compléter tous les champs avant l'envoi.";
    return;
  }

  const subject = encodeURIComponent(`AbiLabs - ${topic}`);
  const body = encodeURIComponent(
    `Nom: ${name}\nEmail: ${email}\nObjet: ${topic}\n\nMessage:\n${message}\n\nEnvoyé depuis le site AbiLabs.`
  );

  window.location.href = `mailto:contact@abilabs.tech?subject=${subject}&body=${body}`;
  if (note) note.textContent = "Votre application email va s'ouvrir avec le message préparé.";
});
