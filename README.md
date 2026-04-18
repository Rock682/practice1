# TTB Pilgrim Auto Fill (Chrome Extension)

This Chrome extension helps you save pilgrim details and auto-fill booking forms (similar to TTD auto-fill style workflows).

## Features

- Save multiple pilgrim profiles in Chrome storage.
- Load and edit saved profiles from the popup.
- One-click auto-fill for the currently open page.
- Human-like typing mode (fast/normal/slow) for more natural fill behavior.
- Smart matching by common field names/labels:
  - Name, age, gender, DOB
  - Mobile, email
  - ID type and ID number
  - Address

---

## Run it live on your Chrome (5 minutes)

### 1) Download code to your laptop
If this project is in git, clone it:

```bash
git clone <your-repo-url>
cd practice1
```

If you already have the folder, just open it locally.

### 2) Open Extensions page
In Google Chrome, open:

```text
chrome://extensions/
```

### 3) Enable Developer Mode
Turn on **Developer mode** (top-right corner).

### 4) Load extension
Click **Load unpacked** and select this folder (`practice1`).

After loading, you should see **TTB Pilgrim Auto Fill** in the extension list.

### 5) Pin extension (recommended)
- Click puzzle icon (Extensions)
- Pin **TTB Pilgrim Auto Fill**

### 6) Test on a booking form page
1. Open your target TTB/TTD booking page.
2. Click the extension icon.
3. Fill pilgrim data and click **Save Profile**.
4. Keep **Human-like fill** enabled and click **Autofill This Page**.

---

## Update after making changes
Whenever you edit files (like `content.js` or `popup.js`):

1. Go to `chrome://extensions/`
2. Click **Reload** on this extension card
3. Refresh the target booking webpage and test again

---

## Optional: create ZIP to share with others
From the project folder:

```bash
zip -r ttb-pilgrim-autofill.zip manifest.json background.js content.js popup.html popup.css popup.js README.md
```

Then others can unzip and use **Load unpacked** the same way.

---

## Troubleshooting

### Extension icon shows but nothing fills
- Some pages load fields late; wait 2–3 seconds then click autofill again.
- Some sites use unusual field names; those may need a manual tweak in `content.js` `FIELD_HINTS`.

### Profiles not saving
- Check Chrome sync/storage permissions are not blocked.
- Try removing and re-adding the extension.

### Autofill works on one site but not another
- Each site has different form labels/IDs.
- Add that site’s label keywords in `content.js` and reload the extension.

---

## Dev checks

```bash
python -m json.tool manifest.json >/dev/null
node --check popup.js
node --check content.js
node --check background.js
```

---

> Note: Form structures vary across websites. The extension fills fields based on label/name/placeholder hints, so some sites may still require minor manual corrections.


## Fields tuned for your screenshot

The autofill now prioritizes these pilgrim fields used in your reference form:
- Name
- Age
- Gender
- Photo ID Proof
- Photo ID Number

If a site uses custom dropdowns, the extension now also tries combobox-style selectors.
