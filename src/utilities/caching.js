import Valkey from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const serviceUrl = process.env.AIVEN_VALKEY_URL;

export const valKey = new Valkey(serviceUrl);

process.on("SIGINT", async () => {
    console.log("Disconnecting cache...");
    await valKey.disconnect();
    process.exit(0);
});
