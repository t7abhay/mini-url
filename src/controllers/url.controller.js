import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { ApiError } from "../utilities/ApiError.js";
import { urlShortner } from "../utilities/urlShortner.js";
import { ShortUrl } from "../models/url.model.js";
import { valKey } from "../utilities/caching.js";

export const createShortURL = asyncHandler(async (req, res) => {
    const { originalUrl } = req.body;

    if (!originalUrl || typeof originalUrl !== "string") {
        return res.status(400).json(new ApiError(400, "No valid URL provided"));
    }

    const shortenedUrl = await urlShortner(originalUrl);

    if (!shortenedUrl) {
        return res.status(500).json(new ApiError(500, "Something went wrong "));
    }

    const alreadyExists = await ShortUrl.findOne({
        originalUrl: originalUrl,
    }).select("shortenedUrl");

    if (alreadyExists) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, alreadyExists, "Short url already exists ")
            );
    }
    const url = await ShortUrl.create({
        originalUrl: originalUrl,
        shortenedUrl: shortenedUrl,
    });

    if (!url) {
        throw new ApiError(500, "Something went wrong");
    }

    const shortUrl = url.shortenedUrl;
    console.log(shortUrl);
    return res
        .status(201)
        .json(new ApiResponse(200, shortUrl, "Short url created Successfully"));
});

export const redirectToOriginalUrl = asyncHandler(async (req, res) => {
    const { shortId } = req.params;

    if (!shortId || typeof shortId !== "string") {
        return res
            .status(400)
            .json(new ApiError(400, "No valid short URL provided"));
    }

    const cachedUrl = await valKey.get(`short:${shortId}`);
    if (cachedUrl) {
        return res.redirect(301, cachedUrl);
    }

    const existingUrl = await ShortUrl.findOne({
        shortenedUrl: shortId,
    });

    if (!existingUrl) {
        return res
            .status(404)
            .json(new ApiError(404, "Short URL does not exist"));
    }

    // existingUrl contains entire Mongo document object, hence just extracted whats required aka originalUrl
    const redirectionUrl = existingUrl.originalUrl;

    if (!existingUrl) {
        throw new ApiError(404, "Short URL does not exists");
    }

    console.log("redirected freshly");
    await valKey.set(`short:${shortId}`, redirectionUrl, "EX", 43200);

    return res.status(301).redirect(redirectionUrl);
});
