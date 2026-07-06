const STORAGE_KEY = 'transformHub30';
const TOTAL_DAYS = 30;
const RATING_DIMS = ['mood', 'productivity', 'health', 'focus'];
const RATING_LABELS = { mood: 'Mood', productivity: 'Productivity', health: 'Health', focus: 'Focus' };
const ICONS = ['\u{1F4AA}', '\u{1F4DA}', '\u{1F3C3}', '\u{1F54A}', '\u{1F4BB}', '\u{1F3E0}', '\u{1F37D}', '\u{1F3C6}', '\u{1F30A}', '\u{1F3A8}', '\u{1F4A1}', '\u{1F4D6}', '\u{23F0}', '\u{1F3B5}', '\u{1F9D7}', '\u{1F9EB}', '\u{1F4AC}', '\u{1F4AD}', '\u{1F9E9}', '\u{1F3AA}'];
const CATEGORIES = ['Health', 'Study', 'Fitness', 'Religion', 'Productivity', 'Personal Development'];
const ACHIEVEMENTS = [
  { id: 'first', name: 'First Habit Checked', icon: '\u{1F3C6}', desc: 'Complete your first habit', check: s => s._firstDone },
  { id: 'streak7', name: '7-Day Streak', icon: '\u{1F525}', desc: 'Complete all habits 7 days in a row', check: s => s._streak7 },
  { id: 'streak30', name: '30-Day Streak', icon: '\u{1F451}', desc: 'Complete all habits 30 days in a row', check: s => s._streak30 },
  { id: 'total100', name: '100 Habits Done', icon: '\u{1F3AF}', desc: 'Complete 100 habit checks total', check: s => s._total100 },
  { id: 'perfectWeek', name: 'Perfect Week', icon: '\u{1F31F}', desc: 'Complete all habits for a full week', check: s => s._perfectWeek },
  { id: 'perfectMonth', name: 'Perfect Month', icon: '\u{1F30D}', desc: 'Complete all habits for 30 days', check: s => s._perfectMonth },
  { id: 'level5', name: 'Level 5', icon: '\u{2B50}', desc: 'Reach level 5', check: s => s._level5 },
  { id: 'level10', name: 'Level 10', icon: '\u{1F31E}', desc: 'Reach level 10', check: s => s._level10 },
  { id: 'ratings', name: 'Rate Your Life', icon: '\u{1F4CA}', desc: 'Log ratings for 7 consecutive days', check: s => s._ratingsWeek },
  { id: 'journal', name: 'Journal Keeper', icon: '\u{1F4DD}', desc: 'Write 10 journal entries', check: s => s._journal10 }
];
const DEFAULT_MISSIONS = ['Career Goal', 'Health Goal', 'Learning Goal', 'Relationship Goal', 'Financial Goal'];
const DEFAULT_HABITS = ['Exercise 30min', 'Read 20 pages', 'Meditate 10min', 'Drink 8 cups water', 'No sugar', 'Sleep by 11pm'];
const CHALLENGES = [
  { id: '7day', name: '7-Day Challenge', icon: '\u{1F525}', days: 7 },
  { id: '30day', name: '30-Day Challenge', icon: '\u{1F30D}', days: 30 },
  { id: '100day', name: '100-Day Challenge', icon: '\u{1F3AF}', days: 100 }
];

let state = {
  chapter: '', startDate: '', missions: [], habits: [], archivedHabits: [],
  ratings: {}, journals: {}, commitment: 5, reward: '',
  xp: 0, achievements: [], rewards: [], createdRewards: [],
  settings: { darkMode: true, notifications: false, language: 'en', reminderTime: '' },
  _firstDone: false, _streak7: false, _streak30: false, _total100: false,
  _perfectWeek: false, _perfectMonth: false, _level5: false, _level10: false,
  _ratingsWeek: false, _journal10: false
};

let currentJournalDay = 1;
let editingHabitId = null;

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      Object.keys(p).forEach(k => { if (k in state) state[k] = p[k]; });
    }
  } catch (e) {}
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function ensureDefaults() {
  let c = false;
  if (!state.missions.length) {
    state.missions = DEFAULT_MISSIONS.map(n => ({ id: genId(), name: n, days: {} })); c = true;
  }
  if (!state.habits.length) {
    state.habits = DEFAULT_HABITS.map((n, i) => ({ id: genId(), name: n, days: {}, category: CATEGORIES[i % 6], frequency: 'daily', icon: ICONS[i], color: '#22C55E', reminderTime: '', order: i })); c = true;
  }
  if (!state.rewards.length) {
    state.rewards = [
      { id: 'r1', name: 'Watch a Movie', icon: '\u{1F3AC}', cost: 50 },
      { id: 'r2', name: 'Treat Yourself', icon: '\u{1F36B}', cost: 100 },
      { id: 'r3', name: 'Day Off', icon: '\u{1F3D6}', cost: 200 }
    ]; c = true;
  }
  if (c) saveState();
}

