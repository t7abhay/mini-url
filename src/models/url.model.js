import mongoose from "mongoose";
import { UUID } from "sequelize";

const { Schema } = mongoose;

const urlSchema = new Schema(
    {
        userId: {
            type: UUID,
            required: true,
        },
        originalUrl: {
            type: String,
            required: true,
        },
        shortenedUrl: {
            type: String,
            required: true,
            index: true,
        },
        expiry: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
    },
    { timestamps: true }
);
urlSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });
export const ShortUrl = mongoose.model("ShortUrl", urlSchema);
