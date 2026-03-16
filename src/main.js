// ─── Aladhan API Configuration ───
const API_BASE = 'https://api.aladhan.com/v1/timingsByCity';
// method=1 is Karachi (closest to South Asia), tune applies IFB exact offsets: Fajr -1 min (Sehri), Maghrib/Sunset +2 min (Iftar)
const API_PARAMS = 'city=Dhaka&country=Bangladesh&method=1&tune=0,-1,0,0,0,2,2,0,0';

// ─── i18n Strings ───
const STRINGS = {
  en: {
    dateLabel: "Today's Date",
    sehriLabel: 'Sehri Ends At',
    iftarLabel: 'Iftar Starts At',
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
    phaseSwapLabel: 'Switch To',
    sehriPhaseLabel: 'Sehri',
    iftarPhaseLabel: 'Iftar',
  },
  bn: {
    dateLabel: 'আজকের তারিখ',
    sehriLabel: 'সেহরি শেষ',
    iftarLabel: 'ইফতার শুরু',
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
    phaseSwapLabel: 'পরিবর্তন করুন',
    sehriPhaseLabel: 'সেহরি',
    iftarPhaseLabel: 'ইফতার',
  },
};

// ─── State ───
const state = {
  lang: 'bn',
  voiceEnabled: true,
  timerStarted: false,
  lastAnnouncedMinute: -1,
  countdownInterval: null,
  targetTime: null,
  phase: 'sehri', // 'sehri' or 'iftar'
  isManualOverride: false, // true if user toggled the button
  isLoading: true,
  apiError: null,
  // Live API data
  sehriTime: null,    // Date object
  iftarTime: null,    // Date object
  sehriTimeStr: null, // "HH:MM" string
  iftarTimeStr: null, // "HH:MM" string
  hijriDate: null,    // { day, month, year, monthEn }
  gregorianDate: null,
  midnightTimeout: null,
};

// ─── DOM Elements ───
const $ = (id) => document.getElementById(id);
const els = {};

function cacheDom() {
  const ids = [
    'subtitle', 'dateLabel', 'currentDate', 'sehriLabel', 'sehriTime',
    'countdownLabel', 'countdownDisplay', 'hours', 'minutes', 'seconds',
    'statusMessage', 'progressBar', 'langToggle', 'voiceToggle',
    'currentLangLabel', 'voiceStatusLabel', 'welcomeOverlay', 'startExperienceBtn',
    'installBtn', 'phaseSwapBtn', 'phaseSwapLabel', 'phaseCurrentLabel'
  ];
  ids.forEach((id) => { els[id] = $(id); });
}

// ─── Utilities ───
function pad(n) {
  return String(n).padStart(2, '0');
}

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

/**
 * Parse a "HH:MM" time string into a Date object for today.
 */
function parseTimeForDate(timeStr, date) {
  const [h, m] = timeStr.split(':').map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0, 0);
}