function getToday() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function dateStr(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function formatDisplayDate(d) { return d.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }); }

function calculateCurrentDay() {
  if (!state.startDate) return null;
  const start = new Date(state.startDate + 'T00:00:00');
  const diff = Math.floor((getToday() - start) / 86400000);
  if (diff < 0) return null;
  return Math.min(diff + 1, TOTAL_DAYS);
}

function getDayDate(dayNum) {
  if (!state.startDate) return null;
  const d = new Date(state.startDate + 'T00:00:00');
  d.setDate(d.getDate() + dayNum - 1);
  return d;
}

// ========== XP & LEVEL ==========
function getLevel(totalXP) { let l = 1; while (50 * l * (l + 1) <= totalXP) l++; return l; }
function getXPForLevel(l) { return 50 * l * (l - 1); }
function getXPProgress() {
  const l = getLevel(state.xp);
  const cur = getXPForLevel(l);
  const next = getXPForLevel(l + 1);
  return { level: l, current: state.xp - cur, needed: next - cur };
}

function addXP(amount) {
  state.xp += amount;
  const oldL = getLevel(state.xp - amount);
  const newL = getLevel(state.xp);
  if (newL > oldL) {
    if (newL >= 5) state._level5 = true;
    if (newL >= 10) state._level10 = true;
  }
  saveState();
  updateXPDisplay();
  checkAchievements();
}

function updateXPDisplay() {
  const p = getXPProgress();
  document.getElementById('levelNum').textContent = p.level;
  document.getElementById('xpCurrent').textContent = p.current;
  document.getElementById('xpNext').textContent = p.needed;
  document.getElementById('xpFill').style.width = p.needed > 0 ? (p.current / p.needed * 100) + '%' : '0%';
  document.getElementById('xpBalance').textContent = state.xp;
}

// ========== HEADERS ==========
function generateDayHeaders() {
  document.querySelectorAll('#tab-dashboard table').forEach(t => {
    const row = t.querySelector('thead tr');
    for (let d = 1; d <= TOTAL_DAYS; d++) { const th = document.createElement('th'); th.className = 'day-header'; th.textContent = d; row.appendChild(th); }
  });
}

// ========== RENDER TABLE (MISSIONS / HABITS) ==========
function renderTable(type) {
  const tbody = document.getElementById(type + 'Body');
  const items = state[type];
  tbody.innerHTML = '';
  items.forEach(item => {
    const tr = document.createElement('tr');
    const nameTd = document.createElement('td'); nameTd.className = 'sticky-cell';
    const nc = document.createElement('div'); nc.className = 'name-content';
    const inp = document.createElement('input'); inp.className = 'row-name'; inp.type = 'text'; inp.value = item.name; inp.placeholder = 'Enter name...';
    const delBtn = document.createElement('button'); delBtn.className = 'delete-row'; delBtn.textContent = '\u00d7'; delBtn.title = 'Delete';
    nc.appendChild(inp); nc.appendChild(delBtn); nameTd.appendChild(nc); tr.appendChild(nameTd);
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      const td = document.createElement('td');
      const c = document.createElement('span'); c.className = 'day-cell'; c.dataset.id = item.id; c.dataset.day = d;
      if (item.days && item.days[d]) c.classList.add('checked');
      td.appendChild(c); tr.appendChild(td);
    }
    tbody.appendChild(tr);
    inp.addEventListener('change', function() { item.name = this.value.trim(); saveState(); });
    delBtn.addEventListener('click', function() { if (confirm('Delete?')) deleteRow(type, item.id); });
  });
  attachDayListeners();
}

function attachDayListeners() {
  document.querySelectorAll('.day-cell').forEach(el => {
    el.addEventListener('click', function() { toggleDay(this.dataset.id, parseInt(this.dataset.day), this); });
  });
}

function toggleDay(id, day, el) {
  let item = state.missions.find(m => m.id === id);
  if (!item) item = state.habits.find(h => h.id === id);
  if (!item) return;
  if (!item.days) item.days = {};
  const wasChecked = !!item.days[day];
  if (wasChecked) { delete item.days[day]; el.classList.remove('checked'); }
  else { item.days[day] = true; el.classList.add('checked'); }
  el.classList.add('just-toggled');
  setTimeout(function() { el.classList.remove('just-toggled'); }, 250);
  saveState();
  if (!wasChecked) {
    const isMission = state.missions.some(m => m.id === id);
    addXP(isMission ? 25 : 10);
    if (!state._firstDone && getTotalChecks() >= 1) { state._firstDone = true; saveState(); checkAchievements(); }
    if (!state._total100 && getTotalChecks() >= 100) { state._total100 = true; saveState(); checkAchievements(); }
  }
  updateProgress();
  updateStats();
  updateHeatmap();
}

