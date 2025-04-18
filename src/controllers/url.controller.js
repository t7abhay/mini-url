import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { ApiError } from "../utilities/ApiError.js";
import { urlShortner } from "../utilities/urlShortner.js";
import { ShortUrl } from "../models/url.model.js";
import { valKey } from "../utilities/caching.js";

// export const createShortURL = asyncHandler(async (req, res) => {
//     const { originalUrl } = req.body;
//     const userId = `6dc5077a-0c35-41f3-bebb-8e7cfa18a0a6`;

//     console.log(req);
//     if (!originalUrl || typeof originalUrl !== "string") {
//         return res.status(400).json(new ApiError(400, "No valid URL provided"));
//     }

//     const shortenedUrl = await urlShortner(originalUrl);

//     if (!shortenedUrl) {
//         return res.status(500).json(new ApiError(500, "Something went wrong "));
//     }

//     const alreadyExists = await ShortUrl.findOne({
//         originalUrl: originalUrl,
//     }).select("shortenedUrl");

//     if (alreadyExists) {
//         return res
//             .status(200)
//             .json(
//                 new ApiResponse(200, alreadyExists, "Short url already exists ")
//             );
//     }
//     const url = await ShortUrl.create({
//         originalUrl: originalUrl,
//         shortenedUrl: shortenedUrl,
//         userId: userId,
//     });

//     if (!url) {
//         throw new ApiError(500, "Something went wrong");
//     }

//     const shortUrl = url.shortenedUrl;
//     console.log(shortUrl);
//     return res
//         .status(201)
//         .json(new ApiResponse(200, shortUrl, "Short url created Successfully"));
// });

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
            .status(200)
            .json(
                new ApiResponse(
                    200,
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

    if (!shortId || typeof shortId !== "string") {
        return res
            .status(400)
            .json(new ApiError(400, "No valid short URL provided"));
    }

    const cachedUrl = await valKey.get(`short:${shortId}`);
    if (cachedUrl) {
        return res.redirect(301, cachedUrl);
    }

    const alreadyExists = await ShortUrl.findOne({
        shortenedUrl: shortId,
    });

    if (!alreadyExists) {
        return res
            .status(404)
            .json(new ApiError(404, "Short URL does not exist"));
    }

    // alreadyExists contains entire Mongo document object, hence just extracted whats required aka originalUrl
    const redirectionUrl = alreadyExists.originalUrl;

    console.log("redirected freshly");
    await valKey.set(`short:${shortId}`, redirectionUrl, "EX", 43200);

    return res.status(301).redirect(redirectionUrl);
});

export const getAllShortURLs = asyncHandler(async (req, res) => {
    const userId = req.user.id;

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
