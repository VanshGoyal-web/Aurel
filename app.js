/* AUREL — self-contained interactive storefront (vanilla JavaScript).
   No backend, payment processing, tracking, framework, or build step required. */
(() => {
  'use strict';

  const ASSET = 'assets/images/';
  const watches = [
    { id: 'ivory', name: 'Première Ivory', short: 'Ivory', line: 'PREMIÈRE', description: 'Polished steel. Warm ivory. Chocolate leather.', strap: 'Chocolate leather', category: 'leather', case: 40, sizes: '36 / 40 MM', image: 'premiere-ivory.webp', price: 18900, tag: 'THE SIGNATURE', note: 'An understated essential in polished steel.' },
    { id: 'noire', name: 'Première Noire', short: 'Noire', line: 'PREMIÈRE', description: 'Rose-gold warmth. Charcoal face. Black leather.', strap: 'Black leather', category: 'leather', case: 40, sizes: '36 / 40 MM', image: 'premiere-noire.webp', price: 21400, tag: 'MODERN CLASSIC', note: 'An evening mood, made for every day.' },
    { id: 'steel', name: 'Première Steel', short: 'Steel', line: 'PREMIÈRE', description: 'Brushed links. Silver chronograph. A sportier spirit.', strap: 'Steel bracelet', category: 'steel', case: 40, sizes: '40 MM', image: 'premiere-steel.webp', price: 24500, tag: 'EVERYDAY ICON', note: 'Precisely balanced for life in motion.' },
    { id: 'forest', name: 'Atelier Forest', short: 'Forest', line: 'ATELIER', description: 'Forest-green sunray dial. Cool brushed steel.', strap: 'Steel bracelet', category: 'steel atelier', case: 40, sizes: '40 MM', image: 'atelier-forest.webp', price: 26900, tag: 'ATELIER EDITION', note: 'An arresting green in shifting light.' },
    { id: 'moonphase', name: 'Atelier Moonphase', short: 'Moonphase', line: 'ATELIER', description: 'Deep navy. Rose-gold case. A little celestial wonder.', strap: 'Navy leather', category: 'leather atelier', case: 42, sizes: '42 MM', image: 'atelier-moonphase.webp', price: 31900, tag: 'ATELIER EDITION', note: 'An invitation to look a little closer.' },
    { id: 'deco', name: 'Atelier Deco', short: 'Deco', line: 'ATELIER', description: 'An architectural gold case. Warm leather. Vintage charm.', strap: 'Chocolate leather', category: 'leather atelier', case: 36, sizes: '36 MM', image: 'atelier-deco.webp', price: 28900, tag: 'ATELIER EDITION', note: 'Distinctly shaped, quietly beautiful.' }
  ];
  const tones = {
    light: { label: 'Light', image: 'hand-light.webp' },
    medium: { label: 'Medium', image: 'hand-medium.webp' },
    tan: { label: 'Tan', image: 'hand-tan.webp' },
    deep: { label: 'Deep', image: 'hand-deep.webp' }
  };
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const currency = (num) => '₹' + num.toLocaleString('en-IN');
  const getWatch = (id) => watches.find((w) => w.id === id) || watches[0];
  const safeRead = (key, fallback) => { try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); } catch { return fallback; } };
  const safeWrite = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Private browsing: keep in memory */ } };

  let selectedWatch = watches[0];
  let angle = 0;
  let rotating = false;
  let rotationFrame = 0;
  let lastTick = 0;
  let inspect = false;
  let layers = false;
  let activeFilter = 'all';
  let favorites = new Set((safeRead('aurel-favorites-v1', []) || []).filter((id) => watches.some((w) => w.id === id)));
  let bag = (safeRead('aurel-bag-v1', {}) || {});
  let fit = { watch: 'ivory', tone: 'medium', wrist: 17, size: 40, turned: false };
  let activePanel = null;
  let toastTimeout;

  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => element.classList.remove('show'), 2700);
  }
  function persistBag() { safeWrite('aurel-bag-v1', bag); updateBagCount(); renderBag(); }
  function updateBagCount() {
    const count = Object.values(bag).reduce((sum, n) => sum + n, 0);
    $$('[data-bag-count]').forEach((el) => { el.textContent = count; });
  }

  function renderWatchSelector() {
    $('#watchSelector').innerHTML = watches.map((w, index) => `
      <button type="button" class="selector-watch ${selectedWatch.id === w.id ? 'selected' : ''}" data-select-watch="${w.id}" aria-label="View ${w.name}" aria-pressed="${selectedWatch.id === w.id}">
        <img src="${ASSET + w.image}" alt="" loading="lazy"><span>${String(index + 1).padStart(2, '0')}</span>
      </button>`).join('');
  }
  function paintAngle() {
    $('#watch3d').style.setProperty('--angle', `${angle}deg`);
    $('#angleOutput').textContent = `${String(Math.round(((angle % 360) + 360) % 360)).padStart(3, '0')}° / 360°`;
  }
  function stopRotation() {
    rotating = false;
    cancelAnimationFrame(rotationFrame);
    lastTick = 0;
    $('#autoRotate').setAttribute('aria-pressed', 'false');
    $('#autoRotate').innerHTML = 'Rotate 360° <span>↻</span>';
  }
  function rotationTick(time) {
    if (!rotating) return;
    if (lastTick) angle = (angle + Math.min(time - lastTick, 50) * .045) % 360;
    lastTick = time;
    paintAngle();
    rotationFrame = requestAnimationFrame(rotationTick);
  }
  function startRotation() {
    closeViewerModes();
    rotating = true;
    $('#autoRotate').setAttribute('aria-pressed', 'true');
    $('#autoRotate').innerHTML = 'Pause rotation <span>Ⅱ</span>';
    rotationFrame = requestAnimationFrame(rotationTick);
  }
  function closeViewerModes() {
    inspect = false;
    layers = false;
    $('#viewerSurface').classList.remove('inspect', 'layers');
    $('#inspectDial').setAttribute('aria-pressed', 'false');
    $('#revealLayers').setAttribute('aria-pressed', 'false');
    $('#modeDescription').textContent = 'Drag the watch left or right to explore its form, or try the controls above.';
  }
  function selectWatch(id, scroll = false) {
    selectedWatch = getWatch(id);
    stopRotation();
    closeViewerModes();
    angle = 0;
    paintAngle();
    const w = selectedWatch;
    $('#viewerImage').src = ASSET + w.image;
    $('#viewerImage').alt = w.name + ' watch design preview';
    $('#dialImage').src = ASSET + w.image;
    $('#viewerNumber').textContent = `${String(watches.indexOf(w) + 1).padStart(2, '0')} / 06`;
    $('#viewerTitle').textContent = w.name;
    $('#viewerDescription').textContent = w.description;
    $('#viewerSize').textContent = w.sizes;
    $('#viewerStrap').textContent = w.strap.toUpperCase();
    renderWatchSelector();
    if (scroll) $('#atelier').scrollIntoView({ behavior: 'smooth' });
  }

  function renderProducts() {
    const shown = watches.filter((w) => activeFilter === 'all' || w.category.includes(activeFilter));
    $('#productGrid').innerHTML = shown.map((w) => `
      <article class="product-card" id="product-${w.id}">
        <div class="product-image-wrap"><span class="product-tag">${w.tag}</span>
          <img src="${ASSET + w.image}" alt="${w.name}, ${w.description}" loading="lazy">
          <button type="button" class="favorite-button" data-favorite="${w.id}" aria-label="${favorites.has(w.id) ? 'Remove' : 'Save'} ${w.name} ${favorites.has(w.id) ? 'from' : 'to'} favorites" aria-pressed="${favorites.has(w.id)}">${favorites.has(w.id) ? '♥' : '♡'}</button></div>
        <div class="product-info"><div><h3>${w.name}</h3><p>${w.strap} · ${w.sizes.toLowerCase()}</p></div><strong>${currency(w.price)}</strong></div>
        <div class="card-actions"><button class="card-link" data-preview="${w.id}" type="button">Explore watch ↗</button><button class="card-add" data-add="${w.id}" type="button">Add to bag +</button></div>
      </article>`).join('');
    $('#favoritesCount').textContent = favorites.size;
  }
  function setFilter(filter) {
    activeFilter = filter;
    $$('.filter').forEach((el) => {
      const selected = el.dataset.filter === filter;
      el.classList.toggle('active', selected);
      el.setAttribute('aria-pressed', String(selected));
    });
    renderProducts();
  }
  function toggleFavorite(id) {
    const w = getWatch(id);
    if (favorites.has(w.id)) { favorites.delete(w.id); toast(`${w.name} removed from saved watches`); }
    else { favorites.add(w.id); toast(`${w.name} saved to your favorites`); }
    safeWrite('aurel-favorites-v1', [...favorites]);
    renderProducts();
  }
  function addToBag(id) {
    const w = getWatch(id);
    bag[w.id] = Math.min((bag[w.id] || 0) + 1, 20);
    persistBag();
    toast(`${w.name} added to your bag`);
  }
  function updateQuantity(id, delta) {
    if (!bag[id]) return;
    const next = bag[id] + delta;
    if (next <= 0) delete bag[id]; else bag[id] = Math.min(next, 20);
    persistBag();
  }
  function renderBag() {
    const entries = watches.filter((w) => bag[w.id] > 0);
    const bagItems = $('#bagItems');
    const bagBottom = $('#bagBottom');
    if (!entries.length) {
      bagItems.innerHTML = '<div class="bag-empty"><i>✳</i><h3>Room for something special.</h3><p>Your bag is empty. Discover the collection and find a timepiece that feels like yours.</p></div>';
      bagBottom.innerHTML = '<button type="button" class="full-button" id="continueShopping">Explore the collection <span>↗</span></button>';
      return;
    }
    bagItems.innerHTML = entries.map((w) => `<div class="bag-line"><img src="${ASSET + w.image}" alt="${w.name}"><div><h3>${w.name}</h3><p>${w.strap} · ${w.sizes.toLowerCase()}</p><strong>${currency(w.price)}</strong><div class="qty-control"><button type="button" data-qty="-1" data-id="${w.id}" aria-label="Remove one ${w.name}">−</button><span>${bag[w.id]}</span><button type="button" data-qty="1" data-id="${w.id}" aria-label="Add one ${w.name}">+</button><button type="button" class="remove-item" data-remove="${w.id}">Remove</button></div></div></div>`).join('');
    const total = entries.reduce((s, w) => s + w.price * bag[w.id], 0);
    bagBottom.innerHTML = `<div class="bag-total"><span>Illustrative subtotal</span><span>${currency(total)}</span></div><button type="button" class="full-button" id="demoCheckout">Continue (concept only) <span>↗</span></button><p>AUREL is a concept storefront. These are illustrative prices; no payment or order can be placed.</p>`;
  }

  function syncFitting() {
    const w = getWatch(fit.watch);
    $('#fittingWatch').value = w.id;
    $('#handPhoto').src = ASSET + tones[fit.tone].image;
    $('#handPhoto').alt = `Natural ${tones[fit.tone].label.toLowerCase()}-tone hand seen from above`;
    $('#skinToneName').textContent = tones[fit.tone].label;
    $$('.tone').forEach((b) => {
      const chosen = b.dataset.tone === fit.tone;
      b.classList.toggle('selected', chosen);
      b.setAttribute('aria-pressed', String(chosen));
    });
    $('#wornWatch').src = ASSET + w.image;
    $('#wornWatch').alt = w.name + ' worn on a wrist';
    // The scale estimates relative dial-to-wrist proportions: this is intentionally not an AR scan.
    const relative = (fit.size / 40) * (17 / fit.wrist) ** .42;
    $('#wornWatch').style.setProperty('--watch-scale', relative.toFixed(3));
    $('#wristRange').value = fit.wrist;
    $('#wristValue').textContent = `${fit.wrist} cm`;
    $$('.size-buttons button').forEach((b) => b.classList.toggle('selected', Number(b.dataset.size) === fit.size));
    $('#fittingWatchName').textContent = `${w.name.toUpperCase()} · ${fit.size} MM`;
    $('#fittingMetrics').textContent = `${fit.wrist} cm wrist · ${fit.size} mm case`;
    $('#fitSummary').textContent = `${fit.size} mm on a ${fit.wrist} cm wrist. ${fit.size <= 36 ? 'Understated and classic.' : fit.size >= 42 ? 'A bolder presence.' : 'Balanced and versatile.'}`;
    $('#handStage').classList.toggle('turned', fit.turned);
    $('#turnWrist').setAttribute('aria-pressed', String(fit.turned));
  }

  function showOverlay() { $('#panelOverlay').hidden = false; document.body.classList.add('no-scroll'); }
  function closePanels() {
    $('#bagDrawer').classList.remove('open');
    $('#bagDrawer').setAttribute('aria-hidden', 'true');
    $$('.modal').forEach((modal) => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); });
    $('#panelOverlay').hidden = true;
    document.body.classList.remove('no-scroll');
    activePanel = null;
  }
  function openBag() {
    closePanels();
    showOverlay();
    const drawer = $('#bagDrawer');
    drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    activePanel = drawer;
    $('#closeBag').focus();
  }
  function openModal(id) {
    closePanels();
    showOverlay();
    const modal = $('#' + id);
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    activePanel = modal;
    $('.modal-close', modal).focus();
  }
  function renderFinderChoice(choice) {
    const id = { classic: 'ivory', bold: 'noire', sport: 'forest', artistic: 'deco' }[choice] || 'ivory';
    const w = getWatch(id);
    $('#finderChoices').hidden = true;
    $('#finderResult').hidden = false;
    $('#finderResult').innerHTML = `<img class="finder-result-img" src="${ASSET + w.image}" alt="${w.name}"><p class="eyebrow">YOUR AUREL MATCH</p><h3 class="finder-result-name">${w.name}</h3><p>${w.note}</p><button type="button" class="full-button" data-finder-preview="${w.id}">Explore ${w.name} <span>↗</span></button><button type="button" class="finder-back" id="restartFinder">Choose a different mood</button>`;
  }
  function resetFinder() { $('#finderChoices').hidden = false; $('#finderResult').hidden = true; $('#finderResult').innerHTML = ''; }

  function initEvents() {
    $('#watchSelector').addEventListener('click', (event) => {
      const button = event.target.closest('[data-select-watch]');
      if (button) selectWatch(button.dataset.selectWatch);
    });
    $('#autoRotate').addEventListener('click', () => rotating ? stopRotation() : startRotation());
    $('#inspectDial').addEventListener('click', () => {
      stopRotation(); layers = false; inspect = !inspect;
      $('#viewerSurface').classList.toggle('inspect', inspect);
      $('#viewerSurface').classList.remove('layers');
      $('#inspectDial').setAttribute('aria-pressed', String(inspect));
      $('#revealLayers').setAttribute('aria-pressed', 'false');
      if (inspect) { angle = 0; paintAngle(); }
      $('#modeDescription').textContent = inspect ? 'Dial study: a magnified look at the face, proportions and hands. Select another watch to compare.' : 'Drag the watch to explore its form.';
    });
    $('#revealLayers').addEventListener('click', () => {
      stopRotation(); inspect = false; layers = !layers;
      $('#viewerSurface').classList.toggle('layers', layers);
      $('#viewerSurface').classList.remove('inspect');
      $('#revealLayers').setAttribute('aria-pressed', String(layers));
      $('#inspectDial').setAttribute('aria-pressed', 'false');
      $('#modeDescription').textContent = layers ? 'Conceptual layer study: crystal, case and movement are represented by graphic rings, not an engineering model.' : 'Drag the watch to explore its form.';
    });
    $('#resetViewer').addEventListener('click', () => { stopRotation(); closeViewerModes(); angle = 0; paintAngle(); });
    $('#discoverWatch').addEventListener('click', () => {
      setFilter('all');
      $(`#product-${selectedWatch.id}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Mouse, touch and pen: pointer capture allows full turns without losing the drag.
    const surface = $('#viewerSurface');
    let dragging = false; let lastX = 0;
    surface.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      dragging = true; lastX = event.clientX;
      stopRotation();
      if (inspect || layers) closeViewerModes();
      surface.setPointerCapture(event.pointerId);
    });
    surface.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      angle = (angle + (event.clientX - lastX) * .72 + 3600) % 360;
      lastX = event.clientX;
      paintAngle();
    });
    const endDrag = () => { dragging = false; };
    surface.addEventListener('pointerup', endDrag);
    surface.addEventListener('pointercancel', endDrag);
    surface.addEventListener('lostpointercapture', endDrag);
    surface.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); stopRotation(); closeViewerModes();
        angle = (angle + (event.key === 'ArrowRight' ? 15 : -15) + 360) % 360;
        paintAngle();
      }
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopRotation(); });

    $$('.filter').forEach((button) => button.addEventListener('click', () => setFilter(button.dataset.filter)));
    $('#productGrid').addEventListener('click', (event) => {
      const fave = event.target.closest('[data-favorite]');
      const add = event.target.closest('[data-add]');
      const preview = event.target.closest('[data-preview]');
      if (fave) toggleFavorite(fave.dataset.favorite);
      if (add) addToBag(add.dataset.add);
      if (preview) selectWatch(preview.dataset.preview, true);
    });
    $('#fittingWatch').addEventListener('change', (event) => { fit.watch = event.target.value; syncFitting(); });
    $$('.tone').forEach((button) => button.addEventListener('click', () => { fit.tone = button.dataset.tone; syncFitting(); }));
    $('#wristRange').addEventListener('input', (event) => { fit.wrist = Number(event.target.value); syncFitting(); });
    $$('.size-buttons button').forEach((button) => button.addEventListener('click', () => { fit.size = Number(button.dataset.size); syncFitting(); }));
    $('#turnWrist').addEventListener('click', () => { fit.turned = !fit.turned; syncFitting(); });
    $('#resetFitting').addEventListener('click', () => { fit = { watch: 'ivory', tone: 'medium', wrist: 17, size: 40, turned: false }; syncFitting(); toast('Fitting reset'); });
    $('#exploreSize').addEventListener('click', () => selectWatch(fit.watch, true));

    $('#openBag').addEventListener('click', openBag);
    $('#mobileBag').addEventListener('click', () => { $('#mobileNav').hidden = true; openBag(); });
    $('#closeBag').addEventListener('click', closePanels);
    $('#panelOverlay').addEventListener('click', closePanels);
    $$('#openFinder, #faqFinder').forEach((b) => b.addEventListener('click', () => { resetFinder(); openModal('finderModal'); }));
    $('#aboutConcept').addEventListener('click', () => openModal('conceptModal'));
    $$('[data-close-modal]').forEach((b) => b.addEventListener('click', closePanels));
    $('#bagItems').addEventListener('click', (event) => {
      const qty = event.target.closest('[data-qty]');
      const remove = event.target.closest('[data-remove]');
      if (qty) updateQuantity(qty.dataset.id, Number(qty.dataset.qty));
      if (remove) { delete bag[remove.dataset.remove]; persistBag(); }
    });
    $('#bagBottom').addEventListener('click', (event) => {
      if (event.target.closest('#continueShopping')) { closePanels(); $('#collection').scrollIntoView({ behavior: 'smooth' }); }
      if (event.target.closest('#demoCheckout')) toast('AUREL is a concept. Checkout and real payments are not enabled.');
    });
    $('#finderChoices').addEventListener('click', (event) => {
      const button = event.target.closest('[data-finder]');
      if (button) renderFinderChoice(button.dataset.finder);
    });
    $('#finderResult').addEventListener('click', (event) => {
      const preview = event.target.closest('[data-finder-preview]');
      if (preview) { closePanels(); selectWatch(preview.dataset.finderPreview, true); }
      if (event.target.closest('#restartFinder')) resetFinder();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && activePanel) closePanels();
    });
    const menuToggle = $('#mobileMenuToggle');
    menuToggle.addEventListener('click', () => {
      $('#mobileNav').hidden = !$('#mobileNav').hidden;
      menuToggle.setAttribute('aria-expanded', String(!$('#mobileNav').hidden));
    });
    $$('#mobileNav a').forEach((link) => link.addEventListener('click', () => {
      $('#mobileNav').hidden = true; menuToggle.setAttribute('aria-expanded', 'false');
    }));
  }
  function init() {
    $('#fittingWatch').innerHTML = watches.map((w) => `<option value="${w.id}">${w.name}</option>`).join('');
    // Clean stale local-storage entries from previous iterations.
    bag = Object.fromEntries(Object.entries(bag).filter(([id, n]) => watches.some((w) => w.id === id) && Number.isInteger(n) && n > 0));
    selectWatch('ivory');
    renderProducts();
    updateBagCount();
    renderBag();
    syncFitting();
    initEvents();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