function addRow(type) {
  const def = type === 'missions' ? { id: genId(), name: '', days: {} } : { id: genId(), name: '', days: {}, category: 'Health', frequency: 'daily', icon: '\u{1F4AA}', color: '#22C55E', reminderTime: '', order: state.habits.length };
  state[type].push(def); saveState(); renderTable(type); updateProgress();
  const inp = document.getElementById(type + 'Body').querySelector('tr:last-child .row-name');
  if (inp) setTimeout(function() { inp.focus(); }, 50);
}

function deleteRow(type, id) { state[type] = state[type].filter(i => i.id !== id); saveState(); renderTable(type); updateProgress(); }

// ========== RATINGS ==========
function renderRatingsTable() {
  const tbody = document.getElementById('ratingsBody'); tbody.innerHTML = '';
  RATING_DIMS.forEach(dim => {
    const tr = document.createElement('tr');
    const td = document.createElement('td'); td.className = 'sticky-cell'; td.textContent = RATING_LABELS[dim]; tr.appendChild(td);
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      const c = document.createElement('td');
      const s = document.createElement('span'); s.className = 'rating-cell'; s.dataset.dim = dim; s.dataset.day = d;
      const val = state.ratings[d] ? (state.ratings[d][dim] || 0) : 0;
      s.classList.add('r' + val); s.textContent = val || '-';
      s.addEventListener('click', function() { cycleRating(this.dataset.dim, parseInt(this.dataset.day), this); });
      c.appendChild(s); tr.appendChild(c);
    }
    tbody.appendChild(tr);
  });
}

function cycleRating(dim, day, el) {
  if (!state.ratings[day]) state.ratings[day] = {};
  let val = state.ratings[day][dim] || 0;
  val = val >= 5 ? 0 : val + 1;
  state.ratings[day][dim] = val;
  el.className = 'rating-cell r' + val + ' just-clicked'; el.textContent = val || '-';
  setTimeout(function() { el.classList.remove('just-clicked'); }, 200);
  saveState();
  if (val > 0) { addXP(5); }
  checkRatingStreak();
}

// ========== JOURNAL ==========
function renderJournal() {
  document.getElementById('journalDayLabel').textContent = 'Day ' + currentJournalDay;
  const dd = getDayDate(currentJournalDay);
  const ta = document.getElementById('journalText');
  ta.placeholder = dd ? 'Write about ' + formatDisplayDate(dd) + '...' : 'Write about your day...';
  ta.value = state.journals[currentJournalDay] || '';
}

function navigateJournal(delta) {
  state.journals[currentJournalDay] = document.getElementById('journalText').value;
  saveState();
  currentJournalDay = Math.max(1, Math.min(TOTAL_DAYS, currentJournalDay + delta));
  renderJournal();
  checkJournalAchievement();
}

function saveJournal() {
  state.journals[currentJournalDay] = document.getElementById('journalText').value;
  saveState();
}

function checkJournalAchievement() {
  const count = Object.keys(state.journals).filter(k => state.journals[k].trim()).length;
  if (count >= 10) { state._journal10 = true; saveState(); checkAchievements(); }
}

function checkRatingStreak() {
  let streak = 0;
  for (let d = 1; d <= TOTAL_DAYS; d++) {
    const r = state.ratings[d];
    if (r && (r.mood || r.productivity || r.health || r.focus)) { streak++; if (streak >= 7) { state._ratingsWeek = true; saveState(); checkAchievements(); } }
    else streak = 0;
  }
}

// ========== PROGRESS ==========
function getTotalChecks() {
  let t = 0;
  [...state.missions, ...state.habits].forEach(item => { for (let d = 1; d <= TOTAL_DAYS; d++) if (item.days && item.days[d]) t++; });
  return t;
}

function updateProgress() {
  const all = [...state.missions, ...state.habits];
  let totalChecks = 0, daysDone = 0, dayComplete = [];
  for (let d = 1; d <= TOTAL_DAYS; d++) {
    let allDone = true;
    all.forEach(item => { if (item.days && item.days[d]) totalChecks++; else allDone = false; });
    if (allDone) daysDone++;
    dayComplete.push(allDone);
  }
  const totalCells = all.length * TOTAL_DAYS;
  const pct = totalCells > 0 ? Math.round(totalChecks / totalCells * 100) : 0;
  let bestStreak = 0, curStreak = 0;
  dayComplete.forEach(done => { if (done) { curStreak++; if (curStreak > bestStreak) bestStreak = curStreak; } else curStreak = 0; });
  document.getElementById('overallPercent').textContent = pct + '%';
  document.getElementById('overallFill').style.width = pct + '%';
  document.getElementById('daysCompleted').textContent = daysDone;
  document.getElementById('totalChecks').textContent = totalChecks;
  document.getElementById('bestStreak').textContent = bestStreak;
  checkStreaks(bestStreak, dayComplete, daysDone);
}

