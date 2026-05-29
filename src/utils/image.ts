export const parseImageUrl = (imageUrl: string): string => {
  return imageUrl?.startsWith("http") || imageUrl?.startsWith("https")
    ? imageUrl
    : `${process.env.NEXT_PUBLIC_STORAGE_URL}${imageUrl}`;
};

const IMAGE_VARIANT_PARAM_KEYS = ["s256", "s512"];

function hasImageVariantParams(imageUrl: string): boolean {
  try {
    const url = new URL(imageUrl, "https://meemong.local");
    return IMAGE_VARIANT_PARAM_KEYS.some(
      (key) => url.searchParams.has(key) || url.hash.includes(`${key}=`),
    );
  } catch {
    return IMAGE_VARIANT_PARAM_KEYS.some((key) => imageUrl.includes(`${key}=`));
  }
}

export function stripImageVariantParams(imageUrl: string): string {
  if (!hasImageVariantParams(imageUrl)) return imageUrl;

  try {
    const isAbsoluteUrl = /^https?:\/\//.test(imageUrl);
    const url = new URL(imageUrl, "https://meemong.local");

    IMAGE_VARIANT_PARAM_KEYS.forEach((key) => {
      url.searchParams.delete(key);
    });

    if (IMAGE_VARIANT_PARAM_KEYS.some((key) => url.hash.includes(`${key}=`))) {
      url.hash = "";
    }

    if (isAbsoluteUrl) return url.toString();
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    const hashIndex = imageUrl.indexOf("#");
    if (hashIndex < 0) return imageUrl;

    const hash = imageUrl.slice(hashIndex + 1);
    if (IMAGE_VARIANT_PARAM_KEYS.some((key) => hash.includes(`${key}=`))) {
      return imageUrl.slice(0, hashIndex);
    }

    return imageUrl;
  }
}
