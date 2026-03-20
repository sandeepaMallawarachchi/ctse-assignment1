function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

export function getJwtExpirationTime(token: string): number | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const parsed = JSON.parse(decodeBase64Url(payload)) as { exp?: number };
    if (typeof parsed.exp !== "number") return null;

    return parsed.exp * 1000;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string) {
  const expiresAt = getJwtExpirationTime(token);
  if (!expiresAt) return false;
  return Date.now() >= expiresAt;
}