function checkStreaks(bestStreak, dayComplete, daysDone) {
  if (bestStreak >= 7 && !state._streak7) { state._streak7 = true; saveState(); checkAchievements(); }
  if (bestStreak >= 30 && !state._streak30) { state._streak30 = true; saveState(); checkAchievements(); }
  const perfectWeek = dayComplete.some((_, i) => i <= TOTAL_DAYS - 7 && dayComplete.slice(i, i + 7).every(Boolean));
  if (perfectWeek && !state._perfectWeek) { state._perfectWeek = true; saveState(); checkAchievements(); }
  if (daysDone === TOTAL_DAYS && !state._perfectMonth) { state._perfectMonth = true; saveState(); checkAchievements(); }
}

function updateDayCounter() {
  document.getElementById('dayCounterNum').textContent = calculateCurrentDay() ?? '-';
}

// ========== STATS ==========
function updateStats() {
  const all = [...state.missions, ...state.habits];
  let totalChecked = 0, itemCounts = {};
  all.forEach(item => {
    let cnt = 0;
    for (let d = 1; d <= TOTAL_DAYS; d++) if (item.days && item.days[d]) cnt++;
    totalChecked += cnt;
    itemCounts[item.id] = cnt;
  });
  document.getElementById('statTotalCompleted').textContent = totalChecked;

  let curStreak = 0, longestStreak = 0;
  for (let d = 1; d <= TOTAL_DAYS; d++) {
    let allDone = true;
    all.forEach(item => { if (!(item.days && item.days[d])) allDone = false; });
    if (allDone) { curStreak++; longestStreak = Math.max(longestStreak, curStreak); }
    else curStreak = 0;
  }
  document.getElementById('statCurrentStreak').textContent = curStreak;
  document.getElementById('statLongestStreak').textContent = longestStreak;

  const today = calculateCurrentDay();
  if (today) {
    let weekChecks = 0, weekTotal = 0;
    for (let d = Math.max(1, today - 6); d <= today; d++) {
      all.forEach(item => { weekTotal++; if (item.days && item.days[d]) weekChecks++; });
    }
    document.getElementById('statWeeklyRate').textContent = weekTotal > 0 ? Math.round(weekChecks / weekTotal * 100) + '%' : '0%';
    let monthChecks = 0, monthTotal = 0;
    for (let d = 1; d <= today; d++) {
      all.forEach(item => { monthTotal++; if (item.days && item.days[d]) monthChecks++; });
    }
    document.getElementById('statMonthlyRate').textContent = monthTotal > 0 ? Math.round(monthChecks / monthTotal * 100) + '%' : '0%';
  }

  let bestId = null, worstId = null, bestCnt = -1, worstCnt = Infinity;
  Object.keys(itemCounts).forEach(id => {
    if (itemCounts[id] > bestCnt) { bestCnt = itemCounts[id]; bestId = id; }
    if (itemCounts[id] < worstCnt) { worstCnt = itemCounts[id]; worstId = id; }
  });
  const bestItem = all.find(i => i.id === bestId);
  document.getElementById('statBestHabit').textContent = bestItem ? bestItem.name : '-';
}

// ========== HEATMAP ==========
function generateHeatmap() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const grid = document.getElementById('heatmapGrid');
  grid.innerHTML = '';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach(d => { const el = document.createElement('div'); el.className = 'heatmap-cell-label'; el.textContent = d; grid.appendChild(el); });

  for (let i = 0; i < startDay; i++) { const el = document.createElement('div'); grid.appendChild(el); }

  for (let day = 1; day <= totalDays; day++) {
    const el = document.createElement('div'); el.className = 'heatmap-cell';
    const date = new Date(year, month, day);
    const dateKey = dateStr(date);
    const dayNum = calculateDayNumForDate(dateKey);
    let completed = 0, total = 0;
    if (dayNum && dayNum >= 1 && dayNum <= TOTAL_DAYS) {
      [...state.missions, ...state.habits].forEach(item => { total++; if (item.days && item.days[dayNum]) completed++; });
    }
    if (total > 0 && completed === total) el.textContent = '\u{1F7E9}';
    else if (total > 0 && completed >= total / 2) el.textContent = '\u{1F7E8}';
    else if (total > 0 && completed > 0) el.textContent = '\u{1F7E7}';
    else el.textContent = '\u{2B1C}';
    el.title = dateKey + ': ' + completed + '/' + total;
    grid.appendChild(el);
  }
}

function calculateDayNumForDate(dateKey) {
  if (!state.startDate) return null;
  const start = new Date(state.startDate + 'T00:00:00');
  const date = new Date(dateKey + 'T00:00:00');
  const diff = Math.floor((date - start) / 86400000);
  if (diff >= 0 && diff < TOTAL_DAYS) return diff + 1;
  return null;
}

