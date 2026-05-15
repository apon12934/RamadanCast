// ─── RamadanCast Android App — main.js ───
// Modified from web version: offline TTS fallback via device native voice, no SW/PWA

// ─── Aladhan API Configuration ───
const API_BASE = 'https://api.aladhan.com/v1/timingsByCity';
const API_PARAMS = 'city=Dhaka&country=Bangladesh&method=1&tune=0,-1,0,0,0,2,2,0,0';

// ─── i18n Strings ───
const STRINGS = {
  en: {
    dateLabel: "Today's Date",
    sehriLabel: 'Next Sehri Ends At',
    iftarLabel: 'Next Iftar Starts At',
    countdownLabelSehri: 'Time until Sehri',
    countdownLabelIftar: 'Time until Iftar',
    langLabel: 'English',
    voiceOn: 'On',
    voiceOff: 'Off',
    noData: 'Waiting for next prayer time…',
    announceSehri: (min) => {
      if (min >= 60) { const h = Math.floor(min / 60), m = min % 60; return `${h} hour${h !== 1 ? 's' : ''}${m ? ` ${m} minute${m !== 1 ? 's' : ''}` : ''} remaining for Sehri.`; }
      return `Only ${min} minute${min !== 1 ? 's' : ''} remaining for Sehri.`;
    },
    announceIftar: (min) => {
      if (min >= 60) { const h = Math.floor(min / 60), m = min % 60; return `${h} hour${h !== 1 ? 's' : ''}${m ? ` ${m} minute${m !== 1 ? 's' : ''}` : ''} remaining for Iftar.`; }
      return `Only ${min} minute${min !== 1 ? 's' : ''} remaining for Iftar.`;
    },
    loading: 'Fetching prayer times…',
    apiError: 'Unable to sync live times. Please check your connection.',
    waitingTomorrow: 'Today\'s times have ended. Refreshing at midnight…',
    sehriEnded: 'Sehri time has ended. May Allah accept your fast.',
    iftarStarted: 'It\'s Iftar time! You may break your fast now.',
    phaseSwapLabel: 'Switch To',
    sehriPhaseLabel: 'Sehri',
    iftarPhaseLabel: 'Iftar',
  },
  bn: {
    dateLabel: 'আজকের তারিখ',
    sehriLabel: 'পরবর্তী সেহরি শেষ',
    iftarLabel: 'পরবর্তী ইফতার শুরু',
    countdownLabelSehri: 'সেহরির বাকি সময়',
    countdownLabelIftar: 'ইফতারের বাকি সময়',
    langLabel: 'বাংলা',
    voiceOn: 'চালু',
    voiceOff: 'বন্ধ',
    noData: 'পরবর্তী নামাজের সময় অপেক্ষা করছে…',
    announceSehri: (min) => {
      if (min >= 60) { const h = Math.floor(min / 60), m = min % 60; return `সেহরির আর ${h} ঘণ্টা${m ? ` ${m} মিনিট` : ''} বাকি আছে।`; }
      return `সেহরির আর মাত্র ${min} মিনিট বাকি আছে।`;
    },
    announceIftar: (min) => {
      if (min >= 60) { const h = Math.floor(min / 60), m = min % 60; return `ইফতারের আর ${h} ঘণ্টা${m ? ` ${m} মিনিট` : ''} বাকি আছে।`; }
      return `ইফতারের আর মাত্র ${min} মিনিট বাকি আছে।`;
    },
    loading: 'নামাজের সময় সংগ্রহ হচ্ছে…',
    apiError: 'সময় সিঙ্ক করা যায়নি। আপনার সংযোগ পরীক্ষা করুন।',
    waitingTomorrow: 'আজকের সময় শেষ হয়েছে। মধ্যরাতে রিফ্রেশ হবে…',
    sehriEnded: 'সেহরির সময় শেষ। আল্লাহ আপনার রোজা কবুল করুন।',
    iftarStarted: 'ইফতারের সময় হয়েছে! এখন রোজা ভাঙতে পারেন।',
    phaseSwapLabel: 'পরিবর্তন করুন',
    sehriPhaseLabel: 'সেহরি',
    iftarPhaseLabel: 'ইফতার',
  },
};

