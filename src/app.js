import express from "express";
import responseTime from "response-time";

export const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

import urlRouter from "./routes/url.routes.js";
import userRouter from "./routes/user.routes.js";
app.use(responseTime());
app.use("/api/v1/", urlRouter);
app.use("/api/v1/", userRouter);
