/* ==========================================================
   CLIENT CONFIG: edit these first
   ========================================================== */
const SITE = {
  name: "Zota Estates",
  whatsapp: "2347030985685",   // CONFIRM with client that 0703 098 5685 is on WhatsApp
  phone: "+2347030985685",
  currency: "₦",
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const fmtPrice = (l) => {
  if (l.price === null || l.price === undefined) return "Price on request";
  if (l.price === 0) return "[Price]";
  const n = l.price;
  const short = n >= 1e9 ? (n / 1e9).toFixed(n % 1e9 ? 1 : 0) + "B" : n >= 1e6 ? (n / 1e6).toFixed(n % 1e6 ? 1 : 0) + "M" : n.toLocaleString("en-NG");
  return SITE.currency + short;
};
const waLink = (msg) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function loadListings() {
  const res = await fetch("listings.json", { cache: "no-cache" });
  const data = await res.json();
  return data.listings;
}

function factsHTML(l) {
  const f = [];
  if (l.beds) f.push(`<span><b>${l.beds}</b> bed</span>`);
  if (l.baths) f.push(`<span><b>${l.baths}</b> bath</span>`);
  if (l.sqm) f.push(`<span><b class="num">${l.sqm.toLocaleString()}</b> sqm</span>`);
  return f.join("");
}

function cardHTML(l) {
  return `<a class="card rv" href="property.html?id=${encodeURIComponent(l.id)}">
    <div class="card__media"><img src="${esc(l.images[0])}" alt="${esc(l.title)}, ${esc(l.location)}" loading="lazy" width="800" height="600"><span class="tag">${esc(l.status)}</span></div>
    <div class="card__price num">${fmtPrice(l)} <small>${esc(l.priceSuffix)}</small></div>
    <div><h3>${esc(l.title)}</h3><p class="card__loc">${esc(l.location)}</p></div>
    <div class="facts">${factsHTML(l)}</div>
  </a>`;
}

/* ---------------- home page ---------------- */
async function initHome() {
  const grid = $("#listings");
  if (!grid) return;
  const all = await loadListings();
  const state = { status: "All", type: "", location: "", beds: "" };

  // populate location select from data
  const locSel = $("#q-location");
  [...new Set(all.map((l) => l.location.split(",").pop().trim()))].sort().forEach((c) => locSel.insertAdjacentHTML("beforeend", `<option>${esc(c)}</option>`));

  const render = () => {
    const out = all.filter((l) =>
      (state.status === "All" || l.status === state.status) &&
      (!state.type || l.type === state.type) &&
      (!state.location || l.location.includes(state.location)) &&
      (!state.beds || (l.beds || 0) >= +state.beds));
    grid.innerHTML = out.length ? out.map(cardHTML).join("") : `<p class="empty">No properties match that search yet. <a href="${waLink("Hi, I'm looking for a property. Can you help?")}">Tell us what you need on WhatsApp</a> and we'll find it.</p>`;
    $("#count").textContent = `${out.length} ${out.length === 1 ? "property" : "properties"}`;
    reveal();
  };

  $$(".chip").forEach((b) => b.addEventListener("click", () => {
    $$(".chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", "true");
    state.status = b.dataset.status;
    render();
  }));

  $("#search").addEventListener("submit", (e) => {
    e.preventDefault();
    state.type = $("#q-type").value;
    state.location = $("#q-location").value;
    state.beds = $("#q-beds").value;
    const st = $("#q-status").value;
    state.status = st || "All";
    $$(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.status === state.status)));
    render();
    $("#properties").scrollIntoView();
  });

  render();
}

