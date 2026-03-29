# 🌾 KrishiMitra - India's First Voice-Native AI Farming Companion

KrishiMitra is not just an application; it is an offline-capable, **voice-first decision-making companion** explicitly designed for India's rural farmers. 

Built to overcome literacy barriers, low-internet connectivity, and the complexity of modern agronomy, KrishiMitra uses hybrid on-device AI to guide farmers organically—empowering them without requiring them to type a single word.

## 🚀 Key Innovation Highlights

### 1. Master AI Controller (Voice First Navigation)
Users do not need to hunt through menus. A farmer simply presses the microphone and speaks naturally in their mother tongue: *"Mere fasal me daag hai"* or *"Mujhe yojana batao"*.
Our custom-built **Hybrid Intent Engine** parses the phonetic and localized phrasing, automatically navigating the application visually for the user. 
*No typing. No searching. Just talking.*

### 2. Context-Aware "Crop Doctor" (Offline Vision AI)
KrishiMitra runs **ML5.js (MobileNet)** seamlessly on the client side to inspect crops for diseases using the device's camera. 
* **Smart Follow-ups:** It doesn't just stop at an answer. The AI intelligently asks follow-up questions (e.g., *"How many days has this problem been here?"*) and dynamically adjusts its treatment advice based on the farmer's audio response (early vs late-stage treatment).

### 3. Automated "Ghost" Form Filler
Illiteracy often blocks farmers from applying to crucial Govt Schemes. KrishiMitra's **VIP Auto-Apply** completely automates this. The AI automatically highlights the scheme, opens the eligibility form, visually types in the farmer's registered land details on their behalf, checks eligibility, and provides a massive, easily readable Success Confirmation, reading the financial benefit out loud.

### 4. Zero Internet Resiliency
Indian farms suffer from poor connectivity. **KrishiMitra is an Offline-First app.** 
If a user asks a complex question while offline, the AI dynamically intercepts the network failure, alerting the farmer: *"Your internet is down, but my AI is still awake. Here are some offline solutions like Neem spray..."*

### 5. Multi-Lingual & Voice Personality
Fully localized interfaces, dictionaries, and Voice API synthesizers for **Hindi, Marathi, Punjabi, and English**. The Assistant speaks with a uniquely warm pitch and rate, affectionately referring to the farmer by local culturally-appropriate honorifics (Bhaiya/Didi/Bhau) based on their registered gender.

---

## 🛠️ Technical Stack
* **Frontend:** HTML5, CSS3 (Custom Glassmorphism & Micro-animations)
* **Logic Engine:** Vanilla JavaScript (ES6)
* **Speech Integration:** Native Web Speech API (SpeechRecognition STT & SpeechSynthesis TTS)
* **Vision AI:** ml5.js (TensorFlow.js wrapper running MobileNet locally)
* **No Server Required:** 100% Client-Side execution. No API Keys required.

## 🏃🏽‍♂️ How to Run Locally

*Note: Because Chrome strictly blocks Microphone and Camera APIs on raw `file://` protocols, you must serve this application over a local HTTP server for the Voice/AI features to function correctly.*

1. Clone the repository.
2. Open a terminal in the project directory.
3. Run a simple local web server. For example:
   * Python: `python -m http.server 8000`
   * Node: `npx serve`
4. Open your browser and navigate to `http://localhost:8000`.
5. *Accept the browser permissions for Microphone and Camera.*

## 🏆 The Golden Rule
> **"The user should never search — the system should guide."**
