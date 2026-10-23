/* Jacob's Apps — PIN de bloqueo local (no sustituye a la autenticacion del servidor). */
(() => {
  'use strict';
  const PIN_KEY = 'jacobs-apps:pin:v1';
  const ATTEMPTS_KEY = 'jacobs-apps:pin:attempts:v1';
  const PIN_SIZE = 6;
  const ITERATIONS = 210000;
  const IDLE_MS = 5 * 60 * 1000;
  const lockScreen = document.getElementById('lockScreen');
  const shell = document.getElementById('appShell');
  const title = document.getElementById('pinTitle');
  const subtitle = document.getElementById('pinSubtitle');
  const status = document.getElementById('pinStatus');
  const dots = document.getElementById('pinDots');
  const keypad = document.getElementById('pinKeypad');
  const footerHint = document.getElementById('pinFooterHint');
  const cancelButton = document.getElementById('pinCancel');
  let stage = 'setup';
  let digits = '';
  let pendingPin = '';
  let busy = false;
  let unlocked = false;
  let lastActivity = Date.now();
  let saved = readRecord();

  const messages = {
    setup: ['Crea tu PIN', 'Elige seis números para bloquear Jacob’s Apps en este dispositivo.', 'EL PRIMER PASO'],
    confirm: ['Repite tu PIN', 'Confirma los seis números para terminar la configuración.', 'VERIFICACIÓN'],
    unlock: ['Acceso privado', 'Introduce tu PIN para acceder a Jacob’s Apps.', 'WELCOME BACK'],
    'change-verify': ['Tu PIN actual', 'Por seguridad, introduce el PIN que utilizas ahora.', 'SEGURIDAD'],
    'change-new': ['Nuevo PIN', 'Elige los seis números que utilizarás a partir de ahora.', 'CAMBIO DE CÓDIGO'],
    'change-confirm': ['Confirma el nuevo PIN', 'Repite el nuevo código para guardar el cambio.', 'ÚLTIMO PASO']
  };

  init();

  function init() {
    // El HTML empieza siempre oculto para que nunca aparezca el catalogo antes del desbloqueo.
    shell.hidden = true;
    shell.inert = true;
    shell.setAttribute('aria-hidden', 'true');
    lockScreen.hidden = false;
    document.body.classList.add('pin-locked');
    renderStage(saved ? 'unlock' : 'setup');

    keypad.addEventListener('click', (event) => {
      const btn = event.target.closest('button');
      if (!btn || btn.disabled) return;
      if (btn.dataset.key === 'erase') eraseDigit();
      else if (/^[0-9]$/.test(btn.dataset.key || '')) pushDigit(btn.dataset.key);
    });
    document.addEventListener('keydown', (event) => {
      if (unlocked || lockScreen.hidden || event.metaKey || event.ctrlKey || event.altKey) return;
      if (/^[0-9]$/.test(event.key)) {event.preventDefault(); pushDigit(event.key);}
      if (event.key === 'Backspace') {event.preventDefault(); eraseDigit();}
      if (event.key === 'Escape' && cancelButton.hidden === false) {event.preventDefault(); cancelChange();}
    });
    cancelButton.addEventListener('click', cancelChange);
    document.getElementById('lockNowButton').addEventListener('click', () => lockNow());
    document.getElementById('changePinButton').addEventListener('click', () => {
      lockNow('change-verify');
    });
    // Al abandonar la app (por ejemplo para abrir ChatGPT) vuelve a quedar bloqueada.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && unlocked) lockNow();
    });
    window.addEventListener('pagehide', () => {
      if (unlocked) lockNow();
    });
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(evt => {
      document.addEventListener(evt, () => {if (unlocked) lastActivity = Date.now();}, {passive: true});
    });
    setInterval(() => {
      if (unlocked && Date.now() - lastActivity > IDLE_MS) lockNow();
    }, 15000);
  }

  function readRecord() {
    try {
      const data = JSON.parse(localStorage.getItem(PIN_KEY) || 'null');
      if (!data || data.v !== 1 || !/^[0-9a-f]{32}$/.test(data.salt || '') || !/^[0-9a-f]{64}$/.test(data.hash || '') || !Number.isInteger(data.iterations) || data.iterations < 100000) return null;
      return data;
    } catch { return null; }
  }

  function readAttempts() {
    try {
      const data = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '{}');
      return {count: Number.isFinite(data.count) ? Math.max(0, data.count) : 0, blockedUntil: Number.isFinite(data.blockedUntil) ? data.blockedUntil : 0};
    } catch { return {count: 0, blockedUntil: 0}; }
  }

  function persistAttempts(attempts) {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  }

  function renderStage(nextStage, msg = '') {
    stage = nextStage;
    digits = '';
    busy = false;
    lockScreen.dataset.stage = stage;
    const [heading, description, kicker] = messages[stage];
    title.textContent = heading;
    subtitle.textContent = description;
    document.getElementById('pinKicker').textContent = kicker;
    footerHint.textContent = stage === 'setup' || stage === 'confirm' ? 'Se guarda solo en este dispositivo. No compartas tu código.' : 'Tu PIN no se publica en GitHub ni se envía a ningún servidor.';
    cancelButton.hidden = !stage.startsWith('change-');
    if (msg) showStatus(msg, true); else showStatus('', false);
    updateDots();
    refreshBlock();
  }

  function updateDots() {
    dots.innerHTML = '';
    for (let i = 0; i < PIN_SIZE; i++) {
      const dot = document.createElement('span');
      dot.className = 'pin-dot' + (i < digits.length ? ' filled' : '');
      dot.setAttribute('aria-hidden', 'true');
      dots.appendChild(dot);
    }
    dots.setAttribute('aria-label', `${digits.length} de ${PIN_SIZE} dígitos introducidos`);
  }

  function showStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle('is-error', Boolean(isError));
  }

  function refreshBlock() {
    const attempts = readAttempts();
    if (saved && (stage === 'unlock' || stage === 'change-verify') && attempts.blockedUntil > Date.now()) {
      const secs = Math.ceil((attempts.blockedUntil - Date.now()) / 1000);
      showStatus(`Demasiados intentos. Prueba otra vez en ${secs} s.`, true);
      return true;
    }
    return false;
  }

  function pushDigit(digit) {
    if (busy || refreshBlock() || digits.length >= PIN_SIZE) return;
    digits += digit;
    showStatus('', false);
    updateDots();
    if (digits.length === PIN_SIZE) {
      busy = true;
      setTimeout(() => void submitDigits(), 170);
    }
  }

  function eraseDigit() {
    if (busy || !digits.length) return;
    digits = digits.slice(0, -1);
    showStatus('', false);
    updateDots();
  }

  async function submitDigits() {
    const entered = digits;
    digits = '';
    updateDots();
    try {
      if (!window.crypto || !crypto.subtle) throw new Error('Usa un navegador con conexión HTTPS para configurar la protección.');
      if (stage === 'setup' || stage === 'change-new') {
        pendingPin = entered;
        renderStage(stage === 'setup' ? 'confirm' : 'change-confirm');
        return;
      }
      if (stage === 'confirm' || stage === 'change-confirm') {
        if (entered !== pendingPin) {
          pendingPin = '';
          renderStage(stage === 'confirm' ? 'setup' : 'change-new', 'Los códigos no coinciden. Vuelve a intentarlo.');
          return;
        }
        const newSalt = crypto.getRandomValues(new Uint8Array(16));
        const iterations = ITERATIONS;
        const record = {v: 1, salt: hex(newSalt), iterations, hash: await makeHash(entered, newSalt, iterations)};
        localStorage.setItem(PIN_KEY, JSON.stringify(record));
        localStorage.removeItem(ATTEMPTS_KEY);
        saved = record;
        pendingPin = '';
        unlock();
        return;
      }
      if (stage === 'unlock' || stage === 'change-verify') {
        const current = saved;
        const calculated = await makeHash(entered, unhex(current.salt), current.iterations);
        if (safeEquals(calculated, current.hash)) {
          localStorage.removeItem(ATTEMPTS_KEY);
          if (stage === 'change-verify') renderStage('change-new');
          else unlock();
          return;
        }
        const attempts = readAttempts();
        attempts.count += 1;
        if (attempts.count % 5 === 0) {
          attempts.blockedUntil = Date.now() + Math.min(60000 * Math.pow(2, Math.floor(attempts.count / 5) - 1), 15 * 60000);
        }
        persistAttempts(attempts);
        showStatus('PIN incorrecto. Inténtalo de nuevo.', true);
        refreshBlock();
      }
    } catch (error) {
      showStatus(error?.message || 'No se pudo verificar el PIN. Inténtalo de nuevo.', true);
    } finally {
      busy = false;
    }
  }

  async function makeHash(pin, salt, iterations) {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({name: 'PBKDF2', salt, iterations, hash: 'SHA-256'}, key, 256);
    return hex(new Uint8Array(bits));
  }

  function hex(bytes) {return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');}
  function unhex(s) {return new Uint8Array(s.match(/.{2}/g).map(v => parseInt(v, 16)));}
  function safeEquals(a,b) {if (a.length !== b.length) return false; let result = 0; for (let i=0; i<a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i); return result === 0;}

  function unlock() {
    unlocked = true;
    digits = '';
    pendingPin = '';
    lastActivity = Date.now();
    shell.hidden = false;
    shell.inert = false;
    shell.removeAttribute('aria-hidden');
    lockScreen.hidden = true;
    document.body.classList.remove('pin-locked');
    document.body.classList.remove('modal-open');
    showStatus('', false);
    document.dispatchEvent(new CustomEvent('jacobs:unlocked'));
  }

  function lockNow(nextStage = 'unlock') {
    unlocked = false;
    pendingPin = '';
    shell.hidden = true;
    shell.inert = true;
    shell.setAttribute('aria-hidden', 'true');
    lockScreen.hidden = false;
    document.body.classList.add('pin-locked');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.querySelectorAll('#appShell .overlay').forEach(overlay => {overlay.hidden = true;});
    renderStage(nextStage);
  }

  function cancelChange() {
    pendingPin = '';
    renderStage('unlock');
  }
})();
