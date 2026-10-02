// Accessibility menu — West Sacramento Inclusive Sailing Foundation
// Self-contained: injects its own styles and markup, needs no other files
// except the two OpenDyslexic fonts in assets/ (loaded only when that
// option is switched on). Visitor choices are saved in localStorage under
// 'wsis_a11y' so they follow the visitor from page to page.
//
// It's loaded by the last few lines of cookie-consent.js, so every page
// that loads cookie-consent.js gets the menu automatically.

(function () {
  'use strict';
  if (window.__wsisA11yLoaded) return; // never load twice on one page
  window.__wsisA11yLoaded = true;

  var STORAGE_KEY = 'wsis_a11y';
  var STATEMENT_URL = 'privacy-and-accessibility.html#accessibility-statement';
  var root = document.documentElement;

  // ---------- Options ----------
  // levels: labels for each step after "Off". A single label = simple on/off.
  var OPTIONS = [
    { id: 'contrast',   label: 'Contrast',          levels: ['Dark', 'Light'] },
    { id: 'text',       label: 'Bigger text',       levels: ['Large', 'Larger', 'Largest'] },
    { id: 'spacing',    label: 'Text spacing',      levels: ['Light', 'Medium', 'Wide'] },
    { id: 'lineheight', label: 'Line height',       levels: ['1.8', '2.0', '2.4'] },
    { id: 'links',      label: 'Highlight links',   levels: ['On'] },
    { id: 'dyslexia',   label: 'Dyslexia friendly', levels: ['On'] },
    { id: 'pause',      label: 'Pause animations',  levels: ['On'] },
    { id: 'images',     label: 'Hide images',       levels: ['On'] },
    { id: 'cursor',     label: 'Big cursor',        levels: ['On'] },
    { id: 'guide',      label: 'Reading guide',     levels: ['On'] },
    { id: 'saturation', label: 'Saturation',        levels: ['Low', 'None', 'High'] },
    { id: 'align',      label: 'Text align',        levels: ['Left', 'Center', 'Right'] }
  ];
  var TEXT_SCALE = [1, 1.15, 1.3, 1.5];

  var ICONS = {
    contrast:   '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/>',
    text:       '<path d="M3 7V5h9v2M7.5 5v14M5.5 19h4"/><path d="M14 11V9.5h7V11M17.5 9.5V19M16 19h3"/>',
    spacing:    '<path d="M3 12h18M6 9l-3 3 3 3M18 9l3 3-3 3"/><path d="M8 5h8M8 19h8" stroke-dasharray="2 2"/>',
    lineheight: '<path d="M10 6h11M10 12h11M10 18h11"/><path d="M5 4v16M3 6l2-2 2 2M3 18l2 2 2-2"/>',
    links:      '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    dyslexia:   '<path d="M4 19V5h3.5a7 7 0 0 1 0 14z"/><path d="M15 19V8.5a3 3 0 0 1 3-3h1.5M13 11h6"/>',
    pause:      '<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>',
    images:     '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/><path d="M4 4l16 16"/>',
    cursor:     '<path d="M5 3l6.5 17 2.5-7 7-2.5z"/>',
    guide:      '<path d="M3 6h18M3 18h18"/><rect x="2" y="10" width="20" height="4" rx="1" fill="currentColor" stroke="none"/>',
    saturation: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M12 20a6 6 0 0 1-6-6" stroke-opacity=".5"/>',
    align:      '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>',
    person:     '<circle cx="12" cy="4.2" r="2"/><path d="M4 8.2c2.6.9 5.3 1.3 8 1.3s5.4-.4 8-1.3"/><path d="M9.2 9.3 9.6 14l-2 7M14.8 9.3 14.4 14l2 7M9.6 14h4.8"/>',
    close:      '<path d="M6 6l12 12M18 6 6 18"/>',
    reset:      '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>'
  };
  function icon(name, size) {
    return '<svg viewBox="0 0 24 24" width="' + (size || 24) + '" height="' + (size || 24) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICONS[name] + '</svg>';
  }

  // ---------- Saved state ----------
  var state = {};
  function load() {
    try { state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { state = {}; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ---------- Page styles (everything outside the menu itself) ----------
  // NOT keeps every rule away from the menu so it stays usable in any mode.
  var NOT = ':not(#wsis-a11y):not(#wsis-a11y *)';
  var ALL = 'body *' + NOT;
  var cursorSvg = function (fill) {
    return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M8 4v36l9-8.5 6.5 14 6-2.8-6.3-13.7H36z' fill='" + fill + "' stroke='%23fff' stroke-width='2.5' stroke-linejoin='round'/%3E%3C/svg%3E\") 8 4";
  };

  var pageCss = [
    "@font-face{font-family:'OpenDyslexic';src:url('assets/OpenDyslexic-Regular.woff2') format('woff2');font-weight:400;font-display:swap}",
    "@font-face{font-family:'OpenDyslexic';src:url('assets/OpenDyslexic-Bold.woff2') format('woff2');font-weight:700;font-display:swap}",

    // Contrast: dark
    'html.a11y-contrast-1 body,html.a11y-contrast-1 ' + ALL + '{background-color:#000!important;color:#fff!important;background-image:none!important;box-shadow:none!important;text-shadow:none!important}',
    'html.a11y-contrast-1 body a' + NOT + ',html.a11y-contrast-1 body a' + NOT + ' *{color:#FFE600!important}',
    'html.a11y-contrast-1 body a' + NOT + '{text-decoration:underline!important}',
    'html.a11y-contrast-1 body .btn' + NOT + '{border-color:#FFE600!important}',
    // Contrast: light
    'html.a11y-contrast-2 body,html.a11y-contrast-2 ' + ALL + '{background-color:#fff!important;color:#000!important;background-image:none!important;box-shadow:none!important;text-shadow:none!important}',
    'html.a11y-contrast-2 body a' + NOT + ',html.a11y-contrast-2 body a' + NOT + ' *{color:#0033A0!important}',
    'html.a11y-contrast-2 body a' + NOT + '{text-decoration:underline!important}',
    'html.a11y-contrast-2 body .btn' + NOT + '{border-color:#0033A0!important}',
    // Only real outlines get recolored, so hidden borders don't suddenly appear
    'html.a11y-contrast-1 body :is(.btn,.board-card,.tier-card,.next-step-card,.sponsor-wordmark,input,textarea,select)' + NOT + '{border:2px solid #fff!important}',
    'html.a11y-contrast-2 body :is(.btn,.board-card,.tier-card,.next-step-card,.sponsor-wordmark,input,textarea,select)' + NOT + '{border:2px solid #000!important}',
    // Logos with transparent backgrounds stay readable in either mode
    'html[class*="a11y-contrast-"] .sponsor-logo{background:#fff!important;padding:8px!important;border-radius:6px}',

    // Bigger text (the site's sizes are in rem, so scaling the root scales everything)
    'html.a11y-text{font-size:calc(100% * var(--a11y-text-scale))!important}',
    'html.a11y-text body{font-size:calc(17px * var(--a11y-text-scale))!important}',

    // Text spacing (level 3 matches WCAG 1.4.12 text-spacing values)
    'html.a11y-spacing-1 ' + ALL + '{letter-spacing:.04em!important;word-spacing:.08em!important}',
    'html.a11y-spacing-2 ' + ALL + '{letter-spacing:.08em!important;word-spacing:.12em!important}',
    'html.a11y-spacing-3 ' + ALL + '{letter-spacing:.12em!important;word-spacing:.16em!important}',
    'html.a11y-spacing-3 body p' + NOT + '{margin-bottom:2em!important}',

    // Line height
    'html.a11y-lineheight-1 body,html.a11y-lineheight-1 ' + ALL + '{line-height:1.8!important}',
    'html.a11y-lineheight-2 body,html.a11y-lineheight-2 ' + ALL + '{line-height:2!important}',
    'html.a11y-lineheight-3 body,html.a11y-lineheight-3 ' + ALL + '{line-height:2.4!important}',

    // Highlight links
    'html.a11y-links-1 body a' + NOT + '{background:#FFE600!important;color:#000!important;text-decoration:underline!important;outline:2px solid #000!important;outline-offset:2px!important}',
    'html.a11y-links-1 body a' + NOT + ' *{color:#000!important}',

    // Dyslexia friendly
    "html.a11y-dyslexia-1 " + ALL + "{font-family:'OpenDyslexic',Verdana,sans-serif!important}",

    // Pause animations
    'html.a11y-pause-1{scroll-behavior:auto!important}',
    'html.a11y-pause-1 *,html.a11y-pause-1 *::before,html.a11y-pause-1 *::after{animation:none!important;transition:none!important}',

    // Hide images (logos stay so visitors still know whose site this is)
    'html.a11y-images-1 body img' + NOT + ':not(.brand-logo):not(.footer-logo):not(.sponsor-logo){display:none!important}',
    'html.a11y-images-1 ' + ALL + '{background-image:none!important}',
    // Photo headers keep a solid navy so their light text stays readable
    'html.a11y-images-1 body .hero{background-color:#08253F!important}',

    // Big cursor (links and buttons get the orange version)
    'html.a11y-cursor-1,html.a11y-cursor-1 *{cursor:' + cursorSvg('%23000') + ',auto!important}',
    'html.a11y-cursor-1 a,html.a11y-cursor-1 a *,html.a11y-cursor-1 button,html.a11y-cursor-1 button *,html.a11y-cursor-1 label,html.a11y-cursor-1 select,html.a11y-cursor-1 summary{cursor:' + cursorSvg('%23F4A32E') + ',pointer!important}',

    // Saturation (on the root element, so fixed menus and banners still behave)
    'html.a11y-saturation-1{filter:saturate(.5)}',
    'html.a11y-saturation-2{filter:grayscale(1)}',
    'html.a11y-saturation-3{filter:saturate(1.8)}',

    // Text align
    'html.a11y-align-1 ' + ALL + '{text-align:left!important}',
    'html.a11y-align-2 ' + ALL + '{text-align:center!important}',
    'html.a11y-align-3 ' + ALL + '{text-align:right!important}'
  ].join('\n');

  // ---------- Menu styles ----------
  // Sizes are in px on purpose so the menu doesn't grow with "Bigger text".
  var menuCss = [
    '#wsis-a11y{--a-navy:#08253F;--a-deep:#051622;--a-brass:#F4A32E;--a-canvas:#EDEFE6;--a-ink:#16232B;font-family:"DejaVu Sans",-apple-system,BlinkMacSystemFont,sans-serif;font-size:15px;line-height:1.4;letter-spacing:0;word-spacing:0;text-align:left;color:var(--a-ink)}',
    '#wsis-a11y *{box-sizing:border-box;font-family:inherit;letter-spacing:0;word-spacing:0;line-height:inherit;text-align:inherit}',
    '#wsis-a11y button{font:inherit;color:inherit;margin:0}',
    '#wsis-a11y :focus-visible{outline:3px solid var(--a-brass);outline-offset:2px}',

    // Launcher
    '#wsis-a11y .a11y-launcher{position:fixed;right:20px;bottom:20px;z-index:250;width:56px;height:56px;border-radius:50%;border:2px solid var(--a-canvas);background:var(--a-navy);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 18px rgba(5,22,34,.35);padding:0;transition:bottom .2s ease,transform .15s ease}',
    '#wsis-a11y .a11y-launcher:hover{transform:scale(1.06);border-color:var(--a-brass)}',
    '#wsis-a11y .a11y-launcher[aria-expanded="true"]{border-color:var(--a-brass)}',

    // Panel
    '#wsis-a11y .a11y-panel{position:fixed;top:0;right:0;bottom:0;z-index:260;width:384px;max-width:100%;background:var(--a-canvas);display:flex;flex-direction:column;box-shadow:-12px 0 40px rgba(5,22,34,.3);transform:translateX(105%);visibility:hidden;transition:transform .25s ease,visibility 0s linear .25s}',
    '#wsis-a11y.is-open .a11y-panel{transform:none;visibility:visible;transition:transform .25s ease,visibility 0s}',
    '#wsis-a11y .a11y-head{background:var(--a-navy);color:#fff;padding:18px 20px;display:flex;align-items:center;gap:12px;border-bottom:3px solid var(--a-brass)}',
    '#wsis-a11y .a11y-head h2{margin:0;font-size:19px;font-weight:700;flex:1;color:#fff;text-transform:none}',
    '#wsis-a11y .a11y-close{width:40px;height:40px;border-radius:50%;border:2px solid rgba(255,255,255,.5);background:transparent;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}',
    '#wsis-a11y .a11y-close:hover{border-color:var(--a-brass);color:var(--a-brass)}',
    '#wsis-a11y .a11y-body{flex:1;overflow-y:auto;padding:16px}',
    '#wsis-a11y .a11y-intro{margin:0 0 14px;font-size:14px;color:rgba(22,35,43,.75)}',
    '#wsis-a11y .a11y-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;list-style:none;margin:0;padding:0}',

    // Tiles
    '#wsis-a11y .a11y-tile{width:100%;min-height:112px;border-radius:14px;border:2px solid transparent;background:#fff;color:var(--a-ink);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:14px 8px 12px;cursor:pointer;text-align:center;transition:background .15s ease,border-color .15s ease}',
    '#wsis-a11y .a11y-tile:hover{border-color:var(--a-navy)}',
    '#wsis-a11y .a11y-tile[aria-pressed="true"]{background:var(--a-navy);color:#fff;border-color:var(--a-navy)}',
    '#wsis-a11y .a11y-tile[aria-pressed="true"] .a11y-icon{color:var(--a-brass)}',
    '#wsis-a11y .a11y-label{font-size:14px;font-weight:700}',
    '#wsis-a11y .a11y-level{font-size:12px;min-height:16px;color:rgba(22,35,43,.6)}',
    '#wsis-a11y .a11y-tile[aria-pressed="true"] .a11y-level{color:rgba(255,255,255,.85)}',
    '#wsis-a11y .a11y-pips{display:flex;gap:4px}',
    '#wsis-a11y .a11y-pip{width:16px;height:4px;border-radius:2px;background:rgba(22,35,43,.18)}',
    '#wsis-a11y .a11y-tile[aria-pressed="true"] .a11y-pip{background:rgba(255,255,255,.3)}',
    '#wsis-a11y .a11y-tile[aria-pressed="true"] .a11y-pip.on{background:var(--a-brass)}',

    // Footer
    '#wsis-a11y .a11y-foot{padding:14px 16px 18px;border-top:1px solid rgba(22,35,43,.12);display:flex;flex-direction:column;gap:12px;background:var(--a-canvas)}',
    '#wsis-a11y .a11y-reset{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:13px 16px;border-radius:999px;border:2px solid var(--a-navy);background:var(--a-navy);color:#fff;font-weight:700;cursor:pointer}',
    '#wsis-a11y .a11y-reset:hover{background:var(--a-deep)}',
    '#wsis-a11y .a11y-statement{font-size:13px;color:var(--a-ink);text-align:center;text-decoration:underline}',
    '#wsis-a11y .a11y-statement:hover{color:#067570}',

    // Reading guide
    '#wsis-a11y .a11y-guide{position:fixed;left:0;right:0;top:0;height:14px;z-index:240;pointer-events:none;background:rgba(244,163,46,.28);border-top:3px solid var(--a-navy);border-bottom:3px solid var(--a-navy);display:none;transform:translateY(-100px)}',
    'html.a11y-guide-1 #wsis-a11y .a11y-guide{display:block}',

    '#wsis-a11y .a11y-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}',

    '@media (max-width:480px){#wsis-a11y .a11y-panel{width:100%}#wsis-a11y .a11y-launcher{right:14px;width:52px;height:52px}#wsis-a11y .a11y-tile{min-height:100px}}',
    '@media (prefers-reduced-motion:reduce){#wsis-a11y .a11y-panel,#wsis-a11y .a11y-launcher{transition:none}}',
    '@media print{#wsis-a11y{display:none!important}}'
  ].join('\n');

  // ---------- Apply settings to the page ----------
  function apply() {
    OPTIONS.forEach(function (opt) {
      for (var i = 1; i <= opt.levels.length; i++) root.classList.remove('a11y-' + opt.id + '-' + i);
      var lvl = state[opt.id] || 0;
      if (lvl > 0) root.classList.add('a11y-' + opt.id + '-' + lvl);
    });

    var t = state.text || 0;
    root.classList.toggle('a11y-text', t > 0);
    root.style.setProperty('--a11y-text-scale', TEXT_SCALE[t]);

    // The light contrast mode turns the dark nav and footer white, so swap
    // the light logo for the regular one while it's on.
    var light = state.contrast === 2;
    var logos = document.querySelectorAll('img[src*="logo-stack-light.svg"], img[data-a11y-logo]');
    for (var j = 0; j < logos.length; j++) {
      var img = logos[j];
      if (!img.hasAttribute('data-a11y-logo')) img.setAttribute('data-a11y-logo', img.getAttribute('src'));
      var orig = img.getAttribute('data-a11y-logo');
      img.setAttribute('src', light ? orig.replace('logo-stack-light.svg', 'logo-stack.svg') : orig);
    }
  }

  // Apply saved settings right away so pages don't flash the default look
  load();
  var styleTag = document.createElement('style');
  styleTag.id = 'wsis-a11y-styles';
  styleTag.textContent = pageCss + '\n' + menuCss;
  (document.head || root).appendChild(styleTag);
  apply();

  // ---------- Build the menu ----------
  function build() {
    var wrap = document.createElement('div');
    wrap.id = 'wsis-a11y';

    var tiles = OPTIONS.map(function (opt) {
      var pips = opt.levels.length > 1
        ? '<span class="a11y-pips" aria-hidden="true">' + opt.levels.map(function () { return '<span class="a11y-pip"></span>'; }).join('') + '</span>'
        : '';
      return '<li><button type="button" class="a11y-tile" data-opt="' + opt.id + '" aria-pressed="false">' +
        '<span class="a11y-icon">' + icon(opt.id, 26) + '</span>' +
        '<span class="a11y-label">' + opt.label + '</span>' +
        '<span class="a11y-level"></span>' + pips +
        '</button></li>';
    }).join('');

    wrap.innerHTML =
      '<button type="button" class="a11y-launcher" aria-label="Accessibility menu" aria-expanded="false" aria-controls="wsis-a11y-panel">' + icon('person', 30) + '</button>' +
      '<div class="a11y-panel" id="wsis-a11y-panel" role="dialog" aria-modal="false" aria-labelledby="wsis-a11y-title">' +
        '<div class="a11y-head">' +
          '<h2 id="wsis-a11y-title">Accessibility</h2>' +
          '<button type="button" class="a11y-close" aria-label="Close accessibility menu">' + icon('close', 20) + '</button>' +
        '</div>' +
        '<div class="a11y-body">' +
          '<p class="a11y-intro">Adjust how this site looks. Tap an option again to step through its levels. Your choices are saved on this device.</p>' +
          '<ul class="a11y-grid">' + tiles + '</ul>' +
        '</div>' +
        '<div class="a11y-foot">' +
          '<button type="button" class="a11y-reset">' + icon('reset', 18) + 'Reset all settings</button>' +
          '<a class="a11y-statement" href="' + STATEMENT_URL + '">Read our accessibility statement</a>' +
        '</div>' +
      '</div>' +
      '<div class="a11y-guide" aria-hidden="true"></div>' +
      '<div class="a11y-sr" aria-live="polite" id="wsis-a11y-live"></div>';

    document.body.appendChild(wrap);

    var launcher = wrap.querySelector('.a11y-launcher');
    var panel = wrap.querySelector('.a11y-panel');
    var closeBtn = wrap.querySelector('.a11y-close');
    var live = wrap.querySelector('#wsis-a11y-live');
    var guide = wrap.querySelector('.a11y-guide');

    function renderTiles() {
      var buttons = wrap.querySelectorAll('.a11y-tile');
      for (var i = 0; i < buttons.length; i++) {
        var b = buttons[i];
        var opt = OPTIONS.filter(function (o) { return o.id === b.getAttribute('data-opt'); })[0];
        var lvl = state[opt.id] || 0;
        b.setAttribute('aria-pressed', lvl > 0 ? 'true' : 'false');
        var levelText = lvl > 0 ? (opt.levels.length > 1 ? opt.levels[lvl - 1] : 'On') : 'Off';
        b.querySelector('.a11y-level').textContent = opt.levels.length > 1 ? levelText : (lvl > 0 ? 'On' : '');
        b.setAttribute('aria-label', opt.label + ': ' + levelText);
        var pips = b.querySelectorAll('.a11y-pip');
        for (var p = 0; p < pips.length; p++) pips[p].classList.toggle('on', p < lvl);
      }
    }

    function announce(msg) {
      live.textContent = '';
      setTimeout(function () { live.textContent = msg; }, 30);
    }

    function open() {
      wrap.classList.add('is-open');
      launcher.setAttribute('aria-expanded', 'true');
      setTimeout(function () { closeBtn.focus(); }, 50);
    }
    function close(returnFocus) {
      wrap.classList.remove('is-open');
      launcher.setAttribute('aria-expanded', 'false');
      if (returnFocus) launcher.focus();
    }

    launcher.addEventListener('click', function () {
      if (wrap.classList.contains('is-open')) close(false); else open();
    });
    closeBtn.addEventListener('click', function () { close(true); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.classList.contains('is-open')) close(true);
    });
    document.addEventListener('click', function (e) {
      if (wrap.classList.contains('is-open') && !wrap.contains(e.target)) close(false);
    });

    wrap.querySelector('.a11y-grid').addEventListener('click', function (e) {
      var b = e.target.closest('.a11y-tile');
      if (!b) return;
      var opt = OPTIONS.filter(function (o) { return o.id === b.getAttribute('data-opt'); })[0];
      var next = ((state[opt.id] || 0) + 1) % (opt.levels.length + 1);
      if (next === 0) delete state[opt.id]; else state[opt.id] = next;
      save();
      apply();
      renderTiles();
      announce(opt.label + ': ' + (next > 0 ? opt.levels[next - 1] : 'Off'));
    });

    wrap.querySelector('.a11y-reset').addEventListener('click', function () {
      state = {};
      save();
      apply();
      renderTiles();
      announce('All accessibility settings reset');
    });

    // Reading guide follows the pointer
    function moveGuide(y) { guide.style.transform = 'translateY(' + (y - 10) + 'px)'; }
    document.addEventListener('mousemove', function (e) { if (state.guide) moveGuide(e.clientY); }, { passive: true });
    document.addEventListener('touchmove', function (e) { if (state.guide && e.touches[0]) moveGuide(e.touches[0].clientY); }, { passive: true });

    // Keep the launcher above the cookie banner while the banner is showing
    function placeLauncher() {
      var banner = document.getElementById('cookieBanner');
      var gap = window.innerWidth <= 480 ? 14 : 20;
      var lift = 0;
      if (banner && getComputedStyle(banner).display !== 'none') {
        lift = banner.getBoundingClientRect().height;
      }
      launcher.style.bottom = (lift + gap) + 'px';
    }
    var queued = false;
    function queuePlace() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; placeLauncher(); });
    }
    new MutationObserver(function (records) {
      for (var r = 0; r < records.length; r++) { if (!wrap.contains(records[r].target)) { queuePlace(); return; } }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
    window.addEventListener('resize', queuePlace);
    placeLauncher();

    renderTiles();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
