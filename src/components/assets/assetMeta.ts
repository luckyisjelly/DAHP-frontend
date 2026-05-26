import type { AssetType, SensitivityLevel } from "@/types/api";

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  ACCOUNT: "계정",
  FILE: "파일",
  MESSAGE: "메시지",
  NOTE: "메모",
  LINK: "링크",
  DOCUMENT: "문서",
  ETC: "기타",
};

export const ASSET_TYPE_DESCRIPTION: Partial<Record<AssetType, string>> = {
  ACCOUNT: "이메일, SNS, 금융 계정",
  FILE: "문서, 사진, 비디오",
  MESSAGE: "편지, 메모, 녹음",
};

/** UI에 노출할 타입 (MVP) */
export const VISIBLE_ASSET_TYPES: AssetType[] = ["ACCOUNT", "FILE", "MESSAGE"];

export const SENSITIVITY_LABEL: Record<SensitivityLevel, string> = {
  LOW: "낮음",
  MEDIUM: "보통",
  HIGH: "높음",
};

export const SENSITIVITY_TONE: Record<
  SensitivityLevel,
  "green" | "yellow" | "red"
> = {
  LOW: "green",
  MEDIUM: "yellow",
  HIGH: "red",
};

export const SENSITIVITY_STARS: Record<SensitivityLevel, string> = {
  LOW: "★",
  MEDIUM: "★★",
  HIGH: "★★★",
};

export function assetTypeColor(type: AssetType): {
  bg: string;
  fg: string;
  iconBg: string;
} {
  switch (type) {
    case "ACCOUNT":
      return {
        bg: "bg-violet-500/15",
        fg: "text-violet-300",
        iconBg: "bg-violet-500/20 text-violet-300",
      };
    case "FILE":
      return {
        bg: "bg-blue-500/15",
        fg: "text-blue-300",
        iconBg: "bg-blue-500/20 text-blue-300",
      };
    case "MESSAGE":
      return {
        bg: "bg-green-500/15",
        fg: "text-green-300",
        iconBg: "bg-green-500/20 text-green-300",
      };
    default:
      return {
        bg: "bg-slate-500/15",
        fg: "text-slate-300",
        iconBg: "bg-slate-500/20 text-slate-300",
      };
  }
}
