import { apiClient } from "./client";
import type { HandoverAccessResponse } from "@/types/api";

/**
 * 수령인 토큰으로 자산 1회 열람.
 * 공개 엔드포인트 (Authorization 헤더 불필요).
 * 호출 즉시 backend가 ACCESSED 상태로 마킹 → 재호출 시 410.
 */
export async function fetchHandoverAccess(
  token: string,
): Promise<HandoverAccessResponse> {
  const res = await apiClient.get<HandoverAccessResponse>(
    `/api/handover-access/${encodeURIComponent(token)}`,
  );
  return res.data;
}
