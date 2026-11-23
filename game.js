let key = "", activeCat = "ALL", isFakeMode = false, timer;

const thBtn = document.getElementById("themeBtn");
thBtn.onclick = () => {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  document.documentElement.setAttribute("data-theme", isLight ? "dark" : "light");
  thBtn.textContent = isLight ? "☀️" : "🌙";
};

function enc(txt, p) {
  let s = encodeURIComponent(txt), r = "";
  for (let i = 0; i < s.length; i++) r += String.fromCharCode(s.charCodeAt(i) ^ p.charCodeAt(i % p.length));
  return btoa(r);
}

function dec(c, p) {
  try {
    let s = atob(c), r = "";
    for (let i = 0; i < s.length; i++) r += String.fromCharCode(s.charCodeAt(i) ^ p.charCodeAt(i % p.length));
    return decodeURIComponent(r);
  } catch (e) { return null; }
}

if (localStorage.getItem("zn_chk")) {
  document.getElementById("lockTitle").textContent = "ZirhNote Qulflangan";
}

document.getElementById("unlockBtn").onclick = () => {
  const p = document.getElementById("masterPass").value.trim();
  const err = document.getElementById("err");
  if (p.length < 4) { err.textContent = "Kamida 4 ta belgi yozing!"; return; }

  const chk = localStorage.getItem("zn_chk");
  const fakeChk = localStorage.getItem("zn_fake_chk");

  if (!chk) {
    localStorage.setItem("zn_chk", enc("OK2026", p));
    key = p; isFakeMode = false; openApp();
  } else if (dec(chk, p) === "OK2026") {
    key = p; isFakeMode = false; openApp();
  } else if (fakeChk && dec(fakeChk, p) === "FAKE2026") {
    key = p; isFakeMode = true; openApp();
  } else {
    err.textContent = "Parol noto'g'ri!";
  }
};

function openApp() {
  document.getElementById("masterPass").value = "";
  document.getElementById("err").textContent = "";
  document.getElementById("lockScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "flex";
  document.getElementById("lockBtn").style.display = "inline-block";
  document.getElementById("secBtn").style.display = isFakeMode ? "none" : "inline-block";
  document.getElementById("secPanel").style.display = "none";
  showNotes();
  resetTimer();
}

function lockNow() {
  key = ""; isFakeMode = false;
  document.getElementById("appScreen").style.display = "none";
  document.getElementById("lockBtn").style.display = "none";
  document.getElementById("secBtn").style.display = "none";
  document.getElementById("lockScreen").style.display = "flex";
  document.getElementById("lockTitle").textContent = "ZirhNote Qulflangan";
}

document.getElementById("lockBtn").onclick = lockNow;

document.getElementById("secBtn").onclick = () => {
  const sp = document.getElementById("secPanel");
  sp.style.display = sp.style.display === "none" ? "flex" : "none";
};

document.getElementById("saveFakeBtn").onclick = () => {
  const fp = document.getElementById("fakePassInput").value.trim();
  if (fp.length < 4) return alert("Soxta parol kamida 4 ta belgi bo'lsin!");
  localStorage.setItem("zn_fake_chk", enc("FAKE2026", fp));
  document.getElementById("fakePassInput").value = "";
  document.getElementById("secPanel").style.display = "none";
  alert("Soxta parol o'rnatildi! Endi shu parol bilan kirsangiz alohida soxta sahifa ochiladi.");
};

function getStorageKey() { return isFakeMode ? "zn_fake_data" : "zn_data"; }

document.getElementById("saveBtn").onclick = () => {
  const c = document.getElementById("nCat").value;
  const t = document.getElementById("nTitle").value.trim();
  const b = document.getElementById("nBody").value.trim();
  if (!b) return;
  const arr = JSON.parse(localStorage.getItem(getStorageKey()) || "[]");
  arr.unshift({ id: Date.now(), c: c, t: enc(t || "Sarlavhasiz", key), b: enc(b, key), d: new Date().toLocaleDateString("uz-UZ") });
  localStorage.setItem(getStorageKey(), JSON.stringify(arr));
  document.getElementById("nTitle").value = "";
  document.getElementById("nBody").value = "";
  showNotes();
};

document.getElementById("searchInput").oninput = showNotes;

document.querySelectorAll(".tab").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    activeCat = btn.getAttribute("data-cat");
    showNotes();
  };
});

function showNotes() {
  const arr = JSON.parse(localStorage.getItem(getStorageKey()) || "[]");
  const q = document.getElementById("searchInput").value.toLowerCase();
  const list = document.getElementById("list");
  list.innerHTML = "";
  let count = 0;

  arr.forEach(x => {
    const dt = dec(x.t, key), db = dec(x.b, key);
    const cat = x.c || "📔 Kundalik";
    if (dt !== null && db !== null) {
      if ((activeCat === "ALL" || cat === activeCat) && (dt.toLowerCase().includes(q) || db.toLowerCase().includes(q))) {
        count++;
        const d = document.createElement("div");
        d.className = "card";
        d.innerHTML = `
          <div class="card-actions">
            <button class="act-btn" onclick="copyTxt('${enc(db, "cp")}')">📋</button>
            <button class="act-btn" style="color:#ef4444;" onclick="delNote(${x.id})">🗑️</button>
          </div>
          <span class="cat-badge">${cat}</span><br>
          <b>${dt}</b>
          <p style="margin-top:6px;white-space:pre-wrap;font-size:14px;">${db}</p>
          <div style="font-size:11px;color:var(--sub);margin-top:8px;">📅 ${x.d || ""}</div>
        `;
        list.appendChild(d);
      }
    }
  });
  document.getElementById("cnt").textContent = count;
}

function copyTxt(encStr) {
  navigator.clipboard.writeText(dec(encStr, "cp"));
  alert("Nusxalandi!");
}

function delNote(id) {
  let arr = JSON.parse(localStorage.getItem(getStorageKey()) || "[]").filter(x => x.id !== id);
  localStorage.setItem(getStorageKey(), JSON.stringify(arr));
  showNotes();
}

function resetTimer() {
  clearTimeout(timer);
  if (key) timer = setTimeout(lockNow, 45000);
}
document.ontouchstart = resetTimer;
document.onkeypress = resetTimer;
function openPrivacy() { document.getElementById("privacyModal").style.display = "flex"; }
function closePrivacy() { document.getElementById("privacyModal").style.display = "none"; }
document.getElementById("infoBtn").onclick = openPrivacy;
