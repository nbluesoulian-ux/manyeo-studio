/**
 * Manyeo Studio - Supabase Works CRUD Integration
 * Connects to Supabase REST API (PostgREST) to manage portfolio works dynamically.
 * Features:
 * - Vercel Environment Variables Auto-Detection (/api/config)
 * - Public Visitor Mode (clean, zero admin buttons)
 * - Secret Admin Mode (activated via ?admin=true or Ctrl+Shift+A)
 * - LocalStorage fallback for instant offline/preview functionality
 */

(function () {
  'use strict';

  // --- Configuration & State ---
  const STORAGE_KEYS = {
    URL: 'manyeo_supabase_url',
    KEY: 'manyeo_supabase_anon_key',
    DATA: 'manyeo_local_works_data',
    MANAGE_MODE: 'manyeo_manage_mode',
    ADMIN_AUTH: 'manyeo_admin_authenticated'
  };

  // Check URL query parameters for admin activation
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('admin') === 'true' || urlParams.get('admin') === '1') {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
  }

  const state = {
    supabaseUrl: localStorage.getItem(STORAGE_KEYS.URL) || 'https://kxlmdxvmcicbgengytoo.supabase.co',
    supabaseKey: localStorage.getItem(STORAGE_KEYS.KEY) || 'sb_publishable_G_qnPRoc5FAomnq6vVKIGA_bKZx6q1V',
    works: [],
    isConnected: false,
    isAdmin: localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true',
    isManageMode: localStorage.getItem(STORAGE_KEYS.MANAGE_MODE) === 'true',
    editingWorkId: null
  };

  // Default seed dataset (19 projects)
  const DEFAULT_SEED_WORKS = [
    {
      id: 'oryzo_ai',
      slug: 'oryzo_ai',
      title: 'Oryzo AI',
      tags: 'concept • web • design • development • 3d • animation',
      href: '/projects/oryzo_ai',
      image_url: '/assets/projects/oryzo_ai/home.webp',
      depth_image_url: '/assets/projects/oryzo_ai/home_depth.webp',
      color_bg: '#1a1411',
      color_text: '#ffedd7',
      color_shadow: 0.9,
      sort_order: 1
    },
    {
      id: 'atlas_motion',
      slug: 'atlas_motion',
      title: 'Atlas Motion',
      tags: 'concept • web • design • development • 3d • animation',
      href: '/projects/atlas_motion',
      image_url: '/assets/projects/atlas_motion/home.webp',
      depth_image_url: '/assets/projects/atlas_motion/home_depth.webp',
      color_bg: '#181818',
      color_text: '#FFFDE0',
      color_shadow: 0.95,
      sort_order: 2
    },
    {
      id: 'devin_ai',
      slug: 'devin_ai',
      title: 'Devin AI',
      tags: 'web • design • development • 3d',
      href: '/projects/devin_ai',
      image_url: '/assets/projects/devin_ai/home.webp',
      depth_image_url: '/assets/projects/devin_ai/home_depth.webp',
      color_bg: '#121414',
      color_text: '#ffffff',
      color_shadow: 0.9,
      sort_order: 3
    },
    {
      id: 'of_the_oak',
      slug: 'of_the_oak',
      title: 'Of The Oak',
      tags: 'web • design • development • 3d • animation',
      href: '/projects/of_the_oak',
      image_url: '/assets/projects/of_the_oak/home.webp',
      depth_image_url: '/assets/projects/of_the_oak/home_depth.webp',
      color_bg: '#111a13',
      color_text: '#d9f3de',
      color_shadow: 0.9,
      sort_order: 4
    },
    {
      id: 'everswap',
      slug: 'everswap',
      title: 'Everswap',
      tags: 'concept • web • design • development • 3d • animation',
      href: '/projects/everswap',
      image_url: '/assets/projects/everswap/home.webp',
      depth_image_url: '/assets/projects/everswap/home_depth.webp',
      color_bg: '#E3E3F8',
      color_text: '#000',
      color_shadow: 0.95,
      sort_order: 5
    },
    {
      id: 'porsche_dream_machine',
      slug: 'porsche_dream_machine',
      title: 'Porsche: Dream Machine',
      tags: 'concept • 3D illustration • mograph • video',
      href: '/projects/porsche_dream_machine',
      image_url: '/assets/projects/porsche_dream_machine/home.webp',
      depth_image_url: '/assets/projects/porsche_dream_machine/home_depth.webp',
      color_bg: '#EFD5D3',
      color_text: '#000000',
      color_shadow: 0.95,
      sort_order: 6
    },
    {
      id: 'synthetic_human',
      slug: 'synthetic_human',
      title: 'Synthetic Human',
      tags: 'web • design • development • 3d',
      href: '/projects/synthetic_human',
      image_url: '/assets/projects/synthetic_human/home.webp',
      depth_image_url: '/assets/projects/synthetic_human/home_depth.webp',
      color_bg: '#9d8aff',
      color_text: '#ffffff',
      color_shadow: 0.95,
      sort_order: 7
    },
    {
      id: 'ddd_2024',
      slug: 'ddd_2024',
      title: 'DDD 2024',
      tags: 'web • design • development • 3d',
      href: '/projects/ddd_2024',
      image_url: '/assets/projects/ddd_2024/home.webp',
      depth_image_url: '/assets/projects/ddd_2024/home_depth.webp',
      color_bg: '#261c46',
      color_text: '#ffffff',
      color_shadow: 0.95,
      sort_order: 8
    },
    {
      id: 'spaace',
      slug: 'spaace',
      title: 'Spaace - NFT Marketplace',
      tags: 'web • design • development • 3d • web3',
      href: '/projects/spaace',
      image_url: '/assets/projects/spaace/home.webp',
      depth_image_url: '/assets/projects/spaace/home_depth.webp',
      color_bg: '#010a16',
      color_text: '#ffece2',
      color_shadow: 0.85,
      sort_order: 9
    },
    {
      id: 'choo_choo_world',
      slug: 'choo_choo_world',
      title: 'Choo Choo World',
      tags: 'concept • web • game design • 3d',
      href: '/projects/choo_choo_world',
      image_url: '/assets/projects/choo_choo_world/home.webp',
      depth_image_url: '/assets/projects/choo_choo_world/home_depth.webp',
      color_bg: '#E8EEF8',
      color_text: '#000000',
      color_shadow: 0.95,
      sort_order: 10
    },
    {
      id: 'zero_tech',
      slug: 'zero_tech',
      title: 'Zero Tech',
      tags: 'web • design • development • 3d',
      href: '/projects/zero_tech',
      image_url: '/assets/projects/zero_tech/home.webp',
      depth_image_url: '/assets/projects/zero_tech/home_depth.webp',
      color_bg: '#192743',
      color_text: '#ffffff',
      color_shadow: 0.9,
      sort_order: 11
    },
    {
      id: 'spatial_fusion',
      slug: 'spatial_fusion',
      title: 'Meta: Spatial Fusion',
      tags: 'web • design • development • 3d',
      href: '/projects/spatial_fusion',
      image_url: '/assets/projects/spatial_fusion/home.webp',
      depth_image_url: '/assets/projects/spatial_fusion/home_depth.webp',
      color_bg: '#D6C8ED',
      color_text: '#000000',
      color_shadow: 0.95,
      sort_order: 12
    },
    {
      id: 'worldcoin',
      slug: 'worldcoin',
      title: 'Worldcoin Globe',
      tags: 'api design • webgl • 3d',
      href: '/projects/worldcoin',
      image_url: '/assets/projects/worldcoin/home.webp',
      depth_image_url: '/assets/projects/worldcoin/home_depth.webp',
      color_bg: '#F3F4F9',
      color_text: '#000000',
      color_shadow: 0.975,
      sort_order: 13
    },
    {
      id: 'lusion_labs',
      slug: 'lusion_labs',
      title: 'Manyeo Labs',
      tags: 'web • design • development • 3d',
      href: '/projects/lusion_labs',
      image_url: '/assets/projects/lusion_labs/home.webp',
      depth_image_url: '/assets/projects/lusion_labs/home_depth.webp',
      color_bg: '#1F2022',
      color_text: '#ffffff',
      color_shadow: 0.85,
      sort_order: 14
    },
    {
      id: 'my_little_story_book',
      slug: 'my_little_story_book',
      title: 'My Little Storybook',
      tags: 'concept • design • development • 3d',
      href: '/projects/my_little_story_book',
      image_url: '/assets/projects/my_little_story_book/home.webp',
      depth_image_url: '/assets/projects/my_little_story_book/home_depth.webp',
      color_bg: '#D1DDF2',
      color_text: '#000000',
      color_shadow: 0.95,
      sort_order: 15
    },
    {
      id: 'soda_experience',
      slug: 'soda_experience',
      title: 'Soda Experience',
      tags: 'AR • development • 3d',
      href: '/projects/soda_experience',
      image_url: '/assets/projects/soda_experience/home.webp',
      depth_image_url: '/assets/projects/soda_experience/home_depth.webp',
      color_bg: '#E1E2E4',
      color_text: '#000000',
      color_shadow: 0.85,
      sort_order: 16
    },
    {
      id: 'infinite_passerella',
      slug: 'infinite_passerella',
      title: 'Infinite Passerella',
      tags: 'concept • design • development • 3d',
      href: '/projects/infinite_passerella',
      image_url: '/assets/projects/infinite_passerella/home.webp',
      depth_image_url: '/assets/projects/infinite_passerella/home_depth.webp',
      color_bg: '#28262B',
      color_text: '#ffffff',
      color_shadow: 0.9,
      sort_order: 17
    },
    {
      id: 'the_turn_of_the_screw',
      slug: 'the_turn_of_the_screw',
      title: 'The Turn Of The Screw',
      tags: 'design • development • 3d',
      href: '/projects/the_turn_of_the_screw',
      image_url: '/assets/projects/the_turn_of_the_screw/home.webp',
      depth_image_url: '/assets/projects/the_turn_of_the_screw/home_depth.webp',
      color_bg: '#2B3037',
      color_text: '#ffffff',
      color_shadow: 0.85,
      sort_order: 18
    },
    {
      id: 'maxmara_bearings_gifts',
      slug: 'maxmara_bearings_gifts',
      title: 'Max Mara: Bearing Gifts',
      tags: 'development • 3D',
      href: '/projects/maxmara_bearings_gifts',
      image_url: '/assets/projects/maxmara_bearings_gifts/home.webp',
      depth_image_url: '/assets/projects/maxmara_bearings_gifts/home_depth.webp',
      color_bg: '#d2c6b2',
      color_text: '#000000',
      color_shadow: 0.95,
      sort_order: 19
    }
  ];

  // --- Supabase API Methods ---
  const api = {
    getHeaders() {
      return {
        apikey: state.supabaseKey,
        Authorization: `Bearer ${state.supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      };
    },

    async fetchWorks() {
      if (!state.supabaseUrl || !state.supabaseKey) {
        return this.getLocalWorks();
      }

      try {
        const cleanUrl = state.supabaseUrl.replace(/\/+$/, '');
        const res = await fetch(`${cleanUrl}/rest/v1/works?select=*&order=sort_order.asc`, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (!res.ok) {
          throw new Error(`Supabase error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        state.isConnected = true;
        this.saveLocalWorks(data);
        return data;
      } catch (err) {
        console.warn('[Supabase API] Falling back to local storage:', err.message);
        state.isConnected = false;
        return this.getLocalWorks();
      }
    },

    async createWork(workData) {
      if (!workData.id) {
        workData.id = (workData.title || 'project')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/(^_|_$)/g, '') + '_' + Date.now().toString(36);
      }
      if (!workData.slug) workData.slug = workData.id;
      if (!workData.href) workData.href = `/projects/${workData.slug}`;
      if (!workData.sort_order) workData.sort_order = (state.works.length + 1);

      if (state.supabaseUrl && state.supabaseKey) {
        try {
          const cleanUrl = state.supabaseUrl.replace(/\/+$/, '');
          const res = await fetch(`${cleanUrl}/rest/v1/works`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(workData)
          });

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Failed to create on Supabase: ${errText}`);
          }
          const created = await res.json();
          const item = Array.isArray(created) ? created[0] : workData;
          state.works.push(item);
          this.saveLocalWorks(state.works);
          return item;
        } catch (err) {
          console.error('[Supabase API] Create error:', err);
          showToast(`Supabase insert failed: ${err.message}. Saved locally.`, 'error');
        }
      }

      // Local fallback
      state.works.push(workData);
      this.saveLocalWorks(state.works);
      return workData;
    },

    async updateWork(id, updateData) {
      if (state.supabaseUrl && state.supabaseKey) {
        try {
          const cleanUrl = state.supabaseUrl.replace(/\/+$/, '');
          const res = await fetch(`${cleanUrl}/rest/v1/works?id=eq.${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(updateData)
          });

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Failed to update on Supabase: ${errText}`);
          }
          const updated = await res.json();
          const item = Array.isArray(updated) ? updated[0] : updateData;
          const idx = state.works.findIndex(w => w.id === id);
          if (idx !== -1) {
            state.works[idx] = Object.assign({}, state.works[idx], item);
            this.saveLocalWorks(state.works);
          }
          return state.works[idx];
        } catch (err) {
          console.error('[Supabase API] Update error:', err);
          showToast(`Supabase update failed: ${err.message}. Updated locally.`, 'error');
        }
      }

      // Local fallback
      const idx = state.works.findIndex(w => w.id === id);
      if (idx !== -1) {
        state.works[idx] = Object.assign({}, state.works[idx], updateData);
        this.saveLocalWorks(state.works);
        return state.works[idx];
      }
      return null;
    },

    async deleteWork(id) {
      if (state.supabaseUrl && state.supabaseKey) {
        try {
          const cleanUrl = state.supabaseUrl.replace(/\/+$/, '');
          const res = await fetch(`${cleanUrl}/rest/v1/works?id=eq.${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: this.getHeaders()
          });

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Failed to delete on Supabase: ${errText}`);
          }
        } catch (err) {
          console.error('[Supabase API] Delete error:', err);
          showToast(`Supabase delete failed: ${err.message}. Removed locally.`, 'error');
        }
      }

      // Local fallback
      state.works = state.works.filter(w => w.id !== id);
      this.saveLocalWorks(state.works);
      return true;
    },

    async testConnection(url, key) {
      const cleanUrl = (url || '').replace(/\/+$/, '');
      if (!cleanUrl || !key) return { ok: false, message: 'URL and Anon Key are required.' };
      try {
        const t0 = performance.now();
        const res = await fetch(`${cleanUrl}/rest/v1/works?select=id&limit=1`, {
          method: 'GET',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`
          }
        });
        const latency = Math.round(performance.now() - t0);
        if (res.ok) {
          return { ok: true, latency };
        }
        const text = await res.text();
        return { ok: false, message: `HTTP ${res.status}: ${text}` };
      } catch (err) {
        return { ok: false, message: err.message };
      }
    },

    async syncAllToSupabase() {
      if (!state.supabaseUrl || !state.supabaseKey) {
        throw new Error('Supabase URL & Key required to sync.');
      }
      const cleanUrl = state.supabaseUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/rest/v1/works`, {
        method: 'POST',
        headers: Object.assign({}, this.getHeaders(), {
          Prefer: 'resolution=merge-duplicates'
        }),
        body: JSON.stringify(state.works)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Sync failed: ${text}`);
      }
      return true;
    },

    getLocalWorks() {
      const saved = localStorage.getItem(STORAGE_KEYS.DATA);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      this.saveLocalWorks(DEFAULT_SEED_WORKS);
      return DEFAULT_SEED_WORKS;
    },

    saveLocalWorks(works) {
      try {
        localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(works));
      } catch (e) {}
    }
  };

  // --- UI Components & Rendering ---
  function renderWorkCards() {
    const container = document.querySelector('.project-list');
    if (!container || !Array.isArray(state.works) || state.works.length === 0) return;

    // Update count title
    const countEl = document.getElementById('projects-main-title-project-number');
    if (countEl) {
      countEl.textContent = state.works.length;
    }

    const isManage = state.isAdmin && state.isManageMode;
    const workMap = new Map();
    state.works.forEach(w => workMap.set(w.id, w));

    // 1. Remove deleted items
    const existingCards = Array.from(container.querySelectorAll('.project-item'));
    existingCards.forEach(el => {
      const id = el.getAttribute('data-id');
      if (id && !workMap.has(id)) {
        el.remove();
      }
    });

    // 2. Reconcile existing cards and append new cards in sort_order
    state.works.forEach((item) => {
      let el = container.querySelector(`.project-item[data-id="${item.id}"]`);
      const href = item.href || ('/projects/' + item.slug);
      const bg = item.color_bg || '#111111';
      const text = item.color_text || '#ffffff';
      const shadow = item.color_shadow || 0.9;
      const bgStyle = item.image_url ? `background-image: url('${item.image_url}'); background-size: cover; background-position: center;` : '';

      if (el) {
        // Update attributes without destroying DOM node
        el.setAttribute('href', href);
        el.setAttribute('data-color-bg', bg);
        el.setAttribute('data-color-text', text);
        el.setAttribute('data-color-shadow', shadow);

        const main = el.querySelector('.project-item-main');
        if (main && bg) main.style.backgroundColor = bg;

        const img = el.querySelector('.project-item-image');
        if (img && item.image_url && !img.style.backgroundImage) {
          img.style.backgroundImage = `url('${item.image_url}')`;
          img.style.backgroundSize = 'cover';
          img.style.backgroundPosition = 'center';
        }

        const line1 = el.querySelector('.project-item-line-1');
        if (line1 && item.tags && line1.textContent !== item.tags) {
          line1.textContent = item.tags;
        }

        const line2Inner = el.querySelector('.project-item-line-2-inner');
        if (line2Inner && item.title && !line2Inner.querySelector('.project-item-line-2-inner-list') && line2Inner.textContent !== item.title) {
          line2Inner.textContent = item.title;
        }

        // Reposition in DOM order
        container.appendChild(el);
      } else {
        // Create new project card element (direct child of .project-list)
        el = document.createElement('a');
        el.className = `project-item project-type-website ${isManage ? 'is-manage-active' : ''}`;
        el.setAttribute('href', href);
        el.setAttribute('data-id', item.id);
        el.setAttribute('data-color-bg', bg);
        el.setAttribute('data-color-text', text);
        el.setAttribute('data-color-shadow', shadow);
        el.style.position = 'relative';

        el.innerHTML = `
          <div class="project-item-main" style="background-color: ${bg}; border-radius: 15px; overflow: hidden;">
            <div class="project-item-image" style="${bgStyle}"></div>
          </div>
          <div class="project-item-footer">
            <div class="project-item-line-1">${escapeHtml(item.tags || '')}</div>
            <div class="project-item-line-2">
              <div class="project-item-line-2-icon"></div>
              <div class="project-item-line-2-inner">${escapeHtml(item.title || '')}</div>
            </div>
          </div>
        `;
        container.appendChild(el);
      }

      // Handle Manage Mode overlay buttons on card
      let actions = el.querySelector('.project-manage-actions');
      if (isManage) {
        el.classList.add('is-manage-active');
        if (!actions) {
          actions = document.createElement('div');
          actions.className = 'project-manage-actions';
          actions.style.cssText = 'position: absolute; top: 14px; right: 14px; z-index: 50; display: flex; gap: 8px; pointer-events: auto;';
          actions.innerHTML = `
            <button type="button" class="btn-manage-edit" data-action="edit" data-id="${item.id}" title="Edit Work"
              style="background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px); color: #fff; border: 1px solid rgba(255,255,255,0.25); border-radius: 9999px; padding: 6px 14px; font-size: 0.75rem; font-weight: 500; cursor: pointer; transition: all 0.2s; letter-spacing: 0.05em; text-transform: uppercase;">
              Edit
            </button>
            <button type="button" class="btn-manage-delete" data-action="delete" data-id="${item.id}" title="Delete Work"
              style="background: rgba(230, 42, 52, 0.85); backdrop-filter: blur(8px); color: #fff; border: none; border-radius: 9999px; padding: 6px 14px; font-size: 0.75rem; font-weight: 500; cursor: pointer; transition: all 0.2s; letter-spacing: 0.05em; text-transform: uppercase;">
              Delete
            </button>
          `;
          el.appendChild(actions);
        }
      } else {
        el.classList.remove('is-manage-active');
        if (actions) actions.remove();
      }
    });

    // Attach edit/delete event listeners when manage mode is active
    if (isManage) {
      container.querySelectorAll('.btn-manage-edit').forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          openEditModal(id);
        };
      });

      container.querySelectorAll('.btn-manage-delete').forEach(btn => {
        btn.onclick = async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const work = state.works.find(w => w.id === id);
          if (confirm(`Are you sure you want to delete "${work ? work.title : id}"?`)) {
            await api.deleteWork(id);
            renderWorkCards();
            showToast('Work deleted successfully.', 'success');
          }
        };
      });
    }
  }

  // --- CRUD Control Bar & Modals ---
  function injectCRUDControls() {
    if (document.getElementById('manyeo-crud-bar')) return;

    // Floating action bar (Hidden by default unless admin)
    const bar = document.createElement('aside');
    bar.id = 'manyeo-crud-bar';
    bar.setAttribute('aria-label', 'Works CRUD Management');
    bar.style.display = state.isAdmin ? 'block' : 'none';
    bar.innerHTML = `
      <div class="crud-bar-inner">
        <button id="crud-btn-add" class="crud-btn crud-btn-primary" title="Add New Work">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M8 2v12M2 8h12"/></svg>
          <span>Add Work</span>
        </button>

        <button id="crud-btn-manage" class="crud-btn ${state.isManageMode ? 'is-active' : ''}" title="Toggle Edit/Delete Mode">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="8" r="3"></circle>
            <path d="M13.5 8a5.5 5.5 0 0 0-.2-1.4l1.3-1-1.3-2.2-1.6.6a5.5 5.5 0 0 0-2.4-1.4L9 1H7l-.3 1.6A5.5 5.5 0 0 0 4.3 4L2.7 3.4 1.4 5.6l1.3 1a5.5 5.5 0 0 0 0 2.8l-1.3 1 1.3 2.2 1.6-.6a5.5 5.5 0 0 0 2.4 1.4L7 15h2l.3-1.6a5.5 5.5 0 0 0 2.4-1.4l1.6.6 1.3-2.2-1.3-1c.1-.4.2-.9.2-1.4z"/>
          </svg>
          <span>${state.isManageMode ? 'Exit Manage' : 'Manage'}</span>
        </button>

        <button id="crud-btn-supabase" class="crud-btn" title="Supabase API Connection">
          <span class="status-indicator ${state.isConnected ? 'is-connected' : 'is-local'}"></span>
          <span>Supabase API</span>
        </button>

        <a href="/admin" target="_blank" id="crud-btn-dashboard" class="crud-btn" title="Open Dedicated Admin Dashboard" style="text-decoration:none; color:inherit;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <span>Dashboard</span>
        </a>

        <button id="crud-btn-exit-admin" class="crud-btn crud-btn-ghost" title="Exit Admin Mode (Hide Bar)">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4L4 12M4 4l8 8"/></svg>
          <span>Exit Admin</span>
        </button>
      </div>
    `;

    document.body.appendChild(bar);

    // Event handlers
    document.getElementById('crud-btn-add').addEventListener('click', () => openWorkModal());
    document.getElementById('crud-btn-manage').addEventListener('click', toggleManageMode);
    document.getElementById('crud-btn-supabase').addEventListener('click', openSupabaseModal);
    document.getElementById('crud-btn-exit-admin').addEventListener('click', exitAdminMode);

    injectModalStyles();
    injectModalContainer();
  }

  function toggleAdminMode() {
    state.isAdmin = !state.isAdmin;
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, state.isAdmin ? 'true' : 'false');
    const bar = document.getElementById('manyeo-crud-bar');
    if (bar) bar.style.display = state.isAdmin ? 'block' : 'none';
    if (!state.isAdmin) state.isManageMode = false;
    renderWorkCards();
    showToast(state.isAdmin ? 'Admin Mode Activated (Ctrl+Shift+A to toggle)' : 'Admin Mode Exited', state.isAdmin ? 'success' : 'info');
  }

  function exitAdminMode() {
    state.isAdmin = false;
    state.isManageMode = false;
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'false');
    localStorage.setItem(STORAGE_KEYS.MANAGE_MODE, 'false');
    const bar = document.getElementById('manyeo-crud-bar');
    if (bar) bar.style.display = 'none';
    renderWorkCards();
    showToast('Admin Mode Exited. Public visitor view active.', 'info');
  }

  function toggleManageMode() {
    state.isManageMode = !state.isManageMode;
    localStorage.setItem(STORAGE_KEYS.MANAGE_MODE, state.isManageMode ? 'true' : 'false');
    const manageBtn = document.getElementById('crud-btn-manage');
    if (manageBtn) {
      manageBtn.classList.toggle('is-active', state.isManageMode);
      manageBtn.querySelector('span').textContent = state.isManageMode ? 'Exit Manage' : 'Manage';
    }
    renderWorkCards();
    showToast(state.isManageMode ? 'Manage mode enabled: Edit or Delete cards directly.' : 'Manage mode exited.', 'info');
  }

  function injectModalContainer() {
    if (document.getElementById('manyeo-modal-root')) return;

    const modalRoot = document.createElement('div');
    modalRoot.id = 'manyeo-modal-root';
    modalRoot.innerHTML = `
      <!-- Work Form Modal (Create / Edit) -->
      <div id="modal-work-form" class="manyeo-modal-backdrop" style="display: none;">
        <div class="manyeo-modal-card">
          <div class="manyeo-modal-header">
            <h3 id="modal-work-title">Add New Work</h3>
            <button type="button" class="modal-close-btn" data-close="modal-work-form">&times;</button>
          </div>
          <form id="form-work" class="manyeo-modal-body">
            <div class="form-group">
              <label for="work-input-title">Project Title *</label>
              <input id="work-input-title" type="text" required placeholder="e.g. Celestial Horizon">
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label for="work-input-slug">Slug / ID *</label>
                <input id="work-input-slug" type="text" required placeholder="e.g. celestial_horizon">
              </div>
              <div class="form-group flex-1">
                <label for="work-input-sort">Sort Order</label>
                <input id="work-input-sort" type="number" min="1" value="1">
              </div>
            </div>

            <div class="form-group">
              <label for="work-input-tags">Categories / Tags</label>
              <input id="work-input-tags" type="text" placeholder="e.g. concept • 3D • web • animation">
            </div>

            <div class="form-group">
              <label for="work-input-image">Thumbnail Image URL</label>
              <input id="work-input-image" type="text" placeholder="https://... or /assets/projects/.../home.webp">
              <small class="form-hint">Paste an image URL or use any external image link.</small>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label for="work-input-color-bg">Background Color</label>
                <div class="color-picker-wrap">
                  <input id="work-input-color-bg-picker" type="color" value="#1a1411">
                  <input id="work-input-color-bg" type="text" value="#1a1411">
                </div>
              </div>
              <div class="form-group flex-1">
                <label for="work-input-color-text">Text Color</label>
                <div class="color-picker-wrap">
                  <input id="work-input-color-text-picker" type="color" value="#ffedd7">
                  <input id="work-input-color-text" type="text" value="#ffedd7">
                </div>
              </div>
            </div>

            <div class="manyeo-modal-footer">
              <button type="button" class="btn-cancel" data-close="modal-work-form">Cancel</button>
              <button type="submit" id="btn-save-work" class="btn-submit">Save Project</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Supabase Connection Modal -->
      <div id="modal-supabase" class="manyeo-modal-backdrop" style="display: none;">
        <div class="manyeo-modal-card">
          <div class="manyeo-modal-header">
            <h3>Supabase API Settings</h3>
            <button type="button" class="modal-close-btn" data-close="modal-supabase">&times;</button>
          </div>
          <form id="form-supabase" class="manyeo-modal-body">
            <p class="modal-intro">
              Connect your Supabase project to persist Works data in real-time via PostgreSQL REST API.
              When deployed on Vercel with Environment Variables, connection is established automatically.
            </p>

            <div class="form-group">
              <label for="sb-input-url">Supabase Project URL</label>
              <input id="sb-input-url" type="url" placeholder="https://your-project.supabase.co" value="${escapeHtml(state.supabaseUrl)}">
            </div>

            <div class="form-group">
              <label for="sb-input-key">Supabase Anon Key</label>
              <input id="sb-input-key" type="password" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value="${escapeHtml(state.supabaseKey)}">
            </div>

            <div id="sb-connection-status" class="connection-status-box">
              <span class="status-dot ${state.isConnected ? 'is-connected' : 'is-disconnected'}"></span>
              <span id="sb-status-text">${state.isConnected ? 'Connected to Supabase' : 'Running in Local Storage Mode'}</span>
            </div>

            <div class="sql-guide-box">
              <strong>Need the Database Schema?</strong>
              <p>We generated <code style="color: #c1ff00;">Manyeo_studio/supabase_schema.sql</code> in your project. Run it in Supabase SQL Editor to create the <code>public.works</code> table and seed the 19 projects.</p>
            </div>

            <div class="manyeo-modal-footer">
              <button type="button" id="btn-sync-to-sb" class="btn-secondary" title="Upload local works to Supabase">Sync Local Works to Supabase</button>
              <button type="button" id="btn-test-sb" class="btn-secondary">Test Connection</button>
              <button type="submit" class="btn-submit">Save & Connect</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Toast Container -->
      <div id="manyeo-toast-container"></div>
    `;

    document.body.appendChild(modalRoot);

    // Modal Close buttons
    modalRoot.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', () => {
        const targetId = el.getAttribute('data-close');
        const target = document.getElementById(targetId);
        if (target) target.style.display = 'none';
      });
    });

    // Close on backdrop click
    modalRoot.querySelectorAll('.manyeo-modal-backdrop').forEach(bd => {
      bd.addEventListener('click', (e) => {
        if (e.target === bd) bd.style.display = 'none';
      });
    });

    // Color pickers sync
    syncColorPickers('work-input-color-bg-picker', 'work-input-color-bg');
    syncColorPickers('work-input-color-text-picker', 'work-input-color-text');

    // Title auto-slug
    const titleInput = document.getElementById('work-input-title');
    const slugInput = document.getElementById('work-input-slug');
    titleInput.addEventListener('input', () => {
      if (!state.editingWorkId) {
        slugInput.value = titleInput.value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/(^_|_$)/g, '');
      }
    });

    // Work Form Submit
    document.getElementById('form-work').addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('work-input-title').value.trim();
      const slug = document.getElementById('work-input-slug').value.trim();
      const sort = parseInt(document.getElementById('work-input-sort').value, 10) || 1;
      const tags = document.getElementById('work-input-tags').value.trim();
      const image_url = document.getElementById('work-input-image').value.trim();
      const color_bg = document.getElementById('work-input-color-bg').value.trim();
      const color_text = document.getElementById('work-input-color-text').value.trim();

      const payload = {
        title,
        slug,
        tags,
        sort_order: sort,
        image_url,
        color_bg,
        color_text,
        color_shadow: 0.9,
        href: `/projects/${slug}`
      };

      if (state.editingWorkId) {
        payload.id = state.editingWorkId;
        await api.updateWork(state.editingWorkId, payload);
        showToast(`Project "${title}" updated successfully!`, 'success');
      } else {
        payload.id = slug;
        await api.createWork(payload);
        showToast(`Project "${title}" created successfully!`, 'success');
      }

      document.getElementById('modal-work-form').style.display = 'none';
      renderWorkCards();
    });

    // Supabase Form Submit
    document.getElementById('form-supabase').addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = document.getElementById('sb-input-url').value.trim();
      const key = document.getElementById('sb-input-key').value.trim();

      state.supabaseUrl = url;
      state.supabaseKey = key;
      localStorage.setItem(STORAGE_KEYS.URL, url);
      localStorage.setItem(STORAGE_KEYS.KEY, key);

      showToast('Testing Supabase credentials...', 'info');
      const test = await api.testConnection(url, key);
      if (test.ok) {
        state.isConnected = true;
        updateStatusBadge(true, `Connected (${test.latency}ms)`);
        showToast('Connected to Supabase! Refreshing data...', 'success');
        state.works = await api.fetchWorks();
        renderWorkCards();
      } else {
        state.isConnected = false;
        updateStatusBadge(false, test.message);
        showToast(`Connection error: ${test.message}`, 'error');
      }
      document.getElementById('modal-supabase').style.display = 'none';
      updateBarStatus();
    });

    // Test Connection Button
    document.getElementById('btn-test-sb').addEventListener('click', async () => {
      const url = document.getElementById('sb-input-url').value.trim();
      const key = document.getElementById('sb-input-key').value.trim();
      const res = await api.testConnection(url, key);
      if (res.ok) {
        updateStatusBadge(true, `Connection Verified (${res.latency}ms)`);
        showToast('Supabase connection verified successfully!', 'success');
      } else {
        updateStatusBadge(false, res.message);
        showToast(`Connection failed: ${res.message}`, 'error');
      }
    });

    // Sync to Supabase Button
    document.getElementById('btn-sync-to-sb').addEventListener('click', async () => {
      try {
        showToast('Syncing projects to Supabase public.works...', 'info');
        await api.syncAllToSupabase();
        showToast('Successfully synced all works to Supabase!', 'success');
      } catch (err) {
        showToast(`Sync error: ${err.message}`, 'error');
      }
    });
  }

  function syncColorPickers(pickerId, textId) {
    const picker = document.getElementById(pickerId);
    const text = document.getElementById(textId);
    if (!picker || !text) return;
    picker.addEventListener('input', () => { text.value = picker.value; });
    text.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(text.value)) {
        picker.value = text.value;
      }
    });
  }

  function openWorkModal(work = null) {
    state.editingWorkId = work ? work.id : null;
    const modal = document.getElementById('modal-work-form');
    const titleEl = document.getElementById('modal-work-title');
    const saveBtn = document.getElementById('btn-save-work');

    titleEl.textContent = work ? 'Edit Work' : 'Add New Work';
    saveBtn.textContent = work ? 'Update Project' : 'Create Project';

    document.getElementById('work-input-title').value = work ? work.title : '';
    document.getElementById('work-input-slug').value = work ? work.slug : '';
    document.getElementById('work-input-sort').value = work ? (work.sort_order || 1) : (state.works.length + 1);
    document.getElementById('work-input-tags').value = work ? work.tags : '';
    document.getElementById('work-input-image').value = work ? (work.image_url || '') : '';
    document.getElementById('work-input-color-bg').value = work ? (work.color_bg || '#1a1411') : '#1a1411';
    document.getElementById('work-input-color-bg-picker').value = work ? (work.color_bg || '#1a1411') : '#1a1411';
    document.getElementById('work-input-color-text').value = work ? (work.color_text || '#ffedd7') : '#ffedd7';
    document.getElementById('work-input-color-text-picker').value = work ? (work.color_text || '#ffedd7') : '#ffedd7';

    modal.style.display = 'flex';
  }

  function openEditModal(id) {
    const work = state.works.find(w => w.id === id);
    if (work) openWorkModal(work);
  }

  function openSupabaseModal() {
    const modal = document.getElementById('modal-supabase');
    document.getElementById('sb-input-url').value = state.supabaseUrl;
    document.getElementById('sb-input-key').value = state.supabaseKey;
    updateStatusBadge(state.isConnected, state.isConnected ? 'Connected to Supabase' : 'Running in Local Storage Mode');
    modal.style.display = 'flex';
  }

  function updateStatusBadge(connected, text) {
    const dot = document.querySelector('#sb-connection-status .status-dot');
    const txt = document.getElementById('sb-status-text');
    if (dot) {
      dot.className = `status-dot ${connected ? 'is-connected' : 'is-disconnected'}`;
    }
    if (txt) {
      txt.textContent = text;
    }
  }

  function updateBarStatus() {
    const ind = document.querySelector('#crud-btn-supabase .status-indicator');
    if (ind) {
      ind.className = `status-indicator ${state.isConnected ? 'is-connected' : 'is-local'}`;
    }
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('manyeo-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `manyeo-toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function injectModalStyles() {
    if (document.getElementById('manyeo-crud-styles')) return;

    const style = document.createElement('style');
    style.id = 'manyeo-crud-styles';
    style.textContent = `
      /* Floating Action Bar */
      #manyeo-crud-bar {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 1000;
        pointer-events: auto;
        font-family: Aeonik, system-ui, -apple-system, sans-serif;
      }
      .crud-bar-inner {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(18, 20, 22, 0.88);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        padding: 8px 14px;
        border-radius: 100px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
      }
      .crud-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        background: transparent;
        border: none;
        color: #f0f1fa;
        font-size: 0.8125rem;
        font-weight: 500;
        letter-spacing: -0.01em;
        padding: 8px 14px;
        border-radius: 100px;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        white-space: nowrap;
      }
      .crud-btn:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
      }
      .crud-btn-primary {
        background: #1a2ffb;
        color: #ffffff;
      }
      .crud-btn-primary:hover {
        background: #0016ec;
      }
      .crud-btn.is-active {
        background: #c1ff00;
        color: #000000;
      }
      .crud-btn-ghost {
        color: #9da3af;
      }
      .crud-btn-ghost:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ff4c41;
      }
      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      .status-indicator.is-connected {
        background: #c1ff00;
        box-shadow: 0 0 8px #c1ff00;
      }
      .status-indicator.is-local {
        background: #8832f7;
      }

      /* Modal Backdrop & Card */
      .manyeo-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2000;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: manyeoFadeIn 0.25s ease-out;
      }
      .manyeo-modal-card {
        background: #16181b;
        color: #ffffff;
        width: 100%;
        max-width: 540px;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        overflow: hidden;
        font-family: Aeonik, system-ui, -apple-system, sans-serif;
      }
      .manyeo-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 22px 28px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .manyeo-modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 500;
        letter-spacing: -0.02em;
      }
      .modal-close-btn {
        background: transparent;
        border: none;
        color: #888;
        font-size: 1.75rem;
        line-height: 1;
        cursor: pointer;
        transition: color 0.2s;
      }
      .modal-close-btn:hover {
        color: #fff;
      }
      .manyeo-modal-body {
        padding: 24px 28px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        max-height: 75vh;
        overflow-y: auto;
      }
      .modal-intro {
        margin: 0 0 6px;
        font-size: 0.875rem;
        color: #9da3af;
        line-height: 1.5;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .form-row {
        display: flex;
        gap: 14px;
      }
      .flex-1 {
        flex: 1;
      }
      .form-group label {
        font-size: 0.8125rem;
        font-weight: 500;
        color: #ced3dc;
        letter-spacing: 0.01em;
      }
      .form-group input {
        background: #202327;
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #fff;
        border-radius: 10px;
        padding: 10px 14px;
        font-size: 0.9375rem;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s;
      }
      .form-group input:focus {
        border-color: #1a2ffb;
      }
      .form-hint {
        font-size: 0.75rem;
        color: #7b8190;
      }
      .color-picker-wrap {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .color-picker-wrap input[type="color"] {
        width: 42px;
        height: 38px;
        padding: 0;
        border: none;
        border-radius: 8px;
        background: transparent;
        cursor: pointer;
      }
      .color-picker-wrap input[type="text"] {
        flex: 1;
      }
      .connection-status-box {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        border-radius: 12px;
        background: #202327;
        font-size: 0.875rem;
        color: #d1d5db;
      }
      .status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      .status-dot.is-connected {
        background: #c1ff00;
        box-shadow: 0 0 10px #c1ff00;
      }
      .status-dot.is-disconnected {
        background: #ff4c41;
      }
      .sql-guide-box {
        background: rgba(193, 255, 0, 0.06);
        border: 1px dashed rgba(193, 255, 0, 0.35);
        border-radius: 12px;
        padding: 14px 18px;
        font-size: 0.8125rem;
        color: #d4d8e2;
        line-height: 1.5;
      }
      .sql-guide-box strong {
        color: #c1ff00;
        display: block;
        margin-bottom: 4px;
      }
      .sql-guide-box code {
        font-family: monospace;
        background: rgba(255,255,255,0.08);
        padding: 2px 6px;
        border-radius: 4px;
      }
      .manyeo-modal-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 10px;
        margin-top: 10px;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
      .btn-cancel, .btn-secondary, .btn-submit {
        padding: 10px 18px;
        border-radius: 100px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.2s;
        border: none;
      }
      .btn-cancel {
        background: transparent;
        color: #9da3af;
      }
      .btn-cancel:hover {
        color: #fff;
      }
      .btn-secondary {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }
      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.15);
      }
      .btn-submit {
        background: #1a2ffb;
        color: #fff;
      }
      .btn-submit:hover {
        background: #0016ec;
      }

      /* Toasts */
      #manyeo-toast-container {
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 3000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      }
      .manyeo-toast {
        background: rgba(22, 24, 27, 0.95);
        backdrop-filter: blur(12px);
        color: #fff;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 0.875rem;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        pointer-events: auto;
        animation: manyeoSlideDown 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        transition: opacity 0.4s, transform 0.4s;
      }
      .manyeo-toast.toast-success {
        border-left: 4px solid #c1ff00;
      }
      .manyeo-toast.toast-error {
        border-left: 4px solid #ff4c41;
      }
      .manyeo-toast.toast-info {
        border-left: 4px solid #1a2ffb;
      }
      .manyeo-toast.fade-out {
        opacity: 0;
        transform: translateY(-10px);
      }

      @keyframes manyeoFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes manyeoSlideDown {
        from { opacity: 0; transform: translateY(-15px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 640px) {
        #manyeo-crud-bar {
          bottom: 16px;
          right: 16px;
          left: 16px;
        }
        .crud-bar-inner {
          justify-content: space-around;
        }
        .manyeo-modal-card {
          max-height: 90vh;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // --- Initializer ---
  async function init() {
    injectCRUDControls();

    // 1. Auto-detect Vercel Environment Variables via /api/config if available
    try {
      const cfgRes = await fetch('/api/config');
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        if (cfg.supabaseUrl && cfg.supabaseKey) {
          state.supabaseUrl = cfg.supabaseUrl;
          state.supabaseKey = cfg.supabaseKey;
          console.log('[Supabase] Auto-configured from Vercel Environment Variables');
        }
      }
    } catch (e) {
      // Offline or local static server without serverless route
    }

    // 2. Test connection if credentials exist
    if (state.supabaseUrl && state.supabaseKey) {
      const test = await api.testConnection(state.supabaseUrl, state.supabaseKey);
      state.isConnected = test.ok;
      updateBarStatus();
    }

    // 3. Load works from Supabase / LocalStorage
    state.works = await api.fetchWorks();
    renderWorkCards();

    // 4. Keyboard Shortcut: Ctrl + Shift + A (or Cmd + Shift + A) to toggle Admin Mode
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        toggleAdminMode();
      }
    });
  }

  // Auto-init on DOMContentLoaded or immediate
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API on window for external / console testing
  window.ManyeoWorksCRUD = {
    api,
    state,
    renderWorkCards,
    openWorkModal,
    openSupabaseModal,
    toggleAdminMode,
    exitAdminMode
  };
})();
