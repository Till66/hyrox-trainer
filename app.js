/* ==========================================================================
   HYROX Trainer — app logic (vanilla JS, no build step, localStorage only)
   ========================================================================== */

const LS_PROFILES = "hyrox.profiles";
const LS_CURRENT = "hyrox.currentUserId";
const sessionsKey = (userId) => `hyrox.sessions.${userId}`;
const draftKey = (userId) => `hyrox.draft.${userId}`;

const FITNESS_LEVELS = ["Anfänger", "Fortgeschritten", "Profi"];
const DIVISIONS = ["Frauen", "Männer"];

let state = {
    view: null, // 'login' | 'onboarding' | 'main'
    draft: null,
    chart: null
};
/* ---------------------------- storage helpers ---------------------------- */

function loadProfiles() {
    try { return JSON.parse(localStorage.getItem(LS_PROFILES)) || []; }
    catch (e) { return []; }
}
function saveProfiles(list) { localStorage.setItem(LS_PROFILES, JSON.stringify(list)); }
function getProfile(id) { return loadProfiles().find(p => p.id === id) || null; }

function getCurrentUserId() { return localStorage.getItem(LS_CURRENT); }
function setCurrentUserId(id) {
    if (id) localStorage.setItem(LS_CURRENT, id);
    else localStorage.removeItem(LS_CURRENT);
}

function loadSessions(userId) {
    try { return JSON.parse(localStorage.getItem(sessionsKey(userId))) || []; }
    catch (e) { return []; }
}
function saveSessions(userId, list) { localStorage.setItem(sessionsKey(userId), JSON.stringify(list)); }

function loadDraft(userId) {
    try {
          const raw = JSON.parse(localStorage.getItem(draftKey(userId)));
          if (raw) return raw;
    } catch (e) { /* ignore */ }
    return emptyDraft();
}
function saveDraft(userId, draft) { localStorage.setItem(draftKey(userId), JSON.stringify(draft)); }
function clearDraft(userId) { localStorage.removeItem(draftKey(userId)); }

function emptyDraft() {
    const draft = { runs: {}, stations: {} };
    for (let i = 1; i <= 8; i++) draft.runs[`run${i}`] = { time: null };
    STATIONS.forEach(st => {
          draft.stations[st.id] = st.inputType === "levelTime"
            ? { level: null, time: null }
                  : { weight: null, time: null };
    });
    return draft;
}

/* ---------------------------- time helpers ---------------------------- */

function parseTimeToSeconds(str) {
    if (str === null || str === undefined) return null;
    str = String(str).trim();
    if (str === "") return null;
    const parts = str.split(":").map(p => p.trim());
    if (parts.some(p => p === "" || isNaN(Number(p)))) return null;
    let h = 0, m = 0, s = 0;
    if (parts.length === 1) s = Number(parts[0]);
    else if (parts.length === 2) { m = Number(parts[0]); s = Number(parts[1]); }
    else if (parts.length === 3) { h = Number(parts[0]); m = Number(parts[1]); s = Number(parts[2]); }
    else return null;
    const total = h * 3600 + m * 60 + s;
    return isNaN(total) || total < 0 ? null : total;
}

function formatSecondsToClock(totalSeconds) {
    if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) return "–";
    totalSeconds = Math.round(totalSeconds);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
    const ss = String(s).padStart(2, "0");
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function formatDate(iso) {
    const d = new Date(iso);
    const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return { day: `${dd}.${mm}.${d.getFullYear()}`, weekday: weekdays[d.getDay()] };
}

function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

/* ---------------------------- rendering ---------------------------- */

const app = document.getElementById("app");

function render() {
    const currentId = getCurrentUserId();
    if (currentId && getProfile(currentId)) {
          if (state.view !== "main" || !state.draft) {
                  state.draft = loadDraft(currentId);
          }
          state.view = "main";
          renderMain(getProfile(currentId));
          return;
    }
    if (!state.view || state.view === "main") {
          state.view = loadProfiles().length ? "login" : "onboarding";
    }
    if (state.view === "onboarding") renderOnboarding();
    else renderLogin();
}

