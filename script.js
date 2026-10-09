
const shelves = document.getElementById("shelves");
const addButton = document.getElementById("addShelf");
const dialog = document.getElementById("shelfDialog");
const form = document.getElementById("shelfForm");

const nameInput = document.getElementById("shelfName");
const descriptionInput = document.getElementById("shelfDescription");
const iconInput = document.getElementById("shelfIcon");
const dialogTitle = document.getElementById("dialogTitle");

const STORAGE_KEY = "vivere-atque-fruit-shelves-v1";

let customShelves = [];
let editingId = null;

function saveShelves() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customShelves));
    return true;
  } catch (error) {
    alert(
      "Police se nepodařilo uložit do tohoto prohlížeče. " +
      "Zkus zkontrolovat jeho nastavení."
    );
    return false;
  }
}

function renderShelves() {
  document.querySelectorAll(".custom-shelf").forEach(card => {
    card.remove();
  });

  customShelves.forEach(item => {
    const card = document.createElement("article");
    card.className = "shelf custom-shelf";

    const icon = document.createElement("div");
    icon.className = "shelf-icon";
    icon.textContent = item.icon || "✦";

    const title = document.createElement("h2");
    title.textContent = item.name;

    const description = document.createElement("p");
    description.textContent =
      item.description || "Prostor připravený k naplnění.";

    const actions = document.createElement("div");
    actions.className = "shelf-actions";

    const edit = document.createElement("button");
    edit.className = "secondary";
    edit.type = "button";
    edit.textContent = "Upravit";
    edit.dataset.action = "edit";
    edit.dataset.id = item.id;

    const remove = document.createElement("button");
    remove.className = "secondary";
    remove.type = "button";
    remove.textContent = "Odebrat";
    remove.dataset.action = "delete";
    remove.dataset.id = item.id;

    actions.append(edit, remove);
    card.append(icon, title, description, actions);

    shelves.insertBefore(card, addButton);
  });
}

function openDialog(item = null) {
  editingId = item ? item.id : null;

  dialogTitle.textContent = item ? "Upravit polici" : "Nová police";
  nameInput.value = item ? item.name : "";
  descriptionInput.value = item ? item.description : "";
  iconInput.value = item ? item.icon : "✦";

  dialog.showModal();
  nameInput.focus();
}

addButton.addEventListener("click", () => {
  openDialog();
});

document.getElementById("cancelDialog").addEventListener("click", () => {
  dialog.close();
});

form.addEventListener("submit", event => {
  event.preventDefault();

  const name = nameInput.value.trim();

  if (!name) {
    nameInput.focus();
    return;
  }

  const item = {
    id: editingId || (
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 7)
    ),
    name,
    description: descriptionInput.value.trim(),
    icon: iconInput.value.trim() || "✦"
  };

  const previousShelves = [...customShelves];

  if (editingId) {
    customShelves = customShelves.map(old =>
      old.id === editingId ? item : old
    );
  } else {
    customShelves.push(item);
  }

  if (!saveShelves()) {
    customShelves = previousShelves;
    return;
  }

  renderShelves();
  dialog.close();
});

shelves.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;
  const item = customShelves.find(shelf => shelf.id === id);

  if (!item) return;

  if (action === "edit") {
    openDialog(item);
  }

  if (action === "delete") {
    const confirmed = confirm(`Odebrat polici „${item.name}“?`);

    if (!confirmed) return;

    const previousShelves = [...customShelves];

    customShelves = customShelves.filter(shelf => shelf.id !== id);

    if (!saveShelves()) {
      customShelves = previousShelves;
      return;
    }

    renderShelves();
  }
});

try {
  const saved = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  if (Array.isArray(saved)) {
    customShelves = saved.filter(item =>
      item &&
      typeof item.id === "string" &&
      typeof item.name === "string"
    );
  }
} catch (error) {
  customShelves = [];
}

renderShelves();
