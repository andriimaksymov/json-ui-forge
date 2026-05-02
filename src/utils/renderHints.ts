export type StringRenderHint = 'image-url' | 'svg-markup' | 'url' | 'emoji' | 'plain';

const imageExtensionPattern = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i;
const dataImagePattern = /^data:image\//i;
const urlPattern = /^https?:\/\//i;
const svgMarkupPattern = /^\s*<svg[\s\S]*<\/svg>\s*$/i;
const emojiPattern = /\p{Extended_Pictographic}/u;

export function getStringRenderHint(value: string): StringRenderHint {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'plain';
  }

  if (svgMarkupPattern.test(trimmed)) {
    return 'svg-markup';
  }

  if (dataImagePattern.test(trimmed) || imageExtensionPattern.test(trimmed)) {
    return 'image-url';
  }

  if (urlPattern.test(trimmed)) {
    return 'url';
  }

  if (trimmed.length <= 12 && emojiPattern.test(trimmed)) {
    return 'emoji';
  }

  return 'plain';
}

export function svgMarkupToDataUrl(value: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(value.trim())}`;
}
