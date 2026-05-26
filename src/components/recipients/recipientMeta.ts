import type { Badge } from "@/components/Badge";

type BadgeTone = Parameters<typeof Badge>[0]["tone"];

/** 빠른 선택용 관계 프리셋 (백엔드는 자유 String) */
export const RELATIONSHIP_PRESETS = ["가족", "친구", "동료", "기타"] as const;

export function relationshipTone(rel?: string | null): BadgeTone {
  switch (rel) {
    case "가족":
      return "red";
    case "친구":
      return "blue";
    case "동료":
      return "green";
    case "기타":
      return "slate";
    default:
      return "neutral";
  }
}

/** 아바타 컬러 — 이름 기반 결정적 매핑 */
const AVATAR_PALETTE = [
  { bg: "bg-violet-500/20", fg: "text-violet-300" },
  { bg: "bg-blue-500/20", fg: "text-blue-300" },
  { bg: "bg-green-500/20", fg: "text-green-300" },
  { bg: "bg-yellow-500/20", fg: "text-yellow-300" },
  { bg: "bg-red-500/20", fg: "text-red-300" },
  { bg: "bg-pink-500/20", fg: "text-pink-300" },
] as const;

export function avatarColor(name: string) {
  const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
}

export function avatarInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  // 한글이면 첫 글자만, 영문이면 최대 2글자
  const isKorean = /[가-힣]/.test(trimmed[0]);
  if (isKorean) return trimmed[0];
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}
