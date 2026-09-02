// Cookie consent banner + preferences modal.
// Consent state is stored in localStorage as 'wsis_cookie_consent':
//   'accepted' -> cookies/analytics allowed
//   'optout'   -> "Do Not Sell or Share My Personal Information" is active
// No tracking scripts are wired up yet — when analytics/ads are added later,
// gate them behind getCookieConsent() !== 'optout'.

function getCookieConsent() {
  try { return localStorage.getItem('wsis_cookie_consent'); } catch (e) { return null; }
}
function setCookieConsent(value) {
  try { localStorage.setItem('wsis_cookie_consent', value); } catch (e) {}
}

function buildConsentUI(legal) {
  const wrap = document.createElement('div');
  wrap.id = 'cookie-consent-root';
  wrap.innerHTML = `
    <div class="cookie-banner" id="cookieBanner" role="region" aria-label="Cookie notice">
      <div class="cookie-banner-text">
        <strong>${legal.cookie_banner.heading}</strong>
        <p>${legal.cookie_banner.body}</p>
      </div>
      <div class="cookie-banner-actions">
        <button class="btn btn-outline on-light" id="cookieManageBtn" type="button">${legal.cookie_banner.manage_label}</button>
        <button class="btn btn-primary" id="cookieAcceptBtn" type="button">${legal.cookie_banner.accept_label}</button>
      </div>
      <button class="cookie-optout-link" id="cookieOptOutLink" type="button">${legal.cookie_banner.optout_label}</button>
    </div>

    <div class="cookie-modal-overlay" id="cookieModalOverlay" style="display:none;">
      <div class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookieModalHeading">
        <h3 id="cookieModalHeading">${legal.consent_modal.heading}</h3>
        <p>${legal.consent_modal.body}</p>
        <label class="cookie-checkbox">
          <input type="checkbox" id="cookieOptOutCheckbox">
          ${legal.consent_modal.checkbox_label}
        </label>
        <div class="cookie-modal-actions">
          <button class="btn btn-outline on-light" id="cookieCancelBtn" type="button">${legal.consent_modal.cancel_label}</button>
          <button class="btn btn-primary" id="cookieSaveBtn" type="button">${legal.consent_modal.save_label}</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  const banner = document.getElementById('cookieBanner');
  const overlay = document.getElementById('cookieModalOverlay');
  const checkbox = document.getElementById('cookieOptOutCheckbox');

  function openModal() {
    checkbox.checked = getCookieConsent() === 'optout';
    overlay.style.display = 'flex';
  }
  function closeModal() { overlay.style.display = 'none'; }

  const existing = getCookieConsent();
  if (existing === 'accepted' || existing === 'optout') {
    banner.style.display = 'none';
  }

  document.getElementById('cookieAcceptBtn').addEventListener('click', () => {
    setCookieConsent('accepted');
    banner.style.display = 'none';
  });
  document.getElementById('cookieManageBtn').addEventListener('click', openModal);
  document.getElementById('cookieOptOutLink').addEventListener('click', openModal);
  document.getElementById('cookieCancelBtn').addEventListener('click', closeModal);
  document.getElementById('cookieSaveBtn').addEventListener('click', () => {
    setCookieConsent(checkbox.checked ? 'optout' : 'accepted');
    closeModal();
    banner.style.display = 'none';
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  // Footer "Do Not Sell or Share My Personal Information" link reuses the same modal
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-action="open-privacy-preferences"]');
    if (trigger) {
      e.preventDefault();
      openModal();
    }
  });
}

async function initCookieConsent() {
  try {
    const res = await fetch('content.json', { cache: 'no-store' });
    const content = await res.json();
    buildConsentUI(content.legal);
  } catch (e) {
    console.error('Could not load cookie consent content', e);
  }
}

document.addEventListener('DOMContentLoaded', initCookieConsent);
