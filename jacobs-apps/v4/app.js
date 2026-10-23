(() => {
  'use strict';
  // Reutilizamos la clave de la version anterior: las apps ya guardadas se conservan.
  const STORAGE_KEY = 'jacobs-apps:chrome:v2';
  let deferredPrompt = null;
  let nextSvgId = 0;
  let mode = 'symbol';
  let currentSymbol = 'app';
  let currentEmoji = '✨';

  const icons = {
    coins: ['Finanzas', '<ellipse cx="9" cy="7" rx="5.4" ry="2.5"/><path d="M3.6 7v7c0 1.4 2.4 2.5 5.4 2.5s5.4-1.1 5.4-2.5V7M3.6 10c0 1.4 2.4 2.5 5.4 2.5s5.4-1.1 5.4-2.5"/><circle cx="17.5" cy="13" r="3.5"/><path d="M16 13h3M17.5 11.5v3"/>'],
    hanger: ['Ropa', '<path d="M10.3 6.3a2 2 0 1 1 3.2 1.6L12.3 9l.7 1.2 6.1 3.9a1.7 1.7 0 0 1-.9 3.2H5.8a1.7 1.7 0 0 1-.9-3.2l6.1-3.9"/><path d="M15.6 14.1 18.5 19h2.3"/>'],
    spark: ['Texto e ideas', '<rect x="4.5" y="4" width="11" height="15" rx="2"/><path d="M8 9h4M8 12h4M8 15h3"/><path d="m18.5 7 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"/>'],
    check: ['Confirmación', '<circle cx="12" cy="12" r="8"/><path d="m8 12 2.7 2.7 5.2-5.7"/>'],
    cube: ['Mockups', '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>'],
    bot: ['Robot IA', '<rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M9 3h6M2 12h2M20 12h2M9 16h6"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>'],
    plane: ['Viajes', '<path d="m22 2-8 20-3-9-9-3 20-8Z"/><path d="M22 2 11 13"/>'],
    chart: ['Gráficas', '<path d="M3 3v18h18M7 16l4-4 4 3 5-8"/>'],
    app: ['Aplicación', '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>']
  };

  const emojiGroups = {
    'Herramientas': [['🤖','robot ia bot'],['✨','destellos magia'],['💡','idea bombilla'],['🔗','enlaces links'],['⚙️','ajustes herramientas'],['🧠','cerebro inteligencia'],['🔮','futuro cristal'],['🪄','varita magia'],['🧩','pieza puzzle'],['🛠️','herramientas'],['🧰','caja herramientas'],['🔧','llave'],['📱','movil teléfono'],['💻','ordenador'],['⌨️','teclado'],['🔎','buscar lupa'],['🗂️','carpetas'],['📁','carpeta'],['📂','carpeta abierta'],['📝','notas'],['📋','portapapeles'],['📌','pin'],['🔒','candado'],['🔑','llave seguridad']],
    'Creatividad': [['🎨','pintura arte diseño'],['🖌️','pincel diseño'],['✏️','lapiz'],['🖋️','pluma'],['🎬','cine claqueta'],['🎥','camara cine'],['📷','fotografia'],['📸','foto'],['🖼️','cuadro imagen'],['🎙️','microfono'],['🎧','auriculares'],['🎵','musica'],['🎹','piano'],['🎤','cantar'],['🎮','juegos'],['🕹️','videojuego'],['🎞️','pelicula'],['📽️','proyector'],['💿','disco'],['🧵','hilo'],['🪡','coser aguja'],['🧶','ovillo'],['🖨️','impresora'],['🌈','arcoiris']],
    'Dinero': [['💸','dinero gasto'],['💰','bolsa dinero'],['💶','euros'],['💳','tarjeta'],['🪙','moneda'],['📈','subida grafico'],['📉','bajada'],['📊','estadistica datos'],['🏦','banco'],['🧾','recibo factura'],['🛒','compras carrito'],['🛍️','bolsa compras'],['🏷️','etiqueta precio'],['👛','monedero'],['💲','dolar'],['💎','diamante'],['🧮','abaco calcular'],['🧷','imperdible']],
    'Trabajo': [['📅','calendario'],['🗓️','agenda'],['⏰','reloj alarma'],['⏳','tiempo reloj'],['🗃️','archivo'],['📚','libros'],['📖','libro abierto'],['📕','libro'],['📄','documento'],['📦','paquete caja'],['📐','regla escuadra'],['📏','regla'],['💼','maletin trabajo'],['✉️','carta'],['📨','correo mensaje'],['✅','check'],['☑️','verificado'],['🔔','notificaciones'],['🧭','brujula'],['🎯','objetivo']],
    'Vida diaria': [['🏠','hogar casa'],['🚗','coche'],['🚲','bicicleta'],['✈️','avion viajes'],['🧳','maleta'],['🌍','mundo'],['🗺️','mapa'],['🌴','palmera'],['☀️','sol'],['🌙','luna'],['⭐','estrella'],['❤️','corazon'],['🔥','fuego'],['🌱','planta'],['🍀','suerte'],['☕','cafe'],['🍽️','comida'],['🛏️','cama'],['💪','fuerza deporte'],['👕','camiseta ropa'],['👟','zapatillas'],['🎁','regalo'],['🥇','medalla'],['🧪','experimento']]
  };
  const emojis = Object.entries(emojiGroups).flatMap(([category,values])=>values.map(([glyph,label])=>({glyph,label,category})));

  const defaultApps = [
    {id:'eco',name:'Agente Económico',type:'ChatGPT',tagline:'Tu control económico del día a día.',description:'Asistente para organizar gastos e ingresos y consultar tu situación económica. Puedes abrir la herramienta asociada para registrar o revisar movimientos.',icon:'coins',url:'',steps:['Abre el agente económico.','Introduce un gasto, ingreso o consulta.','Revisa y confirma los datos.'],favorite:true},
    {id:'vinted',name:'Vinted Assistant',type:'ChatGPT',tagline:'Textos para tus anuncios de Vinted.',description:'A partir de las fotos y datos de un producto, te ayuda a redactar un título y una descripción de venta.',icon:'hanger',url:'',steps:['Comparte la foto del producto.','Añade marca, estado y otros detalles.','Copia la descripción generada.'],favorite:false},
    {id:'prompt',name:'Prompt Studio',type:'Web',tagline:'Guiones y teleprompter.',description:'Una herramienta para estructurar guiones, organizar el contenido por bloques y reproducirlo en modo teleprompter o escaleta.',icon:'spark',url:'https://thegooddecisions.github.io/prompt-studio/',steps:['Abre Prompt Studio.','Crea un proyecto y prepara los bloques.','Reproduce el guion en el modo elegido.'],favorite:true},
    {id:'confirm',name:'Confirmaciones TGD',type:'Web',tagline:'Gestiona y confirma.',description:'Acceso a tu herramienta para revisar estados y confirmaciones de proyectos.',icon:'check',url:'',steps:['Abre la herramienta.','Revisa el elemento pendiente.','Continúa la confirmación.'],favorite:false},
    {id:'mockups',name:'Generador de Mockups',type:'Web',tagline:'Visualiza tus diseños.',description:'Una herramienta para crear o previsualizar mockups de tus productos y diseños.',icon:'cube',url:'',steps:['Accede a la herramienta.','Selecciona el archivo o producto.','Revisa el mockup generado.'],favorite:false}
  ];

  const $ = selector => document.querySelector(selector);
  const element = id => document.getElementById(id);
  const overlays = ['detailOverlay','managerOverlay','editorOverlay','installOverlay'].map(element);
  let apps = loadApps();

  // Evita que el contenido pueda verse sin desbloquear: appShell ya viene hidden e inert desde HTML.
  bindEvents();
  renderGrid();
  registerSW();
  setInstallInstructions();

  function bindEvents() {
    element('manageButton').addEventListener('click',()=>showOverlay('managerOverlay'));
    element('addAppButton').addEventListener('click',()=>openEditor());
    element('installButton').addEventListener('click',()=>showOverlay('installOverlay'));
    element('exportButton').addEventListener('click',exportApps);
    element('importButton').addEventListener('click',()=>element('importFile').click());
    element('importFile').addEventListener('change',importApps);
    element('deleteButton').addEventListener('click',deleteApp);
    element('appForm').addEventListener('submit',saveApp);
    document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',()=>closeOverlay(btn.dataset.close+'Overlay')));
    document.querySelectorAll('.icon-tab').forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.mode;syncIconPreview();renderIconPalette();}));
    element('iconSearch').addEventListener('input',renderIconPalette);
    element('fieldCustomEmoji').addEventListener('input',event=>{
      const entered=firstGrapheme(event.target.value.trim());
      if(!entered) return;
      currentEmoji=entered;
      mode='emoji';
      syncIconPreview();
      renderIconPalette();
    });
    document.addEventListener('keydown',event=>{
      if(event.key!=='Escape')return;
      const top=overlays.findLast(o=>!o.hidden);
      if(top)closeOverlay(top.id);
    });
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;element('nativeInstallButton').hidden=false;});
    element('nativeInstallButton').addEventListener('click',async()=>{
      if(!deferredPrompt)return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt=null;
      element('nativeInstallButton').hidden=true;
    });
  }

  function loadApps(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw===null) return structuredClone(defaultApps);
      const parsed=JSON.parse(raw);
      if(Array.isArray(parsed))return normalizeImport(parsed);
    }catch{}
    return structuredClone(defaultApps);
  }
  function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(apps));}
  function safeURL(raw){
    try{if(!raw)return '';const u=new URL(String(raw));return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}
  }
  function firstGrapheme(input){
    const text=String(input||'').trim();
    if(!text)return '';
    if('Segmenter'in Intl){return new Intl.Segmenter('es',{granularity:'grapheme'}).segment(text)[Symbol.iterator]().next().value?.segment||'';}
    return Array.from(text).slice(0,1).join('');
  }
  function normalizeImport(data){
    return data.slice(0,200).filter(x=>x&&typeof x.name==='string'&&x.name.trim()).map((x,i)=>({
      id:String(x.id||'import-'+i).slice(0,80),
      name:String(x.name).slice(0,45),
      type:['ChatGPT','Telegram','Web','Otro'].includes(x.type)?x.type:'Otro',
      tagline:String(x.tagline||x.subtitle||'').slice(0,85),
      description:String(x.description||'').slice(0,2200),
      icon:icons[x.icon]?x.icon:'app',
      iconMode:x.iconMode==='emoji'?'emoji':'symbol',
      emoji:firstGrapheme(x.emoji||'✨'),
      url:safeURL(x.url),
      steps:Array.isArray(x.steps)?x.steps.slice(0,12).map(s=>String(s).slice(0,250)):[],
      favorite:!!x.favorite
    }));
  }
  function escapeHTML(value){return String(value).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));}

  function svgIcon(name){
    const id='chromeIcon'+(++nextSvgId);
    const path=(icons[name]||icons.app)[1];
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="#aee1ff"/><stop offset=".5" stop-color="#fff2fc"/><stop offset=".71" stop-color="#e9b7ff"/><stop offset=".89" stop-color="#d2eaff"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><g stroke="url(#${id})" fill="none" stroke-width="1.35" stroke-linejoin="round" stroke-linecap="round">${path}</g></svg>`;
  }
  function appIcon(app){
    return app?.iconMode==='emoji'?`<span class="emoji-art" aria-hidden="true">${escapeHTML(firstGrapheme(app.emoji||'✨'))}</span>`:`<span class="icon-art">${svgIcon(app?.icon)}</span>`;
  }
  function renderGrid(){
    const grid=element('appsGrid');grid.replaceChildren();
    apps.forEach(app=>{
      const b=document.createElement('button');b.type='button';b.className='launch-item';
      b.setAttribute('aria-label','Ver '+app.name);
      b.innerHTML=`<span class="launch-icon">${appIcon(app)}</span><span class="launch-name">${escapeHTML(app.name)}</span>`;
      b.addEventListener('click',()=>openDetail(app.id));
      grid.appendChild(b);
    });
    const newApp=document.createElement('button');newApp.type='button';newApp.className='launch-item new-app';
    newApp.setAttribute('aria-label','Añadir una nueva app');
    newApp.innerHTML='<span class="launch-icon"><span class="plus-mark">+</span></span><span class="launch-name">Nueva app</span>';
    newApp.addEventListener('click',()=>openEditor());grid.appendChild(newApp);
    element('emptyState').hidden=apps.length!==0;
  }
  function openDetail(id){
    const app=apps.find(x=>x.id===id);if(!app)return;
    const steps=app.steps.length?`<h3 class="detail-section-label">Cómo se utiliza</h3><ul class="detail-steps">${app.steps.map((step,i)=>`<li><span>${i+1}</span><span>${escapeHTML(step)}</span></li>`).join('')}</ul>`:'';
    const link=safeURL(app.url);
    element('detailContent').innerHTML=`
      <div class="detail-top">
        <div class="detail-icon">${appIcon(app)}</div>
        <div><div class="detail-kind">${escapeHTML(app.type)}</div><h2 class="detail-title" id="detailTitle">${escapeHTML(app.name)}</h2><p class="detail-tagline">${escapeHTML(app.tagline)}</p></div>
      </div>
      <div class="detail-divider"></div>
      ${app.description?`<p class="detail-body">${escapeHTML(app.description)}</p>`:''}
      ${steps}
      <div class="detail-actions">${link?`<a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="${escapeHTML(link)}">Abrir app ↗</a>`:''}<button type="button" class="btn btn-soft" id="editCurrentButton">Editar app</button></div>
      ${link?'':'<p class="detail-empty-link">Esta app aún no tiene enlace. Puedes añadirlo desde «Editar app».</p>'}`;
    element('editCurrentButton').addEventListener('click',()=>openEditor(app));
    showOverlay('detailOverlay');
  }

  function openEditor(app=null){
    closeAllOverlays();
    element('editorTitle').textContent=app?'Editar app':'Nueva app';
    element('fieldId').value=app?.id||'';
    element('fieldName').value=app?.name||'';
    element('fieldUrl').value=app?.url||'';
    element('fieldType').value=app?.type||'ChatGPT';
    element('fieldTagline').value=app?.tagline||'';
    element('fieldDescription').value=app?.description||'';
    element('fieldSteps').value=Array.isArray(app?.steps)?app.steps.join('\n'):'';
    currentSymbol=icons[app?.icon]?app.icon:'app';
    currentEmoji=firstGrapheme(app?.emoji||'✨');
    mode=app?.iconMode==='emoji'?'emoji':'symbol';
    element('fieldCustomEmoji').value=mode==='emoji'?currentEmoji:'';
    element('iconSearch').value='';
    element('deleteButton').hidden=!app;
    syncIconPreview();renderIconPalette();showOverlay('editorOverlay');
  }
  function syncIconPreview(){
    element('selectedIconPreview').innerHTML=appIcon({iconMode:mode,icon:currentSymbol,emoji:currentEmoji});
    document.querySelectorAll('.icon-tab').forEach(btn=>{const active=btn.dataset.mode===mode;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});
    element('customEmojiField').hidden=mode!=='emoji';
  }
  function renderIconPalette(){
    const palette=element('iconPalette');palette.replaceChildren();
    const q=element('iconSearch').value.toLocaleLowerCase('es').trim();
    const choices=mode==='symbol'
      ?Object.entries(icons).map(([symbol,[label]])=>({name:label,symbol,label})).filter(x=>x.name.toLocaleLowerCase('es').includes(q))
      :emojis.filter(x=>`${x.glyph} ${x.label} ${x.category}`.toLocaleLowerCase('es').includes(q));
    if(!choices.length){const p=document.createElement('p');p.className='palette-message';p.textContent='No hay resultados. Puedes pegar cualquier emoji arriba.';palette.appendChild(p);return;}
    for(const choice of choices){
      const b=document.createElement('button');b.type='button';b.className='icon-swatch';
      const active=mode==='symbol'?choice.symbol===currentSymbol:choice.glyph===currentEmoji;
      b.setAttribute('aria-label',mode==='symbol'?choice.label:`${choice.label} ${choice.glyph}`);
      b.setAttribute('aria-pressed',String(active));
      b.title=mode==='symbol'?choice.label:choice.label;
      b.innerHTML=mode==='symbol'?svgIcon(choice.symbol):`<span class="emoji-art">${escapeHTML(choice.glyph)}</span>`;
      b.addEventListener('click',()=>{
        if(mode==='symbol')currentSymbol=choice.symbol;
        else{currentEmoji=choice.glyph;element('fieldCustomEmoji').value=currentEmoji;}
        syncIconPreview();renderIconPalette();
      });
      palette.appendChild(b);
    }
  }
  function saveApp(e){
    e.preventDefault();
    const rawUrl=element('fieldUrl').value.trim();
    const url=safeURL(rawUrl);
    if(rawUrl&&!url){alert('El enlace debe empezar por https:// o http://');return;}
    const id=element('fieldId').value||(crypto.randomUUID?.()||'app-'+Date.now());
    const data={
      id,name:element('fieldName').value.trim(),url,
      type:element('fieldType').value,
      tagline:element('fieldTagline').value.trim(),
      description:element('fieldDescription').value.trim(),
      steps:element('fieldSteps').value.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,12),
      icon:currentSymbol,iconMode:mode,emoji:currentEmoji,
      favorite:apps.find(x=>x.id===id)?.favorite||false
    };
    if(!data.name)return;
    const index=apps.findIndex(x=>x.id===id);
    if(index===-1)apps.push(data);else apps[index]=data;
    persist();renderGrid();closeOverlay('editorOverlay');openDetail(id);
  }
  function deleteApp(){
    const id=element('fieldId').value;if(!id)return;
    if(!window.confirm('¿Eliminar esta app de tu biblioteca?'))return;
    apps=apps.filter(x=>x.id!==id);persist();renderGrid();closeOverlay('editorOverlay');
  }
  function exportApps(){
    const data=new Blob([JSON.stringify(apps,null,2)],{type:'application/json'});
    const u=URL.createObjectURL(data);const a=document.createElement('a');a.href=u;a.download='jacobs-apps-biblioteca.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);
  }
  function importApps(event){
    const file=event.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const parsed=JSON.parse(String(reader.result));
        if(!Array.isArray(parsed)||parsed.length>200)throw Error('Archivo no válido');
        if(!window.confirm('¿Sustituir tu biblioteca actual por la del archivo? Esta acción no se puede deshacer.'))return;
        apps=normalizeImport(parsed);persist();renderGrid();closeOverlay('managerOverlay');
      }catch{alert('El archivo no contiene una biblioteca válida.');}
      finally{event.target.value='';}
    };
    reader.readAsText(file);
  }
  function showOverlay(id){
    const overlay=element(id);if(!overlay)return;
    overlay.hidden=false;document.body.classList.add('modal-open');
    // Mantiene el PIN por encima del contenido; appShell permanece oculto mientras no se desbloquee.
    overlay.querySelector('button')?.focus();
  }
  function closeOverlay(id){
    const overlay=element(id);if(!overlay)return;
    overlay.hidden=true;
    if(!overlays.some(el=>!el.hidden))document.body.classList.remove('modal-open');
  }
  function closeAllOverlays(){overlays.forEach(o=>o.hidden=true);document.body.classList.remove('modal-open');}
  function setInstallInstructions(){
    const ua=navigator.userAgent;
    const txt=/iPad|iPhone|iPod/.test(ua)
      ?'En Safari, pulsa <strong>Compartir</strong> (cuadrado con flecha hacia arriba) y elige <strong>Añadir a pantalla de inicio</strong>.'
      :/Android/.test(ua)
      ?'Abre el menú del navegador y elige <strong>Instalar aplicación</strong> o <strong>Añadir a pantalla de inicio</strong>.'
      :'En Chrome o Edge, abre el menú del navegador y elige <strong>Instalar Jacob’s Apps</strong>.';
    element('installInstructions').innerHTML=txt;
  }
  async function registerSW(){if('serviceWorker' in navigator){try{await navigator.serviceWorker.register('./sw.js');}catch{}}}
})();
