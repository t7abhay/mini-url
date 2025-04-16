/* import { ApiResponse } from "../utilities/ApiResponse.js";

export const healthCheck = async (req, res) => {
    const catInfo = {
        species: "Felis catus",
        domesticated: true,
        lifespan: {
            average: "13-17 years",
            maxRecorded: "38 years",
        },
        abilities: {
            jumpHeight: "up to 6 times their body length",
            nightVision: "excellent",
            whiskers: "help with navigation and sensing",
        },
        behavior: {
            kneading: "a comforting behavior from kittenhood",
            purring: "can indicate contentment, stress, or healing",
            grooming: "spend 30-50% of the day grooming",
        },
        senses: {
            smell: "14x better than humans",
            hearing: "can hear ultrasonic sounds",
            vision: "see well in low light",
        },
        communication: {
            vocalizations: ["meow", "purr", "hiss", "growl", "chirp"],
            bodyLanguage: ["tail position", "ear movement", "eye dilation"],
        },
        funFact: "A cat has 9 lives.",
    };

    return res.status(200).json(
        new ApiResponse(200, catInfo, {
            message: "🍎 Service is running ..........!",
        })
    );
};
 */

import { ApiResponse } from "../utilities/ApiResponse.js";
export const healthCheck = async (req, res) => {
    console.log(`health requested ${"🍎🍎🍎🍎🍎"}`);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { message: "Service is up and running 🍏" },
                "Healthy"
            )
        );
};
