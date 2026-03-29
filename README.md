# 🌾 KrishiMitra - India's First Voice-Native AI Farming Companion

KrishiMitra is an advanced, **voice-first decision-making companion** explicitly designed for India's rural farmers. 

Our core mission was to overcome the triple-threat of rural Indian agriculture: **Illiteracy, Language Barriers, and Poor Internet Connectivity.** By putting the power of local-device Artificial Intelligence into the hands of farmers, KrishiMitra guides them seamlessly through complex agricultural processes without requiring them to type a single word or rely on expensive, constant 4G connections.

---

## 📡 Internet Resiliency & Offline-First Architecture

A major architectural focus for this hackathon was building an application that **does not break when the internet goes down**. Indian farms often suffer from spotty or zero connectivity. 

We are incredibly close to a **100% offline-capable application**. By pushing Neural Networks and Natural Language Processing (NLP) models *directly to the user's browser*, we removed the dependency on paid cloud APIs (like ChatGPT or Google Cloud Vision).

### What Works WITHOUT Internet (Fully Offline) 📶❌
* **Crop Doctor Vision ML:** Camera scanning and leaf disease classification runs 100% locally via ML5.js / MobileNet.
* **Hybrid Intent Routing Engine:** Translating user voice/text into app navigation (e.g. knowing "mera tomato beemar hai" means "Open Crop Doctor").
* **Govt Scheme Engine:** Browsing, Eligibility Checking, and the Auto-Apply sequences.
* **Smart Follow-Up NLP:** The AI asking context-aware follow-up questions about disease duration and giving localized advice.
* **Local Onboarding & Memory:** Storing user name, crop types, language, and gender directly on device.
* **Feature Access:** Accessing Mock Profit Checkers, Community Forums, and Off-Grid Fallback Solutions (e.g., "Use Neem Spray").

### What Requires Internet (Online Mode) 📶✅
* **Voice-to-Text (STT):** Currently relies on the browser's native Web Speech API which pings Google servers to transcribe Hindi/Marathi perfectly. *(Future plan: Integrate an offline STT model like Whisper.cpp).*
* **Text-to-Speech (TTS):** Requires internet only to fetch the high-quality Neural / Natural sounding voices. Basic robotic voices work offline.
* **Live Mandi Prices & Weather:** Currently mocked in the MVP, but in production, these would require pinging an API to get the latest daily data.

---

## 🚀 Detailed Feature Breakdown

### 1. "Ask KrishiMitra" (Master AI Controller)
Users do not need to hunt through complex menus or search bars. A farmer simply presses the microphone and speaks naturally in their mother tongue: *"Mere fasal me daag hai"* or *"Mujhe yojana batao"*.
* **How it works:** A custom-built **Hybrid Intent Engine** parses phonetic phrases, keywords, and fuzzy-matching arrays locally. It calculates a confidence score and automatically navigates the application on behalf of the user. 
* **Smart Fallback:** If the user is offline and asks a complex question, the AI dynamically intercepts the network failure, alerting the farmer: *"Your internet is down, but my AI is still awake. Here are some offline solutions like Neem spray..."*

### 2. Context-Aware "Crop Doctor" (Offline Vision AI)
KrishiMitra runs **ML5.js (MobileNet)** seamlessly on the client side to inspect crops for diseases using the device's camera.
* **Smart Follow-ups:** It doesn't just stop at a static answer. The AI intelligently asks follow-up questions (e.g., *"How many days has this problem been here?"*).
* **Contextual Treatment:** If the farmer replies "2 days", the AI offers light treatment advice. If the farmer replies "10 days", it warns them that the infection is old and advises an immediate visit to a Krishi Kendra.
* **Double-Suggestion Fallback:** If the image is blurry, it refuses to guess blindly and tells the farmer to wipe their camera lens.

### 3. VIP Auto-Apply Govt Schemes
Illiteracy often blocks farmers from applying to crucial Government Schemes. KrishiMitra completely auto-drives this process.
* **The Ghost Form Filler:** The AI asks if the user wants to apply. If they say "yes", the system automatically opens the form, visually types in the farmer's registered land details on their behalf, checks the math for eligibility, and submits it.
* **Maximum Visibility:** It provides a massive, easily readable Success Confirmation, reading the financial benefit out loud to ensure the illiterate farmer understands the outcome.

### 4. Semantic Voice Personality
KrishiMitra isn't a robotic TTS engine. It is fully localized for **Hindi, Marathi, Punjabi, and English**. 
* **Custom Pacing:** The audio rate and pitch are adjusted specifically to sound warm and human.
* **Cultural Honorifics:** Based on the gender selected during onboarding, the AI affectionately refers to the farmer by local culturally-appropriate honorifics (Bhaiya/Didi/Bhau/Tai) when delivering medical advice.

### 5. Daily Agri-Tools (Sell Smart & Protect)
A suite of tools designed to protect farmer livelihoods:
* **Sell Smart (Mandi Prices):** Live tracking of nearest market rates to prevent middlemen exploitation.
* **Profit Checker:** A visual graph estimating crop yield profits vs pesticide expenses.
* **Weather AI Alerts:** Active warnings (e.g., *"Heavy rain expected at 4 PM. Do NOT spray fertilizer today."*)

---

## 🛠️ Technical Stack
* **Frontend:** HTML5, CSS3 (Custom Glassmorphism & UI Micro-animations)
* **Logic Engine:** Vanilla JavaScript (ES6)
* **Speech Integration:** Native Web Speech API (STT & TTS)
* **Vision AI:** ml5.js (TensorFlow.js wrapper running MobileNet client-side)
* **Database:** `localStorage` for cross-session offline memory and state tracking.
* **Zero APIs:** 100% Client-Side execution. No API Keys required, ensuring zero backend costs for deployment.

## 🏃🏽‍♂️ How to Run Locally

*Note: Because Chrome strictly blocks Microphone and Camera APIs on raw `file://` protocols, you must serve this application over a local HTTP server for the Voice/AI features to function correctly.*

1. Clone the repository to your host machine.
2. Open a terminal in the project directory.
3. Run a simple local web server. For example:
   * Python: `python -m http.server 8000`
   * Node: `npx serve`
4. Open your browser and navigate to `http://localhost:8000`.
5. *Accept the browser permissions for Microphone and Camera when prompted.*

## 🏆 The Golden Rule
> **"The user should never search — the system should guide."**
