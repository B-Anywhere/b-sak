import { icon } from './icons.js';

const $ = (id) => document.getElementById(id);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const state = {
  tools: [],
  categories: ['ALL'],
  query: '',
  category: 'ALL',
  mode: matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop',
  manualMode: false,
  focused: null,
  selected: null,
};

let visible = [];

// --- URL helpers ---
function categoryFromUrl() {
  const cat = new URLSearchParams(location.search).get('category');
  if (!cat) return 'ALL';
  return state.categories.find((c) => c.toLowerCase() === cat.trim().toLowerCase()) || 'ALL';
}

function toolFromHash() {
  const id = location.hash.replace(/^#/, '').trim().toLowerCase();
  return (id && state.tools.find((t) => t.id.toLowerCase() === id)) || null;
}

// --- Preview image with skeleton ---
function previewHtml(src, alt, eager) {
  return `<div class="preview"><img src="${esc(src)}" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${eager ? 'high' : 'low'}" referrerpolicy="no-referrer"></div>`;
}

function wirePreviews(root) {
  root.querySelectorAll('.preview').forEach((p) => {
    const img = p.querySelector('img');
    const ok = () => p.classList.add('loaded');
    const fail = () => p.classList.add('error');
    if (img.complete) (img.naturalWidth > 0 ? ok : fail)();
    else {
      img.addEventListener('load', ok, { once: true });
      img.addEventListener('error', fail, { once: true });
    }
  });
}

// --- Rendering ---
function filterTools() {
  const q = state.query.toLowerCase().trim();
  let data = state.tools;
  if (q) {
    data = data.filter((t) => `${t.title} ${t.description} ${t.category}`.toLowerCase().includes(q));
  } else if (state.category !== 'ALL') {
    data = data.filter((t) => t.category === state.category);
  }
  return data;
}

function cardHtml(t, index) {
  const m = state.mode;
  return `
  <div class="card${state.focused === index ? ' focused' : ''}" id="tool-${esc(t.id)}" data-index="${index}" data-id="${esc(t.id)}" tabindex="0" role="article"
       aria-label="${esc(t.title)}, ${esc(t.category)}. Click or press Enter for Quick View.">
    <div class="frame">
      ${previewHtml(m === 'mobile' ? t.mobileImg : t.desktopImg, `${t.title} preview`, index < 6)}
      <div class="overlay-actions">
        <button type="button" tabindex="-1" class="btn-quick" title="Press Enter"><span>QUICK VIEW</span>${icon('Maximize2', 12)}</button>
        <a class="btn-ext" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" tabindex="-1" title="Open in new tab">${icon('ExternalLink', 14)}</a>
      </div>
      <div class="tag">${m} ${m === 'mobile' ? '9:16' : '16:9'}</div>
    </div>
    <div class="body">
      <div class="title-row">
        <div class="badge" style="background:${esc(t.color)}">${icon(t.iconType, 16)}</div>
        <div><h3>${esc(t.title)}</h3><p class="cat">${esc(t.category)}</p></div>
      </div>
      <p class="desc">${esc(t.description)}</p>
      <div class="foot">
        <span class="hint"><kbd>Enter</kbd> View</span>
        <a class="launch" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer">LAUNCH ${icon('ExternalLink', 11)}</a>
      </div>
    </div>
  </div>`;
}

function render() {
  visible = filterTools();
  document.body.classList.toggle('mobile', state.mode === 'mobile');
  $('mode-desktop').classList.toggle('active', state.mode === 'desktop');
  $('mode-mobile').classList.toggle('active', state.mode === 'mobile');
  $('count').textContent = `Swiss Army Knifes • ${visible.length} Tools Available`;
  $('search-clear').hidden = !state.query;
  $('search-hint').hidden = !!state.query;

  const groups = state.query
    ? { 'Search Results': visible }
    : visible.reduce((acc, t) => ((acc[t.category] ||= []).push(t), acc), {});

  let index = 0;
  const sections = Object.entries(groups).map(([cat, tools]) => `
    <section aria-label="${esc(cat)}">
      <div class="section-head"><h2>${esc(cat)}</h2><hr><span>${tools.length} ${tools.length === 1 ? 'tool' : 'tools'}</span></div>
      <div class="grid">${tools.map((t) => cardHtml(t, index++)).join('')}</div>
    </section>`).join('');

  $('main').innerHTML = visible.length ? sections : `
    <div class="empty">${icon('Search', 36)}<p>No matching tools found</p><button type="button" data-action="reset">Reset Search &amp; Filters</button></div>`;
  wirePreviews($('main'));

  if (state.focused !== null && state.focused >= visible.length) state.focused = visible.length ? 0 : null;

  const counts = { ALL: state.tools.length };
  state.tools.forEach((t) => (counts[t.category] = (counts[t.category] || 0) + 1));
  $('categories').innerHTML = state.categories.map((c) =>
    `<button type="button" data-cat="${esc(c)}" class="${c === state.category ? 'active' : ''}"><span>${esc(c)}</span><sup aria-label="${counts[c]} tools in ${esc(c)}">${counts[c]}</sup></button>`
  ).join('');
}

function renderDialog() {
  const t = state.selected;
  const dlg = $('dialog');
  if (!t) {
    dlg.hidden = true;
    dlg.innerHTML = '';
    return;
  }
  const m = state.mode;
  dlg.innerHTML = `
    <div class="dlg" tabindex="-1">
      <button class="dlg-close" type="button" data-action="close" aria-label="Close dialog (Escape)" title="Press Esc to close"><kbd>ESC</kbd>${icon('X', 18)}</button>
      <div class="dlg-body">
        <div class="dlg-media ${m}">
          ${previewHtml(m === 'mobile' ? t.mobileImg : t.desktopImg, `${t.title} preview`, true)}
          <div class="pill">${m.toUpperCase()} (${m === 'mobile' ? '9:16' : '16:9'})</div>
        </div>
        <div class="dlg-info">
          <div class="dlg-head">
            <div class="badge" style="background:${esc(t.color)}">${icon(t.iconType, 24)}</div>
            <div><h2 id="qv-title">${esc(t.title)}</h2><span class="cat">${esc(t.category)}</span></div>
          </div>
          <h4>Overview</h4>
          <p class="quote">"${esc(t.description)}"</p>
          <h4>Capabilities</h4>
          <p class="detail">${esc(t.detailedDescription || `${t.title} is an enterprise-grade ${t.category.toLowerCase()} web application built for the modern Bayer digital ecosystem.`)}</p>
          <a class="dlg-open" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer"><span>OPEN APPLICATION</span>${icon('ExternalLink', 16)}</a>
          <div class="dlg-meta"><span>${esc(t.url.replace('https://', ''))}</span><span>Press <kbd>Esc</kbd> to exit</span></div>
        </div>
      </div>
    </div>`;
  dlg.hidden = false;
  wirePreviews(dlg);
  dlg.querySelector('.dlg-close').focus();
}

// --- Actions ---
function focusCard(index) {
  if (index < 0 || index >= visible.length) return;
  state.focused = index;
  const el = document.querySelector(`.card[data-index="${index}"]`);
  document.querySelectorAll('.card.focused').forEach((c) => c.classList.remove('focused'));
  if (el) {
    el.classList.add('focused');
    el.focus();
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function setCategory(cat, push = true) {
  state.category = cat;
  if (push) {
    const url = new URL(location.href);
    url.searchParams.set('category', cat);
    history.pushState(null, '', url);
  }
  render();
  scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => focusCard(0), 100);
}

function openTool(tool) {
  state.selected = tool;
  const url = new URL(location.href);
  url.hash = tool.id;
  history.pushState(null, '', url);
  renderDialog();
}

function closeTool() {
  state.selected = null;
  if (location.hash) history.pushState(null, '', location.pathname + location.search);
  renderDialog();
  if (state.focused !== null) document.querySelector(`.card[data-index="${state.focused}"]`)?.focus();
}

function setSearch(q) {
  state.query = q;
  state.focused = null;
  render();
}

function resetAll() {
  $('search').value = '';
  state.query = '';
  setCategory('ALL');
}

// --- Events ---
function bindEvents() {
  $('search-icon').innerHTML = icon('Search', 16);
  $('search-clear').innerHTML = icon('X', 14);
  $('mode-desktop').innerHTML = `${icon('Monitor', 14)}<span>16:9</span>`;
  $('mode-mobile').innerHTML = `${icon('Smartphone', 14)}<span>9:16</span>`;
  $('offline').innerHTML = `${icon('WifiOff', 12)}<span>You are offline</span>`;

  $('search').addEventListener('input', (e) => setSearch(e.target.value));
  $('search-clear').addEventListener('click', (e) => {
    e.preventDefault();
    $('search').value = '';
    setSearch('');
  });
  $('brand').addEventListener('click', (e) => {
    e.preventDefault();
    resetAll();
  });

  const applyMode = (mode) => {
    state.mode = mode;
    render();
    if (state.selected) renderDialog();
  };
  $('mode-desktop').addEventListener('click', () => { state.manualMode = true; applyMode('desktop'); });
  $('mode-mobile').addEventListener('click', () => { state.manualMode = true; applyMode('mobile'); });
  matchMedia('(max-width: 767px)').addEventListener('change', (e) => {
    if (!state.manualMode) applyMode(e.matches ? 'mobile' : 'desktop');
  });

  $('categories').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (b) setCategory(b.dataset.cat);
  });

  $('main').addEventListener('click', (e) => {
    if (e.target.closest('[data-action="reset"]')) return resetAll();
    if (e.target.closest('a')) return;
    const card = e.target.closest('.card');
    if (card) {
      state.focused = Number(card.dataset.index);
      openTool(state.tools.find((t) => t.id === card.dataset.id));
    }
  });
  $('main').addEventListener('focusin', (e) => {
    const card = e.target.closest('.card');
    if (card) state.focused = Number(card.dataset.index);
  });

  $('dialog').addEventListener('click', (e) => {
    if (e.target === $('dialog') || e.target.closest('[data-action="close"]')) closeTool();
  });

  const syncLocation = () => {
    state.category = categoryFromUrl();
    state.selected = toolFromHash();
    render();
    renderDialog();
  };
  addEventListener('popstate', syncLocation);

  const offline = () => ($('offline').hidden = navigator.onLine);
  addEventListener('online', offline);
  addEventListener('offline', offline);
  offline();

  const bar = $('progress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  addEventListener('keydown', onKeyDown);
}

function onKeyDown(e) {
  const search = $('search');
  if (e.key === 'Escape' && state.selected) {
    e.preventDefault();
    return closeTool();
  }
  if (state.selected) return;

  const inSearch = document.activeElement === search;
  const card = document.activeElement?.closest?.('.card');

  if (e.key === 'Escape') {
    if (inSearch) search.blur();
    else if (state.focused !== null) {
      document.activeElement?.blur();
      document.querySelectorAll('.card.focused').forEach((c) => c.classList.remove('focused'));
      state.focused = null;
    }
    return;
  }

  if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && !inSearch) {
    e.preventDefault();
    search.focus();
    search.select();
    return;
  }

  if (inSearch) {
    if ((e.key === 'ArrowDown' || e.key === 'Enter') && visible.length) {
      e.preventDefault();
      search.blur();
      focusCard(0);
    }
    return;
  }

  if (card && (e.key === 'Enter' || e.key === ' ') && e.target === card) {
    e.preventDefault();
    return openTool(state.tools.find((t) => t.id === card.dataset.id));
  }

  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    if (e.target.closest?.('.categories')) return;
    e.preventDefault();
    if (!visible.length) return;
    if (state.focused === null) return focusCard(0);
    const n = visible.length;
    const cols = innerWidth >= 1024 ? 3 : innerWidth >= 640 ? 2 : 1;
    focusCard({
      ArrowRight: (state.focused + 1) % n,
      ArrowLeft: (state.focused - 1 + n) % n,
      ArrowDown: Math.min(state.focused + cols, n - 1),
      ArrowUp: Math.max(state.focused - cols, 0),
    }[e.key]);
  }
}

// --- Boot ---
async function init() {
  bindEvents();
  try {
    const res = await fetch('./tools.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.tools = await res.json();
  } catch (err) {
    console.error('Failed to load tools.json', err);
    $('main').innerHTML = '<div class="empty"><p>Unable to load tools</p></div>';
    return;
  }
  state.categories = ['ALL', ...new Set(state.tools.map((t) => t.category))];
  state.category = categoryFromUrl();
  state.selected = toolFromHash();
  render();
  renderDialog();
}

init();
