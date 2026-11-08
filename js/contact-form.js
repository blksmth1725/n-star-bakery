const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CLOSED_DAY = 1;

const initContactPage = () => {
  const form = document.getElementById("pre-order-form");
  const statusEl = document.getElementById("form-status");
  let submitAttempted = false;

  setPickupMinimumDate();
  prefillItemDetails();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitAttempted = true;

    const results = VALIDATION_RULES.map(validateField);
    const invalidCount = results.filter((isValid) => !isValid).length;

    if (invalidCount > 0) {
      statusEl.textContent =
        invalidCount === 1
          ? "Please fix the highlighted field. Your other entries are kept."
          : `Please fix the ${invalidCount} highlighted fields. Your other entries are kept.`;
      focusFirstInvalidField();
      return;
    }

    statusEl.textContent =
      "Thanks, your request passed every check. This page does not send requests yet, so nothing was submitted.";
  });
};

const validateName = () => {
  const value = document.getElementById("name").value.trim();
  if (value === "") {
    return "Enter your full name.";
  }
  if (value.length < 2) {
    return "Full name must be at least 2 characters.";
  }
  return "";
};

const validateEmail = () => {
  const value = document.getElementById("email").value.trim();
  if (value === "") {
    return "Enter your email address.";
  }
  if (!EMAIL_PATTERN.test(value)) {
    return "Enter an email in the form name@example.com.";
  }
  return "";
};

const validateRequestType = () => {
  const checked = document.querySelector('input[name="request-type"]:checked');
  return checked ? "" : "Choose a request type: pre-order or general question.";
};

const parseLocalDate = (isoValue) => {
  const [year, month, day] = isoValue.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const validatePickupDate = () => {
  const value = document.getElementById("pickup-date").value;
  if (value === "") {
    return "Choose a pickup date.";
  }
  const picked = parseLocalDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (picked < today) {
    return "Pickup date cannot be in the past. Choose today or a later date.";
  }
  if (picked.getDay() === CLOSED_DAY) {
    return "We are closed on Mondays. Choose a Tuesday through Sunday pickup date.";
  }
  return "";
};

const validateItemDetails = () => {
  const value = document.getElementById("item-details").value.trim();
  if (value === "") {
    return "Describe the items you want, with quantities.";
  }
  if (value.length < 5) {
    return 'Item details need at least 5 characters, for example "2 x Country Sourdough".';
  }
  if (value.length > 1000) {
    return "Item details can be at most 1000 characters. Shorten the list.";
  }
  return "";
};

const validateAllergyNotes = () => {
  const value = document.getElementById("allergy-notes").value;
  if (value.length > 500) {
    return "Allergy notes can be at most 500 characters. Shorten the note.";
  }
  return "";
};

const VALIDATION_RULES = [
  { fieldIds: ["name"], errorId: "name-error", validate: validateName },
  { fieldIds: ["email"], errorId: "email-error", validate: validateEmail },
  {
    fieldIds: ["request-pre-order", "request-question"],
    errorId: "request-type-error",
    validate: validateRequestType,
  },
  {
    fieldIds: ["pickup-date"],
    errorId: "pickup-date-error",
    validate: validatePickupDate,
  },
  {
    fieldIds: ["item-details"],
    errorId: "item-details-error",
    validate: validateItemDetails,
  },
  {
    fieldIds: ["allergy-notes"],
    errorId: "allergy-notes-error",
    validate: validateAllergyNotes,
  },
];

const validateField = (rule) => {
  const message = rule.validate();
  const errorEl = document.getElementById(rule.errorId);
  const inputs = rule.fieldIds.map((id) => document.getElementById(id));

  errorEl.textContent = message;
  errorEl.hidden = message === "";

  inputs.forEach((input) => {
    if (message) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", errorEl.id);
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
  });

  return message === "";
};

const revalidateFieldFor = (target) => {
  const rule = VALIDATION_RULES.find((candidate) =>
    candidate.fieldIds.includes(target.id)
  );
  if (rule) {
    validateField(rule);
  }
};

const focusFirstInvalidField = () => {
  for (const rule of VALIDATION_RULES) {
    const errorEl = document.getElementById(rule.errorId);
    if (!errorEl.hidden) {
      document.getElementById(rule.fieldIds[0]).focus();
      return;
    }
  }
};

const setPickupMinimumDate = () => {
  const input = document.getElementById("pickup-date");
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  input.min = `${year}-${month}-${day}`;
};

const prefillItemDetails = () => {
  const textarea = document.getElementById("item-details");
  const noteEl = document.getElementById("item-details-note");
  const savedItems = loadPreorder();

  if (savedItems.length === 0 || textarea.value.trim() !== "") {
    return;
  }

  textarea.value = savedItems.map(formatItemLabel).join("\n");
  noteEl.hidden = false;
};

document.addEventListener("DOMContentLoaded", initContactPage);
