// ===== Height options 2'0" to 16'11" =====
const repairHeightSelect = document.getElementById('repairHeight');
for (let feet = 2; feet <= 16; feet++) {
  for (let inch = 0; inch <= 11; inch++) {
    const label = inch === 0 ? `${feet}’` : `${feet}’${inch}"`;
    const opt = document.createElement('option');
    opt.textContent = label;
    opt.value = label;
    repairHeightSelect.appendChild(opt);
  }
}

// ===== Elements =====
const darkToggle = document.getElementById('darkToggle');
const loginPage = document.getElementById('loginPage');
const framePage = document.getElementById('framePage');
const damagePage = document.getElementById('damagePage');
const overviewPage = document.getElementById('overviewPage');
const proceedToDamage = document.getElementById('proceedToDamage');

const toggleSignup = document.getElementById('toggleSignup');
const loginBtn = document.getElementById('loginBtn');
const signupFields = document.getElementById('signupFields');
let signupMode = false;

const frameTitle = document.getElementById('frameTitle');
const addFrameBtn = document.getElementById('addFrame');
const clearFrameBtn = document.getElementById('clearFrame');
const frameChips = document.getElementById('frameChips');

const editFrameBtn = document.getElementById('editFrame');
const toOverview = document.getElementById('toOverview');
const overviewBack = document.getElementById('overviewBack');
const nextDamage = document.getElementById('nextDamage');
const duplicateLast = document.getElementById('duplicateLast');
const saveEdit = document.getElementById('saveEdit');
const cancelEdit = document.getElementById('cancelEdit');
const exportCSV = document.getElementById('exportCSV');
const exportXLSX = document.getElementById('exportXLSX');
const overviewExportCSV = document.getElementById('overviewExportCSV');
const overviewExportXLSX = document.getElementById('overviewExportXLSX');

const strutsNeeded = document.getElementById('strutsNeeded');
const diagStruts = document.getElementById('diagStruts');
const horizStruts = document.getElementById('horizStruts');

const progress = document.getElementById('progress');
const damageTabs = document.getElementById('damageTabs');
const frameSelect = document.getElementById('frameSelect');

const beamHeight1 = document.getElementById('beamHeight1');
const beamHeight2 = document.getElementById('beamHeight2');
const beamHeight3 = document.getElementById('beamHeight3');
const beamHeight4 = document.getElementById('beamHeight4');

const overviewContent = document.getElementById('overviewContent');

// Frame inputs
const depth = document.getElementById('depth');
const width = document.getElementById('width');
const hasBacker = document.getElementById('hasBacker');
const backerTypeWrap = document.getElementById('backerTypeWrap');
const backerType = document.getElementById('backerType');
const hStrutDims = document.getElementById('hStrutDims');
const dStrutDims = document.getElementById('dStrutDims');
const strutHeights = document.getElementById('strutHeights');
const holePunch = document.getElementById('holePunch');
const color = document.getElementById('color');
const manufacturer = document.getElementById('manufacturer');

// Damage inputs
const damageLocation = document.getElementById('damageLocation');
const repairType = document.getElementById('repairType');

// ===== App State =====
let frameCount = 1;
let frames = []; // [{frameLabel, depth, width, hasBacker, backerType, hStrutDims, dStrutDims, strutHeights, holePunch, color, manufacturer, damages:[...]}]
let currentFrame = null;
let editContext = null; // {frameIdx, damageIdx} when editing

// ===== Dark mode =====
darkToggle.addEventListener('click', () => {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? '' : 'dark';
  if (next) root.setAttribute('data-theme', next); else root.removeAttribute('data-theme');
  localStorage.setItem('theme', next);
});

// ===== Backer visibility =====
hasBacker.addEventListener('change', () => {
  backerTypeWrap.classList.toggle('hidden', hasBacker.value !== 'Yes');
});

// ===== Login / Signup Toggle =====
toggleSignup.addEventListener('click', () => {
  signupMode = !signupMode;
  signupFields.classList.toggle('hidden', !signupMode);
  toggleSignup.textContent = signupMode ? "Back to Login" : "Create Account";
  loginBtn.textContent = signupMode ? "Sign Up" : "Login";
});