function updateHeatmap() { generateHeatmap(); }

// ========== ACHIEVEMENTS ==========
function checkAchievements() {
  const grid = document.getElementById('achieveGrid');
  if (!grid) return;
  grid.innerHTML = '';
  let unlocked = 0;
  ACHIEVEMENTS.forEach(a => {
    const done = a.check(state);
    if (done) unlocked++;
    const el = document.createElement('div'); el.className = 'achieve-item' + (done ? ' unlocked' : ' locked');
    el.innerHTML = '<span class="achieve-icon">' + a.icon + '</span><div class="achieve-name">' + a.name + '</div><div class="achieve-desc">' + a.desc + '</div>';
    grid.appendChild(el);
  });
  document.getElementById('achieveCount').textContent = unlocked + '/' + ACHIEVEMENTS.length;
}

// ========== HABIT MANAGEMENT ==========
function renderHabitManage() {
  const list = document.getElementById('habitList'); list.innerHTML = '';
  const filter = document.getElementById('habitFilter').value;
  const items = filter === 'all' ? state.habits : state.habits.filter(h => h.category === filter);

  items.forEach((h, idx) => {
    const card = document.createElement('div'); card.className = 'habit-card'; card.draggable = true;
    card.dataset.id = h.id;
    const streak = calculateHabitStreak(h);
    const streakText = streak > 0 ? '\u{1F525} ' + streak + ' day' + (streak > 1 ? 's' : '') : '';
    card.innerHTML = '<span class="habit-icon">' + (h.icon || '\u{1F4AA}') + '</span>' +
      '<div class="habit-info"><div class="habit-name">' + h.name + '</div>' +
      '<div class="habit-meta"><span class="habit-badge ' + (h.frequency || 'daily') + '">' + (h.frequency || 'daily') + '</span>' +
      '<span>' + (h.category || 'General') + '</span>' +
      (streakText ? '<span>' + streakText + '</span>' : '') +
      '</div></div>' +
      '<div class="habit-actions">' +
      '<button class="habit-action-btn" data-action="edit" title="Edit">\u270F\uFE0F</button>' +
      '<button class="habit-action-btn" data-action="archive" title="Archive">\u{1F4E6}</button>' +
      '<button class="habit-action-btn" data-action="delete" title="Delete">\u{1F5D1}\uFE0F</button></div>';

    card.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text/plain', this.dataset.id); this.classList.add('dragging'); });
    card.addEventListener('dragend', function() { this.classList.remove('dragging'); });
    card.addEventListener('dragover', function(e) { e.preventDefault(); });
    card.addEventListener('drop', function(e) { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); const from = state.habits.findIndex(h => h.id === id); const to = state.habits.findIndex(h => h.id === this.dataset.id); if (from >= 0 && to >= 0) { const [moved] = state.habits.splice(from, 1); state.habits.splice(to, 0, moved); saveState(); renderHabitManage(); renderTable('habits'); } });

    list.appendChild(card);

    card.querySelectorAll('.habit-action-btn').forEach(btn => {
      btn.addEventListener('click', function(e) { e.stopPropagation();
        const action = this.dataset.action;
        if (action === 'edit') openHabitModal(h.id);
        else if (action === 'archive') archiveHabit(h.id);
        else if (action === 'delete') { if (confirm('Delete "' + h.name + '"?')) { state.habits = state.habits.filter(x => x.id !== h.id); saveState(); renderHabitManage(); renderTable('habits'); } }
      });
    });
  });

  renderArchived();
}

function calculateHabitStreak(habit) {
  let streak = 0;
  for (let d = TOTAL_DAYS; d >= 1; d--) {
    if (habit.days && habit.days[d]) streak++;
    else break;
  }
  return streak;
}

function archiveHabit(id) {
  const idx = state.habits.findIndex(h => h.id === id);
  if (idx < 0) return;
  const [item] = state.habits.splice(idx, 1);
  item.archived = true;
  state.archivedHabits.push(item);
  saveState();
  renderHabitManage();
  renderTable('habits');
}

function renderArchived() {
  const list = document.getElementById('archivedList'); list.innerHTML = '';
  if (!state.archivedHabits.length) { document.getElementById('emptyArchived').style.display = 'block'; return; }
  document.getElementById('emptyArchived').style.display = 'none';
  state.archivedHabits.forEach(h => {
    const card = document.createElement('div'); card.className = 'habit-card';
    card.innerHTML = '<span class="habit-icon">' + (h.icon || '\u{1F4AA}') + '</span>' +
      '<div class="habit-info"><div class="habit-name">' + h.name + '</div><div class="habit-meta"><span>Archived</span></div></div>' +
      '<div class="habit-actions"><button class="habit-action-btn" data-action="restore" title="Restore">\u{1F504}</button><button class="habit-action-btn" data-action="delete" title="Delete">\u{1F5D1}\uFE0F</button></div>';
    list.appendChild(card);
    card.querySelectorAll('.habit-action-btn').forEach(btn => {
      btn.addEventListener('click', function(e) { e.stopPropagation();
        if (this.dataset.action === 'restore') {
          state.archivedHabits = state.archivedHabits.filter(x => x.id !== h.id);
          h.archived = false; state.habits.push(h); saveState(); renderHabitManage(); renderTable('habits');
        } else if (this.dataset.action === 'delete') {
          if (confirm('Permanently delete "' + h.name + '"?')) { state.archivedHabits = state.archivedHabits.filter(x => x.id !== h.id); saveState(); renderArchived(); }
        }
      });
    });
  });
}

