import jwt from "jsonwebtoken";
import { ApiError } from "../utilities/ApiError.js";

export const verifyUser = (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        throw new ApiError(401, "Unauthorized - No token provided");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        throw new ApiError(403, "Invalid or expired token");
    }
};
