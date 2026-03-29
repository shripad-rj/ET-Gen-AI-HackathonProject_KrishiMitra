// app.js - KrishiMitra Main Logic
// KrishiMitra AI Simulation Layer

let systemMemory = JSON.parse(localStorage.getItem('krishimitra_memory')) || {
    name: '',
    language: 'hi-IN', 
    phone: '',
    region: '',
    history: [],
    hasBeenWelcomed: false, // Prevents annoying voice loops
    doctorTestCount: 0 // Alternates the "Not a Crop" logic
};

const langMap = {
    'hi': { label: 'हिंदी', code: 'hi-IN', confirm: 'आपने हिंदी चुनी है।' },
    'en': { label: 'English', code: 'en-IN', confirm: 'You have selected English.' },
    'mr': { label: 'मराठी', code: 'mr-IN', confirm: 'तुम्ही मराठी निवडली आहे.' },
    'pa': { label: 'ਪੰਜਾਬੀ', code: 'pa-IN', confirm: 'ਤੁਸੀਂ ਪੰਜਾਬੀ ਚੁਣੀ ਹੈ।' }
};

const voiceTranslations = {
    onboarding: {
        hi: "कृपया अपना नाम लिखें, या माइक दबाकर बोलें। फिर अपना मोबाइल नंबर, गाँव और लिंग चुनें।",
        en: "Please enter your name, then fill out your mobile number, village, and gender.",
        mr: "कृपया आपले नाव प्रविष्ट करा, नंतर आपला मोबाईल नंबर, गाव आणि लिंग भरा.",
        pa: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਨਾਮ ਦਰਜ ਕਰੋ, ਫਿਰ ਆਪਣਾ ਮੋਬਾਈਲ ਨੰਬਰ, ਪਿੰਡ ਅਤੇ ਲਿੰਗ ਭਰੋ।"
    },
    nameConfirm: {
        hi: (n) => `आपका नाम ${n} है।`,
        en: (n) => `Your name is ${n}.`,
        mr: (n) => `तुमचे नाव ${n} आहे.`,
        pa: (n) => `ਤੁਹਾਡਾ ਨਾਮ ${n} ਹੈ।`
    },
    villageConfirm: {
        hi: (v) => `आपका गाँव ${v} है।`,
        en: (v) => `Your village is ${v}.`,
        mr: (v) => `तुमचे गाव ${v} आहे.`,
        pa: (v) => `ਤੁਹਾਡਾ ਪਿੰਡ ${v} ਹੈ।`
    },
    accountCreated: {
        hi: "अकाउंट बन गया है। कृषिमित्र में आपका फिर से स्वागत है।",
        en: "Account created successfully. Welcome to KrishiMitra.",
        mr: "खाते तयार केले आहे. कृषि मित्र मध्ये आपले स्वागत आहे.",
        pa: "ਖਾਤਾ ਬਣ ਗਿਆ ਹੈ। ਕ੍ਰਿਸ਼ੀਮਿੱਤਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ।"
    },
    doctorScan: {
        hi: "मैं चित्र की जांच कर रहा हूँ। कृपया प्रतीक्षा करें।",
        en: "I am analyzing the image. Please wait.",
        mr: "मी चित्राचे विश्लेषण करत आहे. कृपया प्रतीक्षा करा.",
        pa: "ਮੈਂ ਚਿੱਤਰ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਉਡੀਕ ਕਰੋ।"
    },
    doctorReady: {
         hi: "क्रॉप डॉक्टर तैयार है! फोटो खींचने के लिए कैमरे वाले बटन को दबाएं।",
         en: "Crop Doctor is ready! Tap the camera button to take a photo.",
         mr: "पीक डॉक्टर तयार आहे! फोटो काढण्यासाठी कॅमेरा बटणावर टॅप करा.",
         pa: "ਕ੍ਰੌਪ ਡਾਕਟਰ ਤਿਆਰ ਹੈ! ਫੋਟੋ ਖਿੱਚਣ ਲਈ ਕੈਮਰਾ ਬਟਨ ਨੂੰ ਦਬਾਓ।"
    },
    doctorPlantOk: {
        hi: "पौधे की पुष्टि की गई है। इसमें फंगल इन्फेक्शन का खतरा है। तुरंत नीम का स्प्रे करें।",
        en: "Plant verified. Warning: High risk of fungal infection. Spray Neem Oil immediately.",
        mr: "वनस्पती सत्यापित. बुरशीजन्य संसर्गाचा जास्त धोका. कडुनिंबाची फवारणी करा.",
        pa: "ਪੌਦੇ ਦੀ ਪੁਸ਼ਟੀ ਕੀਤੀ ਗਈ। ਉੱਲੀ ਦੀ ਲਾਗ ਦਾ ਉੱਚ ਜੋਖਮ. ਨਿੰਮ ਦੇ ਤੇਲ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।"
    },
    doctorNotPlant: {
        hi: (guess) => `यह कोई पौधा नहीं लग रहा है। यह एक ${guess} है। कृपया पत्तों की एक स्पष्ट तस्वीर लें।`,
        en: (guess) => `This looks like a ${guess}, not a crop. Please take a clear picture of the leaves.`,
        mr: (guess) => `हे पीक किंवा झाड असल्याचे दिसत नाही, हा एक ${guess} आहे. कृपया पानांचा स्पष्ट फोटो घ्या.`,
        pa: (guess) => `ਇਹ ਕੋਈ ਫਸਲ ਜਾਂ ਪੌਦਾ ਨਹੀਂ ਲੱਗਦਾ, ਇਹ ਇੱਕ ${guess} ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਪੱਤਿਆਂ ਦੀ ਸਪਸ਼ਟ ਤਸਵੀਰ ਲਓ।`
    },
    tapStart: {
        hi: "कृषिमित्र में आपका स्वागत है। आगे बढ़ने के लिए कृपया स्क्रीन पर टैप करें।",
        en: "Welcome to KrishiMitra. Tap the screen to continue.",
        mr: "कृषि मित्र मध्ये आपले स्वागत आहे. पुढे जाण्यासाठी स्क्रीनवर टॅप करा.",
        pa: "ਕ੍ਰਿਸ਼ੀਮਿੱਤਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਅੱਗੇ ਵਧਣ ਲਈ ਸਕਰੀਨ 'ਤੇ ਟੈਪ ਕਰੋ।"
    },
    splashPrompt: {
        hi: "नमस्ते! मैं आपका कृषिमित्र हूँ। कृपया अपनी भाषा चुनें।",
        en: "Hello! I am your KrishiMitra. Please select your language.",
        mr: "नमस्कार! मी तुमचा कृषिमित्र आहे. कृपया तुमची भाषा निवडा.",
        pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਕ੍ਰਿਸ਼ੀਮਿੱਤਰ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ।"
    },
    mockProfit: {
        hi: "यह आपकी फसल पर मुनाफे का अनुमान है।",
        en: "Here is the estimated profit for your crop.",
        mr: "येथे आपल्या पिकावरील नफ्याचा अंदाज आहे.",
        pa: "ਇੱਥੇ ਤੁਹਾਡੀ ਫਸਲ 'ਤੇ ਮੁਨਾਫੇ ਦਾ ਅਨੁਮਾਨ ਹੈ।"
    },
    mockWeather: {
        hi: "आज बारिश होने की संभावना है। कृपया खाद न डालें।",
        en: "It is likely to rain today. Please do not apply fertilizer.",
        mr: "आज पाऊस पडण्याची शक्यता आहे. कृपया खते टाकू नका.",
        pa: "ਅੱਜ ਮੀਂਹ ਪੈਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਖਾਦ ਨਾ ਪਾਓ।"
    },
    mockSell: {
        hi: "पास की मंडी में टमाटर के दाम सबसे अच्छे हैं।",
        en: "The prices of tomatoes are best in the nearest market.",
        mr: "जवळच्या मंडईत टोमॅटोला चांगला भाव आहे.",
        pa: "ਨੇੜੇ ਦੀ ਮੰਡੀ ਵਿੱਚ ਟਮਾਟਰਾਂ ਦੀ ਕੀਮਤ ਸਭ ਤੋਂ ਵਧੀਆ ਹੈ।"
    },
    mockComm: {
        hi: "आपके क्षेत्र के किसान यहाँ चर्चा कर रहे हैं।",
        en: "Farmers in your area are discussing here.",
        mr: "तुमच्या भागातील शेतकरी येथे चर्चा करत आहेत.",
        pa: "ਤੁਹਾਡੇ ਖੇਤਰ ਦੇ ਕਿਸਾਨ ਇੱਥੇ ਚਰਚਾ ਕਰ ਰਹੇ ਹਨ।"
    },
    profileVoice: {
        hi: "यह आपकी प्रोफाइल है।",
        en: "This is your profile.",
        mr: "हे तुझे प्रोफाइल आहे.",
        pa: "ਇਹ ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਹੈ।"
    },
    micError: {
         hi: "कृपया फिर से प्रयास करें। (Could not hear you.)",
         en: "Please try again. (Could not hear you.)",
         mr: "कृपया पुन्हा प्रयत्न करा. (ऐकू आले नाही.)",
         pa: "ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ। (ਸੁਣ ਨਹੀਂ ਸਕਿਆ।)"
    }
};

