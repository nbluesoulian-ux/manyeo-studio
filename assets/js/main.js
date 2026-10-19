/**
 * Manyeo Studio
 * Interactive Experience Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('g-header');
  const navToggleBtn = document.querySelector('[data-modal-toggle="nav"]');
  const modalNav = document.getElementById('modal-nav');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalSectorSnap = document.getElementById('modal-sector-snap');

  const sectionTitle = document.querySelector('[data-section-title]');
  const sectorNav = document.querySelector('[data-sector-nav]');

  const snapPanels = Array.from(document.querySelectorAll('[data-snap-panel]'));

  const sectionLogo = document.querySelector('[data-section-logo]');
  const sectionSubtitle = document.querySelector('[data-section-subtitle]');
  const sectorPostsList = Array.from(document.querySelectorAll('[data-sector-posts]'));
  const contentWrapper = document.getElementById('content-wrapper');

  // 1. Reveal Elements Observer
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.setAttribute('data-reveal-status', 'revealed');
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => {
    if (!el.closest('#modal-nav') && !el.closest('#modal-sector-snap')) {
      revealObserver.observe(el);
    }
  });

  // 2. Modal Navigation Toggle
  const socialContainer = modalNav?.querySelector('.editorial-nav-social-container');
  const socialBtn = modalNav?.querySelector('.editorial-social-btn');
  const socialSubmenu = modalNav?.querySelector('#editorial-social-submenu');
  const socialSymbol = modalNav?.querySelector('.editorial-social-symbol');

  // Contact elements
  const contactLink = modalNav?.querySelector('[data-nav-link="contact"]');
  const contactPanel = modalNav?.querySelector('#editorial-contact-panel');
  const contactForm = modalNav?.querySelector('#editorial-contact-form');
  const contactEmailInput = modalNav?.querySelector('#contact-email');
  const contactMessageInput = modalNav?.querySelector('#contact-message');
  const contactSubmitBtn = modalNav?.querySelector('#contact-submit-btn');
  const contactStatus = modalNav?.querySelector('#contact-form-status');
  const navContent = modalNav?.querySelector('.editorial-nav-content');

  function openContactView() {
    modalNav?.setAttribute('data-contact-active', 'true');
    navContent?.setAttribute('aria-hidden', 'true');
    contactPanel?.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      contactEmailInput?.focus();
    }, 350);
  }

  function closeContactView() {
    modalNav?.removeAttribute('data-contact-active');
    navContent?.setAttribute('aria-hidden', 'false');
    contactPanel?.setAttribute('aria-hidden', 'true');
  }

  function openNav() {
    navToggleBtn?.setAttribute('data-modal-status', 'active');
    navToggleBtn?.setAttribute('aria-label', 'Close menu');
    modalNav?.setAttribute('data-modal-status', 'active');
    modalNav?.setAttribute('aria-hidden', 'false');
    modalBackdrop?.setAttribute('data-modal-status', 'active');
    modalBackdrop?.classList.remove('pointer-events-none');
    document.body.classList.add('is-nav-open');

    modalNav?.querySelectorAll('[data-reveal]').forEach((el, idx) => {
      setTimeout(() => {
        el.setAttribute('data-reveal-status', 'revealed');
      }, 60 * (idx + 1));
    });
  }

  function closeNav() {
    navToggleBtn?.removeAttribute('data-modal-status');
    navToggleBtn?.setAttribute('aria-label', 'Open menu');
    modalNav?.removeAttribute('data-modal-status');
    modalNav?.setAttribute('aria-hidden', 'true');
    modalBackdrop?.removeAttribute('data-modal-status');
    modalBackdrop?.classList.add('pointer-events-none');
    document.body.classList.remove('is-nav-open');

    // Reset contact view and status after fade out completes
    setTimeout(() => {
      closeContactView();
      if (contactStatus) {
        contactStatus.textContent = '';
        contactStatus.className = 'editorial-contact-status';
      }
    }, 380);

    if (socialContainer?.classList.contains('is-expanded')) {
      socialContainer.classList.remove('is-expanded');
      socialBtn?.setAttribute('aria-expanded', 'false');
      socialSubmenu?.setAttribute('aria-hidden', 'true');
      if (socialSymbol) socialSymbol.textContent = '+';
    }

    modalNav?.querySelectorAll('[data-reveal]').forEach(el => {
      el.removeAttribute('data-reveal-status');
    });
  }

  navToggleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const isActive = navToggleBtn.getAttribute('data-modal-status') === 'active';
    if (isActive) closeNav();
    else openNav();
  });

  contactLink?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openContactView();
  });

  socialBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!socialContainer) return;
    const isExpanded = socialContainer.classList.toggle('is-expanded');
    socialBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    socialSubmenu?.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');
    if (socialSymbol) socialSymbol.textContent = isExpanded ? '−' : '+';
  });

  modalBackdrop?.addEventListener('click', closeNav);

  // Modal navigation link handling
  if (modalNav) {
    modalNav.querySelectorAll('a').forEach(link => {
      if (link === contactLink || link.getAttribute('data-nav-link') === 'contact') return;
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
          return;
        }
        const isHome = link.getAttribute('data-nav-link') === 'home' || href === '/' || href === './';
        if (isHome && (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname === '')) {
          e.preventDefault();
          closeNav();
          const firstPanel = document.querySelector('[data-snap-panel]');
          if (firstPanel) {
            firstPanel.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else {
          // Allow natural navigation to /work/, /about/, mailto, WhatsApp, Instagram
          closeNav();
        }
      });
    });
  }

  // Contact form submission via FormSubmit AJAX
  if (contactForm) {
    let isSubmitting = false;

    // Set _next dynamically to current URL if present
    const nextInput = contactForm.querySelector('input[name="_next"]');
    if (nextInput && typeof window !== 'undefined') {
      nextInput.value = window.location.href;
    }

    // Restore button when user types after previous submission
    const restoreSubmitBtn = () => {
      if (contactSubmitBtn) {
        const btnText = contactSubmitBtn.querySelector('.contact-btn-text');
        if (btnText && btnText.textContent === 'MESSAGE SENT') {
          btnText.textContent = 'SEND MESSAGE';
          contactSubmitBtn.disabled = false;
        }
      }
    };
    contactEmailInput?.addEventListener('input', restoreSubmitBtn);
    contactMessageInput?.addEventListener('input', restoreSubmitBtn);

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const emailVal = (contactEmailInput?.value || '').trim();
      const messageVal = (contactMessageInput?.value || '').trim();

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal || !emailRegex.test(emailVal)) {
        if (contactStatus) {
          contactStatus.textContent = "Something went wrong. Please try again.";
          contactStatus.className = 'editorial-contact-status is-visible is-error';
        }
        contactEmailInput?.focus();
        return;
      }

      // Message validation (required, no whitespace-only)
      if (!messageVal) {
        if (contactStatus) {
          contactStatus.textContent = "Something went wrong. Please try again.";
          contactStatus.className = 'editorial-contact-status is-visible is-error';
        }
        contactMessageInput?.focus();
        return;
      }

      isSubmitting = true;
      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = true;
        const btnText = contactSubmitBtn.querySelector('.contact-btn-text');
        if (btnText) btnText.textContent = 'SENDING...';
      }
      if (contactStatus) {
        contactStatus.textContent = '';
        contactStatus.className = 'editorial-contact-status';
      }

      try {
        const response = await fetch('https://formsubmit.co/ajax/helpyoukorean@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: emailVal,
            message: messageVal,
            _subject: 'New Website Contact',
            _template: 'table',
            _captcha: 'false'
          })
        });

        const data = await response.json().catch(() => ({}));

        const isSuccess = response.ok && (
          data.success === 'true' ||
          data.success === true ||
          (typeof data.message === 'string' && data.message.toLowerCase().includes('activate'))
        );

        if (isSuccess) {
          if (contactStatus) {
            contactStatus.textContent = "Message sent. We'll get back to you soon.";
            contactStatus.className = 'editorial-contact-status is-visible';
          }
          if (contactSubmitBtn) {
            const btnText = contactSubmitBtn.querySelector('.contact-btn-text');
            if (btnText) btnText.textContent = 'MESSAGE SENT';
            contactSubmitBtn.disabled = true;
          }
          contactForm.reset();
        } else {
          if (contactStatus) {
            contactStatus.textContent = "Something went wrong. Please try again.";
            contactStatus.className = 'editorial-contact-status is-visible is-error';
          }
          if (contactSubmitBtn) {
            contactSubmitBtn.disabled = false;
            const btnText = contactSubmitBtn.querySelector('.contact-btn-text');
            if (btnText) btnText.textContent = 'SEND MESSAGE';
          }
        }
      } catch (err) {
        if (contactStatus) {
          contactStatus.textContent = "Something went wrong. Please try again.";
          contactStatus.className = 'editorial-contact-status is-visible is-error';
        }
        if (contactSubmitBtn) {
          contactSubmitBtn.disabled = false;
          const btnText = contactSubmitBtn.querySelector('.contact-btn-text');
          if (btnText) btnText.textContent = 'SEND MESSAGE';
        }
      } finally {
        isSubmitting = false;
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeNav();
      closeSectorModal();
    }
  });

  // 3. Sector Snap Modal (Homepage)
  function openSectorModal(sectorIndex) {
    if (!modalSectorSnap) return;
    modalSectorSnap.setAttribute('data-modal-status', 'active');
    modalSectorSnap.setAttribute('aria-hidden', 'false');
    document.querySelectorAll('[data-sector-swiper]').forEach(sw => {
      if (sw.getAttribute('data-sector-swiper') === String(sectorIndex)) {
        sw.classList.remove('hidden');
        sw.querySelectorAll('video').forEach(v => {
          if (v.dataset.src && !v.src) v.src = v.dataset.src;
          v.muted = true;
          const p = v.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        });
        sw.querySelectorAll('[data-reveal]').forEach((el, idx) => {
          setTimeout(() => el.setAttribute('data-reveal-status', 'revealed'), 40 * (idx + 1));
        });
      } else {
        sw.classList.add('hidden');
        sw.querySelectorAll('video').forEach(v => v.pause());
      }
    });
  }

  function closeSectorModal() {
    if (!modalSectorSnap) return;
    modalSectorSnap.removeAttribute('data-modal-status');
    modalSectorSnap.setAttribute('aria-hidden', 'true');
    modalSectorSnap.querySelectorAll('video').forEach(v => v.pause());
  }

  document.querySelectorAll('[data-modal-id="sector-snap"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sectorPosts = btn.closest('[data-sector-posts]');
      const sectorIdx = sectorPosts ? sectorPosts.getAttribute('data-sector-posts') : '0';
      openSectorModal(sectorIdx);
    });
  });

  document.querySelectorAll('a[href="/work/"]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.location.protocol === 'file:') {
        e.preventDefault();
        window.location.href = 'work.html';
      }
    });
  });

  document.querySelector('[data-modal-close="sector-snap"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeSectorModal();
  });

  // 4. World Clocks (About Page)
  function updateClocks() {
    const now = new Date();
    document.querySelectorAll('[data-clock-analog], [data-clock-digital]').forEach(clock => {
      const tz = clock.getAttribute('data-timezone') || 'UTC';
      try {
        const str = now.toLocaleTimeString('en-GB', { timeZone: tz, hour12: false });
        const [hh, mm, ss] = str.split(':').map(Number);

        // Analog
        const handH = clock.querySelector('[data-hand="h"]');
        const handM = clock.querySelector('[data-hand="m"]');
        const handS = clock.querySelector('[data-hand="s"]');
        if (handH) handH.style.transform = `rotate(${(hh % 12) * 30 + mm * 0.5}deg)`;
        if (handM) handM.style.transform = `rotate(${mm * 6}deg)`;
        if (handS) handS.style.transform = `rotate(${ss * 6}deg)`;

        // Digital
        const digH = clock.querySelector('[data-h]');
        const digM = clock.querySelector('[data-m]');
        const digS = clock.querySelector('[data-s]');
        if (digH) digH.textContent = String(hh).padStart(2, '0');
        if (digM) digM.textContent = String(mm).padStart(2, '0');
        if (digS) digS.textContent = String(ss).padStart(2, '0');
      } catch (err) {}
    });
  }
  updateClocks();
  setInterval(updateClocks, 1000);

  // 5. Jump to / Anchor Navigation (About Page)
  const anchorNav = document.querySelector('[data-anchor-nav]');
  const anchorTrigger = document.querySelector('[data-anchor-nav-trigger]');
  if (anchorTrigger && anchorNav) {
    anchorTrigger.addEventListener('click', () => {
      const isOpen = anchorNav.hasAttribute('data-open');
      if (isOpen) {
        anchorNav.removeAttribute('data-open');
        anchorTrigger.setAttribute('aria-expanded', 'false');
      } else {
        anchorNav.setAttribute('data-open', '');
        anchorTrigger.setAttribute('aria-expanded', 'true');
      }
    });

    document.querySelectorAll('[data-anchor-target]').forEach(targetBtn => {
      targetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        anchorNav.removeAttribute('data-open');
        anchorTrigger.setAttribute('aria-expanded', 'false');
        const targetId = targetBtn.getAttribute('data-anchor-target');
        const el = document.getElementById(targetId) || document.querySelector(`[data-anchor="${targetId}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // 6. Explorer Terms Interactive (About Page)
  const termButtons = document.querySelectorAll('[data-term]');
  const termContents = document.querySelectorAll('[data-term-content]');
  termButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const termId = btn.getAttribute('data-term');
      termButtons.forEach(b => b.removeAttribute('data-status'));
      btn.setAttribute('data-status', 'active');
      termContents.forEach(c => {
        if (c.getAttribute('data-term-content') === termId) {
          c.classList.remove('hidden');
          c.setAttribute('data-status', 'active');
        } else {
          c.classList.add('hidden');
          c.removeAttribute('data-status');
        }
      });
    });
  });

  // 7. Footer Accordions & Popovers (Manyeo Studio Responsive)
  const footerSections = document.querySelectorAll('[data-footer-section]');
  const footerItems = document.querySelectorAll('[data-footer-item]');

  footerItems.forEach(item => {
    const trigger = item.querySelector('[data-footer-trigger]');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const section = item.closest('[data-footer-section]');
      const wasActive = item.getAttribute('data-status') === 'active';

      // Reset other items and other sections
      footerItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.removeAttribute('data-status');
          otherItem.querySelector('[data-footer-trigger]')?.setAttribute('aria-expanded', 'false');
        }
      });
      footerSections.forEach(otherSec => {
        if (otherSec !== section) {
          otherSec.removeAttribute('data-status');
          otherSec.querySelectorAll('[data-mobile-panel]').forEach(p => p.removeAttribute('data-status'));
        }
      });

      if (wasActive) {
        item.removeAttribute('data-status');
        trigger.setAttribute('aria-expanded', 'false');
        if (section) {
          section.removeAttribute('data-status');
          section.querySelectorAll('[data-mobile-panel]').forEach(p => p.removeAttribute('data-status'));
        }
      } else {
        item.setAttribute('data-status', 'active');
        trigger.setAttribute('aria-expanded', 'true');
        if (section) {
          section.setAttribute('data-status', 'active');
          const sectionItems = Array.from(section.querySelectorAll('[data-footer-item]'));
          const itemIdx = sectionItems.indexOf(item);
          const panels = section.querySelectorAll('[data-mobile-panel]');
          panels.forEach((p, idx) => {
            if (idx === itemIdx) {
              p.setAttribute('data-status', 'active');
            } else {
              p.removeAttribute('data-status');
            }
          });
          if (window.innerWidth < 768 && contentWrapper) {
            setTimeout(() => {
              contentWrapper.scrollTo({ top: contentWrapper.scrollHeight, behavior: 'smooth' });
            }, 150);
          }
        }
      }
    });
  });

  document.addEventListener('click', () => {
    footerItems.forEach(item => {
      item.removeAttribute('data-status');
      item.querySelector('[data-footer-trigger]')?.setAttribute('aria-expanded', 'false');
    });
    footerSections.forEach(sec => {
      sec.removeAttribute('data-status');
      sec.querySelectorAll('[data-mobile-panel]').forEach(p => p.removeAttribute('data-status'));
    });
  });

  // Footer Home & Logo smooth scroll to top
  document.querySelectorAll('[data-scroll-home]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (contentWrapper) {
        contentWrapper.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // 8. Snap Panels on Homepage
  if (snapPanels.length > 0) {
    // Editorial Typography Animation System for 7 Video Chapters
    const animVariationMap = {
      '4': { class: 'title-anim-v1', format: (t) => t }, // Video 1: Logo (Tracking Contraction)
      '2': { class: 'title-anim-v2', format: (t) => t }, // Video 2: UX&UI Design (Vertical Masked Reveal)
      '6': { class: 'title-anim-v3', format: (t) => t }, // Video 3: POSTER (Blur to Sharp Focus)
      '7': {
        class: 'title-anim-v4',
        format: (t) => t.split(' ').map(w => `<span class="editorial-word">${w}</span>`).join('&nbsp;')
      }, // Video 4: Manyeo Studio (Word Stagger)
      '5': { class: 'title-anim-v5', format: (t) => t }, // Video 5: We Transform (Opacity + 0.97 -> 1 Scale)
      '1': { class: 'title-anim-v6', format: (t) => t }, // Video 6: Ideas (Vertical Reveal)
      '0': { class: 'title-anim-v7', format: (t) => t }  // Video 7: Into Identity (Minimal Fade + Tracking)
    };

    let activeVideoIndex = null;

    function triggerTitleAnimation(panel) {
      if (!sectionTitle) return;
      const idxAttr = panel.getAttribute('data-index');
      const title = panel.getAttribute('data-title') || '';
      if (!idxAttr || idxAttr === 'logo') return;

      if (activeVideoIndex === idxAttr && sectionTitle.classList.contains(animVariationMap[idxAttr]?.class)) {
        return;
      }
      activeVideoIndex = idxAttr;

      const variation = animVariationMap[idxAttr] || { class: 'title-anim-v1', format: (t) => t };

      // Reset any manual inline styles from scroll fade
      sectionTitle.style.removeProperty('opacity');
      sectionTitle.style.removeProperty('--title-scroll-opacity');
      sectionTitle.style.transform = '';
      sectionTitle.style.filter = '';
      sectionTitle.style.letterSpacing = '';
      sectionTitle.style.visibility = 'inherit';

      // Reset classes and set formatted HTML content
      sectionTitle.className = 'font-items-mt-l text-3xl text-white';
      sectionTitle.innerHTML = variation.format(title);

      // Trigger reflow to restart CSS animation cleanly
      void sectionTitle.offsetWidth;

      sectionTitle.classList.add(variation.class);
    }

    const updateActivePanel = (panel) => {
      if (!panel) return;
      if (panel.classList.contains('text-cta') || panel.id === 'g-footer') {
        activeVideoIndex = null;
        if (header) header.setAttribute('data-header-color', 'text-black');
        if (sectionLogo) {
          sectionLogo.style.opacity = '0';
          sectionLogo.style.visibility = 'hidden';
        }
        if (sectionTitle) {
          sectionTitle.style.removeProperty('opacity');
          sectionTitle.style.opacity = '0';
          sectionTitle.style.visibility = 'hidden';
          sectionTitle.className = 'font-items-mt-l text-3xl text-white';
        }
        if (sectionSubtitle) {
          sectionSubtitle.style.removeProperty('opacity');
          sectionSubtitle.style.opacity = '0';
          sectionSubtitle.style.visibility = 'hidden';
        }
        if (sectorNav) {
          sectorNav.style.transform = 'translate(0px, 100%)';
          sectorNav.style.opacity = '0';
          sectorNav.style.pointerEvents = 'none';
        }
        return;
      }

      const idxAttr = panel.getAttribute('data-index');
      const isLogo = idxAttr === 'logo';
      const title = panel.getAttribute('data-title') || '';
      const subtitle = panel.getAttribute('data-subtitle') || '';
      const headerColor = panel.getAttribute('data-header-color') || (isLogo ? 'text-black' : 'text-white');

      // Update header color
      if (header) {
        header.setAttribute('data-header-color', headerColor);
      }

      if (isLogo) {
        activeVideoIndex = null;
        // Logo Hero state: Full visibility for large logo, hide sector title and nav
        if (sectionLogo) {
          sectionLogo.style.opacity = '1';
          sectionLogo.style.visibility = 'inherit';
          sectionLogo.style.transform = 'translateY(0px)';
          sectionLogo.style.pointerEvents = 'none';
        }
        if (sectionTitle) {
          sectionTitle.style.removeProperty('opacity');
          sectionTitle.style.opacity = '0';
          sectionTitle.style.visibility = 'hidden';
          sectionTitle.className = 'font-items-mt-l text-3xl text-white';
          sectionTitle.textContent = '';
        }
        if (sectionSubtitle) {
          sectionSubtitle.style.removeProperty('opacity');
          sectionSubtitle.style.opacity = '0';
          sectionSubtitle.style.visibility = 'hidden';
          sectionSubtitle.textContent = '';
        }
        if (sectorNav) {
          sectorNav.style.transform = 'translate(0px, 100%)';
          sectorNav.style.opacity = '0';
          sectorNav.style.pointerEvents = 'none';
        }
      } else {
        // Sector state: Hide large logo completely so it NEVER obscures videos!
        if (sectionLogo) {
          sectionLogo.style.opacity = '0';
          sectionLogo.style.visibility = 'hidden';
          sectionLogo.style.transform = 'translateY(-20px)';
          sectionLogo.style.pointerEvents = 'none';
        }
        // Trigger refined editorial typography entrance animation
        triggerTitleAnimation(panel);
        if (sectionSubtitle) {
          if (subtitle) {
            sectionSubtitle.textContent = subtitle;
            sectionSubtitle.style.opacity = '1';
            sectionSubtitle.style.visibility = 'inherit';
          } else {
            sectionSubtitle.style.opacity = '0';
            sectionSubtitle.style.visibility = 'hidden';
          }
        }
        if (sectorNav) {
          sectorNav.style.transform = 'translate(0px, 0%)';
          sectorNav.style.opacity = '1';
          sectorNav.style.pointerEvents = 'auto';
        }

        // Activate the corresponding sector's posts in bottom nav
        sectorPostsList.forEach(sp => {
          if (sp.getAttribute('data-sector-posts') === idxAttr) {
            sp.classList.remove('hidden');
            sp.classList.add('flex');
          } else {
            sp.classList.add('hidden');
            sp.classList.remove('flex');
          }
        });
      }
    };

    // IntersectionObserver to detect when a panel snaps into place
    const panelObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          updateActivePanel(entry.target);
        }
      });
    }, { threshold: 0.55 });

    snapPanels.forEach(panel => panelObserver.observe(panel));
    const ctaSection = document.querySelector('.text-cta');
    const footerSection = document.getElementById('g-footer');
    if (ctaSection) panelObserver.observe(ctaSection);
    if (footerSection) panelObserver.observe(footerSection);

    // Video IntersectionObserver: Smart playback (only play in-view video, pause offscreen)
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const vid = entry.target.querySelector('video') || (entry.target.tagName === 'VIDEO' ? entry.target : null);
        if (!vid) return;
        if (entry.isIntersecting) {
          vid.muted = true;
          const p = vid.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } else {
          vid.pause();
        }
      });
    }, {
      root: null,
      threshold: 0.15
    });

    snapPanels.forEach(panel => {
      if (panel.querySelector('video')) {
        videoObserver.observe(panel);
      }
    });



    // Snap Blur Dynamic Controller (Manyeo Studio Algorithm with GPU bypass)
    const overlay = document.querySelector('[data-overlay]');
    const overlayBlurs = document.querySelectorAll('[data-overlay-blur]');
    const logoVeil = document.querySelector('[data-logo-veil]');
    let isBlurVisible = true;

    const setSnapBlur = (px) => {
      const rounded = Math.round(px * 10) / 10;
      if (overlay) overlay.style.setProperty('--snap-blur', `${rounded}px`);
      const shouldShow = rounded >= 0.5;
      if (isBlurVisible !== shouldShow) {
        isBlurVisible = shouldShow;
        overlayBlurs.forEach(b => {
          b.style.display = shouldShow ? '' : 'none';
        });
      }
    };
    setSnapBlur(75);

    const updateSnapBlur = () => {
      if (!snapPanels || snapPanels.length === 0) return;
      const heroPanel = snapPanels[0];
      const heroTop = heroPanel.getBoundingClientRect().top;
      const vh = window.innerHeight;

      // 1. Hero panel state: 75px full smoky blur at bottom
      if (Math.abs(heroTop) < 2) {
        setSnapBlur(75);
        if (logoVeil) logoVeil.style.opacity = '0';
        return;
      }

      // 2. Transitions between panels
      for (let i = 0; i < snapPanels.length - 1; i++) {
        const nextPanel = snapPanels[i + 1];
        const nextTop = nextPanel.getBoundingClientRect().top;

        if (nextTop > 0 && nextTop < vh) {
          const progress = 1 - (nextTop / vh);
          if (i === 0) {
            // From hero to panel 1: fade blur from 75px down to 0px
            setSnapBlur(75 * (1 - progress));
          } else {
            // Between sector panels: subtle peak blur during mid-transition
            const mid = 0.4;
            setSnapBlur(75 * (progress < mid ? progress / mid : (1 - progress) / (1 - mid)));
          }
          if (logoVeil) logoVeil.style.opacity = '0';
          return;
        }
      }

      // 3. Past the last panel towards text-cta / footer: Tinted progressive orange atmospheric blur
      const lastPanel = snapPanels[snapPanels.length - 1];
      if (lastPanel) {
        const lastTop = lastPanel.getBoundingClientRect().top;
        if (lastTop < 0) {
          const progress = Math.min(1, -lastTop / (vh * 0.5));
          setSnapBlur(75 * progress);
          if (logoVeil) logoVeil.style.opacity = String(progress);
          return;
        }
      }

      setSnapBlur(0);
      if (logoVeil) logoVeil.style.opacity = '0';
    };

    // Dynamic scroll tracking with requestAnimationFrame to prevent layout thrashing
    if (contentWrapper) {
      let scrollTicking = false;

      const handleScroll = () => {
        const scrollTop = contentWrapper.scrollTop;
        const vh = window.innerHeight;

        // Dynamic snap blur interpolation
        updateSnapBlur();

        // When transitioning between panel 0 and panel 1
        if (scrollTop < vh * 0.6) {
          const fadeProgress = Math.min(1, Math.max(0, scrollTop / (vh * 0.35)));
          if (sectionLogo) {
            sectionLogo.style.opacity = String(1 - fadeProgress);
            sectionLogo.style.transform = `translateY(-${fadeProgress * 30}px)`;
            sectionLogo.style.visibility = fadeProgress >= 0.95 ? 'hidden' : 'inherit';
          }
          if (scrollTop <= 10) {
            const firstPanel = snapPanels[0];
            if (firstPanel && firstPanel.getAttribute('data-index') === 'logo') {
              updateActivePanel(firstPanel);
            }
          }
        } else {
          if (sectionLogo) {
            sectionLogo.style.opacity = '0';
            sectionLogo.style.visibility = 'hidden';
            sectionLogo.style.transform = 'translateY(-30px)';
          }
        }

        // Natural editorial scroll fade-out as active video leaves viewport
        if (activeVideoIndex && activeVideoIndex !== 'logo' && sectionTitle) {
          const activePanel = snapPanels.find(p => p.getAttribute('data-index') === activeVideoIndex);
          if (activePanel) {
            const rect = activePanel.getBoundingClientRect();
            const dist = Math.abs(rect.top);
            if (dist > vh * 0.08) {
              const fadeProgress = Math.min(1, Math.max(0, (dist - vh * 0.08) / (vh * 0.30)));
              const op = Math.max(0, 1 - fadeProgress);
              sectionTitle.style.setProperty('opacity', String(op), 'important');
              if (sectionSubtitle) {
                sectionSubtitle.style.setProperty('opacity', String(op), 'important');
              }
            } else if (dist <= vh * 0.04) {
              sectionTitle.style.removeProperty('opacity');
              if (sectionSubtitle) {
                sectionSubtitle.style.removeProperty('opacity');
              }
            }
          }
        }

        // Hide sectorNav when reaching the bottom text-cta / footer
        const lastSnapPanel = snapPanels[snapPanels.length - 1];
        if (lastSnapPanel) {
          const lastPanelTop = lastSnapPanel.offsetTop;
          if (scrollTop > lastPanelTop + vh * 0.2) {
            if (sectorNav) {
              sectorNav.style.transform = 'translate(0px, 100%)';
              sectorNav.style.opacity = '0';
              sectorNav.style.pointerEvents = 'none';
            }
            if (header) {
              header.setAttribute('data-header-color', 'text-black');
            }
          }
        }
      };

      contentWrapper.addEventListener('scroll', () => {
        if (!scrollTicking) {
          requestAnimationFrame(() => {
            handleScroll();
            scrollTicking = false;
          });
          scrollTicking = true;
        }
      }, { passive: true });

      window.addEventListener('resize', () => {
        if (!scrollTicking) {
          requestAnimationFrame(() => {
            updateSnapBlur();
            scrollTicking = false;
          });
          scrollTicking = true;
        }
      }, { passive: true });
    }
  }
});
