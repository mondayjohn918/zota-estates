/* Zota Estates: page extras (loads after main.js) */
(() => {
  /* mobile menu */
  const mb = $(".menu-btn"), nav = $(".nav");
  if (mb && nav) mb.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    mb.setAttribute("aria-expanded", String(open));
    mb.textContent = open ? "Close" : "Menu";
    $(".hdr").classList.toggle("menu-open", open);
  });

  /* header height for the full-screen hero + solid header after scroll */
  const hdr = $(".hdr");
  if (hdr) {
    const setH = () => document.documentElement.style.setProperty("--hdr-h", hdr.offsetHeight + "px");
    const onScroll = () => hdr.classList.toggle("scrolled", scrollY > 40);
    setH(); onScroll();
    addEventListener("resize", setH); addEventListener("scroll", onScroll, { passive: true });
  }

  /* video play/pause + sound buttons; pause autoplay for reduced motion */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  $$("video[data-ambient]").forEach((v) => { if (reduce) { v.removeAttribute("autoplay"); v.pause(); } });
  $$("[data-vid-toggle]").forEach((b) => {
    const v = document.getElementById(b.dataset.vidToggle);
    const sync = () => (b.textContent = v.paused ? "Play" : "Pause");
    b.addEventListener("click", () => (v.paused ? v.play() : v.pause()));
    v.addEventListener("play", sync); v.addEventListener("pause", sync); sync();
  });
  $$("[data-vid-sound]").forEach((b) => {
    const v = document.getElementById(b.dataset.vidSound);
    b.addEventListener("click", () => { v.muted = !v.muted; if (!v.muted && v.paused) v.play(); b.textContent = v.muted ? "Sound on" : "Mute"; });
  });


  /* property finder on the home page */
  const fd = $("#finder");
  if (fd) fd.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(fd);
    const lines = ["Hi Zota Estates, I found you on your website.", `I want to: ${f.get("intent")}`, `Property: ${f.get("type")}`];
    if (f.get("area")) lines.push(`Area: ${f.get("area")}`);
    if (f.get("budget")) lines.push(`Budget: ₦${f.get("budget")}`);
    window.open(waLink(lines.join(String.fromCharCode(10))), "_blank", "noopener");
  });

  /* featured listings on home page */
  const feat = $("#featured");
  if (feat) loadListings().then((all) => { feat.innerHTML = all.filter((l) => l.featured).slice(0, 3).map(cardHTML).join("") +
    `<a class="card rv" href="assistant.html" style="background:var(--deep);color:#eee6da;border-radius:var(--r);padding:2rem;align-content:end;min-height:320px">
      <p class="eyebrow" style="color:#a9b9b2">Landlords & sellers</p>
      <h3 style="font:400 2rem/1.05 var(--display);color:#fff">Your property could be here next.</h3>
      <p style="color:#c4cdc8">Sell, rent out or lease with Zota. We film it, list it and bring the enquiries.</p>
      <span class="btn" style="justify-self:start;background:#fff;color:var(--ink);border-color:#fff">List with Zota</span>
    </a>`; reveal(); }).catch(console.error);

  /* ---------- Ask Zota: rule-based assistant (no AI, no data stored) ---------- */
  const log = $("#chat-log");
  if (!log) return;
  const form = $("#chat-form"), input = $("#chat-input");
  const OFFICE = "Total Filling Station, opposite New Road Junction, Sapele, Delta State";
  const DIRECTIONS = "https://www.google.com/maps/dir/?api=1&destination=5.8747984,5.7023029";
  const lead = {};
  let step = null;

  const scroll = () => (log.scrollTop = log.scrollHeight);
  const say = (html, who = "bot") => { const d = document.createElement("div"); d.className = `msg msg--${who}`; d[who === "me" ? "textContent" : "innerHTML"] = html; log.append(d); scroll(); return d; };
  const quick = (opts) => {
    const q = document.createElement("div"); q.className = "quick";
    opts.forEach(([label, fn]) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; b.onclick = () => { q.remove(); say(label, "me"); fn(label); }; q.append(b); });
    log.append(q); scroll();
  };
  const bot = (html, opts, delay = 550) => {
    const t = document.createElement("div"); t.className = "msg msg--bot"; t.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>'; log.append(t); scroll();
    setTimeout(() => { t.remove(); say(html); if (opts) quick(opts); }, reduce ? 0 : delay);
  };

  const MENU = () => [
    ["Buy a property", () => start("Buy")],
    ["Rent a place", () => start("Rent")],
    ["Sell my property", () => start("Sell")],
    ["Lease", () => start("Lease")],
    ["Land & development", () => start("Development")],
    ["Manage my property", () => start("Property management")],
    ["Office & hours", office],
  ];

  function office() {
    bot(`Our office is at <b>${OFFICE}</b>.\nGoogle lists us as open 24 hours. Calling first is best: <a href="tel:+2347030985685">0703 098 5685</a>.\n<a class="btn btn--ghost" href="${DIRECTIONS}" target="_blank" rel="noopener">Get directions</a>`, [["Something else", () => bot("What can I help with?", MENU())]]);
  }

  function start(intent) {
    lead.intent = intent;
    if (intent === "Sell" || intent === "Lease" || intent === "Property management") {
      step = "about";
      return bot(intent === "Property management" ? "Great. What kind of property do you want us to manage, and where is it?" : `Good. Tell me about the property you want to ${intent.toLowerCase()}: the type, and where it is.`);
    }
    step = "type";
    bot("What type of property?", ["Flat / apartment", "House / duplex", "Land / plot", "Shop / office", "Guest house", "Not sure yet"].map((t) => [t, (v) => { lead.type = v; askArea(); }]));
  }
  function askArea() { step = "area"; bot("Which area? Type a neighbourhood or pick one.", [["Anywhere in Sapele", (v) => { lead.area = v; askBudget(); }]]); }
  function askBudget() { step = "budget"; bot(lead.intent === "Rent" ? "Roughly what's your budget per year? (e.g. ₦600,000)" : "Roughly what's your budget? (e.g. ₦15M)", [["Prefer to discuss", (v) => { lead.budget = v; askName(); }]]); }
  function askName() { step = "name"; bot("Last thing: your name, so the team knows who they're talking to?"); }
  function finish() {
    step = null;
    const lines = [`Hi Zota Estates, I'm ${lead.name}.`, `I'd like to: ${lead.intent}`];
    if (lead.type) lines.push(`Property type: ${lead.type}`);
    if (lead.about) lines.push(`Details: ${lead.about}`);
    if (lead.area) lines.push(`Area: ${lead.area}`);
    if (lead.budget) lines.push(`Budget: ${lead.budget}`);
    lines.push("(Sent from the Zota Estates website)");
    const text = lines.join("\n");
    bot(`Thanks, ${esc(lead.name)}. Here's your request:\n\n<i>${esc(text)}</i>\n\nTap below to send it to the Zota team on WhatsApp, or call <a href="tel:+2347030985685">0703 098 5685</a>.\n<a class="btn btn--wa" href="${waLink(text)}" target="_blank" rel="noopener">${WA_ICON} Send on WhatsApp</a>`, [["Start again", () => bot("What can I help with?", MENU())]], 800);
  }

  function freeText(t) {
    const s = t.toLowerCase();
    if (step === "about") { lead.about = t; return askArea(); }
    if (step === "type") { lead.type = t; return askArea(); }
    if (step === "area") { lead.area = t; return askBudget(); }
    if (step === "budget") { lead.budget = t; return askName(); }
    if (step === "name") { lead.name = t.slice(0, 60); return finish(); }
    if (/hour|open|time|close/.test(s)) return bot("Google lists Zota Estates as open 24 hours. For an inspection or office visit, call ahead: <a href=\"tel:+2347030985685\">0703 098 5685</a>.", [["Book an inspection", () => start("Inspect a property")], ["Something else", () => bot("What can I help with?", MENU())]]);
    if (/where|address|office|locat|direction|find you/.test(s)) return office();
    if (/phone|call|number|contact|whatsapp/.test(s)) return bot(`Call or WhatsApp <a href="tel:+2347030985685">0703 098 5685</a>.\n<a class="btn btn--wa" href="${waLink("Hi Zota Estates, I have an enquiry.")}" target="_blank" rel="noopener">${WA_ICON} Open WhatsApp</a>`);
    if (/c of o|document|title|survey|deed|genuine|fraud|scam|verify/.test(s)) return bot("Good question. Before paying for any property, ask to see the title documents (for example C of O, survey plan, deed of assignment) and have a lawyer check them. The Zota team can tell you which documents come with a specific property.", [["Ask the team", () => start("Ask about documents")], ["Something else", () => bot("What can I help with?", MENU())]]);
    if (/price|cost|how much|fee|cheap|afford/.test(s)) return bot("Prices depend on the property, area and terms, so the team quotes per property. Tell me what you're looking for and I'll pass it on.", MENU());
    if (/inspect|view|visit|see the/.test(s)) return start("Inspect a property");
    if (/rent|flat|apartment|room|self.?con/.test(s)) return start("Rent");
    if (/buy|purchase|own/.test(s)) return start("Buy");
    if (/sell/.test(s)) return start("Sell");
    if (/lease/.test(s)) return start("Lease");
    if (/land|plot|develop|build/.test(s)) return start("Development");
    if (/manag|landlord|tenant/.test(s)) return start("Property management");
    if (/^(hi|hello|hey|good (morning|afternoon|evening))/.test(s)) return bot("Hello! What can I help you with today?", MENU());
    bot("I'm a simple assistant, so I may not understand that. The Zota team can answer it directly:", [["Send my question on WhatsApp", () => window.open(waLink(`Hi Zota Estates, ${t}`), "_blank", "noopener")], ["Show options", () => bot("What can I help with?", MENU())]]);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const t = input.value.trim(); if (!t) return;
    $$(".quick", log).forEach((q) => q.remove());
    say(t, "me"); input.value = ""; freeText(t);
  });

  bot("Hello, welcome to Zota Estates. I'm the site assistant (automated).\nI can help you buy, rent, sell or lease property in Sapele, then pass your request straight to the Zota team on WhatsApp.\n\nWhat would you like to do?", MENU(), 300);
})();
