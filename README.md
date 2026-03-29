# 🌾 KrishiMitra — India’s First Voice-Native AI Farming Companion (Works Offline)


## 🚨 The Core Problem: Why This is Critical to Build
India has over **150+ million farmers**, yet the vast majority of AgriTech applications fail to reach the people who need them most. Why? 
Because traditional apps make three highly flawed assumptions about rural India:
1. **The Literacy Assumption:** They expect farmers to read complex menus and type out their problems.
2. **The Connectivity Assumption:** They expect uninterrupted, high-speed 4G internet out in the crop fields.
3. **The User Experience Assumption:** They expect rural users to intuitively understand layered software architectures (dashboards, forms, settings).

**KrishiMitra completely destroys these assumptions.** 
It is a **Voice-Operated, Offline-Resilient, Zero-Typing AI Companion**. The user never has to search or type; they simply talk to the application in their native tongue, and the system guides them visually and audibly.

---

## 🌾 Impact & Vision

India has 140+ million farmers, many of whom struggle with complex and non-user-friendly digital tools.

KrishiMitra aims to change this.

With its voice-first and low-internet design, it has the potential to empower millions of farmers by turning complex agricultural decisions into simple conversations. Even if adopted by just 10% of farmers, it can impact 14+ million lives.

Not just a hackathon project — a scalable solution built for Bharat, designed for real farmers of india . 🌱

---

## 🚀 Deep Technical Feature Breakdown (The "WOW" Factor)

### 1. "Ask KrishiMitra" Master AI Controller (Zero-Tap Navigation)
* **The Concept:** A universal voice assistant that understands intent and navigates the app for the illiterate user.
* **How to Interact:** Tap the glowing microphone button floating at the bottom of the screen. Speak naturally in your selected native language (e.g., *"Mere fasal me daag hai"* / *"My crop has spots"*, or *"Yojana batao"*).
* **How It Works (Under the Hood):** Instead of relying on expensive, paid APIs like ChatGPT which fail without internet, we built a **Hybrid NLP Intent Engine directly inside the JavaScript bundle**. It parses phonetic variations, multi-lingual phrases (Hindi, Marathi, Punjabi, English), and fuzzy-matches them against a local dictionary to calculate a confidence score. The system then automatically triggers a visual UI redirect on behalf of the user.

### 2. Context-Aware "Crop Doctor" (Edge Vision AI)
* **The Concept:** An instant, offline medical diagnosis and treatment plan for diseased crops seamlessly integrated with conversational follow-ups.
* **How to Interact:** Navigate to Crop Doctor (or just ask the mic for it). Tap "Snap Photo" to use your camera. Once the AI identifies the disease, it will verbally ask you: *"Aapko ye problem kitne din se hai?"* (How many days has this problem been here?). Tap the mic and reply with a number (e.g., *"2 din se"*).
* **How It Works (Under the Hood):** We compiled **ML5.js (TensorFlow.js MobileNet)** to run 100% on the client's device (Edge AI). No images are ever uploaded to a server, ensuring 0ms latency. Furthermore, KrishiMitra maintains a *Conversational State Machine*. If the farmer replies "2 days", the logic prescribes a light Neem spray. If they reply "10 days", it warns of severe infection and triggers a Krishi Kendra alert.

### 3. "Ghost" Form Filler: VIP Auto-Apply for Govt Schemes
* **The Concept:** Government schemes provide thousands of rupees in subsidies, but illiterate farmers cannot fill out the digital paperwork. We automate this.
* **How to Interact:** Navigate to the Govt Schemes page (or ask the mic to apply for a scheme like *"PM Kisan apply"*). The AI will ask for confirmation. Say *"Haan"* (Yes). Sit back and watch the AI type on the screen for you.
* **How It Works (Under the Hood):** We orchestrated an automated DOM-manipulation sequence ("Ghost Typing"). The system pulls registered data (Land Size, Region, Crop Type) from local `systemMemory`, visually types it into the UI on the farmer's behalf line-by-line, calculates the complex eligibility math, and renders a massive, accessible Success screen while reading the financial benefit out loud.

