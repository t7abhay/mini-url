import express from "express";
import {
    createShortURL,
    redirectToOriginalUrl,
    getAllShortURLs,
} from "../controllers/url.controller.js";
import { verifyUser } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/all-urls/", verifyUser, getAllShortURLs);
router.post("/shorten-url", verifyUser, createShortURL);

router.get("/:shortId", redirectToOriginalUrl);

export default router;
