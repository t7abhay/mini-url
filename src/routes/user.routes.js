import express from "express";

import {
    registerUser,
    loginUser,
    logOutUser,
    changePasword,
    fetchProfile,
} from "../controllers/user.controller.js";

const router = express.Router();
router.get("/me/profile", fetchProfile);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logOutUser);
router.post("/change-password", changePasword);

export default router;
