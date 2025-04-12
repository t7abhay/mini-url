import mongoose from "mongoose";

const { Schema } = mongoose;

const urlSchema = new Schema(
    {
        originalUrl: {
            type: String,
            required: true,
        },
        shortenedUrl: {
            type: String,
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

export const ShortUrl = mongoose.model("ShortUrl", urlSchema);
