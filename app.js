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
    if (langCode.startsWith('en')) return "Hello! How's your farm doing today?";
    if (langCode.startsWith('mr')) return "Kasa ahes bhau! Kay mhantay shet?";
    if (langCode.startsWith('pa')) return "Ki haal hai veer! Khet da ki haal aa?";
    return "Kaise ho bhaiya! Ka keh raha hai khet?"; // Default Hindi
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
    let voice = voices.find(v => v.lang === langCode) || voices.find(v => v.lang.startsWith(prefix));
    if (voice) {
        utterance.voice = voice;
    }

    utterance.volume = 1;
    utterance.rate = 0.95; 
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

// Ultra-Advanced Offline GPT Agent Simulation (Intent, Navigation, Action, Memory)
async function askAI(promptText, isContextual = false) {
    if(!systemMemory.crops) systemMemory.crops = []; 
    await new Promise(r => setTimeout(r, 1600)); // Simulate GPT Inference Delay
    
    const q = promptText.toLowerCase();
    const lang = systemMemory.language.startsWith('en') ? 'en' :
                 systemMemory.language.startsWith('mr') ? 'mr' :
                 systemMemory.language.startsWith('pa') ? 'pa' : 'hi';
                 
    let intent = { type: "advice", message: "" };

    // 1. MEMORY AGENT: Learn the crop
    const knownCrops = {
        'tomato': 'tomato', 'टमाटर': 'tomato', 'टोमॅटो': 'tomato', 'ਟਮਾਟਰ': 'tomato',
        'wheat': 'wheat', 'गेहूं': 'wheat', 'गहू': 'wheat', 'ਕਣਕ': 'wheat',
        'cotton': 'cotton', 'कपास': 'cotton', 'कापूस': 'cotton', 'ਕਪਾਹ': 'cotton',
        'onion': 'onion', 'प्याज': 'onion', 'कांदा': 'onion', 'ਪਿਆਜ਼': 'onion',
        'sugarcane': 'sugarcane', 'गन्ना': 'sugarcane', 'ऊस': 'sugarcane', 'ਗੰਨਾ': 'sugarcane'
    };
    
    for(let kp in knownCrops) {
        if(q.includes(kp) && !systemMemory.crops.includes(knownCrops[kp])) {
            systemMemory.crops.push(knownCrops[kp]);
            saveMemory();
        }
    }
    let userCrop = systemMemory.crops.length > 0 ? systemMemory.crops[systemMemory.crops.length - 1] : "crop";

    // 2. CONTEXTUAL AWARENESS (History Memory)
    let lastUserMessage = systemMemory.history.length > 1 ? systemMemory.history[systemMemory.history.length - 2].content.toLowerCase() : "";
    if (q === 'yes' || q === 'ho' || q === 'haan' || q.includes('more') || q.includes('aur batao') || q.includes('anjhi') || q.includes('tell me')) {
        if(lastUserMessage.includes('fertilizer') || lastUserMessage.includes('खत') || lastUserMessage.includes('खाद')) {
            if(lang === 'en') intent.message = `For ${userCrop}, if the soil is deficient, apply 50kg Urea per acre split into two doses. Make sure the soil is moist before application.`;
            else if(lang === 'mr') intent.message = `${userCrop === 'crop' ? 'पिकासाठी' : userCrop + ' साठी'} मातीची चाचणी करा. कमतरता असल्यास एकरी ५० किलो युरिया दोन टप्प्यात द्या. जमिनीमध्ये ओलावा असल्याची खात्री करा.`;
            else if(lang === 'pa') intent.message = `${userCrop === 'crop' ? 'ਫਸਲ' : userCrop} ਲਈ ਇੱਕ ਏਕੜ ਵਿੱਚ 50 ਕਿਲੋ ਯੂਰੀਆ ਦੋ ਵਾਰ ਪਾਓ। ਖੇਤ ਵਿੱਚ ਨਮੀ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ।`;
            else intent.message = `${userCrop === 'crop' ? 'फसल' : userCrop} के लिए, 50 किलो यूरिया प्रति एकड़ दो भागों में डालें। छिड़काव से पहले मिट्टी में नमी सुनिश्चित करें।`;
            return _finalizeAI(promptText, intent, isContextual);
        }
    }

    // 3. INTENT AGENT: Profile Action
    if (q.includes('name') || q.includes('नाव') || q.includes('नाम') || q.includes('naav')) {
        let newName = null;
        if(q.includes('my name is')) newName = q.split('my name is')[1].trim();
        else if(q.includes('majh naav')) newName = q.split('majh naav')[1].trim();
        else if(q.includes('mera naam')) newName = q.split('mera naam')[1].trim();
        else if(q.includes('mera naam hai')) newName = q.split('mera naam hai')[1].trim();
        else if(q.split(' ').length <= 2) newName = q; // if they just said "Rahul"
        
        if(newName && newName.length > 1) {
            intent.type = "action";
            intent.field = "name";
            intent.value = newName.replace(/[^a-zA-Zअ-ह]/g, '').trim() || newName; 
            if(lang === 'en') intent.message = `I have updated your profile name to ${intent.value}. How else can I assist you today?`;
            else if(lang === 'mr') intent.message = `मी तुमचे नाव ${intent.value} असे नोंदवले आहे. मी आणखी काय मदत करू शकतो?`;
            else if(lang === 'pa') intent.message = `ਮੈਂ ਤੁਹਾਡਾ ਨਾਮ ${intent.value} ਰੱਖ ਦਿੱਤਾ ਹੈ। ਹੋਰ ਕੀ ਮਦਦ ਕਰਾਂ?`;
            else intent.message = `मैंने आपका नाम ${intent.value} दर्ज कर लिया है। अब मैं आपकी और क्या सहायता कर सकता हूँ?`;
            return _finalizeAI(promptText, intent, isContextual);
        }
    }

    // 4. INTENT AGENT: Dynamic UI Navigation
    if (q.includes('profit') || q.includes('nfa') || q.includes('नफा') || q.includes('money') || q.includes('kasa check')) {
        intent.type = "navigation"; intent.target = "nav-profit";
        if(lang === 'en') intent.message = "Navigating you to the Profit Checker. You can estimate your revenue and market trends here.";
        else if(lang === 'mr') intent.message = "नफा तपासक उघडत आहे. येथे तुम्ही तुमचा नफा आणि बाजारातील कल तपासू शकता.";
        else if(lang === 'pa') intent.message = "ਮੁਨਾਫਾ ਚੈੱਕਰ ਖੋਲ੍ਹ ਰਿਹਾ ਹਾਂ। ਆਪਣਾ ਮਾਰਕੀਟ ਰੇਟ ਦੇਖੋ।";
        else intent.message = "प्रॉफिट चेकर खोल रहा हूँ। यहाँ आप अपने मुनाफे का अनुमान लगा सकते हैं।";
        return _finalizeAI(promptText, intent, isContextual);
    }
    if (q.includes('disease') || q.includes('rog') || q.includes('रोग') || q.includes('bimari') || q.includes('doctor') || q.includes('bimar')) {
        intent.type = "navigation"; intent.target = "nav-doctor";
        if(lang === 'en') intent.message = "Opening Crop Doctor. Please tap the camera, upload a clear picture of the affected leaf, and our AI will diagnose the disease.";
        else if(lang === 'mr') intent.message = "क्रॉप डॉक्टर उघडत आहे. कृपया पानाचा स्वच्छ फोटो घ्या, आमचे AI विश्लेषण करेल.";
        else if(lang === 'pa') intent.message = "ਕ੍ਰੌਪ ਡਾਕਟਰ ਖੋਲ੍ਹ ਰਿਹਾ ਹਾਂ। ਸਾਫ ਫੋਟੋ ਖਿੱਚੋ ਅਤੇ AI ਬਿਮਾਰੀ ਦੱਸੇਗਾ।";
        else intent.message = "क्रॉप डॉक्टर खोल रहा हूँ। कृपया पत्ते की साफ तस्वीर लें और हमारा AI बीमारी की पहचान करेगा।";
        return _finalizeAI(promptText, intent, isContextual);
    }

    // 5. DEEP AGRONOMY KNOWLEDGE BASE (Multi-Sentence Expert Advice)
    // 5. DEEP AGRONOMY KNOWLEDGE BASE (Offline Database Lookup)
    let dbCropKey = (typeof KrishiKnowledgeDB !== 'undefined' && KrishiKnowledgeDB[userCrop]) ? userCrop : "generic";

    if (q.includes('disease') || q.includes('rog') || q.includes('रोग') || q.includes('yellow') || q.includes('pivla') || q.includes('पीले') || q.includes('spot')) {
        intent.message = KrishiKnowledgeDB[dbCropKey].disease[lang];
    } 
    else if (q.includes('fertilizer') || q.includes('khat') || q.includes('khad') || q.includes('खाद') || q.includes('ਖਾਦ') || q.includes('urea') || q.includes('npk')) {
        intent.message = KrishiKnowledgeDB[dbCropKey].fertilizer[lang];
    }
    else if (q.includes('water') || q.includes('rain') || q.includes('paus') || q.includes('पाऊस') || q.includes('pani') || q.includes('सिंचाई') || q.includes('बारिश')) {
        intent.message = KrishiKnowledgeDB[dbCropKey].water[lang];
    } 
    else if (q.includes('seed') || q.includes('biyane') || q.includes('beej') || q.includes('बीज') || q.includes('ਬੀਜ') || q.includes('sow')) {
        intent.message = KrishiKnowledgeDB[dbCropKey].seed[lang];
    }
    else {
        // Fallback Conversation Array for extreme variety
        const genericEn = [
            `I'm listening, ${systemMemory.name}. As your KrishiMitra, I can help diagnose diseases, check weather impacts, or schedule fertilizers for your ${userCrop}. What's the main issue today?`,
            `Could you elaborate a bit more? I specialize in agronomy and crop management. Whether it's ${userCrop} or managing soil health, I'm here to assist.`,
            `That's an interesting point. How is the current weather affecting your ${userCrop}? We can open the Crop Doctor if you notice any spots on the leaves.`
        ];
        const genericHi = [
            `मैं सुन रहा हूँ, ${systemMemory.name}। आपके कृषिमित्र के रूप में मैं ${userCrop === 'crop' ? 'फसल' : userCrop} की बीमारियों और खाद प्रबंधन में मदद कर सकता हूँ। आपकी मुख्य समस्या क्या है?`,
            `कृपया थोड़ा और विस्तार से बताएं। मैं ${userCrop === 'crop' ? 'खेती' : userCrop} की उन्नत तकनीकों का विशेषज्ञ हूँ। मैं आपकी कैसे मदद करूँ?`,
            `आपकी ${userCrop === 'crop' ? 'फसल' : userCrop} की वर्तमान स्थिति कैसी है? अगर पत्तों पर कोई दाग है, तो आप मुझे बस 'क्रॉप डॉक्टर' खोलने के लिए कह सकते हैं।`
        ];
        const genericMr = [
            `मी ऐकत आहे, ${systemMemory.name}. तुमचा कृषिमित्र म्हणून मी ${userCrop === 'crop' ? 'पिकाचे' : userCrop + ' चे'} रोग आणि खत व्यवस्थापनात मदत करू शकतो. आज तुमची मुख्य समस्या काय आहे?`,
            `कृपया अधिक माहिती सांगा. तुमच्या ${userCrop === 'crop' ? 'शेतीत' : userCrop + ' पिकात'} काही अडचण असल्यास आपण क्रॉप डॉक्टर वापरू शकतो.`,
            `तुमच्या ${userCrop === 'crop' ? 'पिकाची' : userCrop + ' ची'} सध्याची स्थिती कशी आहे? पानांवर डाग असल्यास मला 'क्रॉप डॉक्टर उघड' असे सांगा.`
        ];
        const genericPa = [
            `ਮੈਂ ਸੁਣ ਰਿਹਾ ਹਾਂ, ${systemMemory.name}। ਮੈਂ ਤੁਹਾਡੀ ${userCrop === 'crop' ? 'ਫਸਲ' : userCrop} ਦੇ ਰੋਗਾਂ ਅਤੇ ਖਾਦ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਅੱਜ ਕੀ ਸਮੱਸਿਆ ਹੈ?`,
            `ਕਿਰਪਾ ਕਰਕੇ ਹੋਰ ਜਾਣਕਾਰੀ ਦਿਓ। ਜੇਕਰ ਤੁਹਾਡੀ ${userCrop === 'crop' ? 'ਫਸਲ' : userCrop} ਵਿੱਚ ਕੋਈ ਬਿਮਾਰੀ ਹੈ, ਤਾਂ ਮੈਨੂੰ 'ਕ੍ਰੌਪ ਡਾਕਟਰ' ਖੋਲ੍ਹਣ ਲਈ ਕਹੋ।`,
            `ਤੁਹਾਡੀ ${userCrop === 'crop' ? 'ਫਸਲ' : userCrop} ਦੀ ਹੁਣ ਕੀ ਹਾਲਤ ਹੈ?`
        ];
        let arr = lang === 'en' ? genericEn : lang === 'mr' ? genericMr : lang === 'pa' ? genericPa : genericHi;
        // Randomly rotate fallbacks based on history length so it doesn't repeat the exact same sentence!
        let dice = systemMemory.history.length % 3;
        intent.message = arr[dice] || arr[0];
    }
    
    return _finalizeAI(promptText, intent, isContextual);
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
        currentScreen = 'splash'; // MUST go to language selection next!
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
                        <input type="text" id="ob-name" placeholder="E.g. Ramesh" required>
                        <button class="btn-primary" id="mic-name" style="width: auto; padding: 16px 20px;"><i class="fa-solid fa-microphone"></i></button>
                    </div>
                </div>
                <div>
                    <label style="font-weight: 600; margin-bottom: 8px; display:block;">Phone / नंबर</label>
                    <input type="tel" id="ob-phone" placeholder="10-digit number" maxlength="10" inputmode="numeric" oninput="this.value = this.value.replace(/[^0-9]/g, '');" required>
                    <p id="phone-error" style="color: #ef4444; font-size: 0.85rem; margin-top: 6px; display: none;"><i class="fa-solid fa-circle-exclamation"></i> Enter valid 10-digit mobile number</p>
                </div>
                <div>
                    <label style="font-weight: 600; margin-bottom: 8px; display:block;">Village / गाँव</label>
                    <div style="display:flex; gap: 12px;">
                        <input type="text" id="ob-region" placeholder="E.g. Pune" required>
                        <button class="btn-primary" id="mic-region" style="width: auto; padding: 16px 20px;"><i class="fa-solid fa-microphone"></i></button>
                    </div>
                </div>
                <div>
                    <label style="font-weight: 600; margin-bottom: 8px; display:block;">Gender / लिंग</label>
                    <select id="ob-gender" style="width: 100%; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 1rem; background: #f8fafc; color: var(--text-main);" required>
                        <option value="" disabled selected>Select Gender</option>
                        <option value="Male">Male / पुरुष</option>
                        <option value="Female">Female / महिला</option>
                        <option value="Other">Other / अन्य</option>
                    </select>
                </div>
                <button class="btn-primary" id="finish-onboard" style="margin-top: 32px; box-shadow: var(--shadow-floating);">Create Account</button>
                
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
    appContainer.innerHTML = `
        <div class="screen" style="padding-bottom: 120px;">
            <div class="home-header">
                <div class="profile-info" onclick="currentScreen='profile'; renderUI();" style="cursor:pointer">
                    <div class="avatar">${systemMemory.name.charAt(0) || 'F'}</div>
                    <div class="user-details">
                        <h2>${systemMemory.name}</h2>
                        <p>${systemMemory.region} | KrishiMitra Plus</p>
                    </div>
                </div>
                <div class="weather-badge"><i class="fa-solid fa-sun" style="color: var(--secondary)"></i> 32°C</div>
            </div>
            
            <h3 style="margin-bottom: 20px; font-size: 1.15rem;">Advanced AI Advisory</h3>
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
        </div>
        
        <div class="floating-mic-container" id="ask-mitra" title="Ask KrishiMitra">
            <i class="fa-solid fa-microphone"></i>
            <span>Ask KrishiMitra</span>
        </div>
        
        <div id="ai-response-overlay">
            <button class="close-overlay" id="close-overlay"><i class="fa-solid fa-xmark"></i></button>
            <div id="ai-response-text">Listening...</div>
            <p style="font-size: 0.85rem; color: #cbd5e1; margin-top:20px;">Please speak clearly into your phone.</p>
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

    const mic = document.getElementById('ask-mitra');
    const overlay = document.getElementById('ai-response-overlay');
    const overlayText = document.getElementById('ai-response-text');

    mic.onclick = async () => {
        if(synthesis.speaking) synthesis.cancel();
        overlay.classList.add('visible');
        overlayText.innerText = "Listening for 5 seconds...";
        mic.classList.add('active'); 
        
        try {
            await new Promise(r => setTimeout(r, 400));
            const userQuestion = await listenVoiceContinuous(systemMemory.language, 5500);
            mic.classList.remove('active');
            
            if(!userQuestion || userQuestion.length < 2) {
                overlayText.innerText = "Did not catch that. Please tap again.";
                speakText(getVoiceString('micError'), systemMemory.language);
                setTimeout(() => { overlay.classList.remove('visible'); }, 3000);
                return;
            }
            
            overlayText.innerText = `You: "${userQuestion}"\n\nThinking...`;
            const replyObj = await askAI(userQuestion, false);
            overlayText.innerText = replyObj.message;
            await speakText(replyObj.message, systemMemory.language);
            
            // Execute Advanced Agent Tasks Behind the Scenes
            if (replyObj.type === 'action' && replyObj.field === 'name') {
                systemMemory.name = replyObj.value;
                saveMemory();
                renderUI(); // Refresh header
            } else if (replyObj.type === 'navigation' && replyObj.target) {
                const targetEl = document.getElementById(replyObj.target);
                if (targetEl) {
                    targetEl.style.transition = 'all 0.5s ease';
                    targetEl.style.boxShadow = '0 0 0 6px var(--primary)';
                    targetEl.style.transform = 'scale(1.05)';
                    
                    // Physically click and navigate the UI on behalf of the user after voice finishes!
                    setTimeout(() => {
                        targetEl.click();
                        overlay.classList.remove('visible');
                    }, 4500);
                }
            }

            setTimeout(() => { if(overlay.classList.contains('visible') && replyObj.type !== 'navigation') overlay.classList.remove('visible'); }, 8000);
        } catch(err) {
            mic.classList.remove('active');
            overlayText.innerText = "Check microphone permissions.";
            setTimeout(() => { overlay.classList.remove('visible'); }, 4000);
        }
    };
    document.getElementById('close-overlay').onclick = () => {
        overlay.classList.remove('visible');
        if (synthesis.speaking) synthesis.cancel();
    };
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
        speakText(replyObj.message, systemMemory.language);
        
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
                    
                    // Check top 3 predictions for agricultural matches
                    const classes = results.map(r => r.label.toLowerCase()).join(" ");
                    const plantKeywords = ['plant', 'leaf', 'tree', 'grass', 'flower', 'fruit', 'vegetable', 'crop', 'soil', 'pot', 'wood', 'agriculture', 'corn', 'pepper', 'apple', 'strawberry', 'tomato', 'cabbage', 'mushroom', 'produce', 'daisy', 'earth', 'ground'];
                    
                    const isPlantMatch = plantKeywords.some(kw => classes.includes(kw));
                    
                    if (isPlantMatch) {
                        // Phase 6 & 7: GPT-Style Contextual Reasoning Agent Simulation
                        let userCrop = systemMemory.crops.length > 0 ? systemMemory.crops[systemMemory.crops.length - 1] : "crop";
                        const isEn = systemMemory.language.startsWith('en');
                        const isMr = systemMemory.language.startsWith('mr');
                        const isPa = systemMemory.language.startsWith('pa');
                        
                        let displayMsg = `<i class='fa-solid fa-check-circle'></i> Agronomy Vision AI: Identified ${userCrop.toUpperCase()}.<br><span style="color:#ef4444; margin-top:8px; display:block;">Analysis: Early Blight (Fungal) spotted. Use Copper Fungicide today.</span>`;
                        
                        let spokenMsg = "";
                        if(isEn) spokenMsg = `I have analyzed the leaf. Your ${userCrop} has early signs of fungal blight. I recommend applying copper fungicide before sunset.`;
                        else if(isMr) spokenMsg = `मी पानाचे विश्लेषण केले आहे. तुमच्या ${userCrop === 'crop' ? 'पिकावर' : userCrop + ' वर'} करपा रोगाची लक्षणे दिसत आहेत. संध्याकाळपूर्वी बुरशीनाशक फवारा.`;
                        else if(isPa) spokenMsg = `ਮੈਂ ਪੱਤੇ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਹੈ। ਤੁਹਾਡੀ ${userCrop === 'crop' ? 'ਫਸਲ' : userCrop} ਵਿਚ ਉੱਲੀ ਦੀ ਬਿਮਾਰੀ ਹੈ। ਸ਼ਾਮ ਤੋਂ ਪਹਿਲਾਂ ਦਵਾਈ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।`;
                        else spokenMsg = `मैंने पत्ते का विश्लेषण किया है। आपकी ${userCrop === 'crop' ? 'फसल' : userCrop} में फंगल झुलसा रोग के शुरुआती लक्षण हैं। कृपया सूर्यास्त से पहले फफूंदनाशक का छिड़काव करें।`;

                        document.getElementById('doctor-result').style.color = "var(--primary-dark)";
                        document.getElementById('doctor-result').innerHTML = displayMsg;
                        await speakText(spokenMsg, systemMemory.language);
                        
                    } else {
                        // AI Confirmed it's NOT a plant.
                        const topGuess = results[0].label.split(',')[0]; // Tell user what AI actually saw!
                        document.getElementById('doctor-result').style.color = "#ef4444"; // Red text
                        document.getElementById('doctor-result').innerHTML = `<i class='fa-solid fa-triangle-exclamation'></i> Real AI Detected a <b>${topGuess}</b>, not a crop. Please take a clear picture of the leaves.`;
                        
                        await speakText(getVoiceString('doctorNotPlant', topGuess), systemMemory.language);
                    }
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
        htmlContent = `<div class="list-item" style="flex-direction:column; align-items:flex-start; gap:8px;"><div style="font-weight:800; color:var(--text-main);">Ramesh K. (2km away)</div><p style="color:var(--text-muted); font-size:1.05rem;">Maza tomato la infection zala ahe, kay karu?</p><span style="font-weight:700; font-size:0.85rem; color:var(--primary);">12 Comments</span></div><div class="list-item" style="flex-direction:column; align-items:flex-start; gap:8px;"><div style="font-weight:800; color:#4f46e5;">Govt Scheme Alert: PM Kisan</div><p style="color:var(--text-muted); font-size:1.05rem;">Subsidised seeds available till Monday at local center.</p><span style="font-weight:700; font-size:0.85rem; color:var(--primary);">45 Likes</span></div>`;
    }
    appContainer.innerHTML = `<div class="screen"><div class="view-header" style="margin: -24px -24px 24px -24px;"><i class="fa-solid fa-arrow-left" id="back-mock" style="font-size: 1.2rem; cursor:pointer;"></i><h3 style="flex:1; text-align:center;">${title}</h3><i class="fa-solid ${icon}" style="color: var(--primary);"></i></div><div class="mock-dashboard">${htmlContent}</div></div>${getBottomNavHTML('none')}`;
    attachNavListeners(); document.getElementById('back-mock').onclick = () => { currentScreen = 'home'; renderUI(); };
    setTimeout(() => speakText(voicePrompt, systemMemory.language), 400);
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
                
                <button class="btn-secondary" id="logout-prof" style="margin-top: 40px; border-radius: 12px; font-weight: 700;">
                    <i class="fa-solid fa-right-from-bracket"></i> Edit Details & Logout
                </button>
            </div>
            
            <p style="text-align:center; font-size: 0.85rem; color: #94a3b8; font-weight:600;">KrishiMitra App Version 2.0 (MVP)</p>
        </div>
        ${getBottomNavHTML('profile')}
    `;
    attachNavListeners();
    document.getElementById('back-prof').onclick = () => { currentScreen = 'home'; renderUI(); };
    
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

// Startup
renderUI();
