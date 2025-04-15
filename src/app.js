import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import session from "express-session";
import cors from "cors";

export const app = express();
app.set("trust proxy", 1); // Fixes the express-rate-limit error

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: "Rate limited",
});
app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    })
);

const corsConfig = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
};

app.use(limiter);
app.use(cors(corsConfig));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cookieParser());
app.use(morgan("dev"));

import urlRouter from "./routes/url.routes.js";
import userRouter from "./routes/user.routes.js";
import healthRouter from "./routes/health.route.js";
app.use("/api/v1/", urlRouter);
app.use("/api/v1/", userRouter);
app.use("/api/v1/", healthRouter);
