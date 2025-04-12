import dotenv from "dotenv";
import { connectDB } from "./config/DB/dbConnect.js";
import { app } from "./app.js";
import { servicePinger } from "./servicePinger.js";

dotenv.config({
    path: "./env",
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`\nServer is listening on: ${process.env.PORT}\n`);

            servicePinger();
        });
    })
    .catch((error) => {
        console.error("Error: ", error);
    });
