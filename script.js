const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbysTlvsCNKAw7uJ9a5FfQUtkMncy7R7uKL-sS2pyI28QK9QjljFHd4wvk23W9rr1sDX/exec";
let currentLanguage = localStorage.getItem("language") || "en";

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".nav");
  const menu = document.querySelector(".menu-btn");
  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("mobile-open");
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  const langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      currentLanguage = currentLanguage === "en" ? "kn" : "en";
      localStorage.setItem("language", currentLanguage);
      switchLanguage(currentLanguage);
      applySiteWideKannada(currentLanguage);
  applySiteWideKannada(currentLanguage);
    });
  }
  switchLanguage(currentLanguage);

  document.querySelectorAll("[data-form]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const status = form.querySelector(".form-status");
      const button = form.querySelector('button[type="submit"]');
      const original = button ? button.textContent : "";
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      // Preserve all selected values for checkbox groups.
      for (const groupName of ["work_types", "work_preferences"]) {
        const selected = formData.getAll(groupName);
        if (selected.length) data[groupName] = selected.join(", ");
      }
      const preferenceGroup = form.querySelector('input[name="work_preferences"]')?.closest("fieldset");
      const workTypeGroup = form.querySelector('input[name="work_types"]')?.closest("fieldset");
      const missingBusinessWork = form.dataset.form === "business" && form.querySelector('input[name="work_types"]') && formData.getAll("work_types").length === 0;
      const missingHomemakerWork = form.dataset.form === "homemaker" && preferenceGroup && formData.getAll("work_preferences").length === 0;
      if (missingBusinessWork || missingHomemakerWork) {
        const group = missingBusinessWork ? workTypeGroup : preferenceGroup;
        if (status) {
          status.className = "form-status error";
          status.textContent = currentLanguage === "kn" ? "ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ಕೆಲಸದ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ." : "Please select at least one work preference.";
        }
        group?.querySelector("input")?.focus();
        return;
      }
      data.form_type = form.dataset.form || "general";
      data.source_page = document.title;
      if (button) { button.disabled = true; button.textContent = currentLanguage === "kn" ? "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ…" : "Sending…"; }
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
          status.className = "form-status success";
          status.textContent = currentLanguage === "kn"
            ? "ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ. ನಮ್ಮ ತಂಡ ಪರಿಶೀಲಿಸಿ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ."
            : "Thank you. Your request was sent to Nishka. Our team will review it and contact you using the details provided.";
        }
        form.reset();
      } catch (err) {
        if (status) {
          status.className = "form-status error";
          status.textContent = currentLanguage === "kn"
            ? "ಈಗ ಫಾರ್ಮ್ ಸಲ್ಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ನಿಷ್ಕಾವನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ."
            : "We couldn't submit the form right now. Please try again or contact Nishka directly.";
        }
      } finally {
        if (button) { button.disabled = false; button.textContent = original; }
        form.removeAttribute("aria-busy");
      }
    });
  });
});

function switchLanguage(lang) {
  document.documentElement.lang = lang === "kn" ? "kn" : "en";
  document.querySelectorAll("[data-en][data-kn]").forEach(element => {
    const value = lang === "en" ? element.getAttribute("data-en") : element.getAttribute("data-kn");
    if (value !== null) element.textContent = value;
  });
  document.querySelectorAll("[data-en-placeholder][data-kn-placeholder]").forEach(element => {
    element.placeholder = lang === "en" ? element.dataset.enPlaceholder : element.dataset.knPlaceholder;
  });
  const langBtn = document.getElementById("langToggle");
  if (langBtn) {
    const active = langBtn.querySelector(".lang-active");
    if (active) active.textContent = lang === "en" ? "English" : "ಕನ್ನಡ";
    langBtn.setAttribute("aria-label", lang === "en" ? "Switch to Kannada" : "Switch to English");
  }
}

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
      window.addEventListener(eventName, () => { window.clearTimeout(timer); loadHubspotChat(); }, {once:true, passive:true});
    });
  });
}


