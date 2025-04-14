import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
export const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

import urlRouter from "./routes/url.routes.js";
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/", urlRouter);
app.use("/api/v1/", userRouter);