function getVoiceString(key, val="") {
    let lang = 'hi';
    if(systemMemory.language.startsWith('en')) lang = 'en';
    if(systemMemory.language.startsWith('mr')) lang = 'mr';
    if(systemMemory.language.startsWith('pa')) lang = 'pa';
    let res = voiceTranslations[key][lang];
    if(typeof res === 'function') return res(val);
    return res;
}

function getWelcomeMessage(langCode) {
    const isFemale = systemMemory.gender === 'Female';
    
    if (langCode.startsWith('en')) {
        const title = isFemale ? 'sister' : 'brother';
        return `Hello ${title}! How is your farm doing today?`;
    }
    if (langCode.startsWith('mr')) {
        const title = isFemale ? 'tai' : 'bhau';
        return `Namaskar ${title}! Kay mhantay shet?`;
    }
    if (langCode.startsWith('pa')) {
        const title = isFemale ? 'bhain' : 'veer';
        return `Sat Sri Akal ${title}! Khet da ki haal aa?`;
    }
    // Default Hindi
    const title = isFemale ? 'behen' : 'bhaiya';
    return `Namaste ${title}! Khet kya keh raha hai?`; 
}
const appContainer = document.getElementById('app-container');
let currentScreen = 'boot'; // Hidden bootloader to unlock Chrome AutoPlay

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synthesis = window.speechSynthesis;
let activeUtterance = null;

// Preload voices to fix the Chrome/Edge blank voice bug
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => synthesis.getVoices();
}

async function speakText(text, langCode = systemMemory.language) {
    if (!text) return;
    if (synthesis.speaking) synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    
    // Aggressively bind the correct native voice (prevents English voice from muting native scripts)
    let voices = synthesis.getVoices();
    let prefix = langCode.split('-')[0];
    
    // Prefer higher quality Google / Microsoft Natural voices if available to improve speech clarity
    let bestVoice = voices.find(v => v.lang.startsWith(prefix) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Online')));
    if (!bestVoice) bestVoice = voices.find(v => v.lang === langCode) || voices.find(v => v.lang.startsWith(prefix));
    
    if (bestVoice) {
        utterance.voice = bestVoice;
    }

    utterance.volume = 1;
    utterance.rate = 0.85; // Lowered rate significantly to improve clarity on heavy Indian accents 
    utterance.pitch = 1.0; 
    
    activeUtterance = utterance; // GC fix
    synthesis.speak(utterance);
    
    return new Promise(resolve => {
        let isDone = false;
        const complete = () => { if(isDone) return; isDone = true; activeUtterance = null; resolve(); };
        
        utterance.onend = complete;
        utterance.onerror = complete;
        
        // Failsafe: Chrome TTS bug can freeze if OS voice is missing
        const maxDuration = Math.max(3000, text.length * 150);
        setTimeout(complete, maxDuration);
    });
}

function listenVoiceContinuous(langCode = systemMemory.language, maxMs = 5500) {
    return new Promise((resolve, reject) => {
        if (!SpeechRecognition) {
            alert('Voice recognition not supported. Use Chrome/Edge.');
            return reject('Not supported');
        }
        if (window.location.protocol === 'file:') {
            alert('CRITICAL: Chrome blocks the microphone on local file:// links. Please use "Live Server" for Voice STT to work!');
            console.error("STT Error: Protocol is file://. Voice blocked.");
        }

        const recognition = new SpeechRecognition();
        recognition.lang = langCode;
        recognition.interimResults = true; 
        recognition.continuous = true; 
        
        console.log("Recording started?"); // Debug requested by user
        let finalTrans = '';
        recognition.onresult = (event) => {
            let temp = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) finalTrans += event.results[i][0].transcript;
                else temp += event.results[i][0].transcript;
            }
            const txtEl = document.getElementById('ai-response-text');
            if (txtEl) txtEl.innerText = (finalTrans + temp) || "Listening...";
        };
        recognition.onerror = (e) => {
            console.error("API response? Error:", e.error);
            let errMsg = e.error;
            if(e.error === 'not-allowed') errMsg = "Microphone Permission Denied! Please allow microphone access.";
            if(e.error === 'network') errMsg = "Network Error! Google STT requires internet or your firewall is blocking it.";
            if(e.error === 'no-speech') errMsg = "No speech detected.";
            
            alert("STT Failed: " + errMsg);
            reject(errMsg);
        };
        
        setTimeout(() => {
            recognition.stop();
            console.log("Audio file created? (Web Speech API Blob processing...)");
            setTimeout(() => { 
                const text = finalTrans.trim() || document.getElementById('ai-response-text')?.innerText.replace('Listening...', '').trim();
                console.log("API response?", text);
                resolve(text);
            }, 300);
        }, maxMs);
        recognition.start();
    });
}

function listenVoice(langCode = systemMemory.language) {
    return new Promise((resolve, reject) => {
        if (!SpeechRecognition) {
            alert('Voice recognition not supported. Use Chrome or Edge.');
            return reject('Not supported');
        }
        if (window.location.protocol === 'file:') {
            alert('CRITICAL: Chrome physically disables the microphone on local file:// files. You must use the http://localhost:8000 server I launched for you!');
            return reject('File protocol blocked.');
        }

        console.log("Recording started?");
        const recognition = new SpeechRecognition();
        recognition.lang = langCode;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            console.log("Mic activated successfully by browser.");
        };

        recognition.onresult = (e) => {
            console.log("Audio file created?");
            console.log("API response?", e.results[0][0].transcript);
            resolve(e.results[0][0].transcript);
        };
        
        recognition.onerror = (e) => {
            console.error("API response? Error:", e.error);
            let errMsg = e.error;
            if(e.error === 'not-allowed') errMsg = "Microphone Permission Denied! Please click the lock icon in the URL bar and allow microphone access.";
            if(e.error === 'network') errMsg = "Network Error! Google Speech-to-Text requires an active internet connection, or your proxy/firewall is blocking it.";
            if(e.error === 'no-speech') errMsg = "No speech detected. Please speak louder.";
            
            alert("STT Failed: " + errMsg);
            reject(errMsg);
        };
        recognition.start();
    });
}

// --- NLP Core Intent Engine ---
const CORE_DICT = {
  sell_smart: {
    keywords: ["mandi", "bhav", "price", "rate", "bazaar", "vikri", "market", "मंडी", "भाव", "बाजार", "बाज़ार", "विक्री", "मं‍डी", "दर", "ਮੰਡੀ", "ਕੀਮਤ", "ਭਾਅ"],
    phrases: ["mandi bhav", "market rate", "bazaar bhav", "kiti bhav aahe", "price kya hai", "मंडी भाव", "बाजार भाव", "मंडी दर", "बाजार दर", "ਮੰਡੀ ਭਾਅ"]
  },
  weather: {
    keywords: ["weather", "rain", "paus", "mausam", "मौसम", "पाऊस", "बारिश", "हवामान", "ਮੌਸਮ", "ਮੀਂਹ"],
    phrases: ["kal paus aahe ka", "barish hogi kya", "weather update", "आज मौसम कैसा है", "बारिश होगी", "पाऊस पडणार", "ਮੀਂਹ ਪਵੇਗਾ"]
  },
  profit_checker: {
    keywords: ["profit", "loss", "fayda", "nuksaan", "फ़ायदा", "नुक़सान", "फायदा", "नुकसान", "तोटा", "किंमत", "ਨੁਕਸਾਨ", "ਮੁਨਾਫਾ", "लाभ", "मुनाफ़ा", "मुनाफा"],
    phrases: ["profit kasa baghu", "kitna fayda", "loss calculate", "कितना फायदा", "फायदा कसा बघू", "नुकसान किती", "ਕਿੰਨਾ ਮੁਨਾਫਾ"]
  },
  crop_doctor: {
    keywords: ["disease", "daag", "spot", "rog", "keede", "रोग", "कीड़े", "कीड", "किडा", "दाग", "ਰੋਗ", "ਕੀੜੇ"],
    phrases: ["plant problem", "paan var daag", "leaf disease", "पत्तों पर दाग", "पानावर डाग", "बीमारी लग गई", "پودے کی بیماری", "ਪੱਤਿਆਂ 'ਤੇ ਦਾਗ"]
  },
  schemes: {
    keywords: ["yojana", "scheme", "subsidy", "government", "योजना", "सब्सिडी", "सरकारी", "ਸਕੀਮ", "ਸਬਸਿਡੀ"],
    phrases: ["sarkari madat", "farmer scheme", "yojana sang", "सरकारी योजना", "सरकारी मदत", "ਕਿਸਾਨ ਸਕੀਮ"]
  },
  chat: {
    keywords: ["chat", "talk", "baat", "shiksha", "sahayata", "help", "मदद", "बात", "मदत", "ਮਦਦ", "ਗੱਲ"],
    phrases: ["baat karni hai", "talk to you", "help me", "मेरी मदद करो", "मला मदत करा", "ਮੇਰੀ ਮਦਦ ਕਰੋ"]
  },
  profile: {
    keywords: ["profile", "settings", "language", "bhasha", "naam", "name", "प्रोफाइल", "भाषा", "नाम", "नाव"],
    phrases: ["change language", "my profile", "update name", "भाषा बदलें", "माझी प्रोफाईल", "ਭਾਸ਼ਾ ਬਦਲੋ"]
  }
};

function matchKeywords(input, keywords) {
  let count = 0;
  keywords.forEach(word => {
    if (input.includes(word)) count++;
  });
  return count > 0 ? 1.0 : 0.0;
}

function matchPhrases(input, phrases) {
  let score = 0;
  phrases.forEach(phrase => {
    if (input.includes(phrase)) score = 1.0;
  });
  return score;
}

