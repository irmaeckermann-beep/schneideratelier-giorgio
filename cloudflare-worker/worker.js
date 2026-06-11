/* ============================================================
   Schneideratelier Giorgio – Brevo Relay (Cloudflare Worker)
   ------------------------------------------------------------
   Nimmt die Funnel-Anfrage entgegen und ruft die Brevo-API:
     1) legt/aktualisiert den Kontakt in Brevo (CRM/Liste)
     2) sendet die Lead-Mail an den Inhaber
     3) sendet die Bestätigungs-Mail an den Kunden
   Der Brevo-API-Key bleibt sicher als Worker-Secret (NICHT im Code).

   Benötigte Variablen (im Cloudflare-Dashboard → Settings → Variables):
     BREVO_API_KEY   (Secret)  – v3 API-Key aus Brevo
     SENDER_EMAIL              – in Brevo verifizierte Absenderadresse
     OWNER_EMAIL              – wohin die Leads gehen (z. B. info@…)
     ALLOWED_ORIGIN          – z. B. https://irmaeckermann-beep.github.io
     BREVO_LIST_ID  (optional) – Liste, in die Kontakte sollen
   ============================================================ */

export default {
  async fetch(request, env) {
    const allow = env.ALLOWED_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": allow,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ ok: false, error: "method" }, 405, cors);

    let d;
    try { d = await request.json(); } catch { return json({ ok: false, error: "json" }, 400, cors); }

    const API = "https://api.brevo.com/v3";
    const headers = { "api-key": env.BREVO_API_KEY, "Content-Type": "application/json", "Accept": "application/json" };
    const sender = { name: "Schneideratelier Giorgio", email: env.SENDER_EMAIL };
    const owner = env.OWNER_EMAIL || env.SENDER_EMAIL;

    const name = (d.name || "").trim();
    const first = name.split(" ")[0] || name;
    const last = name.split(" ").slice(1).join(" ");
    const email = (d.email || "").trim();
    const tel = (d.tel || "").trim();

    const rows = [
      ["Anlass", d.anlass], ["Stil", d.stil], ["Farbe", d.farbe],
      ["Zeitrahmen", d.zeitrahmen], ["Budget", d.budget], ["Wunschtermin", d.termin],
      ["Bevorzugter Kontakt", d.kontaktart], ["Nachricht", d.nachricht],
    ].filter(([, v]) => v && String(v).trim());
    const summaryHtml = rows.map(([k, v]) => `<b>${esc(k)}:</b> ${esc(v)}`).join("<br>");

    const tasks = [];

    // 1) Kontakt in Brevo (best effort)
    if (email) {
      const attributes = { FIRSTNAME: first, LASTNAME: last };
      if (tel) attributes.SMS = tel;
      tasks.push(fetch(`${API}/contacts`, {
        method: "POST", headers,
        body: JSON.stringify({
          email, attributes, updateEnabled: true,
          ...(env.BREVO_LIST_ID ? { listIds: [parseInt(env.BREVO_LIST_ID, 10)] } : {}),
        }),
      }).catch(() => {}));
    }

    // 2) Lead-Mail an den Inhaber
    tasks.push(fetch(`${API}/smtp/email`, {
      method: "POST", headers,
      body: JSON.stringify({
        sender, to: [{ email: owner }],
        replyTo: email ? { email, name } : undefined,
        subject: `Neue Massanzug-Anfrage – ${name || "Website"}`,
        htmlContent:
          `<h2 style="font-family:Georgia,serif">Neue Anfrage über die Website</h2>` +
          `<p>${summaryHtml}</p>` +
          `<hr><p><b>Name:</b> ${esc(name)}<br><b>E-Mail:</b> ${esc(email)}<br><b>Telefon:</b> ${esc(tel)}</p>`,
      }),
    }).catch(() => {}));

    // 3) Bestätigungs-Mail an den Kunden
    if (email) {
      tasks.push(fetch(`${API}/smtp/email`, {
        method: "POST", headers,
        body: JSON.stringify({
          sender, to: [{ email, name }],
          subject: "Ihre Anfrage bei Schneideratelier Giorgio",
          htmlContent:
            `<p>Guten Tag ${esc(first)},</p>` +
            `<p>vielen Dank für Ihre Anfrage. Wir melden uns innerhalb von <b>24 Stunden</b> persönlich, ` +
            `um Ihre kostenlose Erstberatung zu vereinbaren.</p>` +
            `<p><b>Ihre Angaben:</b><br>${summaryHtml}</p>` +
            `<p>Herzliche Grüsse<br><b>Schneideratelier Giorgio</b><br>` +
            `Zürcherstrasse 2, 9500 Wil · +41 71 911 25 11</p>`,
        }),
      }).catch(() => {}));
    }

    await Promise.all(tasks);
    return json({ ok: true }, 200, cors);
  },
};

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
