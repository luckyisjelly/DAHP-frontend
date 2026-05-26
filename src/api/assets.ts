import { apiClient } from "./client";
import type {
  AssetCreateRequest,
  AssetListQuery,
  AssetResponse,
  AssetUpdateRequest,
  PageResponse,
} from "@/types/api";

export async function listAssets(
  query: AssetListQuery = {},
): Promise<PageResponse<AssetResponse>> {
  const params: Record<string, string | number> = {};
  if (query.type) params.type = query.type;
  if (query.q) params.q = query.q;
  if (query.page !== undefined) params.page = query.page;
  if (query.size !== undefined) params.size = query.size;
  if (query.sort) params.sort = query.sort;
  const res = await apiClient.get<PageResponse<AssetResponse>>("/api/assets", {
    params,
  });
  return res.data;
}

export async function getAsset(id: number): Promise<AssetResponse> {
  const res = await apiClient.get<AssetResponse>(`/api/assets/${id}`);
  return res.data;
}

export async function createAsset(
  payload: AssetCreateRequest,
): Promise<AssetResponse> {
  const res = await apiClient.post<AssetResponse>("/api/assets", payload);
  return res.data;
}

export async function updateAsset(
  id: number,
  payload: AssetUpdateRequest,
): Promise<AssetResponse> {
  const res = await apiClient.patch<AssetResponse>(
    `/api/assets/${id}`,
    payload,
  );
  return res.data;
}

export async function deleteAsset(id: number): Promise<void> {
  await apiClient.delete(`/api/assets/${id}`);
}
