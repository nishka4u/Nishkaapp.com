const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbysTlvsCNKAw7uJ9a5FfQUtkMncy7R7uKL-sS2pyI28QK9QjljFHd4wvk23W9rr1sDX/exec";
let currentLanguage = localStorage.getItem("language") === "kn" ? "kn" : "en";

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
    langToggle.addEventListener("click", event => {
      const labels = langToggle.querySelectorAll("span");
      const clickedLabel = event.target.closest("span");
      const selectedLanguage = clickedLabel === labels[0] ? "en" : "kn";
      switchLanguage(selectedLanguage);
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

const KN_TRANSLATIONS = {
  "Skip to main content":"ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ತೆರಳಿ","Home":"ಮುಖಪುಟ","About Us":"ನಮ್ಮ ಬಗ್ಗೆ","For Businesses":"ವ್ಯಾಪಾರಿಗಳಿಗೆ","For Homemakers":"ಗೃಹಿಣಿಯರಿಗೆ","Workflow":"ಕಾರ್ಯವಿಧಾನ","Quality Assurance":"ಗುಣಮಟ್ಟದ ಭರವಸೆ","FAQs":"ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು","Contact":"ಸಂಪರ್ಕಿಸಿ","Contact Us":"ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ","Join Nishka":"ನಿಷ್ಕಾಗೆ ಸೇರಿ",
  "Managed Work Coordination Platform":"ನಿರ್ವಹಿತ ಕೆಲಸದ ಸಮನ್ವಯ ವೇದಿಕೆ","Connecting Businesses With Trusted Homemakers.":"ವ್ಯಾಪಾರಗಳನ್ನು ವಿಶ್ವಾಸಾರ್ಹ ಗೃಹಿಣಿಯರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವುದು.","Nishka helps businesses coordinate suitable packaging, labeling, sorting, assembly and other repetitive work while creating opportunities for homemakers to earn through completed tasks.":"ಪ್ಯಾಕಿಂಗ್, ಲೇಬಲಿಂಗ್, ವಿಂಗಡಣೆ, ಜೋಡಣೆ ಮತ್ತು ಇತರ ಪುನರಾವರ್ತಿತ ಕೆಲಸಗಳನ್ನು ಸಮನ್ವಯಗೊಳಿಸಲು ನಿಷ್ಕಾ ವ್ಯಾಪಾರಗಳಿಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಪೂರ್ಣಗೊಳಿಸಿದ ಕೆಲಸಗಳ ಮೂಲಕ ಗೃಹಿಣಿಯರಿಗೆ ಆದಾಯ ಗಳಿಸುವ ಅವಕಾಶವನ್ನೂ ಒದಗಿಸುತ್ತದೆ.","Nishka — Bridging Businesses & Homemakers.":"ನಿಷ್ಕಾ — ವ್ಯಾಪಾರಗಳು ಮತ್ತು ಗೃಹಿಣಿಯರನ್ನು ಸಂಪರ್ಕಿಸುವ ಸೇತುವೆ.","Real Tasks. Real Work. Real Earnings.":"ನೈಜ ಕೆಲಸಗಳು. ನೈಜ ಉದ್ಯೋಗ. ನೈಜ ಆದಾಯ.","Submit a Work Requirement":"ಕೆಲಸದ ಅವಶ್ಯಕತೆಯನ್ನು ಸಲ್ಲಿಸಿ","Quality Verified Batches":"ಗುಣಮಟ್ಟ ಪರಿಶೀಲಿಸಿದ ಕೆಲಸದ ಬ್ಯಾಚ್‌ಗಳು","Structured Handover":"ಕ್ರಮಬದ್ಧ ಹಸ್ತಾಂತರ","Dignified Task Earning":"ಗೌರವಯುತ ಕೆಲಸದ ಆದಾಯ",
  "Avenza Solutions Private Limited":"ಅವೆನ್ಜಾ ಸೊಲ್ಯೂಷನ್ಸ್ ಪ್ರೈವೇಟ್ ಲಿಮಿಟೆಡ್","Operating Nishka's structured work coordination across Bengaluru.":"ಬೆಂಗಳೂರಿನಾದ್ಯಂತ ನಿಷ್ಕಾದ ಕ್ರಮಬದ್ಧ ಕೆಲಸದ ಸಮನ್ವಯವನ್ನು ನಿರ್ವಹಿಸುತ್ತದೆ.","Clear task requirements":"ಸ್ಪಷ್ಟ ಕೆಲಸದ ಅವಶ್ಯಕತೆಗಳು","Managed coordination":"ನಿರ್ವಹಿತ ಸಮನ್ವಯ","Quality checks":"ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ","No joining fee":"ಸೇರ್ಪಡೆ ಶುಲ್ಕವಿಲ್ಲ",
  "Structured work coordination":"ಕ್ರಮಬದ್ಧ ಕೆಲಸದ ಸಮನ್ವಯ","Creating Value For Businesses & Homemakers":"ವ್ಯಾಪಾರಗಳು ಮತ್ತು ಗೃಹಿಣಿಯರಿಗೆ ಮೌಲ್ಯ ಸೃಷ್ಟಿ","Nishka acts as a managed operational bridge, organizing task allocation, material handover, quality verification, and transparent settlement.":"ಕೆಲಸದ ಹಂಚಿಕೆ, ಸಾಮಗ್ರಿಗಳ ಹಸ್ತಾಂತರ, ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ ಮತ್ತು ಪಾರದರ್ಶಕ ಪಾವತಿಯನ್ನು ಸಂಘಟಿಸುವ ಮೂಲಕ ನಿಷ್ಕಾ ನಿರ್ವಹಿತ ಕಾರ್ಯಾಚರಣಾ ಸೇತುವೆಯಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.",
  "FOR BUSINESSES":"ವ್ಯಾಪಾರಿಗಳಿಗಾಗಿ","Reliable Operational Scaling":"ವಿಶ್ವಾಸಾರ್ಹ ಕಾರ್ಯಾಚರಣಾ ವಿಸ್ತರಣೆ","Outsource non-technical repetitive manual tasks without adding fixed headcount overhead or expanding physical facility footprints.":"ಹೆಚ್ಚುವರಿ ಶಾಶ್ವತ ಸಿಬ್ಬಂದಿ ವೆಚ್ಚ ಅಥವಾ ಭೌತಿಕ ಸೌಲಭ್ಯಗಳನ್ನು ಹೆಚ್ಚಿಸದೆ ತಾಂತ್ರಿಕವಲ್ಲದ ಪುನರಾವರ್ತಿತ ಕೈಕೆಲಸಗಳನ್ನು ಹೊರಗುತ್ತಿಗೆ ನೀಡಿ.","Managed task allocation & quality checks":"ನಿರ್ವಹಿತ ಕೆಲಸದ ಹಂಚಿಕೆ ಮತ್ತು ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ","Flexible batch execution for seasonal demand":"ಋತುಮಾನಿಕ ಬೇಡಿಕೆಗೆ ಹೊಂದುವಂತೆ ಬ್ಯಾಚ್ ಕೆಲಸದ ನಿರ್ವಹಣೆ","Structured material handover & return protocols":"ಸಾಮಗ್ರಿಗಳ ಹಸ್ತಾಂತರ ಮತ್ತು ವಾಪಸಾತಿಗೆ ಕ್ರಮಬದ್ಧ ವಿಧಾನ","Clear per-unit or batch quotation transparency":"ಪ್ರತಿ ಘಟಕ ಅಥವಾ ಬ್ಯಾಚ್‌ಗೆ ಸ್ಪಷ್ಟ ದರದ ವಿವರ","Explore Business Support":"ವ್ಯಾಪಾರ ಬೆಂಬಲದ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ",
  "FOR HOMEMAKERS":"ಗೃಹಿಣಿಯರಿಗಾಗಿ","Dignified Task-Based Opportunities":"ಗೌರವಯುತ ಕೆಲಸದ ಆಧಾರಿತ ಅವಕಾಶಗಳು","Access suitable work opportunities that can be performed flexibly around domestic and household routines.":"ಮನೆಯ ಮತ್ತು ಕುಟುಂಬದ ದಿನಚರಿಗೆ ಹೊಂದುವಂತೆ ಅನುಕೂಲಕರ ಸಮಯದಲ್ಲಿ ಮಾಡಬಹುದಾದ ಸೂಕ್ತ ಕೆಲಸದ ಅವಕಾಶಗಳನ್ನು ಪಡೆಯಿರಿ.","Clear task rates & instructions upfront":"ಕೆಲಸದ ದರ ಮತ್ತು ಸೂಚನೆಗಳು ಮುಂಚಿತವಾಗಿ ಸ್ಪಷ್ಟ","Work from home with localized coordination":"ಸ್ಥಳೀಯ ಸಮನ್ವಯದೊಂದಿಗೆ ಮನೆಯಿಂದಲೇ ಕೆಲಸ","No upfront registration or membership fees":"ಮುಂಗಡ ನೋಂದಣಿ ಅಥವಾ ಸದಸ್ಯತ್ವ ಶುಲ್ಕವಿಲ್ಲ","Timely payments based on completed verified work":"ಪರಿಶೀಲಿಸಿ ಪೂರ್ಣಗೊಳಿಸಿದ ಕೆಲಸಕ್ಕೆ ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಪಾವತಿ","Join as a Homemaker":"ಗೃಹಿಣಿಯಾಗಿ ಸೇರಿ",
  "Merchant solutions":"ವ್ಯಾಪಾರಿಗಳಿಗೆ ಪರಿಹಾರಗಳು","Reliable Support for Your Repetitive Work":"ನಿಮ್ಮ ಪುನರಾವರ್ತಿತ ಕೆಲಸಗಳಿಗೆ ವಿಶ್ವಾಸಾರ್ಹ ಬೆಂಬಲ","Submit your work requirements and let Nishka organize material assessment, worker allocation, batch execution, quality verification, and timely return.":"ನಿಮ್ಮ ಕೆಲಸದ ಅವಶ್ಯಕತೆಗಳನ್ನು ಸಲ್ಲಿಸಿ. ಸಾಮಗ್ರಿಗಳ ಪರಿಶೀಲನೆ, ಕೆಲಸಗಾರರ ಹಂಚಿಕೆ, ಬ್ಯಾಚ್ ಕಾರ್ಯಗತಗೊಳಿಸುವಿಕೆ, ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ ಮತ್ತು ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ವಾಪಸಾತಿಯನ್ನು ನಿಷ್ಕಾ ಸಮನ್ವಯಗೊಳಿಸುತ್ತದೆ.",
  "Product Packaging & Packing":"ಉತ್ಪನ್ನಗಳ ಪ್ಯಾಕೇಜಿಂಗ್ ಮತ್ತು ಪ್ಯಾಕಿಂಗ್","Packing suitable finished products, cosmetic jars, artisan goods, and items into protective cardboard or custom packaging according to client specifications.":"ಗ್ರಾಹಕರ ಸೂಚನೆಗಳಂತೆ ಸಿದ್ಧ ಉತ್ಪನ್ನಗಳು, ಸೌಂದರ್ಯವರ್ಧಕ ಬಾಟಲಿಗಳು ಮತ್ತು ಕರಕುಶಲ ವಸ್ತುಗಳನ್ನು ಸುರಕ್ಷಿತ ಅಥವಾ ಕಸ್ಟಮ್ ಪ್ಯಾಕಿಂಗ್‌ನಲ್ಲಿ ಪ್ಯಾಕ್ ಮಾಡುವುದು.","Label & Sticker Application":"ಲೇಬಲ್ ಮತ್ತು ಸ್ಟಿಕ್ಕರ್ ಅಳವಡಿಕೆ","Precise alignment and application of brand stickers, barcode tags, price labels, and batch information tags on product packaging.":"ಉತ್ಪನ್ನ ಪ್ಯಾಕೇಜಿಂಗ್ ಮೇಲೆ ಬ್ರ್ಯಾಂಡ್ ಸ್ಟಿಕ್ಕರ್‌ಗಳು, ಬಾರ್‌ಕೋಡ್ ಟ್ಯಾಗ್‌ಗಳು, ಬೆಲೆ ಲೇಬಲ್‌ಗಳು ಮತ್ತು ಬ್ಯಾಚ್ ಮಾಹಿತಿ ಟ್ಯಾಗ್‌ಗಳನ್ನು ನಿಖರವಾಗಿ ಅಳವಡಿಸುವುದು.","Sorting & Classification":"ವಿಂಗಡಣೆ ಮತ್ತು ವರ್ಗೀಕರಣ","Categorizing, grouping, and organizing items according to SKU types, color codes, weight groups, or visual quality checks.":"SKU ಪ್ರಕಾರ, ಬಣ್ಣ ಸಂಕೇತ, ತೂಕದ ಗುಂಪು ಅಥವಾ ದೃಶ್ಯ ಗುಣಮಟ್ಟದ ಆಧಾರದ ಮೇಲೆ ವಸ್ತುಗಳನ್ನು ವರ್ಗೀಕರಿಸಿ ಜೋಡಿಸುವುದು.","Garment Folding & Finishing":"ಬಟ್ಟೆ ಮಡಚುವಿಕೆ ಮತ್ತು ಅಂತಿಮ ಸಿದ್ಧತೆ","Neat folding, tag attachment, polybag packaging, and finishing for apparel items, towels, linens, and fabric goods.":"ಉಡುಪುಗಳು, ಟವೆಲ್‌ಗಳು ಮತ್ತು ಬಟ್ಟೆ ವಸ್ತುಗಳನ್ನು ಅಚ್ಚುಕಟ್ಟಾಗಿ ಮಡಚುವುದು, ಟ್ಯಾಗ್ ಅಳವಡಿಸುವುದು ಮತ್ತು ಪಾಲಿಬ್ಯಾಗ್‌ನಲ್ಲಿ ಪ್ಯಾಕ್ ಮಾಡುವುದು.","Gift Hamper & Kit Assembly":"ಉಡುಗೊರೆ ಹ್ಯಾಂಪರ್ ಮತ್ತು ಕಿಟ್ ಜೋಡಣೆ","Assembling multi-item gift boxes, festive hampers, corporate kits, and promotional sample sets with decorative wrapping.":"ಬಹು ವಸ್ತುಗಳ ಉಡುಗೊರೆ ಪೆಟ್ಟಿಗೆಗಳು, ಹಬ್ಬದ ಹ್ಯಾಂಪರ್‌ಗಳು, ಕಾರ್ಪೊರೇಟ್ ಕಿಟ್‌ಗಳು ಮತ್ತು ಪ್ರಚಾರ ಮಾದರಿಗಳನ್ನು ಅಲಂಕಾರಿಕವಾಗಿ ಜೋಡಿಸುವುದು.","Printing & Collateral Sorting":"ಮುದ್ರಿತ ಸಾಮಗ್ರಿಗಳ ವಿಂಗಡಣೆ","Sorting print collateral, bundling brochures, tying decorative ribbons on invitation cards, and assembling press folders.":"ಮುದ್ರಿತ ಸಾಮಗ್ರಿಗಳನ್ನು ವಿಂಗಡಿಸುವುದು, ಬ್ರೋಷರ್‌ಗಳನ್ನು ಕಟ್ಟು ಮಾಡುವುದು, ಆಹ್ವಾನ ಪತ್ರಿಕೆಗಳಿಗೆ ರಿಬ್ಬನ್ ಕಟ್ಟುವುದು ಮತ್ತು ಪ್ರೆಸ್ ಫೋಲ್ಡರ್‌ಗಳನ್ನು ಜೋಡಿಸುವುದು.",
  "Request a quotation":"ದರದ ವಿವರ ಕೇಳಿ","Submit a Business Work Requirement":"ವ್ಯಾಪಾರದ ಕೆಲಸದ ಅವಶ್ಯಕತೆಯನ್ನು ಸಲ್ಲಿಸಿ","Provide details about your operational task needs and our team will get in touch to assess the scope and timeline.":"ನಿಮ್ಮ ಕೆಲಸದ ಅವಶ್ಯಕತೆಗಳ ವಿವರಗಳನ್ನು ನೀಡಿ. ಕೆಲಸದ ವ್ಯಾಪ್ತಿ ಮತ್ತು ಸಮಯಾವಧಿಯನ್ನು ಪರಿಶೀಲಿಸಲು ನಮ್ಮ ತಂಡ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ.","Business Name":"ವ್ಯಾಪಾರದ ಹೆಸರು","Contact Person Name":"ಸಂಪರ್ಕ ವ್ಯಕ್ತಿಯ ಹೆಸರು","Phone Number":"ದೂರವಾಣಿ ಸಂಖ್ಯೆ","Business Email":"ವ್ಯಾಪಾರದ ಇಮೇಲ್","Business Category":"ವ್ಯಾಪಾರದ ವರ್ಗ","Select your industry...":"ನಿಮ್ಮ ಉದ್ಯಮವನ್ನು ಆಯ್ಕೆಮಾಡಿ...","Garments & Textiles":"ಉಡುಪುಗಳು ಮತ್ತು ಜವಳಿ","Printing Press":"ಮುದ್ರಣಾಲಯ","Product Packaging":"ಉತ್ಪನ್ನ ಪ್ಯಾಕೇಜಿಂಗ್","Gifting & Hampers":"ಉಡುಗೊರೆಗಳು ಮತ್ತು ಹ್ಯಾಂಪರ್‌ಗಳು","Retail & E-commerce":"ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರ ಮತ್ತು ಇ-ಕಾಮರ್ಸ್","Other":"ಇತರೆ","Approximate Quantity / Batch Size":"ಅಂದಾಜು ಪ್ರಮಾಣ / ಬ್ಯಾಚ್ ಗಾತ್ರ","Select volume range...":"ಪ್ರಮಾಣದ ವ್ಯಾಪ್ತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ...","Under 100 units":"100 ಘಟಕಗಳಿಗಿಂತ ಕಡಿಮೆ","100–500 units":"100–500 ಘಟಕಗಳು","501–1,000 units":"501–1,000 ಘಟಕಗಳು","1,001–5,000 units":"1,001–5,000 ಘಟಕಗಳು","More than 5,000 units":"5,000 ಘಟಕಗಳಿಗಿಂತ ಹೆಚ್ಚು","Target Completion Date":"ಪೂರ್ಣಗೊಳಿಸುವ ಗುರಿ ದಿನಾಂಕ","Material Handover Location (Bengaluru)":"ಸಾಮಗ್ರಿ ಹಸ್ತಾಂತರ ಸ್ಥಳ (ಬೆಂಗಳೂರು)","Type of Work Required (Select all that apply)":"ಅಗತ್ಯವಿರುವ ಕೆಲಸದ ಪ್ರಕಾರ (ಅನ್ವಯಿಸುವ ಎಲ್ಲವನ್ನೂ ಆಯ್ಕೆಮಾಡಿ)","Label / Sticker Application":"ಲೇಬಲ್ / ಸ್ಟಿಕ್ಕರ್ ಅಳವಡಿಕೆ","Sorting & Counting":"ವಿಂಗಡಣೆ ಮತ್ತು ಎಣಿಕೆ","Garment / Paper Folding":"ಬಟ್ಟೆ / ಕಾಗದ ಮಡಚುವಿಕೆ","Gift Kit Assembly":"ಉಡುಗೊರೆ ಕಿಟ್ ಜೋಡಣೆ","Additional Work Instructions / Material Notes":"ಹೆಚ್ಚುವರಿ ಕೆಲಸದ ಸೂಚನೆಗಳು / ಸಾಮಗ್ರಿಗಳ ಟಿಪ್ಪಣಿಗಳು","Our operations coordinator will review your requirement and reach out within 24 business hours.":"ನಮ್ಮ ಕಾರ್ಯಾಚರಣೆ ಸಂಯೋಜಕರು ನಿಮ್ಮ ಅವಶ್ಯಕತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ 24 ಕೆಲಸದ ಗಂಟೆಗಳೊಳಗೆ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತಾರೆ.",
  "The process":"ಕಾರ್ಯವಿಧಾನ","From requirement to completion.":"ಅವಶ್ಯಕತೆಯಿಂದ ಪೂರ್ಣಗೊಳಿಸುವವರೆಗೆ.","Submit":"ಸಲ್ಲಿಸಿ","Share work type, quantity and target date.":"ಕೆಲಸದ ಪ್ರಕಾರ, ಪ್ರಮಾಣ ಮತ್ತು ಗುರಿ ದಿನಾಂಕವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.","Review":"ಪರಿಶೀಲನೆ","We discuss scope, quality and logistics.":"ಕೆಲಸದ ವ್ಯಾಪ್ತಿ, ಗುಣಮಟ್ಟ ಮತ್ತು ಸಾಗಣೆ ಕುರಿತು ಚರ್ಚಿಸುತ್ತೇವೆ.","Coordinate":"ಸಮನ್ವಯ","Suitable work is planned with available capacity.":"ಲಭ್ಯ ಸಾಮರ್ಥ್ಯಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಸೂಕ್ತ ಕೆಲಸವನ್ನು ಯೋಜಿಸುತ್ತೇವೆ.","Quality check":"ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ","Completed work is checked against agreed criteria.":"ಪೂರ್ಣಗೊಂಡ ಕೆಲಸವನ್ನು ಒಪ್ಪಿಕೊಂಡ ಮಾನದಂಡಗಳ ಪ್ರಕಾರ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.",
  "EARN ON YOUR TERMS":"ನಿಮ್ಮ ಅನುಕೂಲಕ್ಕೆ ತಕ್ಕಂತೆ ಗಳಿಸಿ","Your Skills. Your Time. Your Opportunity.":"ನಿಮ್ಮ ಕೌಶಲ್ಯ. ನಿಮ್ಮ ಸಮಯ. ನಿಮ್ಮ ಅವಕಾಶ.","Nishka connects homemakers with suitable task-based work opportunities in Bengaluru that can fit around household commitments.":"ಮನೆಯ ಜವಾಬ್ದಾರಿಗಳಿಗೆ ಹೊಂದುವಂತಹ ಸೂಕ್ತ ಕೆಲಸದ ಅವಕಾಶಗಳೊಂದಿಗೆ ಬೆಂಗಳೂರಿನ ಗೃಹಿಣಿಯರನ್ನು ನಿಷ್ಕಾ ಸಂಪರ್ಕಿಸುತ್ತದೆ.","Important Participation Information":"ಭಾಗವಹಿಸುವ ಕುರಿತು ಪ್ರಮುಖ ಮಾಹಿತಿ","Task availability depends on active business requirements in your area.":"ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿನ ಸಕ್ರಿಯ ವ್ಯಾಪಾರ ಅವಶ್ಯಕತೆಗಳ ಮೇಲೆ ಕೆಲಸದ ಲಭ್ಯತೆ ಅವಲಂಬಿತವಾಗಿರುತ್ತದೆ.","Income is based on completed tasks according to agreed per-unit terms.":"ಒಪ್ಪಿಕೊಂಡ ಪ್ರತಿ ಘಟಕದ ದರದಂತೆ ಪೂರ್ಣಗೊಳಿಸಿದ ಕೆಲಸಕ್ಕೆ ಆದಾಯ ನೀಡಲಾಗುತ್ತದೆ.","Nishka does not charge any registration fees or mandatory upfront subscription costs.":"ನಿಷ್ಕಾ ಯಾವುದೇ ನೋಂದಣಿ ಶುಲ್ಕ ಅಥವಾ ಕಡ್ಡಾಯ ಮುಂಗಡ ಚಂದಾ ಶುಲ್ಕವನ್ನು ವಿಧಿಸುವುದಿಲ್ಲ.","Express Interest":"ಆಸಕ್ತಿ ತಿಳಿಸಿ","Submit your details through our onboarding request form indicating your location in Bengaluru and available hours.":"ಬೆಂಗಳೂರಿನಲ್ಲಿನ ನಿಮ್ಮ ಸ್ಥಳ ಮತ್ತು ಲಭ್ಯ ಸಮಯವನ್ನು ತಿಳಿಸಿ ನಮ್ಮ ಸೇರ್ಪಡೆ ವಿನಂತಿ ಫಾರ್ಮ್ ಮೂಲಕ ವಿವರಗಳನ್ನು ಸಲ್ಲಿಸಿ.","Task Allocation":"ಕೆಲಸದ ಹಂಚಿಕೆ","Receive notifications for suitable packaging, labeling, or assembly batches that match your skill set and locality.":"ನಿಮ್ಮ ಕೌಶಲ್ಯ ಮತ್ತು ಪ್ರದೇಶಕ್ಕೆ ಹೊಂದುವ ಪ್ಯಾಕಿಂಗ್, ಲೇಬಲಿಂಗ್ ಅಥವಾ ಜೋಡಣೆ ಕೆಲಸಗಳ ಬ್ಯಾಚ್‌ಗಳ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.","Material Handover":"ಸಾಮಗ್ರಿಗಳ ಹಸ್ತಾಂತರ","Raw materials and clear work instructions are delivered to or picked up from designated local coordination points.":"ಕಚ್ಚಾ ಸಾಮಗ್ರಿಗಳು ಮತ್ತು ಸ್ಪಷ್ಟ ಕೆಲಸದ ಸೂಚನೆಗಳನ್ನು ನಿಗದಿತ ಸ್ಥಳೀಯ ಸಮನ್ವಯ ಕೇಂದ್ರಗಳಲ್ಲಿ ತಲುಪಿಸಲಾಗುತ್ತದೆ ಅಥವಾ ಅಲ್ಲಿಂದ ಪಡೆದುಕೊಳ್ಳಬಹುದು.","Quality & Payout":"ಗುಣಮಟ್ಟ ಮತ್ತು ಪಾವತಿ","Complete tasks carefully according to quality instructions and receive transparent direct payments for verified units.":"ಗುಣಮಟ್ಟದ ಸೂಚನೆಗಳ ಪ್ರಕಾರ ಕೆಲಸವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ, ಪರಿಶೀಲಿಸಿದ ಘಟಕಗಳಿಗೆ ಪಾರದರ್ಶಕವಾಗಿ ನೇರ ಪಾವತಿ ಪಡೆಯಿರಿ.",
  "REGISTER INTEREST":"ಆಸಕ್ತಿ ನೋಂದಾಯಿಸಿ","Join Nishka as a Homemaker":"ಗೃಹಿಣಿಯಾಗಿ ನಿಷ್ಕಾಗೆ ಸೇರಿ","Fill in your details below to begin the onboarding and skill alignment process.":"ಸೇರ್ಪಡೆ ಮತ್ತು ಕೌಶಲ್ಯ ಹೊಂದಾಣಿಕೆ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಪ್ರಾರಂಭಿಸಲು ಕೆಳಗೆ ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.","Full Name":"ಪೂರ್ಣ ಹೆಸರು","Mobile Phone Number":"ಮೊಬೈಲ್ ದೂರವಾಣಿ ಸಂಖ್ಯೆ","Locality / Area in Bengaluru":"ಬೆಂಗಳೂರಿನ ಪ್ರದೇಶ / ಸ್ಥಳ","Daily Available Time":"ಪ್ರತಿದಿನ ಲಭ್ಯವಿರುವ ಸಮಯ","Select availability...":"ಲಭ್ಯತೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ...","1–2 hours":"1–2 ಗಂಟೆಗಳು","2–3 hours":"2–3 ಗಂಟೆಗಳು","3–4 hours":"3–4 ಗಂಟೆಗಳು","4+ hours":"4+ ಗಂಟೆಗಳು","Flexible / varies daily":"ಅನುಕೂಲಕ್ಕೆ ತಕ್ಕಂತೆ / ಪ್ರತಿದಿನ ಬದಲಾಗುತ್ತದೆ","Work Preferences":"ಕೆಲಸದ ಆದ್ಯತೆಗಳು","Box & Pouch Packing":"ಬಾಕ್ಸ್ ಮತ್ತು ಪೌಚ್ ಪ್ಯಾಕಿಂಗ್","Sticker Labeling":"ಸ್ಟಿಕ್ಕರ್ ಲೇಬಲಿಂಗ್","Item Sorting":"ವಸ್ತುಗಳ ವಿಂಗಡಣೆ","Gift Hamper Assembly":"ಉಡುಗೊರೆ ಹ್ಯಾಂಪರ್ ಜೋಡಣೆ","Preferred Contact Language":"ಸಂಪರ್ಕಿಸಲು ಇಷ್ಟದ ಭಾಷೆ","Previous Experience (optional)":"ಹಿಂದಿನ ಅನುಭವ (ಐಚ್ಛಿಕ)","Additional Information (optional)":"ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ (ಐಚ್ಛಿಕ)","Registration is completely free. Task allocation depends on local business requirements.":"ನೋಂದಣಿ ಸಂಪೂರ್ಣ ಉಚಿತ. ಕೆಲಸದ ಹಂಚಿಕೆ ಸ್ಥಳೀಯ ವ್ಯಾಪಾರ ಅವಶ್ಯಕತೆಗಳನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ.","Joining Nishka is currently free, with no registration or joining fees. If any service charges or subscription plans are introduced in the future, we will communicate the details transparently in advance.":"ಪ್ರಸ್ತುತ ನಿಷ್ಕಾಗೆ ಸೇರುವುದು ಸಂಪೂರ್ಣ ಉಚಿತ; ಯಾವುದೇ ನೋಂದಣಿ ಅಥವಾ ಸೇರ್ಪಡೆ ಶುಲ್ಕವಿಲ್ಲ. ಭವಿಷ್ಯದಲ್ಲಿ ಸೇವಾ ಶುಲ್ಕ ಅಥವಾ ಚಂದಾ ಯೋಜನೆಗಳನ್ನು ಪರಿಚಯಿಸಿದರೆ, ಅದರ ವಿವರಗಳನ್ನು ಮುಂಚಿತವಾಗಿ ಪಾರದರ್ಶಕವಾಗಿ ತಿಳಿಸಲಾಗುತ್ತದೆ.","Register Interest — Join Nishka":"ಆಸಕ್ತಿ ನೋಂದಾಯಿಸಿ — ನಿಷ್ಕಾಗೆ ಸೇರಿ",
  "About Nishka":"ನಿಷ್ಕಾ ಬಗ್ಗೆ","Bridging Business Utility & Homemaker Potential":"ವ್ಯಾಪಾರದ ಅಗತ್ಯ ಮತ್ತು ಗೃಹಿಣಿಯರ ಸಾಮರ್ಥ್ಯವನ್ನು ಸಂಪರ್ಕಿಸುವುದು","Nishka was founded to create an organized, dignified work coordination system that connects growing businesses with dedicated homemakers in local communities.":"ಬೆಳೆಯುತ್ತಿರುವ ವ್ಯಾಪಾರಗಳನ್ನು ಸ್ಥಳೀಯ ಸಮುದಾಯಗಳ ಸಮರ್ಪಿತ ಗೃಹಿಣಿಯರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವ ಕ್ರಮಬದ್ಧ ಮತ್ತು ಗೌರವಯುತ ಕೆಲಸದ ಸಮನ್ವಯ ವ್ಯವಸ್ಥೆಯನ್ನು ನಿರ್ಮಿಸಲು ನಿಷ್ಕಾವನ್ನು ಸ್ಥಾಪಿಸಲಾಗಿದೆ.","OUR PRINCIPLES":"ನಮ್ಮ ತತ್ವಗಳು","Nishka Brand Values":"ನಿಷ್ಕಾದ ಮೌಲ್ಯಗಳು","Trust":"ನಂಬಿಕೆ","Built through transparent communication, dependable fulfillment, and honest business practices.":"ಪಾರದರ್ಶಕ ಸಂವಹನ, ವಿಶ್ವಾಸಾರ್ಹ ಕಾರ್ಯನಿರ್ವಹಣೆ ಮತ್ತು ಪ್ರಾಮಾಣಿಕ ವ್ಯಾಪಾರ ಪದ್ಧತಿಗಳ ಮೂಲಕ ನಂಬಿಕೆಯನ್ನು ಬೆಳೆಸುವುದು.","Dignity":"ಗೌರವ","Respecting the time, skills, and household commitments of homemakers in every task allocated.":"ಪ್ರತಿ ಕೆಲಸ ಹಂಚಿಕೆಯಲ್ಲಿ ಗೃಹಿಣಿಯರ ಸಮಯ, ಕೌಶಲ್ಯ ಮತ್ತು ಕುಟುಂಬದ ಜವಾಬ್ದಾರಿಗಳಿಗೆ ಗೌರವ ನೀಡುವುದು.","Reliability":"ವಿಶ್ವಾಸಾರ್ಹತೆ","Strict adherence to quality checklists, batch volume deadlines, and merchant instructions.":"ಗುಣಮಟ್ಟದ ಪರಿಶೀಲನಾ ಪಟ್ಟಿಗಳು, ಬ್ಯಾಚ್ ಗಡುವುಗಳು ಮತ್ತು ವ್ಯಾಪಾರಿಗಳ ಸೂಚನೆಗಳನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಪಾಲಿಸುವುದು.","Transparency":"ಪಾರದರ್ಶಕತೆ","Clear rate communication, honest task expectations, and straightforward payout schedules.":"ದರಗಳ ಸ್ಪಷ್ಟ ಮಾಹಿತಿ, ಕೆಲಸದ ನೈಜ ನಿರೀಕ್ಷೆಗಳು ಮತ್ತು ಸರಳ ಪಾವತಿ ವೇಳಾಪಟ್ಟಿಗಳು.","Quality":"ಗುಣಮಟ್ಟ","Managed verification workflows ensuring zero-defect deliverables for every business partner.":"ಪ್ರತಿ ವ್ಯಾಪಾರ ಪಾಲುದಾರರಿಗೆ ದೋಷರಹಿತ ಫಲಿತಾಂಶ ಒದಗಿಸಲು ನಿರ್ವಹಿತ ಪರಿಶೀಲನಾ ವಿಧಾನಗಳು.","Opportunity":"ಅವಕಾಶ","Expanding accessible, home-aligned economic growth for women across local neighborhoods.":"ಸ್ಥಳೀಯ ಪ್ರದೇಶಗಳ ಮಹಿಳೆಯರಿಗೆ ಸುಲಭವಾಗಿ ದೊರೆಯುವ, ಮನೆಗೆ ಹೊಂದುವ ಆರ್ಥಿಕ ಬೆಳವಣಿಗೆಯ ಅವಕಾಶಗಳನ್ನು ವಿಸ್ತರಿಸುವುದು.",
  "GET IN TOUCH":"ಸಂಪರ್ಕದಲ್ಲಿರಿ","Connect With Nishka":"ನಿಷ್ಕಾ ಜೊತೆ ಸಂಪರ್ಕಿಸಿ","Reach out to discuss merchant work coordination, homemaker onboarding, or business partnership inquiries.":"ವ್ಯಾಪಾರ ಕೆಲಸದ ಸಮನ್ವಯ, ಗೃಹಿಣಿಯರ ಸೇರ್ಪಡೆ ಅಥವಾ ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆ ಕುರಿತು ಚರ್ಚಿಸಲು ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ.","Registered Address":"ನೋಂದಾಯಿತ ವಿಳಾಸ","Phone Contact":"ದೂರವಾಣಿ ಸಂಪರ್ಕ","Email Enquiry":"ಇಮೇಲ್ ವಿಚಾರಣೆ","Official Website":"ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್","Follow Our Social Channels":"ನಮ್ಮ ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳನ್ನು ಅನುಸರಿಸಿ","Send a General Enquiry":"ಸಾಮಾನ್ಯ ವಿಚಾರಣೆಯನ್ನು ಕಳುಹಿಸಿ","Your Name":"ನಿಮ್ಮ ಹೆಸರು","Email Address":"ಇಮೇಲ್ ವಿಳಾಸ","Inquiry Type":"ವಿಚಾರಣೆಯ ಪ್ರಕಾರ","Business Work Requirement":"ವ್ಯಾಪಾರದ ಕೆಲಸದ ಅವಶ್ಯಕತೆ","Homemaker Registration":"ಗೃಹಿಣಿ ನೋಂದಣಿ","Partnership":"ಪಾಲುದಾರಿಕೆ","Other Enquiry":"ಇತರೆ ವಿಚಾರಣೆ","Message":"ಸಂದೇಶ","Send Message":"ಸಂದೇಶ ಕಳುಹಿಸಿ","Privacy policy":"ಗೌಪ್ಯತಾ ನೀತಿ","How we use submitted information":"ಸಲ್ಲಿಸಿದ ಮಾಹಿತಿಯನ್ನು ನಾವು ಹೇಗೆ ಬಳಸುತ್ತೇವೆ","Information submitted through Nishka forms is used to review work requirements, assess suitable opportunities and contact you about your enquiry or registration. Please provide only accurate information you are comfortable sharing for these purposes.":"ನಿಷ್ಕಾ ಫಾರ್ಮ್‌ಗಳ ಮೂಲಕ ಸಲ್ಲಿಸಿದ ಮಾಹಿತಿಯನ್ನು ಕೆಲಸದ ಅವಶ್ಯಕತೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲು, ಸೂಕ್ತ ಅವಕಾಶಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಲು ಮತ್ತು ನಿಮ್ಮ ವಿಚಾರಣೆ ಅಥವಾ ನೋಂದಣಿ ಕುರಿತು ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಲು ಬಳಸಲಾಗುತ್ತದೆ. ಈ ಉದ್ದೇಶಗಳಿಗಾಗಿ ನೀವು ಹಂಚಿಕೊಳ್ಳಲು ಸಮ್ಮತಿಸಿರುವ ನಿಖರ ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ನೀಡಿ.","Contact info@nishkaapp.com for questions about your submission.":"ನಿಮ್ಮ ಸಲ್ಲಿಕೆಯ ಕುರಿತು ಪ್ರಶ್ನೆಗಳಿದ್ದರೆ info@nishkaapp.com ಗೆ ಸಂಪರ್ಕಿಸಿ.","Terms & conditions":"ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು","Operating policy & terms summary":"ಕಾರ್ಯಾಚರಣಾ ನೀತಿ ಮತ್ತು ನಿಯಮಗಳ ಸಾರಾಂಶ","Nishka operates as a managed work coordination platform and does not position itself as a job agency or direct employer. Task allocations depend on active business requirements, suitability and availability. Homemaker participation is voluntary and task-based. Work, assignments or income are not guaranteed. Task scope, quality expectations, logistics and payment terms should be agreed before work begins. Homemakers should review task details and payment terms before accepting an assignment. Businesses should provide accurate requirements and confirm scope, timing, handling instructions and commercial terms with Nishka.":"ನಿಷ್ಕಾ ನಿರ್ವಹಿತ ಕೆಲಸದ ಸಮನ್ವಯ ವೇದಿಕೆಯಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ; ಇದು ಉದ್ಯೋಗ ಸಂಸ್ಥೆ ಅಥವಾ ನೇರ ಉದ್ಯೋಗದಾತ ಎಂದು ಹೇಳಿಕೊಳ್ಳುವುದಿಲ್ಲ. ಕೆಲಸದ ಹಂಚಿಕೆ ಸಕ್ರಿಯ ವ್ಯಾಪಾರ ಅವಶ್ಯಕತೆಗಳು, ಹೊಂದಾಣಿಕೆ ಮತ್ತು ಲಭ್ಯತೆಯನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ. ಗೃಹಿಣಿಯರ ಭಾಗವಹಿಸುವಿಕೆ ಸ್ವಯಂಪ್ರೇರಿತ ಮತ್ತು ಕೆಲಸ ಆಧಾರಿತವಾಗಿದೆ. ಕೆಲಸ, ನಿಯೋಜನೆ ಅಥವಾ ಆದಾಯದ ಖಾತರಿ ಇರುವುದಿಲ್ಲ. ಕೆಲಸ ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು ಕೆಲಸದ ವ್ಯಾಪ್ತಿ, ಗುಣಮಟ್ಟದ ನಿರೀಕ್ಷೆಗಳು, ಸಾಗಣೆ ಮತ್ತು ಪಾವತಿ ನಿಯಮಗಳನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಬೇಕು. ನಿಯೋಜನೆಯನ್ನು ಸ್ವೀಕರಿಸುವ ಮೊದಲು ಗೃಹಿಣಿಯರು ಕೆಲಸದ ವಿವರಗಳು ಮತ್ತು ಪಾವತಿ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಬೇಕು. ವ್ಯಾಪಾರಿಗಳು ನಿಖರ ಅವಶ್ಯಕತೆಗಳನ್ನು ನೀಡಿ, ಕೆಲಸದ ವ್ಯಾಪ್ತಿ, ಸಮಯ, ನಿರ್ವಹಣಾ ಸೂಚನೆಗಳು ಮತ್ತು ವಾಣಿಜ್ಯ ನಿಯಮಗಳನ್ನು ನಿಷ್ಕಾ ಜೊತೆ ದೃಢಪಡಿಸಬೇಕು.",
  "Navigation":"ನ್ಯಾವಿಗೇಶನ್","Work Categories":"ಕೆಲಸದ ವಿಭಾಗಗಳು","Contact Details":"ಸಂಪರ್ಕ ವಿವರಗಳು","Product Packaging":"ಉತ್ಪನ್ನ ಪ್ಯಾಕೇಜಿಂಗ್","Sticker & Labeling":"ಸ್ಟಿಕ್ಕರ್ ಮತ್ತು ಲೇಬಲಿಂಗ್","Item Sorting":"ವಸ್ತುಗಳ ವಿಂಗಡಣೆ","Garment Folding":"ಬಟ್ಟೆ ಮಡಚುವಿಕೆ","Privacy Policy":"ಗೌಪ್ಯತಾ ನೀತಿ","Homemaker Terms":"ಗೃಹಿಣಿಯರ ನಿಯಮಗಳು","Operating Policy & Terms Summary":"ಕಾರ್ಯಾಚರಣಾ ನೀತಿ ಮತ್ತು ನಿಯಮಗಳ ಸಾರಾಂಶ","© Nishka. Operated by Avenza Solutions Private Limited. All rights reserved.":"© ನಿಷ್ಕಾ. ಅವೆನ್ಜಾ ಸೊಲ್ಯೂಷನ್ಸ್ ಪ್ರೈವೇಟ್ ಲಿಮಿಟೆಡ್ ನಿರ್ವಹಿಸುತ್ತದೆ. ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
  "Frequently Asked Questions":"ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು","Find accurate answers about our work coordination services for both businesses and homemakers.":"ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಗೃಹಿಣಿಯರಿಗಾಗಿ ನಮ್ಮ ಕೆಲಸದ ಸಮನ್ವಯ ಸೇವೆಗಳ ಕುರಿತು ನಿಖರ ಉತ್ತರಗಳನ್ನು ಇಲ್ಲಿ ಕಂಡುಕೊಳ್ಳಿ.","For Businesses":"ವ್ಯಾಪಾರಿಗಳಿಗಾಗಿ","For Homemakers":"ಗೃಹಿಣಿಯರಿಗಾಗಿ","What type of work does Nishka coordinate?":"ನಿಷ್ಕಾ ಯಾವ ರೀತಿಯ ಕೆಲಸಗಳನ್ನು ಸಮನ್ವಯಗೊಳಿಸುತ್ತದೆ?","How can a business submit a work requirement?":"ವ್ಯಾಪಾರವು ಕೆಲಸದ ಅವಶ್ಯಕತೆಯನ್ನು ಹೇಗೆ ಸಲ್ಲಿಸಬಹುದು?","How are task rates and quantities assessed?":"ಕೆಲಸದ ದರ ಮತ್ತು ಪ್ರಮಾಣವನ್ನು ಹೇಗೆ ನಿರ್ಧರಿಸಲಾಗುತ್ತದೆ?","How does material handover work?":"ಸಾಮಗ್ರಿಗಳ ಹಸ್ತಾಂತರ ಹೇಗೆ ನಡೆಯುತ್ತದೆ?","How is completed work quality-checked?":"ಪೂರ್ಣಗೊಂಡ ಕೆಲಸದ ಗುಣಮಟ್ಟವನ್ನು ಹೇಗೆ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ?","Who can register with Nishka?":"ನಿಷ್ಕಾದಲ್ಲಿ ಯಾರು ನೋಂದಾಯಿಸಬಹುದು?","Are there any registration or subscription fees?":"ನೋಂದಣಿ ಅಥವಾ ಚಂದಾ ಶುಲ್ಕಗಳಿವೆಯೇ?","Is task work guaranteed every day?":"ಪ್ರತಿದಿನ ಕೆಲಸ ಖಚಿತವಾಗಿದೆಯೇ?","How are task rates and payments processed?":"ಕೆಲಸದ ದರ ಮತ್ತು ಪಾವತಿಯನ್ನು ಹೇಗೆ ನಿರ್ವಹಿಸಲಾಗುತ್ತದೆ?",
  "Select your industry...":"ನಿಮ್ಮ ಉದ್ಯಮವನ್ನು ಆಯ್ಕೆಮಾಡಿ...","Select volume range...":"ಪ್ರಮಾಣದ ವ್ಯಾಪ್ತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ...","Describe the specific packaging guidelines, dimensions, or fragility of materials...":"ಪ್ಯಾಕಿಂಗ್ ಸೂಚನೆಗಳು, ಅಳತೆಗಳು ಅಥವಾ ಸಾಮಗ್ರಿಗಳ ಸೂಕ್ಷ್ಮತೆಯನ್ನು ವಿವರಿಸಿ...","e.g. Creative Goods Pvt Ltd":"ಉದಾ: ಕ್ರಿಯೇಟಿವ್ ಗೂಡ್ಸ್ ಪ್ರೈವೇಟ್ ಲಿಮಿಟೆಡ್","Your full name":"ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು","e.g. Jayanagar, Indiranagar, Peenya":"ಉದಾ: ಜಯನಗರ, ಇಂದಿರಾನಗರ, ಪೀಣ್ಯ","e.g. Jayanagar, JP Nagar, BTM Layout":"ಉದಾ: ಜಯನಗರ, ಜೆ.ಪಿ. ನಗರ, ಬಿಟಿಎಂ ಲೇಔಟ್","e.g. packing, stitching, craft work":"ಉದಾ: ಪ್ಯಾಕಿಂಗ್, ಹೊಲಿಗೆ, ಕರಕುಶಲ ಕೆಲಸ","Anything else you'd like our team to know":"ನಮ್ಮ ತಂಡಕ್ಕೆ ತಿಳಿಸಲು ಬಯಸುವ ಇತರ ಮಾಹಿತಿ","Full name":"ಪೂರ್ಣ ಹೆಸರು","email@domain.com":"email@domain.com","How can we assist you?":"ನಾವು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
};


Object.assign(KN_TRANSLATIONS, {
  "Reliable support for repetitive work.":"ಪುನರಾವರ್ತಿತ ಕೆಲಸಗಳಿಗೆ ವಿಶ್ವಾಸಾರ್ಹ ಬೆಂಬಲ.",
  "Coordinate suitable packing, labeling, sorting, folding and assembly tasks through a managed process with clear requirements and quality checks.":"ಸ್ಪಷ್ಟ ಅವಶ್ಯಕತೆಗಳು ಮತ್ತು ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆಯೊಂದಿಗೆ ನಿರ್ವಹಿತ ಪ್ರಕ್ರಿಯೆಯ ಮೂಲಕ ಪ್ಯಾಕಿಂಗ್, ಲೇಬಲಿಂಗ್, ವಿಂಗಡಣೆ, ಮಡಚುವಿಕೆ ಮತ್ತು ಜೋಡಣೆ ಕೆಲಸಗಳನ್ನು ಸಮನ್ವಯಗೊಳಿಸಿ.",
  "Meet the Homemaker Side":"ಗೃಹಿಣಿಯರ ವಿಭಾಗವನ್ನು ನೋಡಿ",
  "Reliable Support for Your Repetitive Work":"ನಿಮ್ಮ ಪುನರಾವರ್ತಿತ ಕೆಲಸಗಳಿಗೆ ವಿಶ್ವಾಸಾರ್ಹ ಬೆಂಬಲ",
  "What type of work does Nishka coordinate?":"ನಿಷ್ಕಾ ಯಾವ ರೀತಿಯ ಕೆಲಸಗಳನ್ನು ಸಮನ್ವಯಗೊಳಿಸುತ್ತದೆ?",
  "Nishka coordinates suitable repetitive, non-technical tasks such as product packaging, label and sticker application, sorting and counting, garment or paper folding, gift kit assembly, and printed-material sorting, subject to business requirements.":"ವ್ಯಾಪಾರದ ಅವಶ್ಯಕತೆಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ಉತ್ಪನ್ನ ಪ್ಯಾಕೇಜಿಂಗ್, ಲೇಬಲ್ ಮತ್ತು ಸ್ಟಿಕ್ಕರ್ ಅಳವಡಿಕೆ, ವಿಂಗಡಣೆ ಮತ್ತು ಎಣಿಕೆ, ಬಟ್ಟೆ ಅಥವಾ ಕಾಗದ ಮಡಚುವಿಕೆ, ಉಡುಗೊರೆ ಕಿಟ್ ಜೋಡಣೆ ಮತ್ತು ಮುದ್ರಿತ ಸಾಮಗ್ರಿಗಳ ವಿಂಗಡಣೆ ಮುಂತಾದ ಸೂಕ್ತ ಪುನರಾವರ್ತಿತ, ತಾಂತ್ರಿಕವಲ್ಲದ ಕೆಲಸಗಳನ್ನು ನಿಷ್ಕಾ ಸಮನ್ವಯಗೊಳಿಸುತ್ತದೆ.",
  "Use the “Submit a Work Requirement” form on the For Businesses page. Share your company and contact details, work category, approximate batch quantity, target completion date, handover location, and any special instructions. The Nishka team can then review the scope and contact you.":"ವ್ಯಾಪಾರಿಗಳ ಪುಟದಲ್ಲಿರುವ “ಕೆಲಸದ ಅವಶ್ಯಕತೆಯನ್ನು ಸಲ್ಲಿಸಿ” ಫಾರ್ಮ್ ಬಳಸಿ. ನಿಮ್ಮ ಕಂಪನಿ ಮತ್ತು ಸಂಪರ್ಕ ವಿವರಗಳು, ಕೆಲಸದ ವರ್ಗ, ಅಂದಾಜು ಬ್ಯಾಚ್ ಪ್ರಮಾಣ, ಪೂರ್ಣಗೊಳಿಸುವ ಗುರಿ ದಿನಾಂಕ, ಹಸ್ತಾಂತರ ಸ್ಥಳ ಮತ್ತು ವಿಶೇಷ ಸೂಚನೆಗಳನ್ನು ನೀಡಿ. ನಂತರ ನಿಷ್ಕಾ ತಂಡವು ಕೆಲಸದ ವ್ಯಾಪ್ತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ.",
  "Rates and batch quantities are assessed based on the type and complexity of the task, estimated time, materials, volume, quality requirements, and agreed timelines. Pricing and per-unit terms are discussed before work is assigned.":"ಕೆಲಸದ ಪ್ರಕಾರ ಮತ್ತು ಸಂಕೀರ್ಣತೆ, ಅಂದಾಜು ಸಮಯ, ಸಾಮಗ್ರಿಗಳು, ಪ್ರಮಾಣ, ಗುಣಮಟ್ಟದ ಅವಶ್ಯಕತೆಗಳು ಮತ್ತು ಒಪ್ಪಿಕೊಂಡ ಸಮಯಾವಧಿಯ ಆಧಾರದ ಮೇಲೆ ದರ ಮತ್ತು ಬ್ಯಾಚ್ ಪ್ರಮಾಣವನ್ನು ನಿರ್ಧರಿಸಲಾಗುತ್ತದೆ. ಕೆಲಸ ಹಂಚುವ ಮೊದಲು ಬೆಲೆ ಮತ್ತು ಪ್ರತಿ ಘಟಕದ ನಿಯಮಗಳನ್ನು ಚರ್ಚಿಸಲಾಗುತ್ತದೆ.",
  "Materials are handed over through an agreed coordination point or arrangement in Bengaluru. The handover plan, quantities, instructions, and return process are confirmed with the business before the batch begins.":"ಬೆಂಗಳೂರಿನಲ್ಲಿ ಒಪ್ಪಿಕೊಂಡ ಸಮನ್ವಯ ಕೇಂದ್ರ ಅಥವಾ ವ್ಯವಸ್ಥೆಯ ಮೂಲಕ ಸಾಮಗ್ರಿಗಳನ್ನು ಹಸ್ತಾಂತರಿಸಲಾಗುತ್ತದೆ. ಬ್ಯಾಚ್ ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು ಹಸ್ತಾಂತರ ಯೋಜನೆ, ಪ್ರಮಾಣ, ಸೂಚನೆಗಳು ಮತ್ತು ವಾಪಸಾತಿ ಪ್ರಕ್ರಿಯೆಯನ್ನು ವ್ಯಾಪಾರದೊಂದಿಗೆ ದೃಢಪಡಿಸಲಾಗುತ್ತದೆ.",
  "Completed batches are checked against the agreed instructions and quality criteria. Any issues are reviewed with the relevant coordinator before the batch is confirmed for return and settlement.":"ಪೂರ್ಣಗೊಂಡ ಬ್ಯಾಚ್‌ಗಳನ್ನು ಒಪ್ಪಿಕೊಂಡ ಸೂಚನೆಗಳು ಮತ್ತು ಗುಣಮಟ್ಟದ ಮಾನದಂಡಗಳ ಪ್ರಕಾರ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ. ವಾಪಸಾತಿ ಮತ್ತು ಪಾವತಿಯನ್ನು ದೃಢಪಡಿಸುವ ಮೊದಲು ಯಾವುದೇ ಸಮಸ್ಯೆಗಳನ್ನು ಸಂಬಂಧಿತ ಸಂಯೋಜಕರೊಂದಿಗೆ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.",
  "Homemakers in Bengaluru who are interested in suitable non-technical, task-based work can submit their details. Opportunities depend on location, availability, task requirements, and onboarding suitability.":"ಸೂಕ್ತ ತಾಂತ್ರಿಕವಲ್ಲದ ಕೆಲಸ ಆಧಾರಿತ ಕೆಲಸಗಳಲ್ಲಿ ಆಸಕ್ತಿ ಹೊಂದಿರುವ ಬೆಂಗಳೂರಿನ ಗೃಹಿಣಿಯರು ತಮ್ಮ ವಿವರಗಳನ್ನು ಸಲ್ಲಿಸಬಹುದು. ಅವಕಾಶಗಳು ಸ್ಥಳ, ಲಭ್ಯತೆ, ಕೆಲಸದ ಅವಶ್ಯಕತೆಗಳು ಮತ್ತು ಸೇರ್ಪಡೆಗೆ ಹೊಂದಾಣಿಕೆಯನ್ನು ಅವಲಂಬಿಸಿರುತ್ತವೆ.",
  "Getting started with Nishka is completely free, with no registration or joining fees. Our focus is on helping homemakers access meaningful work opportunities and earn through the tasks they complete. If any service charges or subscription plans are introduced in the future, we will communicate the details transparently in advance.":"ನಿಷ್ಕಾದಲ್ಲಿ ಪ್ರಾರಂಭಿಸುವುದು ಸಂಪೂರ್ಣ ಉಚಿತ; ಯಾವುದೇ ನೋಂದಣಿ ಅಥವಾ ಸೇರ್ಪಡೆ ಶುಲ್ಕವಿಲ್ಲ. ಗೃಹಿಣಿಯರಿಗೆ ಅರ್ಥಪೂರ್ಣ ಕೆಲಸದ ಅವಕಾಶಗಳನ್ನು ಒದಗಿಸಿ, ಅವರು ಪೂರ್ಣಗೊಳಿಸುವ ಕೆಲಸಗಳ ಮೂಲಕ ಆದಾಯ ಗಳಿಸಲು ಸಹಾಯ ಮಾಡುವುದು ನಮ್ಮ ಉದ್ದೇಶ. ಭವಿಷ್ಯದಲ್ಲಿ ಯಾವುದೇ ಸೇವಾ ಶುಲ್ಕ ಅಥವಾ ಚಂದಾ ಯೋಜನೆಗಳನ್ನು ಪರಿಚಯಿಸಿದರೆ, ಅದರ ವಿವರಗಳನ್ನು ಮುಂಚಿತವಾಗಿ ಪಾರದರ್ಶಕವಾಗಿ ತಿಳಿಸುತ್ತೇವೆ.",
  "No. Task availability depends on active business requirements, location, batch volume, and suitability. Registering with Nishka does not guarantee daily tasks or a fixed income.":"ಇಲ್ಲ. ಕೆಲಸದ ಲಭ್ಯತೆ ಸಕ್ರಿಯ ವ್ಯಾಪಾರ ಅವಶ್ಯಕತೆಗಳು, ಸ್ಥಳ, ಬ್ಯಾಚ್ ಪ್ರಮಾಣ ಮತ್ತು ಹೊಂದಾಣಿಕೆಯನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ. ನಿಷ್ಕಾದಲ್ಲಿ ನೋಂದಾಯಿಸಿದರೆ ಪ್ರತಿದಿನ ಕೆಲಸ ಅಥವಾ ನಿಗದಿತ ಆದಾಯ ಖಚಿತವಾಗುವುದಿಲ್ಲ.",
  "Task rates and payment terms are shared before a task is accepted. Payments are based on completed work that meets the agreed verification and quality requirements, according to the settlement terms communicated for that task.":"ಕೆಲಸವನ್ನು ಸ್ವೀಕರಿಸುವ ಮೊದಲು ಅದರ ದರ ಮತ್ತು ಪಾವತಿ ನಿಯಮಗಳನ್ನು ತಿಳಿಸಲಾಗುತ್ತದೆ. ಆ ಕೆಲಸಕ್ಕೆ ತಿಳಿಸಲಾದ ಪಾವತಿ ನಿಯಮಗಳ ಪ್ರಕಾರ, ಒಪ್ಪಿಕೊಂಡ ಪರಿಶೀಲನೆ ಮತ್ತು ಗುಣಮಟ್ಟದ ಅವಶ್ಯಕತೆಗಳನ್ನು ಪೂರೈಸಿದ ಪೂರ್ಣಗೊಂಡ ಕೆಲಸಕ್ಕೆ ಪಾವತಿ ಮಾಡಲಾಗುತ್ತದೆ.",
  "Nishka is a managed work coordination platform operated by Avenza Solutions Private Limited, connecting businesses with homemakers for flexible, task-based work in Bengaluru.":"ಅವೆನ್ಜಾ ಸೊಲ್ಯೂಷನ್ಸ್ ಪ್ರೈವೇಟ್ ಲಿಮಿಟೆಡ್ ನಿರ್ವಹಿಸುವ ನಿಷ್ಕಾ, ಬೆಂಗಳೂರಿನಲ್ಲಿ ವ್ಯಾಪಾರಗಳನ್ನು ಗೃಹಿಣಿಯರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವ ಹೊಂದಿಕೊಳ್ಳುವ ಕೆಲಸ ಆಧಾರಿತ ಸಮನ್ವಯ ವೇದಿಕೆಯಾಗಿದೆ.",
  "Nishka operates strictly as a managed work coordination platform and does not position itself as a job agency or direct employer. Task allocations are contingent upon active merchant requirements. Homemaker participation is voluntary and task-based without mandatory registration charges.":"ನಿಷ್ಕಾ ನಿರ್ವಹಿತ ಕೆಲಸದ ಸಮನ್ವಯ ವೇದಿಕೆಯಾಗಿ ಮಾತ್ರ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ; ಉದ್ಯೋಗ ಸಂಸ್ಥೆ ಅಥವಾ ನೇರ ಉದ್ಯೋಗದಾತ ಎಂದು ಹೇಳಿಕೊಳ್ಳುವುದಿಲ್ಲ. ಕೆಲಸದ ಹಂಚಿಕೆ ಸಕ್ರಿಯ ವ್ಯಾಪಾರಿಗಳ ಅವಶ್ಯಕತೆಗಳನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ. ಗೃಹಿಣಿಯರ ಭಾಗವಹಿಸುವಿಕೆ ಸ್ವಯಂಪ್ರೇರಿತ ಮತ್ತು ಕೆಲಸ ಆಧಾರಿತವಾಗಿದ್ದು, ಕಡ್ಡಾಯ ನೋಂದಣಿ ಶುಲ್ಕವಿಲ್ಲ.",
  "About & Contact":"ನಮ್ಮ ಬಗ್ಗೆ ಮತ್ತು ಸಂಪರ್ಕ",
  "About & Contact | Nishka":"ನಮ್ಮ ಬಗ್ಗೆ ಮತ್ತು ಸಂಪರ್ಕ | ನಿಷ್ಕಾ",
  "For Businesses | Nishka":"ವ್ಯಾಪಾರಿಗಳಿಗಾಗಿ | ನಿಷ್ಕಾ",
  "For Homemakers | Nishka":"ಗೃಹಿಣಿಯರಿಗಾಗಿ | ನಿಷ್ಕಾ",
  "Nishka Brand Values":"ನಿಷ್ಕಾದ ಮೌಲ್ಯಗಳು",
  "Submit Work Requirement":"ಕೆಲಸದ ಅವಶ್ಯಕತೆಯನ್ನು ಸಲ್ಲಿಸಿ",
  "Please select at least one work preference.":"ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ಕೆಲಸದ ಆದ್ಯತೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
  "Sending…":"ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ…",
  "Thank you. Your request was sent to Nishka. Our team will review it and contact you using the details provided.":"ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ನಿಷ್ಕಾಗೆ ಕಳುಹಿಸಲಾಗಿದೆ. ನಮ್ಮ ತಂಡ ಪರಿಶೀಲಿಸಿ ನೀವು ನೀಡಿದ ವಿವರಗಳ ಮೂಲಕ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ.",
  "We couldn't submit your request right now. Please try again or contact Nishka directly.":"ಈಗ ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ನಿಷ್ಕಾವನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.",
  "e.g. Jayanagar, Indiranagar, Peenya":"ಉದಾ: ಜಯನಗರ, ಇಂದಿರಾನಗರ, ಪೀಣ್ಯ",
  "NISHKA":"ನಿಷ್ಕಾ"
});

Object.assign(KN_TRANSLATIONS, {
"OPERATIONAL MODEL":"ಕಾರ್ಯಾಚರಣೆಯ ಮಾದರಿ",
"How Nishka Operates":"ನಿಷ್ಕಾ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
"Our circular coordination system oversees every step from initial requirement definition to":"ನಮ್ಮ ಸಮಗ್ರ ಸಮನ್ವಯ ವ್ಯವಸ್ಥೆಯು ಆರಂಭಿಕ ಅವಶ್ಯಕತೆ ನಿರ್ಧಾರದಿಂದ",
"final batch quality audit.":"ಅಂತಿಮ ಬ್ಯಾಚ್‌ನ ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆಯವರೆಗೆ ಪ್ರತಿಯೊಂದು ಹಂತವನ್ನು ನಿರ್ವಹಿಸುತ್ತದೆ.",
"Requirement Definition":"ಅವಶ್ಯಕತೆಗಳ ನಿರ್ಧಾರ",
"Businesses submit work scope, task specifications, target quantities, and quality guidelines.":"ವ್ಯಾಪಾರಿಗಳು ಕೆಲಸದ ವ್ಯಾಪ್ತಿ, ಕಾರ್ಯದ ವಿವರಗಳು, ಗುರಿ ಪ್ರಮಾಣ ಮತ್ತು ಗುಣಮಟ್ಟದ ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ಸಲ್ಲಿಸುತ್ತಾರೆ.",
"Assessment & Pricing":"ಮೌಲ್ಯಮಾಪನ ಮತ್ತು ದರ ನಿಗದಿ",
"Nishka evaluates task complexity, time requirements, and provides a per-unit quotation.":"ನಿಷ್ಕಾ ಕೆಲಸದ ಸಂಕೀರ್ಣತೆ ಮತ್ತು ಅಗತ್ಯವಿರುವ ಸಮಯವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ ಪ್ರತಿ ಘಟಕದ ದರವನ್ನು ನೀಡುತ್ತದೆ.",
"Material Dispatch":"ಸಾಮಗ್ರಿಗಳ ರವಾನೆ",
"Packaging materials and goods are picked up or delivered to localized coordination points.":"ಪ್ಯಾಕೇಜಿಂಗ್ ಸಾಮಗ್ರಿಗಳು ಮತ್ತು ವಸ್ತುಗಳನ್ನು ಪಡೆದು ಸ್ಥಳೀಯ ಸಮನ್ವಯ ಕೇಂದ್ರಗಳಿಗೆ ತಲುಪಿಸಲಾಗುತ್ತದೆ.",
"Task Execution":"ಕೆಲಸದ ನಿರ್ವಹಣೆ",
"Registered local homemakers perform the tasks carefully following clear instruction sheets.":"ನೋಂದಾಯಿತ ಸ್ಥಳೀಯ ಗೃಹಿಣಿಯರು ಸ್ಪಷ್ಟ ಸೂಚನಾ ಹಾಳೆಗಳ ಪ್ರಕಾರ ಕೆಲಸಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ನಿರ್ವಹಿಸುತ್ತಾರೆ.",
"Quality Assurance":"ಗುಣಮಟ್ಟದ ಭರವಸೆ",
"Nishka field managers audit finished batches against quality checklists to ensure precision.":"ನಿಖರತೆಯನ್ನು ಖಚಿತಪಡಿಸಲು ನಿಷ್ಕಾದ ಕ್ಷೇತ್ರ ವ್ಯವಸ್ಥಾಪಕರು ಪೂರ್ಣಗೊಂಡ ಬ್ಯಾಚ್‌ಗಳನ್ನು ಗುಣಮಟ್ಟದ ಪರಿಶೀಲನಾ ಪಟ್ಟಿಗಳೊಂದಿಗೆ ತಾಳೆ ಹಾಕಿ ಪರಿಶೀಲಿಸುತ್ತಾರೆ.",
"Return & Settlement":"ವಾಪಸಾತಿ ಮತ್ತು ಪಾವತಿ",
"Completed orders are delivered back to the merchant, and worker payouts are processed.":"ಪೂರ್ಣಗೊಂಡ ಆರ್ಡರ್‌ಗಳನ್ನು ವ್ಯಾಪಾರಿಗೆ ಹಿಂತಿರುಗಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಕೆಲಸಗಾರರಿಗೆ ಪಾವತಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತದೆ.",
"OPERATIONAL RIGOR & STANDARDS":"ಕಾರ್ಯಾಚರಣೆಯ ಶಿಸ್ತು ಮತ್ತು ಮಾನದಂಡಗಳು",
"Quality Assurance & Reliable Deliverables":"ಗುಣಮಟ್ಟದ ಭರವಸೆ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಫಲಿತಾಂಶಗಳು",
"Our platform standards guarantee flawless operational execution, full cross-platform":"ನಮ್ಮ ವೇದಿಕೆಯ ಮಾನದಂಡಗಳು ದೋಷರಹಿತ ಕಾರ್ಯಾಚರಣೆ, ಎಲ್ಲಾ ವೇದಿಕೆಗಳಲ್ಲಿ ಸಂಪೂರ್ಣ",
"compliance, and trustworthy merchant and homemaker integration.":"ಅನುಸರಣೆ ಹಾಗೂ ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಗೃಹಿಣಿಯರ ವಿಶ್ವಾಸಾರ್ಹ ಸಂಪರ್ಕವನ್ನು ಖಚಿತಪಡಿಸುತ್ತವೆ.",
"13. Quality Assurance":"13. ಗುಣಮಟ್ಟದ ಭರವಸೆ",
"Pre-launch verification & operational compliance audit":"ಪ್ರಾರಂಭಕ್ಕೂ ಮುನ್ನ ಪರಿಶೀಲನೆ ಮತ್ತು ಕಾರ್ಯಾಚರಣಾ ಅನುಸರಣೆ ಲೆಕ್ಕಪರಿಶೋಧನೆ",
"Desktop & Mobile Review:":"ಡೆಸ್ಕ್‌ಟಾಪ್ ಮತ್ತು ಮೊಬೈಲ್ ಪರಿಶೀಲನೆ:",
"Verified layout responsiveness across all screen sizes.":"ಎಲ್ಲಾ ಪರದೆಯ ಗಾತ್ರಗಳಲ್ಲಿ ವಿನ್ಯಾಸದ ಹೊಂದಾಣಿಕೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.",
"Navigation & CTA Testing:":"ನ್ಯಾವಿಗೇಶನ್ ಮತ್ತು CTA ಪರೀಕ್ಷೆ:",
"Tested all anchor navigation and conversion CTAs.":"ಎಲ್ಲಾ ಆಂಕರ್ ನ್ಯಾವಿಗೇಶನ್ ಮತ್ತು ಕ್ರಿಯೆಗೆ ಕರೆ ನೀಡುವ ಬಟನ್‌ಗಳನ್ನು ಪರೀಕ್ಷಿಸಲಾಗಿದೆ.",
"Form Integration Test:":"ಫಾರ್ಮ್ ಏಕೀಕರಣ ಪರೀಕ್ಷೆ:",
"Validated business enquiry and homemaker registration inputs.":"ವ್ಯಾಪಾರ ವಿಚಾರಣೆ ಮತ್ತು ಗೃಹಿಣಿ ನೋಂದಣಿ ನಮೂದುಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.",
"Media & Watermark Checks:":"ಮಾಧ್ಯಮ ಮತ್ತು ವಾಟರ್‌ಮಾರ್ಕ್ ಪರಿಶೀಲನೆ:",
"Verified image loading, ratios, and unclipped legal watermarks.":"ಚಿತ್ರಗಳ ಲೋಡಿಂಗ್, ಅನುಪಾತ ಮತ್ತು ಕಾನೂನು ವಾಟರ್‌ಮಾರ್ಕ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.",
"Typography & Contrast:":"ಅಕ್ಷರ ವಿನ್ಯಾಸ ಮತ್ತು ಕಾಂಟ್ರಾಸ್ಟ್:",
"Ensured WCAG legible font contrast and balanced grid spacing.":"WCAG ಮಾರ್ಗಸೂಚಿಗಳಿಗೆ ಅನುಗುಣವಾದ ಓದಲು ಸುಲಭವಾದ ಅಕ್ಷರ ಕಾಂಟ್ರಾಸ್ಟ್ ಮತ್ತು ಸಮತೋಲಿತ ಗ್ರಿಡ್ ಅಂತರವನ್ನು ಖಚಿತಪಡಿಸಲಾಗಿದೆ.",
"Keyboard Focus & A11y:":"ಕೀಬೋರ್ಡ್ ಫೋಕಸ್ ಮತ್ತು ಪ್ರವೇಶಸೌಲಭ್ಯ:",
"Tested visible focus indicators and accessible form labels.":"ಗೋಚರ ಫೋಕಸ್ ಸೂಚಕಗಳು ಮತ್ತು ಸುಲಭವಾಗಿ ಬಳಸಬಹುದಾದ ಫಾರ್ಮ್ ಲೇಬಲ್‌ಗಳನ್ನು ಪರೀಕ್ಷಿಸಲಾಗಿದೆ.",
"SEO & HTTPS Domain:":"SEO ಮತ್ತು HTTPS ಡೊಮೇನ್:",
"Checked page titles, metadata tags, and domain HTTPS security.":"ಪುಟದ ಶೀರ್ಷಿಕೆಗಳು, ಮೆಟಾಡೇಟಾ ಟ್ಯಾಗ್‌ಗಳು ಮತ್ತು ಡೊಮೇನ್‌ನ HTTPS ಭದ್ರತೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.",
"14. Final Deliverables":"14. ಅಂತಿಮವಾಗಿ ಒದಗಿಸಿದವು",
"Complete platform package & strategic architecture":"ಸಂಪೂರ್ಣ ವೇದಿಕೆ ಪ್ಯಾಕೇಜ್ ಮತ್ತು ಕಾರ್ಯತಂತ್ರದ ವಿನ್ಯಾಸ",
"Complete Website Architecture:":"ಸಂಪೂರ್ಣ ವೆಬ್‌ಸೈಟ್ ವಿನ್ಯಾಸ:",
"Professional multi-section managed coordination portal.":"ವೃತ್ತಿಪರ ಬಹು-ವಿಭಾಗಗಳ ನಿರ್ವಹಿತ ಸಮನ್ವಯ ಪೋರ್ಟಲ್.",
"Nishka Design System:":"ನಿಷ್ಕಾ ವಿನ್ಯಾಸ ವ್ಯವಸ್ಥೆ:",
"Unified visual identity reflecting Avenza Solutions branding.":"ಅವೆನ್ಜಾ ಸೊಲ್ಯೂಷನ್ಸ್ ಬ್ರ್ಯಾಂಡ್ ಗುರುತನ್ನು ಪ್ರತಿಬಿಂಬಿಸುವ ಏಕೀಕೃತ ದೃಶ್ಯ ವಿನ್ಯಾಸ.",
"Dual Conversion Journeys:":"ಎರಡು ವಿಭಿನ್ನ ಬಳಕೆದಾರ ಮಾರ್ಗಗಳು:",
"Distinct pathways for Business Clients and Homemaker Onboarding.":"ವ್ಯಾಪಾರ ಗ್ರಾಹಕರು ಮತ್ತು ಗೃಹಿಣಿಯರ ನೋಂದಣಿಗೆ ಪ್ರತ್ಯೇಕ ಮಾರ್ಗಗಳು.",
"Enquiry & Registration Integration:":"ವಿಚಾರಣೆ ಮತ್ತು ನೋಂದಣಿ ಏಕೀಕರಣ:",
"Working forms with clear user feedback notes.":"ಬಳಕೆದಾರರಿಗೆ ಸ್ಪಷ್ಟ ಪ್ರತಿಕ್ರಿಯೆ ನೀಡುವ ಕಾರ್ಯನಿರ್ವಹಿಸುವ ಫಾರ್ಮ್‌ಗಳು.",
"Mobile-First Layouts:":"ಮೊಬೈಲ್‌ಗೆ ಆದ್ಯತೆಯ ವಿನ್ಯಾಸ:",
"Optimized user experience across mobile, tablet, and desktop devices.":"ಮೊಬೈಲ್, ಟ್ಯಾಬ್ಲೆಟ್ ಮತ್ತು ಡೆಸ್ಕ್‌ಟಾಪ್ ಸಾಧನಗಳಲ್ಲಿ ಉತ್ತಮ ಬಳಕೆದಾರ ಅನುಭವ.",
"SEO & Legal Foundation:":"SEO ಮತ್ತು ಕಾನೂನು ಆಧಾರ:",
"Complete metadata, transparent operating policy, and legal navigation.":"ಸಂಪೂರ್ಣ ಮೆಟಾಡೇಟಾ, ಪಾರದರ್ಶಕ ಕಾರ್ಯಾಚರಣಾ ನೀತಿ ಮತ್ತು ಕಾನೂನು ವಿಭಾಗಗಳ ನ್ಯಾವಿಗೇಶನ್.",
"VERIFIED":"ಪರಿಶೀಲಿಸಲಾಗಿದೆ","TESTED":"ಪರೀಕ್ಷಿಸಲಾಗಿದೆ","COMPLIANT":"ಅನುಸರಿಸಲಾಗಿದೆ","PASSED":"ಉತ್ತೀರ್ಣ","SECURE":"ಸುರಕ್ಷಿತ","DELIVERED":"ಒದಗಿಸಲಾಗಿದೆ","ACTIVE":"ಸಕ್ರಿಯ","READY":"ಸಿದ್ಧ","FUNCTIONAL":"ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ","OPTIMIZED":"ಉತ್ತಮಗೊಳಿಸಲಾಗಿದೆ","COMPLETE":"ಪೂರ್ಣಗೊಂಡಿದೆ",
"HELP & CLARITY":"ಸಹಾಯ ಮತ್ತು ಸ್ಪಷ್ಟತೆ",
"Find accurate answers about our work coordination services for both businesses and":"ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಗೃಹಿಣಿಯರಿಗಾಗಿ ನಮ್ಮ ಕೆಲಸದ ಸಮನ್ವಯ ಸೇವೆಗಳ ಕುರಿತು ನಿಖರ ಉತ್ತರಗಳನ್ನು ಇಲ್ಲಿ ಕಂಡುಕೊಳ್ಳಿ.",
"homemakers.":"ಗೃಹಿಣಿಯರು.",
"Who can register with Nishka?":"ನಿಷ್ಕಾದಲ್ಲಿ ಯಾರು ನೋಂದಾಯಿಸಬಹುದು?",
"Are there any registration or subscription fees?":"ನೋಂದಣಿ ಅಥವಾ ಚಂದಾ ಶುಲ್ಕಗಳಿವೆಯೇ?",
"Is task work guaranteed every day?":"ಪ್ರತಿದಿನ ಕೆಲಸ ಖಚಿತವಾಗಿದೆಯೇ?",
"How are task rates and payments processed?":"ಕೆಲಸದ ದರ ಮತ್ತು ಪಾವತಿಯನ್ನು ಹೇಗೆ ನಿರ್ವಹಿಸಲಾಗುತ್ತದೆ?",
"Reach out to discuss merchant work coordination, homemaker onboarding, or business partnership inquiries.":"ವ್ಯಾಪಾರ ಕೆಲಸದ ಸಮನ್ವಯ, ಗೃಹಿಣಿಯರ ನೋಂದಣಿ ಅಥವಾ ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆ ವಿಚಾರಣೆಗಳಿಗಾಗಿ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ.",
"Registered Address":"ನೋಂದಾಯಿತ ವಿಳಾಸ","Phone Contact":"ದೂರವಾಣಿ ಸಂಪರ್ಕ","Email Enquiry":"ಇಮೇಲ್ ವಿಚಾರಣೆ","Official Website":"ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್","Follow Our Social Channels":"ನಮ್ಮ ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳನ್ನು ಅನುಸರಿಸಿ",
"Send a General Enquiry":"ಸಾಮಾನ್ಯ ವಿಚಾರಣೆಯನ್ನು ಕಳುಹಿಸಿ","Your Name":"ನಿಮ್ಮ ಹೆಸರು","Email Address":"ಇಮೇಲ್ ವಿಳಾಸ","Inquiry Type":"ವಿಚಾರಣೆಯ ಪ್ರಕಾರ","Message":"ಸಂದೇಶ","Send Message":"ಸಂದೇಶ ಕಳುಹಿಸಿ",
"Tagline: Nishka — Bridging Businesses & Homemakers.":"ಘೋಷವಾಕ್ಯ: ನಿಷ್ಕಾ — ವ್ಯಾಪಾರಗಳು ಮತ್ತು ಗೃಹಿಣಿಯರನ್ನು ಸಂಪರ್ಕಿಸುವ ಸೇತುವೆ.",
"Operating Policy & Terms Summary":"ಕಾರ್ಯಾಚರಣಾ ನೀತಿ ಮತ್ತು ನಿಯಮಗಳ ಸಾರಾಂಶ",
"Jayanagar 4th block, Bangalore, Bangalore, Karnataka, 560041, IN":"ಜಯನಗರ 4ನೇ ಬ್ಲಾಕ್, ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ, 560041, ಭಾರತ",
"Jayanagar 4th block, Bangalore, Karnataka, 560041, IN":"ಜಯನಗರ 4ನೇ ಬ್ಲಾಕ್, ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ, 560041, ಭಾರತ",
"© Nishka. Operated by Avenza Solutions Private Limited. All rights reserved.":"© ನಿಷ್ಕಾ. ಅವೆನ್ಜಾ ಸೊಲ್ಯೂಷನ್ಸ್ ಪ್ರೈವೇಟ್ ಲಿಮಿಟೆಡ್ ನಿರ್ವಹಿಸುತ್ತದೆ. ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ."
});

function restoreTranslatedTextNodes() {
  const originals = window.__nishkaOriginalTextNodes;
  if (originals) {
    originals.forEach((value, node) => {
      if (node && node.parentNode) node.nodeValue = value;
    });
  }
  document.querySelectorAll("[data-original-placeholder]").forEach(el => {
    el.placeholder = el.dataset.originalPlaceholder;
  });
  document.querySelectorAll("select option[data-original-text]").forEach(el => {
    el.textContent = el.dataset.originalText;
  });
}

function translatePageText(lang) {
  restoreTranslatedTextNodes();
  if (lang !== "kn") return;
  const originals = window.__nishkaOriginalTextNodes || (window.__nishkaOriginalTextNodes = new Map());
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const parent = node.parentElement;
    if (!parent || parent.closest("script,style,textarea,[data-en][data-kn],.lang-switch,#langToggle")) return;
    const raw = node.nodeValue;
    if (!originals.has(node)) originals.set(node, raw);
    const key = originals.get(node).trim().replace(/\s+/g, " ");
    if (!key) return;
    const translated = KN_TRANSLATIONS[key];
    if (translated) node.nodeValue = originals.get(node).replace(key, translated);
  });
  document.querySelectorAll("input[placeholder],textarea[placeholder]").forEach(el => {
    if (!el.dataset.originalPlaceholder) el.dataset.originalPlaceholder = el.placeholder;
    const translated = KN_TRANSLATIONS[el.dataset.originalPlaceholder];
    if (translated) el.placeholder = translated;
  });
  document.querySelectorAll("select option").forEach(el => {
    if (!el.dataset.originalText) el.dataset.originalText = el.textContent;
    const translated = KN_TRANSLATIONS[el.dataset.originalText.trim()];
    if (translated) el.textContent = translated;
  });
}

