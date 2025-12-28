// App State
const state = {
    apiKey: '',
    useBackend: false,
    settings: {
        languageCode: 'en-US',
        voiceName: '',
        ssmlGender: 'NEUTRAL',
        speed: 1.0,
        pitch: 0.0
    },
    text: '',
    isLoading: false,
    voices: [] 
};

// DOM Elements
const els = {
    themeToggle: document.getElementById('themeToggle'),
    html: document.documentElement,
    apiKeyInput: document.getElementById('apiKeyInput'),
    saveKeyBtn: document.getElementById('saveKeyBtn'),
    useBackendProxy: document.getElementById('useBackendProxy'),
    apiKeySection: document.getElementById('apiKeySection'),
    toggleSettingsBtn: document.getElementById('toggleSettingsBtn'),
    
    languageSelect: document.getElementById('languageSelect'),
    voiceSelect: document.getElementById('voiceSelect'),
    speedRange: document.getElementById('speedRange'),
    speedValue: document.getElementById('speedValue'),
    pitchRange: document.getElementById('pitchRange'),
    pitchValue: document.getElementById('pitchValue'),
    
    textInput: document.getElementById('textInput'),
    charCount: document.getElementById('charCount'),
    charWarning: document.getElementById('charWarning'),
    clearBtn: document.getElementById('clearBtn'),
    pasteSampleBtn: document.getElementById('pasteSampleBtn'),
    
    generateBtn: document.getElementById('generateBtn'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    btnText: document.querySelector('.btn-text'),
    
    outputCard: document.getElementById('outputCard'),
    audioPlayer: document.getElementById('audioPlayer'),
    downloadLink: document.getElementById('downloadLink'),
    regenerateBtn: document.getElementById('regenerateBtn'),
    metaVoice: document.getElementById('metaVoice'),
    metaTime: document.getElementById('metaTime'),
    
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// Initialize
function init() {
    // Load persisted settings
    const savedKey = localStorage.getItem('google_api_key');
    if (savedKey) {
        state.apiKey = savedKey;
        els.apiKeyInput.value = savedKey;
    }

    const savedUseBackend = localStorage.getItem('use_backend') === 'true';
    state.useBackend = savedUseBackend;
    els.useBackendProxy.checked = savedUseBackend;
    toggleApiKeyInput(!state.useBackend);

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        els.html.classList.add('dark');
    }

    setupEventListeners();
    fetchVoices(); // Fetch voices on load
}

function toggleApiKeyInput(showProps) {
    if(showProps) {
        els.apiKeyInput.disabled = false;
        els.apiKeyInput.classList.remove('opacity-50');
    } else {
        els.apiKeyInput.disabled = true;
        els.apiKeyInput.classList.add('opacity-50');
        els.apiKeyInput.value = "Using Backend Proxy";
    }
}

async function fetchVoices() {
    // Show loading state in dropdowns
    els.voiceSelect.innerHTML = '<option>Loading voices...</option>';
    els.languageSelect.innerHTML = '<option>Loading...</option>';

    try {
        let voices = [];
        if (state.useBackend) {
            // Fetch from backend proxy
            const response = await fetch('http://localhost:3000/api/voices');
            if (!response.ok) throw new Error("Failed to fetch voices from server");
            const data = await response.json();
            voices = data.voices;
        } else {
            if (!state.apiKey) {
                els.voiceSelect.innerHTML = '<option>Enter API Key</option>';
                return;
            }
            const response = await fetch(`https://texttospeech.googleapis.com/v1/voices?key=${state.apiKey}`);
            if (!response.ok) throw new Error("Failed to fetch voices");
            const data = await response.json();
            voices = data.voices;
        }

        state.voices = voices;
        populateLanguageDropdown(voices);
        populateVoiceDropdown(); 

    } catch (e) {
        console.error(e);
        els.voiceSelect.innerHTML = '<option>Error loading voices</option>';
        showToast("Could not load voice list. Check API Key.", "error");
    }
}

function populateLanguageDropdown(voices) {
    const languages = new Set();
    voices.forEach(v => {
        v.languageCodes.forEach(code => languages.add(code));
    });
    
    const sortedLangs = Array.from(languages).sort();
    
    // Maintain selection if possible
    const currentLang = state.settings.languageCode;
    
    els.languageSelect.innerHTML = '';
    sortedLangs.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang; // Could map to names like "English (US)" with Intl.DisplayNames if needed
        if (lang === currentLang) option.selected = true;
        els.languageSelect.appendChild(option);
    });
}

function populateVoiceDropdown() {
    const selectedLang = els.languageSelect.value;
    // Filter voices that support this language
    const availableVoices = state.voices.filter(v => v.languageCodes.includes(selectedLang));
    
    // Sort: Journey/GenAI first, then others
    // 'Journey' voices usually have 'Journey' in name.
    availableVoices.sort((a, b) => {
        if (a.name.includes('Journey') && !b.name.includes('Journey')) return -1;
        if (!a.name.includes('Journey') && b.name.includes('Journey')) return 1;
        return a.name.localeCompare(b.name);
    });

    els.voiceSelect.innerHTML = '';
    availableVoices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        // Clean up label
        const type = voice.name.includes('Journey') ? 'High-Res (GenAI)' : (voice.name.includes('Neural2') ? 'Neural2' : 'Standard');
        option.textContent = `${voice.name} (${type}, ${voice.ssmlGender})`;
        option.dataset.gender = voice.ssmlGender;
        els.voiceSelect.appendChild(option);
    });

    if (availableVoices.length > 0) {
        state.settings.voiceName = els.voiceSelect.value;
        state.settings.ssmlGender = els.voiceSelect.options[els.voiceSelect.selectedIndex].dataset.gender;
    }
}