/* Site-wide Kannada translations for content that was not yet tagged per page. */
const KANNADA_TEXT = {
  "Skip to main content":"ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ಹೋಗಿ",
  "Connecting Businesses With Trusted Homemakers.":"ವ್ಯಾಪಾರಗಳನ್ನು ವಿಶ್ವಾಸಾರ್ಹ ಗೃಹಿಣಿಯರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವುದು.",
  "Managed task allocation & quality checks":"ಕೆಲಸದ ಹಂಚಿಕೆ ಮತ್ತು ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ",
  "Flexible batch execution for seasonal demand":"ಋತುಮಾನಿಕ ಬೇಡಿಕೆಗೆ ಹೊಂದಿಕೊಳ್ಳುವ ಬ್ಯಾಚ್ ಕೆಲಸ",
  "Structured material handover & return protocols":"ಸಾಮಗ್ರಿಗಳ ಹಸ್ತಾಂತರ ಮತ್ತು ಹಿಂತಿರುಗಿಸುವ ವ್ಯವಸ್ಥೆ",
  "Clear per-unit or batch quotation transparency":"ಪ್ರತಿ ಘಟಕ ಅಥವಾ ಬ್ಯಾಚ್ ದರಗಳ ಸ್ಪಷ್ಟ ವಿವರ",
  "→ Explore Business Support":"→ ವ್ಯಾಪಾರ ಸೇವೆಗಳನ್ನು ನೋಡಿ",
  "Clear task rates & instructions upfront":"ಕೆಲಸದ ದರಗಳು ಮತ್ತು ಸೂಚನೆಗಳನ್ನು ಮುಂಚಿತವಾಗಿ ತಿಳಿಸಲಾಗುತ್ತದೆ",
  "Work from home with localized coordination":"ಸ್ಥಳೀಯ ಸಮನ್ವಯದೊಂದಿಗೆ ಮನೆಯಿಂದ ಕೆಲಸ ಮಾಡಿ",
  "No upfront registration or membership fees":"ಮುಂಗಡ ನೋಂದಣಿ ಅಥವಾ ಸದಸ್ಯತ್ವ ಶುಲ್ಕವಿಲ್ಲ",
  "Timely payments based on completed verified work":"ಪರಿಶೀಲಿಸಿದ ಪೂರ್ಣಗೊಂಡ ಕೆಲಸಕ್ಕೆ ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಪಾವತಿ",
  "→ Join as a Homemaker":"→ ಗೃಹಿಣಿಯಾಗಿ ಸೇರಿ",
  "Merchant solutions":"ವ್ಯಾಪಾರಿಗಳಿಗೆ ಪರಿಹಾರಗಳು",
  "Reliable Support for Your Repetitive Work":"ನಿಮ್ಮ ಪುನರಾವರ್ತಿತ ಕೆಲಸಗಳಿಗೆ ವಿಶ್ವಾಸಾರ್ಹ ಬೆಂಬಲ",
  "Submit your work requirements and let Nishka organize material assessment, worker allocation, batch coordination and quality checks.":"ನಿಮ್ಮ ಕೆಲಸದ ಅವಶ್ಯಕತೆಗಳನ್ನು ಸಲ್ಲಿಸಿ. ಸಾಮಗ್ರಿಗಳ ಪರಿಶೀಲನೆ, ಕೆಲಸಗಾರರ ಹಂಚಿಕೆ, ಬ್ಯಾಚ್ ಸಮನ್ವಯ ಮತ್ತು ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆಯನ್ನು ನಿಷ್ಕಾ ನಿರ್ವಹಿಸುತ್ತದೆ.",
  "Product Packaging & Packing ▣":"ಉತ್ಪನ್ನ ಪ್ಯಾಕೇಜಿಂಗ್ ಮತ್ತು ಪ್ಯಾಕಿಂಗ್ ▣",
  "Label & Sticker Application ◆":"ಲೇಬಲ್ ಮತ್ತು ಸ್ಟಿಕ್ಕರ್ ಅಳವಡಿಕೆ ◆",
  "Sorting & Classification ☷":"ವಿಂಗಡಣೆ ಮತ್ತು ವರ್ಗೀಕರಣ ☷",
  "Garment Folding & Finishing ▤":"ಉಡುಪು ಮಡಿಸುವಿಕೆ ಮತ್ತು ಅಂತಿಮ ಸಿದ್ಧತೆ ▤",
  "Gift Hamper & Kit Assembly ♙":"ಉಡುಗೊರೆ ಹ್ಯಾಂಪರ್ ಮತ್ತು ಕಿಟ್ ಜೋಡಣೆ ♙",
  "Printing & Collateral Sorting ▦":"ಮುದ್ರಿತ ವಸ್ತುಗಳ ವಿಂಗಡಣೆ ▦",
  "Request a quotation":"ದರಪಟ್ಟಿ ಕೇಳಿ",
  "Submit a Business Work Requirement":"ವ್ಯಾಪಾರದ ಕೆಲಸದ ಅವಶ್ಯಕತೆಯನ್ನು ಸಲ್ಲಿಸಿ",
  "Provide details about your operational task needs and our team will get in touch to assess the requirements.":"ನಿಮ್ಮ ಕೆಲಸದ ಅವಶ್ಯಕತೆಗಳ ವಿವರಗಳನ್ನು ನೀಡಿ. ನಮ್ಮ ತಂಡ ಅವುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ.",
  "Business Name":"ವ್ಯಾಪಾರದ ಹೆಸರು",
  "Contact Person Name":"ಸಂಪರ್ಕ ವ್ಯಕ್ತಿಯ ಹೆಸರು",
  "Phone Number":"ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
  "Business Email":"ವ್ಯಾಪಾರದ ಇಮೇಲ್",
  "Business Category":"ವ್ಯಾಪಾರದ ವರ್ಗ",
  "Select your industry...":"ನಿಮ್ಮ ಉದ್ಯಮವನ್ನು ಆಯ್ಕೆಮಾಡಿ...",
  "Garments & Textiles":"ಉಡುಪು ಮತ್ತು ಜವಳಿ",
  "Printing Press":"ಮುದ್ರಣಾಲಯ",
  "Product Packaging":"ಉತ್ಪನ್ನ ಪ್ಯಾಕೇಜಿಂಗ್",
  "Gifting & Hampers":"ಉಡುಗೊರೆಗಳು ಮತ್ತು ಹ್ಯಾಂಪರ್‌ಗಳು",
  "Retail & E-commerce":"ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರ ಮತ್ತು ಇ-ಕಾಮರ್ಸ್",
  "Other":"ಇತರೆ",
  "Approximate Quantity / Batch Size":"ಅಂದಾಜು ಪ್ರಮಾಣ / ಬ್ಯಾಚ್ ಗಾತ್ರ",
  "Select volume range...":"ಪ್ರಮಾಣದ ವ್ಯಾಪ್ತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ...",
  "Under 100 units":"100 ಘಟಕಗಳಿಗಿಂತ ಕಡಿಮೆ",
  "100–500 units":"100–500 ಘಟಕಗಳು",
  "501–1,000 units":"501–1,000 ಘಟಕಗಳು",
  "1,001–5,000 units":"1,001–5,000 ಘಟಕಗಳು",
  "More than 5,000 units":"5,000 ಘಟಕಗಳಿಗಿಂತ ಹೆಚ್ಚು",
  "OUR PRINCIPLES":"ನಮ್ಮ ತತ್ವಗಳು",
  "Nishka Brand Values":"ನಿಷ್ಕಾದ ಮೌಲ್ಯಗಳು",
  "Trust":"ನಂಬಿಕೆ",
  "Built through transparent communication, dependable fulfillment, and honest business practices.":"ಪಾರದರ್ಶಕ ಸಂವಹನ, ವಿಶ್ವಾಸಾರ್ಹ ಕಾರ್ಯನಿರ್ವಹಣೆ ಮತ್ತು ಪ್ರಾಮಾಣಿಕ ವ್ಯವಹಾರ ಪದ್ಧತಿಗಳ ಮೂಲಕ ನಂಬಿಕೆಯನ್ನು ನಿರ್ಮಿಸುತ್ತೇವೆ.",
  "Dignity":"ಗೌರವ",
  "Respecting the time, skills, and household commitments of homemakers in every task allocated.":"ಪ್ರತಿ ಕೆಲಸದ ಹಂಚಿಕೆಯಲ್ಲಿ ಗೃಹಿಣಿಯರ ಸಮಯ, ಕೌಶಲ್ಯ ಮತ್ತು ಮನೆಯ ಜವಾಬ್ದಾರಿಗಳಿಗೆ ಗೌರವ ನೀಡುತ್ತೇವೆ.",
  "Reliability":"ವಿಶ್ವಾಸಾರ್ಹತೆ",
  "Strict adherence to quality checklists, batch volume deadlines, and merchant instructions.":"ಗುಣಮಟ್ಟದ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ, ಬ್ಯಾಚ್ ಗಡುವು ಮತ್ತು ವ್ಯಾಪಾರಿಗಳ ಸೂಚನೆಗಳನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಪಾಲಿಸುತ್ತೇವೆ.",
  "Transparency":"ಪಾರದರ್ಶಕತೆ",
  "Clear rate communication, honest task expectations, and straightforward payout schedules.":"ಸ್ಪಷ್ಟ ದರ ಮಾಹಿತಿ, ನಿಖರ ಕೆಲಸದ ನಿರೀಕ್ಷೆಗಳು ಮತ್ತು ಸರಳ ಪಾವತಿ ವೇಳಾಪಟ್ಟಿ.",
  "Quality":"ಗುಣಮಟ್ಟ",
  "Managed verification workflows ensuring zero-defect deliverables for every business partner.":"ಪ್ರತಿ ವ್ಯಾಪಾರ ಪಾಲುದಾರರಿಗೆ ದೋಷರಹಿತ ಫಲಿತಾಂಶ ಒದಗಿಸಲು ನಿರ್ವಹಿತ ಪರಿಶೀಲನಾ ಕ್ರಮಗಳು.",
  "Opportunity":"ಅವಕಾಶ",
  "Expanding accessible, home-aligned economic growth for women across local neighborhoods.":"ಸ್ಥಳೀಯ ಪ್ರದೇಶಗಳ ಮಹಿಳೆಯರಿಗೆ ಮನೆಯ ಜವಾಬ್ದಾರಿಗಳಿಗೆ ಹೊಂದುವ ಆದಾಯದ ಅವಕಾಶಗಳನ್ನು ವಿಸ್ತರಿಸುವುದು.",
  "Registered Address":"ನೋಂದಾಯಿತ ವಿಳಾಸ",
  "Phone Contact":"ದೂರವಾಣಿ ಸಂಪರ್ಕ",
  "Email Enquiry":"ಇಮೇಲ್ ವಿಚಾರಣೆ",
  "Official Website":"ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್",
  "Follow Our Social Channels":"ನಮ್ಮ ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳನ್ನು ಅನುಸರಿಸಿ",
  "Send a General Enquiry":"ಸಾಮಾನ್ಯ ವಿಚಾರಣೆಯನ್ನು ಕಳುಹಿಸಿ",
  "Your Name":"ನಿಮ್ಮ ಹೆಸರು",
  "Email Address":"ಇಮೇಲ್ ವಿಳಾಸ",
  "Inquiry Type":"ವಿಚಾರಣೆಯ ಪ್ರಕಾರ",
  "Business Work Requirement":"ವ್ಯಾಪಾರದ ಕೆಲಸದ ಅವಶ್ಯಕತೆ",
  "Homemaker Registration":"ಗೃಹಿಣಿ ನೋಂದಣಿ",
  "Partnership":"ಪಾಲುದಾರಿಕೆ",
  "Other Enquiry":"ಇತರೆ ವಿಚಾರಣೆ",
  "Message":"ಸಂದೇಶ",
  "➤   Send Message":"➤   ಸಂದೇಶ ಕಳುಹಿಸಿ",
  "Privacy policy":"ಗೌಪ್ಯತಾ ನೀತಿ",
  "How we use submitted information":"ಸಲ್ಲಿಸಿದ ಮಾಹಿತಿಯನ್ನು ನಾವು ಹೇಗೆ ಬಳಸುತ್ತೇವೆ",
  "Contact: info@nishkaapp.com":"ಸಂಪರ್ಕ: info@nishkaapp.com",
  "Terms & conditions":"ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು",
  "Full Name":"ಪೂರ್ಣ ಹೆಸರು",
  "Mobile Phone Number":"ಮೊಬೈಲ್ ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
  "Locality / Area in Bengaluru":"ಬೆಂಗಳೂರಿನ ಪ್ರದೇಶ / ಬಡಾವಣೆ",
  "Daily Available Time":"ಪ್ರತಿದಿನ ಲಭ್ಯವಿರುವ ಸಮಯ",
  "Select availability...":"ಲಭ್ಯ ಸಮಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ...",
  "1–2 hours":"1–2 ಗಂಟೆಗಳು",
  "2–3 hours":"2–3 ಗಂಟೆಗಳು",
  "3–4 hours":"3–4 ಗಂಟೆಗಳು",
  "4+ hours":"4 ಅಥವಾ ಹೆಚ್ಚು ಗಂಟೆಗಳು",
  "Flexible / varies daily":"ಹೊಂದಿಕೊಳ್ಳುವ ಸಮಯ / ಪ್ರತಿದಿನ ಬದಲಾಗುತ್ತದೆ",
  "Box & Pouch Packing":"ಬಾಕ್ಸ್ ಮತ್ತು ಪೌಚ್ ಪ್ಯಾಕಿಂಗ್",
  "Sticker Labeling":"ಸ್ಟಿಕ್ಕರ್ ಲೇಬಲಿಂಗ್",
  "Item Sorting":"ವಸ್ತುಗಳ ವಿಂಗಡಣೆ",
  "Gift Hamper Assembly":"ಉಡುಗೊರೆ ಹ್ಯಾಂಪರ್ ಜೋಡಣೆ",
  "Gift Kit Assembly":"ಉಡುಗೊರೆ ಕಿಟ್ ಜೋಡಣೆ",
  "Preferred Contact Language":"ಆದ್ಯತೆಯ ಸಂಪರ್ಕ ಭಾಷೆ",
  "Kannada":"ಕನ್ನಡ",
  "English":"ಇಂಗ್ಲಿಷ್",
  "Hindi":"ಹಿಂದಿ",
  "Tamil":"ತಮಿಳು",
  "Telugu":"ತೆಲುಗು",
  "Previous Experience (optional)":"ಹಿಂದಿನ ಅನುಭವ (ಐಚ್ಛಿಕ)",
  "Additional Information (optional)":"ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ (ಐಚ್ಛಿಕ)",
  "Registration is completely free. Task allocation depends on local business requirements.":"ನೋಂದಣಿ ಸಂಪೂರ್ಣ ಉಚಿತ. ಕೆಲಸದ ಹಂಚಿಕೆ ಸ್ಥಳೀಯ ವ್ಯಾಪಾರದ ಅವಶ್ಯಕತೆಗಳ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿರುತ್ತದೆ.",
  "♥   Register Interest — Join Nishka":"♥   ಆಸಕ್ತಿ ನೋಂದಾಯಿಸಿ — ನಿಷ್ಕಾಗೆ ಸೇರಿ",
  "Navigation":"ನ್ಯಾವಿಗೇಶನ್",
  "Home":"ಮುಖಪುಟ",
  "Work Categories":"ಕೆಲಸದ ವಿಭಾಗಗಳು",
  "Sticker & Labeling":"ಸ್ಟಿಕ್ಕರ್ ಮತ್ತು ಲೇಬಲಿಂಗ್",
  "Contact Details":"ಸಂಪರ್ಕ ವಿವರಗಳು",
  "The process":"ಪ್ರಕ್ರಿಯೆ",
  "From requirement to completion.":"ಅವಶ್ಯಕತೆಯಿಂದ ಪೂರ್ಣಗೊಳಿಸುವವರೆಗೆ.",
  "Share work type, quantity and target date.":"ಕೆಲಸದ ಪ್ರಕಾರ, ಪ್ರಮಾಣ ಮತ್ತು ಗುರಿ ದಿನಾಂಕವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.",
  "We discuss scope, quality and logistics.":"ಕೆಲಸದ ವ್ಯಾಪ್ತಿ, ಗುಣಮಟ್ಟ ಮತ್ತು ಸಾಗಣೆಯನ್ನು ಚರ್ಚಿಸುತ್ತೇವೆ.",
  "Suitable work is planned with available capacity.":"ಲಭ್ಯ ಸಾಮರ್ಥ್ಯಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಸೂಕ್ತ ಕೆಲಸವನ್ನು ಯೋಜಿಸಲಾಗುತ್ತದೆ.",
  "Completed work is checked against agreed criteria.":"ಪೂರ್ಣಗೊಂಡ ಕೆಲಸವನ್ನು ಒಪ್ಪಿಕೊಂಡ ಮಾನದಂಡಗಳ ಪ್ರಕಾರ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ."
};
const KANNADA_PLACEHOLDERS = {
  "e.g. packing, stitching, craft work":"ಉದಾ: ಪ್ಯಾಕಿಂಗ್, ಹೊಲಿಗೆ, ಕರಕುಶಲ ಕೆಲಸ",
  "Anything else you'd like our team to know":"ನಮ್ಮ ತಂಡ ತಿಳಿದುಕೊಳ್ಳಬೇಕಾದ ಇತರೆ ಮಾಹಿತಿ",
  "Your full name":"ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು",
  "e.g. Jayanagar, JP Nagar, BTM Layout":"ಉದಾ: ಜಯನಗರ, ಜೆ.ಪಿ. ನಗರ, ಬಿಟಿಎಂ ಲೇಔಟ್",
  "How can we assist you?":"ನಾವು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
  "Full name":"ಪೂರ್ಣ ಹೆಸರು",
  "email@domain.com":"email@domain.com"
};
function applySiteWideKannada(lang) {
  const useKannada = lang === "kn";
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const parent = node.parentElement;
    if (!parent || parent.closest("[data-en][data-kn],script,style")) return;
    const original = node.__nishkaOriginalText || node.nodeValue;
    node.__nishkaOriginalText = original;
    const trimmed = original.trim();
    if (!trimmed) return;
    const translated = KANNADA_TEXT[trimmed];
    if (translated) node.nodeValue = original.replace(trimmed, useKannada ? translated : trimmed);
  });
  document.querySelectorAll("input[placeholder],textarea[placeholder]").forEach(el => {
    const original = el.getAttribute("data-original-placeholder") || el.placeholder;
    if (!el.hasAttribute("data-original-placeholder")) el.setAttribute("data-original-placeholder", original);
    el.placeholder = useKannada ? (KANNADA_PLACEHOLDERS[original] || original) : original;
  });
  document.querySelectorAll("label[for]").forEach(label => {
    const original = label.getAttribute("data-original-label") || label.textContent.trim();
    if (!label.hasAttribute("data-original-label")) label.setAttribute("data-original-label", original);
    const translated = KANNADA_TEXT[original.replace(/\\s*\\*$/, "")];
    if (translated) {
      const star = /\\*$/.test(original) ? " *" : "";
      label.textContent = useKannada ? translated + star : original;
    }
  });
}