// ─── State ───
const state = {
  lang: 'bn',
  voiceEnabled: false,
  timerStarted: false,
  lastAnnouncedMinute: -1,
  phaseEndAnnounced: false,
  countdownInterval: null,
  targetTime: null,
  phase: 'sehri',
  isManualOverride: false,
  isLoading: true,
  apiError: null,
  sehriTime: null,
  iftarTime: null,
  sehriTimeStr: null,
  iftarTimeStr: null,
  hijriDate: null,
  nextHijriDate: null,
  midnightTimeout: null,
};

// ─── DOM Elements ───
const $ = (id) => document.getElementById(id);
const els = {};

// ─── Performance: display cache ───
let _prevH = '', _prevM = '', _prevS = '';
let _prevUrgent = null;
let _lastProgressMs = 0;

function cacheDom() {
  const ids = [
    'subtitle', 'dateLabel', 'currentDate', 'sehriLabel', 'sehriTime',
    'countdownLabel', 'countdownDisplay', 'hours', 'minutes', 'seconds',
    'statusMessage', 'progressBar', 'langToggle', 'voiceToggle',
    'currentLangLabel', 'voiceStatusLabel',
    'phaseSwapBtn', 'phaseSwapLabel', 'phaseCurrentLabel'
  ];
  ids.forEach((id) => { els[id] = $(id); });
}

// ─── Utilities ───
function pad(n) { return String(n).padStart(2, '0'); }