function renderLogin() {
    const profiles = loadProfiles();
    app.innerHTML = `
        <div class="centered-screen">
              <div class="hero">
                      <div class="mark-lg">H</div>
                              <h1>HYROX Trainer</h1>
                                      <p>Wer trainiert heute?</p>
                                            </div>
                                                  <div class="profile-list">
                                                          ${profiles.map(p => `
                                                                    <button class="profile-btn" data-action="pick-profile" data-id="${p.id}">
                                                                                <span class="name-block">
                                                                                              <span class="avatar">${escapeHtml(p.username.slice(0, 1).toUpperCase())}</span>
                                                                                                            <span>
                                                                                                                            <div>${escapeHtml(p.username)}</div>
                                                                                                                                            <div class="meta">${p.level || ""}${p.division ? " · " + p.division : ""}</div>
                                                                                                                                                          </span>
                                                                                                                                                                      </span>
                                                                                                                                                                                  <button class="delete-x" data-action="delete-profile" data-id="${p.id}" title="Profil löschen">✕</button>
                                                                                                                                                                                            </button>
                                                                                                                                                                                                    `).join("")}
                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                <button class="btn-primary" data-action="new-profile">+ Neues Profil erstellen</button>
                                                                                                                                                                                                                      <p class="footer-note">Alle Daten werden nur lokal auf diesem Gerät gespeichert.</p>
                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                            `;
}

function renderOnboarding() {
    app.innerHTML = `
        <div class="centered-screen">
              <div class="hero">
                      <div class="mark-lg">H</div>
                              <h1>Neues Profil</h1>
                                      <p>Ein paar Angaben, damit dein Training zu dir passt.</p>
                                            </div>
                                                  <div class="card">
                                                          <form id="onboarding-form">
                                                                    <div class="form-field">
                                                                                <label for="f-username">Benutzername</label>
                                                                                            <input id="f-username" name="username" type="text" placeholder="z. B. Till" required maxlength="24">
                                                                                                      </div>
                                                                                                                <div class="form-row">
                                                                                                                            <div class="form-field">
                                                                                                                                          <label for="f-weight">Gewicht (kg)</label>
                                                                                                                                                        <input id="f-weight" name="weight" type="number" min="30" max="250" step="0.5" placeholder="80">
                                                                                                                                                                    </div>
                                                                                                                                                                                <div class="form-field">
                                                                                                                                                                                              <label for="f-height">Größe (cm)</label>
                                                                                                                                                                                                            <input id="f-height" name="height" type="number" min="100" max="230" step="1" placeholder="180">
                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                            <div class="form-row">
                                                                                                                                                                                                                                                        <div class="form-field">
                                                                                                                                                                                                                                                                      <label for="f-level">Sportlichkeit</label>
                                                                                                                                                                                                                                                                                    <select id="f-level" name="level">
                                                                                                                                                                                                                                                                                                    ${FITNESS_LEVELS.map(l => `<option value="${l}">${l}</option>`).join("")}
                                                                                                                                                                                                                                                                                                                  </select>
                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                                          <div class="form-field">
                                                                                                                                                                                                                                                                                                                                                        <label for="f-division">Division</label>
                                                                                                                                                                                                                                                                                                                                                                      <select id="f-division" name="division">
                                                                                                                                                                                                                                                                                                                                                                                      ${DIVISIONS.map(d => `<option value="${d}">${d}</option>`).join("")}
                                                                                                                                                                                                                                                                                                                                                                                                    </select>
                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                    <button type="submit" class="btn-primary">Los geht's</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                              ${loadProfiles().length ? `<div style="height:10px"></div><button type="button" class="btn-secondary" data-action="back-to-login">Zurück</button>` : ""}
                                                                                                                                                                                                                                                                                                                                                                                                                                                      </form>
                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                  `;
    document.getElementById("onboarding-form").addEventListener("submit", (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const username = String(fd.get("username") || "").trim();
          if (!username) return;
          const profile = {
                  id: uid(),
                  username,
                  weight: fd.get("weight") ? Number(fd.get("weight")) : null,
                  height: fd.get("height") ? Number(fd.get("height")) : null,
                  level: fd.get("level"),
                  division: fd.get("division"),
                  createdAt: new Date().toISOString()
          };
          const profiles = loadProfiles();
          profiles.push(profile);
          saveProfiles(profiles);
          setCurrentUserId(profile.id);
          state.view = "main";
          state.draft = emptyDraft();
          render();
    });
}

