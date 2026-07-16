export function normalizeMapUrl(value: string | null | undefined, siteUrl: string) {
  if (!value?.trim()) return null;

  try {
    // Some existing embed values include copied iframe attributes after the src URL.
    return new URL(value.split('"', 1)[0].trim(), siteUrl).toString();
  } catch {
    return null;
  }
}
