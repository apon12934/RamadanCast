// ─── Ramadan 2026 Sehri End & Iftar Start Times (Dhaka) ───
const RAMADAN_DATA = {
  '2026-02-19': { sehri: '05:12', iftar: '17:58' },
  '2026-02-20': { sehri: '05:11', iftar: '17:58' },
  '2026-02-21': { sehri: '05:11', iftar: '17:59' },
  '2026-02-22': { sehri: '05:10', iftar: '17:59' },
  '2026-02-23': { sehri: '05:09', iftar: '18:00' },
  '2026-02-24': { sehri: '05:08', iftar: '18:00' },
  '2026-02-25': { sehri: '05:08', iftar: '18:01' },
  '2026-02-26': { sehri: '05:07', iftar: '18:01' },
  '2026-02-27': { sehri: '05:06', iftar: '18:02' },
  '2026-02-28': { sehri: '05:05', iftar: '18:02' },
  '2026-03-01': { sehri: '05:05', iftar: '18:03' },
  '2026-03-02': { sehri: '05:04', iftar: '18:03' },
  '2026-03-03': { sehri: '05:03', iftar: '18:04' },
  '2026-03-04': { sehri: '05:02', iftar: '18:04' },
  '2026-03-05': { sehri: '05:01', iftar: '18:05' },
  '2026-03-06': { sehri: '05:00', iftar: '18:05' },
  '2026-03-07': { sehri: '04:59', iftar: '18:06' },
  '2026-03-08': { sehri: '04:58', iftar: '18:06' },
  '2026-03-09': { sehri: '04:57', iftar: '18:07' },
  '2026-03-10': { sehri: '04:57', iftar: '18:07' },
  '2026-03-11': { sehri: '04:56', iftar: '18:07' },
  '2026-03-12': { sehri: '04:55', iftar: '18:08' },
  '2026-03-13': { sehri: '04:54', iftar: '18:08' },
  '2026-03-14': { sehri: '04:53', iftar: '18:09' },
  '2026-03-15': { sehri: '04:52', iftar: '18:09' },
  '2026-03-16': { sehri: '04:51', iftar: '18:10' },
  '2026-03-17': { sehri: '04:50', iftar: '18:10' },
  '2026-03-18': { sehri: '04:49', iftar: '18:10' },
  '2026-03-19': { sehri: '04:48', iftar: '18:11' },
  '2026-03-20': { sehri: '04:47', iftar: '18:11' }
};

// ─── i18n Strings ───
const STRINGS = {
  en: {
    subtitle: 'Ramadan 2026 • Dhaka',
    dateLabel: "Today's Date",
    sehriLabel: 'Sehri Ends At',
    iftarLabel: 'Iftar Starts At',
    countdownLabelSehri: 'Time until Sehri',
    countdownLabelIftar: 'Time until Iftar',
    startBtn: 'Start Timer & Enable Audio',
    stopBtn: 'Timer Running — Tap to Stop',
    langLabel: 'English',
    voiceOn: 'On',
    voiceOff: 'Off',
    noData: 'No data for today',
    announceSehri: (min) => `Only ${min} minute${min !== 1 ? 's' : ''} remaining for Sehri.`,
    announceIftar: (min) => `Only ${min} minute${min !== 1 ? 's' : ''} remaining for Iftar.`,
    notRamadan: 'No Ramadan data found.',
  },
  bn: {
    subtitle: 'রমজান ২০২৬ • ঢাকা',
    dateLabel: 'আজকের তারিখ',
    sehriLabel: 'সেহরি শেষ',
    iftarLabel: 'ইফতার শুরু',
    countdownLabelSehri: 'সেহরির বাকি সময়',
    countdownLabelIftar: 'ইফতারের বাকি সময়',
    startBtn: 'টাইমার শুরু করুন ও অডিও চালু করুন',
    stopBtn: 'টাইমার চলছে — বন্ধ করতে চাপুন',
    langLabel: 'বাংলা',
    voiceOn: 'চালু',
    voiceOff: 'বন্ধ',
    noData: 'আজকের তথ্য নেই',
    announceSehri: (min) => `সেহরির আর মাত্র ${min} মিনিট বাকি আছে।`,
    announceIftar: (min) => `ইফতারের আর মাত্র ${min} মিনিট বাকি আছে।`,
    notRamadan: 'রমজানের তথ্য নেই।',
  },
};

// ─── State ───
let state = {
  lang: 'en',
  voiceEnabled: false,
  timerStarted: false,
  lastAnnouncedMinute: -1,
  countdownInterval: null,
  targetTime: null,
  activeDateKey: null,
  phase: 'sehri', // 'sehri' or 'iftar'
};