function renderMain(profile) {
    const path = buildPath();
    const sessions = loadSessions(profile.id).slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  app.innerHTML = `
      <div class="topbar">
            <div class="brand">
                    <div class="mark">H</div>
                            <div>
                                      <h1>HYROX Trainer</h1>
                                                <div class="sub">Trainingstracker</div>
                                                        </div>
                                                              </div>
                                                                    <div class="user-pill">
                                                                            <span>${escapeHtml(profile.username)}</span>
                                                                                    <button class="switch-btn" data-action="switch-profile">Wechseln</button>
                                                                                          </div>
                                                                                              </div>

                                                                                                  <div class="section">
                                                                                                        <div class="section-head">
                                                                                                                <h2>Dein Pfad</h2>
                                                                                                                        <span class="section-sub">8 Läufe · 8 Stationen</span>
                                                                                                                              </div>
                                                                                                                                    <div class="path">
                                                                                                                                            ${path.map(item => renderPathNode(item)).join("")}
                                                                                                                                                  </div>
                                                                                                                                                      </div>
                                                                                                                                                      
                                                                                                                                                          <div class="section">
                                                                                                                                                                <div class="section-head">
                                                                                                                                                                        <h2>Zusammenfassung</h2>
                                                                                                                                                                              </div>
                                                                                                                                                                                    <div class="card">
                                                                                                                                                                                            <div class="summary-list" id="summary-list"></div>
                                                                                                                                                                                                    <div class="summary-total">
                                                                                                                                                                                                              <span class="label">Gesamtzeit</span>
                                                                                                                                                                                                                        <span class="value" id="summary-total-value">–</span>
                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                              <div class="save-bar">
                                                                                                                                                                                                                                                    <button class="btn-primary" data-action="save-session">Training speichern</button>
                                                                                                                                                                                                                                                          <div class="save-msg" id="save-msg"></div>
                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                              
                                                                                                                                                                                                                                                                  <div class="section">
                                                                                                                                                                                                                                                                        <div class="section-head">
                                                                                                                                                                                                                                                                                <h2>Fortschritt</h2>
                                                                                                                                                                                                                                                                                        <span class="section-sub">Gesamtzeit je Training</span>
                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                    <div class="viz-root" data-palette="#e34948">
                                                                                                                                                                                                                                                                                                            ${sessions.length >= 1
                                                                                                                                                                                                                                                                                                                        ? `<canvas id="progressChart"></canvas>`
                                                                                                                                                                                                                                                                                                                        : `<div class="chart-empty">Noch keine gespeicherten Trainings – speichere dein erstes Training, um deinen Fortschritt zu sehen.</div>`}
                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                                                                                                      <div class="section">
                                                                                                                                                                                                                                                                                                                                            <div class="section-head">
                                                                                                                                                                                                                                                                                                                                                    <h2>Trainings-Historie</h2>
                                                                                                                                                                                                                                                                                                                                                            <span class="section-sub">${sessions.length} gespeichert</span>
                                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                                        <div class="history-list">
                                                                                                                                                                                                                                                                                                                                                                                ${sessions.length ? sessions.map(s => renderHistoryRow(s)).join("") : `<div class="history-empty">Noch keine Trainings gespeichert.</div>`}
                                                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                                                                                                                                                              <p class="footer-note">Deine Daten liegen nur lokal in diesem Browser auf diesem Gerät. Für ein anderes Handy einfach ein eigenes Profil anlegen.</p>
                                                                                                                                                                                                                                                                                                                                                                                                `;

  populatePathInputs(path);
    updateSummary(path);
    if (sessions.length >= 1) renderChart(sessions);
}

