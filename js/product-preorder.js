let currentPreorder = [];

document.addEventListener("DOMContentLoaded", initProductsPage);

const initProductsPage = () => {
  const picker = document.getElementById("preorder-picker");
  const productSelect = document.getElementById("product-select");
  const listEl = document.getElementById("preorder-list");
  const clearButton = document.getElementById("clear-preorder");

  currentPreorder = loadPreorder();
  populateProductSelect(productSelect);
  renderPreorder();

  picker.addEventListener("submit", handleAdd);
  listEl.addEventListener("click", handleRemoveClick);
  clearButton.addEventListener("click", handleClear);
};

const populateProductSelect = (selectEl) => {
  PRODUCTS.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    const low = formatMoney(product.priceLow);
    const high = formatMoney(product.priceHigh);
    option.textContent = `${product.name} (${low} to ${high} per ${product.unit})`;
    selectEl.appendChild(option);
  });
};

const validateQuantity = (rawValue) => {
  if (rawValue.trim() === "") {
    return "Enter a quantity.";
  }
  const qty = Number(rawValue);
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
    return `Quantity must be a whole number from 1 to ${MAX_QTY}.`;
  }
  return "";
};

const showQtyError = (message) => {
  const qtyInput = document.getElementById("product-qty");
  const errorEl = document.getElementById("qty-error");
  errorEl.textContent = message;
  errorEl.hidden = message === "";
  if (message) {
    qtyInput.setAttribute("aria-invalid", "true");
    qtyInput.focus();
  } else {
    qtyInput.removeAttribute("aria-invalid");
  }
};

const handleAdd = (event) => {
  event.preventDefault();
  const productSelect = document.getElementById("product-select");
  const qtyInput = document.getElementById("product-qty");

  const error = validateQuantity(qtyInput.value);
  if (error) {
    showQtyError(error);
    return;
  }

  const qty = Number(qtyInput.value);
  const product = findProduct(productSelect.value);
  const existing = currentPreorder.find((item) => item.id === product.id);
  const newTotal = (existing ? existing.qty : 0) + qty;

  if (newTotal > MAX_QTY) {
    showQtyError(
      `You already have ${existing.qty} of this item. The maximum is ${MAX_QTY}.`
    );
    return;
  }

  showQtyError("");
  if (existing) {
    existing.qty = newTotal;
  } else {
    currentPreorder.push({ id: product.id, qty });
  }

  saveAndRender(
    `Added ${qty} ${product.unit === "dozen" ? "dozen" : "x"} ${product.name}.`
  );
};

const removeItem = (id) => {
  const index = currentPreorder.findIndex((item) => item.id === id);
  if (index !== -1) {
    currentPreorder.splice(index, 1);
  }
};

const handleRemoveClick = (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) {
    return;
  }
  const product = findProduct(button.dataset.id);
  removeItem(button.dataset.id);
  saveAndRender(`Removed ${product.name}.`);
};

const handleClear = () => {
  currentPreorder = [];
  saveAndRender("Cleared your pre-order list.");
};

const renderPreorder = () => {
  const listEl = document.getElementById("preorder-list");
  const emptyEl = document.getElementById("preorder-empty");
  const totalEl = document.getElementById("preorder-total");

  listEl.innerHTML = "";
  currentPreorder.forEach((item) => {
    const product = findProduct(item.id);
    const li = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = formatItemLabel(item);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-button";
    removeButton.dataset.id = item.id;
    removeButton.textContent = "Remove";
    removeButton.setAttribute(
      "aria-label",
      `Remove ${product.name} from your list`
    );

    li.append(label, removeButton);
    listEl.appendChild(li);
  });

  emptyEl.hidden = currentPreorder.length > 0;
  if (currentPreorder.length === 0) {
    totalEl.textContent = "";
  } else {
    const totals = estimateTotal(currentPreorder);
    totalEl.textContent =
      `Estimated total: ${formatMoney(totals.low)} to ${formatMoney(
        totals.high
      )}. ` + "You pay when you pick up.";
  }
};
