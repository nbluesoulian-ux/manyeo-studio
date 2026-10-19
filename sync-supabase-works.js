const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kxlmdxvmcicbgengytoo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_G_qnPRoc5FAomnq6vVKIGA_bKZx6q1V';

const ROOT_DIR = __dirname;
const ASSETS_PROJECTS_DIR = path.join(ROOT_DIR, 'assets', 'projects');
const DEFAULT_HOME_WEBP = path.join(ASSETS_PROJECTS_DIR, 'oryzo_ai', 'home.webp');
const DEFAULT_DEPTH_WEBP = path.join(ASSETS_PROJECTS_DIR, 'oryzo_ai', 'home_depth.webp');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      client.get(url, (res) => {
        if (res.statusCode === 200) {
          const file = fs.createWriteStream(destPath);
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(true);
          });
        } else {
          resolve(false);
        }
      }).on('error', () => resolve(false));
    } catch (_) {
      resolve(false);
    }
  });
}

async function fetchSupabaseWorks() {
  const url = `${SUPABASE_URL}/rest/v1/works?select=*&order=sort_order.asc.nullslast`;
  console.log(`[Sync] Fetching works from: ${url}`);
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch works: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

async function sync() {
  try {
    const works = await fetchSupabaseWorks();
    console.log(`[Sync] Found ${works.length} projects in Supabase.`);

    if (!Array.isArray(works) || works.length === 0) {
      console.log('[Sync] No projects returned or invalid array. Aborting to protect existing files.');
      return;
    }

    const cardsHtml = [];

    for (let i = 0; i < works.length; i++) {
      const item = works[i];
      const id = String(item.id || item.slug || `work_${i + 1}`).trim();
      const title = item.title || 'Untitled';
      const tags = item.tags || 'web • design • development • 3d';

      // Ensure href always points to a valid project route so SPA router never redirects to home
      let href = item.href ? String(item.href).trim() : '';
      if (!href || !href.startsWith('/')) {
        href = `/projects/${item.slug || id}`;
      }

      const colorBg = item.color_bg || '#181818';
      const colorText = item.color_text || '#ffffff';
      const colorShadow = item.color_shadow !== undefined ? item.color_shadow : 0.95;

      const projectDir = path.join(ASSETS_PROJECTS_DIR, id);
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
      }

      const homeFile = path.join(projectDir, 'home.webp');
      const depthFile = path.join(projectDir, 'home_depth.webp');

      // 1. Ensure home.webp exists
      if (!fs.existsSync(homeFile)) {
        let downloaded = false;
        if (item.image_url && item.image_url.startsWith('http')) {
          console.log(`[Sync] Downloading image for ${id}: ${item.image_url}`);
          downloaded = await downloadFile(item.image_url, homeFile);
        }
        if (!downloaded && fs.existsSync(DEFAULT_HOME_WEBP)) {
          fs.copyFileSync(DEFAULT_HOME_WEBP, homeFile);
        }
      }

      // 2. Ensure home_depth.webp exists (3D Depth Map)
      if (!fs.existsSync(depthFile)) {
        let downloadedDepth = false;
        if (item.depth_image_url && item.depth_image_url.startsWith('http')) {
          console.log(`[Sync] Downloading depth image for ${id}: ${item.depth_image_url}`);
          downloadedDepth = await downloadFile(item.depth_image_url, depthFile);
        }
        if (!downloadedDepth && fs.existsSync(DEFAULT_DEPTH_WEBP)) {
          fs.copyFileSync(DEFAULT_DEPTH_WEBP, depthFile);
        }
      }

      // 3. Generate clean card markup
      cardsHtml.push(
        `<a class="project-item project-type-website" href="${escapeHtml(href)}" data-id="${escapeHtml(id)}" data-color-bg="${escapeHtml(colorBg)}" data-color-text="${escapeHtml(colorText)}" data-color-shadow="${escapeHtml(String(colorShadow))}"> <div class="project-item-main"> <div class="project-item-image"></div> </div> <div class="project-item-footer"> <div class="project-item-line-1">${escapeHtml(tags)}</div> <div class="project-item-line-2"> <div class="project-item-line-2-icon"></div> <div class="project-item-line-2-inner">${escapeHtml(title)}</div> </div> </div> </a>`
      );
    }

    const newCardsContent = cardsHtml.join('');

    // Update target files
    const targetFiles = [
      path.join(ROOT_DIR, 'work.html'),
      path.join(ROOT_DIR, 'work', 'index.html')
    ];

    for (const filePath of targetFiles) {
      if (!fs.existsSync(filePath)) continue;

      let html = fs.readFileSync(filePath, 'utf8');

      // Replace project-list content
      const listRegex = /(<div class="project-list">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div id="page-extra-sections")/i;
      if (listRegex.test(html)) {
        html = html.replace(listRegex, `$1 ${newCardsContent} $2`);
        console.log(`[Sync] Updated project-list in ${path.basename(filePath)}`);
      } else {
        console.warn(`[Sync] Could not find project-list boundary in ${path.basename(filePath)}`);
      }

      // Replace project count number
      const countRegex = /(<span id="projects-main-title-project-number">)\d+(<\/span>)/i;
      if (countRegex.test(html)) {
        html = html.replace(countRegex, `$1${works.length}$2`);
        console.log(`[Sync] Updated project count (${works.length}) in ${path.basename(filePath)}`);
      }

      fs.writeFileSync(filePath, html, 'utf8');
    }

    console.log(`[Sync] Successfully synchronized ${works.length} projects from Supabase!`);
  } catch (err) {
    console.error('[Sync] Error during sync:', err);
    process.exit(1);
  }
}

sync();