/* ---------------- property page ---------------- */
async function initProperty() {
  const root = $("#property");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const all = await loadListings();
  const l = all.find((x) => x.id === id) || all[0];
  document.title = `${l.title} · ${l.location} · ${SITE.name}`;

  const imgs = l.images.slice(0, 3);
  const msg = `Hi ${SITE.name}, I'm interested in "${l.title}" (${l.location}). Is it still available?`;
  const facts = [
    ["Price", `${fmtPrice(l)}${l.priceSuffix ? " " + l.priceSuffix : ""}`],
    l.beds && ["Bedrooms", l.beds],
    l.baths && ["Bathrooms", l.baths],
    l.sqm && ["Size", `${l.sqm.toLocaleString()} sqm`],
    ["Type", l.type],
    l.title_doc && ["Title", l.title_doc],
  ].filter(Boolean);

  root.innerHTML = `
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="index.html#properties">Properties</a> / ${esc(l.title)}</nav>
    <header class="pd__head">
      <div><p class="eyebrow">${esc(l.status)} · ${esc(l.location)}</p><h1>${esc(l.title)}</h1></div>
      <p class="pd__price num">${fmtPrice(l)} <small>${esc(l.priceSuffix)}</small></p>
    </header>
    <div class="gallery ${imgs.length === 1 ? "gallery--1" : ""}">
      ${imgs.map((src, i) => `<button type="button" data-i="${i}" aria-label="Open photo ${i + 1} of ${l.images.length}"><img src="${esc(src)}" alt="${esc(l.title)}, photo ${i + 1}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></button>`).join("")}
    </div>
    <div class="pd__body">
      <article>
        <dl class="keyfacts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd class="num">${esc(v)}</dd></div>`).join("")}</dl>
        <h2>About this property</h2>
        <p>${esc(l.summary)}</p>
        ${l.video ? `<h2>Watch the walk-through</h2><video class="pd__video" src="${esc(l.video)}" poster="${esc(l.images[0])}" controls playsinline preload="metadata" style="width:min(100%,380px);aspect-ratio:9/16;border-radius:var(--r);background:#111"></video>` : ""}
        <h2>Features</h2>
        <ul class="featlist">${l.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
        <h2>${esc(l.mapLabel || "Location")}</h2>
        <iframe class="map" title="Map of ${esc(l.location)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(l.map)}&z=14&output=embed"></iframe>
      </article>
      <aside class="panel" aria-label="Enquire about this property">
        <h3>Interested?</h3>
        <a class="btn btn--wa" href="${waLink(msg)}" target="_blank" rel="noopener">${WA_ICON} Chat on WhatsApp</a>
        <a class="btn btn--ghost" href="tel:${SITE.phone}">Call 0703 098 5685</a>
        <form id="inspect">
          <strong>Book an inspection</strong>
          <input name="name" required placeholder="Your name" autocomplete="name" aria-label="Your name">
          <input name="date" type="date" required aria-label="Preferred date">
          <input name="time" type="time" aria-label="Preferred time">
          <button class="btn" type="submit">Request inspection</button>
          <small>Sends your request to us on WhatsApp.</small>
        </form>
      </aside>
    </div>`;

  $("#inspect").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const text = `Hi ${SITE.name}, I'd like to inspect "${l.title}" (${l.location}).\nName: ${f.get("name")}\nDate: ${f.get("date")}${f.get("time") ? "\nTime: " + f.get("time") : ""}`;
    window.open(waLink(text), "_blank", "noopener");
  });

  // JSON-LD
  const ld = {
    "@context": "https://schema.org", "@type": "RealEstateListing", name: l.title, description: l.summary,
    url: location.href, image: l.images,
    offers: l.price ? { "@type": "Offer", price: l.price, priceCurrency: "NGN" } : undefined,
  };
  const s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); document.head.append(s);

  // lightbox
  const lb = $("#lb"); let cur = 0;
  const show = (i) => { cur = (i + l.images.length) % l.images.length; $("img", lb).src = l.images[cur]; $("img", lb).alt = `${l.title}, photo ${cur + 1}`; };
  $$(".gallery button").forEach((b) => b.addEventListener("click", () => { show(+b.dataset.i); lb.showModal(); }));
  $(".lb__close", lb).onclick = () => lb.close();
  $(".lb__prev", lb).onclick = () => show(cur - 1);
  $(".lb__next", lb).onclick = () => show(cur + 1);
  lb.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1); });
}

/* ---------------- shared ---------------- */
const WA_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.2 0-5.4 4.4-9.8 9.8-9.8 2.6 0 5.1 1 6.9 2.9 1.9 1.9 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.2 1.3 15.2 0 12 0 5.5 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7c1.7.9 3.7 1.4 5.7 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4z"/></svg>`;

function reveal() {
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" }) : null;
  $$(".rv:not(.in)").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
}

function initShared() {
  $$("[data-wa]").forEach((a) => { a.href = waLink(a.dataset.wa || `Hi ${SITE.name}, I'd like to make an enquiry.`); a.target = "_blank"; a.rel = "noopener"; });
  $$(".fab").forEach((a) => (a.innerHTML = WA_ICON));
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  const cf = $("#contact-form");
  if (cf) cf.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(cf);
    const text = `Hi ${SITE.name}, I'm ${f.get("name")} (${f.get("phone")}).\nInterested in: ${f.get("interest")}\nBudget: ${f.get("budget") || "-"}\n${f.get("message") || ""}`;
    window.open(waLink(text), "_blank", "noopener");
  });
  reveal();
}

initShared();
initHome().catch(console.error);
initProperty().catch(console.error);
