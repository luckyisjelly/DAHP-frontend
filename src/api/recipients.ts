import { apiClient } from "./client";
import type {
  PageResponse,
  RecipientCreateRequest,
  RecipientListQuery,
  RecipientResponse,
  RecipientUpdateRequest,
} from "@/types/api";

export async function listRecipients(
  query: RecipientListQuery = {},
): Promise<PageResponse<RecipientResponse>> {
  const params: Record<string, string | number> = {};
  if (query.q) params.q = query.q;
  if (query.page !== undefined) params.page = query.page;
  if (query.size !== undefined) params.size = query.size;
  if (query.sort) params.sort = query.sort;
  const res = await apiClient.get<PageResponse<RecipientResponse>>(
    "/api/recipients",
    { params },
  );
  return res.data;
}

export async function getRecipient(id: number): Promise<RecipientResponse> {
  const res = await apiClient.get<RecipientResponse>(`/api/recipients/${id}`);
  return res.data;
}

export async function createRecipient(
  payload: RecipientCreateRequest,
): Promise<RecipientResponse> {
  const res = await apiClient.post<RecipientResponse>(
    "/api/recipients",
    payload,
  );
  return res.data;
}

export async function updateRecipient(
  id: number,
  payload: RecipientUpdateRequest,
): Promise<RecipientResponse> {
  const res = await apiClient.patch<RecipientResponse>(
    `/api/recipients/${id}`,
    payload,
  );
  return res.data;
}

export async function deleteRecipient(id: number): Promise<void> {
  await apiClient.delete(`/api/recipients/${id}`);
}
