import { z } from "zod";

export const isValidUrl = (data) => {
    const urlSchema = z.string().url();

    const result = urlSchema.safeParse(data);

    return result.success;
};
