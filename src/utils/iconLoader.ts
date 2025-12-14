import icons from '../generated/icons.json';

export function getIcons(): string[] {
  return icons;
}

export function searchIcons(keyword: string): string[] {
  const allIcons = getIcons();
  if (!keyword) return allIcons;
  const lowerKeyword = keyword.toLowerCase();
  return allIcons.filter(icon => icon.toLowerCase().includes(lowerKeyword));
}
