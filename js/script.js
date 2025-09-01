// Zichtbaar dat het script geladen is
console.log("script.js geladen");

// Jaar in de footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Simpele drag & drop + volgorde bewaren in localStorage
(function () {
  const list = document.querySelector('.list');
  if (!list) {
    console.warn("Geen .list gevonden — controleer je HTML.");
    return;
  }

  const STORAGE_KEY = 'ls-order';

  // herstelt de bewaarde volgorde (als die er is)
  function loadOrder() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const ids = JSON.parse(raw);
    const byId = {};
    [...list.children].forEach(c => (byId[c.dataset.id] = c));
    ids.forEach(id => byId[id] && list.appendChild(byId[id]));
  }

  // sla de huidige volgorde op
  function saveOrder() {
    const ids = [...list.children].map(c => c.dataset.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  // zoek de kaart die na de muispositie moet komen
  function getCardAfter(container, y) {
    const cards = [...container.querySelectorAll('.card:not(.dragging)')];
    return cards.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
  }

  function removeDropHints() {
    list.querySelectorAll('.drop-target').forEach(e => e.classList.remove('drop-target'));
  }

  function initDraggable() {
    const cards = [...list.querySelectorAll('.card')];

    cards.forEach(card => {
      card.setAttribute('draggable', 'true');

      card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', card.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        removeDropHints();
      });

      card.addEventListener('dragenter', () => card.classList.add('drop-target'));
      card.addEventListener('dragleave', () => card.classList.remove('drop-target'));
    });

    list.addEventListener('dragover', e => {
      e.preventDefault(); // nodig om te kunnen droppen
      const after = getCardAfter(list, e.clientY);
      const dragging = document.querySelector('.dragging');
      if (!dragging) return;
      if (after == null) list.appendChild(dragging);
      else list.insertBefore(dragging, after);
    });

    list.addEventListener('drop', () => {
      removeDropHints();
      saveOrder();
    });
  }

  loadOrder();
  initDraggable();
})();