function switchLanguage(lang) {
  currentLanguage = lang === "kn" ? "kn" : "en";
  localStorage.setItem("language", currentLanguage);
  document.documentElement.lang = currentLanguage;

  const titleTranslations = {
    "Nishka — Bridging Businesses & Homemakers":"ನಿಷ್ಕಾ — ವ್ಯಾಪಾರಗಳು ಮತ್ತು ಗೃಹಿಣಿಯರನ್ನು ಸಂಪರ್ಕಿಸುವ ಸೇತುವೆ",
    "About & Contact | Nishka":"ನಮ್ಮ ಬಗ್ಗೆ ಮತ್ತು ಸಂಪರ್ಕ | ನಿಷ್ಕಾ",
    "For Businesses | Nishka":"ವ್ಯಾಪಾರಿಗಳಿಗಾಗಿ | ನಿಷ್ಕಾ",
    "For Homemakers | Nishka":"ಗೃಹಿಣಿಯರಿಗಾಗಿ | ನಿಷ್ಕಾ"
  };
  if (!document.body.dataset.originalTitle) document.body.dataset.originalTitle = document.title;
  document.title = currentLanguage === "kn"
    ? (titleTranslations[document.body.dataset.originalTitle] || document.body.dataset.originalTitle)
    : document.body.dataset.originalTitle;

  // Restore all free text nodes first, then set every explicitly bilingual element.
  translatePageText(currentLanguage);
  document.querySelectorAll("[data-en][data-kn]").forEach(element => {
    element.textContent = currentLanguage === "kn"
      ? element.getAttribute("data-kn")
      : element.getAttribute("data-en");
  });

  // Re-translate non-bilingual text after explicit elements have been set.
  if (currentLanguage === "kn") translatePageText("kn");

  document.body.dataset.languageTranslated = currentLanguage;
  const langBtn = document.getElementById("langToggle");
  if (langBtn) {
    const labels = langBtn.querySelectorAll("span");
    if (labels.length >= 3) {
      labels[0].textContent = "English";
      labels[2].textContent = "ಕನ್ನಡ";
      labels[0].classList.toggle("lang-active", currentLanguage === "en");
      labels[2].classList.toggle("lang-active", currentLanguage === "kn");
    }
    langBtn.setAttribute("aria-label", currentLanguage === "en" ? "English selected. Choose Kannada to translate." : "Kannada selected. Choose English to translate.");
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
