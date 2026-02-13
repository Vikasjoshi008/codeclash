const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

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
const port = process.env.PORT || 5000;

/* ---------- MIDDLEWARE ---------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://codeclash-three.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// VERY IMPORTANT
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://codeclash-three.vercel.app"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  next();
});


app.use(express.json());

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/execute", executeRoutes);
app.use("/api/1v1", onevsoneRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/matches", matchRoutes);

app.get("/", (req, res) => {
  res.send("codeclash server is running");
});

/* ---------- SOCKET SETUP ---------- */

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "https://codeclash-three.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

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