loginBtn.addEventListener('click', () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!email || !password) { alert("Email and password are required."); return; }

  const key = 'user_' + email;
  let user = localStorage.getItem(key);

  if (signupMode) {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    if (!firstName || !lastName || !phone) { alert("Please fill first name, last name, and phone."); return; }
    user = { firstName, lastName, phone, email, password };
    localStorage.setItem(key, JSON.stringify(user));
    alert("Account created. You can now log in.");
    signupMode = false;
    signupFields.classList.add('hidden');
    toggleSignup.textContent = "Create Account";
    loginBtn.textContent = "Login";
    return;
  }

  if (!user) { alert("No account found. Tap 'Create Account' to sign up."); return; }
  user = JSON.parse(user);
  if (user.password !== password) { alert("Wrong password."); return; }

  // Success -> go to Frame page
  loginPage.classList.add('hidden');
  framePage.classList.remove('hidden');
  updateFrameTitle();
});

// ===== Utilities =====
function updateFrameTitle() {
  frameTitle.textContent = `Add Frame ${frameCount}`;
}

function updateProgress() {
  const lbl = currentFrame ? currentFrame.frameLabel : "Frame ?";
  const dmgIndex = (currentFrame && currentFrame.damages) ? currentFrame.damages.length + 1 : 1;
  progress.textContent = `${lbl} → Damage ${dmgIndex}`;
}

function updateFrameSelect() {
  frameSelect.innerHTML = "";
  frames.forEach((f, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = f.frameLabel;
    frameSelect.appendChild(opt);
  });
  if (currentFrame) frameSelect.value = frames.indexOf(currentFrame);
}

function renderDamageTabs() {
  damageTabs.innerHTML = "";
  if (!currentFrame) return;
  currentFrame.damages.forEach((d, i) => {
    const tab = document.createElement('span');
    tab.className = 'tab';
    tab.textContent = `Damage ${i+1}`;
    tab.addEventListener('click', () => preloadDamage(d));
    damageTabs.appendChild(tab);
  });
}

function preloadDamage(d) {
  damageLocation.value = d.damageLocation || "";
  repairType.value = d.repairType || "EVL-S";
  repairHeightSelect.value = d.repairHeight || '2’';
  beamHeight1.value = d.beamHeight1 || "";
  beamHeight2.value = d.beamHeight2 || "";
  beamHeight3.value = d.beamHeight3 || "";
  beamHeight4.value = d.beamHeight4 || "";
  strutsNeeded.value = d.strutsNeeded || "No";
  diagStruts.value = d.diagStruts || 0;
  horizStruts.value = d.horizStruts || 0;
  toggleStrutVisibility();
}

function toggleStrutVisibility() {
  const show = (strutsNeeded.value === "Yes");
  diagStruts.parentElement.classList.toggle('hidden', !show);
  horizStruts.parentElement.classList.toggle('hidden', !show);
}
strutsNeeded.addEventListener('change', toggleStrutVisibility);

// ===== Add Frame (multiple frames on frame page) =====
addFrameBtn.addEventListener('click', () => {
  const f = {
    frameLabel: `Frame ${frames.length + 1}`,
    depth: depth.value,
    width: width.value,
    hasBacker: hasBacker.value,
    backerType: hasBacker.value === 'Yes' ? backerType.value : '',
    hStrutDims: hStrutDims.value,
    dStrutDims: dStrutDims.value,
    strutHeights: strutHeights.value,
    holePunch: holePunch.value,
    color: color.value,
    manufacturer: manufacturer.value,
    damages: []
  };
  frames.push(f);
  renderFrameChips();
  // Prepare for next frame
  frameCount = frames.length + 1;
  updateFrameTitle();
  // Clear inputs
  depth.value = ''; hStrutDims.value=''; dStrutDims.value=''; strutHeights.value=''; holePunch.value=''; color.value='';
  hasBacker.value='No'; backerTypeWrap.classList.add('hidden');
});

