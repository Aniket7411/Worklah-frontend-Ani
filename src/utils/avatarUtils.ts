/**
 * Backend returns a default placeholder URL when users have no profile picture.
 * This URL should not be loaded or displayed - use a fallback avatar instead.
 *
 * Examples: https://worklah.onrender.com/static/image.png
 *           https://worklah-updated-dec.onrender.com/static/image.png
 */
export const isPlaceholderProfilePic = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== "string") return true;
  return /\/static\/image\.png$/i.test(url) || /worklah.*\.render\.com\/static\/image\.png/i.test(url);
};

/** Returns the URL if it's a real profile pic, otherwise empty string (use fallback UI) */
export const getProfilePicUrl = (url: string | null | undefined): string => {
  if (!url || isPlaceholderProfilePic(url)) return "";
  return url;
};
