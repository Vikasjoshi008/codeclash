const express=require("express");
const dotenv=require('dotenv');
dotenv.config();
const cors=require('cors');
const connectDB= require("./config/db.js");
const authRoutes=require("./routes/auth/auth.js");
const app=express();
const port=5000;

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes)

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