clearFrameBtn.addEventListener('click', () => {
  depth.value = ''; hStrutDims.value=''; dStrutDims.value=''; strutHeights.value=''; holePunch.value=''; color.value='';
  hasBacker.value='No'; backerTypeWrap.classList.add('hidden');
});

function renderFrameChips(){
  frameChips.innerHTML='';
  frames.forEach((f, idx)=>{
    const chip = document.createElement('span');
    chip.className='chip';
    chip.textContent = `${f.frameLabel} • ${f.manufacturer} • ${f.width}`;
    frameChips.appendChild(chip);
  });
}

// ===== Proceed to Damage Page =====
proceedToDamage.addEventListener('click', () => {
  if (frames.length === 0) { alert("Please add at least one frame first."); return; }
  currentFrame = frames[0];
  framePage.classList.add('hidden');
  damagePage.classList.remove('hidden');
  updateFrameSelect();
  updateProgress();
  renderDamageTabs();
});

// ===== Edit Frame: return to frame page with current frame values filled =====
editFrameBtn.addEventListener('click', () => {
  if (!currentFrame) return;
  framePage.classList.remove('hidden');
  damagePage.classList.add('hidden');
  // Fill with selected frame values for editing (user can re-add corrected as a new frame or we could update in-place; we'll update in-place)
  depth.value = currentFrame.depth || "";
  width.value = currentFrame.width || "3” x 3”";
  hasBacker.value = currentFrame.hasBacker || "No";
  backerTypeWrap.classList.toggle('hidden', hasBacker.value !== 'Yes');
  backerType.value = currentFrame.backerType || "3” x 3”";
  hStrutDims.value = currentFrame.hStrutDims || "";
  dStrutDims.value = currentFrame.dStrutDims || "";
  strutHeights.value = currentFrame.strutHeights || "";
  holePunch.value = currentFrame.holePunch || "";
  color.value = currentFrame.color || "";
  manufacturer.value = currentFrame.manufacturer || "Interlake";
  // On re-click "Add Frame", we could either push a new frame or, better, update current: for simplicity, we will push a new one; 
  // If you prefer in-place edit, let me know and I'll swap logic to update frames[frames.indexOf(currentFrame)].
});

// ===== Switch to another Frame on Damage Page =====
frameSelect.addEventListener('change', (e) => {
  const idx = parseInt(e.target.value, 10);
  if (!isNaN(idx) && frames[idx]) {
    currentFrame = frames[idx];
    updateProgress();
    renderDamageTabs();
  }
});

// ===== Overview Page with Edit/Delete controls =====
toOverview.addEventListener('click', () => {
  renderOverview();
  overviewPage.classList.remove('hidden');
  damagePage.classList.add('hidden');
});

overviewBack.addEventListener('click', () => {
  overviewPage.classList.add('hidden');
  damagePage.classList.remove('hidden');
});

