export const COUPLE_EN = {
  bride: "රශ්මි",
  groom: "තරිඳු",
} as const;

export const PREFIXES = ["මහතා", "මහත්මිය", "මෙනවිය", "මහතා සහ මහත්මිය", "පවුලේ සැමට", "නම පමණක්"] as const;
export type Prefix = (typeof PREFIXES)[number];

/** Combine name + Sinhala title (titles follow the name in Sinhala). */
export function buildDisplayName(prefix: Prefix, name: string): string {
  const n = name.trim().replace(/\s+/g, " ");
  if (!n) return "";
  switch (prefix) {
    case "පවුලේ සැමට":
      return `${n} ඇතුළු පවුලේ සැමට`;
    case "නම පමණක්":
      return n;
    default:
      return `${n} ${prefix}`;
  }
}

export function buildInviteLink(baseUrl: string, displayName: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${encodeURIComponent(displayName)}`;
}

export function buildInviteMessage(displayName: string, link: string): string {
  return `ආදරණීය ${displayName} ❤️

අපගේ ජීවිතයේ සුවිශේෂීම දිනය වන අපගේ විවාහ මංගල්‍යයට එක්වී අප හා සතුට බෙදා ගන්නා ලෙස ඔබට ආදරයෙන් ආරාධනා කරමු.

📅 2027 මැයි 13 බ්‍රහස්පතින්දා
💍 පෝරුවේ චාරිත්‍රය පෙ.ව. 9.05 ට
📍 Cinderella Hotel, පරකඩුව, ඇහැලියගොඩ

ආරාධනය සහ සියලු විස්තර පහත සබැඳියෙන් බලන්න 🌐:

${link}

ඔබගේ පැමිණීම අපට මහත් සතුටකි.

ආදරයෙන්,
❤️ ${COUPLE_EN.bride} සහ ${COUPLE_EN.groom}`;
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
