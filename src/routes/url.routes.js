import express from "express";
import {
    createShortURL,
    redirectToOriginalUrl,
} from "../controllers/url.controller.js";

const router = express.Router();

router.post("/shorten-url", createShortURL);

router.get("/:shortId", redirectToOriginalUrl);

export default router;