function renderOverview() {
  if (frames.length === 0) { overviewContent.innerHTML = "<p>No data yet.</p>"; return; }
  let html = "";
  frames.forEach((f, fIdx) => {
    html += `<h3>${f.frameLabel} — <span class='chip'>${esc(f.manufacturer)}</span> <span class='chip'>${esc(f.width)}</span></h3>`;
    html += `<div class='helper'>Depth: ${esc(f.depth)} | Backer: ${esc(f.hasBacker)} ${f.backerType?('('+esc(f.backerType)+')'):''} | H Strut: ${esc(f.hStrutDims)} | D Strut: ${esc(f.dStrutDims)} | Strut Heights: ${esc(f.strutHeights)} | Hole Punch: ${esc(f.holePunch)} | Color: ${esc(f.color)}</div>`;
    if (!f.damages.length) {
      html += "<p class='helper'>No damages recorded.</p>";
    } else {
      html += "<table class='table'><thead><tr><th>#</th><th>Location</th><th>Repair</th><th>Height</th><th>Beam 1</th><th>Beam 2</th><th>Beam 3</th><th>Beam 4</th><th>Struts?</th><th>Diag</th><th>Horiz</th><th>Actions</th></tr></thead><tbody>";
      f.damages.forEach((d,i)=>{
        html += `<tr data-f='${fIdx}' data-d='${i}'>
          <td>${i+1}</td>
          <td>${esc(d.damageLocation||"")}</td>
          <td>${esc(d.repairType||"")}</td>
          <td>${esc(d.repairHeight||"")}</td>
          <td>${esc(d.beamHeight1||"")}</td>
          <td>${esc(d.beamHeight2||"")}</td>
          <td>${esc(d.beamHeight3||"")}</td>
          <td>${esc(d.beamHeight4||"")}</td>
          <td>${esc(d.strutsNeeded||"")}</td>
          <td>${esc(d.diagStruts||"0")}</td>
          <td>${esc(d.horizStruts||"0")}</td>
          <td>
            <button class='secondary ovEdit'>Edit</button>
            <button class='secondary ovDuplicate'>Duplicate</button>
            <button class='secondary ovDelete'>Delete</button>
          </td>
        </tr>`;
      });
      html += "</tbody></table>";
    }
    html += "<hr/>";
  });
  overviewContent.innerHTML = html;
}

overviewContent.addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const tr = e.target.closest('tr');
  const fIdx = parseInt(tr?.getAttribute('data-f')||"-1",10);
  const dIdx = parseInt(tr?.getAttribute('data-d')||"-1",10);
  if (isNaN(fIdx) || isNaN(dIdx)) return;
  if (btn.classList.contains('ovEdit')) {
    // load into damage form for editing
    currentFrame = frames[fIdx];
    const d = currentFrame.damages[dIdx];
    editContext = {frameIdx:fIdx, damageIdx:dIdx};
    preloadDamage(d);
    overviewPage.classList.add('hidden');
    damagePage.classList.remove('hidden');
    nextDamage.classList.add('hidden');
    saveEdit.classList.remove('hidden');
    cancelEdit.classList.remove('hidden');
    updateProgress();
    renderDamageTabs();
  } else if (btn.classList.contains('ovDelete')) {
    if (confirm("Delete this damage entry?")) {
      frames[fIdx].damages.splice(dIdx,1);
      renderOverview();
      if (currentFrame === frames[fIdx]) {
        renderDamageTabs();
        updateProgress();
      }
    }
  } else if (btn.classList.contains('ovDuplicate')) {
    // duplicate damage entry but clear location
    const src = frames[fIdx].damages[dIdx];
    const dup = {...src, damageLocation: ""};
    frames[fIdx].damages.push(dup);
    renderOverview();
    if (currentFrame === frames[fIdx]) {
      renderDamageTabs();
      updateProgress();
    }
  }
});

cancelEdit.addEventListener('click', ()=>{
  editContext = null;
  nextDamage.classList.remove('hidden');
  saveEdit.classList.add('hidden');
  cancelEdit.classList.add('hidden');
  damageLocation.value = '';
});

saveEdit.addEventListener('click', ()=>{
  if (!editContext) return;
  const fIdx = editContext.frameIdx;
  const dIdx = editContext.damageIdx;
  const d = frames[fIdx].damages[dIdx];
  d.damageLocation = damageLocation.value;
  d.repairType = repairType.value;
  d.repairHeight = repairHeightSelect.value;
  d.beamHeight1 = beamHeight1.value;
  d.beamHeight2 = beamHeight2.value;
  d.beamHeight3 = beamHeight3.value;
  d.beamHeight4 = beamHeight4.value;
  d.strutsNeeded = strutsNeeded.value;
  d.diagStruts = diagStruts.value || 0;
  d.horizStruts = horizStruts.value || 0;
  editContext = null;
  nextDamage.classList.remove('hidden');
  saveEdit.classList.add('hidden');
  cancelEdit.classList.add('hidden');
  renderDamageTabs();
  alert("Changes saved.");
});

