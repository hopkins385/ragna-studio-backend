export const OutputFormat = {
  JPEG: 'jpeg',
  PNG: 'png',
} as const;

export type OutputFormat = (typeof OutputFormat)[keyof typeof OutputFormat];
