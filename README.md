# 💖 Operation: Rescue Motku
### A Personalized Romantic Anniversary Game for Arijit & Ayantika

**Operation: Rescue Motku** is a 3D endless runner inspired by Temple Run, featuring personalized Bengali relationship memories, comical villain chase, stylized mock 3D avatars, Web Audio synthesized romantic music, and an emotional ending featuring our exact couple photo collage.

---

## 🎮 Game Story & Characters

- **Hero: Arijit ("Ghengis Khan")**: Young Bengali man with short black hair, black glasses, friendly face, mischievous smile, and maroon kurta with traditional kantha embroidery and backpack straps.
- **Heroine: Ayantika ("Motku")**: Young Bengali woman with black hair, black glasses, and maroon sari with a blue-grey striped border/pallu.
- **Villain: Assistant HOD**: Strict professor who disapproves of romance with his catchphrase:  
  *“Eishob prem tem chere porashona koro”*

---

## 🕹️ Controls

### Desktop:
- **Lane Switching**: `Left / Right Arrow` or `A / D`
- **Jump**: `Up Arrow`, `W`, or `Space` (jump over logs and low walls)
- **Slide**: `Down Arrow` or `S` (slide under low hanging branches and magical gates)
- **Pause / Resume**: `P` or `Esc`

### Mobile / Android:
- **Swipe Left / Right**: Change lanes
- **Swipe Up**: Jump
- **Swipe Down**: Slide
- **On-Screen Touch Buttons**: Left, Right, Jump, Slide buttons at the bottom of the screen.

---

## 💌 Relationship Quiz Checkpoints

- **Default Checkpoint Interval**: 60 seconds (production).
- **Developer / Testing Interval**: 10 seconds (can be toggled directly in the HUD by clicking `⏱️ 60s` / `⏱️ 10s`).
- **5 Confirmed Questions**:
  1. *When did Arijit first meet Ayantika?* -> **28 February 2025 (C)**
  2. *What is the first thing we ate together?* -> **momo (A)**
  3. *What is the first text Ayantika has sent to Arijit?* -> **`7044987173`** (Text input, trims whitespace)
  4. *How much money did Arijit pay to the eunuchs on his first date with Ayantika in Rabindra Sarobar?* -> **none (C)**
  5. *When is the first time we said I love you over text?* -> **3rd Sep 2025 (B)**

### Responses:
- **Correct**: Romantic sound chime, animated hearts burst, and one of:
  - *“Tui koto bhalo 🥹❤️”*
  - *“Mitti chele 😚💗”*
  - *“Baby kothakar 💋💕”*
  - *“I love youuuuu 😭❤️🔥”*
- **Incorrect**: Game Over screen with:
  - *“Amake ekdom bhalobashena 😭💔”*
  - *“Oshobbho 😤🥀”*
  - *“Baje 😔💔”*
- **After Question 5**:
  - *“Five memories down, forever to go! ❤️”* followed by the final rescue sequence!

---

## 📸 Exact Photo Collage & Ending

The ending displays the exact uploaded photo collage located at:
`public/assets/anniversary-collage.jpeg`
accompanied by the exact anniversary messages:
- **“Happy 14th months, I love you more than you love me !!!!”**
- **“Forever your Ayantika ♡”**

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Run automated tests (verifies questions, answers, and assets)
npm test

# Start local development server
npm run dev
```

Visit `http://localhost:3000/` in your browser.

---

## 🌐 Free Static Deployment

The project is completely self-contained and pre-configured with relative base paths (`base: './'` in `vite.config.js`).

### Option A: GitHub Pages
1. Push the code to a GitHub repository.
2. Run `npm run build`.
3. In GitHub repo settings -> **Pages** -> Deploy from branch (select `gh-pages` or `/dist` folder).

### Option B: Netlify / Vercel
1. Drag and drop the `dist/` folder directly to [Netlify Drop](https://app.netlify.com/drop).
2. It goes live instantly for free with HTTPS!