function renderPathNode(item) {
    if (item.kind === "run") {
          return `
                <div class="node run" data-run-id="${item.id}">
                        <div class="dot">🏃</div>
                                <div class="run-label"><b>Lauf ${item.index}</b>${item.label}</div>
                                        <input class="time-input" type="text" inputmode="numeric" placeholder="mm:ss"
                                                       data-field="run-time" data-run-id="${item.id}">
                                                             </div>
                                                                 `;
    }
    const st = item;
    const inputsHtml = st.inputType === "levelTime"
      ? `
            <div class="form-field">
                    <label>Stufe (1–10)</label>
                            <div class="level-row" data-field="level-row" data-station-id="${st.id}">
                                      ${Array.from({ length: 10 }, (_, i) => i + 1).map(n => `
                                                  <button type="button" class="level-btn" data-action="set-level" data-station-id="${st.id}" data-level="${n}">${n}</button>
                                                            `).join("")}
                                                                    </div>
                                                                          </div>
                                                                                <div class="form-field" style="max-width:110px">
                                                                                        <label>Zeit</label>
                                                                                                <input type="text" inputmode="numeric" placeholder="mm:ss" data-field="station-time" data-station-id="${st.id}">
                                                                                                      </div>
                                                                                                          `
          : `
                <div class="form-field">
                        <label>Gewicht (kg)${st.weightOptional ? " · optional" : ""}</label>
                                <input type="number" min="0" step="0.5" placeholder="0" data-field="station-weight" data-station-id="${st.id}">
                                      </div>
                                            <div class="form-field">
                                                    <label>Zeit</label>
                                                            <input type="text" inputmode="numeric" placeholder="mm:ss" data-field="station-time" data-station-id="${st.id}">
                                                                  </div>
                                                                      `;

  return `
      <div class="node station" data-station-id="${st.id}">
            <div class="dot">${st.icon}</div>
                  <div class="station-card">
                          <div class="station-title-row">
                                    <h3>${escapeHtml(st.name)}</h3>
                                              <span class="distance">${escapeHtml(st.distanceLabel)}</span>
                                                      </div>
                                                              <div class="hint">${escapeHtml(st.hint)}</div>
                                                                      <div class="station-inputs">
                                                                                ${inputsHtml}
                                                                                        </div>
                                                                                              </div>
                                                                                                  </div>
                                                                                                    `;
}

function renderHistoryRow(session) {
    const { day, weekday } = formatDate(session.date);
    return `
        <div class="history-row">
              <div class="date"><span class="weekday">${weekday}</span>${day}</div>
                    <div style="display:flex;align-items:center;">
                            <div class="duration">${formatSecondsToClock(session.totalSeconds)}</div>
                                    <button class="del-btn" data-action="delete-session" data-session-id="${session.id}" title="Löschen">🗑</button>
                                          </div>
                                              </div>
                                                `;
}

/* ---------------------------- populate + sync draft ---------------------------- */

function populatePathInputs(path) {
    const draft = state.draft;
    path.forEach(item => {
          if (item.kind === "run") {
                  const el = app.querySelector(`input[data-field="run-time"][data-run-id="${item.id}"]`);
                  const val = draft.runs[item.id] && draft.runs[item.id].time;
                  if (el && val) el.value = formatSecondsToClock(val);
                  if (val) el.closest(".node").classList.add("filled");
          } else {
                  const sd = draft.stations[item.id];
                  const node = app.querySelector(`.node.station[data-station-id="${item.id}"]`);
                  if (item.inputType === "levelTime") {
                            if (sd.level) {
                                        const btn = app.querySelector(`.level-btn[data-station-id="${item.id}"][data-level="${sd.level}"]`);
                                        if (btn) btn.classList.add("active");
                            }
                  } else {
                            const wEl = app.querySelector(`input[data-field="station-weight"][data-station-id="${item.id}"]`);
                            if (wEl && sd.weight !== null && sd.weight !== undefined) wEl.value = sd.weight;
                  }
                  const tEl = app.querySelector(`input[data-field="station-time"][data-station-id="${item.id}"]`);
                  if (tEl && sd.time) tEl.value = formatSecondsToClock(sd.time);
                  if (node && (sd.time || sd.level || sd.weight)) node.classList.add("filled");
          }
    });
}

