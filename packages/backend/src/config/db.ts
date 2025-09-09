import mongoose from "mongoose";
import config from "./index.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
};