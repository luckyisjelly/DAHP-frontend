import type {
  HandoverConditionType,
  HandoverRuleStatus,
} from "@/types/api";

export const CONDITION_LABEL: Record<HandoverConditionType, string> = {
  MANUAL_APPROVAL: "수동 트리거",
  SPECIFIC_DATE: "날짜 기반",
  INACTIVITY_PERIOD: "미접속 기반",
};

export const CONDITION_DESCRIPTION: Record<HandoverConditionType, string> = {
  MANUAL_APPROVAL: "원하는 시점에 직접 자산 전달을 실행합니다",
  SPECIFIC_DATE: "특정 날짜에 자동으로 자산을 전달합니다",
  INACTIVITY_PERIOD: "일정 기간 접속하지 않으면 자동으로 자산을 전달합니다",
};

type Tone =
  | "neutral"
  | "violet"
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "slate";

export const STATUS_LABEL: Record<HandoverRuleStatus, string> = {
  DRAFT: "초안",
  ACTIVE: "활성",
  PAUSED: "일시정지",
  TRIGGERED: "트리거됨",
  COMPLETED: "완료",
  CANCELLED: "취소됨",
};

export const STATUS_TONE: Record<HandoverRuleStatus, Tone> = {
  DRAFT: "yellow",
  ACTIVE: "green",
  PAUSED: "slate",
  TRIGGERED: "violet",
  COMPLETED: "blue",
  CANCELLED: "red",
};

export const STATUS_TABS: { value: HandoverRuleStatus | null; label: string }[] = [
  { value: null, label: "전체" },
  { value: "DRAFT", label: "초안" },
  { value: "ACTIVE", label: "활성" },
  { value: "PAUSED", label: "일시정지" },
  { value: "TRIGGERED", label: "트리거됨" },
  { value: "COMPLETED", label: "완료" },
  { value: "CANCELLED", label: "취소됨" },
];

export function conditionSummary(
  type: HandoverConditionType,
  value?: string | null,
): string {
  switch (type) {
    case "MANUAL_APPROVAL":
      return "수동으로 실행";
    case "SPECIFIC_DATE":
      return value ? `${value}에 자동 전달` : "날짜 미설정";
    case "INACTIVITY_PERIOD":
      return value ? `${value}일 미접속 시 자동 전달` : "기간 미설정";
  }
}

export function conditionIconColor(type: HandoverConditionType): {
  bg: string;
  fg: string;
} {
  switch (type) {
    case "INACTIVITY_PERIOD":
      return { bg: "bg-violet-500/20", fg: "text-violet-300" };
    case "SPECIFIC_DATE":
      return { bg: "bg-blue-500/20", fg: "text-blue-300" };
    case "MANUAL_APPROVAL":
      return { bg: "bg-green-500/20", fg: "text-green-300" };
  }
}

/** 편집/삭제 가능 여부 (TRIGGERED 이후는 제한) */
export function canEditRule(status: HandoverRuleStatus): boolean {
  return status === "DRAFT" || status === "ACTIVE" || status === "PAUSED";
}

export function canActivateRule(status: HandoverRuleStatus): boolean {
  return status === "DRAFT" || status === "PAUSED";
}

export function canPauseRule(status: HandoverRuleStatus): boolean {
  return status === "ACTIVE";
}

export function canTriggerRule(status: HandoverRuleStatus): boolean {
  return status === "ACTIVE";
}
