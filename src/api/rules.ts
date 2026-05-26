import { apiClient } from "./client";
import type {
  HandoverRuleCreateRequest,
  HandoverRuleListQuery,
  HandoverRuleResponse,
  HandoverRuleUpdateRequest,
  HandoverTriggerResponse,
  PageResponse,
} from "@/types/api";

export async function listRules(
  query: HandoverRuleListQuery = {},
): Promise<PageResponse<HandoverRuleResponse>> {
  const params: Record<string, string | number> = {};
  if (query.status) params.status = query.status;
  if (query.page !== undefined) params.page = query.page;
  if (query.size !== undefined) params.size = query.size;
  if (query.sort) params.sort = query.sort;
  const res = await apiClient.get<PageResponse<HandoverRuleResponse>>(
    "/api/handover-rules",
    { params },
  );
  return res.data;
}

export async function getRule(id: number): Promise<HandoverRuleResponse> {
  const res = await apiClient.get<HandoverRuleResponse>(
    `/api/handover-rules/${id}`,
  );
  return res.data;
}

export async function createRule(
  payload: HandoverRuleCreateRequest,
): Promise<HandoverRuleResponse> {
  const res = await apiClient.post<HandoverRuleResponse>(
    "/api/handover-rules",
    payload,
  );
  return res.data;
}

export async function updateRule(
  id: number,
  payload: HandoverRuleUpdateRequest,
): Promise<HandoverRuleResponse> {
  const res = await apiClient.patch<HandoverRuleResponse>(
    `/api/handover-rules/${id}`,
    payload,
  );
  return res.data;
}

export async function deleteRule(id: number): Promise<void> {
  await apiClient.delete(`/api/handover-rules/${id}`);
}

export async function activateRule(id: number): Promise<HandoverRuleResponse> {
  const res = await apiClient.post<HandoverRuleResponse>(
    `/api/handover-rules/${id}/activate`,
  );
  return res.data;
}

export async function pauseRule(id: number): Promise<HandoverRuleResponse> {
  const res = await apiClient.post<HandoverRuleResponse>(
    `/api/handover-rules/${id}/pause`,
  );
  return res.data;
}

export async function triggerRule(id: number): Promise<HandoverTriggerResponse> {
  const res = await apiClient.post<HandoverTriggerResponse>(
    `/api/handover-rules/${id}/trigger`,
  );
  return res.data;
}