// ===== Duplicate Last Damage (on damage page) =====
duplicateLast.addEventListener('click', () => {
  if (!currentFrame || currentFrame.damages.length === 0) { alert("No previous damage to duplicate."); return; }
  const last = currentFrame.damages[currentFrame.damages.length - 1];
  preloadDamage({...last, damageLocation: ""});
});

// ===== Switch frame on Damage Page =====
frameSelect.addEventListener('change', (e) => {
  const idx = parseInt(e.target.value, 10);
  if (!isNaN(idx) && frames[idx]) {
    currentFrame = frames[idx];
    updateProgress();
    renderDamageTabs();
  }
});

// ===== Add Damage =====
nextDamage.addEventListener('click', () => {
  if (!currentFrame) { alert("Please select a frame first."); return; }
  const damage = {
    damageLocation: damageLocation.value,
    repairType: repairType.value,
    repairHeight: repairHeightSelect.value,
    beamHeight1: beamHeight1.value,
    beamHeight2: beamHeight2.value,
    beamHeight3: beamHeight3.value,
    beamHeight4: beamHeight4.value,
    strutsNeeded: strutsNeeded.value,
    diagStruts: diagStruts.value || 0,
    horizStruts: horizStruts.value || 0
  };
  currentFrame.damages.push(damage);

  // Clear only location; keep everything else (including beam heights)
  damageLocation.value = '';
  strutsNeeded.value = 'No';
  diagStruts.value = 0;
  horizStruts.value = 0;

  updateProgress();
  renderDamageTabs();
});

// ===== Export Helpers =====
function buildRows() {
  const rows = [["Frame","Manufacturer","Depth","Width","Backer","Backer Type","H Strut Dims","D Strut Dims","Strut Heights","Hole Punch","Color","Damage Location","Repair Type","Repair Height","Beam 1","Beam 2","Beam 3","Beam 4","Struts Needed","Diagonal Struts","Horizontal Struts"]];
  frames.forEach(f => {
    if (f.damages.length === 0) {
      rows.push([f.frameLabel, f.manufacturer, f.depth, f.width, f.hasBacker, f.backerType, f.hStrutDims, f.dStrutDims, f.strutHeights, f.holePunch, f.color, "", "", "", "", "", "", "", "", "", ""]);
    } else {
      f.damages.forEach(d => {
        rows.push([f.frameLabel, f.manufacturer, f.depth, f.width, f.hasBacker, f.backerType, f.hStrutDims, f.dStrutDims, f.strutHeights, f.holePunch, f.color, d.damageLocation||"", d.repairType||"", d.repairHeight||"", d.beamHeight1||"", d.beamHeight2||"", d.beamHeight3||"", d.beamHeight4||"", d.strutsNeeded||"", d.diagStruts||0, d.horizStruts||0]);
      });
    }
  });
  return rows;
}

function exportToCSV() {
  const rows = buildRows();
  const csv = rows.map(r => r.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download="warehouse_repairs.csv"; a.click(); URL.revokeObjectURL(url);
  alert("Exported CSV successfully!");
}
function escapeCsv(v){ if(v==null) return ""; const s=String(v); return s.includes(",")||s.includes('"') ? '"' + s.replace(/"/g,'""') + '"' : s; }

function exportToXLSX() {
  if (typeof XLSX === "undefined" || !XLSX || !XLSX.utils) {
    alert("XLSX library not loaded yet. Try again in a moment or use CSV export.");
    return;
  }
  const rows = buildRows();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Repairs");
  XLSX.writeFile(wb, "warehouse_repairs.xlsx");
}

// Buttons
exportCSV.addEventListener('click', exportToCSV);
exportXLSX.addEventListener('click', exportToXLSX);
overviewExportCSV.addEventListener('click', exportToCSV);
overviewExportXLSX.addEventListener('click', exportToXLSX);

// ===== Overview click handlers for edit/dup/delete are above =====

// Init
function esc(s){ if(s==null) return ""; return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
updateFrameTitle();
updateProgress();
