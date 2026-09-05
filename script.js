// Populates the page from content.json so Sheila can edit copy
// through the CMS without ever touching this file.
//
// Every page-specific section below is guarded by checking that section's
// root element exists first, since this site has separate pages that all
// share this one script.

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

function setHeroBackground(elId, imagePath) {
  const el = document.getElementById(elId);
  if (el && imagePath) {
    el.style.backgroundImage = `linear-gradient(180deg, rgba(8,37,63,0.78) 0%, rgba(5,22,34,0.88) 100%), url('${imagePath}')`;
  }
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

function renderVideoGrid(gridId, headlineId, introId, videosData) {
  const grid = document.getElementById(gridId);
  if (!grid || !videosData) return;
  setText(headlineId, videosData.headline);
  setText(introId, videosData.intro);
  grid.innerHTML = videosData.list.map(v => `
    <button class="video-card" type="button" data-drive-id="${v.drive_id}" aria-label="Play: ${v.title}">
      <span class="video-card-poster">
        <span class="video-play-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="#051622"><path d="M8 5v14l11-7z"/></svg>
        </span>
        <span class="video-card-title">${v.title}</span>
      </span>
    </button>
  `).join('');
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.video-card');
    if (!card) return;
    const id = card.getAttribute('data-drive-id');
    if (!id) return;
    card.outerHTML = `<div class="video-card"><iframe src="https://drive.google.com/file/d/${id}/preview" allow="autoplay" allowfullscreen></iframe></div>`;
  });
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

  // Nav (present on every primary page)
  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.innerHTML = content.site.nav.map(n => `<li><a href="${n.href}">${n.label}</a></li>`).join('');

    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
      navToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', open);
      });
    }
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }));

    const currentPage = location.pathname.split('/').pop() || 'index.html';
    navLinks.querySelectorAll('a').forEach(a => {
      if (a.getAttribute('href') === currentPage) a.classList.add('active');
    });
  }

  // Single source of truth for every "Donate" button sitewide.
  const donateUrl = content.site.donate_url;

  // Hero (Home page only)
  if (document.getElementById('home')) {
    setText('hero-headline', content.hero.headline);
    setText('hero-subhead', content.hero.subhead);
    setHTML('hero-body', content.hero.body);
    setLink('hero-cta-primary', content.hero.cta_primary);
    setLink('hero-cta-secondary', content.hero.cta_secondary, donateUrl);

    const hbContainer = document.getElementById('home-blocks-container');
    if (hbContainer) {
      hbContainer.innerHTML = content.home_blocks.map(b => {
        const ctaHTML = b.cta
          ? `<div class="cta-row"><a class="btn btn-primary" href="${b.cta.href || donateUrl}">${b.cta.text}</a></div>`
          : (b.cta_primary ? `<div class="cta-row">
              <a class="btn btn-primary" href="${b.cta_primary.href || donateUrl}">${b.cta_primary.text}</a>
              ${b.cta_secondary ? `<a class="btn btn-outline on-light" href="${b.cta_secondary.href}">${b.cta_secondary.text}</a>` : ''}
            </div>` : '');
        return `
          <div class="block block-full block-stacked">
            ${b.image ? `<div style="border-radius:22px; overflow:hidden; margin:0 auto 32px; width:fit-content; max-width:100%;"><img src="${b.image}" alt="" style="display:block; max-width:100%; max-height:500px; width:auto; height:auto;"></div>` : ''}
            <div class="main">
              <h3>${b.headline}</h3>
              ${b.body.split('\n\n').map(p => `<p>${p}</p>`).join('')}
              ${ctaHTML}
            </div>
          </div>`;
      }).join('');
    }

    // Home closing section (moved here from the old Donate page's top intro, per Sheila's request)
    if (content.home_closing) {
      setText('home-closing-headline', content.home_closing.headline);
      setText('home-closing-body', content.home_closing.body);
      setLink('home-closing-cta-primary', content.home_closing.cta_primary, donateUrl);
      setLink('home-closing-cta-secondary', content.home_closing.cta_secondary);
    }
  }

  // Sail (Sail page only)
  if (document.getElementById('sail-hero')) {
    const sail = content.sail;
    setHeroBackground('sail-hero', sail.hero_image);
    setText('sail-headline', sail.headline);
    setText('sail-subhead', sail.subhead);
    setText('sail-intro', sail.intro);

    const featuredPhoto = document.getElementById('sail-featured-photo');
    if (featuredPhoto && sail.featured_photo) featuredPhoto.src = sail.featured_photo;

    setText('sail-adaptive-headline', sail.adaptive.headline);
    setText('sail-adaptive-body', sail.adaptive.body);
    setText('sail-adaptive-gs-headline', sail.adaptive.getting_started_headline);
    setHTML('sail-adaptive-gs-body', sail.adaptive.getting_started_body);
    const reqEl = document.getElementById('sail-adaptive-requirements');
    if (reqEl) reqEl.innerHTML = sail.adaptive.requirements.map(r => `<li>${r}</li>`).join('');
    setText('sail-adaptive-closing', sail.adaptive.closing);
    setLink('sail-adaptive-cta', sail.adaptive.cta);

    // Optional video next to Adaptive Sailing / Getting Started
    const adaptiveVideoWrap = document.getElementById('sail-adaptive-video');
    if (adaptiveVideoWrap) {
      if (sail.adaptive.video_drive_id) {
        adaptiveVideoWrap.innerHTML = `<div class="video-card" style="max-width:400px;"><iframe src="https://drive.google.com/file/d/${sail.adaptive.video_drive_id}/preview" allow="autoplay" allowfullscreen></iframe></div>`;
      } else {
        adaptiveVideoWrap.style.display = 'none';
      }
    }

    setText('sail-access-headline', sail.access.headline);
    setHTML('sail-access-body', sail.access.body);
    setLink('sail-access-cta', sail.access.cta);

    setText('sail-membership-headline', sail.membership.headline);
    setHTML('sail-membership-body', sail.membership.body);

    setText('sail-closing-headline', sail.closing.headline);
    setHTML('sail-closing-body', sail.closing.body);

    renderVideoGrid('video-grid', 'videos-headline', 'videos-intro', content.videos);
  }

  // FAQ (FAQ page only)
  if (document.getElementById('faq')) {
    setText('faq-headline', content.faq.headline);
    const faqList = document.getElementById('faq-list');
    if (faqList) {
      faqList.innerHTML = content.faq.items.map(item => `
        <details class="faq-item">
          <summary>${item.question}</summary>
          <div class="faq-answer">${item.answer.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>
        </details>
      `).join('');
    }
  }

  // About (About page only)
  if (document.getElementById('about-hero')) {
    const about = content.about;
    setHeroBackground('about-hero', about.hero_image);
    setText('about-headline', about.headline);
    setHTML('about-intro', about.intro);
    setText('about-mission-headline', about.mission.headline);
    setHTML('about-mission-body', about.mission.body);
    setText('about-founders-headline', about.founders.headline);
    setHTML('about-founders-body', about.founders.body);

    setText('about-board-headline', about.board.headline);
    setText('about-board-intro', about.board.intro);
    const boardGrid = document.getElementById('about-board-grid');
    if (boardGrid) {
      boardGrid.innerHTML = about.board.members.map(m => `
        <div class="board-card">
          <div class="name">${m.name}</div>
          <div class="title">${m.title}</div>
        </div>`).join('');
    }

    setText('about-story-headline', about.jims_story.headline);
    setHTML('about-story-body', about.jims_story.body);
    const jimsPhoto = document.getElementById('about-story-photo');
    if (jimsPhoto) {
      if (about.jims_story.photo) {
        jimsPhoto.src = about.jims_story.photo;
        jimsPhoto.style.display = '';
      } else {
        jimsPhoto.style.display = 'none';
      }
    }
  }

  // Donate (Donate page only - formerly "Support")
  if (document.getElementById('donate-hero')) {
    const donate = content.donate;
    setHeroBackground('donate-hero', donate.hero_image);
    setText('donate-headline', donate.headline);
    setHTML('donate-intro', donate.intro);
    setLink('donate-intro-cta', donate.intro_cta, donateUrl);

    setText('donate-closing-headline', donate.closing.headline);
    const closingLines = document.getElementById('donate-closing-lines');
    if (closingLines) closingLines.innerHTML = donate.closing.lines.map(l => `<div>${l}</div>`).join('');
    setText('donate-closing-body', donate.closing.body);
    setLink('donate-closing-cta-primary', donate.closing.cta_primary, donateUrl);
    setLink('donate-closing-cta-secondary', donate.closing.cta_secondary);
  }

  // Sponsor (Sponsor page only - formerly "Donate")
  if (document.getElementById('sponsor-hero')) {
    const sponsor = content.sponsor;
    setHeroBackground('sponsor-hero', sponsor.hero_image);

    setText('sponsor-corporate-headline', sponsor.corporate.headline);
    setText('sponsor-corporate-intro', sponsor.corporate.intro);
    renderTiers('sponsor-corporate-tiers', sponsor.corporate.tiers, '#F4A32E');
    setLink('sponsor-corporate-cta', sponsor.corporate.cta);
    setText('sponsor-custom-note', sponsor.corporate.custom_note);
    setLink('sponsor-custom-cta', sponsor.corporate.custom_cta);
    setText('sponsor-custom-note-after', sponsor.corporate.custom_note_after);

    if (sponsor.sponsors) {
      setText('sponsor-sponsors-headline', sponsor.sponsors.headline);
      const sponsorsGrid = document.getElementById('sponsor-sponsors-grid');
      if (sponsorsGrid) {
        sponsorsGrid.innerHTML = sponsor.sponsors.list.map(s => s.logo
          ? `<img src="${s.logo}" alt="${s.name}" class="sponsor-logo">`
          : `<div class="sponsor-wordmark">${s.name}</div>`
        ).join('');
      }
    }
  }

  // Contact (Contact page only)
  if (document.getElementById('contact-hero')) {
    const contact = content.contact;
    setHeroBackground('contact-hero', contact.hero_image);
    setText('contact-headline', contact.headline);
    setHTML('contact-body', contact.body);
    setText('contact-form-headline', contact.form_headline);
    const interestEl = document.getElementById('cf-interest');
    if (interestEl) interestEl.innerHTML = contact.interest_options.map(o => `<option>${o}</option>`).join('');
    setText('contact-submit', contact.submit_label);

    const contactVideoWrap = document.getElementById('contact-video');
    if (contactVideoWrap) {
      if (contact.video_drive_id) {
        contactVideoWrap.innerHTML = `<div class="video-card"><iframe src="https://drive.google.com/file/d/${contact.video_drive_id}/preview" allow="autoplay" allowfullscreen></iframe></div>`;
      } else {
        contactVideoWrap.innerHTML = '';
      }
    }
  }

  // Footer (present on every primary page)
  const footer = content.footer;
  if (document.getElementById('footer-org-name')) {
    setText('footer-org-name', footer.org_name);
    setText('footer-tagline', footer.tagline);
    setText('footer-address', footer.address);

    const phoneEl = document.getElementById('footer-phone');
    if (phoneEl) phoneEl.textContent = footer.phone ? `Phone: ${footer.phone}` : 'Phone: TBD';

    const emailEl = document.getElementById('footer-email');
    if (emailEl) emailEl.innerHTML = `<a href="mailto:${footer.email}">${footer.email}</a>`;

    const footerNav = document.getElementById('footer-nav-links');
    if (footerNav) footerNav.innerHTML = footer.nav.map(n => `<li><a href="${n.href}">${n.label}</a></li>`).join('');

    setText('footer-legal-statement', footer.legal_statement);
    setText('footer-ein', 'EIN: ' + footer.ein);
    setText('footer-copyright', footer.copyright);

    const instaEl = document.getElementById('footer-instagram');
    if (instaEl && footer.instagram_handle) {
      instaEl.innerHTML = `<a href="${footer.instagram_url}" target="_blank" rel="noopener" aria-label="Instagram: ${footer.instagram_handle}"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.38C1.35 2.68.94 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.66 1.34 1.07 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.38.66-.67 1.07-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.38-2.13C21.32 1.35 20.65.94 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0z"/><path d="M12 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4z"/><circle cx="18.41" cy="5.59" r="1.44"/></svg></a>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
