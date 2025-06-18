// 	1:1, 3:4, 4:3, 9:16, 16:9

export const ImageAspectRatio = {
  SQUARE: '1:1', // Instagram posts, profile pictures
  PORTRAIT: '3:4', // Portrait photos, print photos (8x10)
  STANDARD: '4:3', // Digital cameras, older TVs, PowerPoint slides
  WIDE: '16:9', // 	HD video, YouTube, modern monitors/TVs
  SMARTPHONE: '9:16', // Instagram Reels, TikTok, Stories
} as const;

export const SUPPORTED_IMAGE_ASPECT_RATIOS = Object.values(ImageAspectRatio);
export type ImageAspectRatio = (typeof SUPPORTED_IMAGE_ASPECT_RATIOS)[number];

export function isValidAspectRatio(aspectRatio: string): boolean {
  return SUPPORTED_IMAGE_ASPECT_RATIOS.includes(aspectRatio as ImageAspectRatio);
}
