const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const http = require("http");               // ✅ ADD
const { Server } = require("socket.io");    // ✅ ADD

const connectDB = require("./config/db.js");

const authRoutes = require("./routes/auth/auth.js");
const questionsRoutes = require("./routes/questions.js");
const progressRoutes = require("./routes/progress.js");
const executeRoutes = require("./execution/execute.js");
const historyRoutes = require("./routes/history.js");
const onevsoneRoutes = require("./routes/OnevsOne.js");
const problemRoutes = require("./routes/problem.js");
const matchRoutes = require("./routes/matches.js"); 

const app = express();
const port = 5000;

/* ---------- MIDDLEWARE ---------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://codeclash-three.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// VERY IMPORTANT: allow preflight
app.use(express.json());

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/execute", executeRoutes);
app.use("/api/1v1", onevsoneRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/matches", matchRoutes)


app.get("/", (req, res) => {
  res.send("codeclash server is running");
});

/* ---------- SOCKET SETUP ---------- */

// ✅ CREATE HTTP SERVER
const server = http.createServer(app);


// ✅ ATTACH SOCKET.IO
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ["websocket"] // 🔥 ADD THIS
});

// ✅ LOAD MATCHMAKING SOCKET LOGIC
require("./socket/matchmaking.js")(io);

/* ---------- START SERVER ---------- */
server.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  try {
    await connectDB();
  } catch (err) {
    console.error(err);
  }
});
