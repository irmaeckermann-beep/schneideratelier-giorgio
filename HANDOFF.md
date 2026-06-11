# Schneideratelier Giorgio – Landingpage · Übergabe

Eine moderne, konversionsoptimierte **Lead-Landingpage** für massgeschneiderte
Anzüge. Edles „Sartorial“-Design (Navy + Atelier-Gold), integrierter
**Anzug-Konfigurator** (Quiz) mit Kontakt-/Terminerfassung.

## 🌐 Live
**https://irmaeckermann-beep.github.io/schneideratelier-giorgio/**
Hosting: GitHub Pages · Repo: `irmaeckermann-beep/schneideratelier-giorgio`

---

## Funktionen im Überblick
- **Hero mit Direkt-Start-Quiz** – „Wofür brauchen Sie Ihren Anzug?“ direkt anklickbar
- **7-Schritt-Konfigurator**: Anlass → Stil → Farbe (inkl. „beraten Sie mich“ & eigener Farbeingabe) → Zeitrahmen → Budget → **Wunschtermin** → Kontakt
- **Lead-Erfassung**: alle Antworten + Name, E-Mail, Telefon, bevorzugter Kontakt (Telefon/E-Mail/WhatsApp)
- **Feste Beratungstermine** zur Auswahl (aktuell Di 18:00 & Sa 10:00 – anpassbar)
- **Echte Google-Rezensionen** + 5,0★/364-Badge
- **Stoff-Sektion** (Scabal · Wilvorst · Damat), **Handwerk-Sektion**, **Kundenstimmen**
- **AGB** & **Datenschutzerklärung** (verlinkt in Formular + Footer)
- Responsive (Handy/Tablet/Desktop), schöne Link-Vorschau beim Teilen, Favicon

---

## ⚠️ Noch zu erledigen: Brevo-Anbindung aktivieren (ca. 10 Min.)
Leads landen dann **direkt in Brevo (CRM)**, der Inhaber bekommt eine **Lead-Mail**
und der Kunde eine **Bestätigungs-Mail** – Newsletter/Automationen über Brevo möglich.

Da der Brevo-API-Key geheim bleiben muss, läuft die Anbindung über einen kleinen,
kostenlosen **Cloudflare-Worker** (Relay). Schritt für Schritt:
**→ siehe [cloudflare-worker/README.md](cloudflare-worker/README.md)**

Kurz: Brevo-API-Key + verifizierten Absender anlegen → Worker bei Cloudflare
deployen (Code in `cloudflare-worker/worker.js`) → Variablen setzen → **Worker-URL**
in `app.js` bei `BREVO_WORKER_URL` eintragen → live stellen.

> Bis dahin zeigt das Formular eine Danke-Meldung und bietet einen E-Mail-Entwurf an –
> es gehen aber noch keine automatischen Mails raus.

---

## Inhalte & Bilder ändern
- **Texte / Kontakt / Öffnungszeiten:** in `index.html`
- **Termin-Slots:** in `index.html` im Block „Wunschtermin“ (Werte der `<label class="opt">`)
- **Farben:** in `index.html` im `tailwind.config` (`sartorial-navy`, `atelier-gold`)
- **Bilder:** Dateien in `images/` ersetzen (gleicher Name = automatisch übernommen)
  - `st-hero.jpg` – Hero (Person im Anzug) · `suits.jpg` – Handwerk · `fabric.jpg` – Stoffe
  - `beratung.jpg` – echtes Reserve-Foto (Beratungsszene)

## Seite aktualisieren (live stellen)
Die Seite liegt auf GitHub. Jede Änderung wird mit einem Push automatisch live
(GitHub Pages baut in 1–2 Min. neu):
```
git add -A && git commit -m "Update" && git push
```

---

## Rechtliches
`agb.html` und `datenschutz.html` wurden aus den bereitgestellten Vorlagen auf
Schneideratelier Giorgio angepasst (Adresse Zürcherstrasse 2, 9500 Wil; Gerichtsstand Wil).
**Bitte rechtlich gegenprüfen** (z. B. Treuhänder) und ggf. den exakten Rechtsträger
(z. B. „Giorgio Bekleidungen GmbH“) ergänzen.

## Optionale Ausbaustufen (jederzeit nachrüstbar)
- **Eigene Domain** (z. B. `schneideratelier-giorgio.ch`) auf GitHub Pages verbinden
- **Brevo-Anbindung** (Leads direkt ins CRM + Newsletter/Automationen) – via sicheren Relay
- **Direkt-Buchung** (Calendly/Cal.com) statt Terminanfrage – Echtzeit-Slots

---

## Dateien
```
index.html        – Startseite (Tailwind via CDN)
app.js            – Konfigurator-Logik, Validierung, Lead-Versand
agb.html          – AGB
datenschutz.html  – Datenschutzerklärung
images/           – Bilder
```
