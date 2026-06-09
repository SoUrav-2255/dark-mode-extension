// Dark Mode Extension - Content Script
// Injected into every page to apply/remove dark mode styles

const STYLE_ID = 'dark-mode-extension-style';

const DARK_MODE_CSS = `
  :root {
    --dm-bg: #121212 !important;
    --dm-surface: #1e1e1e !important;
    --dm-text: #e8e8e8 !important;
    --dm-text-muted: #aaaaaa !important;
    --dm-border: #333333 !important;
    --dm-link: #7ab4f5 !important;
  }

  html, body {
    background-color: #121212 !important;
    color: #e8e8e8 !important;
  }

  *:not(img):not(video):not(canvas):not(svg):not(iframe) {
    background-color: inherit;
    border-color: #333333 !important;
  }

  /* Backgrounds */
  body *, div, section, article, aside, main, header, footer, nav,
  form, fieldset, table, thead, tbody, tr, td, th,
  ul, ol, li, dl, dt, dd, blockquote, figure, figcaption,
  .container, .wrapper, .box, .card, .panel, .sidebar, .content {
    background-color: #1a1a1a !important;
    color: #e8e8e8 !important;
  }

  /* Text */
  p, span, h1, h2, h3, h4, h5, h6, label, legend,
  strong, em, b, i, small, big, sub, sup, abbr, cite,
  code, pre, kbd, samp, var, time, address, caption,
  summary, figcaption, dt, dd, li {
    color: #e8e8e8 !important;
  }

  /* Headings slightly brighter */
  h1, h2, h3 {
    color: #ffffff !important;
  }

  /* Links */
  a, a:visited {
    color: #7ab4f5 !important;
  }
  a:hover {
    color: #a8ccff !important;
  }

  /* Inputs, Selects, Textareas */
  input, textarea, select, button,
  [type="text"], [type="email"], [type="password"],
  [type="search"], [type="number"], [type="url"],
  [type="tel"], [type="date"], [type="time"] {
    background-color: #2a2a2a !important;
    color: #e8e8e8 !important;
    border: 1px solid #444 !important;
    caret-color: #e8e8e8 !important;
  }

  input::placeholder, textarea::placeholder {
    color: #888 !important;
  }

  /* Buttons */
  button, [role="button"], input[type="button"],
  input[type="submit"], input[type="reset"] {
    background-color: #2d2d2d !important;
    color: #e8e8e8 !important;
    border: 1px solid #555 !important;
  }

  button:hover, [role="button"]:hover {
    background-color: #383838 !important;
  }

  /* Tables */
  table {
    background-color: #1a1a1a !important;
    border-color: #333 !important;
  }
  th {
    background-color: #242424 !important;
    color: #ffffff !important;
  }
  tr:nth-child(even) {
    background-color: #202020 !important;
  }

  /* Images — invert slightly for readability */
  img {
    filter: brightness(0.92) !important;
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 8px !important;
    height: 8px !important;
  }
  ::-webkit-scrollbar-track {
    background: #1a1a1a !important;
  }
  ::-webkit-scrollbar-thumb {
    background: #444 !important;
    border-radius: 4px !important;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #555 !important;
  }

  /* Selection */
  ::selection {
    background: #2a5a8a !important;
    color: #ffffff !important;
  }

  /* Code blocks */
  code, pre {
    background-color: #0d1117 !important;
    color: #c9d1d9 !important;
    border: 1px solid #30363d !important;
    border-radius: 4px !important;
  }

  /* Borders */
  hr {
    border-color: #333 !important;
  }

  /* Shadows — reduce harshness */
  * {
    box-shadow: none !important;
    text-shadow: none !important;
  }
`;

// --- Helpers ---

function getStyle() {
  return document.getElementById(STYLE_ID);
}

function injectStyle(brightness = 100, contrast = 100) {
  let style = getStyle();
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.documentElement.appendChild(style);
  }
  style.textContent = DARK_MODE_CSS;

  // Apply brightness/contrast via a top-level filter on html
  let filterStyle = document.getElementById(STYLE_ID + '-filter');
  if (!filterStyle) {
    filterStyle = document.createElement('style');
    filterStyle.id = STYLE_ID + '-filter';
    document.documentElement.appendChild(filterStyle);
  }
  filterStyle.textContent = `html { filter: brightness(${brightness}%) contrast(${contrast}%) !important; }`;
}

function removeStyle() {
  const style = getStyle();
  if (style) style.remove();
  const filterStyle = document.getElementById(STYLE_ID + '-filter');
  if (filterStyle) filterStyle.remove();
}

// --- Apply state on load ---

chrome.storage.local.get(['siteEnabled', 'globalEnabled', 'brightness', 'contrast'], (data) => {
  const hostname = location.hostname;
  const siteKey = 'site_' + hostname;

  const globalEnabled = data.globalEnabled ?? false;
  const brightness = data.brightness ?? 100;
  const contrast = data.contrast ?? 100;

  // Check per-site override if it exists
  chrome.storage.local.get([siteKey], (siteData) => {
    const siteOverride = siteData[siteKey];
    const isEnabled = siteOverride !== undefined ? siteOverride : globalEnabled;

    if (isEnabled) {
      injectStyle(brightness, contrast);
    }
  });
});

// --- Listen for messages from popup ---

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'enable') {
    injectStyle(msg.brightness ?? 100, msg.contrast ?? 100);
    sendResponse({ ok: true });
  } else if (msg.action === 'disable') {
    removeStyle();
    sendResponse({ ok: true });
  } else if (msg.action === 'updateFilters') {
    if (getStyle()) {
      injectStyle(msg.brightness ?? 100, msg.contrast ?? 100);
    }
    sendResponse({ ok: true });
  } else if (msg.action === 'getStatus') {
    sendResponse({ active: !!getStyle() });
  }
  return true;
});
