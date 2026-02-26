# ⚔️ CodeClash – Real-Time 1v1 Coding Battles

CodeClash is a full-stack competitive coding platform where users can practice coding problems or challenge other developers in **real-time 1v1 coding battles**.  
It features live matchmaking, code evaluation, timers, ELO ranking, and a modern code editor experience.

---

## 🚀 Live Demo
https://codeclash-three.vercel.app  

---

## ✨ Features

### 🧠 Practice Mode
- Solve coding problems by **language & difficulty**
- Real test-case based evaluation
- Track solved problems in dashboard

### ⚔️ 1v1 Code Battle (Real-Time)
- Live matchmaking using **Socket.IO**
- Ready system before match starts
- Shared problem, same difficulty
- Live submission status (opponent submitted)
- Countdown timer
- Automatic match finish
- Winner decided by:
  1. Test cases passed
  2. Time taken (tie-breaker)

### 🏆 Ranking & Stats
- **ELO rating system**
- Win / loss tracking
- Match history & summaries

### ✍️ Code Editor
- Monaco Editor (VS Code-like experience)
- Multi-language support (Python, JavaScript, Java)

### 📱 Responsive UI
- Desktop & mobile friendly
- No horizontal scrolling on mobile
- Animated UI states (searching, matched, finished)

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Socket.IO Client
- Monaco Editor
- Axios / Fetch API

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- Custom Code Judge (Piston / Sandbox based)

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

---

## 🔐 Authentication
- JWT authentication
- Protected routes (practice, dashboard, 1v1)
- Token stored securely in browser storage

---

## 🧪 Code Evaluation
- Each problem has:
  - Starter code
  - Test cases
  - Judge enabled flag
- Code is executed securely
- Results returned as:
  - Passed test cases
  - Total test cases
  - Execution time

---

## 📁 Project Structure (Simplified)

<img width="305" height="516" alt="image" src="https://github.com/user-attachments/assets/77739e54-93eb-4c58-9a33-d668a58d24d6" />

---

▶️ Run Locally<br>
Backend <br>
cd server<br>
npm install<br>
npm run dev

Frontend<br>
cd client<br>
npm install<br>
npm run dev

---

🎯 Future Improvements<br>
Spectator mode for 1v1 battles<br>
Chat during match<br>
More languages support<br>
Leaderboards<br>
Custom contests<br>

👨‍💻 Author<br>
Vikas Joshi<br>
Full-Stack Developer<br>
📌India<br>
