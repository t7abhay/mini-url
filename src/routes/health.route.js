import express from "express";

import { servicePinger } from "../servicePinger.js";

const router = express.Router();

router.get("/health", servicePinger);

export default router;
