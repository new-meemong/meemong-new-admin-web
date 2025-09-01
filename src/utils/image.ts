export const parseImageUrl = (imageUrl: string): string => {
  return imageUrl?.startsWith("http") || imageUrl?.startsWith("https")
    ? imageUrl
    : `${process.env.NEXT_PUBLIC_STORAGE_URL}${imageUrl}`;
};
