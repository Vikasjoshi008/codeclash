const mongoose=require('mongoose');
const uri=process.env.MONGO_URI

const connectDB=async() => {
    try {
        mongoose.connect(uri);
        console.log("Database conneted");
    } catch(err) {
        console.log(err);
    }
}

module.exports = connectDB;