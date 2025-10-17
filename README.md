# NebulaMind: 35 Trials

A high-polish **HTML5 quiz game** with **FastAPI (Python)** and **Express (Node.js)** backends — **35 escalating levels**, lifelines (**50/50**, **Best Two**, **Audience Preference**), animated UI with **GSAP**, background music/SFX, prize ladder, and an **end-screen IQ estimate**.

<p align="center">
  <img alt="NebulaMind Cover" src="https://user-images.githubusercontent.com/placeholder/nebula-cover.png" width="820">
</p>

<p align="center">
  <a href="https://github.com/Shahriyarrrrr/NebulaMind-35-Trials/actions"><img alt="CI" src="https://img.shields.io/badge/build-pass-brightgreen"></a>
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue">
  <img alt="Made with" src="https://img.shields.io/badge/made%20with-HTML5%20%7C%20JS%20%7C%20Python%20%7C%20Node.js-orange">
</p>

---

## ✨ Features

- **Age Gate (18+)** with name + gamer tag capture.
- **Avatar Picker** (5 built-in avatars; easily replace with your art).
- **Animated Questions** using GSAP + glassmorphism UI.
- **Lifelines** (1 use each per game):
  - **50/50** — removes two incorrect options.
  - **Best Two** — highlights two likely options (includes the correct one).
  - **Audience Preference** — simulated vote distribution via the Node service.
- **35 Levels** — difficulty ramps; prize ladder increases per level.
- **Instant Game Over** on wrong answer with a configurable message.
- **IQ Estimate** at the end based on level reached + speed bonus.
- **Lightweight Backends**:
  - **FastAPI** serves questions, session start, and answer validation.
  - **Express** simulates audience votes with difficulty-aware skew.

---

## 🧱 Project Structure

nebula-mind/
├─ client/
│ ├─ index.html # UI layout and wiring
│ ├─ styles.css # Glass UI + responsive layout
│ ├─ app.js # Game logic, lifelines, animations, audio
│ └─ assets/
│ ├─ music.mp3 # background music (replace with your track)
│ ├─ correct.mp3 # correct answer sfx
│ ├─ wrong.mp3 # wrong answer sfx
│ ├─ click.mp3 # UI click sfx
│ └─ avatars/
│ ├─ avatar1.png … avatar5.png
├─ server-python/
│ ├─ main.py # FastAPI app (start, question, answer endpoints)
│ └─ requirements.txt # fastapi, uvicorn, pydantic
├─ server-node/
│ ├─ index.js # Express service (/api/audience)
│ └─ package.json # express, cors
└─ README.md


---

## 👤 Author

Built by [**Shahriyarrrrr**](https://github.com/Shahriyarrrrr).

---

## 🚀 Quick Start

> **Prerequisites**: Python 3.10+ and Node 18+ installed.  
> All commands shown for **Windows CMD**; adjust to your shell if needed.

### 1) Start the Python API (FastAPI)

```bat
cd /d "D:\NebulaMind 35 Trials\server-python"
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
Test in browser: http://127.0.0.1:8000/docs


### 2) Start the Node Audience Service
cd /d "D:\NebulaMind 35 Trials\server-node"
npm install
npm start

Test in browser: http://127.0.0.1:3000/api/audience?v=2&level=5

3) Serve the Client
cd /d "D:\NebulaMind 35 Trials"
python -m http.server 5500
Open: http://localhost:5500/client/

Note: The client points to http://127.0.0.1:8000 and http://127.0.0.1:3000 by default. If you change ports or hosts, update these in client/index.html:

<script>
  window.API_BASE = 'http://127.0.0.1:8000';
  window.AUDIENCE_BASE = 'http://127.0.0.1:3000';
</script>

🕹️ How to Play

1. Enter Name, Gamer Tag, and Age (must be 18+).

2. Pick an avatar and domain (Mixed, GK, Math & Logic, Tech, Science).

3. Click Start. Each correct answer advances to the next level and increases your prize.

4. Use lifelines wisely (each can be used once per game).

5. A wrong answer ends the game immediately (message is configurable).

6. See your IQ estimate and total prize on the result screen.

