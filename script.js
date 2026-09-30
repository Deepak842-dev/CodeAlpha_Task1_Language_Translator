// List of supported languages: [translation-API code, display name, speech-synthesis locale]
const LANGUAGES = [
  ["en", "English", "en-US"], ["es", "Spanish", "es-ES"], ["fr", "French", "fr-FR"],
  ["de", "German", "de-DE"], ["hi", "Hindi", "hi-IN"], ["it", "Italian", "it-IT"],
  ["pt", "Portuguese", "pt-PT"], ["ru", "Russian", "ru-RU"], ["ja", "Japanese", "ja-JP"],
  ["ko", "Korean", "ko-KR"], ["zh-CN", "Chinese (Simplified)", "zh-CN"], ["ar", "Arabic", "ar-SA"],
  ["bn", "Bengali", "bn-IN"], ["ta", "Tamil", "ta-IN"], ["te", "Telugu", "te-IN"],
  ["mr", "Marathi", "mr-IN"], ["gu", "Gujarati", "gu-IN"], ["ur", "Urdu", "ur-PK"],
  ["nl", "Dutch", "nl-NL"], ["tr", "Turkish", "tr-TR"], ["pl", "Polish", "pl-PL"],
  ["vi", "Vietnamese", "vi-VN"], ["th", "Thai", "th-TH"], ["id", "Indonesian", "id-ID"],
];

const srcSel = document.getElementById('srcLang');
const tgtSel = document.getElementById('tgtLang');
const sourceText = document.getElementById('sourceText');
const resultBox = document.getElementById('resultBox');
const translateBtn = document.getElementById('translateBtn');
const statusText = document.getElementById('statusText');
const copyBtn = document.getElementById('copyBtn');
const speakBtn = document.getElementById('speakBtn');
const swapBtn = document.getElementById('swapBtn');
const charCount = document.getElementById('charCount');

function fillSelect(sel) {
  LANGUAGES.forEach(([code, name]) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = name;
    sel.appendChild(opt);
  });
}
fillSelect(srcSel);
fillSelect(tgtSel);
srcSel.value = "en";
tgtSel.value = "es";

sourceText.addEventListener('input', () => {
  charCount.textContent = `${sourceText.value.length} / 500`;
});

swapBtn.addEventListener('click', () => {
  const s = srcSel.value;
  srcSel.value = tgtSel.value;
  tgtSel.value = s;
  swapBtn.classList.add('spin');
  setTimeout(() => swapBtn.classList.remove('spin'), 250);
});

function setStatus(msg, isError) {
  statusText.textContent = msg;
  statusText.classList.toggle('error', !!isError);
}

function getVoiceLang(code) {
  const entry = LANGUAGES.find(l => l[0] === code);
  return entry ? entry[2] : 'en-US';
}

// Calls the MyMemory Translation API (free, no API key required).
// To use Google Translate or Microsoft Translator instead, swap the
// fetch URL/response-parsing below — everything else stays the same.
async function translate() {
  const text = sourceText.value.trim();
  if (!text) {
    setStatus('Write something to translate first.', true);
    return;
  }
  if (srcSel.value === tgtSel.value) {
    resultBox.textContent = text;
    resultBox.classList.remove('placeholder');
    copyBtn.disabled = false;
    speakBtn.disabled = false;
    setStatus('Source and target are the same language.', false);
    return;
  }

  translateBtn.disabled = true;
  setStatus('Translating…', false);
  resultBox.classList.add('placeholder');
  resultBox.textContent = 'Working on it…';
  copyBtn.disabled = true;
  speakBtn.disabled = true;

  try {
    const langpair = `${srcSel.value}|${tgtSel.value}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();

    if (data.responseStatus && data.responseStatus !== 200) {
      throw new Error(data.responseDetails || 'Translation failed');
    }

    const translated = data.responseData && data.responseData.translatedText;
    if (!translated) throw new Error('No translation returned');

    resultBox.textContent = translated;
    resultBox.classList.remove('placeholder');
    copyBtn.disabled = false;
    speakBtn.disabled = false;
    setStatus('Done.', false);
  } catch (err) {
    resultBox.textContent = 'Could not translate that just now.';
    resultBox.classList.add('placeholder');
    setStatus('Something went wrong — try again in a moment.', true);
  } finally {
    translateBtn.disabled = false;
  }
}

translateBtn.addEventListener('click', translate);
sourceText.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') translate();
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(resultBox.textContent);
    const original = copyBtn.innerHTML;
    copyBtn.innerHTML = 'Copied';
    setTimeout(() => { copyBtn.innerHTML = original; }, 1400);
  } catch (e) {
    setStatus('Could not copy — select the text manually.', true);
  }
});

speakBtn.addEventListener('click', () => {
  if (!('speechSynthesis' in window)) {
    setStatus('Text-to-speech is not supported in this browser.', true);
    return;
  }
  const utter = new SpeechSynthesisUtterance(resultBox.textContent);
  utter.lang = getVoiceLang(tgtSel.value);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
});