function formatDateForAPI(date) {
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

// ─── Aladhan API Fetch ───
async function fetchTodayTimings(date = new Date()) {
  state.isLoading = true;
  state.apiError = null;
  updateLoadingUI();

  try {
    const response = await fetch(`${API_BASE}/${formatDateForAPI(date)}?${API_PARAMS}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();

    if (json.code !== 200 || !json.data?.timings) {
      throw new Error('Invalid API response');
    }

    const { timings, date: apiDate } = json.data;

    // Parse times (using IFB Tuned Times)
    state.sehriTimeStr = timings.Fajr;  // IFB Sehri is Fajr time tuned by -1 min
    state.iftarTimeStr = timings.Maghrib; // IFB Iftar is Maghrib time tuned by +2 min
    state.sehriTime = parseTimeForDate(state.sehriTimeStr, date);
    state.iftarTime = parseTimeForDate(state.iftarTimeStr, date);

    // Parse Hijri date - Bangladesh moon sighting is typically 1 day behind API default
    if (apiDate?.hijri) {
      let d = parseInt(apiDate.hijri.day) - 1;
      let m = apiDate.hijri.month.en;
      let mNum = parseInt(apiDate.hijri.month.number);
      let y = parseInt(apiDate.hijri.year);

      // Handle underflow if it is the 1st of the month
      if (d <= 0) {
        d = 29; // Rough fallback, assume previous month has 29 days
        mNum = mNum - 1 === 0 ? 12 : mNum - 1;
        if (mNum === 8) m = 'Shaʿbān';
        if (mNum === 9) m = 'Ramaḍān';
        if (mNum === 12) y -= 1;
      }

      state.hijriDate = {
        day: d,
        month: m,
        monthAr: apiDate.hijri.month.ar,
        monthNumber: mNum,
        year: y,
      };
    }

    // Parse Gregorian date
    if (apiDate?.gregorian) {
      const g = apiDate.gregorian;
      state.gregorianDate = new Date(
        Number(g.year), Number(g.month.number) - 1, Number(g.day)
      );
    } else {
      state.gregorianDate = new Date();
    }

    state.isLoading = false;
    state.apiError = null;

    console.log(`[API] Fetched: Sehri=${state.sehriTimeStr}, Iftar=${state.iftarTimeStr}`);

    // Determine the active phase and start/continue countdown
    determineAndSetPhase();
    updateLabels();
    updateCountdown();

    // Both times already passed — chain straight to next day without waiting for midnight
    if (!state.targetTime && !state.isManualOverride) {
      const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      fetchTodayTimings(nextDay);
      return;
    }

  } catch (error) {
    console.error('[API] Fetch failed:', error);
    state.isLoading = false;
    state.apiError = error.message;
    updateErrorUI();
  }

  // Schedule next fetch at midnight
  scheduleMidnightRefresh();
}

// ─── Midnight Auto-Refresh ───
function scheduleMidnightRefresh() {
  if (state.midnightTimeout) clearTimeout(state.midnightTimeout);

  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5); // 5 seconds past midnight for safety
  const msUntilMidnight = midnight - now;

  console.log(`[Refresh] Scheduled in ${Math.round(msUntilMidnight / 60000)} minutes (at midnight).`);

  state.midnightTimeout = setTimeout(() => {
    console.log('[Refresh] Midnight reached — re-fetching prayer times.');
    state.lastAnnouncedMinute = -1;
    fetchTodayTimings();
  }, msUntilMidnight);
}

// ─── Phase Determination (API-driven) ───
function determineAndSetPhase() {
  const now = new Date();

  // If not manually checking the other phase, follow strict auto logic
  if (!state.isManualOverride && state.sehriTime && state.iftarTime) {
    if (now < state.sehriTime) {
      state.phase = 'sehri';
    } else if (now >= state.sehriTime && now < state.iftarTime) {
      state.phase = 'iftar';
    } else {
      // Both times have passed today — waiting for tomorrow
      state.phase = 'iftar'; // Keep iftar theme until midnight
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
  if (!els.hours) return; // DOM not ready yet
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
  const h = state.hijriDate;
  if (h && h.monthNumber === 9) {
    // It's Ramadan!
    if (state.lang === 'bn') {
      return `রমজান ${h.day}, ${h.year} • ঢাকা`;
    }
    return `Ramadan ${h.day}, ${h.year} • Dhaka`;
  }
  // Not Ramadan — show generic Hijri info
  if (h) {
    if (state.lang === 'bn') {
      return `${h.month} ${h.day}, ${h.year} • ঢাকা`;
    }
    return `${h.month} ${h.day}, ${h.year} • Dhaka`;
  }
  return state.lang === 'bn' ? 'ঢাকা' : 'Dhaka';
}

function updateLabels() {
  const s = STRINGS[state.lang];
  els.subtitle.textContent = buildSubtitle();
  els.dateLabel.textContent = s.dateLabel;
  els.sehriLabel.textContent = state.phase === 'sehri' ? s.iftarLabel : s.sehriLabel;
  els.countdownLabel.textContent = state.phase === 'sehri' ? s.countdownLabelSehri : s.countdownLabelIftar;
  els.currentLangLabel.textContent = s.langLabel;
  els.voiceStatusLabel.textContent = state.voiceEnabled ? s.voiceOn : s.voiceOff;
  
  if (els.phaseSwapLabel) {
    els.phaseSwapLabel.textContent = s.phaseSwapLabel;
    // The button displays the OPPOSITE phase (the one you switch *to*)
    els.phaseCurrentLabel.textContent = state.phase === 'sehri' ? s.iftarPhaseLabel : s.sehriPhaseLabel;
    els.phaseCurrentLabel.classList.remove('text-emerald-400');
  }

  // Toggle body font based on language
  if (state.lang === 'bn') {
    document.body.classList.add('lang-bn');
  } else {
    document.body.classList.remove('lang-bn');
  }

  // Update date display
  if (state.gregorianDate) {
    els.currentDate.textContent = state.lang === 'bn'
      ? formatDateDisplayBn(state.gregorianDate)
      : formatDateDisplay(state.gregorianDate);
  }

  // Update the time display for the active phase
  const timeStr = state.phase === 'sehri' ? state.iftarTimeStr : state.sehriTimeStr;
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    els.sehriTime.textContent = `${pad(h12)}:${pad(m)} ${period}`;
  }
}

function updateCountdown() {
  if (state.isLoading) return; // Don't update during loading

  if (!state.targetTime) {
    // Both times have passed for today
    els.hours.textContent = '00';
    els.minutes.textContent = '00';
    els.seconds.textContent = '00';
    els.countdownDisplay.classList.remove('loading-pulse');
    els.countdownDisplay.classList.add('countdown-ended');
    els.countdownDisplay.classList.remove('countdown-urgent');
    els.statusMessage.textContent = STRINGS[state.lang].waitingTomorrow;
    els.statusMessage.classList.remove('api-error');
    els.progressBar.style.width = '100%';

    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }
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

    // Phase ended — transition to next phase
    if (state.phase === 'sehri' && state.iftarTime && now < state.iftarTime) {
      // Sehri ended, switch to Iftar countdown
      state.phase = 'iftar';
      state.targetTime = state.iftarTime;
      state.lastAnnouncedMinute = -1;
      updateLabels();
      updateTheme();
      return; // next tick picks it up
    }

    // Iftar ended — chain to next day immediately
    if (!state.isLoading) {
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      fetchTodayTimings(tomorrow);
    }
    return;
  }

  els.countdownDisplay.classList.remove('loading-pulse');

  const totalSeconds = Math.floor(diff / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  els.hours.textContent = pad(h);
  els.minutes.textContent = pad(m);
  els.seconds.textContent = pad(s);

  // Status message (keep it blank for minimal elegant look)
  els.statusMessage.textContent = '';
  els.statusMessage.classList.remove('api-error');

  // Urgent mode (< 5 minutes)
  const totalMin = Math.floor(diff / 60000);
  if (totalMin < 5) {
    els.countdownDisplay.classList.add('countdown-urgent');
    els.countdownDisplay.classList.remove('countdown-ended');
  } else {
    els.countdownDisplay.classList.remove('countdown-urgent');
    els.countdownDisplay.classList.remove('countdown-ended');
  }

  // Progress bar
  const windowStart = new Date(state.targetTime.getTime() - 12 * 60 * 60 * 1000);
  const totalDuration = state.targetTime - windowStart;
  const elapsed = now - windowStart;
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  els.progressBar.style.width = `${progress}%`;

  // Voice announcement (every 1 minute)
  if (state.voiceEnabled && state.timerStarted && totalMin !== state.lastAnnouncedMinute && totalMin >= 0) {
    state.lastAnnouncedMinute = totalMin;
    const announceMin = totalMin + (diff % 60000 > 0 ? 1 : 0); // round up: 46:59 → "47 mins"
    const announceStr = state.phase === 'sehri'
      ? STRINGS[state.lang].announceSehri(announceMin)
      : STRINGS[state.lang].announceIftar(announceMin);
    speak(announceStr);
  }
}

// ─── Voice System ───
const GOOGLE_TTS_API_KEY = "AIzaSyBcHJfQxqnJ-2DjlRJqnLQhoySjfgLYVGo";
let activeAudio = null;
let speakGen = 0;

async function speak(text) {
  if (!state.voiceEnabled) return;

  const gen = ++speakGen;

  if (activeAudio) { activeAudio.pause(); activeAudio = null; }

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
    if (gen !== speakGen) return;
    console.warn('[TTS] Cloud failed, using fallback:', err.message);
    try {
      const langCode = state.lang === 'bn' ? 'bn-BD' : 'en-US';
      const url = `/api/tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodeURIComponent(text)}`;
      activeAudio = new Audio(url);
      activeAudio.onended = () => { activeAudio = null; };
      await activeAudio.play().catch(e => { if (e.name !== 'AbortError') throw e; });
    } catch (fallbackErr) {
      console.error('[TTS] Fallback also failed:', fallbackErr);
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

  // Synchronize UI Toggles with Initial State
  els.langToggle.checked = (state.lang === 'bn');
  els.voiceToggle.checked = state.voiceEnabled;

  // Show loading state immediately
  updateLoadingUI();

  // Fetch today's prayer times from API
  fetchTodayTimings();

  // ─── Automatic Activation ───
  state.timerStarted = true;
  state.countdownInterval = setInterval(() => {
    updateCountdown();
  }, 1000);

  // ─── Premium Welcome Experience (Audio Unlock) ───
  els.startExperienceBtn.addEventListener('click', () => {
    console.log("Audio system unlocked via Welcome Overlay.");

    els.welcomeOverlay.classList.add('fade-out');

    setTimeout(() => {
      els.welcomeOverlay.remove();
    }, 1000);

    if (state.voiceEnabled) {
      state.lastAnnouncedMinute = -1;
      updateCountdown();
    }
  }, { once: true });

  // ─── Event Listeners ───

  // Language toggle
  els.langToggle.addEventListener('change', (e) => {
    state.lang = e.target.checked ? 'bn' : 'en';
    state.lastAnnouncedMinute = -1;
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

    if (state.voiceEnabled) {
      state.lastAnnouncedMinute = -1;
      updateCountdown();
    }
  });

  // Phase Swap button
  if (els.phaseSwapBtn) {
    els.phaseSwapBtn.addEventListener('click', () => {
      // Toggle manual override
      state.isManualOverride = !state.isManualOverride;
      
      if (state.isManualOverride) {
        // Switch to the opposite phase manually
        state.phase = state.phase === 'sehri' ? 'iftar' : 'sehri';
      }

      
      determineAndSetPhase();
      state.lastAnnouncedMinute = -1;
      updateLabels();
      updateCountdown();
    });
  }
}

// ─── PWA: Service Worker Registration ───
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registered successfully:', reg);
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration failed:', err);
      });
  });
} else {
  console.warn('[PWA] Service Worker not supported in this browser');
}

// ─── PWA: Install Prompt (Browser Popup & Custom Button) ───
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[PWA] beforeinstallprompt event fired - install prompt available');
  e.preventDefault();
  deferredPrompt = e;
  if (els.installBtn) {
    els.installBtn.classList.remove('hidden');
    els.installBtn.classList.add('flex');

    els.installBtn.addEventListener('click', async () => {
      els.installBtn.classList.add('hidden');
      els.installBtn.classList.remove('flex');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
    });
  }
});

window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed successfully');
  if (els.installBtn) {
    els.installBtn.classList.add('hidden');
    els.installBtn.classList.remove('flex');
  }
  deferredPrompt = null;
});

// ─── Debugging: Check PWA Readiness ───
if (navigator.onLine !== undefined) {
  console.log('[PWA] Online status:', navigator.onLine ? 'Online' : 'Offline');
}

// ─── Boot ───
document.addEventListener('DOMContentLoaded', init);
