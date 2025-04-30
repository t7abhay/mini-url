import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_CONNECTION_URL}/${process.env.DB_NAME}${process.env.DB_CONNECTION_OPTIONS}`
        );
        console.log(
            `\nConnection  with MongoDb successfull 🍎 DB HOST: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.error("Failed to connect with database", error);

        process.exit(1);
    }
};
