// next/image and direct <img>/<a> references to files in /public are NOT auto-prefixed
// by basePath. Wrap them with asset() so they resolve under /Prototypes/ in production
// and at the root in local dev.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${basePath}${path}`;
