// Dark Mode Extension — Popup Script

const globalToggle    = document.getElementById('globalToggle');
const siteToggle      = document.getElementById('siteToggle');
const brightnessSlider = document.getElementById('brightnessSlider');
const contrastSlider  = document.getElementById('contrastSlider');
const brightnessVal   = document.getElementById('brightnessVal');
const contrastVal     = document.getElementById('contrastVal');
const slidersSection  = document.getElementById('slidersSection');
const siteHostname    = document.getElementById('siteHostname');
const siteDot         = document.getElementById('siteDot');
const resetBtn        = document.getElementById('resetBtn');
const enableAllBtn    = document.getElementById('enableAllBtn');

let currentHostname = '';
let currentTab = null;

// ── Init ─────────────────────────────────────────────────────────────

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  // Extract hostname safely
  try {
    currentHostname = new URL(tab.url).hostname;
  } catch {
    currentHostname = '';
  }

  siteHostname.textContent = currentHostname || 'N/A';
  const siteKey = 'site_' + currentHostname;

  chrome.storage.local.get(['globalEnabled', 'brightness', 'contrast', siteKey], (data) => {
    const globalEnabled = data.globalEnabled ?? false;
    const brightness    = data.brightness ?? 100;
    const contrast      = data.contrast   ?? 100;

    // Determine this-site state
    let siteEnabled;
    if (data[siteKey] !== undefined) {
      siteEnabled = data[siteKey];
    } else {
      siteEnabled = globalEnabled; // inherit global
    }

    globalToggle.checked = globalEnabled;
    siteToggle.checked   = siteEnabled;

    brightnessSlider.value = brightness;
    contrastSlider.value   = contrast;
    brightnessVal.textContent = brightness + '%';
    contrastVal.textContent   = contrast + '%';

    updateDot(siteEnabled);
    updateSliderState(siteEnabled);
  });
}

// ── Helpers ─────────────────────────────────────────────────────────

function updateDot(on) {
  siteDot.className = 'dot' + (on ? ' active' : '');
}

function updateSliderState(on) {
  slidersSection.className = 'sliders-section' + (on ? '' : ' dim');
}

function sendToTab(action, extra = {}) {
  if (!currentTab?.id) return;
  chrome.tabs.sendMessage(currentTab.id, { action, ...extra }).catch(() => {});
}

function getCurrentFilters() {
  return {
    brightness: parseInt(brightnessSlider.value),
    contrast:   parseInt(contrastSlider.value),
  };
}

// ── Global Toggle ────────────────────────────────────────────────────

globalToggle.addEventListener('change', () => {
  const enabled = globalToggle.checked;
  chrome.storage.local.set({ globalEnabled: enabled });

  // Reflect on site toggle if no explicit override
  const siteKey = 'site_' + currentHostname;
  chrome.storage.local.get([siteKey], (data) => {
    if (data[siteKey] === undefined) {
      // No per-site override, follow global
      siteToggle.checked = enabled;
      updateDot(enabled);
      updateSliderState(enabled);
      if (enabled) {
        sendToTab('enable', getCurrentFilters());
      } else {
        sendToTab('disable');
      }
    }
  });
});

// ── Site Toggle ──────────────────────────────────────────────────────

siteToggle.addEventListener('change', () => {
  const enabled = siteToggle.checked;
  const siteKey = 'site_' + currentHostname;

  // Save per-site override
  chrome.storage.local.set({ [siteKey]: enabled });

  updateDot(enabled);
  updateSliderState(enabled);

  if (enabled) {
    sendToTab('enable', getCurrentFilters());
  } else {
    sendToTab('disable');
  }
});

// ── Sliders ──────────────────────────────────────────────────────────

brightnessSlider.addEventListener('input', () => {
  const val = brightnessSlider.value;
  brightnessVal.textContent = val + '%';
  chrome.storage.local.set({ brightness: parseInt(val) });
  if (siteToggle.checked) {
    sendToTab('updateFilters', getCurrentFilters());
  }
});

contrastSlider.addEventListener('input', () => {
  const val = contrastSlider.value;
  contrastVal.textContent = val + '%';
  chrome.storage.local.set({ contrast: parseInt(val) });
  if (siteToggle.checked) {
    sendToTab('updateFilters', getCurrentFilters());
  }
});

// ── Reset Filters ────────────────────────────────────────────────────

resetBtn.addEventListener('click', () => {
  brightnessSlider.value = 100;
  contrastSlider.value   = 100;
  brightnessVal.textContent = '100%';
  contrastVal.textContent   = '100%';
  chrome.storage.local.set({ brightness: 100, contrast: 100 });
  if (siteToggle.checked) {
    sendToTab('updateFilters', { brightness: 100, contrast: 100 });
  }
});

// ── Enable All Sites ─────────────────────────────────────────────────

enableAllBtn.addEventListener('click', () => {
  chrome.storage.local.set({ globalEnabled: true });
  globalToggle.checked = true;
  siteToggle.checked   = true;
  updateDot(true);
  updateSliderState(true);
  sendToTab('enable', getCurrentFilters());
});

// ── Boot ─────────────────────────────────────────────────────────────
init();
