import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import session from "express-session";
import cors from "cors";

import memorystore from "memorystore";

const MemoryStore = memorystore(session);

export const app = express();

app.set("trust proxy", 1); // Fixes the express-rate-limit error
app.use(morgan("dev"));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: "Rate limited",
});
app.use(
    session({
        secret: process.env.SESSION_SECRET || "keyboard cat",
        resave: false,
        saveUninitialized: true,
        store: new MemoryStore({ checkPeriod: 86400000 }),
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 86400000, // 1 day
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

import urlRouter from "./routes/url.routes.js";
import userRouter from "./routes/user.routes.js";
import healthRouter from "./routes/health.routes.js";

app.use("/api/v1/", userRouter);
app.use("/api/v1/", healthRouter);
app.use("/api/v1/", urlRouter);