### 4. Zero-Internet Resiliency (Real India Problem)
* **The Concept:** The app must not "crash" or show a white page when network towers fail deep in the fields.
* **How to Interact:** Turn off your Wi-Fi/Mobile Data. Tap the mic and ask for general help. 
* **How It Works (Under the Hood):** KrishiMitra actively hooks into the `navigator.onLine` browser API. If a farmer asks a question while disconnected from the grid, the NLP Engine intercepts the failure state and dynamically falls back to a massive pre-loaded local knowledge base, delivering immediate offline remedies like watering schedules or organic pesticide mixtures.

### 5. Semantic Voice Personality & Cultural Honorifics
* **The Concept:** The Voice AI must build psychological trust by sounding like a respectful local companion, not a robotic terminal.
* **How to Interact:** Select your gender and language during the onboarding screen. The AI will automatically refer to you respectfully during conversations.
* **How It Works (Under the Hood):** We tapped directly into the native Web SpeechSynthesis API, manipulating specific `pitch=1.1` and `rate=0.9` audio frequency bands to generate warmer tonal deliveries. User profiling dynamically maps local cultural honorifics (`Bhaiya`, `Didi`, `Bhau`, `Tai`, `Bhaji`) into the synthesized speech output based on local custom arrays.

---

## 📡 Strict Offline vs Online Deployment Architecture

| Feature Engine | Network Status | Technical Execution |
| :--- | :--- | :--- |
| **Crop Doctor Vision ML** | `Fully OFF-GRID` | Runs locally via ML5.js & MobileNet weights cached in browser. |
| **Hybrid Intent Engine** | `Fully OFF-GRID` | Custom RegEx/Fuzzy NLP parser executes entirely in local JS loop. |
| **Smart AI Follow-Ups** | `Fully OFF-GRID` | `localStorage` state management controls follow-up logic natively. |
| **Voice-to-Text (STT)** | `Requires 3G/4G` | Temporarily relies on Web Speech API mapping to Google Voice servers to ensure perfect regional dialect transcriptions. |
| **Live Mandi / Weather** | `Requires 3G/4G` | Real-time pricing inherently requires pinging a live remote dataset in production. |

---

## 🔮 Future Scope (100% Offline Expansion)
While our Engine and UI are already decoupled from cloud reliance, our next immediate roadmap objective is to push **extensive, localized datasets for all features directly onto the device firmware**.
* **Offline STT Models:** Integrating compiled `Whisper.cpp` or Mozilla DeepSpeech WASM models directly into the browser cache. This will allow the Voice-to-Text inference to run locally, severing the final tether to 4G connectivity.
* **Offline Mandi/Weather Caching:** Pre-fetching massive 7-day cyclical agro-economic data packets during brief moments of connectivity (e.g. when the farmer is near a town cell tower) so the Sell Smart and Weather features function smoothly and 100% offline when the farmer returns deep into the fields.

---

## 🛠️ Stack & Innovation Summary
* **Frontend:** Fully responsive HTML5/CSS3 with Glassmorphism and hardware-accelerated micro-animations.
* **Logic / AI Tier:** ES6 Vanilla JavaScript utilizing local arrays, ML5.js Computer Vision, and Web Speech API bindings.
* **Cloud Costs:** **$0.00** – Client-Side execution means zero scalable server costs for AI inference, making this infinitely deployable at scale to millions of Indian farmers.

## 🏃🏽‍♂️ How to Run the Demo locally

*Note: Chromium architecture strictly blocks Microphone and Camera APIs on raw `file://` protocols. You must serve this application over a local HTTP server for the AI sensors to wake up.*

1. Clone the repository.
2. Spin up a local development server:
   * Python: `python -m http.server 8000`
   * Node: `npx serve`
3. Hit `http://localhost:8000` in Google Chrome or Microsoft Edge.
4. *Approve Microphone & Camera permissions.*
5. **Start Talking!**
