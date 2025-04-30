import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { ApiError } from "../utilities/ApiError.js";
import { urlShortner } from "../utilities/urlShortner.js";
import { ShortUrl } from "../models/url.model.js";
import { valKey } from "../utilities/caching.js";
import { isValidUrl } from "../utilities/urlValidator.js";
export const createShortURL = asyncHandler(async (req, res) => {
    const { originalUrl } = req.body;

    const userId = req.user?.id;

    if (!userId) {
        return res
            .status(401)
            .json(new ApiError(401, "User not authenticated"));
    }

    if (!originalUrl || typeof originalUrl !== "string") {
        return res.status(400).json(new ApiError(400, "No valid URL provided"));
    }
    if (!isValidUrl(originalUrl)) {
        return res.status(400).json(new ApiError(400, "No valid URL provided"));
    }

    const alreadyExists = await ShortUrl.findOne(
        {
            originalUrl: originalUrl,
            userId: userId,
        },
        {
            _id: 1,
            shortenedUrl: 1,
        }
    );

    if (alreadyExists) {
        return res
            .status(302)
            .json(
                new ApiResponse(
                    302,
                    alreadyExists.shortenedUrl,
                    "Short url already exists "
                )
            );
    }

    const shortenedUrl = await urlShortner(originalUrl);
    if (!shortenedUrl) {
        return res.status(500).json(new ApiError(500, "Something went wrong "));
    }
    const url = await ShortUrl.create({
        originalUrl: originalUrl,
        shortenedUrl: shortenedUrl,
        userId: userId,
    });

    if (!url) {
        throw new ApiError(500, "Something went wrong");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                url.shortenedUrl,
                "Short url created Successfully"
            )
        );
});

export const redirectToOriginalUrl = asyncHandler(async (req, res) => {
    const { shortId } = req.params;
    console.log(shortId);

    if (!shortId || typeof shortId !== "string") {
        return res
            .status(400)
            .json(new ApiError(400, "No valid short URL provided"));
    }

    const cachedUrl = await valKey.get(`short:${shortId}`);
    if (cachedUrl) {
        return res.status(200).json({ url: cachedUrl });
    }

    const alreadyExists = await ShortUrl.findOne({ shortenedUrl: shortId });

    if (!alreadyExists) {
        return res
            .status(404)
            .json(new ApiError(404, "Short URL does not exist"));
    }

    const redirectionUrl = alreadyExists.originalUrl;

    await valKey.set(`short:${shortId}`, redirectionUrl, "EX", 43200);

    return res.status(200).json({ url: redirectionUrl });
});

export const getAllShortURLs = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    const allUrls = await ShortUrl.find(
        { userId: userId },
        { originalUrl: 1, shortenedUrl: 1, _id: 1 }
    );

    if (!allUrls) {
        return res
            .status(404)
            .json(new ApiError(400, "User does not have short urls"));
    }

    return res
        .status(201)
        .json(new ApiResponse(201, allUrls, "Fetched all urls successfully"));
});

export const deleteUrl = asyncHandler(async (req, res) => {
    const shortIdOfUrlToDelete = req.params.shortId;
    console.log("Short ID to delete:", shortIdOfUrlToDelete);

    if (!shortIdOfUrlToDelete || typeof shortIdOfUrlToDelete !== "string") {
        return res
            .status(400)
            .json(new ApiError(400, "No valid short URL ID provided"));
    }

    const deletedDoc = await ShortUrl.findOneAndDelete({
        shortenedUrl: shortIdOfUrlToDelete,
    });

    if (!deletedDoc) {
        return res.status(404).json(new ApiError(404, "Short URL not found"));
    }

    res.status(200).json({
        success: true,
        message: "Short URL deleted successfully",
        deletedData: deletedDoc,
    });
});
