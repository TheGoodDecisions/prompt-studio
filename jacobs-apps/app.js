(() => {
  'use strict';

  const STORAGE_KEY = 'jacobs-apps:chrome:v2';
  let deferredPrompt = null;

  const iconPaths = {
    coins: '<ellipse cx="9" cy="7" rx="5.4" ry="2.5"></ellipse><path d="M3.6 7v7c0 1.4 2.4 2.5 5.4 2.5s5.4-1.1 5.4-2.5V7"></path><path d="M3.6 10c0 1.4 2.4 2.5 5.4 2.5s5.4-1.1 5.4-2.5"></path><path d="M17.6 9.2c1.9 0 3.4 1.5 3.4 3.4S19.5 16 17.6 16s-3.4-1.5-3.4-3.4 1.5-3.4 3.4-3.4Z"></path><path d="M17.6 10.8v3.6"></path><path d="M16.1 12.2h3"></path>',
    hanger: '<path d="M10.4 6.7a2.1 2.1 0 1 1 3.1 1.9l-.9.5.5 1 6 3.4a1.8 1.8 0 0 1-.9 3.4H5.7a1.8 1.8 0 0 1-.9-3.4l6.3-3.6-.9-1.9"></path><path d="m14.8 13.6 3.5 6.2"></path><path d="M17.7 18.7h3.2"></path>',
    spark: '<rect x="5" y="4.5" width="10.5" height="14.5" rx="2"></rect><path d="M8 9h5"></path><path d="M8 12h5"></path><path d="M8 15h3.2"></path><path d="m18.5 8.2.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8.8-2.1Z"></path>',
    check: '<circle cx="12" cy="12" r="7.5"></circle><path d="m8.8 12 2.1 2.2 4.3-4.6"></path>',
    cube: '<path d="m12 4 6.8 3.8v8.4L12 20l-6.8-3.8V7.8L12 4Z"></path><path d="M12 4v8.3"></path><path d="m18.8 7.8-6.8 4-6.8-4"></path><rect x="15.5" y="13.3" width="6" height="5" rx="1"></rect><path d="m17.4 16.5 1.3-1.3 1.4 1.3"></path><circle cx="20" cy="14.9" r=".55" fill="currentColor" stroke="none"></circle>',
    bot: '<rect x="5" y="7" width="14" height="10" rx="3"></rect><path d="M12 4v3"></path><path d="M9 4h6"></path><path d="M2.5 11.5H5"></path><path d="M19 11.5h2.5"></path><circle cx="10" cy="11" r=".8" fill="currentColor" stroke="none"></circle><circle cx="14" cy="11" r=".8" fill="currentColor" stroke="none"></circle><path d="M9.5 14h5"></path>',
    plane: '<path d="m21 4-8.1 15.6-2.9-6.6-6.6-2.9L21 4Z"></path><path d="M21 4 10 13"></path>',
    chart: '<path d="M4 4v16h16"></path><path d="m7 15 4-4 3 2 3-5"></path><circle cx="7" cy="15" r=".7" fill="currentColor" stroke="none"></circle><circle cx="11" cy="11" r=".7" fill="currentColor" stroke="none"></circle><circle cx="14" cy="13" r=".7" fill="currentColor" stroke="none"></circle><circle cx="17" cy="8" r=".7" fill="currentColor" stroke="none"></circle>',
    app: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"></rect><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"></rect><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"></rect><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"></rect>'
  };

  const defaultApps = [
    {
      id: 'eco',
      name: 'Agente Económico',
      type: 'ChatGPT',
      tagline: 'Analiza, calcula y organiza tus movimientos.',
      description: 'Tu asistente para entender gastos, ingresos, categorías y seguimiento económico del día a día. Ideal para registrar y revisar tu actividad financiera personal o profesional.',
      icon: 'coins',
      url: '',
      steps: ['Abre el chat del agente.', 'Describe el gasto o ingreso.', 'Confirma la información para registrarla o revisarla.'],
      favorite: true
    },
    {
      id: 'vinted',
      name: 'Vinted Assistant',
      type: 'ChatGPT',
      tagline: 'Te ayuda a redactar y optimizar anuncios.',
      description: 'Asistente pensado para generar títulos, descripciones y estructuras de venta más claras para tus prendas o productos en Vinted.',
      icon: 'hanger',
      url: '',
      steps: ['Comparte las fotos o detalles del producto.', 'Pide un anuncio claro y atractivo.', 'Copia el texto final en Vinted.'],
      favorite: false
    },
    {
      id: 'prompt',
      name: 'Prompt Studio',
      type: 'Web',
      tagline: 'Mejores prompts, mejor flujo de trabajo.',
      description: 'Herramienta para estructurar ideas, guiones o prompts y usarlos de forma ordenada. Ideal para trabajar contenidos y producción con más claridad.',
      icon: 'spark',
      url: 'https://thegooddecisions.github.io/prompt-studio/',
      steps: ['Abre la app.', 'Crea o pega tu estructura.', 'Usa el modo de lectura o teleprompter según tu necesidad.'],
      favorite: true
    },
    {
      id: 'confirm',
      name: 'Confirmaciones TGD',
      type: 'Web',
      tagline: 'Gestiona validaciones y confirmaciones.',
      description: 'Un espacio para revisar y confirmar procesos, pedidos o estados de forma más limpia y directa.',
      icon: 'check',
      url: '',
      steps: ['Accede al enlace del sistema.', 'Revisa los elementos pendientes.', 'Confirma o continúa la gestión.'],
      favorite: false
    },
    {
      id: 'mockups',
      name: 'Generador de Mockups',
      type: 'Web',
      tagline: 'Convierte ideas en visuales rápidos.',
      description: 'Proyecto orientado a crear mockups y previsualizaciones rápidas para enseñar ideas con mejor contexto visual.',
      icon: 'cube',
      url: '',
      steps: ['Selecciona el recurso base.', 'Define el uso o composición.', 'Genera una previsualización lista para revisar.'],
      favorite: false
    }
  ];

  const ui = {
    appsGrid: document.getElementById('appsGrid'),
    heroPreview: document.getElementById('heroPreview'),
    searchInput: document.getElementById('searchInput'),
    emptyState: document.getElementById('emptyState'),
    detailOverlay: document.getElementById('detailOverlay'),
    detailContent: document.getElementById('detailContent'),
    editorOverlay: document.getElementById('editorOverlay'),
    installOverlay: document.getElementById('installOverlay'),
    appForm: document.getElementById('appForm'),
    installInstructions: document.getElementById('installInstructions'),
    nativeInstallButton: document.getElementById('nativeInstallButton'),
    deleteButton: document.getElementById('deleteButton')
  };

  let apps = readApps();
  let activeSearch = '';

  render();
  registerSW();
  setupInstallInstructions();

  document.getElementById('addAppButton').addEventListener('click', () => openEditor());
  document.getElementById('heroAddButton').addEventListener('click', () => openEditor());
  document.getElementById('installButton').addEventListener('click', () => openOverlay(ui.installOverlay));
  document.getElementById('importButton').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('exportButton').addEventListener('click', exportApps);
  document.getElementById('importFile').addEventListener('change', importApps);
  ui.searchInput.addEventListener('input', (e) => {
    activeSearch = e.target.value.trim().toLowerCase();
    renderGrid();
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.close;
      if (target === 'detail') closeOverlay(ui.detailOverlay);
      if (target === 'editor') closeOverlay(ui.editorOverlay);
      if (target === 'install') closeOverlay(ui.installOverlay);
    });
  });

  ui.appForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('fieldId').value || crypto.randomUUID();
    const app = {
      id,
      name: document.getElementById('fieldName').value.trim(),
      type: document.getElementById('fieldType').value,
      tagline: document.getElementById('fieldTagline').value.trim(),
      description: document.getElementById('fieldDescription').value.trim(),
      icon: document.getElementById('fieldIcon').value,
      url: validUrl(document.getElementById('fieldUrl').value.trim()),
      steps: document.getElementById('fieldSteps').value.split('\n').map(v => v.trim()).filter(Boolean),
      favorite: apps.find(item => item.id === id)?.favorite || false
    };
    if (!app.url && document.getElementById('fieldUrl').value.trim()) { alert('Utiliza una URL que empiece por https:// o http://'); return; }
    const existingIndex = apps.findIndex(item => item.id === id);
    if (existingIndex >= 0) apps[existingIndex] = app; else apps.unshift(app);
    persist();
    closeOverlay(ui.editorOverlay);
    render();
    openDetail(id);
  });

  ui.deleteButton.addEventListener('click', () => {
    const id = document.getElementById('fieldId').value;
    if (!id) return;
    apps = apps.filter(app => app.id !== id);
    persist();
    closeOverlay(ui.editorOverlay);
    render();
  });

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    ui.nativeInstallButton.hidden = false;
  });

  ui.nativeInstallButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    ui.nativeInstallButton.hidden = true;
  });

  function readApps() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaultApps);
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : structuredClone(defaultApps);
    } catch {
      return structuredClone(defaultApps);
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  }

  function render() {
    renderGrid();
    renderHeroPreview();
  }

  function filteredApps() {
    const pool = [...apps].sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name));
    if (!activeSearch) return pool;
    return pool.filter(app => [app.name, app.type, app.tagline, app.description].join(' ').toLowerCase().includes(activeSearch));
  }

  function renderGrid() {
    const items = filteredApps();
    ui.appsGrid.innerHTML = '';
    ui.emptyState.hidden = items.length > 0;
    items.forEach(app => {
      const tpl = document.getElementById('cardTemplate').content.firstElementChild.cloneNode(true);
      tpl.dataset.id = app.id;
      tpl.querySelector('.app-type').textContent = app.type;
      tpl.querySelector('.app-name').textContent = app.name;
      tpl.querySelector('.app-tagline').textContent = app.tagline || 'Sin descripción corta';
      const favoriteButton = tpl.querySelector('.favorite-button');
      favoriteButton.classList.toggle('is-on', !!app.favorite);
      favoriteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(app.id);
      });
      tpl.querySelector('.app-icon').innerHTML = iconSvg(app.icon);
      tpl.querySelector('.arrow-button').addEventListener('click', (e) => {
        e.stopPropagation();
        openDetail(app.id);
      });
      tpl.addEventListener('click', () => openDetail(app.id));
      ui.appsGrid.appendChild(tpl);
    });
  }

  function renderHeroPreview() {
    const picks = [...apps].slice(0, 4);
    ui.heroPreview.innerHTML = '';
    picks.forEach(app => {
      const tile = document.createElement('div');
      tile.className = 'showcase-tile';
      tile.innerHTML = `<div class="showcase-icon">${iconSvg(app.icon)}</div>`;
      ui.heroPreview.appendChild(tile);
    });
  }

  function toggleFavorite(id) {
    const app = apps.find(item => item.id === id);
    if (!app) return;
    app.favorite = !app.favorite;
    persist();
    render();
  }

  function openDetail(id) {
    const app = apps.find(item => item.id === id);
    if (!app) return;
    const steps = app.steps?.length ? `<ul class="detail-steps">${app.steps.map((step, i) => `<li><span class="step-badge">${i + 1}</span><span>${escapeHTML(step)}</span></li>`).join('')}</ul>` : '<p class="detail-empty">Todavía no hay pasos añadidos.</p>';
    ui.detailContent.innerHTML = `
      <div class="detail-layout">
        <div class="detail-visual">
          <div class="detail-icon">${iconSvg(app.icon)}</div>
        </div>
        <div>
          <div class="detail-type">${escapeHTML(app.type)}</div>
          <h2 id="detailTitle" class="detail-title iridescent-text">${escapeHTML(app.name)}</h2>
          <p class="detail-tagline">${escapeHTML(app.tagline || 'Sin subtítulo')}</p>
          <p class="detail-description">${escapeHTML(app.description || 'Sin descripción todavía.')}</p>
          <div class="eyebrow">CÓMO SE USA</div>
          ${steps}
          <div class="detail-actions">
            ${app.url ? `<a class="cta primary" href="${escapeAttribute(app.url)}" target="_blank" rel="noopener noreferrer">Abrir app</a>` : ''}
            <button class="cta secondary" type="button" id="editCurrentButton">Editar</button>
          </div>
        </div>
      </div>`;
    ui.detailContent.querySelector('#editCurrentButton').addEventListener('click', () => openEditor(app));
    openOverlay(ui.detailOverlay);
  }

  function openEditor(app = null) {
    document.getElementById('editorTitle').textContent = app ? 'Editar app' : 'Nueva app';
    document.getElementById('fieldId').value = app?.id || '';
    document.getElementById('fieldName').value = app?.name || '';
    document.getElementById('fieldType').value = app?.type || 'ChatGPT';
    document.getElementById('fieldTagline').value = app?.tagline || '';
    document.getElementById('fieldDescription').value = app?.description || '';
    document.getElementById('fieldIcon').value = app?.icon || 'app';
    document.getElementById('fieldUrl').value = app?.url || '';
    document.getElementById('fieldSteps').value = app?.steps?.join('\n') || '';
    ui.deleteButton.hidden = !app;
    if (ui.detailOverlay.hidden === false) closeOverlay(ui.detailOverlay);
    openOverlay(ui.editorOverlay);
  }

  function exportApps() {
    const blob = new Blob([JSON.stringify(apps, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jacobs-apps-library.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importApps(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed) || parsed.length > 200) throw new Error('Formato no válido.');
        apps = parsed.filter(x => x && typeof x.name === 'string' && typeof x.id === 'string').map(x => ({
          id: String(x.id).slice(0,80),
          name: String(x.name).slice(0,80),
          type: ['Web','ChatGPT','Telegram','Otro'].includes(x.type) ? x.type : 'Otro',
          tagline: String(x.tagline || '').slice(0,150),
          description: String(x.description || '').slice(0,1200),
          icon: Object.hasOwn(iconPaths,x.icon) ? x.icon : 'app',
          url: validUrl(String(x.url || '')),
          steps: Array.isArray(x.steps) ? x.steps.slice(0,12).map(v => String(v).slice(0,260)) : [],
          favorite: Boolean(x.favorite)
        }));
        persist();
        render();
      } catch {
        alert('No se pudo importar el archivo JSON.');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  }

  function openOverlay(element) {
    element.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeOverlay(element) {
    element.hidden = true;
    const stillOpen = [ui.detailOverlay, ui.editorOverlay, ui.installOverlay].some(item => !item.hidden);
    if (!stillOpen) document.body.style.overflow = '';
  }

  function setupInstallInstructions() {
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    let html = '';
    if (isIOS) {
      html = 'En iPhone o iPad: pulsa <strong>Compartir</strong> en Safari y después <strong>Añadir a pantalla de inicio</strong>.';
    } else if (isAndroid) {
      html = 'En Android: abre el menú del navegador y pulsa <strong>Instalar aplicación</strong> o <strong>Añadir a pantalla de inicio</strong>.';
    } else {
      html = 'En ordenador: usa la opción <strong>Instalar</strong> del navegador si aparece en la barra de direcciones o en el menú.';
    }
    ui.installInstructions.innerHTML = html;
  }

  async function registerSW() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('./sw.js');
      } catch {}
    }
  }

  function validUrl(value) {
    if (!value) return '';
    try {
      const parsed = new URL(value);
      return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : '';
    } catch {
      return '';
    }
  }

  function iconSvg(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || iconPaths.app}</svg>`;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function escapeAttribute(value) {
    return escapeHTML(value).replace(/`/g, '&#96;');
  }
})();
