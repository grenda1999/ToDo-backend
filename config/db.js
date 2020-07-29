const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");
const infoColors = require("./chalk/variables")

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        });
        console.log(infoColors.success("MongoDB connected..."));
    } catch (error) {
        console.error(infoColors.error(error));
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;