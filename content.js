const FIELD_HINTS = {
  fullName: ["name", "full name", "pilgrim name", "devotee name"],
  age: ["age"],
  gender: ["gender", "sex"],
  dob: ["dob", "date of birth", "birth"],
  mobile: ["mobile", "phone", "contact", "whatsapp"],
  email: ["email", "mail"],
  idType: ["id type", "proof type", "document type"],
  idNumber: ["id number", "aadhaar", "passport", "pan", "document number"],
  address: ["address", "street", "city", "state", "pincode", "zip"]
};

function normalize(value = "") {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreField(input, hints) {
  const bag = normalize([
    input.name,
    input.id,
    input.placeholder,
    input.getAttribute("aria-label"),
    input.getAttribute("title"),
    input.labels?.[0]?.textContent
  ]
    .filter(Boolean)
    .join(" "));

  return hints.some((hint) => bag.includes(hint));
}

function setInputValue(input, value) {
  if (!input || value == null || value === "") return false;

  if (input.tagName === "SELECT") {
    const options = Array.from(input.options);
    const match = options.find((option) => normalize(option.textContent).includes(normalize(value)));
    if (match) {
      input.value = match.value;
    } else {
      input.value = value;
    }
  } else {
    input.value = value;
  }

  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function fillProfile(profile) {
  const candidates = Array.from(document.querySelectorAll("input, select, textarea"));
  let filledCount = 0;

  Object.entries(FIELD_HINTS).forEach(([key, hints]) => {
    const value = profile[key];
    if (!value) return;

    const input = candidates.find((candidate) => scoreField(candidate, hints));
    if (setInputValue(input, value)) {
      filledCount += 1;
    }
  });

  return filledCount;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.action !== "fillPilgrim") return;

  const count = fillProfile(message.profile || {});
  sendResponse({ ok: true, filled: count });
});
