import crypto from "node:crypto";

export const urlShortner = async (originalUrl) => {
    try {
        const salt = crypto.randomBytes(8).toString("hex");

        const saltedUrl = originalUrl + salt;

        const hash = crypto
            .createHash("sha256")
            .update(saltedUrl)
            .digest("base64");

        const urlSafeHash = hash
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "")
            .slice(0, 10);

        return urlSafeHash;
    } catch (error) {
        console.error(error);
    }
};