function openHabitModal(id) {
  editingHabitId = id;
  const h = state.habits.find(x => x.id === id);
  if (!h) return;
  document.getElementById('modalTitle').textContent = 'Edit Habit';
  document.getElementById('editHabitName').value = h.name;
  document.getElementById('editHabitCategory').value = h.category || 'Health';
  document.getElementById('editHabitColor').value = h.color || '#22C55E';
  document.getElementById('editHabitFrequency').value = h.frequency || 'daily';
  document.getElementById('editHabitReminder').value = h.reminderTime || '';
  renderIconPicker(h.icon || '\u{1F4AA}');
  document.getElementById('modalOverlay').classList.add('active');
}

function openNewHabitModal() {
  editingHabitId = null;
  document.getElementById('modalTitle').textContent = 'New Habit';
  document.getElementById('editHabitName').value = '';
  document.getElementById('editHabitCategory').value = 'Health';
  document.getElementById('editHabitColor').value = '#22C55E';
  document.getElementById('editHabitFrequency').value = 'daily';
  document.getElementById('editHabitReminder').value = '';
  renderIconPicker('\u{1F4AA}');
  document.getElementById('modalOverlay').classList.add('active');
}

function renderIconPicker(selected) {
  const container = document.getElementById('iconPicker'); container.innerHTML = '';
  ICONS.forEach(icon => {
    const el = document.createElement('span'); el.className = 'icon-option' + (icon === selected ? ' selected' : ''); el.textContent = icon;
    el.addEventListener('click', function() { container.querySelectorAll('.icon-option').forEach(e => e.classList.remove('selected')); this.classList.add('selected'); });
    container.appendChild(el);
  });
}

function getSelectedIcon() {
  const sel = document.querySelector('#iconPicker .icon-option.selected');
  return sel ? sel.textContent : '\u{1F4AA}';
}

function saveHabitModal() {
  const name = document.getElementById('editHabitName').value.trim();
  if (!name) return;
  const icon = getSelectedIcon();
  const category = document.getElementById('editHabitCategory').value;
  const color = document.getElementById('editHabitColor').value;
  const frequency = document.getElementById('editHabitFrequency').value;
  const reminderTime = document.getElementById('editHabitReminder').value;

  if (editingHabitId) {
    const h = state.habits.find(x => x.id === editingHabitId);
    if (h) { h.name = name; h.icon = icon; h.category = category; h.color = color; h.frequency = frequency; h.reminderTime = reminderTime; }
  } else {
    state.habits.push({ id: genId(), name, days: {}, icon, category, color, frequency, reminderTime, order: state.habits.length });
  }
  saveState();
  closeModal();
  renderHabitManage();
  renderTable('habits');
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); editingHabitId = null; }

// ========== CHALLENGES ==========
function renderChallenges() {
  const grid = document.getElementById('challengeGrid'); grid.innerHTML = '';
  const all = [...state.missions, ...state.habits];
  CHALLENGES.forEach(ch => {
    let completed = 0, streak = 0, bestStreak = 0;
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      let allDone = true;
      all.forEach(item => { if (!(item.days && item.days[d])) allDone = false; });
      if (allDone) { streak++; completed++; bestStreak = Math.max(bestStreak, streak); }
      else streak = 0;
    }
    const pct = Math.min(100, Math.round(bestStreak / ch.days * 100));
    const el = document.createElement('div'); el.className = 'challenge-card';
    el.innerHTML = '<span class="challenge-icon">' + ch.icon + '</span><div class="challenge-name">' + ch.name + '</div>' +
      '<div class="challenge-progress"><div class="challenge-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="challenge-stats">Best streak: ' + bestStreak + ' / ' + ch.days + ' days</div>';
    grid.appendChild(el);
  });
}