// ─── DOM Elements ───
const $ = (id) => document.getElementById(id);
const els = {};

function cacheDom() {
  const ids = [
    'subtitle', 'dateLabel', 'currentDate', 'sehriLabel', 'sehriTime',
    'countdownLabel', 'countdownDisplay', 'hours', 'minutes', 'seconds',
    'statusMessage', 'progressBar', 'langToggle', 'voiceToggle',
    'startBtn', 'startBtnText', 'currentLangLabel', 'voiceStatusLabel',
  ];
  ids.forEach((id) => { els[id] = $(id); });
}

// ─── Utilities ───
function pad(n) {
  return String(n).padStart(2, '0');
}

function getDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getTodayKey() {
  return getDateKey(new Date());
}

function getPhaseTime(dateKey, phase) {
  const data = RAMADAN_DATA[dateKey];
  if (!data) return null;
  const timeStr = phase === 'sehri' ? data.sehri : data.iftar;
  const [h, m] = timeStr.split(':').map(Number);
  const [y, mo, d] = dateKey.split('-').map(Number);
  return new Date(y, mo - 1, d, h, m, 0, 0);
}

function formatDateDisplay(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatDateDisplayBn(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('bn-BD', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ─── Find the active Ramadan phase ───
function determinePhase() {
  const now = new Date();
  const todayKey = getTodayKey();

  if (RAMADAN_DATA[todayKey]) {
    const sehriToday = getPhaseTime(todayKey, 'sehri');
    const iftarToday = getPhaseTime(todayKey, 'iftar');

    if (now < sehriToday) {
      return { dateKey: todayKey, phase: 'sehri', targetTime: sehriToday };
    } else if (now >= sehriToday && now < iftarToday) {
      return { dateKey: todayKey, phase: 'iftar', targetTime: iftarToday };
    }
  }

  // If today's Iftar has passed (or it's not today), find the NEXT available Sehri
  const dates = Object.keys(RAMADAN_DATA).sort();
  for (const dateKey of dates) {
    if (dateKey > todayKey) {
      return { dateKey, phase: 'sehri', targetTime: getPhaseTime(dateKey, 'sehri') };
    }
  }

  return { dateKey: null, phase: null, targetTime: null };
}

// ─── UI Updates ───
function updateLabels() {
  const s = STRINGS[state.lang];
  els.subtitle.textContent = s.subtitle;
  els.dateLabel.textContent = s.dateLabel;
  els.sehriLabel.textContent = state.phase === 'sehri' ? s.sehriLabel : s.iftarLabel;
  els.countdownLabel.textContent = state.phase === 'sehri' ? s.countdownLabelSehri : s.countdownLabelIftar;
  els.currentLangLabel.textContent = s.langLabel;
  els.voiceStatusLabel.textContent = state.voiceEnabled ? s.voiceOn : s.voiceOff;

  if (state.timerStarted) {
    els.startBtnText.textContent = s.stopBtn;
  } else {
    els.startBtnText.textContent = s.startBtn;
  }

  // Update date display
  if (state.activeDateKey) {
    els.currentDate.textContent = state.lang === 'bn'
      ? formatDateDisplayBn(state.activeDateKey)
      : formatDateDisplay(state.activeDateKey);

    const timeStr = state.phase === 'sehri' 
      ? RAMADAN_DATA[state.activeDateKey].sehri 
      : RAMADAN_DATA[state.activeDateKey].iftar;
      
    if (timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      els.sehriTime.textContent = `${pad(h12)}:${pad(m)} ${period}`;
    }
  }
}

function updateCountdown() {
  if (!state.targetTime) {
    els.hours.textContent = '00';
    els.minutes.textContent = '00';
    els.seconds.textContent = '00';
    els.statusMessage.textContent = STRINGS[state.lang].noData;
    return;
  }

  const now = new Date();
  const diff = state.targetTime - now;

  if (diff <= 0) {
    // Phase ended — instantly transition to next phase
    const nextPhaseObj = determinePhase();
    if (nextPhaseObj.dateKey && (nextPhaseObj.dateKey !== state.activeDateKey || nextPhaseObj.phase !== state.phase)) {
      state.activeDateKey = nextPhaseObj.dateKey;
      state.phase = nextPhaseObj.phase;
      state.targetTime = nextPhaseObj.targetTime;
      state.lastAnnouncedMinute = -1;
      updateLabels();
      updateTheme();
      return; // will pick up new countdown on next tick
    }

    // No more dates (Ramadan is over)
    els.hours.textContent = '00';
    els.minutes.textContent = '00';
    els.seconds.textContent = '00';
    els.countdownDisplay.classList.add('countdown-ended');
    els.countdownDisplay.classList.remove('countdown-urgent');
    els.statusMessage.textContent = STRINGS[state.lang].notRamadan;
    els.progressBar.style.width = '100%';

    // Stop voice
    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  els.hours.textContent = pad(h);
  els.minutes.textContent = pad(m);
  els.seconds.textContent = pad(s);

  // Status message (keep it blank for minimal elegant look)
  els.statusMessage.textContent = '';

  // Urgent mode (< 5 minutes)
  const totalMin = Math.floor(diff / 60000);
  if (totalMin < 5) {
    els.countdownDisplay.classList.add('countdown-urgent');
    els.countdownDisplay.classList.remove('countdown-ended');
  } else {
    els.countdownDisplay.classList.remove('countdown-urgent');
    els.countdownDisplay.classList.remove('countdown-ended');
  }

  // Progress bar: calculate progress across the 24hr or phase window
  // For simplicity, we calculate progress of the last 12 hours leading up to the target
  const windowStart = new Date(state.targetTime.getTime() - 12 * 60 * 60 * 1000);
  const totalDuration = state.targetTime - windowStart;
  const elapsed = now - windowStart;
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  els.progressBar.style.width = `${progress}%`;

  // Voice announcement (every 1 minute)
  if (state.voiceEnabled && state.timerStarted && totalMin !== state.lastAnnouncedMinute && totalMin >= 0) {
    state.lastAnnouncedMinute = totalMin;
    const announceStr = state.phase === 'sehri' 
      ? STRINGS[state.lang].announceSehri(totalMin)
      : STRINGS[state.lang].announceIftar(totalMin);
    speak(announceStr);
  }
}

// ─── Voice System (Unofficial Google TTS) ───
let activeAudio = null;

async function speak(text) {
  if (!state.voiceEnabled) return;

  // Cancel any currently playing audio
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }

  // Use natural-sounding language codes for the endpoint
  const langCode = state.lang === 'bn' ? 'bn-BD' : 'en-US';
  
  try {
    // Route through our local proxy (/api/tts) to bypass CORS blocks
    const url = `/api/tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodeURIComponent(text)}`;
    
    // Create Audio object directly with the URL to bypass fetch CORS limits.
    // The browser natively handles cross-origin media loading for <audio>.
    activeAudio = new Audio(url);
    
    // Clean up when done
    activeAudio.onended = () => {
      activeAudio = null;
    };
    
    await activeAudio.play().catch(e => {
      // Ignore abort errors caused by intentional interruptions (e.g., skip to next speech)
      if (e.name !== 'AbortError') throw e;
    });
  } catch (error) {
    console.error('TTS Playback failed:', error);
  }
}

function updateTheme() {
  if (state.phase === 'iftar') {
    document.body.classList.remove('theme-sehri');
    document.body.classList.add('theme-iftar');
  } else {
    document.body.classList.remove('theme-iftar');
    document.body.classList.add('theme-sehri');
  }
}

// ─── Initialization ───
function init() {
  cacheDom();

  // Determine active phase based on current time
  const currentPhase = determinePhase();
  state.activeDateKey = currentPhase.dateKey;
  state.phase = currentPhase.phase;
  state.targetTime = currentPhase.targetTime;

  updateTheme();
  updateLabels();
  updateCountdown(); // Initial display



  // ─── Event Listeners ───

  // Language toggle
  els.langToggle.addEventListener('change', (e) => {
    state.lang = e.target.checked ? 'bn' : 'en';
    state.lastAnnouncedMinute = -1; // Reset to allow re-announcement in new language
    updateLabels();
    updateCountdown();
  });

  // Voice toggle
  els.voiceToggle.addEventListener('change', (e) => {
    state.voiceEnabled = e.target.checked;
    els.voiceStatusLabel.textContent = state.voiceEnabled
      ? STRINGS[state.lang].voiceOn
      : STRINGS[state.lang].voiceOff;

    if (!state.voiceEnabled && activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }
  });

  // Start/Stop button
  els.startBtn.addEventListener('click', async () => {
    if (state.timerStarted) {
      // Stop
      state.timerStarted = false;
      if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
        state.countdownInterval = null;
      }
      if (activeAudio) {
        activeAudio.pause();
        activeAudio = null;
      }
      els.startBtn.classList.remove('active');
      updateLabels();
      return;
    }

    // Start
    state.timerStarted = true;
    state.lastAnnouncedMinute = -1;
    els.startBtn.classList.add('active');
    updateLabels();

    // (Removed redundant 'SehriCast activated' speech to prevent interrupting the time remaining announcement)

    // Start countdown interval
    state.countdownInterval = setInterval(() => {
      updateCountdown();
    }, 1000);

    updateCountdown();
  });
}

// ─── Boot ───
document.addEventListener('DOMContentLoaded', init);
