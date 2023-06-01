import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()


async function dbConnect() {
    mongoose
        .connect(process.env.DB_URI)
        .then(() => {
            console.log("Successfully connected to MongoDB!");
        })
        .catch((error) => {
            console.log("Unable to connect to MongoDB!");
            console.error(error);
        });
}

export default dbConnect;