// ========== REWARDS ==========
function renderRewards() {
  const store = document.getElementById('rewardStore'); store.innerHTML = '';
  const allRewards = [...state.rewards, ...state.createdRewards];
  allRewards.forEach(r => {
    const unlocked = state.xp >= r.cost;
    const el = document.createElement('div'); el.className = 'reward-item' + (unlocked ? ' unlocked' : ' locked');
    el.innerHTML = '<div class="reward-icon">' + (r.icon || '\u{1F381}') + '</div><div class="reward-name">' + r.name + '</div><div class="reward-cost">' + r.cost + ' XP</div>';
    if (!unlocked) {
      const btn = document.createElement('button'); btn.className = 'reward-unlock-btn'; btn.textContent = 'Unlock (' + r.cost + ' XP)';
      btn.addEventListener('click', function() { if (state.xp >= r.cost) { state.xp -= r.cost; saveState(); renderRewards(); updateXPDisplay(); } });
      el.appendChild(btn);
    } else { el.innerHTML += '<div style="font-size:11px;color:var(--green);margin-top:6px;">\u2705 Unlocked</div>'; }
    store.appendChild(el);
  });
}

function createReward() {
  const name = document.getElementById('rewardNameInput').value.trim();
  const cost = parseInt(document.getElementById('rewardCostInput').value);
  if (!name || !cost) return;
  state.createdRewards.push({ id: genId(), name, icon: '\u{1F381}', cost });
  saveState();
  document.getElementById('rewardNameInput').value = ''; document.getElementById('rewardCostInput').value = '';
  renderRewards();
}

// ========== SETTINGS / EXPORT ==========
function setupSettings() {
  document.getElementById('darkModeToggle').checked = state.settings.darkMode !== false;
  document.getElementById('notifToggle').checked = state.settings.notifications || false;
  document.getElementById('langSelect').value = state.settings.language || 'en';
  document.getElementById('reminderTime').value = state.settings.reminderTime || '';

  document.getElementById('darkModeToggle').addEventListener('change', function() { state.settings.darkMode = this.checked; saveState(); });
  document.getElementById('notifToggle').addEventListener('change', function() { state.settings.notifications = this.checked; if (this.checked) requestNotificationPermission(); saveState(); });
  document.getElementById('langSelect').addEventListener('change', function() { state.settings.language = this.value; saveState(); });
  document.getElementById('reminderTime').addEventListener('change', function() { state.settings.reminderTime = this.value; saveState(); setupReminders(); });
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
}

function setupReminders() {
  if (!state.settings.reminderTime || !state.settings.notifications) return;
  if ('Notification' in window && Notification.permission === 'granted') {
    const [h, m] = state.settings.reminderTime.split(':');
    const now = new Date();
    const target = new Date(); target.setHours(parseInt(h), parseInt(m), 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const ms = target - now;
    setTimeout(function() {
      new Notification('Habit Reminder', { body: 'Time to check your habits!', icon: '' });
      setupReminders();
    }, ms);
  }
}

function exportCSV() {
  let csv = 'Type,Name,Day,Completed\n';
  [...state.missions, ...state.habits].forEach(item => {
    for (let d = 1; d <= TOTAL_DAYS; d++) { csv += (state.missions.includes(item) ? 'Mission' : 'Habit') + ',"' + item.name + '",' + d + ',' + (item.days && item.days[d] ? 'Yes' : 'No') + '\n'; }
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'habits-' + dateStr(getToday()) + '.csv'; a.click();
  URL.revokeObjectURL(url);
}

function exportExcel() {
  let html = '<table><tr><th>Type</th><th>Name</th>';
  for (let d = 1; d <= TOTAL_DAYS; d++) html += '<th>' + d + '</th>';
  html += '</tr>';
  [...state.missions, ...state.habits].forEach(item => {
    html += '<tr><td>' + (state.missions.includes(item) ? 'Mission' : 'Habit') + '</td><td>' + item.name + '</td>';
    for (let d = 1; d <= TOTAL_DAYS; d++) html += '<td>' + (item.days && item.days[d] ? 'Yes' : '') + '</td>';
    html += '</tr>';
  });
  html += '</table>';
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'habits-' + dateStr(getToday()) + '.xls'; a.click();
  URL.revokeObjectURL(url);
}

function exportPDF() {
  const w = window.open('', '_blank');
  let html = '<html><head><style>body{font-family:sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:6px;font-size:12px;text-align:center;}th{background:#f0f0f0;}h1,h2{color:#333;}</style></head><body>';
  html += '<h1>30-Day Transformation Report</h1><p>Generated: ' + formatDisplayDate(getToday()) + '</p>';
  html += '<h2>Missions & Habits</h2><table><tr><th>Type</th><th>Name</th>';
  for (let d = 1; d <= TOTAL_DAYS; d++) html += '<th>' + d + '</th>';
  html += '</tr>';
  [...state.missions, ...state.habits].forEach(item => {
    html += '<tr><td>' + (state.missions.includes(item) ? 'Mission' : 'Habit') + '</td><td>' + item.name + '</td>';
    for (let d = 1; d <= TOTAL_DAYS; d++) html += '<td>' + (item.days && item.days[d] ? '\u2713' : '') + '</td>';
    html += '</tr>';
  });
  html += '</table>';
  html += '<p>Level: ' + getLevel(state.xp) + ' | Total XP: ' + state.xp + '</p>';
  html += '</body></html>';
  w.document.write(html); w.document.close(); w.print();
}

function resetAllData() {
  if (!confirm('Are you sure? This will delete ALL your data!')) return;
  if (!confirm('Really? This cannot be undone!')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// ========== TABS ==========
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const tab = this.dataset.tab;
      document.getElementById('tab-' + tab).classList.add('active');
      if (tab === 'stats') { updateStats(); generateHeatmap(); }
      if (tab === 'achieve') checkAchievements();
      if (tab === 'challenges') renderChallenges();
      if (tab === 'habits') { renderHabitManage(); populateFilter(); }
      if (tab === 'rewards') renderRewards();
    });
  });
}

