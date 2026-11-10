/* ===== Utilitaires ===== */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===== Année dans le pied de page ===== */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== Menu mobile (burger) ===== */
const navToggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");

if (navToggle && nav) {
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  };

  navToggle.addEventListener("click", () => {
    setMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });

  // Ferme le menu après un clic sur un lien
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  // Ferme avec Échap (et rend le focus au bouton)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      setMenu(false);
      navToggle.focus();
    }
  });

  // Ferme si on clique en dehors du menu
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("open") && !nav.contains(e.target) && !navToggle.contains(e.target)) {
      setMenu(false);
    }
  });

  // Réinitialise quand on repasse en affichage large
  window.matchMedia("(min-width: 768px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });
}

/* ===== Apparition douce des blocs au défilement ===== */
const revealOnScroll = () => {
  const items = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => observer.observe(el));
};
revealOnScroll();

/* ===== Services : cartes dépliables (une seule ouverte à la fois) ===== */
const serviceCards = document.querySelectorAll(".service");
serviceCards.forEach((card) => {
  const toggle = card.querySelector(".service-toggle");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const willOpen = !card.classList.contains("is-open");
    serviceCards.forEach((other) => {
      const isTarget = other === card;
      const open = isTarget ? willOpen : false;
      other.classList.toggle("is-open", open);
      const btn = other.querySelector(".service-toggle");
      if (btn) btn.setAttribute("aria-expanded", String(open));
    });
  });
});

/* ===== Formulaire de devis ===== */
const WHATSAPP_NUMBER = "261375137367";
const CONTACT_EMAIL = "romeojaomiasa@gmail.com";

/* Pour recevoir les demandes directement par e-mail :
   1) créez un formulaire gratuit sur https://formspree.io (avec votre adresse e-mail),
   2) copiez son lien (ex. "https://formspree.io/f/abcdwxyz") et collez-le entre les guillemets.
   Laissé vide, le formulaire propose seulement WhatsApp et l'e-mail. */
const FORM_ENDPOINT = "";

const devisForm = document.getElementById("devis-form");

