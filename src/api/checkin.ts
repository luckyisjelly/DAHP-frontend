import { apiClient } from "./client";
import type { CheckInStatusResponse } from "@/types/api";

export async function getCheckInStatus(): Promise<CheckInStatusResponse> {
  const res = await apiClient.get<CheckInStatusResponse>(
    "/api/check-ins/status",
  );
  return res.data;
}

export async function performCheckIn(): Promise<CheckInStatusResponse> {
  const res = await apiClient.post<CheckInStatusResponse>("/api/check-ins");
  return res.data;
}
