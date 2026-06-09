/* ============================================================
   Schneideratelier Giorgio – Stitch-Design + Lead-Funnel
   ============================================================ */
(function () {
  "use strict";

  /* ============================================================
     LEAD-VERSAND: Hier Ihre Formspree-ID eintragen, dann landen
     alle Anfragen automatisch in Ihrem Postfach.
     1) Konto auf https://formspree.io (kostenlos), Formular anlegen
     2) Sie erhalten eine ID wie "xayzabcd" -> unten eintragen
     Solange leer, wird die Anfrage als E-Mail-Entwurf vorbereitet.
     ============================================================ */
  var FORMSPREE_ID = "";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Sticky-Header Schatten ---- */
  var header = document.getElementById("header");
  window.addEventListener("scroll", function () {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 20);
  }, { passive: true });

  /* ---- Mobile-Menü ---- */
  var burger = document.getElementById("burger");
  var mobileNav = document.getElementById("mobileNav");
  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      mobileNav.classList.toggle("hidden");
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { mobileNav.classList.add("hidden"); });
    });
  }

  /* ---- Scroll-Reveal ---- */
  (function () {
    var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ============================================================
     Funnel / Wizard
     ============================================================ */
  var form = document.getElementById("funnelForm");
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll(".qstep"));
  var total = steps.length;
  var current = 1;

  var btnBack = document.getElementById("btnBack");
  var btnNext = document.getElementById("btnNext");
  var btnSubmit = document.getElementById("btnSubmit");
  var bar = document.getElementById("progressBar");
  var stepNow = document.getElementById("stepNow");
  var stepTotalEl = document.getElementById("stepTotal");
  var errEl = document.getElementById("wizardErr");
  var summaryEl = document.getElementById("summary");

  if (stepTotalEl) stepTotalEl.textContent = total;

  var LABELS = {
    anlass: "Anlass", stil: "Stil", farbe: "Farbe",
    zeitrahmen: "Zeitrahmen", budget: "Budget", termin: "Wunschtermin"
  };

  function showStep(n) {
    steps.forEach(function (s) {
      s.classList.toggle("is-active", Number(s.dataset.step) === n);
    });
    current = n;
    var pct = Math.round((n / total) * 100);
    if (bar) bar.style.width = pct + "%";
    if (stepNow) stepNow.textContent = n;
    btnBack.hidden = n === 1;
    var isLast = n === total;
    btnNext.hidden = isLast;
    btnSubmit.hidden = !isLast;
    if (errEl) errEl.hidden = true;
    if (isLast) renderSummary();
    var wz = document.getElementById("wizard");
    if (wz && n > 1) wz.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function validateStep(n) {
    var step = steps.find(function (s) { return Number(s.dataset.step) === n; });
    if (!step) return true;
    var groups = step.querySelectorAll(".options[data-required='true']");
    for (var i = 0; i < groups.length; i++) {
      var name = groups[i].dataset.name;
      if (!form.querySelector('input[name="' + name + '"]:checked')) return false;
    }
    if (step.classList.contains("qstep--contact")) {
      var requiredFields = step.querySelectorAll("input[required]");
      var ok = true;
      requiredFields.forEach(function (f) {
        var valid = f.type === "checkbox" ? f.checked : f.value.trim() !== "" && f.checkValidity();
        f.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      });
      return ok;
    }
    return true;
  }

  function renderSummary() {
    if (!summaryEl) return;
    var data = new FormData(form);
    var html = "";
    Object.keys(LABELS).forEach(function (key) {
      var val = data.get(key);
      if (val) html += '<span class="inline-flex gap-1.5"><b class="text-atelier-gold font-semibold">' + LABELS[key] + ':</b> ' + escapeHtml(val) + '</span>';
    });
    summaryEl.innerHTML = html || "";
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  form.addEventListener("change", function (e) {
    if (e.target.type === "radio" && current < total) {
      if (errEl) errEl.hidden = true;
      setTimeout(function () { showStep(current + 1); }, 240);
    }
    if (e.target.classList && e.target.classList.contains("invalid")) {
      e.target.classList.remove("invalid");
    }
  });

  btnNext.addEventListener("click", function () {
    if (validateStep(current)) { if (current < total) showStep(current + 1); }
    else { if (errEl) errEl.hidden = false; }
  });
  btnBack.addEventListener("click", function () {
    if (current > 1) showStep(current - 1);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateStep(total)) {
      if (errEl) { errEl.hidden = false; errEl.textContent = "Bitte füllen Sie alle Pflichtfelder (*) aus."; }
      return;
    }
    var data = new FormData(form);
    var nameVal = (data.get("name") || "").toString().trim();
    var successName = document.getElementById("successName");
    if (successName) successName.textContent = nameVal ? nameVal.split(" ")[0] : "";

    form.style.display = "none";
    var progress = document.getElementById("wizardProgress");
    if (progress) progress.style.display = "none";
    var success = document.getElementById("success");
    if (success) { success.hidden = false; success.scrollIntoView({ behavior: "smooth", block: "center" }); }

    buildMailto(data);

    // Echter Versand an Ihr Postfach, sobald FORMSPREE_ID gesetzt ist
    if (FORMSPREE_ID) {
      fetch("https://formspree.io/f/" + FORMSPREE_ID, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: data
      }).catch(function () {});
    }
  });

  function buildMailto(data) {
    var lines = [];
    ["anlass", "stil", "farbe", "zeitrahmen", "budget", "termin"].forEach(function (k) {
      if (data.get(k)) lines.push((LABELS[k] || k) + ": " + data.get(k));
    });
    lines.push("");
    lines.push("Name: " + (data.get("name") || ""));
    lines.push("E-Mail: " + (data.get("email") || ""));
    lines.push("Telefon: " + (data.get("tel") || ""));
    lines.push("Bevorzugter Kontakt: " + (data.get("kontaktart") || ""));
    if (data.get("nachricht")) lines.push("Nachricht: " + data.get("nachricht"));
    var subject = "Neue Massanzug-Anfrage von " + (data.get("name") || "Website");
    var href = "mailto:info@schneideratelier-giorgio.ch?subject=" +
      encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
    var success = document.getElementById("success");
    if (success && !success.querySelector(".mailto-link")) {
      var a = document.createElement("a");
      a.href = href; a.className = "mailto-link";
      a.textContent = "Anfrage zusätzlich per E-Mail senden";
      success.appendChild(a);
    }
  }

  showStep(1);
})();