function populateFilter() {
  const sel = document.getElementById('habitFilter');
  const cur = sel.value;
  sel.innerHTML = '<option value="all">All</option>';
  CATEGORIES.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; sel.appendChild(o); });
  sel.value = cur;
  sel.addEventListener('change', renderHabitManage);
}

// ========== SETUP DEFAULTS ==========
function setupDefaultDates() {
  if (!state.startDate) { state.startDate = dateStr(getToday()); saveState(); }
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
  document.getElementById('chapterInput').addEventListener('change', function() { state.chapter = this.value.trim(); saveState(); });
  document.getElementById('startDateInput').addEventListener('change', function() { state.startDate = this.value; saveState(); updateDayCounter(); });
  document.getElementById('commitmentSlider').addEventListener('input', function() { state.commitment = parseInt(this.value); document.getElementById('commitmentDisplay').textContent = state.commitment; saveState(); });
  document.getElementById('rewardInput').addEventListener('change', function() { state.reward = this.value.trim(); saveState(); });
  document.getElementById('addMissionBtn').addEventListener('click', function() { addRow('missions'); });
  document.getElementById('addHabitBtn').addEventListener('click', function() { addRow('habits'); });
  document.getElementById('journalPrev').addEventListener('click', function() { navigateJournal(-1); });
  document.getElementById('journalNext').addEventListener('click', function() { navigateJournal(1); });
  document.getElementById('journalText').addEventListener('blur', saveJournal);
  document.getElementById('createHabitBtn').addEventListener('click', openNewHabitModal);
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', function(e) { if (e.target === this) closeModal(); });
  document.getElementById('modalSaveBtn').addEventListener('click', saveHabitModal);
  document.getElementById('createRewardBtn').addEventListener('click', createReward);
  document.getElementById('exportCSV').addEventListener('click', exportCSV);
  document.getElementById('exportExcel').addEventListener('click', exportExcel);
  document.getElementById('exportPDF').addEventListener('click', exportPDF);
  document.getElementById('resetData').addEventListener('click', resetAllData);
}

// ========== INIT ==========
function restoreFormFields() {
  document.getElementById('chapterInput').value = state.chapter || '';
  document.getElementById('startDateInput').value = state.startDate || '';
  document.getElementById('commitmentSlider').value = state.commitment;
  document.getElementById('commitmentDisplay').textContent = state.commitment;
  document.getElementById('rewardInput').value = state.reward || '';

  const catSel = document.getElementById('editHabitCategory');
  catSel.innerHTML = '';
  CATEGORIES.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; catSel.appendChild(o); });
}

function migrateState() {
  state.habits.forEach(h => { if (!h.icon) h.icon = '\u{1F4AA}'; if (!h.category) h.category = 'Health'; if (!h.frequency) h.frequency = 'daily'; if (!h.color) h.color = '#22C55E'; if (h.order === undefined) h.order = 0; if (!h.reminderTime) h.reminderTime = ''; });
  state.missions.forEach(m => { if (!m.days) m.days = {}; });
  state.archivedHabits.forEach(h => { if (!h.icon) h.icon = '\u{1F4AA}'; if (!h.category) h.category = 'Health'; if (!h.frequency) h.frequency = 'daily'; if (!h.color) h.color = '#22C55E'; });
  saveState();
}

function init() {
  loadState();
  migrateState();
  ensureDefaults();
  setupDefaultDates();
  generateDayHeaders();
  restoreFormFields();
  renderTable('missions');
  renderTable('habits');
  renderRatingsTable();
  updateDayCounter();
  const day = calculateCurrentDay();
  if (day !== null && day >= 1) currentJournalDay = Math.min(day, TOTAL_DAYS);
  renderJournal();
  updateProgress();
  updateXPDisplay();
  setupTabs();
  setupEventListeners();
  setupSettings();
  requestAnimationFrame(function() { checkAchievements(); renderChallenges(); renderRewards(); generateHeatmap(); updateStats(); });
  setupReminders();
}

document.addEventListener('DOMContentLoaded', init);
