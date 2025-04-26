import { asyncHandler } from "../utilities/asyncHandler.js";
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

    try {
        const authResponse = await axiosInstance.post(
            "/login",
            { email, password },
            {
                withCredentials: true,
            }
        );

        const accessToken = authResponse.data?.data.accessToken;
        const refreshToken = authResponse.data?.data.refreshToken;

        const user = {
            username: authResponse?.data?.data.user.username,
            roleId: authResponse?.data?.data.user.roleId,
            roleName: authResponse?.data?.data.user.role.roleName,
        };

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            // secure: true,
            sameSite: "None",

            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };

        res.cookie("refreshToken", refreshToken, cookieOptions);
        res.cookie("accessToken", accessToken, cookieOptions).status(200).json(
            new ApiResponse(
                200,
                {
                    user,
                    accessToken,
                },
                "Login successful"
            )
        );
    } catch (error) {
        console.error(error);
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

export const changePassword = asyncHandler(async (req, res) => {
    const { newPassword, currentPassword } = sanitizeInput(req.body);

    if (!newPassword || !currentPassword) {
        throw new ApiError(400, "All fields are required");
    }

    const data = { newPassword, currentPassword };

    try {
        const authResponse = await axiosInstance.post(
            "/change-password",
            data,
            {
                headers: {
                    Authorization: `Bearer ${req.cookies.accessToken}`,
                },
                withCredentials: true,
            }
        );

        const user = authResponse.data?.data?.user;
        const setCookies = authResponse.headers["set-cookie"];

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
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
            .json(new ApiResponse(200, user, "Password Changed"));
    } catch (error) {
        console.error(error);
        const status = error.response?.status || 500;
        const message =
            error.response?.data?.message || "Password change failed";
        return res.status(status).json({ status, message });
    }
});

export const fetchProfile = asyncHandler(async (req, res) => {
    try {
        const authResponse = await axiosInstance.get("/profile", {
            headers: {
                Authorization: `Bearer ${req.cookies.accessToken}`,
            },
            withCredentials: true,
        });

        const userProfile = {
            username: authResponse.data.data.username,
            email: authResponse.data.data.email,
        };

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    userProfile,
                    "Profile fetched successfully"
                )
            );
    } catch (error) {
        console.error(error);
        const status = error.response?.status || 500;
        const message =
            error.response?.data?.message || "Failed to fetch profile";
        return res.status(status).json({ status, message });
    }
});

export const refreshToken = asyncHandler(async (req, res) => {
    try {
        const response = await axiosInstance.post(
            "/v/refreshToken",
            {},
            {
                headers: {
                    Cookie: `refreshToken=${req.cookies.refreshToken}`,
                },
                withCredentials: true,
            }
        );

        const newAccessToken = response.data.accessToken;

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        }).json({
            accessToken: newAccessToken,
        });
    } catch (error) {
        const status = error.response?.status || 500;
        const message =
            error.response?.data?.message || "Failed to refresh token";
        res.status(status).json({ status, message });
    }
});
