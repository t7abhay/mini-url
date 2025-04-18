import express from "express";
import {
    createShortURL,
    redirectToOriginalUrl,
    getAllShortURLs,
} from "../controllers/url.controller.js";
import { verifyUser } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/all-url/:userId", getAllShortURLs);
router.post("/shorten-url", verifyUser, createShortURL);

router.get("/:shortId", redirectToOriginalUrl);

export default router;
