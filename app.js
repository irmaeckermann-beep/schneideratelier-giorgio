/* ============================================================
   Schneideratelier Giorgio – Stitch-Design + Lead-Funnel
   ============================================================ */
(function () {
  "use strict";

  /* ============================================================
     LEAD-VERSAND via Brevo (über den Cloudflare-Worker-Relay) –
     legt den Kontakt in Brevo an, sendet Lead-Mail an den Inhaber
     und Bestätigungs-Mail an den Kunden.
     Einrichtung: siehe cloudflare-worker/README.md
     -> Worker deployen und dessen URL hier eintragen.
     Solange leer: Anfrage wird als E-Mail-Entwurf vorbereitet (mailto).
     ============================================================ */
  var BREVO_WORKER_URL = "";

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

  /* ---- Eigene Farbidee ---- */
  var farbeCustom = document.getElementById("farbeCustom");
  function toggleFarbeCustom() {
    var sel = form.querySelector('input[name="farbe"]:checked');
    var isCustom = sel && sel.value === "__custom__";
    if (farbeCustom) {
      farbeCustom.hidden = !isCustom;
      if (isCustom) setTimeout(function () { farbeCustom.focus(); }, 60);
    }
  }
  function resolveFarbe(data) {
    var v = data.get("farbe");
    if (v === "__custom__") {
      var t = farbeCustom && farbeCustom.value.trim();
      return t ? "Eigene Idee: " + t : "Eigene Idee (offen)";
    }
    return v;
  }
  if (farbeCustom) farbeCustom.addEventListener("input", function () {
    this.classList.remove("invalid");
    if (errEl) errEl.hidden = true;
  });

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
    // "Eigene Farbidee" gewählt -> Text erforderlich
    var farbeSel = step.querySelector('input[name="farbe"]:checked');
    if (farbeSel && farbeSel.value === "__custom__" && (!farbeCustom || farbeCustom.value.trim() === "")) {
      if (farbeCustom) farbeCustom.classList.add("invalid");
      return false;
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
      var val = key === "farbe" ? resolveFarbe(data) : data.get(key);
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
    if (e.target.name === "farbe") toggleFarbeCustom();
    if (e.target.type === "radio" && current < total) {
      if (errEl) errEl.hidden = true;
      // Bei "Eigene Farbidee" nicht automatisch weiter – erst tippen lassen
      var pause = e.target.name === "farbe" && e.target.value === "__custom__";
      if (!pause) setTimeout(function () { showStep(current + 1); }, 240);
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
    if (BREVO_WORKER_URL) { var sm = document.getElementById("successMail"); if (sm) sm.hidden = false; }

    buildMailto(data);

    // Versand an Brevo (Kontakt + Lead-Mail + Bestätigung an den Kunden),
    // sobald BREVO_WORKER_URL gesetzt ist
    if (BREVO_WORKER_URL) {
      var lead = {
        anlass: data.get("anlass"), stil: data.get("stil"),
        farbe: resolveFarbe(data), zeitrahmen: data.get("zeitrahmen"),
        budget: data.get("budget"), termin: data.get("termin"),
        name: data.get("name"), email: data.get("email"), tel: data.get("tel"),
        kontaktart: data.get("kontaktart"), nachricht: data.get("nachricht"),
      };
      fetch(BREVO_WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      }).catch(function () {});
    }
  });

  function buildMailto(data) {
    var lines = [];
    ["anlass", "stil", "farbe", "zeitrahmen", "budget", "termin"].forEach(function (k) {
      var v = k === "farbe" ? resolveFarbe(data) : data.get(k);
      if (v) lines.push((LABELS[k] || k) + ": " + v);
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

  // Sticky-CTA (Handy) ausblenden, solange der Konfigurator sichtbar ist
  (function () {
    var sticky = document.getElementById("stickyCta");
    var konf = document.getElementById("konfigurator");
    if (!sticky || !konf) return;
    function upd() {
      var r = konf.getBoundingClientRect();
      sticky.style.display = (r.top < window.innerHeight && r.bottom > 0) ? "none" : "";
    }
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  })();

  // Hero-Direktstart: erste Frage im Hero -> Funnel springt zu Schritt 2
  Array.prototype.slice.call(document.querySelectorAll(".hero-start")).forEach(function (b) {
    b.addEventListener("click", function () {
      var val = b.getAttribute("data-anlass");
      var radio = form.querySelector('input[name="anlass"][value="' + val + '"]');
      if (radio) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); }
      var k = document.getElementById("konfigurator");
      if (k) k.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
