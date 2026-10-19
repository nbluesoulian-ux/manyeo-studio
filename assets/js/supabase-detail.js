/**
 * Manyeo Studio - Dynamic Project Detail Hydration
 * Loads project metadata, inside gallery visuals, backstory description,
 * and next project preview dynamically from Supabase / localStorage.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'manyeo_local_works_data';
  const DEFAULT_CONFIG = {
    supabaseUrl: 'https://kxlmdxvmcicbgengytoo.supabase.co',
    supabaseKey: 'sb_publishable_G_qnPRoc5FAomnq6vVKIGA_bKZx6q1V'
  };

  // 1. Determine requested slug from pathname or search param
  function getRequestedSlug() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('slug')) return urlParams.get('slug').trim();
    if (urlParams.get('id')) return urlParams.get('id').trim();

    const parts = window.location.pathname.replace(/\/+$/, '').split('/');
    const lastPart = parts.pop();
    if (lastPart && lastPart !== 'detail' && lastPart !== 'detail.html' && lastPart !== 'projects') {
      return lastPart;
    }
    return 'test_001';
  }

  // 2. Fetch config & works list
  async function loadWorks() {
    let url = DEFAULT_CONFIG.supabaseUrl;
    let key = DEFAULT_CONFIG.supabaseKey;

    try {
      const cfgRes = await fetch('/api/config');
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        if (cfg.supabaseUrl) url = cfg.supabaseUrl;
        if (cfg.supabaseKey) key = cfg.supabaseKey;
        else if (cfg.supabaseAnonKey) key = cfg.supabaseAnonKey;
      }
    } catch (e) {}

    // Try Supabase fetch
    if (url && key) {
      try {
        const cleanUrl = url.replace(/\/+$/, '');
        const res = await fetch(`${cleanUrl}/rest/v1/works?select=*&order=sort_order.asc`, {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
            return data;
          }
        }
      } catch (err) {
        console.warn('[Detail] Supabase fetch failed, falling back to local storage:', err);
      }
    }

    // Fallback to local storage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return [];
  }

  // 3. Hydrate detail DOM with project data
  function renderDetail(work, allWorks) {
    if (!work) return;

    // Page title & meta
    document.title = `Manyeo Studio - ${work.title || 'Project'}`;

    // Colors & background
    const bg = work.color_bg || '#1a1411';
    const textColor = work.color_text || '#ffffff';

    const detailsSection = document.getElementById('project-details');
    if (detailsSection) {
      detailsSection.style.backgroundColor = bg;
      detailsSection.setAttribute('data-color-bg', bg);
      detailsSection.setAttribute('data-color-text', textColor);
    }

    // Title
    const titleEl = document.getElementById('project-details-title');
    if (titleEl) {
      titleEl.textContent = work.title || 'Untitled Project';
      titleEl.style.color = textColor;
    }

    // Description / Backstory
    const descEl = document.getElementById('project-details-desc');
    if (descEl) {
      if (work.description && work.description.trim()) {
        const paragraphs = work.description
          .split(/\n\s*\n/)
          .map(p => p.trim())
          .filter(Boolean)
          .map(p => `<p>${escapeHtml(p)}</p>`)
          .join('');
        descEl.innerHTML = paragraphs;
      } else {
        // High-end studio default story
        descEl.innerHTML = `
          <p>${escapeHtml(work.title)} is an exploratory creative commission produced by Manyeo Studio. Combining avant-garde digital art direction with modern interactive development, this project explores the boundary between digital craftsmanship and functional experience.</p>
          <p>From initial concept through 3D visualization and creative motion, each visual asset was designed to deliver a distinctive and memorable brand presence.</p>
        `;
      }
      descEl.querySelectorAll('p').forEach(p => p.style.color = textColor);
    }

    // Services list
    const servicesContainer = document.getElementById('project-details-side-list-services');
    if (servicesContainer) {
      let tagsList = [];
      if (work.services && work.services.trim()) {
        tagsList = work.services.split(/[,•\n]+/).map(s => s.trim()).filter(Boolean);
      } else if (work.tags && work.tags.trim()) {
        tagsList = work.tags.split(/[,•\n]+/).map(s => s.trim()).filter(Boolean);
      } else {
        tagsList = ['Concept', 'Design', 'Development', '3D', 'Art Direction'];
      }

      servicesContainer.innerHTML = `
        <h4 class="project-details-side-list-title" style="color: ${textColor}; opacity: 0.85;">Services</h4>
        ${tagsList.map(t => `<div class="project-details-side-list-item" style="color: ${textColor}; text-transform: capitalize;">${escapeHtml(t)}</div>`).join('')}
      `;
    }

    // Launch Project CTA
    const launchUrl = work.live_url || (work.href && !work.href.startsWith('/projects/') ? work.href : null);
    const ctaBtns = [
      document.getElementById('project-details-launch-cta'),
      document.getElementById('project-details-launch-cta-mobile')
    ].filter(Boolean);

    ctaBtns.forEach(btn => {
      if (launchUrl) {
        btn.href = launchUrl;
        btn.target = '_blank';
        btn.style.display = 'inline-flex';
        btn.title = `Visit ${work.title}`;
      } else {
        btn.href = '/work';
        btn.removeAttribute('target');
        const textSpan = btn.querySelector('#project-details-launch-cta-text') || btn.querySelector('#project-details-launch-cta-mobile-text');
        if (textSpan) textSpan.textContent = 'View All Works';
      }
    });

    // Gallery Images (Inside pictures)
    renderGallery(work);

    // Next Project Preview
    renderNextProject(work, allWorks);

    // Header Back button
    const backBtn = document.getElementById('header-center-project-back-btn');
    if (backBtn) {
      backBtn.onclick = (e) => {
        e.preventDefault();
        window.location.href = '/work';
      };
    }
  }

  // 4. Render Gallery Images
  function renderGallery(work) {
    const moveContainer = document.getElementById('project-details-items-move-container');
    if (!moveContainer) return;

    let images = [];

    // Parse custom gallery
    if (work.gallery) {
      if (Array.isArray(work.gallery)) {
        images = work.gallery;
      } else if (typeof work.gallery === 'string') {
        try {
          const parsed = JSON.parse(work.gallery);
          if (Array.isArray(parsed)) images = parsed;
        } catch (e) {
          images = work.gallery.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
        }
      }
    }

    // If no custom gallery, use primary image_url
    if (images.length === 0 && work.image_url) {
      images.push(work.image_url);
    }

    // If still empty, use fallback high-res artwork
    if (images.length === 0) {
      images.push('/assets/projects/oryzo_ai/home.webp');
    }

    moveContainer.innerHTML = `
      <div class="custom-gallery-wrapper" style="display: flex; flex-direction: column; gap: 48px; width: 100%; max-width: 960px; margin: 30px auto; position: relative; z-index: 10; padding: 0 20px;">
        ${images.map((imgSrc, idx) => `
          <div class="custom-gallery-card" style="background: rgba(255, 255, 255, 0.04); border-radius: 20px; overflow: hidden; box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.65); border: 1px solid rgba(255, 255, 255, 0.12); transition: transform 0.4s ease;">
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(work.title)} - Visual ${idx + 1}" 
                 style="width: 100%; height: auto; display: block; object-fit: cover;" 
                 loading="lazy" onerror="this.parentElement.style.display='none'">
          </div>
        `).join('')}
      </div>
    `;
  }

  // 5. Render Next Project preview footer
  function renderNextProject(currentWork, allWorks) {
    const previewEl = document.getElementById('project-details-preview');
    const previewTitle = document.getElementById('project-details-preview-title');
    if (!previewEl || !allWorks || allWorks.length === 0) return;

    const currIdx = allWorks.findIndex(w => w.id === currentWork.id || w.slug === currentWork.slug);
    const nextWork = allWorks[(currIdx + 1) % allWorks.length] || allWorks[0];

    if (nextWork && nextWork.id !== currentWork.id) {
      if (previewTitle) previewTitle.textContent = nextWork.title;
      previewEl.setAttribute('data-next-id', nextWork.slug || nextWork.id);
      previewEl.setAttribute('data-next-color-bg', nextWork.color_bg || '#181818');
      previewEl.setAttribute('data-next-color-text', nextWork.color_text || '#FFFDE0');
      previewEl.style.cursor = 'pointer';

      previewEl.onclick = (e) => {
        e.preventDefault();
        window.location.href = `/projects/${nextWork.slug || nextWork.id}`;
      };
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Initialization
  async function init() {
    const slug = getRequestedSlug();
    const works = await loadWorks();

    // Match by slug or id
    let matched = works.find(w => (w.slug && w.slug.toLowerCase() === slug.toLowerCase()) || (w.id && w.id.toLowerCase() === slug.toLowerCase()));

    if (!matched) {
      matched = {
        id: slug,
        slug: slug,
        title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/_/g, ' '),
        tags: 'Concept • Design • Development • 3D',
        color_bg: '#181818',
        color_text: '#ffffff',
        image_url: '/assets/projects/oryzo_ai/home.webp'
      };
    }

    // Merge custom detail overrides (description, gallery, live_url)
    try {
      const customStore = JSON.parse(localStorage.getItem('manyeo_custom_details') || '{}');
      const custom = customStore[matched.slug] || customStore[matched.id];
      if (custom) {
        if (custom.description) matched.description = custom.description;
        if (custom.gallery) matched.gallery = custom.gallery;
        if (custom.live_url) matched.live_url = custom.live_url;
      }
    } catch (e) {}

    renderDetail(matched, works);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
})();
