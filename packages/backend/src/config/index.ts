import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 3001,
  mongoUri: process.env.MONGODB_URI || "",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
};

export default config;