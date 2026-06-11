# Brevo-Anbindung über Cloudflare Worker (gratis)

Dieser Worker ist der sichere „Relay" zwischen der Website und Brevo. Der
Brevo-API-Key bleibt dabei als geheime Variable im Worker – nie im Website-Code.

## Einrichtung (ca. 10 Min., alles im Browser)

### 1. Brevo vorbereiten
- In Brevo einen **API-Key (v3)** erstellen: *Profil → SMTP & API → API Keys → Neuen Key*.
- Eine **Absenderadresse verifizieren**: *Senders, Domains & Dedicated IPs → Senders*
  (z. B. `info@schneideratelier-giorgio.ch`). Wichtig, sonst werden Mails nicht versendet.
- (Optional) Die **ID einer Kontaktliste** notieren, in die neue Leads sollen
  (*Contacts → Lists*, die Zahl in der URL/Liste).

### 2. Cloudflare Worker anlegen
1. Kostenloses Konto auf **https://dash.cloudflare.com** (falls noch keins).
2. **Workers & Pages → Create → Worker** → Namen vergeben (z. B. `giorgio-brevo`) → **Deploy**.
3. **Edit code** → den gesamten Inhalt von `worker.js` einfügen → **Deploy**.

### 3. Variablen setzen
Im Worker: **Settings → Variables and Secrets** → folgende anlegen:

| Name | Typ | Wert |
|---|---|---|
| `BREVO_API_KEY` | **Secret** | dein Brevo v3 API-Key |
| `SENDER_EMAIL` | Text | verifizierte Absenderadresse |
| `OWNER_EMAIL` | Text | wohin die Leads gehen (z. B. info@…) |
| `ALLOWED_ORIGIN` | Text | `https://irmaeckermann-beep.github.io` |
| `BREVO_LIST_ID` | Text | (optional) ID der Kontaktliste |

→ **Deploy** erneut.

### 4. Worker-URL kopieren
Oben steht die URL, z. B. `https://giorgio-brevo.DEINNAME.workers.dev`.
**Diese URL an mich geben** – ich trage sie in `app.js` ein (`BREVO_WORKER_URL`)
und stelle die Seite live. Fertig.

## Was dann automatisch passiert (bei jeder Anfrage)
1. Kontakt wird in Brevo angelegt/aktualisiert (optional in deine Liste)
2. Lead-Mail an den Inhaber (`OWNER_EMAIL`)
3. Bestätigungs-Mail an den Kunden

> Tipp: Den Bestätigungstext kannst du im Worker-Code (`worker.js`, Abschnitt 3)
> jederzeit anpassen. Für Newsletter/Automationen nutzt du dann direkt Brevo.