function setupEventListeners() {
    // Theme
    els.themeToggle.addEventListener('click', () => {
        els.html.classList.toggle('dark');
        localStorage.setItem('theme', els.html.classList.contains('dark') ? 'dark' : 'light');
    });

    // Settings Toggle
    els.toggleSettingsBtn.addEventListener('click', () => {
        els.apiKeySection.classList.toggle('hidden');
    });

    // API Key & Backend Toggle
    els.saveKeyBtn.addEventListener('click', () => {
        if (!state.useBackend) {
            const key = els.apiKeyInput.value.trim();
            if (key) {
                state.apiKey = key;
                localStorage.setItem('google_api_key', key);
                showToast('API Key saved!', 'success');
            }
        }
    });

    els.useBackendProxy.addEventListener('change', (e) => {
        state.useBackend = e.target.checked;
        localStorage.setItem('use_backend', state.useBackend);
        toggleApiKeyInput(!state.useBackend);
        if(state.useBackend) showToast('Switched to Backend Proxy mode', 'info');
        else showToast('Switched to Demo Mode (Client Key)', 'info');
    });

    // Inputs
    els.languageSelect.addEventListener('change', (e) => {
        state.settings.languageCode = e.target.value;
        populateVoiceDropdown(); 
    });

    els.voiceSelect.addEventListener('change', (e) => {
        state.settings.voiceName = e.target.value;
        state.settings.ssmlGender = e.target.options[e.target.selectedIndex].dataset.gender;
    });

    els.speedRange.addEventListener('input', (e) => {
        state.settings.speed = parseFloat(e.target.value);
        els.speedValue.textContent = state.settings.speed + 'x';
    });

    els.pitchRange.addEventListener('input', (e) => {
        state.settings.pitch = parseFloat(e.target.value);
        els.pitchValue.textContent = state.settings.pitch;
    });

    // Text Area
    els.textInput.addEventListener('input', (e) => {
        state.text = e.target.value;
        const count = state.text.length;
        els.charCount.textContent = `${count} / 5000`;
        
        if (count > 4500) els.charWarning.classList.remove('hidden');
        else els.charWarning.classList.add('hidden');

        els.generateBtn.disabled = count === 0;
    });

    els.clearBtn.addEventListener('click', () => {
        els.textInput.value = '';
        els.textInput.dispatchEvent(new Event('input'));
    });

    els.pasteSampleBtn.addEventListener('click', () => {
        els.textInput.value = "Artificial intelligence (AI) is intelligence associated with computational devices. It stands in contrast to natural intelligence, which is the province of humans and animals.";
        els.textInput.dispatchEvent(new Event('input'));
    });

    // Generation
    els.generateBtn.addEventListener('click', generateSpeech);
    els.regenerateBtn.addEventListener('click', () => els.audioPlayer.play());
}

async function generateSpeech() {
    if (!state.text) return;
    
    setLoading(true);

    try {
        let audioContentInfo = null;

        if (state.useBackend) {
            // BACKEND MODE
            const response = await fetch('http://localhost:3000/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: state.text,
                    voiceSettings: state.settings
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Server Error');
            }

            const data = await response.json();
            audioContentInfo = data.audioContent;
        } else {
            // DEMO MODE (Client Side Direct)
            if (!state.apiKey) throw new Error("API Key required in Demo Mode");

            // Google Cloud TTS REST API URL
            const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${state.apiKey}`;
            
            const requestBody = {
                input: { text: state.text },
                voice: { 
                    languageCode: state.settings.languageCode, 
                    name: state.settings.voiceName,
                    ssmlGender: state.settings.ssmlGender
                },
                audioConfig: { 
                    audioEncoding: 'MP3',
                    speakingRate: state.settings.speed,
                    pitch: state.settings.pitch
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'API Error');
            }

            const data = await response.json();
            audioContentInfo = data.audioContent;
        }

        if (audioContentInfo) {
            handleAudioSuccess(audioContentInfo);
        }

    } catch (error) {
        showToast(error.message, 'error');
        console.error(error);
    } finally {
        setLoading(false);
    }
}

function handleAudioSuccess(base64Audio) {
    // Decode base64 to Blob
    const binaryString = window.atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes.buffer], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);

    // Update Player
    els.audioPlayer.src = url;
    els.audioPlayer.play();

    // Update Download Link
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15);
    const filename = `tts_${timestamp}_${state.settings.voiceName}.mp3`;
    els.downloadLink.href = url;
    els.downloadLink.download = filename;

    // Update UI
    els.outputCard.classList.remove('hidden');
    els.outputCard.scrollIntoView({ behavior: 'smooth' });
    
    // Metadata
    els.metaVoice.textContent = state.settings.voiceName;
    els.metaTime.textContent = new Date().toLocaleTimeString();

    showToast('Audio generated successfully!', 'success');
}

function setLoading(isLoading) {
    state.isLoading = isLoading;
    els.generateBtn.disabled = isLoading;
    if (isLoading) {
        els.loadingSpinner.classList.remove('hidden');
        els.btnText.textContent = 'Generating...';
    } else {
        els.loadingSpinner.classList.add('hidden');
        els.btnText.textContent = 'Generate Audio';
    }
}

function showToast(msg, type = 'info') {
    els.toastMessage.textContent = msg;
    const colors = type === 'error' ? 'bg-red-600' : (type === 'success' ? 'bg-green-600' : 'bg-gray-800');
    
    // Reset classes
    const content = document.getElementById('toastContent');
    content.className = `text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${colors}`;
    
    els.toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        els.toast.classList.add('translate-y-20', 'opacity-0');
    }, 4000);
}

// Start
init();
