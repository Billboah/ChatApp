import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI environment variable is not set");
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Error: ${error.message}`);
    } else {
      console.log("Unknown error during DB connection", error);
    }
    process.exit();
  }
};

export default connectDB;
