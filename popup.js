document.addEventListener('DOMContentLoaded', async () => {
    const toggle = document.getElementById('toggle-enable');
    const domainLabel = document.getElementById('domain-name');
    const statusText = document.getElementById('status-text');
    const langRadios = document.querySelectorAll('input[name="lang"]');
    const title = document.querySelector('h2');
    const langLabel = document.querySelector('.lang-label');

    const I18N = {
        en: {
            title: "Draft Board",
            enabled: "Enabled",
            disabled: "Disabled",
            noAccess: "Cannot access page",
            language: "Language"
        },
        zh: {
            title: "草稿板",
            enabled: "已启用",
            disabled: "已禁用",
            noAccess: "无法访问页面",
            language: "语言"
        }
    };

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url) {
        // Default to English for initial error message if language not loaded yet
        domainLabel.textContent = I18N.en.noAccess;
        toggle.disabled = true;
        return;
    }

    // Extract Hostname
    let hostname;
    try {
        const url = new URL(tab.url);
        hostname = url.hostname;
    } catch (e) {
        hostname = tab.url; // Fallback
    }

    domainLabel.textContent = hostname;

    // Check Storage
    const storageKey = `site:${hostname}`;

    // Load Settings
    chrome.storage.local.get([storageKey, 'appLanguage'], (result) => {
        const isEnabled = result[storageKey] === true;
        const lang = result.appLanguage || 'en'; // Default en

        // Init UI
        updateLanguage(lang);
        updateStatusUI(isEnabled, lang);

        toggle.checked = isEnabled;
        // Set Radio
        document.getElementById(`lang-${lang}`).checked = true;
    });

    // Handle Toggle
    toggle.addEventListener('change', () => {
        const isEnabled = toggle.checked;
        const currentLang = document.querySelector('input[name="lang"]:checked').value;
        updateStatusUI(isEnabled, currentLang);

        // Save
        chrome.storage.local.set({ [storageKey]: isEnabled });

        // Message Content Script
        chrome.tabs.sendMessage(tab.id, {
            action: 'toggle_extension',
            enabled: isEnabled
        });
    });

    // Handle Language
    langRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const newLang = e.target.value;
            const isEnabled = toggle.checked;

            updateLanguage(newLang);
            updateStatusUI(isEnabled, newLang);

            chrome.storage.local.set({ appLanguage: newLang });
        });
    });

    function updateLanguage(lang) {
        const t = I18N[lang];
        title.textContent = t.title;
        langLabel.textContent = t.language;
    }

    function updateStatusUI(isEnabled, lang) {
        const t = I18N[lang];
        if (isEnabled) {
            statusText.textContent = t.enabled;
            statusText.className = "status-text status-on";
        } else {
            statusText.textContent = t.disabled;
            statusText.className = "status-text status-off";
        }
    }
});
