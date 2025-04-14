import { asyncHandler } from "../utilities/asynchandler.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { ApiError } from "../utilities/ApiError.js";
import { axiosInstance } from "../config/axios/axiosInstance.js";
import { sanitizeInput } from "../utilities/sanitizeInput.js";
import cookie from "cookie";
export const registerUser = asyncHandler(async (req, res, next) => {
    const { username, email, password } = sanitizeInput(req.body);

    if (!email || !password || !username) {
        throw new ApiError(400, "All fields are required");
    }

    const data = { username, email, password };

    await axiosInstance
        .post("/register", data)
        .then((authResponse) => {
            const user = authResponse.data;

            return res
                .status(201)
                .json(
                    new ApiResponse(200, user, "User registered successfully")
                );
        })
        .catch((error) => {
            const status = error.response?.status || 500;
            const message =
                error.response?.data?.message || "Registration failed";
            return res.status(status).json({ status, message });
        });
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = sanitizeInput(req.body);

    if (!email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const data = { email, password };

    try {
        const authResponse = await axiosInstance.post("/login", data, {
            withCredentials: true,
        });

        const user = authResponse.data?.data?.user;
        const setCookies = authResponse.headers["set-cookie"];

        const options = {
            httpOnly: true,
            // secure: true,
            // sameSite: "None", // Uncomment when deploying
        };

        if (setCookies && Array.isArray(setCookies)) {
            setCookies.forEach((cookieStr) => {
                const parsed = cookie.parse(cookieStr);
                for (const [name, value] of Object.entries(parsed)) {
                    res.cookie(name, value, options);
                }
            });
        }

        return res
            .status(200)
            .json(new ApiResponse(200, user, "Login successful"));
    } catch (error) {
        console.log(error);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || "Login failed";
        return res.status(status).json({ status, message });
    }
});

export const logOutUser = asyncHandler((req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    axiosInstance
        .post("/logout")
        .then(() => {
            res.clearCookie("accessToken", options);
            res.clearCookie("refreshToken", options);

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        null,
                        refreshToken
                            ? "Logged out successfully"
                            : "User already logged out"
                    )
                );
        })
        .catch((error) => {
            const status = error.response?.status || 500;
            const message = error.response?.data?.message || "Logout failed";
            return res.status(status).json({ status, message });
        });
});