function formatDateDisplay(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatDateDisplayBn(date) {
  return date.toLocaleDateString('bn-BD', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function parseTimeForDate(timeStr, date) {
  const [h, m] = timeStr.split(':').map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0, 0);
}

function formatDateForAPI(date) {
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

// ─── Timings Cache (localStorage) ───
function getCachedTimings(dateStr) {
  try {
    const raw = localStorage.getItem('rc_timings_' + dateStr);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function setCachedTimings(dateStr, data) {
  try { localStorage.setItem('rc_timings_' + dateStr, JSON.stringify(data)); } catch {}
}

// ─── Aladhan API Fetch ───
async function fetchTodayTimings(date = new Date()) {
  state.isLoading = true;
  state.apiError = null;
  updateLoadingUI();

  try {
    const dateStr = formatDateForAPI(date);
    let apiData = getCachedTimings(dateStr);

    if (!apiData) {
      const response = await fetch(`${API_BASE}/${dateStr}?${API_PARAMS}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      if (json.code !== 200 || !json.data?.timings) throw new Error('Invalid API response');
      apiData = json.data;
      setCachedTimings(dateStr, apiData);
    }

    const { timings, date: apiDate } = apiData;

    state.sehriTimeStr = timings.Fajr;
    state.iftarTimeStr = timings.Maghrib;
    state.sehriTime = parseTimeForDate(state.sehriTimeStr, date);
    state.iftarTime = parseTimeForDate(state.iftarTimeStr, date);

    const today = new Date();
    const isToday = date.getFullYear() === today.getFullYear() &&
                    date.getMonth()    === today.getMonth()    &&
                    date.getDate()     === today.getDate();

    if (apiDate?.hijri) {
      let d = parseInt(apiDate.hijri.day) - 1;
      let m = apiDate.hijri.month.en;
      let mNum = parseInt(apiDate.hijri.month.number);
      let y = parseInt(apiDate.hijri.year);

      if (d <= 0) {
        d = 29;
        mNum = mNum - 1 === 0 ? 12 : mNum - 1;
        if (mNum === 8) m = 'Shaʿbān';
        if (mNum === 9) m = 'Ramaḍān';
        if (mNum === 12) y -= 1;
      }

      const parsed = { day: d, month: m, monthAr: apiDate.hijri.month.ar, monthNumber: mNum, year: y };
      if (isToday) {
        state.hijriDate = parsed;
      } else {
        state.nextHijriDate = parsed;
      }
    }

    state.isLoading = false;
    state.apiError = null;
    state.phaseEndAnnounced = false;

    determineAndSetPhase();
    updateLabels();
    updateCountdown();

    if (!state.targetTime && !state.isManualOverride) {
      const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      fetchTodayTimings(nextDay);
      return;
    }

  } catch (error) {
    state.isLoading = false;
    state.apiError = error.message;
    updateErrorUI();
  }

  scheduleMidnightRefresh();
}

// ─── Midnight Auto-Refresh ───
function scheduleMidnightRefresh() {
  if (state.midnightTimeout) clearTimeout(state.midnightTimeout);
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
  const msUntilMidnight = midnight - now;
  state.midnightTimeout = setTimeout(() => {
    state.lastAnnouncedMinute = -1;
    fetchTodayTimings();
  }, msUntilMidnight);
}

// ─── Phase Determination ───
function determineAndSetPhase() {
  const now = new Date();

  if (!state.isManualOverride && state.sehriTime && state.iftarTime) {
    if (now < state.sehriTime) {
      state.phase = 'sehri';
    } else if (now >= state.sehriTime && now < state.iftarTime) {
      state.phase = 'iftar';
    } else {
      state.phase = 'iftar';
    }
  }

  if (state.sehriTime && state.iftarTime) {
    if (state.phase === 'sehri') {
      if (now < state.sehriTime) {
        state.targetTime = state.sehriTime;
      } else if (state.isManualOverride) {
        state.targetTime = new Date(state.sehriTime.getTime() + 24 * 60 * 60 * 1000);
      } else {
        state.targetTime = null;
      }
    } else {
      if (now < state.iftarTime) {
        state.targetTime = state.iftarTime;
      } else if (state.isManualOverride) {
        state.targetTime = new Date(state.iftarTime.getTime() + 24 * 60 * 60 * 1000);
      } else {
        state.targetTime = null;
      }
    }
  } else {
    state.targetTime = null;
  }

  updateTheme();
}

// ─── UI: Loading State ───
function updateLoadingUI() {
  if (!els.hours) return;
  els.hours.textContent = '--';
  els.minutes.textContent = '--';
  els.seconds.textContent = '--';
  els.countdownDisplay.classList.add('loading-pulse');
  els.statusMessage.textContent = STRINGS[state.lang].loading;
  els.statusMessage.classList.remove('api-error');
}

// ─── UI: Error State ───
function updateErrorUI() {
  if (!els.hours) return;
  els.hours.textContent = '--';
  els.minutes.textContent = '--';
  els.seconds.textContent = '--';
  els.countdownDisplay.classList.remove('loading-pulse');
  els.statusMessage.textContent = STRINGS[state.lang].apiError;
  els.statusMessage.classList.add('api-error');
}

// ─── UI Updates ───
function buildSubtitle() {
  const today = new Date();
  const afterIftar = state.nextHijriDate &&
                     state.sehriTime &&
                     state.sehriTime.getDate() !== today.getDate();
  const h = afterIftar ? state.nextHijriDate : state.hijriDate;
  if (h && h.monthNumber === 9) {
    if (state.lang === 'bn') return `রমজান ${h.day}, ${h.year} • ঢাকা`;
    return `Ramadan ${h.day}, ${h.year} • Dhaka`;
  }
  if (h) {
    if (state.lang === 'bn') return `${h.month} ${h.day}, ${h.year} • ঢাকা`;
    return `${h.month} ${h.day}, ${h.year} • Dhaka`;
  }
  return state.lang === 'bn' ? 'ঢাকা' : 'Dhaka';
}

function updateLabels() {
  const s = STRINGS[state.lang];
  els.subtitle.textContent = buildSubtitle();
  els.dateLabel.textContent = s.dateLabel;
  els.sehriLabel.textContent = state.phase === 'sehri' ? s.sehriLabel : s.iftarLabel;
  els.countdownLabel.textContent = state.phase === 'sehri' ? s.countdownLabelSehri : s.countdownLabelIftar;
  els.currentLangLabel.textContent = s.langLabel;
  els.voiceStatusLabel.textContent = state.voiceEnabled ? s.voiceOn : s.voiceOff;
  
  if (els.phaseSwapLabel) {
    els.phaseSwapLabel.textContent = s.phaseSwapLabel;
    els.phaseCurrentLabel.textContent = state.phase === 'sehri' ? s.iftarPhaseLabel : s.sehriPhaseLabel;
    els.phaseCurrentLabel.classList.remove('text-emerald-400');
  }

  if (state.lang === 'bn') {
    document.body.classList.add('lang-bn');
  } else {
    document.body.classList.remove('lang-bn');
  }

  els.currentDate.textContent = state.lang === 'bn'
    ? formatDateDisplayBn(new Date())
    : formatDateDisplay(new Date());

  const timeStr = state.phase === 'sehri' ? state.sehriTimeStr : state.iftarTimeStr;
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    els.sehriTime.textContent = `${pad(h12)}:${pad(m)} ${period}`;
  }
}

function updateCountdown() {
  if (state.isLoading) return;

  if (!state.targetTime) {
    els.hours.textContent = '00';
    els.minutes.textContent = '00';
    els.seconds.textContent = '00';
    els.countdownDisplay.classList.remove('loading-pulse');
    els.countdownDisplay.classList.add('countdown-ended');
    els.countdownDisplay.classList.remove('countdown-urgent');
    els.statusMessage.textContent = STRINGS[state.lang].waitingTomorrow;
    els.statusMessage.classList.remove('api-error');
    els.progressBar.style.width = '100%';

    if (activeAudio) { activeAudio.pause(); activeAudio = null; }
    return;
  }

  const now = new Date();
  const diff = state.targetTime - now;

  if (diff <= 0) {
    if (state.isManualOverride) {
      els.hours.textContent = '00';
      els.minutes.textContent = '00';
      els.seconds.textContent = '00';
      els.countdownDisplay.classList.remove('loading-pulse');
      els.countdownDisplay.classList.add('countdown-ended');
      els.countdownDisplay.classList.remove('countdown-urgent');
      els.statusMessage.textContent = STRINGS[state.lang].waitingTomorrow;
      els.statusMessage.classList.remove('api-error');
      els.progressBar.style.width = '100%';
      return;
    }

    if (state.phase === 'sehri' && state.iftarTime && now < state.iftarTime) {
      if (state.voiceEnabled && !state.phaseEndAnnounced) {
        state.phaseEndAnnounced = true;
        speak(STRINGS[state.lang].sehriEnded);
      }
      state.phase = 'iftar';
      state.targetTime = state.iftarTime;
      state.lastAnnouncedMinute = -1;
      state.phaseEndAnnounced = false;
      _lastProgressMs = 0;
      updateLabels();
      updateTheme();
      return;
    }

    if (state.voiceEnabled && !state.phaseEndAnnounced) {
      state.phaseEndAnnounced = true;
      speak(STRINGS[state.lang].iftarStarted);
    }
    if (!state.isLoading) {
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      fetchTodayTimings(tomorrow);
    }
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const totalMin = Math.floor(diff / 60000);

  if (state.voiceEnabled && state.timerStarted && totalMin !== state.lastAnnouncedMinute && totalMin >= 0) {
    state.lastAnnouncedMinute = totalMin;
    const announceMin = totalMin + (diff % 60000 > 0 ? 1 : 0);
    speak(state.phase === 'sehri'
      ? STRINGS[state.lang].announceSehri(announceMin)
      : STRINGS[state.lang].announceIftar(announceMin));
  }

  if (document.hidden) return;

  els.countdownDisplay.classList.remove('loading-pulse');

  const hStr = pad(h), mStr = pad(m), sStr = pad(s);
  if (hStr !== _prevH) els.hours.textContent   = _prevH = hStr;
  if (mStr !== _prevM) els.minutes.textContent = _prevM = mStr;
  if (sStr !== _prevS) els.seconds.textContent = _prevS = sStr;

  if (els.statusMessage.textContent) {
    els.statusMessage.textContent = '';
    els.statusMessage.classList.remove('api-error');
  }

  const urgent = totalMin < 5;
  if (urgent !== _prevUrgent) {
    els.countdownDisplay.classList.toggle('countdown-urgent', urgent);
    els.countdownDisplay.classList.remove('countdown-ended');
    _prevUrgent = urgent;
  }

  const nowMs = now.getTime();
  if (nowMs - _lastProgressMs >= 5000) {
    const tMs = state.targetTime.getTime();
    const progress = Math.min(100, Math.max(0, ((nowMs - (tMs - 86400000)) / 86400000) * 100));
    els.progressBar.style.width = `${progress.toFixed(2)}%`;
    _lastProgressMs = nowMs;
  }
}

// ─── Voice System (Android: Cloud TTS → Device Native TTS fallback) ───
const GOOGLE_TTS_API_KEY = "AIzaSyBcHJfQxqnJ-2DjlRJqnLQhoySjfgLYVGo";
let activeAudio = null;
let speakGen = 0;

async function speak(text) {
  if (!state.voiceEnabled) return;

  const gen = ++speakGen;

  if (activeAudio) { activeAudio.pause(); activeAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  try {
    if (!GOOGLE_TTS_API_KEY) throw new Error('No API key');

    const voiceName = state.lang === 'bn' ? 'bn-IN-Wavenet-A' : 'en-US-Journey-O';
    const langCode  = state.lang === 'bn' ? 'bn-IN'           : 'en-US';

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: langCode, name: voiceName },
          audioConfig: { audioEncoding: 'MP3', pitch: 0, speakingRate: 1 },
        }),
      }
    );

    if (!res.ok) throw new Error(`Cloud TTS HTTP ${res.status}`);
    const data = await res.json();
    if (!data.audioContent) throw new Error('No audioContent');
    if (gen !== speakGen) return;

    activeAudio = new Audio('data:audio/mp3;base64,' + data.audioContent);
    activeAudio.onended = () => { activeAudio = null; };
    await activeAudio.play().catch(e => { if (e.name !== 'AbortError') throw e; });

  } catch (err) {
    // ─── OFFLINE FALLBACK: Use device native TTS (Android WebView SpeechSynthesis) ───
    if (gen !== speakGen) return;
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = state.lang === 'bn' ? 'bn-BD' : 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try to find the best matching voice
        const voices = window.speechSynthesis.getVoices();
        const targetLang = utterance.lang;
        const matchingVoice = voices.find(v => v.lang === targetLang) ||
                              voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
        if (matchingVoice) utterance.voice = matchingVoice;

        window.speechSynthesis.speak(utterance);
      }
    } catch (_) {
      // Device TTS also failed — stay silent
    }
  }
}

function updateTheme() {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (state.phase === 'iftar') {
    document.body.classList.remove('theme-sehri');
    document.body.classList.add('theme-iftar');
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#2a0a1a');
  } else {
    document.body.classList.remove('theme-iftar');
    document.body.classList.add('theme-sehri');
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#0c0a1a');
  }
}

// ─── Initialization ───
function init() {
  cacheDom();
  updateTheme();

  els.langToggle.checked = (state.lang === 'bn');
  els.voiceToggle.checked = state.voiceEnabled;

  updateLoadingUI();
  fetchTodayTimings();

  state.timerStarted = true;
  state.countdownInterval = setInterval(() => {
    updateCountdown();
  }, 1000);

  // ─── Event Listeners ───
  els.langToggle.addEventListener('change', (e) => {
    state.lang = e.target.checked ? 'bn' : 'en';
    state.lastAnnouncedMinute = -1;
    updateLabels();
    updateCountdown();
  });

  els.voiceToggle.addEventListener('change', (e) => {
    state.voiceEnabled = e.target.checked;
    els.voiceStatusLabel.textContent = state.voiceEnabled
      ? STRINGS[state.lang].voiceOn
      : STRINGS[state.lang].voiceOff;

    if (!state.voiceEnabled) {
      if (activeAudio) { activeAudio.pause(); activeAudio = null; }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    if (state.voiceEnabled) {
      state.lastAnnouncedMinute = -1;
      updateCountdown();
    }
  });

  if (els.phaseSwapBtn) {
    els.phaseSwapBtn.addEventListener('click', () => {
      state.isManualOverride = !state.isManualOverride;
      if (state.isManualOverride) {
        state.phase = state.phase === 'sehri' ? 'iftar' : 'sehri';
      }
      determineAndSetPhase();
      state.lastAnnouncedMinute = -1;
      state.phaseEndAnnounced = false;
      _lastProgressMs = 0;
      updateLabels();
      updateCountdown();
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      _prevH = _prevM = _prevS = '';
      _prevUrgent = null;
      _lastProgressMs = 0;
      state.lastAnnouncedMinute = -1;
      updateCountdown();
    }
  });
}

// ─── Boot ───
document.addEventListener('DOMContentLoaded', init);