function fuzzyMatch(input, keywords) {
  let score = 0;
  keywords.forEach(word => {
    // Prevent aggressive short-string false positives by ensuring the input contains the exact word
    if (input.includes(word)) {
      score = 1.0;
    }
  });
  return score;
}

function getIntentScore(input, intentData) {
  const keywordScore = matchKeywords(input, intentData.keywords);
  const phraseScore = matchPhrases(input, intentData.phrases);
  const fuzzyScore = fuzzyMatch(input, intentData.keywords);

  return (
    keywordScore * 0.5 +
    phraseScore * 0.3 +
    fuzzyScore * 0.2
  );
}

function detectIntent(input) {
  input = input.toLowerCase();
  let bestIntent = null;
  let bestScore = 0;

  for (let intent in CORE_DICT) {
    const score = getIntentScore(input, CORE_DICT[intent]);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return { intent: bestIntent, score: bestScore };
}

// Global UI Navigation Helpers for Phase 2
function highlightCard(cardId) {
    const el = document.getElementById(cardId);
    if (el) {
        el.style.transition = 'all 0.4s ease';
        el.style.border = "3px solid #22c55e";
        el.style.boxShadow = "0 0 0 8px rgba(34, 197, 94, 0.3)";
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        
        setTimeout(() => {
            el.style.border = "";
            el.style.boxShadow = "";
        }, 4000); // 4 seconds highlight
    }
}

function navigateTo(cardId) {
    // Optionally trigger highlight locally first before navigating
    highlightCard(cardId);
    const el = document.getElementById(cardId);
    if (el) {
        setTimeout(() => {
            el.click(); // simulate user tap
        }, 800);
    }
}

// Ultra-Advanced Offline GPT Agent Simulation (Intent, Navigation, Action, Memory)
async function askAI(promptText, isContextual = false) {
    if(!systemMemory.crops) systemMemory.crops = []; 
    await new Promise(r => setTimeout(r, 1600)); // Simulate GPT Inference Delay
    
    // STEP 1: PREPROCESSING (Keep all native characters)
    const rawInput = promptText;
    const q = promptText.toLowerCase().trim();
    const lang = systemMemory.language.startsWith('en') ? 'en' :
                 systemMemory.language.startsWith('mr') ? 'mr' :
                 systemMemory.language.startsWith('pa') ? 'pa' : 'hi';
                 
    let intent = { type: "advice", message: "" };

    // STEP 1.5: CONTEXT-AWARE INTELLIGENCE LAYER
    // Automatically intercept generic requests based on the user's active screen
    const helpKeywords = ['help', 'madat', 'madad', 'sahayata', 'kya karu', 'guide', 'मदद', 'मदत', 'ਮਦਦ', 'what do i do', 'kaise use karu'];
    const isAskingHelp = helpKeywords.some(kw => q.includes(kw));

    if (isAskingHelp) {
        let helpMessage = "";
        if (currentScreen === 'profile') {
            helpMessage = lang === 'en' ? "You are on the Profile Page. Tap 'Edit Profile' below to update your name, language, or village details." 
                        : (lang === 'mr' ? "तुम्ही प्रोफाईल पानावर आहात. 'एडिट प्रोफाईल' टॅप करून तुम्ही माहिती बदलू शकता." 
                        : "आप प्रोफाइल पेज पर हैं। आप 'एडिट प्रोफाइल' पर टैप करके अपनी जानकारी अपडेट कर सकते हैं।");
        } else if (currentScreen === 'doctor') {
            helpMessage = lang === 'en' ? "You are in the Crop Doctor. Tap the 'Snap Photo' camera button to upload a picture of a diseased crop."
                        : (lang === 'mr' ? "तुम्ही क्रॉप डॉक्टरमध्ये आहात. वनस्पतीचा फोटो काढण्यासाठी 'स्पॅप फोटो' वर टॅप करा." 
                        : "आप क्रॉप डॉक्टर में हैं। पौधे की तस्वीर खींचने के लिए 'स्नैप फोटो' बटन दबाएं।");
        } else if (currentScreen === 'mock-sell') {
            helpMessage = lang === 'en' ? "You are in Sell Smart. Here you can see the latest Mandi rates for crops like Onion and Tomato."
                        : (lang === 'mr' ? "तुम्ही बाजारभाव विभागात आहात. इथे तुम्ही नवीनतम मंडी दर पाहू शकता." 
                        : "आप मंडी भाव में हैं। यहाँ आप अपनी फसल के नए मार्केट रेट्स देख सकते हैं।");
        } else if (currentScreen === 'mock-weather') {
            helpMessage = lang === 'en' ? "This is the Weather Alert page showing conditions for your village."
                        : "यह मौसम अलर्ट पेज है जहाँ आप मौसम की जानकारी देख सकते हैं।";
        } else if (currentScreen === 'mock-comm') {
            helpMessage = lang === 'en' ? "This is the Community forum. Tap any farmer's post to join the conversation."
                        : "यह कम्युनिटी फोरम है। आप अन्य किसानों से बात कर सकते हैं।";
        } else if (currentScreen === 'chat') {
            helpMessage = lang === 'en' ? "You are chatting with me! Type or speak your farming questions."
                        : "आप मुझसे चैट कर रहे हैं। कोई भी कृषि प्रश्न पूछें।";
        }
        
        if (helpMessage) {
            intent.type = "advice";
            intent.message = helpMessage;
            return _finalizeAI(rawInput, intent, isContextual);
        }
    }

    // STEP 2: HYBRID INTENT MAPPING WITH THRESHOLD
    const intentRes = detectIntent(q);
    let matchedTarget = null;
    let suggestionPrefix = "";
    
    if (intentRes.score >= 0.75) {
        // Direct action
        matchedTarget = intentRes.intent;
    } else if (intentRes.score >= 0.5) {
        // Suggestion
        matchedTarget = intentRes.intent;
        if(lang === 'en') suggestionPrefix = "I think you mean this. ";
        else if(lang === 'mr') suggestionPrefix = "मला वाटते तुम्हाला हे पाहिजे. ";
        else if(lang === 'pa') suggestionPrefix = "ਮੈਨੂੰ ਲੱਗਦਾ ਹੈ ਤੁਸੀਂ ਇਹ ਚਾਹੁੰਦੇ ਹੋ। ";
        else suggestionPrefix = "मुझे लगता है आप यह चाहते हैं। ";
    }

    const knownCrops = {
        'tomato': 'tomato', 'टमाटर': 'tomato', 'टोमॅटो': 'tomato', 'ਟਮਾਟਰ': 'tomato', 'tamata': 'tomato', 'tamatar': 'tomato',
        'wheat': 'wheat', 'गेहूं': 'wheat', 'गहू': 'wheat', 'ਕਣਕ': 'wheat', 'gehu': 'wheat', 'gahu': 'wheat', 'kanak': 'wheat',
        'cotton': 'cotton', 'कपास': 'cotton', 'कापूस': 'cotton', 'ਕਪਾਹ': 'cotton', 'kapas': 'cotton', 'kapus': 'cotton', 'kapah': 'cotton',
        'onion': 'onion', 'प्याज': 'onion', 'कांदा': 'onion', 'ਪਿਆਜ਼': 'onion', 'pyaz': 'onion', 'kanda': 'onion', 'piyaz': 'onion',
        'sugarcane': 'sugarcane', 'गन्ना': 'sugarcane', 'ऊस': 'sugarcane', 'ਗੰਨਾ': 'sugarcane', 'ganna': 'sugarcane', 'us': 'sugarcane'
    };
    for(let kp in knownCrops) {
        if(q.includes(kp) && !systemMemory.crops.includes(knownCrops[kp])) {
            systemMemory.crops.push(knownCrops[kp]);
            saveMemory();
        }
    }
    let userCrop = systemMemory.crops.length > 0 ? systemMemory.crops[systemMemory.crops.length - 1] : "crop";
    let dbCropKey = (typeof KrishiKnowledgeDB !== 'undefined' && KrishiKnowledgeDB[userCrop]) ? userCrop : "generic";

    if (q.includes('name ') || q.includes('नाव ') || q.includes('नाम ') || q.includes('naav ') || q.includes('naam ')) {
        let newName = null;
        if(q.includes('is ')) newName = q.split('is ')[1].trim();
        else if(q.includes('naav ')) newName = q.split('naav ')[1].trim();
        else if(q.includes('naam ')) newName = q.split('naam ')[1].trim();
        else if(q.split(' ').length <= 2) newName = q; 
        
        if(newName && newName.length > 1) {
            intent.type = "action"; intent.field = "name"; intent.value = newName.replace(/[^a-zA-Zअ-ह\s]/g, '').trim(); 
            if(lang === 'en') intent.message = `I have updated your profile name to ${intent.value}. How else can I assist you today?`;
            else if(lang === 'mr') intent.message = `मी तुमचे नाव ${intent.value} असे नोंदवले आहे. मी आणखी काय मदत करू शकतो?`;
            else if(lang === 'pa') intent.message = `ਮੈਂ ਤੁਹਾਡਾ ਨਾਮ ${intent.value} ਰੱਖ ਦਿੱਤਾ ਹੈ। ਹੋਰ ਕੀ ਮਦਦ ਕਰਾਂ?`;
            else intent.message = `मैंने आपका नाम ${intent.value} दर्ज कर लिया है। अब मैं आपकी और क्या सहायता कर सकता हूँ?`;
            return _finalizeAI(rawInput, intent, isContextual);
        }
    }

    // STEP 3: DECISION ENGINE (PHASE 2 CONTROL LAYER)
    const NAV_MAP = {
        sell_smart: "nav-sell",
        weather: "nav-weather",
        profit_checker: "nav-profit",
        crop_doctor: "nav-doctor",
        schemes: "nav-comm",
        chat: "nav-chat",
        profile: "nav-profile"
    };
    const ACTIVE_FEATURES = ["crop_doctor", "schemes", "profile", "chat"];

    if (matchedTarget) {
        let cardId = NAV_MAP[matchedTarget];
        
        if (intentRes.score >= 0.5) {
            // ALWAYS Navigate for recognized intents based on latest UX feedback
            intent.type = "navigate";
            intent.target = cardId;
            
            if (ACTIVE_FEATURES.includes(matchedTarget)) {
                // ACTIVE WORKING FEATURE -> Open + Speak GUIDANCE
                if (matchedTarget === 'crop_doctor') {
                    if(lang === 'en') intent.message = "Opening Crop Doctor. Please tap the camera button to upload a picture of your sick plant.";
                    else if(lang === 'mr') intent.message = "क्रॉप डॉक्टर उघडत आहे. कृपया आजारी रोपाचा फोटो अपलोड करण्यासाठी कॅमेरा बटणावर टॅप करा.";
                    else intent.message = "क्रॉप डॉक्टर खोल रहा हूँ। बीमार पौधे की तस्वीर अपलोड करने के लिए कृपया कैमरा बटन दबाएं।";
                } else if (matchedTarget === 'chat') {
                    if(lang === 'en') intent.message = "Opening Chat. You can type or use the mic to ask me any farming questions.";
                    else if(lang === 'mr') intent.message = "चॅट उघडत आहे. तुम्ही मला शेतीविषयी काहीही प्रश्न विचारू शकता.";
                    else intent.message = "चैट खोल रहा हूँ। आप यहाँ मुझसे खेती से जुड़ी कोई भी सहायता मांग सकते हैं।";
                } else if (matchedTarget === 'profile') {
                    if(lang === 'en') intent.message = "Opening Profile. Here you can update your personal details and language.";
                    else if(lang === 'mr') intent.message = "प्रोफाइल उघडत आहे. येथे तुम्ही तुमची माहिती आणि भाषा बदलू शकता.";
                    else intent.message = "प्रोफाइल खोल रहा हूँ। यहाँ आप अपनी जानकारी और भाषा बदल सकते हैं।";
                } else {
                    if(lang === 'en') intent.message = `Opening ${matchedTarget.replace('_', ' ')}. Please explore the options.`;
                    else intent.message = `${matchedTarget} खोल रहा हूँ। कृपया विकल्पों का उपयोग करें।`;
                }
            } else {
                // MOCK FEATURE -> Only Open
                if(lang === 'en') intent.message = `Opening ${matchedTarget.replace('_', ' ')}.`;
                else if(lang === 'mr') intent.message = `${matchedTarget} उघडत आहे.`;
                else if(lang === 'pa') intent.message = `${matchedTarget} ਖੋਲ੍ਹ ਰਿਹਾ ਹਾਂ।`;
                else intent.message = `${matchedTarget} खोल रहा हूँ।`;
            }
        }
        
        return _finalizeAI(rawInput, intent, isContextual);
    }

    if (q.includes('fertilizer') || q.includes('khat') || q.includes('khad') || q.includes('खाद') || q.includes('ਖਾਦ') || q.includes('urea') || q.includes('npk')) {
        intent.message = KrishiKnowledgeDB[dbCropKey].fertilizer[lang];
        return _finalizeAI(rawInput, intent, isContextual);
    } 
    else if (q.includes('seed') || q.includes('biyane') || q.includes('beej') || q.includes('बीज') || q.includes('ਬੀਜ') || q.includes('sow') || q.includes('perni')) {
        intent.message = KrishiKnowledgeDB[dbCropKey].seed[lang];
        return _finalizeAI(rawInput, intent, isContextual);
    }
    else if (q.includes('water') || q.includes('pani') || q.includes('सिंचाई')) {
        intent.message = KrishiKnowledgeDB[dbCropKey].water[lang];
        return _finalizeAI(rawInput, intent, isContextual);
    }

    if(lang === 'en') intent.message = "I didn't quite get that. Please try asking again.";
    else if(lang === 'mr') intent.message = "मला हे स्पष्ट समजले नाही. कृपया पुन्हा सांगा.";
    else if(lang === 'pa') intent.message = "ਮੈਨੂੰ ਸਮਝ ਨਹੀਂ ਆਇਆ, ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਦੱਸੋ।";
    else intent.message = "मुझे स्पष्ट समझ नहीं आया। कृपया दोबारा कहें।";

    return _finalizeAI(rawInput, intent, isContextual);
}

function _finalizeAI(promptText, intentObj, isContextual) {
    if (isContextual) {
        systemMemory.history.push({role: 'user', content: promptText});
        systemMemory.history.push({role: 'assistant', content: intentObj.message});
        saveMemory();
    }
    return intentObj;
}

function renderUI() {
    window.scrollTo(0, 0);
    switch (currentScreen) {
        case 'boot': renderBoot(); break;
        case 'tap-start': renderTapToStart(); break;
        case 'splash': renderSplash(); break;
        case 'onboarding': renderOnboarding(); break;
        case 'home': renderHome(); break;
        case 'chat': renderChat(); break;
        case 'doctor': renderDoctor(); break;
        case 'profile': renderProfile(); break;
        default: if (currentScreen.startsWith('mock-')) renderMockFeature(currentScreen);
    }
    
    // Global Context-Aware AI UI Controller
    const globalMic = document.getElementById('global-mic');
    if (globalMic) {
        if (['home', 'doctor', 'chat', 'mock-profit', 'mock-weather', 'mock-sell', 'mock-comm', 'profile'].includes(currentScreen)) {
            globalMic.style.display = 'flex';
        } else {
            globalMic.style.display = 'none';
        }
    }
}

function renderBoot() {
    appContainer.innerHTML = `
        <div class="screen" id="boot-btn" style="justify-content: center; align-items: center; background: white; cursor: pointer; display: flex; flex-direction: column; min-height: 100vh;">
            <img src="farmer_logo.png" alt="Tap to Start" style="width: 250px; height: auto; border-radius: 16px; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2); animation: pulseGlow 2s infinite;">
        </div>
    `;

    document.getElementById('boot-btn').onclick = () => {
        // Silently wake up the speech engine
        let utterance = new SpeechSynthesisUtterance("");
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
        
        currentScreen = 'tap-start';
        renderUI();
    };
}

function renderTapToStart() {
    // Attempt Auto-Play Voice (May be blocked by browser until tap)
    setTimeout(() => {
        speakText(getVoiceString('tapStart'), systemMemory.language);
    }, 500);

    appContainer.innerHTML = `
        <div class="screen" style="justify-content: center; align-items: center; background: white; color: var(--text-main); cursor: pointer; text-align: center; display: flex; flex-direction: column; min-height: 100vh;" id="start-btn">
            
            <!-- User Provided Logo Placeholder -->
            <img id="farmer-logo" src="farmer_logo.png" alt="Farmer Logo" style="width: 150px; height: 150px; object-fit: cover; border-radius: 50%; box-shadow: var(--shadow-lg); margin-bottom: 32px; border: 4px solid var(--primary-light);">
            
            <h1 style="color: var(--primary-dark); font-size: 2.5rem; margin-bottom: 12px;">कृषिमित्र</h1>
            <h2 style="font-weight: 500; font-size: 1.2rem; margin-bottom: 40px; color: var(--text-muted);">आपका डिजिटल सहायक</h2>
            
            <div style="background: var(--primary); color: white; border-radius: var(--radius-pill); padding: 18px 40px; font-weight: 700; font-size: 1.2rem; box-shadow: var(--shadow-md); animation: pulseGlow 1.5s infinite;">
                <i class="fa-solid fa-hand-pointer" style="margin-right: 8px;"></i> यहाँ टैप करें
            </div>
        </div>
    `;

    document.getElementById('start-btn').onclick = () => {
        if(synthesis.speaking) synthesis.cancel();
        
        // Skip language selection if user is already onboarded
        if (systemMemory.name) {
            currentScreen = 'home';
        } else {
            currentScreen = 'splash';
        }
        
        renderUI();
    };
}

function saveMemory() {
    localStorage.setItem('krishimitra_memory', JSON.stringify(systemMemory));
}

// ------------------------------------------------------------------
async function renderSplash() {
    appContainer.innerHTML = `
        <div class="screen" id="splash-screen">
            <h1>KrishiMitra</h1>
            <p style="margin-bottom: 24px; color: var(--primary-dark); font-weight: 500;">Your AI Farming Friend</p>
            <p style="font-size: 1.2rem; margin-top: 32px">Select Language / अपनी भाषा चुनें:</p>
            <div class="lang-grid">
                <div class="lang-card" data-lang="hi">हिंदी</div>
                <div class="lang-card" data-lang="mr">मराठी</div>
                <div class="lang-card" data-lang="en">English</div>
                <div class="lang-card" data-lang="pa">ਪੰਜਾਬੀ</div>
            </div>
        </div>
    `;

    // Splash Voice Prompt - Now guaranteed to work because user tapped!
    setTimeout(() => {
        speakText(getVoiceString('splashPrompt'), systemMemory.language);
    }, 400);

    document.querySelectorAll('.lang-card').forEach(c => {
        c.onclick = async () => {
            const l = c.getAttribute('data-lang');
            systemMemory.language = langMap[l].code;
            saveMemory();
            await speakText(langMap[l].confirm, systemMemory.language);
            currentScreen = systemMemory.name ? 'home' : 'onboarding';
            renderUI();
        };
    });
}

// ------------------------------------------------------------------
function renderOnboarding() {
    appContainer.innerHTML = `
        <div class="screen" style="justify-content: center;">
            <div style="text-align:center; margin-bottom: 40px">
                <div class="avatar" style="margin: 0 auto 16px auto; background: var(--primary);"><i class="fa-solid fa-user"></i></div>
                <h2 id="onboard-title">Farmer Details</h2>
            </div>
            <div style="display:flex; flex-direction:column; gap: 24px;">
                <div>
                    <label style="font-weight: 600; margin-bottom: 8px; display:block;">Name / नाम</label>
                    <div style="display:flex; gap: 12px;">
                        <input type="text" id="ob-name" placeholder="E.g. Ramesh" value="${systemMemory.name || ''}" required>
                        <button class="btn-primary" id="mic-name" style="width: auto; padding: 16px 20px;"><i class="fa-solid fa-microphone"></i></button>
                    </div>
                </div>
                <div>
                    <label style="font-weight: 600; margin-bottom: 8px; display:block;">Phone / नंबर</label>
                    <input type="tel" id="ob-phone" placeholder="10-digit number" maxlength="10" inputmode="numeric" value="${systemMemory.phone || ''}" oninput="this.value = this.value.replace(/[^0-9]/g, '');" required>
                    <p id="phone-error" style="color: #ef4444; font-size: 0.85rem; margin-top: 6px; display: none;"><i class="fa-solid fa-circle-exclamation"></i> Enter valid 10-digit mobile number</p>
                </div>
                <div>
                    <label style="font-weight: 600; margin-bottom: 8px; display:block;">Village / गाँव</label>
                    <div style="display:flex; gap: 12px;">
                        <input type="text" id="ob-region" placeholder="E.g. Pune" value="${systemMemory.region || ''}" required>
                        <button class="btn-primary" id="mic-region" style="width: auto; padding: 16px 20px;"><i class="fa-solid fa-microphone"></i></button>
                    </div>
                </div>
                <div>
                    <label style="font-weight: 600; margin-bottom: 8px; display:block;">Gender / लिंग</label>
                    <select id="ob-gender" style="width: 100%; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 1rem; background: #f8fafc; color: var(--text-main);" required>
                        <option value="" disabled ${!systemMemory.gender ? 'selected' : ''}>Select Gender</option>
                        <option value="Male" ${systemMemory.gender === 'Male' ? 'selected' : ''}>Male / पुरुष</option>
                        <option value="Female" ${systemMemory.gender === 'Female' ? 'selected' : ''}>Female / महिला</option>
                        <option value="Other" ${systemMemory.gender === 'Other' ? 'selected' : ''}>Other / अन्य</option>
                    </select>
                </div>
                <button class="btn-primary" id="finish-onboard" style="margin-top: 32px; box-shadow: var(--shadow-floating);">${systemMemory.name ? 'Update Profile' : 'Create Account'}</button>
                
                <div style="display: flex; align-items: center; margin: 8px 0;">
                    <hr style="flex: 1; border: none; border-top: 1px solid var(--border-color);">
                    <span style="padding: 0 10px; color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">OR</span>
                    <hr style="flex: 1; border: none; border-top: 1px solid var(--border-color);">
                </div>
                
                <button id="google-signin-btn" style="display: flex; align-items: center; justify-content: center; gap: 12px; background: white; border: 1px solid var(--border-color); border-radius: var(--radius-pill); padding: 16px; font-weight: 600; color: var(--text-main); font-size: 1.05rem; cursor: pointer; box-shadow: var(--shadow-sm); width: 100%; transition: var(--transition);">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" style="width: 24px; height: 24px;">
                    Sign in with Google
                </button>
            </div>
        </div>
    `;
    setTimeout(() => {
        speakText(getVoiceString('onboarding'), systemMemory.language);
    }, 400);

    // Mock Google Sign In
    document.getElementById('google-signin-btn').onclick = async () => {
        systemMemory.name = "Kisan (Google)";
        systemMemory.phone = "9999999999";
        systemMemory.region = "Smart Village";
        systemMemory.gender = "Other";
        saveMemory();
        
        await speakText(getVoiceString('accountCreated'), systemMemory.language);
        currentScreen = 'home';
        renderUI();
    };

    document.getElementById('mic-name').onclick = async () => {
        try { document.getElementById('ob-name').value = "Listening...";
              const val = await listenVoice();
              document.getElementById('ob-name').value = val;
              speakText(getVoiceString('nameConfirm', val), systemMemory.language);
        } catch(e) { document.getElementById('ob-name').value = ""; }
    };
    
    document.getElementById('mic-region').onclick = async () => {
        try { document.getElementById('ob-region').value = "Listening...";
              const val = await listenVoice();
              document.getElementById('ob-region').value = val;
              speakText(getVoiceString('villageConfirm', val), systemMemory.language);
        } catch(e) { document.getElementById('ob-region').value = ""; }
    };

    document.getElementById('finish-onboard').onclick = async () => {
        const name = document.getElementById('ob-name').value.trim();
        const phone = document.getElementById('ob-phone').value.trim();
        const region = document.getElementById('ob-region').value.trim();
        const gender = document.getElementById('ob-gender').value;
        const phoneError = document.getElementById('phone-error');
        
        phoneError.style.display = 'none';

        if (!name || !region || !gender) {
            let errText = "कृपया सभी आवश्यक जानकारी भरें।"; // hi by default
            if(systemMemory.language.startsWith('en')) errText = "Please fill all required details.";
            if(systemMemory.language.startsWith('mr')) errText = "कृपया सर्व आवश्यक माहिती भरा.";
            if(systemMemory.language.startsWith('pa')) errText = "ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੀ ਜ਼ਰੂਰੀ ਜਾਣਕਾਰੀ ਭਰੋ।";
            
            speakText(errText, systemMemory.language);
            alert("All fields (Name, Village, Gender) are universally required.");
            return;
        }

        // STRICT Mobile Validation Regex Rule Applied: ^[0-9]{10}$
        if (!/^[0-9]{10}$/.test(phone)) {
            phoneError.style.display = 'block';
            
            let errPhone = "कृप्या 10 अंकों का सही मोबाइल नंबर दर्ज करें।";
            if(systemMemory.language.startsWith('en')) errPhone = "Please enter a valid 10 digit mobile number.";
            if(systemMemory.language.startsWith('mr')) errPhone = "कृपया 10 अंकी वैध मोबाईल क्रमांक प्रविष्ट करा.";
            if(systemMemory.language.startsWith('pa')) errPhone = "ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ 10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ।";
            
            speakText(errPhone, systemMemory.language);
            return;
        }

        systemMemory.name = name;
        systemMemory.phone = phone;
        systemMemory.region = region;
        systemMemory.gender = gender;
        saveMemory();
        
        await speakText(getVoiceString('accountCreated'), systemMemory.language);
        currentScreen = 'home';
        renderUI();
    };
}

// ------------------------------------------------------------------
function renderHome() {
    let lang = systemMemory.language || 'hi-IN';
    let heroText = "कृषि मित्र — भारत द्वारा, भारत के किसानों के लिए";
    let bottomText = "एडवांस्ड एआई एडवाइजरी: ऑफलाइन / कम इंटरनेट क्षमता के साथ";
    
    if (lang.startsWith('en')) {
        heroText = "KrishiMitra — By India, For India's Farmers";
        bottomText = "Advanced AI Advisory with Offline / Low Internet Capability";
    } else if (lang.startsWith('mr')) {
        heroText = "कृषि मित्र — भारताकडून, भारताच्या शेतकऱ्यांसाठी";
        bottomText = "प्रगत एआय सल्ला: ऑफलाइन / कमी इंटरनेट क्षमतेसह";
    } else if (lang.startsWith('pa')) {
        heroText = "ਕ੍ਰਿਸ਼ੀਮਿੱਤਰ — ਭਾਰਤ ਦੁਆਰਾ, ਭਾਰਤ ਦੇ ਕਿਸਾਨਾਂ ਲਈ";
        bottomText = "ਐਡਵਾਂਸਡ AI ਸਲਾਹਕਾਰ: ਆਫਲਾਈਨ / ਘੱਟ ਇੰਟਰਨੈੱਟ ਸਮਰੱਥਾ ਦੇ ਨਾਲ";
    }

    appContainer.innerHTML = `
        <div class="screen" style="padding-bottom: 120px;">
            <div class="home-header">
                <div class="profile-info" id="nav-profile" onclick="currentScreen='profile'; renderUI();" style="cursor:pointer">
                    <div class="avatar">${systemMemory.name.charAt(0) || 'F'}</div>
                    <div class="user-details">
                        <h2>${systemMemory.name}</h2>
                        <p>${systemMemory.region} | KrishiMitra Plus</p>
                    </div>
                </div>
                <div class="weather-badge"><i class="fa-solid fa-sun" style="color: var(--secondary)"></i> 32°C</div>
            </div>
            
            <h3 style="margin-bottom: 20px; font-size: 1.15rem; color: var(--primary-dark);">${heroText}</h3>
            <div class="feature-grid">
                <div class="feature-card ai-powered" id="nav-chat">
                    <div class="icon-wrapper"><i class="fa-regular fa-comments"></i></div>
                    <span class="feature-title">Chat with Mitra</span>
                </div>
                <div class="feature-card ai-powered" id="nav-doctor">
                    <div class="icon-wrapper"><i class="fa-solid fa-leaf"></i></div>
                    <span class="feature-title">Crop Doctor</span>
                </div>
            </div>

            <h3 style="margin-bottom: 20px; font-size: 1.15rem; color: var(--text-muted)">Daily Tools</h3>
            <div class="feature-grid">
                <div class="feature-card mock" id="nav-profit">
                    <div class="icon-wrapper"><i class="fa-solid fa-arrow-trend-up"></i></div>
                    <span class="feature-title">Profit Checker</span>
                </div>
                <div class="feature-card mock" id="nav-weather">
                    <div class="icon-wrapper" style="color:#3b82f6;"><i class="fa-solid fa-cloud-sun-rain"></i></div>
                    <span class="feature-title">Weather Alert</span>
                </div>
                <div class="feature-card mock" id="nav-sell">
                    <div class="icon-wrapper" style="color:var(--secondary);"><i class="fa-solid fa-wallet"></i></div>
                    <span class="feature-title">Sell Smart</span>
                </div>
                <div class="feature-card mock" id="nav-comm">
                    <div class="icon-wrapper" style="color:#6366f1;"><i class="fa-solid fa-users"></i></div>
                    <span class="feature-title">Community</span>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
                <p style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">
                    <i class="fa-solid fa-microchip" style="color: var(--primary); margin-right: 6px;"></i> ${bottomText}
                </p>
            </div>
        </div>
        ${getBottomNavHTML('home')}
    `;
    attachNavListeners();

    // Play the language-specific welcome message ONLY ONCE per session
    if (!systemMemory.hasBeenWelcomed) {
        systemMemory.hasBeenWelcomed = true;
        saveMemory();
        setTimeout(() => {
            const welcomeMsg = getWelcomeMessage(systemMemory.language);
            speakText(welcomeMsg, systemMemory.language);
        }, 400);
    }

    document.getElementById('nav-chat').onclick = () => { currentScreen = 'chat'; renderUI(); };
    document.getElementById('nav-doctor').onclick = () => { currentScreen = 'doctor'; renderUI(); };
    document.getElementById('nav-profit').onclick = () => { currentScreen = 'mock-profit'; renderUI(); };
    document.getElementById('nav-weather').onclick = () => { currentScreen = 'mock-weather'; renderUI(); };
    document.getElementById('nav-sell').onclick = () => { currentScreen = 'mock-sell'; renderUI(); };
    document.getElementById('nav-comm').onclick = () => { currentScreen = 'mock-comm'; renderUI(); };
}

// ------------------------------------------------------------------
function renderChat() {
    appContainer.innerHTML = `
        <div class="view-header">
            <i class="fa-solid fa-arrow-left" id="back-home" style="font-size: 1.2rem; cursor:pointer;"></i>
            <h3 style="flex:1; text-align:center;">Chat with Mitra</h3>
            <i class="fa-solid fa-comment-dots" style="color: var(--primary);"></i>
        </div>
        <div class="chat-container">
            <div class="chat-messages" id="chat-scroller">
                <div class="message bot">${getWelcomeMessage(systemMemory.language)}</div>
                ${systemMemory.history.map(msg => `<div class="message ${msg.role === 'user' ? 'user' : 'bot'}">${msg.content}</div>`).join('')}
            </div>
            <div class="chat-input-area">
                <button class="chat-send-btn" id="chat-mic" style="background: white; color: var(--text-main); border:1px solid #e2e8f0; width:56px; height:56px;"><i class="fa-solid fa-microphone"></i></button>
                <input type="text" id="chat-input" placeholder="Type or speak...">
                <button class="chat-send-btn" id="chat-send" style="width:56px; height:56px;"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
        ${getBottomNavHTML('chat')}
    `;
    attachNavListeners();
    document.getElementById('back-home').onclick = () => { currentScreen = 'home'; renderUI(); };
    setTimeout(() => speakText(getWelcomeMessage(systemMemory.language), systemMemory.language), 300);

    const scroller = document.getElementById('chat-scroller');
    scroller.scrollTop = scroller.scrollHeight;
    const appendMsg = (text, isUser) => {
        const d = document.createElement('div');
        d.className = `message ${isUser ? 'user' : 'bot'}`; d.innerText = text;
        scroller.appendChild(d); scroller.scrollTop = scroller.scrollHeight;
    };

    document.getElementById('chat-send').onclick = async () => {
        const text = document.getElementById('chat-input').value.trim();
        if (!text) return;
        document.getElementById('chat-input').value = '';
        appendMsg(text, true);
        const replyObj = await askAI(text, true);
        appendMsg(replyObj.message, false);
        await speakText(replyObj.message, systemMemory.language);
        
        // Auto-resume listening to keep the conversation flowing naturally
        if (replyObj.type === 'advice') {
             setTimeout(() => {
                 const micBtn = document.getElementById('chat-mic');
                 if(micBtn && currentScreen === 'chat') micBtn.click();
             }, 500);
        }
        
        // Agent tasks inside continuous chat session
        if (replyObj.type === 'action' && replyObj.field === 'name') {
            systemMemory.name = replyObj.value;
            saveMemory();
        } else if (replyObj.type === 'navigation' && replyObj.target) {
            setTimeout(() => {
                let s = replyObj.target.replace('nav-', '');
                if (s === 'profit') s = 'mock-profit';
                if (s === 'doctor') s = 'doctor';
                currentScreen = s;
                renderUI();
            }, 4500); 
        }
    };
    document.getElementById('chat-mic').onclick = async () => {
        const btn = document.getElementById('chat-mic');
        btn.style.background = 'var(--primary)'; btn.style.color = 'white';
        try { 
            const transcribed = await listenVoice();
            document.getElementById('chat-input').value = transcribed;
            // Auto-send when clicking mic inside chat
            setTimeout(() => document.getElementById('chat-send').click(), 500);
        } catch(e) {}
        btn.style.background = 'white'; btn.style.color = 'var(--text-main)';
    };
}

// ------------------------------------------------------------------
// Genuine AI Crop Doctor using ML5.js & MobileNet (No API Key Required)
let visionClassifier = null;
let isVisionModelLoaded = false;

function renderDoctor() {
    appContainer.innerHTML = `
        <div class="screen" style="background: white;">
            <div class="view-header" style="margin: -24px -24px 32px -24px;">
                <i class="fa-solid fa-arrow-left" id="back-home-doc" style="font-size: 1.2rem; cursor:pointer;"></i>
                <h3 style="flex:1; text-align:center;">Crop Doctor AI</h3>
                <i class="fa-solid fa-leaf" style="color: var(--primary);"></i>
            </div>
            
            <div style="text-align: center; flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                <div style="width: 140px; height: 140px; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 40px; display:flex; justify-content:center; align-items:center; font-size: 4rem; color: white; margin-bottom: 32px; box-shadow: var(--shadow-lg);">
                    <i class="fa-solid fa-camera"></i>
                </div>
                <h2 style="margin-bottom: 12px; font-size: 1.8rem;">Identify Disease</h2>
                <p id="vision-status" style="color: var(--text-muted); margin-bottom: 30px; font-size: 1rem; max-width: 80%;">Loading Neural Network... Please wait.</p>
                
                <input type="file" id="camera-input" accept="image/*" capture="environment" style="display:none;">
                
                <!-- Hidden image tag to pass to ml5 -->
                <img id="hidden-image" style="display:none; max-width:200px; border-radius:16px; margin-bottom:24px; box-shadow: var(--shadow-md);">
                
                <button class="btn-primary" id="take-photo" disabled style="margin-bottom: 16px; padding: 20px 32px; font-size:1.2rem; box-shadow: var(--shadow-floating); opacity:0.5;">
                    <i class="fa-solid fa-camera" style="margin-right: 12px;"></i> Snap Photo
                </button>
                <div id="doctor-result" style="margin-top: 16px; font-weight: 700; font-size:1.1rem; color: var(--primary-dark); padding: 0 20px; text-transform: capitalize;"></div>
            </div>
        </div>
        ${getBottomNavHTML('doctor')}
    `;
    attachNavListeners();
    document.getElementById('back-home-doc').onclick = () => { currentScreen = 'home'; renderUI(); };

    // Load AI Model in background
    if (typeof ml5 !== 'undefined') {
        if (!visionClassifier) {
            visionClassifier = ml5.imageClassifier('MobileNet', () => {
                isVisionModelLoaded = true;
                const btn = document.getElementById('take-photo');
                if(btn) {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    document.getElementById('vision-status').innerHTML = "Neural Network Loaded! <br><span style='font-size:0.85rem; color:var(--primary)'>Real Local AI Ready</span>";
                    speakText(getVoiceString('doctorReady'), systemMemory.language);
                }
            });
        } else {
            document.getElementById('take-photo').disabled = false;
            document.getElementById('take-photo').style.opacity = '1';
            document.getElementById('vision-status').innerHTML = "Neural Network Ready <br><span style='font-size:0.85rem; color:var(--primary)'>Real Local AI Active</span>";
            speakText(getVoiceString('doctorReady'), systemMemory.language);
        }
    } else {
        document.getElementById('vision-status').innerText = "ML5 library failed to load. Please check internet connection.";
    }

    document.getElementById('take-photo').onclick = () => document.getElementById('camera-input').click();
    
    document.getElementById('camera-input').onchange = e => {
        if(e.target.files.length > 0) {
            const file = e.target.files[0];
            const imgElement = document.getElementById('hidden-image');
            imgElement.src = URL.createObjectURL(file);
            imgElement.style.display = 'block'; // Show thumbnail to user
            
            document.getElementById('doctor-result').innerText = "AI is inspecting your photo...";
            document.getElementById('doctor-result').style.color = "var(--text-main)";
            speakText(getVoiceString('doctorScan'), systemMemory.language);
            
            // Wait for image to load to DOM before classifying
            imgElement.onload = () => {
                visionClassifier.classify(imgElement, async (error, results) => {
                    if (error) {
                        console.error(error);
                        document.getElementById('doctor-result').innerText = "AI Error analyzing image.";
                        return;
                    }
                    console.log("ML5 MobileNet Predictions:", results);
                    
                    const score = results[0].confidence;
                    const topGuess = results[0].label.toLowerCase().split(',')[0];
                    const classes = results.map(r => r.label.toLowerCase()).join(" ");
                    const plantKeywords = ['plant', 'leaf', 'tree', 'grass', 'flower', 'fruit', 'vegetable', 'crop', 'soil', 'pot', 'wood', 'agriculture', 'corn', 'pepper', 'apple', 'strawberry', 'tomato', 'cabbage', 'mushroom', 'produce', 'daisy', 'earth', 'ground'];
                    
                    const isPlantMatch = plantKeywords.some(kw => classes.includes(kw));
                    
                    const lang = systemMemory.language.startsWith('en') ? 'en' :
                                 systemMemory.language.startsWith('mr') ? 'mr' :
                                 systemMemory.language.startsWith('pa') ? 'pa' : 'hi';

                    // STEP 1: IMAGE VALIDATION (Blurry, Low Confidence, or Definitely Not a Plant)
                    if (!isPlantMatch || score < 0.10 || (score > 0.4 && topGuess.match(/screen|wall|mouse|person|desk|fabric|monitor|keyboard|laptop|phone/))) {
                        let errStr = "This image is not clear or it's not a leaf. Please send a clear photo of the leaf.";
                        if(lang === 'mr') errStr = "हे चित्र क्लिअर नाही आहे किंवा पान नाही. कृपया पानाचा स्वच्छ फोटो पाठवा.";
                        if(lang === 'pa') errStr = "ਇਹ ਫੋਟੋ ਸਾਫ ਨਹੀਂ ਹੈ, ਕਿਰਪਾ ਕਰਕੇ ਪੱਤੇ ਦੀ ਸਾਫ ਫੋਟੋ ਭੇਜੋ।";
                        if(lang === 'hi') errStr = "तस्वीर स्पष्ट नहीं है या पत्ता नहीं है। कृपया पत्ते की फोटो भेजें।";

                        document.getElementById('doctor-result').style.color = "#ef4444";
                        document.getElementById('doctor-result').innerHTML = `<i class='fa-solid fa-triangle-exclamation'></i> ${errStr}`;
                        await speakText(errStr, systemMemory.language);
                        return;
                    }

                    // STEP 2: AI RESPONSE CHECK (It is a plant, but certainty is low)
                    if (isPlantMatch && score < 0.45) {
                        let errStr = "I cannot identify it exactly, but it might be a disease. Try a Neem spray and upload a clearer photo.";
                        if(lang === 'mr') errStr = "मी नक्की ओळखू शकत नाही, पण हा रोग असू शकतो. निम फवारणी करा आणि स्पष्ट फोटो पाठवा.";
                        if(lang === 'pa') errStr = "ਮੈਂ ਪਛਾਣ ਨਹੀਂ ਸਕਦਾ, ਪਰ ਇਹ ਬਿਮਾਰੀ ਹੋ ਸਕਦੀ ਹੈ। ਨਿੰਮ ਸਪਰੇਅ ਕਰੋ ਅਤੇ ਸਾਫ ਫੋਟੋ ਭੇਜੋ।";
                        if(lang === 'hi') errStr = "मैं ठीक से पहचान नहीं सकता, लेकिन यह बीमारी हो सकती है। नीम स्प्रे करें और साफ फोटो भेजें।";

                        document.getElementById('doctor-result').style.color = "var(--primary-dark)";
                        document.getElementById('doctor-result').innerHTML = `<i class='fa-solid fa-circle-info'></i> ${errStr}`;
                        await speakText(errStr, systemMemory.language);
                        return;
                    }
                    
                    // STEP 3: EXACT MATCH (Highly confident Plant Identification -> Fetch Strict Deep Knowledge Diagnosis)
                    // Phase 6 & 7: GPT-Style Contextual Reasoning Agent Simulation using Deep Offline DB
                    let userCrop = systemMemory.crops.length > 0 ? systemMemory.crops[systemMemory.crops.length - 1] : "crop";
                    let dbCropKey = (typeof KrishiKnowledgeDB !== 'undefined' && KrishiKnowledgeDB[userCrop]) ? userCrop : "generic";
                    
                    let diagnosis = KrishiKnowledgeDB[dbCropKey].disease[lang];
                    
                    let displayMsg = `<i class='fa-solid fa-check-circle'></i> Agronomy Vision AI: Confirmed ${userCrop.toUpperCase()} Leaf (${(score*100).toFixed(0)}%).<br><span style="color:#ef4444; margin-top:8px; display:block; font-weight: 500;">${diagnosis}</span>`;

                    document.getElementById('doctor-result').style.color = "var(--primary-dark)";
                    document.getElementById('doctor-result').innerHTML = displayMsg;
                    await speakText(diagnosis, systemMemory.language);
                });
            };
        }
    };
}

// ------------------------------------------------------------------
function renderMockFeature(typeId) {
    let title = "Feature"; let icon = "fa-star"; let htmlContent = ""; let voicePrompt = "";
    if (typeId === 'mock-profit') {
        title = "Profit Checker"; icon = "fa-arrow-trend-up"; voicePrompt = getVoiceString('mockProfit');
        htmlContent = `<div class="metric-card"><div class="metric-icon"><i class="fa-solid fa-indian-rupee-sign"></i></div><div class="metric-content"><h4>Estimated Net Profit</h4><p>₹1,25,000</p></div></div><div class="metric-card"><div class="metric-icon" style="color: #ef4444; background: rgba(239, 68, 68, 0.1)"><i class="fa-solid fa-bug"></i></div><div class="metric-content"><h4>Pest Risk Today</h4><p style="color:#ef4444">High (85%)</p></div></div><div style="background:white; padding:16px; border-radius:16px; box-shadow:var(--shadow-md); margin-top:24px"><img src="https://quickchart.io/chart?c={type:'line',data:{labels:['Jan','Feb','Mar','Apr'],datasets:[{label:'Income',data:[50,60,70,120],fill:true,borderColor:'green',backgroundColor:'rgba(16,185,129,0.1)'}]}}" style="width:100%;"></div>`;
    } else if (typeId === 'mock-weather') {
        title = "Weather & Alerts"; icon = "fa-cloud-sun-rain"; voicePrompt = getVoiceString('mockWeather');
        htmlContent = `<div style="text-align:center; padding: 40px 0; background:linear-gradient(to bottom, #dbeafe, white); border-radius: 24px; box-shadow:var(--shadow-md); margin-bottom:24px;"><i class="fa-solid fa-cloud-showers-water" style="font-size: 5rem; color: #3b82f6; margin-bottom:16px;"></i><h1 style="font-size: 4rem; color:#1e293b;">28°C</h1><p class="text-muted" style="font-size:1.1rem; font-weight:600">Heavy Rain at 4:00 PM</p></div><div class="list-item" style="border:2px solid #ef4444; background:#fef2f2"><span style="font-weight:700; color:#ef4444"><i class="fa-solid fa-triangle-exclamation"></i> AI Alert</span><span style="color:#991b1b; font-weight:600">Do NOT spray fertilizer today.</span></div>`;
    } else if (typeId === 'mock-sell') {
        title = "Sell Smart (Mandi Prices)"; icon = "fa-wallet"; voicePrompt = getVoiceString('mockSell');
        htmlContent = `<div class="list-item"><span>Pune Mandi - Tomato</span><span style="color:var(--primary); font-weight:800; font-size:1.2rem;">₹45/kg <i class="fa-solid fa-arrow-up"></i></span></div><div class="list-item"><span>Nashik Mandi - Onion</span><span style="color:var(--primary); font-weight:800; font-size:1.2rem;">₹22/kg <i class="fa-solid fa-arrow-up"></i></span></div><div class="list-item"><span>Mumbai - Wheat</span><span style="color:#ef4444; font-weight:800; font-size:1.2rem;">₹30/kg <i class="fa-solid fa-arrow-down"></i></span></div><button class="btn-primary" style="margin-top:24px; box-shadow:var(--shadow-floating);">Find Nearest Buyer</button>`;
    } else if (typeId === 'mock-comm') {
        title = "Farmer Community"; icon = "fa-users"; voicePrompt = getVoiceString('mockComm');
        htmlContent = `<div class="comm-msg" style="background:white; padding:16px; border-radius:16px; box-shadow:var(--shadow-sm); margin-bottom:12px; cursor:pointer;"><div style="font-weight:800; color:var(--text-main);">Ramesh K. (2km away)</div><p style="color:var(--text-muted); margin-top:8px; font-size:1.05rem;">Maza tomato la infection zala ahe, kay karu?</p><span style="font-weight:700; font-size:0.85rem; display:block; margin-top:12px; color:var(--primary);">12 Comments</span></div>
        <div class="comm-msg" style="background:white; padding:16px; border-radius:16px; box-shadow:var(--shadow-sm); margin-bottom:12px; cursor:pointer;"><div style="font-weight:800; color:#4f46e5;">Govt Scheme Alert: PM Kisan</div><p style="color:var(--text-muted); margin-top:8px; font-size:1.05rem;">Subsidised seeds available till Monday at local center.</p><span style="font-weight:700; margin-top:12px; display:block; font-size:0.85rem; color:var(--primary);">45 Likes</span></div>`;
    }
    appContainer.innerHTML = `<div class="screen"><div class="view-header" style="margin: -24px -24px 24px -24px;"><i class="fa-solid fa-arrow-left" id="back-mock" style="font-size: 1.2rem; cursor:pointer;"></i><h3 style="flex:1; text-align:center;">${title}</h3><i class="fa-solid ${icon}" style="color: var(--primary);"></i></div><div class="mock-dashboard">${htmlContent}</div></div>${getBottomNavHTML('none')}`;
    attachNavListeners(); document.getElementById('back-mock').onclick = () => { currentScreen = 'home'; renderUI(); };
    setTimeout(() => speakText(voicePrompt, systemMemory.language), 400);

    if (typeId === 'mock-comm') {
        document.querySelectorAll('.comm-msg').forEach(msg => {
            msg.onclick = () => {
                const lang = systemMemory.language;
                let joinMsg = "Please join the community to talk.";
                if(lang.startsWith('hi')) joinMsg = "बातचीत करने के लिए कृपया कम्युनिटी में शामिल हों।";
                if(lang.startsWith('mr')) joinMsg = "संवाद साधण्यासाठी कृपया कम्युनिटी जॉईन करा.";
                if(lang.startsWith('pa')) joinMsg = "ਗੱਲਬਾਤ ਕਰਨ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਕਮਿਊਨਿਟੀ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ।";
                
                alert("Please Join Community / कम्युनिटी जॉईन करा");
                speakText(joinMsg, systemMemory.language);
            };
        });
    }
}

// ------------------------------------------------------------------
function renderProfile() {
    appContainer.innerHTML = `
        <div class="screen">
            <div class="view-header" style="margin: -24px -24px 24px -24px;">
                <i class="fa-solid fa-arrow-left" id="back-prof" style="font-size: 1.2rem; cursor:pointer;"></i>
                <h3 style="flex:1; text-align:center;">My Profile</h3>
                <i class="fa-solid fa-user-gear" style="color: var(--primary);"></i>
            </div>
            
            <div class="profile-card">
                <div class="avatar">${systemMemory.name.charAt(0) || 'U'}</div>
                <h2>${systemMemory.name}</h2>
                <p class="text-muted" style="margin-bottom: 32px;">Farmer ID: #KM-91823</p>
                
                <div>
                    <div class="profile-detail"><span>Phone</span><span>${systemMemory.phone || 'N/A'}</span></div>
                    <div class="profile-detail"><span>Village</span><span>${systemMemory.region || 'India'}</span></div>
                    <div class="profile-detail"><span>Language</span><span>${langMap[Object.keys(langMap).find(k=>langMap[k].code===systemMemory.language) || 'hi'].name}</span></div>
                </div>
                
                <button class="btn-primary" id="edit-prof" style="margin-top: 40px; border-radius: 12px; font-weight: 700; background: var(--secondary);">
                    <i class="fa-solid fa-pen"></i> Edit Profile
                </button>
                <button class="btn-secondary" id="logout-prof" style="margin-top: 16px; border-radius: 12px; font-weight: 700; border: 2px solid #ef4444; color: #ef4444;">
                    <i class="fa-solid fa-right-from-bracket"></i> Logout
                </button>
            </div>
            
            <p style="text-align:center; font-size: 0.85rem; color: #94a3b8; font-weight:600;">KrishiMitra App Version 2.0 (MVP)</p>
        </div>
        ${getBottomNavHTML('profile')}
    `;
    attachNavListeners();
    document.getElementById('back-prof').onclick = () => { currentScreen = 'home'; renderUI(); };
    
    document.getElementById('edit-prof').onclick = () => { currentScreen = 'onboarding'; renderUI(); };
    
    document.getElementById('logout-prof').onclick = () => {
        // Clear logic for logout
        systemMemory = { name: '', language: 'hi-IN', phone: '', region: '', history: [], hasBeenWelcomed: false, doctorTestCount: 0 };
        saveMemory();
        currentScreen = 'splash';
        renderUI();
    };
    setTimeout(() => speakText(getVoiceString('profileVoice'), systemMemory.language), 300);
}


function getBottomNavHTML(activeTab) {
    return `<div class="bottom-nav">
            <div class="nav-item ${activeTab === 'home' ? 'active' : ''}" data-target="home"><i class="fa-solid fa-house"></i><span>Home</span></div>
            <div class="nav-item ${activeTab === 'chat' || activeTab === 'doctor' ? 'active' : ''}" data-target="chat"><i class="fa-regular fa-comments"></i><span>Chat AI</span></div>
            <div class="nav-item ${activeTab === 'mock-comm' ? 'active' : ''}" data-target="mock-comm"><i class="fa-solid fa-users"></i><span>Community</span></div>
            <div class="nav-item ${activeTab === 'profile' ? 'active' : ''}" data-target="profile"><i class="fa-regular fa-user"></i><span>Profile</span></div>
        </div>`;
}

function attachNavListeners() {
    document.querySelectorAll('.bottom-nav .nav-item[data-target]').forEach(el => {
        el.onclick = () => { currentScreen = el.getAttribute('data-target'); renderUI(); };
    });
}

// ------------------------------------------------------------------
// GLOBAL AI ASSISTANT INITIALIZATION
// ------------------------------------------------------------------
function initGlobalMic() {
    const mic = document.getElementById('global-mic');
    if (!mic) return;

    let activeRecognition = null;
    let isRecordingToggle = false;

    mic.onclick = async () => {
        if(synthesis.speaking) synthesis.cancel();

        if (isRecordingToggle) {
            if (activeRecognition) activeRecognition.stop();
            isRecordingToggle = false;
            mic.classList.remove('active');
            mic.querySelector('span').innerText = 'Ask KrishiMitra';
            return;
        }

        mic.classList.add('active'); 
        mic.querySelector('span').innerText = 'Listening... Tap to stop';
        isRecordingToggle = true;
        
        try {
            const userQuestion = await new Promise((resolve, reject) => {
                const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRec) return reject('Not supported');
                
                const recognition = new SpeechRec();
                activeRecognition = recognition;
                recognition.lang = systemMemory.language || 'hi-IN';
                recognition.interimResults = true; 
                recognition.continuous = true; 
                
                let finalTrans = '';
                let tempTrans = '';
                recognition.onresult = (event) => {
                    tempTrans = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) finalTrans += event.results[i][0].transcript;
                        else tempTrans += event.results[i][0].transcript;
                    }
                };
                recognition.onerror = (e) => reject(e.error);
                recognition.onend = () => resolve((finalTrans + tempTrans).trim());
                
                setTimeout(() => {
                    if (isRecordingToggle) {
                        try { recognition.start(); } catch(e) { reject(e); }
                    } else {
                        resolve('');
                    }
                }, 200);
            });
            
            mic.classList.remove('active');
            mic.querySelector('span').innerText = 'Thinking...';
            isRecordingToggle = false;
            
            if(!userQuestion || userQuestion.length < 2) {
                speakText(getVoiceString('micError'), systemMemory.language);
                mic.querySelector('span').innerText = 'Ask KrishiMitra';
                return;
            }
            
            const replyObj = await askAI(userQuestion, false);
            
            mic.querySelector('span').innerText = 'Ask KrishiMitra';
            await speakText(replyObj.message, systemMemory.language);
            
            if (replyObj.type === 'action' && replyObj.field === 'name') {
                systemMemory.name = replyObj.value;
                saveMemory();
                renderUI(); 
            } else if (replyObj.type === 'navigate' && replyObj.target) {
                // Determine target screen from mapped card ID
                let t = 'home';
                if (replyObj.target === 'nav-doctor') t = 'doctor';
                else if (replyObj.target === 'nav-chat') t = 'chat';
                else if (replyObj.target === 'nav-sell') t = 'mock-sell';
                else if (replyObj.target === 'nav-weather') t = 'mock-weather';
                else if (replyObj.target === 'nav-profit') t = 'mock-profit';
                else if (replyObj.target === 'nav-comm') t = 'mock-comm';
                else if (replyObj.target === 'nav-profile') t = 'profile';
                
                currentScreen = t;
                renderUI();
            } else if (replyObj.type === 'highlight' && replyObj.target) {
                highlightCard(replyObj.target);
            }
        } catch(err) {
            mic.classList.remove('active');
            mic.querySelector('span').innerText = 'Ask KrishiMitra';
            isRecordingToggle = false;
            if(err !== 'no-speech') console.error("Mic error:", err);
        }
    };
}

// Startup
renderUI();
initGlobalMic();
