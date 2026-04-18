const FIELDS = [
  "profileName",
  "fullName",
  "age",
  "gender",
  "dob",
  "mobile",
  "email",
  "idType",
  "idNumber",
  "address"
];

const profilesSelect = document.getElementById("profiles");
const statusEl = document.getElementById("status");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#9f1320" : "#0f5b24";
}

function readForm() {
  return FIELDS.reduce((acc, field) => {
    const input = document.getElementById(field);
    acc[field] = input.value.trim();
    return acc;
  }, {});
}

function writeForm(profile) {
  FIELDS.forEach((field) => {
    document.getElementById(field).value = profile[field] ?? "";
  });
}

async function getProfiles() {
  const data = await chrome.storage.sync.get({ ttbProfiles: [] });
  return data.ttbProfiles;
}

async function setProfiles(ttbProfiles) {
  await chrome.storage.sync.set({ ttbProfiles });
}

async function refreshProfiles() {
  const profiles = await getProfiles();
  profilesSelect.innerHTML = "";

  if (!profiles.length) {
    const option = document.createElement("option");
    option.textContent = "No profiles yet";
    option.disabled = true;
    option.selected = true;
    profilesSelect.appendChild(option);
    return;
  }

  profiles.forEach((profile, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = profile.profileName || `Profile ${index + 1}`;
    profilesSelect.appendChild(option);
  });
}

async function saveProfile() {
  const profile = readForm();
  if (!profile.profileName || !profile.fullName) {
    setStatus("Profile name and full name are required.", true);
    return;
  }

  const profiles = await getProfiles();
  const existingIndex = profiles.findIndex((p) => p.profileName === profile.profileName);

  if (existingIndex >= 0) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }

  await setProfiles(profiles);
  await refreshProfiles();
  setStatus("Profile saved.");
}

async function loadProfile() {
  const profiles = await getProfiles();
  const index = Number(profilesSelect.value);
  if (Number.isNaN(index) || !profiles[index]) {
    setStatus("Select a profile to load.", true);
    return;
  }

  writeForm(profiles[index]);
  setStatus("Profile loaded.");
}

async function deleteProfile() {
  const profiles = await getProfiles();
  const index = Number(profilesSelect.value);

  if (Number.isNaN(index) || !profiles[index]) {
    setStatus("Select a profile to delete.", true);
    return;
  }

  profiles.splice(index, 1);
  await setProfiles(profiles);
  await refreshProfiles();
  setStatus("Profile deleted.");
}

async function fillCurrentTab() {
  const profile = readForm();

  if (!profile.fullName) {
    setStatus("Load or enter a profile first.", true);
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    setStatus("Could not detect active tab.", true);
    return;
  }

  await chrome.tabs.sendMessage(tab.id, { action: "fillPilgrim", profile });
  setStatus("Autofill attempted on current page.");
}

document.getElementById("saveBtn").addEventListener("click", saveProfile);
document.getElementById("loadBtn").addEventListener("click", loadProfile);
document.getElementById("deleteBtn").addEventListener("click", deleteProfile);
document.getElementById("fillBtn").addEventListener("click", fillCurrentTab);

refreshProfiles();
