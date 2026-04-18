const FIELD_HINTS = {
  fullName: ["name", "full name", "pilgrim name", "devotee name"],
  age: ["age"],
  gender: ["gender", "sex"],
  dob: ["dob", "date of birth", "birth"],
  mobile: ["mobile", "phone", "contact", "whatsapp"],
  email: ["email", "mail"],
  idType: ["photo id proof", "id type", "proof type", "document type", "photo id"],
  idNumber: ["photo id number", "id number", "aadhaar", "passport", "pan", "document number"],
  address: ["address", "street", "city", "state", "pincode", "zip"]
};

function normalize(value = "") {
  return String(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(baseMs) {
  const jitter = Math.floor(Math.random() * Math.max(20, baseMs * 0.7));
  return baseMs + jitter;
}

function fieldBag(input) {
  const labelledById = input.getAttribute("aria-labelledby");
  let labelledText = "";

  if (labelledById) {
    labelledText = labelledById
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent || "")
      .join(" ");
  }

  return normalize(
    [
      input.name,
      input.id,
      input.placeholder,
      input.getAttribute("aria-label"),
      input.getAttribute("title"),
      input.labels?.[0]?.textContent,
      input.closest("label")?.textContent,
      input.parentElement?.textContent,
      labelledText
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function scoreField(input, hints) {
  const bag = fieldBag(input);
  return hints.some((hint) => bag.includes(normalize(hint)));
}

function findBestCandidate(hints) {
  const inputs = Array.from(document.querySelectorAll("input, select, textarea, [role='combobox']"));

  const visibleCandidates = inputs.filter((el) => {
    if (!(el instanceof HTMLElement)) return false;
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  });

  return visibleCandidates.find((candidate) => scoreField(candidate, hints));
}

async function humanType(input, value, baseDelay) {
  input.focus();
  input.click();

  if ("value" in input) {
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  for (const ch of String(value)) {
    const key = ch.length ? ch : " ";
    input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));

    if ("value" in input) {
      input.value = `${input.value}${ch}`;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    input.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true }));
    await sleep(randomDelay(baseDelay));
  }

  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.blur();
}

async function selectNative(selectEl, value, baseDelay) {
  const options = Array.from(selectEl.options);
  const target = options.find((opt) => normalize(opt.textContent).includes(normalize(value)));

  selectEl.focus();
  await sleep(randomDelay(baseDelay));

  if (target) {
    selectEl.value = target.value;
  } else {
    selectEl.value = value;
  }

  selectEl.dispatchEvent(new Event("input", { bubbles: true }));
  selectEl.dispatchEvent(new Event("change", { bubbles: true }));
  selectEl.blur();
}

async function selectCustomCombobox(combo, value, baseDelay) {
  combo.focus();
  combo.click();
  await sleep(randomDelay(baseDelay + 120));

  const options = Array.from(document.querySelectorAll("[role='option'], li, mat-option, .MuiMenuItem-root"));
  const target = options.find((opt) => normalize(opt.textContent).includes(normalize(value)));

  if (target instanceof HTMLElement) {
    target.click();
    await sleep(randomDelay(baseDelay));
    return true;
  }

  combo.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  return false;
}

async function fillField(element, value, baseDelay, humanMode) {
  if (!element || value == null || value === "") return false;

  if (element.tagName === "SELECT") {
    await selectNative(element, value, baseDelay);
    return true;
  }

  if (element.getAttribute("role") === "combobox") {
    return selectCustomCombobox(element, value, baseDelay);
  }

  if (humanMode) {
    await humanType(element, value, baseDelay);
  } else {
    element.focus();
    element.value = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.blur();
  }

  return true;
}

async function fillProfile(profile, settings = {}) {
  const humanMode = settings.humanMode !== false;
  const typingDelay = Number(settings.typingDelay) || 70;

  let filledCount = 0;

  for (const [key, hints] of Object.entries(FIELD_HINTS)) {
    const value = profile[key];
    if (!value) continue;

    const element = findBestCandidate(hints);
    const filled = await fillField(element, value, typingDelay, humanMode);

    if (filled) {
      filledCount += 1;
      await sleep(randomDelay(typingDelay));
    }
  }

  return filledCount;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.action !== "fillPilgrim") return;

  fillProfile(message.profile || {}, message.settings || {})
    .then((count) => sendResponse({ ok: true, filled: count }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});
