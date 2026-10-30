const $ = selector => document.querySelector(selector);
const app = $("#app");

const paths = {
  pin: `
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  `,
  chat: '<path d="M3 4h18v14H8l-5 4Z"/>',
  search: `
    <circle cx="10" cy="10" r="8"/>
    <path d="m16 16 6 6"/>
  `,
  database: `
    <ellipse cx="12" cy="5" rx="8" ry="3"/>
    <path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>
  `,
  lock: `
    <rect x="4" y="10" width="16" height="12" rx="2"/>
    <path d="M7 10V6a5 5 0 0 1 10 0v4"/>
  `,
  phone: `
    <rect x="6" y="2" width="12" height="20" rx="2"/>
    <path d="M10 19h4"/>
  `
};

function icon(name) {
  return `
    <span class="icon">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        ${paths[name] || paths.chat}
      </svg>
    </span>
  `;
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

function read(key, defaultValue = []) {
  if (key === "config") {
    return {
      endpoint: "/api/chat",
      model: "gemini-3.1-flash-lite"
    };
  }

  try {
    return JSON.parse(localStorage.getItem("qure-" + key))
      ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

function save(key, value) {
  try {
    localStorage.setItem("qure-" + key, JSON.stringify(value));
  } catch {
    toast("Browser storage is unavailable. Your changes will not persist.");
  }
}

/* Safely format basic Markdown without inserting untrusted HTML. */
function formatAnswer(text) {
  const inline = value => esc(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

  let html = "";
  let list = null;

  function closeList() {
    if (list) {
      html += "</" + list + ">";
      list = null;
    }
  }

  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();

    if (!line) {
      closeList();
      continue;
    }

    const heading = line.match(/^#{1,6}\s+(.+)/);
    const bullet = line.match(/^(?:[-*•]\s+|\d+[.)]\s+)(.*)/);

    if (heading) {
      closeList();
      html += "<h4>" + inline(heading[1]) + "</h4>";
    } else if (bullet) {
      const type = /^\d/.test(line) ? "ol" : "ul";

      if (list !== type) {
        closeList();
        list = type;
        html += "<" + type + ">";
      }

      html += "<li>" + inline(bullet[1]) + "</li>";
    } else {
      closeList();
      html += "<p>" + inline(line) + "</p>";
    }
  }

  closeList();
  return '<div class="formatted-answer">' + html + "</div>";
}

function toast(text) {
  $("#toast").textContent = text;
  $("#toast").style.display = "block";

  setTimeout(() => {
    $("#toast").style.display = "none";
  }, 4500);
}

function download(name, data) {
  const anchor = document.createElement("a");

  anchor.href = URL.createObjectURL(
    new Blob([data], { type: "application/json" })
  );

  anchor.download = name;
  anchor.click();

  setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
}

function nav(routeName) {
  const links = [
    ["home", "Home"],
    ["medimap", "MediMap"],
    ["chatbot", "ChatBot"],
    ["symptoms", "Symptoms"],
    ["api-portal", "API"]
  ];

  return `
    <nav aria-label="Main navigation">
      ${links.map(([route, title]) => `
        <a
          class="${route === routeName ? "active" : ""}"
          href="#/${route}"
        >${title}</a>
      `).join("")}
    </nav>
  `;
}

/* Homepage */

const tools = [
  [
    "pin",
    "MediMap",
    "Find hospitals and medical facilities near you with an interactive map. Get directions and contact information instantly.",
    "medimap"
  ],
  [
    "chat",
    "AI Health Assistant",
    "Your 24/7 intelligent health companion providing personalized advice, answering questions, and guiding your wellness journey.",
    "chatbot"
  ],
  [
    "search",
    "Symptom Intelligence",
    "Advanced symptom analysis with AI-powered insights, likelihood assessments, and guidance on when to seek medical care.",
    "symptoms"
  ]
];

function home() {
  const features = [
    [
      "database",
      "Local Storage",
      "All your health data is stored locally using localStorage for maximum privacy and offline access."
    ],
    [
      "lock",
      "Privacy First",
      "Your personal health information never leaves your device unless you explicitly choose to share it."
    ],
    [
      "phone",
      "Offline Ready",
      "Access your health data anytime, anywhere. Works completely offline with smart sync when online."
    ]
  ];

  app.innerHTML = `
    <header class="hero">
      <nav>
        <a href="#about">About</a>
        <a href="#info">Info</a>
        <a href="#tools">Tools</a>
      </nav>

      <div class="hero-content">
        <h1>Welcome to <em>Qure</em></h1>
        <p class="tagline">"Healthcare made efficient"</p>
        <a href="#tools" class="down" aria-label="Explore tools">⌄</a>
      </div>
    </header>

    <section class="section privacy" id="about">
      <h2>Your Health, Reimagined</h2>
      <p class="lead" style="margin-bottom:0">
        Qure is your intelligent health companion powered by advanced AI.
        Get personalized insights, find nearby hospitals, track symptoms,
        and make informed health decisions — all in one place,
        all on your device.
      </p>
    </section>

    <section class="section" id="tools">
      <h2>Powerful Health Tools</h2>
      <p class="lead">
        A focused suite of tools designed to help you manage your health
        with precision and confidence.
      </p>

      <div class="cards">
        ${tools.map(([name, title, description, route]) => `
          <article class="card">
            ${icon(name)}
            <h3>${title}</h3>
            <p>${description}</p>
            <a class="explore" href="#/${route}">
              Explore &nbsp;→
            </a>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="section privacy" id="info">
      <h2>Your Data, Your Control</h2>
      <p class="lead">
        Built with privacy-first principles. Your health data stays on
        your device with advanced local storage and optional cloud sync.
      </p>

      <div class="privacy-grid">
        <div>
          ${features.map(([name, title, description]) => `
            <div class="feature">
              ${icon(name)}
              <div>
                <h3>${title}</h3>
                <p>${description}</p>
              </div>
            </div>
          `).join("")}
        </div>

        <div class="card intel">
          <h3>Advanced AI Health Intelligence</h3>
          <ul>
            <li>♧ &nbsp;Google Gemini Integration</li>
            <li>⌕ &nbsp;Nearby Facilities</li>
            <li>♧ &nbsp;Hospital Finder</li>
            <li>▱ &nbsp;Personalized Insights</li>
            <li>ϟ &nbsp;Symptom Analysis</li>
            <li>♡ &nbsp;Health Tracking</li>
          </ul>
          <a class="green" href="#/chatbot">
            Start Your Health Journey &nbsp; →
          </a>
        </div>
      </div>
    </section>

    <footer>Qure · Healthcare made efficient</footer>
  `;
}

/* MediMap */

let map;
let markers;
let searchController;
let searchGeneration = 0;
let center = [28.66, 77.09];
let mapTimer;

function medimap() {
  app.innerHTML = nav("medimap") + `
    <main class="container">
      <h1>MediMap</h1>
      <p class="subtitle">
        Find hospitals and medical facilities near you
      </p>

      <div class="panel toolbar">
        <label for="radius">Search radius:</label>
        <input id="radius" type="range" min="1" max="20" value="5">
        <output id="radius-value">5km</output>
        <button id="recenter" class="green">➤ Re-centre</button>
      </div>

      <div class="map-layout">
        <div>
          <div id="map"></div>
          <p class="note" id="map-note">
            Showing Delhi by default. Use Re-centre to search near your
            location. Map and hospital search require internet.
          </p>
        </div>

        <aside>
          <h3>Nearby Hospitals</h3>
          <div id="hospitals" aria-live="polite">
            Finding hospitals…
          </div>
        </aside>
      </div>
    </main>
  `;

  if (!window.L) {
    $("#map").textContent =
      "Map could not load. Check your internet connection and reload.";
    $("#hospitals").textContent = "Map service unavailable.";
    return;
  }

  map = L.map("map").setView(center, 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19
  }).addTo(map);

  markers = L.layerGroup().addTo(map);

  $("#radius").oninput = event => {
    $("#radius-value").textContent = event.target.value + "km";
    clearTimeout(mapTimer);
    mapTimer = setTimeout(findHospitals, 450);
  };

  $("#recenter").onclick = () => {
    if (!navigator.geolocation) {
      return toast("Location is not supported by this browser.");
    }

    $("#map-note").textContent = "Requesting your location…";

    navigator.geolocation.getCurrentPosition(
      position => {
        center = [
          position.coords.latitude,
          position.coords.longitude
        ];

        map.setView(center, 13);
        $("#map-note").textContent =
          "Showing facilities near your location.";

        findHospitals();
      },
      () => {
        $("#map-note").textContent =
          "Location unavailable or permission denied. Showing Delhi; " +
          "move the map and search here.";

        toast("Allow location access to find hospitals near you.");
      },
      { timeout: 12000 }
    );
  };

  map.on("moveend", () => {
    clearTimeout(mapTimer);

    mapTimer = setTimeout(() => {
      const position = map.getCenter();
      center = [position.lat, position.lng];
      findHospitals();
    }, 700);
  });

  findHospitals();
}

async function findHospitals() {
  if (!$("#hospitals")) return;

  const generation = ++searchGeneration;

  searchController?.abort();
  searchController = new AbortController();

  const controller = searchController;
  const timer = setTimeout(() => controller.abort(), 65000);

  $("#hospitals").textContent = "Finding hospitals…";

  const radius = Number($("#radius").value) * 1000;

  try {
    const url =
      "/api/hospitals?lat=" + encodeURIComponent(center[0]) +
      "&lon=" + encodeURIComponent(center[1]) +
      "&radius=" + radius;

    const response = await fetch(url, {
      signal: controller.signal
    });

    if (!response.ok) throw Error();

    const data = await response.json();

    if (
      generation !== searchGeneration ||
      !$("#hospitals")
    ) return;

    markers.clearLayers();

    const items = data.elements
      .map(element => ({
        ...element,
        lat: element.lat ?? element.center?.lat,
        lon: element.lon ?? element.center?.lon
      }))
      .filter(element =>
        Number.isFinite(element.lat) &&
        Number.isFinite(element.lon)
      )
      .sort((first, second) => distance(first) - distance(second));

    $("#hospitals").innerHTML = items.length
      ? ""
      : "No hospitals found in this radius. Try a larger radius or move the map.";

    items.forEach(element => {
      const name = element.tags.name || "Hospital";
      const point = [element.lat, element.lon];

      const marker = L.marker(point)
        .addTo(markers)
        .bindPopup(esc(name));

      const row = document.createElement("div");
      row.className = "hospital";

      row.innerHTML = `
        <strong>${esc(name)}</strong>
        <p>
          ${distance(element).toFixed(1)} km away
          ${element.tags["addr:street"]
            ? " · " + esc(element.tags["addr:street"])
            : ""}
        </p>

        <a
          target="_blank"
          rel="noopener"
          href="https://www.google.com/maps/dir/?api=1&destination=${element.lat},${element.lon}"
        >Get directions ↗</a>

        ${element.tags.phone ? `
          · <a href="tel:${esc(element.tags.phone.replace(/[^+0-9]/g, ""))}">
            Call
          </a>
        ` : ""}
      `;

      const button = document.createElement("button");
      button.className = "outline";
      button.textContent = "Show on map";

      button.onclick = () => {
        map.setView(point, 15);
        marker.openPopup();
      };

      row.append(document.createElement("br"), button);
      $("#hospitals").append(row);
    });
  } catch {
    if (
      generation === searchGeneration &&
      $("#hospitals")
    ) {
      $("#hospitals").innerHTML = `
        Hospital data providers are currently unavailable.
        You can still move and zoom the map, or search hospitals
        in Google Maps.

        <p>
          <a
            class="green"
            target="_blank"
            rel="noopener"
            href="https://www.google.com/maps/search/hospitals/@${center[0]},${center[1]},13z"
          >Find hospitals in Google Maps ↗</a>
        </p>

        <button class="outline" id="retry">Retry here</button>
      `;

      $("#retry").onclick = findHospitals;
    }
  } finally {
    clearTimeout(timer);
  }
}

function distance(element) {
  const radians = Math.PI / 180;
  const latitudeDifference = (element.lat - center[0]) * radians;
  const longitudeDifference = (element.lon - center[1]) * radians;

  const value =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(center[0] * radians) *
    Math.cos(element.lat * radians) *
    Math.sin(longitudeDifference / 2) ** 2;

  return 6371 * 2 * Math.atan2(
    Math.sqrt(value),
    Math.sqrt(1 - value)
  );
}

/* Voice input */

function voice(selector) {
  const Speech =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!Speech) {
    return toast(
      "Voice input is unavailable in this browser. Please type your message."
    );
  }

  const recognition = new Speech();
  recognition.lang = "en-IN";

  recognition.onresult = event => {
    $(selector).value = event.results[0][0].transcript;
    $(selector).dispatchEvent(new Event("input"));
  };

  recognition.onerror = () => {
    toast("Voice input failed. Check microphone permission.");
  };

  recognition.start();
  toast("Listening…");
}

/* Chat */

let chatBusy = false;

const welcome = {
  role: "assistant",
  content: "How can I help you with your health today?",
  time: new Date().toISOString()
};

function chatbot() {
  app.innerHTML = nav("chatbot") + `
    <main class="chat-container">
      <div class="heading-row">
        <div>
          <h1>AI Health Assistant</h1>
          <p class="subtitle">Get personalized health guidance</p>
        </div>

        <div>
          <button class="outline" id="export-chat">
            ♧ &nbsp; Export
          </button>
          <button class="outline" id="clear-chat">
            ♜ &nbsp; Clear
          </button>
        </div>
      </div>

      <section class="panel chat">
        <div class="chat-title">
          <span style="color:#27db65">♧</span>
          &nbsp; Chat with AI Assistant
        </div>

        <div
          class="messages"
          id="messages"
          role="log"
          aria-live="polite"
        ></div>

        <form id="chat-form" class="composer">
          <div class="input-wrap">
            <input
              id="chat-input"
              aria-label="Message"
              placeholder="Ask me about your health..."
              required
              maxlength="8000"
            >
            <button
              type="button"
              class="mic"
              id="voice-chat"
              aria-label="Voice input"
            >♩</button>
          </div>

          <button class="green" id="send" aria-label="Send message">
            ➤
          </button>
        </form>
      </section>

      <p class="note">
        Powered by Gemini through your local server.
        Messages stay in this browser until sent to Google for a reply.
        Use fictional health examples on the free tier.
        <a href="#/settings">Connection status</a>.
      </p>
    </main>
  `;

  renderMessages();

  $("#voice-chat").onclick = () => voice("#chat-input");

  $("#export-chat").onclick = () => {
    download(
      "qure-chat.json",
      JSON.stringify(read("chat"), null, 2)
    );
  };

  $("#clear-chat").onclick = () => {
    save("chat", []);
    renderMessages();
    toast("Chat cleared");
  };

  $("#chat-form").onsubmit = async event => {
    event.preventDefault();
    if (chatBusy) return;

    const content = $("#chat-input").value.trim();
    if (!content) return;

    const messages = read("chat");

    messages.push({
      role: "user",
      content,
      time: new Date().toISOString()
    });

    save("chat", messages);
    $("#chat-input").value = "";
    renderMessages();

    chatBusy = true;
    $("#send").disabled = true;

    try {
      const text = await askAI(messages);
      const latest = read("chat");

      latest.push({
        role: "assistant",
        content: text,
        time: new Date().toISOString()
      });

      save("chat", latest);

      if ($("#messages")) renderMessages();
    } catch (error) {
      toast(error.message);
    } finally {
      chatBusy = false;
      if ($("#send")) $("#send").disabled = false;
    }
  };
}

function renderMessages() {
  const messages = read("chat");

  $("#messages").innerHTML = (
    messages.length ? messages : [welcome]
  ).map(message => `
    <div class="message ${message.role === "user" ? "user" : ""}">
      ${esc(message.content)}
      <span class="time">
        ${new Date(message.time).toLocaleTimeString()}
      </span>
    </div>
  `).join("");

  $("#messages").scrollTop = $("#messages").scrollHeight;
}

async function askAI(messages, system) {
  const config = read("config", {});
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);

  const defaultSystem =
    "You are Qure, a health information assistant. " +
    "Provide cautious, clear general information. " +
    "Do not diagnose, prescribe, or claim certainty. " +
    "For emergency symptoms advise immediate emergency help. " +
    "Encourage appropriate professional care.";

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "system",
            content: system || defaultSystem
          },
          ...messages.map(({ role, content }) => ({
            role,
            content
          }))
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      let detail;

      try {
        detail = await response.json();
      } catch {}

      throw Error(
        detail?.error ||
        "AI service returned " +
          response.status +
          ". Check your local server."
      );
    }

    const data = await response.json();

    const text =
      data.choices?.[0]?.message?.content ||
      data.reply ||
      data.response;

    if (typeof text !== "string" || !text.trim()) {
      throw Error("The service returned an unsupported response format.");
    }

    return text;
  } catch (error) {
    if (error.name === "AbortError") {
      throw Error("The AI service timed out. Please try again.");
    }

    if (error instanceof TypeError) {
      throw Error(
        "Could not reach the AI service. Check your local server."
      );
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/* Symptoms */

const common = [
  "Headache",
  "Fever",
  "Cough",
  "Sore throat",
  "Fatigue",
  "Nausea",
  "Chest pain",
  "Shortness of breath",
  "Dizziness",
  "Back pain",
  "Stomach pain",
  "Joint pain"
];

let symptomTab = "search";

function symptoms() {
  const history = read("symptoms");
  const week = Date.now() - 7 * 86400000;

  const statistics = [
    ["Total Searches", history.length],
    [
      "This Week",
      history.filter(item =>
        new Date(item.time).getTime() >= week
      ).length
    ],
    ["Low Risk", history.filter(item => item.risk === "low").length],
    [
      "High Priority",
      history.filter(item => item.risk === "high").length
    ]
  ];

  const tabs = [
    ["search", "Symptom Search"],
    ["history", "Search History"],
    ["emergency", "Emergency Guide"]
  ];

  app.innerHTML = nav("symptoms") + `
    <main class="container">
      <div class="heading-row">
        <div>
          <h1>Symptom Intelligence</h1>
          <p class="subtitle">
            AI-powered symptom analysis and medical guidance
          </p>
        </div>

        <button id="export-history" class="outline">
          ♧ &nbsp;Export History
        </button>
      </div>

      <div class="stats">
        ${statistics.map(([title, count]) => `
          <div class="stat">
            ${title}
            <strong>${count}</strong>
          </div>
        `).join("")}
      </div>

      <div class="tabs" role="tablist">
        ${tabs.map(([tab, title]) => `
          <button
            role="tab"
            aria-selected="${symptomTab === tab}"
            data-tab="${tab}"
            class="${symptomTab === tab ? "active" : ""}"
          >${title}</button>
        `).join("")}
      </div>

      <div id="symptom-content"></div>
    </main>
  `;

  $("#export-history").onclick = () => {
    download(
      "qure-symptom-history.json",
      JSON.stringify(history, null, 2)
    );
  };

  document.querySelectorAll("[data-tab]").forEach(button => {
    button.onclick = () => {
      symptomTab = button.dataset.tab;
      symptoms();
    };
  });

  if (symptomTab === "search") {
    $("#symptom-content").innerHTML = `
      <section class="panel symptom-panel">
        <h3>Describe Your Symptoms</h3>

        <form class="composer" id="symptom-form">
          <div class="input-wrap">
            <input
              id="symptom-input"
              placeholder="Enter your symptoms (e.g., headache, fever, cough)..."
              aria-label="Symptoms"
              required
              maxlength="4000"
            >
            <button
              type="button"
              class="mic"
              id="voice-symptom"
              aria-label="Voice input"
            >♩</button>
          </div>

          <button class="green" id="analyze">
            ⌕ &nbsp; Analyze
          </button>
        </form>

        <p class="note">Common symptoms:</p>

        <div class="chips">
          ${common.map(symptom => `
            <button data-symptom="${symptom}">
              ${symptom}
            </button>
          `).join("")}
        </div>
      </section>

      <section
        class="panel results"
        id="results"
        aria-live="polite"
      >
        <div style="font-size:55px;color:#d1d5db">⌕</div>
        <h3>Ready to Help</h3>
        <p>
          Enter your symptoms above or use voice search to get
          AI-powered analysis and recommendations.
        </p>
        <p class="note">
          Requires a connected AI service.
          This tool provides information and cannot diagnose a condition.
        </p>
      </section>
    `;

    $("#voice-symptom").onclick = () => voice("#symptom-input");

    document.querySelectorAll("[data-symptom]").forEach(button => {
      button.onclick = () => {
        const input = $("#symptom-input");
        const list = input.value
          .split(",")
          .map(value => value.trim())
          .filter(Boolean);

        if (!list.includes(button.dataset.symptom)) {
          list.push(button.dataset.symptom);
        }

        input.value = list.join(", ");
      };
    });

    $("#symptom-form").onsubmit = analyzeSymptoms;
  } else if (symptomTab === "history") {
    $("#symptom-content").innerHTML = `
      <section class="panel">
        <div class="heading-row">
          <h3>Search History</h3>
          <button class="outline" id="clear-history">
            Clear history
          </button>
        </div>

        ${history.length
          ? history.slice().reverse().map(item => `
            <article class="hospital">
              <strong>${esc(item.symptoms)}</strong>
              <p>
                ${new Date(item.time).toLocaleString()}
                · ${item.risk === "high"
                  ? "High priority"
                  : "AI information"}
              </p>
              ${formatAnswer(item.answer)}
            </article>
          `).join("")
          : "<p>No searches yet.</p>"
        }
      </section>
    `;

    $("#clear-history").onclick = () => {
      save("symptoms", []);
      symptoms();
    };
  } else {
    $("#symptom-content").innerHTML = `
      <section class="panel">
        <h3>Emergency Guide</h3>
        <p>
          If you think someone may be in immediate danger,
          contact local emergency services now.
          Do not wait for this website or an AI response.
        </p>
        <p>
          Examples include severe difficulty breathing,
          unconsciousness, severe bleeding, or sudden chest pain.
          An online tool cannot rule out an emergency.
        </p>
        <a class="green" href="tel:112">Call 112 (India)</a>
        <p class="note">
          Outside India, use your local emergency number.
        </p>
      </section>
    `;
  }
}

async function analyzeSymptoms(event) {
  event.preventDefault();

  const input = $("#symptom-input").value.trim();
  if (!input) return;

  const emergency =
    /chest pain|shortness of breath|difficulty breathing|unconscious|severe bleeding/i
      .test(input);

  if (emergency) {
    const answer =
      "These symptoms may need urgent medical attention. " +
      "If severe, sudden, or you feel in immediate danger, " +
      "contact local emergency services now. " +
      "Do not wait for an AI response.";

    const history = read("symptoms");

    history.push({
      symptoms: input,
      answer,
      risk: "high",
      time: new Date().toISOString()
    });

    save("symptoms", history);

    $("#results").innerHTML = `
      <h3>Seek urgent medical attention</h3>
      <p>${answer}</p>
      <a href="tel:112" class="green">Call 112 (India)</a>
    `;

    return;
  }

  $("#analyze").disabled = true;
  $("#results").textContent = "Analyzing symptoms…";

  try {
    const answer = await askAI(
      [{ role: "user", content: input }],
      "Provide cautious general information about the described " +
      "symptoms, potential explanations without diagnosis or " +
      "probability estimates, reasonable next steps, and when to " +
      "seek urgent care. Do not prescribe. Clearly state that a " +
      "clinician must assess the person."
    );

    const history = read("symptoms");

    history.push({
      symptoms: input,
      answer,
      risk: "unclassified",
      time: new Date().toISOString()
    });

    save("symptoms", history);

    if ($("#results")) {
      $("#results").innerHTML = `
        <h3>Symptom Information</h3>
        ${formatAnswer(answer)}
      `;
    }
  } catch (error) {
    if ($("#results")) {
      $("#results").textContent = error.message;
    }
  } finally {
    if ($("#analyze")) {
      $("#analyze").disabled = false;
    }
  }
}

/* Gemini connection status */

function api() {
  app.innerHTML = nav("api-portal") + `
    <main class="container setting">
      <h1>AI Connection</h1>

      <section class="panel">
        <h3>Gemini free-tier setup</h3>
        <p>
          Paste your Gemini API key into the local .env file after
          GEMINI_API_KEY= and save. The server reloads it automatically.
          Your key is never sent to the browser.
        </p>

        <p id="connection-status" role="status">
          Checking local server…
        </p>

        <button class="green" id="test-connection">
          Test Connection
        </button>

        <p class="note">
          Keep your Google AI Studio project on Free Tier with billing
          disabled. Quota limits may stop responses; the app never
          switches to another model. The app cannot verify your Google
          billing settings. Free-tier prompts may be used to improve
          Google products, so use fictional examples.
        </p>
      </section>
    </main>
  `;

  fetch("/api/status")
    .then(response => response.json())
    .then(status => {
      if ($("#connection-status")) {
        $("#connection-status").textContent = status.configured
          ? "Key configured. Ready to test."
          : "Waiting for your key in the local .env file.";
      }
    })
    .catch(() => {
      if ($("#connection-status")) {
        $("#connection-status").textContent =
          "Open this website through Start-Qure.cmd, " +
          "rather than opening index.html directly.";
      }
    });

  $("#test-connection").onclick = async () => {
    $("#test-connection").disabled = true;
    $("#connection-status").textContent = "Testing…";

    try {
      await askAI([
        { role: "user", content: "Reply only with OK." }
      ]);

      if ($("#connection-status")) {
        $("#connection-status").textContent =
          "Connected successfully.";
      }
    } catch (error) {
      if ($("#connection-status")) {
        $("#connection-status").textContent = error.message;
      }
    } finally {
      if ($("#test-connection")) {
        $("#test-connection").disabled = false;
      }
    }
  };
}

/* API information page */

function apiPortal() {
  app.innerHTML = nav("api-portal") + `
    <main class="container">
      <div
        style="text-align:center;max-width:1000px;margin:55px auto 65px"
      >
        <h1>Powered by Google Gemini</h1>
        <p class="subtitle">
          Qure uses Gemini APIs to power the AI Health Assistant and
          Symptom Intelligence, alongside OpenStreetMap for nearby
          hospital discovery.
        </p>
      </div>

      <div class="cards">
        <article class="card">
          ${icon("chat")}
          <h3>AI Health Assistant</h3>
          <p>
            Google Gemini provides conversational health information
            and answers questions using the context of your chat.
          </p>
        </article>

        <article class="card">
          ${icon("search")}
          <h3>Symptom Intelligence</h3>
          <p>
            Gemini turns symptom descriptions into readable general
            information, possible explanations, and guidance on
            seeking care.
          </p>
        </article>

        <article class="card">
          ${icon("pin")}
          <h3>MediMap</h3>
          <p>
            Leaflet, OpenStreetMap, and Overpass locate mapped
            hospitals near your chosen location.
            Directions open in Google Maps.
          </p>
        </article>
      </div>

      <section class="panel" style="margin:40px 0;padding:40px">
        <h2 style="font-size:32px">About our integration</h2>
        <p>
          Model: <strong>Gemini 3.1 Flash-Lite</strong>.
          AI requests pass through the local Qure server;
          the API key stays on the server.
          Chat and symptom history are stored in your browser.
        </p>
        <p>
          Gemini has a free tier with usage limits.
          Keep billing disabled in your Google project to avoid
          paid usage. Qure does not use a paid model fallback and
          cannot verify your billing tier.
        </p>
        <p>
          When you ask for an AI response, your submitted conversation
          is sent to Google. Free-tier content may be used to improve
          Google products. Use fictional examples for this demo.
          Qure provides general information and cannot diagnose or
          replace professional care.
        </p>

        <a class="green" href="#/settings">
          Check AI Connection
        </a>

        <a
          class="outline"
          href="https://ai.google.dev/gemini-api/docs"
          target="_blank"
          rel="noopener"
        >Gemini Documentation ↗</a>
      </section>
    </main>
  `;
}

/* Navigation */

function route() {
  const hash = location.hash;

  if (["#tools", "#info", "#about"].includes(hash)) {
    if (!$(".hero")) home();

    requestAnimationFrame(() => {
      $(hash)?.scrollIntoView();
    });

    return;
  }

  clearTimeout(mapTimer);
  searchController?.abort();

  if (map) {
    map.remove();
    map = null;
  }

  const page = hash.replace("#/", "") || "home";

  const pages = {
    home,
    medimap,
    chatbot,
    symptoms,
    api,
    settings: api,
    "api-portal": apiPortal
  };

  (pages[page] || home)();
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", route);
route();