if (devisForm) {
  const statusEl = document.getElementById("devis-status");
  const noteEl = document.getElementById("devis-note");
  const sendBtn = document.getElementById("devis-send");
  const whatsappBtn = document.getElementById("devis-whatsapp");
  const emailBtn = document.getElementById("devis-email");
  const endpoint = FORM_ENDPOINT.trim();

  const required = {
    nom: "Indiquez votre nom.",
    tel: "Indiquez un numéro pour que je puisse vous répondre.",
    service: "Choisissez un service.",
    ville: "Indiquez la ville ou le quartier.",
  };
  const field = (name) => devisForm.elements[name];
  const value = (name) => field(name).value.trim();

  const showError = (name, message) => {
    const errorEl = document.getElementById(`devis-${name}-error`);
    errorEl.textContent = message;
    errorEl.hidden = !message;
    field(name).setAttribute("aria-invalid", message ? "true" : "false");
  };

  // Efface l'erreur dès que la personne corrige le champ
  Object.keys(required).forEach((name) => {
    const clear = () => showError(name, "");
    field(name).addEventListener("input", clear);
    field(name).addEventListener("change", clear);
  });

  const validate = () => {
    let firstInvalid = null;
    Object.entries(required).forEach(([name, message]) => {
      const ok = value(name) !== "";
      showError(name, ok ? "" : message);
      if (!ok && !firstInvalid) firstInvalid = field(name);
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  };

  const buildMessage = () => {
    const lines = [
      "Bonjour Roméo, je souhaite un devis.",
      "",
      `Nom : ${value("nom")}`,
      `Téléphone : ${value("tel")}`,
      `Service : ${value("service")}`,
      `Lieu : ${value("ville")}`,
    ];
    if (value("message")) lines.push("", `Détails : ${value("message")}`);
    return lines.join("\n");
  };

  const setStatus = (text, url, linkLabel) => {
    statusEl.textContent = text;
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = linkLabel;
      statusEl.append(" ", link);
    }
  };

  const openWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`;
    const opener = document.createElement("a");
    opener.href = url;
    opener.target = "_blank";
    opener.rel = "noopener noreferrer";
    document.body.appendChild(opener);
    opener.click();
    opener.remove();
    setStatus("WhatsApp s'ouvre dans un nouvel onglet.", url, "Rien ne s'affiche ? Cliquez ici.");
  };

  const openEmail = () => {
    const subject = `Demande de devis — ${value("service")}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildMessage())}`;
    setStatus("Votre messagerie s'ouvre avec le message prêt à envoyer.");
  };

  const sendToEndpoint = async () => {
    // Champ piège : un robot le remplit, une vraie personne ne le voit pas
    if (value("_gotcha") !== "") {
      setStatus("Merci ! Votre demande est bien envoyée, je vous réponds rapidement.");
      return;
    }
    const label = sendBtn.textContent;
    sendBtn.disabled = true;
    sendBtn.textContent = "Envoi en cours…";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          nom: value("nom"),
          telephone: value("tel"),
          service: value("service"),
          ville: value("ville"),
          message: value("message"),
          _subject: `Demande de devis — ${value("service")}`,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      devisForm.reset();
      Object.keys(required).forEach((name) => showError(name, ""));
      setStatus("Merci ! Votre demande est bien envoyée, je vous réponds rapidement.");
    } catch (error) {
      setStatus("L'envoi a échoué. Essayez avec WhatsApp ou par e-mail.");
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = label;
    }
  };

  if (endpoint) {
    // Mode envoi direct : le bouton principal envoie la demande par e-mail
    sendBtn.hidden = false;
    whatsappBtn.classList.replace("btn-primary", "btn-outline");
    noteEl.textContent =
      "Votre demande est transmise par un service de formulaire sécurisé (Formspree) et reçue directement par e-mail. Vous pouvez aussi passer par WhatsApp ou votre messagerie.";
  }

  devisForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validate()) return;
    if (endpoint) sendToEndpoint();
    else openWhatsApp();
  });
  whatsappBtn.addEventListener("click", () => {
    if (validate()) openWhatsApp();
  });
  emailBtn.addEventListener("click", () => {
    if (validate()) openEmail();
  });
}

/* ===== Réalisations : photo manquante = "Photo à venir", clic = agrandir ===== */
const PLACEHOLDER_ICON = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M3 17l5-5 4 4 3-3 6 6"/></svg>';

document.querySelectorAll("#realisations-grid .card").forEach((card) => {
  const img = card.querySelector("img");
  if (!img) return;
  const markMissing = () => {
    if (card.classList.contains("is-missing")) return;
    card.classList.add("is-missing");
    card.classList.remove("reveal");
    const holder = document.createElement("div");
    holder.className = "placeholder";
    holder.innerHTML = PLACEHOLDER_ICON + "Photo à venir";
    card.replaceChildren(holder);
  };
  img.addEventListener("error", markMissing);
  if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) markMissing();
});

const WA_NUMBER = "261375137367";
const chantierDialog = document.getElementById("lightbox");
const chantierGrid = document.getElementById("realisations-grid");

if (chantierDialog && chantierGrid && typeof chantierDialog.showModal === "function") {
  const dlgImg = chantierDialog.querySelector(".chantier-media img");
  const dlgMeta = chantierDialog.querySelector(".chantier-meta");
  const dlgTitle = chantierDialog.querySelector("#chantier-title");
  const dlgDesc = chantierDialog.querySelector(".chantier-desc");
  const dlgPoints = chantierDialog.querySelector(".chantier-points");
  const dlgCta = chantierDialog.querySelector(".chantier-cta .btn-primary");
  const prevBtn = chantierDialog.querySelector(".chantier-nav.prev");
  const nextBtn = chantierDialog.querySelector(".chantier-nav.next");
  let current = 0;

  const openCards = () => [...chantierGrid.querySelectorAll(".card:not(.is-missing)")];

  const fill = (card) => {
    const data = card.dataset;
    const img = card.querySelector("img");
    const caption = card.querySelector("figcaption strong");
    const title = (data.titre || "").trim() || (caption ? caption.textContent.trim() : "Chantier");

    dlgImg.src = img.currentSrc || img.src;
    dlgImg.alt = title;
    dlgTitle.textContent = title;
    dlgDesc.textContent = (data.description || "").trim();

    dlgMeta.replaceChildren();
    [data.service, data.lieu, data.date].forEach((value) => {
      if (value && value.trim()) {
        const chip = document.createElement("span");
        chip.textContent = value.trim();
        dlgMeta.append(chip);
      }
    });

    dlgPoints.replaceChildren();
    (data.points || "").split("|").map((t) => t.trim()).filter(Boolean).forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      dlgPoints.append(li);
    });

    const message = `Bonjour Roméo, j'ai vu votre chantier « ${title} » sur votre site et je souhaite un devis similaire.`;
    dlgCta.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const show = (index) => {
    const cards = openCards();
    if (!cards.length) return;
    current = (index + cards.length) % cards.length;
    fill(cards[current]);
    const single = cards.length < 2;
    prevBtn.hidden = single;
    nextBtn.hidden = single;
    chantierDialog.scrollTop = 0;
  };

  chantierGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".card-open");
    if (!button) return;
    const card = button.closest(".card");
    show(openCards().indexOf(card));
    chantierDialog.showModal();
  });

  prevBtn.addEventListener("click", () => show(current - 1));
  nextBtn.addEventListener("click", () => show(current + 1));
  chantierDialog.querySelector(".lightbox-close").addEventListener("click", () => chantierDialog.close());
  // Clic en dehors de la fiche = fermer
  chantierDialog.addEventListener("click", (event) => {
    if (event.target === chantierDialog) chantierDialog.close();
  });
  // Flèches du clavier pour passer d'un chantier à l'autre
  chantierDialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });
}

/* ===== Bouton WhatsApp flottant : masqué quand la section Contact est visible ===== */
const waFloat = document.querySelector(".wa-float");
const contactSection = document.getElementById("contact");
if (waFloat && contactSection && "IntersectionObserver" in window) {
  new IntersectionObserver(
    ([entry]) => waFloat.classList.toggle("is-hidden", entry.isIntersecting),
    { threshold: 0.2 }
  ).observe(contactSection);
}