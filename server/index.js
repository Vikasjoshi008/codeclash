const dotenv=require('dotenv');
dotenv.config();
const express=require("express");
const cors=require('cors');
const connectDB= require("./config/db.js");
const authRoutes=require("./routes/auth/auth.js");
const aiRoutes=require("./routes/practice/practiceOnline.js");
const questionsRoutes=require("./routes/questions.js");
const progressRoutes=require("./routes/progress.js");
const executeRoutes=require("./routes/execute.js");
const app=express();
const port=5000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/execute", executeRoutes);


app.get("/", (req, res) => {
    res.send("codeclash server is running");
});

app.listen(port, () => {
    console.log(`server is listening to port ${port}`);
    try {
        connectDB();
    } catch(err) {
        console.log(err);
    }
});
