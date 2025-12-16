
// Persistencia de personas en localStorage
const PEOPLE_KEY = 'people_v1';
function loadPeople(){
  try{
    const raw = localStorage.getItem(PEOPLE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_PEOPLE));
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return JSON.parse(JSON.stringify(DEFAULT_PEOPLE));
    return parsed;
  } catch(e){
    return JSON.parse(JSON.stringify(DEFAULT_PEOPLE));
  }
}
function savePeople(){
  try { localStorage.setItem(PEOPLE_KEY, JSON.stringify(people)); } catch(e){}
}

let people = loadPeople();

const heatmap = document.getElementById('heatmap');
const todayStatus = document.getElementById('todayStatus');

// Edit mode toggle (lapicito)
const editToggle = document.getElementById('editToggle');
let editMode = false;
if (editToggle) {
  editToggle.addEventListener('click', () => {
    editMode = !editMode;
    editToggle.setAttribute('aria-pressed', String(editMode));
    editToggle.classList.toggle('active', editMode);
    buildHeatmap();
  });
}

// Añadir botón "Agregar persona" en el área de edición
const editControlsContainer = document.getElementById('editControls');
function ensureAddPersonButton(){
  if (!editControlsContainer) return;
  editControlsContainer.innerHTML = '';
  const addBtn = document.createElement('button');
  addBtn.id = 'addPersonBtn';
  addBtn.className = 'btn';
  addBtn.innerHTML = '<span class="icon add" aria-hidden="true"></span><span>Agregar persona</span>';
  addBtn.addEventListener('click', (e)=>{ e.stopPropagation(); addPerson(); });
  if (editMode) editControlsContainer.appendChild(addBtn);
}

// Mapa de colores por celda (clave: "Persona|ISODate") - persiste en localStorage
let cellColors = {};
try { cellColors = JSON.parse(localStorage.getItem('cellColors') || '{}'); } catch(e){ cellColors = {}; }