function updateSummary(path) {
    const draft = state.draft;
    const listEl = document.getElementById("summary-list");
    const totalEl = document.getElementById("summary-total-value");
    if (!listEl) return;
    let total = 0;
    const rows = path.map(item => {
          let label, seconds;
          if (item.kind === "run") {
                  label = `Lauf ${item.index} (1 km)`;
                  seconds = draft.runs[item.id] && draft.runs[item.id].time;
          } else {
                  label = item.name;
                  seconds = draft.stations[item.id] && draft.stations[item.id].time;
          }
          if (seconds) total += seconds;
          return `<div class="summary-row ${seconds ? "" : "empty"}"><span class="label">${escapeHtml(label)}</span><span class="value">${formatSecondsToClock(seconds)}</span></div>`;
    });
    listEl.innerHTML = rows.join("");
    totalEl.textContent = total > 0 ? formatSecondsToClock(total) : "–";
    return total;
}

function computeTotal(path) {
    const draft = state.draft;
    let total = 0;
    path.forEach(item => {
          const seconds = item.kind === "run"
            ? draft.runs[item.id] && draft.runs[item.id].time
                  : draft.stations[item.id] && draft.stations[item.id].time;
          if (seconds) total += seconds;
    });
    return total;
}

/* ---------------------------- chart ---------------------------- */

function renderChart(sessions) {
    const canvas = document.getElementById("progressChart");
    if (!canvas) return;
    const ordered = sessions.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = ordered.map(s => formatDate(s.date).day.slice(0, 5));
    const data = ordered.map(s => s.totalSeconds);

  if (state.chart) { state.chart.destroy(); state.chart = null; }

  state.chart = new Chart(canvas.getContext("2d"), {
        type: "line",
        data: {
                labels,
                datasets: [{
                          label: "Gesamtzeit",
                          data,
                          borderColor: "#e34948",
                          backgroundColor: "rgba(227,73,72,0.15)",
                          pointBackgroundColor: "#e34948",
                          pointBorderColor: "#1a1a19",
                          pointBorderWidth: 2,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                          borderWidth: 2,
                          tension: 0.25,
                          fill: true
                }]
        },
        options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                          legend: { display: false },
                          tooltip: {
                                      backgroundColor: "#222220",
                                      titleColor: "#ffffff",
                                      bodyColor: "#c3c2b7",
                                      borderColor: "rgba(255,255,255,0.10)",
                                      borderWidth: 1,
                                      callbacks: { label: (ctx) => "Gesamtzeit: " + formatSecondsToClock(ctx.parsed.y) }
                          }
                },
                scales: {
                          y: {
                                      ticks: { color: "#898781", callback: (v) => formatSecondsToClock(v) },
                                      grid: { color: "#2c2c2a" },
                                      border: { display: false }
                          },
                          x: {
                                      ticks: { color: "#898781" },
                                      grid: { display: false },
                                      border: { display: false }
                          }
                }
        }
  });
}

/* ---------------------------- misc ---------------------------- */

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------------------------- event delegation ---------------------------- */

