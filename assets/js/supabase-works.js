/**
 * Manyeo Studio - Supabase Works Live Integration
 * Synchronizes works in real-time from Supabase (kxlmdxvmcicbgengytoo).
 * Full CRUD is managed securely via the Supabase Dashboard.
 * Frontend is 100% clean, visitor-safe, with zero exposed admin buttons.
 */

(function () {
  'use strict';

  const DEFAULT_SUPABASE_URL = 'https://kxlmdxvmcicbgengytoo.supabase.co';
  const DEFAULT_SUPABASE_KEY = 'sb_publishable_G_qnPRoc5FAomnq6vVKIGA_bKZx6q1V';
  const CACHE_KEY = 'manyeo_works_cache';

  let supabaseUrl = DEFAULT_SUPABASE_URL;
  let supabaseKey = DEFAULT_SUPABASE_KEY;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function fetchWorksFromSupabase() {
    // 1. Try to read runtime config from /api/config if deployed on Vercel
    try {
      const cfgRes = await fetch('/api/config');
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        if (cfg.supabaseUrl) supabaseUrl = cfg.supabaseUrl;
        if (cfg.supabaseKey) supabaseKey = cfg.supabaseKey;
      }
    } catch (_) {}

    // 2. Fetch live works ordered by sort_order
    try {
      const cleanUrl = supabaseUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/rest/v1/works?select=*&order=sort_order.asc`, {
        method: 'GET',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        }
      });

      if (!res.ok) {
        throw new Error(`Supabase HTTP ${res.status}: ${res.statusText}`);
      }

      const works = await res.json();
      if (Array.isArray(works) && works.length > 0) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(works));
        } catch (_) {}
        return works;
      }
    } catch (err) {
      console.warn('[Supabase Sync] Could not fetch live works, using cache:', err.message);
    }

    // 3. Fallback to localStorage cache if network fails
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (_) {}

    return null;
  }

  function syncWorksToDOM(works) {
    if (!Array.isArray(works) || works.length === 0) return;

    const container = document.querySelector('.project-list');
    if (!container) return;

    // Update total count in header
    const countEl = document.getElementById('projects-main-title-project-number');
    if (countEl) {
      countEl.textContent = works.length;
    }

    const workMap = new Map();
    works.forEach(w => {
      const id = w.id || w.slug;
      if (id) workMap.set(String(id), w);
    });

    // 1. Remove deleted works
    const existingCards = Array.from(container.querySelectorAll('.project-item'));
    existingCards.forEach(el => {
      const id = el.getAttribute('data-id');
      if (id && !workMap.has(id)) {
        el.remove();
      }
    });

    // 2. Update existing works or append new ones in correct sort_order
    works.forEach(item => {
      const id = item.id || item.slug;
      const href = item.href || ('/projects/' + (item.slug || id));
      const bg = item.color_bg || '#111111';
      const text = item.color_text || '#ffffff';
      const shadow = item.color_shadow != null ? item.color_shadow : 0.9;
      const tags = item.tags || '';
      const title = item.title || '';
      const imageUrl = item.image_url || '';

      let el = container.querySelector(`.project-item[data-id="${id}"]`);

      if (el) {
        // Update attributes in-place to preserve 3D WebGL event listeners
        el.setAttribute('href', href);
        el.setAttribute('data-color-bg', bg);
        el.setAttribute('data-color-text', text);
        el.setAttribute('data-color-shadow', shadow);

        const main = el.querySelector('.project-item-main');
        if (main) main.style.backgroundColor = bg;

        const img = el.querySelector('.project-item-image');
        if (img && imageUrl && !img.style.backgroundImage) {
          img.style.backgroundImage = `url('${imageUrl}')`;
        }

        const line1 = el.querySelector('.project-item-line-1');
        if (line1 && line1.textContent !== tags) {
          line1.textContent = tags;
        }

        const line2Inner = el.querySelector('.project-item-line-2-inner');
        if (line2Inner && !line2Inner.querySelector('.project-item-line-2-inner-list') && line2Inner.textContent !== title) {
          line2Inner.textContent = title;
        }

        container.appendChild(el);
      } else {
        // Create new project card
        el = document.createElement('a');
        el.className = 'project-item project-type-website';
        el.setAttribute('href', href);
        el.setAttribute('data-id', id);
        el.setAttribute('data-color-bg', bg);
        el.setAttribute('data-color-text', text);
        el.setAttribute('data-color-shadow', shadow);

        const bgStyle = imageUrl ? `background-image: url('${escapeHtml(imageUrl)}'); background-size: cover; background-position: center;` : '';

        el.innerHTML = `
          <div class="project-item-main" style="background-color: ${escapeHtml(bg)}; border-radius: 15px; overflow: hidden;">
            <div class="project-item-image" style="${bgStyle}"></div>
          </div>
          <div class="project-item-footer">
            <div class="project-item-line-1">${escapeHtml(tags)}</div>
            <div class="project-item-line-2">
              <div class="project-item-line-2-icon"></div>
              <div class="project-item-line-2-inner">${escapeHtml(title)}</div>
            </div>
          </div>
        `;
        container.appendChild(el);
      }
    });
  }

  async function init() {
    const works = await fetchWorksFromSupabase();
    if (works) {
      syncWorksToDOM(works);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