function generateDates(daysAhead = 365) {
  // Genera un array de fechas empezando por hoy y avanzando hacia el futuro
  const dates = [];
  const today = new Date();
  today.setHours(0,0,0,0);
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function isWorking(person, date) {
  // Determinación 100% manual por celda: primero verificar `cellColors`.
  // Si no hay color personalizado, por defecto se considera trabajando.
  const key = `${person.name}|${date.toISOString()}`;
  if (cellColors[key] === 'green') return true;
  if (cellColors[key] === 'franco') return false;
  return true;
}

function buildHeatmap() {
  ensureAddPersonButton();
  const dates = generateDates(365);

  // Header: fila con número del día (primera fila)
  const dayNumbersRow = document.createElement('div');
  dayNumbersRow.className = 'day-numbers';
  dayNumbersRow.style.display = 'flex';
  dayNumbersRow.style.gap = '4px';
  dayNumbersRow.style.paddingLeft = 'var(--name-width)'; // espacio para nombres de personas (ajustado luego dinámicamente)
  dates.forEach(d => {
    const dn = document.createElement('div');
    dn.className = 'day-number';
    dn.style.minWidth = '12px';
    dn.style.textAlign = 'center';
    dn.textContent = String(d.getDate());
    dayNumbersRow.appendChild(dn);
  });

  // Header: month labels (one div per day, label only when month changes)
  const monthsRow = document.createElement('div');
  monthsRow.className = 'month-labels';
  monthsRow.style.display = 'flex';
  monthsRow.style.gap = '4px';
  monthsRow.style.paddingLeft = 'var(--name-width)'; // espacio para nombres de personas (se ajustará luego dinámicamente)
  let lastMonth = -1;
  dates.forEach(d => {
    const m = d.getMonth();
    const label = document.createElement('div');
    label.className = 'month';
    label.style.minWidth = '12px';
    label.style.textAlign = 'center';
    label.textContent = (m !== lastMonth) ? d.toLocaleString('es-ES',{month:'short'}) : '';
    monthsRow.appendChild(label);
    lastMonth = m;
  });

  heatmap.innerHTML = '';
  // Añadir primero la fila de meses, luego la fila de números de día (mes arriba)
  heatmap.appendChild(monthsRow);
  heatmap.appendChild(dayNumbersRow);

  // Fila superior invisible con flecha apuntando hacia arriba en la columna de hoy
  const arrowRow = document.createElement('div');
  arrowRow.className = 'person-row arrow-row';
  arrowRow.style.display = 'flex';
  arrowRow.style.alignItems = 'center';
  // placeholder para ocupar el ancho de los nombres
  const namePlaceholder = document.createElement('div');
  namePlaceholder.className = 'person-name';
  namePlaceholder.setAttribute('aria-hidden','true');
  namePlaceholder.innerHTML = '&nbsp;';
  arrowRow.appendChild(namePlaceholder);

  const today = new Date(); today.setHours(0,0,0,0);
  dates.forEach(d => {
    const cell = document.createElement('div');
    cell.className = 'day person-day arrow-cell';
    cell.style.minWidth = '12px';
    cell.style.height = '12px';
    cell.style.marginRight = '4px';
    // Si es hoy, añadir la flechita apuntando hacia arriba
    const d0 = new Date(d); d0.setHours(0,0,0,0);
    if (+d0 === +today) {
      const up = document.createElement('div');
      up.className = 'arrow-up';
      up.setAttribute('aria-hidden','true');
      cell.appendChild(up);
    }
    arrowRow.appendChild(cell);
  });

  // No anexar aún: la fila de flecha se añadirá al final (después de las filas de personas)

  // Grid: una fila por persona, una columna por fecha
  const rowsContainer = document.createElement('div');
  rowsContainer.className = 'person-rows';

  people.forEach(person => {
    const row = document.createElement('div');
    row.className = 'person-row';
    row.style.display = 'flex';
    row.style.alignItems = 'center';

    const nameEl = document.createElement('div');
    nameEl.className = 'person-name';
    nameEl.textContent = person.name;
    // Si estamos en modo edición, permitir renombrar y mostrar botón de borrar
    if (editMode) {
      nameEl.style.cursor = 'pointer';
      nameEl.title = 'Clic para renombrar';
      nameEl.addEventListener('click', (e)=>{ e.stopPropagation(); renamePerson(person.name); });

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-icon person-delete';
      delBtn.innerHTML = '<span class="icon trash" aria-hidden="true"></span><span class="visually-hidden">Borrar persona</span>';
      delBtn.title = 'Borrar persona';
      delBtn.addEventListener('click', (e)=>{ e.stopPropagation(); deletePerson(person.name); });

      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.appendChild(nameEl);
      wrapper.appendChild(delBtn);
      row.appendChild(wrapper);
    } else {
      row.appendChild(nameEl);
    }

    dates.forEach(d => {
      const cell = document.createElement('div');
      cell.className = 'day person-day';
      cell.style.minWidth = '12px';
      cell.style.height = '12px';
      cell.style.marginRight = '4px';

      const working = isWorking(person, d);
      cell.classList.add(working ? 'working' : 'off');
      cell.dataset.date = d.toISOString();
      cell.dataset.person = person.name;

      const today = new Date(); today.setHours(0,0,0,0);
      if (+d === +today) cell.classList.add('today');

      cell.title = `${person.name} — ${d.toLocaleDateString('es-ES')}: ${working ? 'Trabajando' : 'Franco'}`;

      cell.addEventListener('mouseenter', (e)=>showTooltip(e, person, d));
      cell.addEventListener('mouseleave', hideTooltip);

      // En modo edición, al hacer click alternar entre verde y franco
      cell.addEventListener('click', (e)=>{
        if (!editMode) return;
        e.stopPropagation();
        const key = `${cell.dataset.person}|${cell.dataset.date}`;
        // Si el mismo `mousedown` ya alternó esta celda, ignorar el click inmediato
        if (skipClickKey === key) { skipClickKey = null; return; }
        toggleCellColor(cell);
      });

      // Aplicar color personalizado si existe (valores: 'green' | 'franco')
      const colorKey = `${person.name}|${d.toISOString()}`;
      if (cellColors[colorKey] === 'green') cell.style.backgroundColor = GREEN_HEX;
      if (cellColors[colorKey] === 'franco') cell.style.backgroundColor = FRANCO_HEX;

      row.appendChild(cell);
    });

    rowsContainer.appendChild(row);
  });

  heatmap.appendChild(rowsContainer);

  // Añadir la fila de flecha como ÚLTIMA fila (celdas invisibles excepto la flecha)
  heatmap.appendChild(arrowRow);

  // Ajustar ancho fijo de la columna de nombres (usar el ancho del nombre más largo,
  // incluyendo el botón de borrar cuando está presente). Esto asegura que todas las
  // celdas de nombres tengan el mismo ancho y evita que cambien de tamaño.
  setTimeout(() => {
    const nameEls = heatmap.querySelectorAll('.person-name');
    let max = 0;
    nameEls.forEach(el => {
      let measureEl = el;
      // si el nombre está dentro de un wrapper que incluye el botón borrar, medir el wrapper
      if (el.parentElement && el.parentElement.querySelector('.person-delete')) {
        measureEl = el.parentElement;
      }
      const w = Math.ceil(measureEl.getBoundingClientRect().width);
      if (w > max) max = w;
    });
    // Añadir un pequeño margen para separar nombres de las celdas
    const padding = Math.max(max + 12, 80);
    // Aplicar como variable CSS para que tanto .person-name como .month-labels la usen
    try { document.documentElement.style.setProperty('--name-width', padding + 'px'); } catch (e){}
    const months = heatmap.querySelector('.month-labels');
    if (months) months.style.paddingLeft = padding + 'px';
    const dayNums = heatmap.querySelector('.day-numbers');
    if (dayNums) dayNums.style.paddingLeft = padding + 'px';
    // Reposicionar el pointer del día actual después del ajuste
    const ev = new Event('resize'); window.dispatchEvent(ev);
  }, 0);

  // Indicador del día actual: línea vertical que marca la columna de hoy
  function positionTodayPointer() {
    let pointer = heatmap.querySelector('.today-pointer');
    if (!pointer) return;

    const todayCell = heatmap.querySelector('.person-day.today');
    if (!todayCell) { pointer.style.display = 'none'; return; }

    const containerRect = heatmap.getBoundingClientRect();
    const cellRect = todayCell.getBoundingClientRect();
    const monthsRowEl = heatmap.querySelector('.month-labels');
    const monthsRect = monthsRowEl ? monthsRowEl.getBoundingClientRect() : {bottom: containerRect.top};
    const rowsEl = heatmap.querySelector('.person-rows');

    // Usar scrollLeft para compensar el desplazamiento horizontal del contenedor
    const left = (cellRect.left - containerRect.left) + heatmap.scrollLeft + (cellRect.width / 2);
    const top = monthsRect.bottom - containerRect.top;


  }

  // Crear pointer si no existe
  if (!heatmap.querySelector('.today-pointer')) {
    const pointer = document.createElement('div');
    pointer.className = 'today-pointer';
    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    pointer.appendChild(arrow);
    heatmap.appendChild(pointer);
  }

  // Ajustar posición inicialmente y al hacer scroll/redimensionar
  positionTodayPointer();
  heatmap.addEventListener('scroll', positionTodayPointer);
  window.addEventListener('resize', positionTodayPointer);

  renderTodayStatus();
}
let tooltipEl = null;
function showTooltip(e, person, date) {
  hideTooltip();
  const status = isWorking(person, date) ? 'Trabajando' : 'Franco';

  tooltipEl = document.createElement('div');
  tooltipEl.className = 'tooltip';
  tooltipEl.innerHTML = `<strong>${person.name} — ${date.toLocaleDateString('es-ES')}</strong><br>`+
    `<span style="color:#9aa6b2">Estado:</span> ${status}`;
  document.body.appendChild(tooltipEl);

  const rect = e.target.getBoundingClientRect();
  tooltipEl.style.left = (rect.right + 8) + 'px';
  tooltipEl.style.top = (rect.top) + 'px';
}

function hideTooltip() {
  if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
}

// Editor modal: abrir para editar offDays de una persona
// Toggle simple: en modo edición, clic alterna entre verde y color de franco
const GREEN_HEX = '#4caf50';
const FRANCO_HEX = '#132027';
function toggleCellColor(cell){
  hideTooltip();
  const key = `${cell.dataset.person}|${cell.dataset.date}`;
  const date = new Date(cell.dataset.date);
  const weekday = date.getDay();
  const person = people.find(p => p.name === cell.dataset.person);

  // Toggle visual state
  if (cellColors[key] === 'green') {
    cellColors[key] = 'franco';
    cell.style.backgroundColor = FRANCO_HEX;
    // now fully manual: do not touch weekly rules/`offDays`
  } else {
    cellColors[key] = 'green';
    cell.style.backgroundColor = GREEN_HEX;
    // now fully manual: do not touch weekly rules/`offDays`
  }

  // Actualizar clases y title según nuevo estado
  if (person) {
    const working = isWorking(person, date);
    cell.classList.remove('working','off');
    cell.classList.add(working ? 'working' : 'off');
    cell.title = `${person.name} — ${date.toLocaleDateString('es-ES')}: ${working ? 'Trabajando' : 'Franco'}`;
  }

  try { localStorage.setItem('cellColors', JSON.stringify(cellColors)); } catch(e){}
  renderTodayStatus();
}

// --- Gestión de personas: agregar, renombrar y borrar ---
function addPerson(){
  const name = prompt('Nombre de la nueva persona:');
  if (!name) return;
  const trimmed = name.trim();
  if (!trimmed) return;
  // Evitar duplicados simples
  if (people.some(p=>p.name === trimmed)) { alert('Ya existe una persona con ese nombre.'); return; }
  people.push({name: trimmed, offDays: []});
  savePeople();
  buildHeatmap();
  renderTodayStatus();
}

function renamePerson(oldName){
  const person = people.find(p=>p.name === oldName);
  if (!person) return;
  const newName = prompt('Nuevo nombre:', person.name);
  if (!newName) return;
  const trimmed = newName.trim();
  if (!trimmed) return;
  if (trimmed === oldName) return;
  if (people.some(p=>p.name === trimmed)) { alert('Ya existe una persona con ese nombre.'); return; }
  // Remap cellColors keys
  const newCellColors = {};
  Object.keys(cellColors).forEach(k=>{
    if (k.startsWith(oldName + '|')){
      const rest = k.slice(oldName.length);
      newCellColors[trimmed + rest] = cellColors[k];
    } else {
      newCellColors[k] = cellColors[k];
    }
  });
  cellColors = newCellColors;
  // Cambiar el nombre en el objeto person
  person.name = trimmed;
  try { localStorage.setItem('cellColors', JSON.stringify(cellColors)); } catch(e){}
  savePeople();
  buildHeatmap();
  renderTodayStatus();
}

function deletePerson(name){
  if (!confirm(`¿Borrar a ${name}? Esta acción quitará también sus celdas personalizadas.`)) return;
  const idx = people.findIndex(p=>p.name === name);
  if (idx === -1) return;
  // Eliminar claves de cellColors que pertenezcan a esa persona
  Object.keys(cellColors).forEach(k=>{ if (k.startsWith(name + '|')) delete cellColors[k]; });
  people.splice(idx,1);
  try { localStorage.setItem('cellColors', JSON.stringify(cellColors)); } catch(e){}
  savePeople();
  buildHeatmap();
  renderTodayStatus();
}

function renderTodayStatus() {
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const workingToday = people.filter(p => isWorking(p,today)).map(p=>p.name);
  const offToday = people.filter(p => !isWorking(p,today)).map(p=>p.name);
  const workingTomorrow = people.filter(p => isWorking(p,tomorrow)).map(p=>p.name);
  const offTomorrow = people.filter(p => !isWorking(p,tomorrow)).map(p=>p.name);

  function buildPanelHtml(title, workingArr, offArr){
    const itemsWorking = workingArr.map(n => `<div class="tm-item">&gt; ${n}</div>`).join('') || '<div class="tm-item">—</div>';
    const itemsOff = offArr.map(n => `<div class="tm-item">&gt; ${n}</div>`).join('') || '<div class="tm-item">—</div>';
    return `
      <div class="today-panel">
        <div class="tm-title">${title}</div>
        <div class="tm-group">
          <div class="tm-group-title trabajando">Trabajando (${workingArr.length})</div>
          ${itemsWorking}
        </div>
        <div class="tm-group">
          <div class="tm-group-title franco">Franco (${offArr.length})</div>
          ${itemsOff}
        </div>
      </div>
    `;
  }

  // Desktop view (side-by-side): both panels visible in .today-desktop
  const desktopHTML = `
    <div class="today-desktop">
      ${buildPanelHtml('Hoy:', workingToday, offToday)}
      ${buildPanelHtml('Mañana:', workingTomorrow, offTomorrow)}
    </div>
  `;

  // Mobile stacked view: panels shown stacked (below heatmap controls)
  const mobileHTML = `
    <div class="today-mobile">
      ${buildPanelHtml('Hoy:', workingToday, offToday)}
      ${buildPanelHtml('Mañana:', workingTomorrow, offTomorrow)}
    </div>
  `;

  todayStatus.innerHTML = desktopHTML + mobileHTML;
}

// Arrastrar para pintar: mantener click y pasar por celdas para alternar estado
let isMouseDown = false;
let lastToggledKey = null;
let skipClickKey = null;

// Reiniciar al soltar o salir del heatmap
document.addEventListener('mouseup', () => { isMouseDown = false; lastToggledKey = null; });
if (heatmap) {
  heatmap.addEventListener('mouseleave', () => { isMouseDown = false; lastToggledKey = null; });

  heatmap.addEventListener('mousedown', (e) => {
    if (!editMode) return;
    const cell = e.target.closest('.person-day');
    if (cell) {
      isMouseDown = true;
      lastToggledKey = null;
      toggleCellColor(cell);
      lastToggledKey = `${cell.dataset.person}|${cell.dataset.date}`;
      // Evitar que el evento `click` (que viene después) vuelva a alternar la misma celda
      skipClickKey = lastToggledKey;
      e.preventDefault();
    }
  });

  heatmap.addEventListener('mouseover', (e) => {
    if (!isMouseDown || !editMode) return;
    const cell = e.target.closest('.person-day');
    if (cell) {
      const key = `${cell.dataset.person}|${cell.dataset.date}`;
      if (key !== lastToggledKey) {
        toggleCellColor(cell);
        lastToggledKey = key;
      }
    }
  });
}

// Inicializar
buildHeatmap();
