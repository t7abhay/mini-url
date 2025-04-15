import schedule from "node-schedule";
import axios from "axios";

export const servicePinger = () => {
    schedule.scheduleJob("*/12 * * * *", async () => {
        try {
            const res = await axios.get(
                "https://mini-url-r9hg.onrender.com/api/v1/health"
            );
            if (res.status === 200) {
                console.log("🔁 Ping successful");
            } else {
                console.log(`⚠️ Ping responded with status: ${res.status}`);
            }
        } catch (err) {
            console.error("❌ Ping failed:", err.message);
        }
    });
};
