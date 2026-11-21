export const COUPLE_EN = {
  bride: "Kasuni",
  groom: "Sachira",
} as const;

export const PREFIXES = ["Mr.", "Mrs.", "Miss", "Mr. & Mrs.", "Family", "Dear"] as const;
export type Prefix = (typeof PREFIXES)[number];

/** Combine prefix + name. "Dear" adds nothing (the greeting already says Dear). */
export function buildDisplayName(prefix: Prefix, name: string): string {
  const n = name.trim().replace(/\s+/g, " ");
  if (!n) return "";
  switch (prefix) {
    case "Family":
      return `${n} and Family`;
    case "Dear":
      return n;
    default:
      return `${prefix} ${n}`;
  }
}

export function buildInviteLink(baseUrl: string, displayName: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${encodeURIComponent(displayName)}`;
}

export function buildInviteMessage(displayName: string, link: string): string {
  return `Dear ${displayName} ❤️

With joyful hearts, we warmly invite you to celebrate one of the most special days of our lives as we begin our journey together.

Please view our wedding invitation and all the event details through the link below 🌐:

${link}

Your presence would truly mean the world to us, and we would be honored to celebrate this beautiful moment together.

With love,
❤️ ${COUPLE_EN.groom} & ${COUPLE_EN.bride}`;
}

/** Guest name from /{name} path, falling back to the older ?to= query. */
export function readGuestName(): string | null {
  const segment = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (segment && segment.toLowerCase() !== "admin" && !segment.includes("/")) {
    try {
      const decoded = decodeURIComponent(segment).trim();
      if (decoded) return decoded;
    } catch {
      /* malformed encoding: ignore */
    }
  }
  const q = new URLSearchParams(window.location.search).get("to");
  return q && q.trim() ? q.trim() : null;
}