app.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;

                       if (action === "pick-profile") {
                             setCurrentUserId(btn.dataset.id);
                             state.view = "main";
                             state.draft = loadDraft(btn.dataset.id);
                             render();
                       } else if (action === "delete-profile") {
                             e.stopPropagation();
                             if (!confirm("Dieses Profil und alle zugehörigen Trainings wirklich löschen?")) return;
                             const id = btn.dataset.id;
                             saveProfiles(loadProfiles().filter(p => p.id !== id));
                             localStorage.removeItem(sessionsKey(id));
                             localStorage.removeItem(draftKey(id));
                             if (getCurrentUserId() === id) setCurrentUserId(null);
                             render();
                       } else if (action === "new-profile") {
                             state.view = "onboarding";
                             render();
                       } else if (action === "back-to-login") {
                             state.view = "login";
                             render();
                       } else if (action === "switch-profile") {
                             setCurrentUserId(null);
                             state.view = loadProfiles().length ? "login" : "onboarding";
                             render();
                       } else if (action === "set-level") {
                             const stationId = btn.dataset.stationId;
                             const level = Number(btn.dataset.level);
                             const userId = getCurrentUserId();
                             state.draft.stations[stationId].level = level;
                             saveDraft(userId, state.draft);
                             app.querySelectorAll(`.level-btn[data-station-id="${stationId}"]`).forEach(b => {
                                     b.classList.toggle("active", Number(b.dataset.level) === level);
                             });
                             btn.closest(".node.station").classList.add("filled");
                       } else if (action === "save-session") {
                             saveCurrentSession();
                       } else if (action === "delete-session") {
                             const userId = getCurrentUserId();
                             const sessionId = btn.dataset.sessionId;
                             if (!confirm("Dieses Training löschen?")) return;
                             saveSessions(userId, loadSessions(userId).filter(s => s.id !== sessionId));
                             render();
                       }
});

app.addEventListener("input", (e) => {
    const field = e.target.dataset.field;
    if (!field) return;
    const userId = getCurrentUserId();
    if (!userId) return;

                       if (field === "run-time") {
                             const id = e.target.dataset.runId;
                             const seconds = parseTimeToSeconds(e.target.value);
                             state.draft.runs[id].time = seconds;
                             e.target.closest(".node").classList.toggle("filled", !!seconds);
                       } else if (field === "station-time") {
                             const id = e.target.dataset.stationId;
                             const seconds = parseTimeToSeconds(e.target.value);
                             state.draft.stations[id].time = seconds;
                             e.target.closest(".node").classList.toggle("filled", !!seconds || !!state.draft.stations[id].level || !!state.draft.stations[id].weight);
                       } else if (field === "station-weight") {
                             const id = e.target.dataset.stationId;
                             const val = e.target.value === "" ? null : Number(e.target.value);
                             state.draft.stations[id].weight = val;
                             e.target.closest(".node").classList.toggle("filled", !!val || !!state.draft.stations[id].time);
                       }
    saveDraft(userId, state.draft);
    updateSummary(buildPath());
});

app.addEventListener("blur", (e) => {
    // reformat time fields to mm:ss on blur for readability
                       if (e.target && e.target.dataset && (e.target.dataset.field === "run-time" || e.target.dataset.field === "station-time")) {
                             const seconds = parseTimeToSeconds(e.target.value);
                             e.target.value = seconds ? formatSecondsToClock(seconds) : "";
                       }
}, true);

function saveCurrentSession() {
    const userId = getCurrentUserId();
    if (!userId) return;
    const path = buildPath();
    const total = computeTotal(path);
    const msgEl = document.getElementById("save-msg");
    if (total <= 0) {
          if (msgEl) { msgEl.style.color = "#e34948"; msgEl.textContent = "Bitte trage mindestens eine Zeit ein, bevor du speicherst."; }
          return;
    }
    const session = {
          id: uid(),
          date: new Date().toISOString(),
          totalSeconds: total,
          runs: JSON.parse(JSON.stringify(state.draft.runs)),
          stations: JSON.parse(JSON.stringify(state.draft.stations))
    };
    const sessions = loadSessions(userId);
    sessions.push(session);
    saveSessions(userId, sessions);
    clearDraft(userId);
    state.draft = emptyDraft();
    render();
    const freshMsg = document.getElementById("save-msg");
    if (freshMsg) { freshMsg.style.color = "#0ca30c"; freshMsg.textContent = "Training gespeichert ✓"; }
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------------------------- init ---------------------------- */

document.addEventListener("DOMContentLoaded", render);
