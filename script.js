// Populates the page from content.json so Sheila can edit copy
// through the CMS without ever touching this file.

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) el.textContent = value;
}

function setHTML(id, value) {
  const el = document.getElementById(id);
  if (!el || value === undefined || value === null) return;
  el.innerHTML = String(value)
    .split('\n\n')
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function setLink(id, cta, fallbackHref) {
  const el = document.getElementById(id);
  if (!el || !cta) return;
  el.textContent = cta.text || '';
  el.href = cta.href || fallbackHref || '#';
}

function flagSVG(color) {
  return `<svg viewBox="0 0 28 20" class="flag" aria-hidden="true"><rect width="28" height="20" fill="${color}"/><path d="M0,0 L28,10 L0,20 Z" fill="rgba(255,255,255,0.15)"/></svg>`;
}

function renderTiers(containerId, tiers, flagColor) {
  const el = document.getElementById(containerId);
  if (!el || !tiers) return;
  el.innerHTML = tiers.map(t => `
    <div class="tier-card">
      ${flagColor ? flagSVG(flagColor) : ''}
      <div class="amount">${t.amount}</div>
      <div class="name">${t.name}</div>
      <p>${t.body}</p>
    </div>
  `).join('');
}

async function init() {
  let content;
  try {
    const res = await fetch('content.json', { cache: 'no-store' });
    content = await res.json();
  } catch (e) {
    console.error('Could not load content.json', e);
    return;
  }

  // Nav
  const navLinks = document.getElementById('navLinks');
  navLinks.innerHTML = content.site.nav.map(n => `<li><a href="${n.href}">${n.label}</a></li>`).join('');

  const navToggle = document.getElementById('navToggle');
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  // Highlight the nav link matching the current page
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  navLinks.querySelectorAll('a').forEach(a => {
    if (a.getAttribute('href') === currentPage) a.classList.add('active');
  });

  // Single source of truth for every "Donate"/"Make a Gift" button sitewide.
  // Any CTA in content.json with a blank href automatically uses this link.
  const donateUrl = content.donate.donate_url;

  // Hero
  setText('hero-headline', content.hero.headline);
  setText('hero-subhead', content.hero.subhead);
  setHTML('hero-body', content.hero.body);
  setLink('hero-cta-primary', content.hero.cta_primary);
  setLink('hero-cta-secondary', content.hero.cta_secondary, donateUrl);

  // Home blocks
  const hbContainer = document.getElementById('home-blocks-container');
  hbContainer.innerHTML = content.home_blocks.map(b => {
    const ctaHTML = b.cta
      ? `<div class="cta-row"><a class="btn btn-primary" href="${b.cta.href || donateUrl}">${b.cta.text}</a></div>`
      : (b.cta_primary ? `<div class="cta-row">
          <a class="btn btn-primary" href="${b.cta_primary.href || donateUrl}">${b.cta_primary.text}</a>
          ${b.cta_secondary ? `<a class="btn btn-outline on-light" href="${b.cta_secondary.href}">${b.cta_secondary.text}</a>` : ''}
        </div>` : '');
    return `
      <div class="block">
        <div class="side"><span class="telltale" aria-hidden="true"><svg viewBox="0 0 44 14"><path d="M2,7 Q12,2 22,7 T42,7" stroke="#078D87" stroke-width="2" fill="none" stroke-linecap="round"/></svg></span></div>
        <div class="main">
          <h3>${b.headline}</h3>
          ${b.body.split('\n\n').map(p => `<p>${p}</p>`).join('')}
          ${ctaHTML}
        </div>
      </div>`;
  }).join('');

  // Sail
  const sail = content.sail;
  setText('sail-headline', sail.headline);
  setText('sail-subhead', sail.subhead);
  setText('sail-intro', sail.intro);

  setText('sail-adaptive-headline', sail.adaptive.headline);
  setText('sail-adaptive-body', sail.adaptive.body);
  setText('sail-adaptive-gs-headline', sail.adaptive.getting_started_headline);
  setHTML('sail-adaptive-gs-body', sail.adaptive.getting_started_body);
  document.getElementById('sail-adaptive-requirements').innerHTML =
    sail.adaptive.requirements.map(r => `<li>${r}</li>`).join('');
  setText('sail-adaptive-closing', sail.adaptive.closing);
  setLink('sail-adaptive-cta', sail.adaptive.cta);

  setText('sail-access-headline', sail.access.headline);
  setHTML('sail-access-body', sail.access.body);
  setLink('sail-access-cta', sail.access.cta);

  setText('sail-membership-headline', sail.membership.headline);
  setText('sail-membership-body', sail.membership.body);
  setText('sail-membership-adaptive-note', sail.membership.adaptive_note);
  setText('sail-membership-access-note', sail.membership.access_note);

  setText('sail-closing-headline', sail.closing.headline);
  setHTML('sail-closing-body', sail.closing.body);

  // Videos (click-to-play, so nothing loads until a visitor actually clicks)
  if (content.videos && document.getElementById('video-grid')) {
    setText('videos-headline', content.videos.headline);
    setText('videos-intro', content.videos.intro);
    document.getElementById('video-grid').innerHTML = content.videos.list.map((v, i) => `
      <button class="video-card" type="button" data-drive-id="${v.drive_id}" aria-label="Play: ${v.title}">
        <span class="video-card-poster">
          <span class="video-play-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="#051622"><path d="M8 5v14l11-7z"/></svg>
          </span>
          <span class="video-card-title">${v.title}</span>
        </span>
      </button>
    `).join('');
    document.getElementById('video-grid').addEventListener('click', (e) => {
      const card = e.target.closest('.video-card');
      if (!card) return;
      const id = card.getAttribute('data-drive-id');
      card.outerHTML = `<div class="video-card"><iframe src="https://drive.google.com/file/d/${id}/preview" allow="autoplay" allowfullscreen></iframe></div>`;
    });
  }

  // FAQ
  setText('faq-headline', content.faq.headline);
  document.getElementById('faq-list').innerHTML = content.faq.items.map(item => `
    <details class="faq-item">
      <summary>${item.question}</summary>
      <div class="faq-answer">${item.answer.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>
    </details>
  `).join('');

  // About
  const about = content.about;
  setText('about-headline', about.headline);
  setHTML('about-intro', about.intro);
  setText('about-mission-headline', about.mission.headline);
  setHTML('about-mission-body', about.mission.body);
  setText('about-founders-headline', about.founders.headline);
  setHTML('about-founders-body', about.founders.body);

  setText('about-board-headline', about.board.headline);
  setText('about-board-intro', about.board.intro);
  document.getElementById('about-board-grid').innerHTML = about.board.members.map(m => `
    <div class="board-card">
      <div class="name">${m.name}</div>
      <div class="title">${m.title}</div>
    </div>`).join('');

  setText('about-story-headline', about.jims_story.headline);
  setHTML('about-story-body', about.jims_story.body);

  // Support
  const support = content.support;
  setText('support-headline', support.headline);
  setHTML('support-intro', support.intro);
  setLink('support-intro-cta', support.intro_cta, donateUrl);

  setText('support-gift-headline', support.gift_impact.headline);
  setText('support-gift-intro', support.gift_impact.intro);
  document.getElementById('support-gift-items').innerHTML =
    support.gift_impact.items.map(i => `<li>${i}</li>`).join('');
  setText('support-gift-closing', support.gift_impact.closing);
  setLink('support-gift-cta', support.gift_impact.cta, donateUrl);

  setText('support-partner-headline', support.partner.headline);
  setHTML('support-partner-body', support.partner.body);
  setLink('support-partner-cta', support.partner.cta);

  setText('support-closing-headline', support.closing.headline);
  document.getElementById('support-closing-lines').innerHTML =
    support.closing.lines.map(l => `<div>${l}</div>`).join('');
  setText('support-closing-body', support.closing.body);
  setLink('support-closing-cta-primary', support.closing.cta_primary, donateUrl);
  setLink('support-closing-cta-secondary', support.closing.cta_secondary);

  // Support sponsors
  if (support.sponsors) {
    setText('support-sponsors-headline', support.sponsors.headline);
    document.getElementById('support-sponsors-grid').innerHTML =
      support.sponsors.list.map(s => s.logo
        ? `<img src="${s.logo}" alt="${s.name}" class="sponsor-logo">`
        : `<div class="sponsor-wordmark">${s.name}</div>`
      ).join('');
  }

  // Donate
  const donate = content.donate;
  setText('donate-headline', donate.headline);
  setText('donate-subhead', donate.subhead);
  setHTML('donate-intro', donate.intro);

  setText('donate-individual-headline', donate.individual.headline);
  setText('donate-individual-intro', donate.individual.intro);
  renderTiers('donate-individual-tiers', donate.individual.tiers, '#078D87');
  setLink('donate-individual-cta', donate.individual.cta, donateUrl);

  setText('donate-corporate-headline', donate.corporate.headline);
  setText('donate-corporate-intro', donate.corporate.intro);
  renderTiers('donate-corporate-tiers', donate.corporate.tiers, '#F4A32E');
  setLink('donate-corporate-cta', donate.corporate.cta);

  setText('donate-major-headline', donate.major_gift.headline);
  setHTML('donate-major-body', donate.major_gift.body);
  setLink('donate-major-cta', donate.major_gift.cta);

  setText('donate-confidence-headline', donate.confidence.headline);
  setText('donate-confidence-body', donate.confidence.body);
  setText('donate-confidence-ein', 'EIN: ' + donate.confidence.ein);
  setText('donate-confidence-tagline', donate.confidence.tagline);
  setLink('donate-confidence-cta', donate.confidence.cta, donateUrl);

  // Contact
  const contact = content.contact;
  setText('contact-headline', contact.headline);
  setHTML('contact-body', contact.body);
  setText('contact-form-headline', contact.form_headline);
  document.getElementById('cf-interest').innerHTML =
    contact.interest_options.map(o => `<option>${o}</option>`).join('');
  setText('contact-submit', contact.submit_label);

  setText('contact-sail-headline', contact.ready_to_sail.headline);
  setText('contact-sail-body', contact.ready_to_sail.body);
  setLink('contact-sail-cta', contact.ready_to_sail.cta);

  setText('contact-support-headline', contact.ready_to_support.headline);
  setText('contact-support-body', contact.ready_to_support.body);
  setLink('contact-support-cta', contact.ready_to_support.cta);

  // Footer
  const footer = content.footer;
  setText('footer-org-name', footer.org_name);
  setText('footer-tagline', footer.tagline);
  setText('footer-address', footer.address);

  const phoneEl = document.getElementById('footer-phone');
  phoneEl.textContent = footer.phone ? `Phone: ${footer.phone}` : 'Phone: TBD';

  const emailEl = document.getElementById('footer-email');
  emailEl.innerHTML = `<a href="mailto:${footer.email}">${footer.email}</a>`;

  document.getElementById('footer-nav-links').innerHTML =
    footer.nav.map(n => `<li><a href="${n.href}">${n.label}</a></li>`).join('');

  setText('footer-legal-statement', footer.legal_statement);
  setText('footer-ein', 'EIN: ' + content.donate.confidence.ein);

  setText('footer-copyright', footer.copyright);
  document.getElementById('footer-legal-links').innerHTML = footer.legal_links.map(l =>
    l.action ? `<a href="#" data-action="${l.action}">${l.label}</a>` : `<a href="${l.href}">${l.label}</a>`
  ).join('');
}

document.addEventListener('DOMContentLoaded', init);
