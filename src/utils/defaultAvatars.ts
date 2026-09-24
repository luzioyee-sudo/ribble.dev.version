// Only 1 default user avatar uploaded by the user (Dark Blue/Cream silhouette)
const createSvgAvatar = (bg: string, fill: string, cx = 50, cy = 40, r = 21, path = "M 12 100 C 12 62, 30 62, 50 62 C 70 62, 88 62, 88 100 Z") => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="${bg}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/><path d="${path}" fill="${fill}"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const DEFAULT_AVATARS = [
  // 1. Apple-inspired Minimal Avatar (#1D1D1F bg, #007AFF silhouette)
  createSvgAvatar('#1D1D1F', '#007AFF', 50, 41, 19, "M 10 100 C 10 66, 30 66, 50 66 C 70 66, 90 66, 90 100 Z")
];

export function getRandomDefaultAvatar(): string {
  return DEFAULT_AVATARS[0];
}

export function getDefaultAvatar(key?: string): string {
  return DEFAULT_AVATARS[0];
}

export function getEffectiveAvatar(avatarUrl?: string | null, key?: string): string {
  if (avatarUrl && avatarUrl.trim() !== '') {
    if (avatarUrl.includes('222C7A') || avatarUrl.includes('FFF0A5') || avatarUrl.includes('222c7a')) {
      return DEFAULT_AVATARS[0];
    }
    return avatarUrl;
  }
  return getDefaultAvatar(key);
}
