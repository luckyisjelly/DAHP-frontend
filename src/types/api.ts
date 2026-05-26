export interface ApiErrorBody {
  code: string;
  message: string;
  hint?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data: T;
  error: ApiErrorBody | null;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type UserRole = "USER" | "ADMIN";

export interface UserInfo {
  id: number;
  email: string;
  role: UserRole;
}

export interface User extends UserInfo {
  checkInIntervalDays?: number;
  lastCheckInAt?: string | null;
  nextCheckInDueAt?: string | null;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInfo;
}

export interface SignupRequest {
  email: string;
  password: string;
  checkInIntervalDays: number;
}

export interface SignupResponse {
  userId: number;
  email: string;
  role: UserRole;
  checkInIntervalDays: number;
  nextCheckInDueAt: string;
  nextStep: string;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

// ===== Asset =====

export type AssetType =
  | "ACCOUNT"
  | "FILE"
  | "NOTE"
  | "LINK"
  | "MESSAGE"
  | "DOCUMENT"
  | "ETC";

export type SensitivityLevel = "LOW" | "MEDIUM" | "HIGH";

export interface AssetResponse {
  id: number;
  title: string;
  type: AssetType;
  description?: string | null;
  content?: string | null;
  externalRef?: string | null;
  sensitivityLevel: SensitivityLevel;
  createdAt: string;
  updatedAt: string;
}

export interface AssetCreateRequest {
  title: string;
  type: AssetType;
  description?: string;
  content?: string;
  externalRef?: string;
  sensitivityLevel?: SensitivityLevel;
}

export type AssetUpdateRequest = Partial<AssetCreateRequest>;

export interface AssetListQuery {
  type?: AssetType;
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// ===== Recipient =====

export interface RecipientResponse {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  relationship?: string | null;
  memo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecipientCreateRequest {
  name: string;
  email: string;
  phone?: string;
  relationship?: string;
  memo?: string;
}

export type RecipientUpdateRequest = Partial<RecipientCreateRequest>;

export interface RecipientListQuery {
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// ===== CheckIn =====

export interface CheckInStatusResponse {
  lastCheckInAt: string | null;
  nextCheckInDueAt: string;
  checkInIntervalDays: number;
  overdue: boolean;
  daysUntilDue: number;
}

// ===== HandoverRule =====

export type HandoverConditionType =
  | "MANUAL_APPROVAL"
  | "SPECIFIC_DATE"
  | "INACTIVITY_PERIOD";

export type HandoverRuleStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "TRIGGERED"
  | "COMPLETED"
  | "CANCELLED";

export interface AssetSummary {
  id: number;
  title: string;
  type: AssetType;
}

export interface RecipientSummary {
  id: number;
  name: string;
  email: string;
}

export interface HandoverRuleResponse {
  id: number;
  title: string;
  description?: string | null;
  conditionType: HandoverConditionType;
  conditionValue?: string | null;
  status: HandoverRuleStatus;
  assets: AssetSummary[];
  recipients: RecipientSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface HandoverRuleCreateRequest {
  title: string;
  description?: string;
  conditionType: HandoverConditionType;
  conditionValue?: string;
  assetIds: number[];
  recipientIds: number[];
}

export interface HandoverRuleUpdateRequest {
  title?: string;
  description?: string;
  conditionType?: HandoverConditionType;
  conditionValue?: string;
  assetIds?: number[];
  recipientIds?: number[];
}

export interface HandoverRuleListQuery {
  status?: HandoverRuleStatus;
  page?: number;
  size?: number;
  sort?: string;
}

// ===== HandoverEvent =====

export type HandoverEventStatus =
  | "PENDING"
  | "NOTIFIED"
  | "ACCESSED"
  | "EXPIRED"
  | "CANCELLED";

export interface HandoverEventResponse {
  id: number;
  ruleId: number;
  assetId: number;
  recipientId: number;
  status: HandoverEventStatus;
  triggeredAt: string;
  expiresAt: string;
  accessedAt?: string | null;
}

export interface HandoverTriggerResponse {
  ruleId: number;
  ruleStatus: HandoverRuleStatus;
  eventCount: number;
  events: HandoverEventResponse[];
}
