import { asyncHandler } from "../utilities/asynchandler.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { ApiError } from "../utilities/ApiError.js";
import { urlShortner } from "../utilities/urlShortner.js";
import { ShortUrl } from "../models/url.model.js";
import { valKey } from "../utilities/caching.js";
export const createShortURL = asyncHandler(async (req, res) => {
    const { originalUrl } = req.body;

    if (!originalUrl || typeof originalUrl !== "string") {
        throw new ApiError(400, "No valid URL provided");
    }

    const shortenedUrl = await urlShortner(originalUrl);

    if (!shortenedUrl) {
        throw new ApiError(500, "Something went wrong ");
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

    return res
        .status(201)
        .json(new ApiResponse(200, url, "Short url created Successfully"));
});

export const redirectToOriginalUrl = asyncHandler(async (req, res) => {
    const { shortId } = req.params;

    if (!shortId || typeof shortId !== "string") {
        throw new ApiError(400, "No valid short URL provided");
    }

    const cachedUrl = await valKey.get(`short:${shortId}`);
    if (cachedUrl) {
        console.log("Redirected from cache");
        return res.redirect(301, cachedUrl);
    }

    const existingUrl = await ShortUrl.findOne({
        shortenedUrl: shortId,
    });

    if (!existingUrl) {
        throw new ApiError(404, "Short URL does not exist");
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
