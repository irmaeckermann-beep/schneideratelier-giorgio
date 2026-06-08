# Schneideratelier Giorgio – Landingpage

Moderne Lead-Landingpage im edlen Stitch-Design („Sartorial Excellence":
Navy + Atelier-Gold, Libre Caslon) mit integriertem **Massanzug-Funnel**.

## Dateien
- `index.html` – komplette Seite (Tailwind via CDN)
- `app.js` – Funnel-Logik, Lead-Versand, Animationen
- `images/` – Bilder (`st-*.jpg` = Designbilder, `g_suits.jpg` = echtes Foto)
- `_backup_v1/` – frühere Version (Sicherung)

---

## 1) Lead-Versand scharfschalten (damit Anfragen ankommen) — 3 Min.
Aktuell zeigt der Funnel eine Danke-Meldung + E-Mail-Entwurf. Für echten
Eingang im Postfach:

1. Kostenlos registrieren auf **https://formspree.io**
2. Neues Formular anlegen → Sie erhalten eine **ID** wie `xayzabcd`
3. In `app.js` ganz oben eintragen:
   ```js
   var FORMSPREE_ID = "xayzabcd";
   ```
Fertig. Jede Anfrage (inkl. Anlass, Stil, Farbe, Zeitrahmen, Budget + Kontakt)
landet dann automatisch bei `info@schneideratelier-giorgio.ch`.

---

## 2) Online stellen (Hosting) — 5 Min.
Die Seite ist **statisch** und läuft überall. Einfachster Weg:

**Netlify Drop (kostenlos, kein Konto-Zwang zum Test):**
1. Auf **https://app.netlify.com/drop** gehen
2. Den **gesamten Projektordner** (mit `index.html`, `app.js`, `images/`)
   per Drag & Drop hineinziehen
3. Sie erhalten sofort eine Live-URL. Eigene Domain später verknüpfbar.

Alternativen: Vercel, Cloudflare Pages, oder beim bestehenden Hoster ins
Web-Verzeichnis kopieren.

> Hinweis: Tailwind & Schriften kommen per CDN – die Seite braucht also nur
> Internet, keinen Build-Schritt.

---

## 3) Bilder austauschen (optional)
Die Designbilder sind hochwertig, aber teils KI-generiert. Zum Ersetzen einfach
gleichnamige Dateien in `images/` ablegen:
- `st-hero.jpg` – Hero (Person im Anzug)
- `st-tailor.jpg` – Atelier/Beratung
- `st-fabric.jpg` – Stoff
- `g_suits.jpg` – kleines Hero-Detail (bereits ein echtes Giorgio-Foto)

Empfohlene Grössen: Hero ca. 1200×1500 px, Atelier ca. 1200×900 px.

---

## 4) Texte & Farben anpassen
- **Texte/Kontakt:** direkt in `index.html`
- **Farben:** in `index.html` im `tailwind.config` (`sartorial-navy`,
  `atelier-gold`)
- **Funnel-Fragen:** die `<fieldset class="qstep">`-Blöcke in `index.html`
  (neue Antwort = weiteres `<label class="opt">`)

## Lokal testen
```
cd <Projektordner>
python3 -m http.server 8000   # dann http://localhost:8000
```
