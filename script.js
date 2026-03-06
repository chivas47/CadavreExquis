let players   = [];
let lines     = [];
let turnIndex = 0;
let prompt    = "";
let lineLimit = 99;
const ICONS   = ["📜","🕯️","✒️","🌙","🍷","📖","🌿","💜","🔮","🎭"];
let iconIdx   = 0;

function show(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function esc(s) { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

function addPlayer() {
  const inp = document.getElementById("name-input");
  const name = inp.value.trim();
  if (!name) return;
  if (players.find(p => p.name.toLowerCase()===name.toLowerCase())) { inp.value=""; return; }
  players.push({name}); inp.value=""; inp.focus(); renderChips();
}
function removePlayer(i) { players.splice(i,1); renderChips(); }
function renderChips() {
  document.getElementById("chips").innerHTML = players.map((p,i) =>
    `<div class="chip">${esc(p.name)}<button class="chip-x" onclick="removePlayer(${i})">×</button></div>`
  ).join("");
}

function startGame() {
  const err = document.getElementById("players-error");
  if (players.length < 2) { err.style.display="block"; return; }
  err.style.display = "none";
  prompt    = document.getElementById("prompt-input").value.trim();
  players   = shuffle(players); lines=[]; turnIndex=0; iconIdx=0;
  showHandoff(0);
}

function showHandoff(idx) {
  document.getElementById("handoff-name").textContent = players[idx].name;
  document.getElementById("handoff-icon").textContent = ICONS[iconIdx++ % ICONS.length];
  const total = lineLimit===99 ? null : players.length*lineLimit;
  document.getElementById("handoff-line-info").textContent =
    lines.length===0 ? "First line — set the scene"
                     : `Line ${lines.length+1}${total?" of "+total:""}`;
  show("page-handoff");
}
function handoffReady() { setupWriting(turnIndex); show("page-writing"); }

function setupWriting(idx) {
  document.getElementById("writing-title").textContent = players[idx].name + "\u2019s turn";
  const pos = idx % players.length;
  document.getElementById("progress-row").innerHTML = players.map((_,i) =>
    `<div class="pip ${i<pos?"done":i===pos?"current":""}"></div>`
  ).join("");
  const isFirst = lines.length===0;
  document.getElementById("last-line-wrap").style.display = isFirst ? "none" : "block";
  document.getElementById("first-hint").style.display     = isFirst ? "block" : "none";
  if (!isFirst) {
    document.getElementById("last-line-text").textContent = lines[lines.length-1].text;
  } else {
    document.getElementById("first-hint-text").textContent = prompt
      ? `Theme: \u201c${prompt}\u201d \u2014 you\u2019re writing the opening line.`
      : "You\u2019re writing the opening line. Set the scene\u2026";
  }
  document.getElementById("line-input").value = "";
  document.getElementById("char-count").textContent = "0 / 350";
  document.getElementById("char-count").className = "char-count";
  document.getElementById("line-error").style.display = "none";
  setTimeout(() => document.getElementById("line-input").focus(), 80);
}

function onLineInput() {
  const n = document.getElementById("line-input").value.length;
  const cc = document.getElementById("char-count");
  cc.textContent = `${n} / 350`;
  cc.className = "char-count"+(n>320?" warn":"");
}

function submitLine() {
  const text = document.getElementById("line-input").value.trim();
  const err  = document.getElementById("line-error");
  if (!text || text.length<3) { err.style.display="block"; return; }
  err.style.display = "none";
  lines.push({author:players[turnIndex].name, text});
  turnIndex = (turnIndex+1) % players.length;
  showHandoff(turnIndex);
}

function hostReveal() {
  if (lines.length===0) { alert("No lines written yet!"); return; }
  if (confirm("End the story here and reveal everything?")) doReveal();
}

function doReveal() {
  const card = document.getElementById("story-card");
  card.innerHTML = "";
  document.getElementById("reveal-sub").textContent =
    `${lines.length} line${lines.length>1?"s":""} \u00b7 ${players.length} voice${players.length>1?"s":""}`;
  if (prompt) {
    const th = document.createElement("div");
    th.style.cssText = "font-family:Montserrat,sans-serif;font-size:0.6rem;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:rgba(252,191,0,0.55);margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid rgba(255,255,255,0.08);";
    th.textContent = "Theme: "+prompt; card.appendChild(th);
  }
  lines.forEach((line,i) => {
    const div = document.createElement("div");
    div.className = "story-entry";
    div.style.animationDelay = `${i*0.28}s`;
    div.innerHTML = `<div class="story-line">${esc(line.text)}</div><div class="story-by">\u2014 ${esc(line.author)}</div>`;
    card.appendChild(div);
  });
  show("page-reveal");
}

function copyStory() {
  let text = prompt ? `Theme: ${prompt}\n\n` : "";
  text += lines.map(l => `${l.text}\n\u2014 ${l.author}`).join("\n\n");
  text += "\n\n\u2014 A Polynight Cadavre Exquis | @openhublisboa";
  navigator.clipboard.writeText(text).then(() => {
    const b = document.getElementById("copy-btn");
    b.textContent = "Copied \u2756"; setTimeout(() => b.textContent="Copy the story", 2200);
  });
}

function playAgain() {
  players=[]; lines=[]; turnIndex=0; prompt="";
  document.getElementById("chips").innerHTML="";
  document.getElementById("prompt-input").value="";
  document.getElementById("name-input").value="";
  show("page-setup");
}