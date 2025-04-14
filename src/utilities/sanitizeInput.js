export const sanitizeInput = (obj) =>
    Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, value?.trim()])
    );
