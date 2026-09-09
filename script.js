
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbysTlvsCNKAw7uJ9a5FfQUtkMncy7R7uKL-sS2pyI28QK9QjljFHd4wvk23W9rr1sDX/exec";

let currentLanguage = localStorage.getItem('language') || 'en';

document.addEventListener("DOMContentLoaded", () => {
  // Set initial language from localStorage
  if (currentLanguage === 'kn') {
    switchLanguage('kn');
  }

  // Mobile menu toggle
  const nav = document.querySelector(".nav");
  const menu = document.querySelector(".menu-btn");
  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("mobile-open");
      menu.setAttribute("aria-expanded", String(open));
    });
  }

  // Language toggle
  const langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      currentLanguage = currentLanguage === 'en' ? 'kn' : 'en';
      localStorage.setItem('language', currentLanguage);
      switchLanguage(currentLanguage);
    });
  }

  // Form submission
  document.querySelectorAll("[data-form]").forEach(form => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = form.querySelector(".form-status");
      const button = form.querySelector('button[type="submit"]');
      const original = button ? button.textContent : "";
      const data = Object.fromEntries(new FormData(form).entries());
      data.form_type = form.dataset.form || "general";
      data.source_page = document.title;

      if (button) { button.disabled = true; button.textContent = "Sending…"; }
      form.setAttribute("aria-busy", "true");
      if (status) { status.className = "form-status"; status.textContent = ""; }

      try {
        if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("REPLACE")) throw new Error("Endpoint not configured");
        await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
          body: new URLSearchParams(data).toString()
        });
        if (status) {
          status.className = "success form-status";
          status.textContent = "Thank you. Your request was sent to Nishka. Our team will review it and contact you using the details provided.";
        }
        form.reset();
      } catch (err) {
        if (status) {
          status.className = "error form-status";
          status.textContent = "We couldn't submit the form right now. Please try again or contact Nishka directly.";
        }
      } finally {
        if (button) { button.disabled = false; button.textContent = original; }
        form.removeAttribute("aria-busy");
      }
    });
  });
});

function switchLanguage(lang) {
  const langBtn = document.getElementById('langToggle');
  if (langBtn) {
    langBtn.querySelector('.lang-text').textContent = lang === 'en' ? 'KN' : 'EN';
  }

  document.querySelectorAll('[data-en][data-kn]').forEach(element => {
    const text = lang === 'en' ? element.getAttribute('data-en') : element.getAttribute('data-kn');
    if (text) {
      element.textContent = text;
    }
  });
}

// Load chat after the main page has had time to render, or sooner after user interaction.
function loadHubspotChat() {
  if (document.getElementById("hs-script-loader")) return;
  const script = document.createElement("script");
  script.id = "hs-script-loader";
  script.async = true;
  script.defer = true;
  script.src = "https://js-na2.hs-scripts.com/247051128.js";
  document.body.appendChild(script);
}

if (document.body.dataset.chat === "enabled") {
  window.addEventListener("load", () => {
    const timer = window.setTimeout(loadHubspotChat, 8000);
    ["pointerdown", "keydown", "scroll"].forEach(eventName => {
      window.addEventListener(eventName, () => {
        window.clearTimeout(timer);
        loadHubspotChat();
      }, {once:true, passive:true});
    });
  });
}
