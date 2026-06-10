import type { Portal } from "./portal";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  error: { code: string; message: string; details?: Record<string, unknown> } | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
};

export type AuthUser = {
  id: string;
  role: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
};

export type AuthResponse = {
  tokens: AuthTokens;
  user: AuthUser;
};

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiAuthHandlers = {
  getRefreshToken: () => string | null;
  onSessionRefreshed: (session: AuthResponse) => void;
  onSessionExpired: () => void;
};

let apiAuthHandlers: ApiAuthHandlers | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function registerApiAuthHandlers(handlers: ApiAuthHandlers): void {
  apiAuthHandlers = handlers;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!apiAuthHandlers) return null;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = apiAuthHandlers!.getRefreshToken();
      if (!refreshToken) return null;

      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        const body = (await res.json()) as ApiEnvelope<AuthResponse>;
        if (!res.ok || !body.success || !body.data) {
          apiAuthHandlers!.onSessionExpired();
          return null;
        }
        apiAuthHandlers!.onSessionRefreshed(body.data);
        return body.data.tokens.accessToken;
      } catch {
        apiAuthHandlers!.onSessionExpired();
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

type AuthedFetchOptions = RequestInit & {
  accessToken?: string;
  json?: boolean;
  _retried?: boolean;
};

async function authedFetch<T>(
  path: string,
  options: AuthedFetchOptions = {},
): Promise<T> {
  const { accessToken, json = true, _retried, ...init } = options;
  const headers = new Headers(init.headers);
  if (json) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const body = (await res.json()) as ApiEnvelope<T>;

  if (
    res.status === 401 &&
    body.error?.code === "UNAUTHORIZED" &&
    accessToken &&
    !_retried &&
    apiAuthHandlers
  ) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      return authedFetch<T>(path, {
        ...options,
        accessToken: nextToken,
        _retried: true,
      });
    }
  }

  if (!res.ok || !body.success || body.data === null) {
    throw new ApiError(
      body.error?.code ?? "INTERNAL_ERROR",
      body.error?.message ?? "Request failed",
    );
  }

  return body.data;
}

export async function apiFetchPublic<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || !body.success || body.data === null) {
    throw new ApiError(
      body.error?.code ?? "INTERNAL_ERROR",
      body.error?.message ?? "Request failed",
    );
  }
  return body.data;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { accessToken?: string } = {},
): Promise<T> {
  return authedFetch<T>(path, options);
}

export async function apiFetchForm<T>(
  path: string,
  options: Omit<RequestInit, "body"> & { body: FormData; accessToken?: string },
): Promise<T> {
  const { accessToken, ...init } = options;
  return authedFetch<T>(path, {
    ...init,
    accessToken,
    json: false,
    body: options.body,
  });
}

type RegisterPayload = {
  email: string;
  password: string;
  companyName: string;
  displayName?: string;
  acceptTerms: true;
};

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<AuthResponse>("/auth/brand/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (portal: Portal, payload: { email: string; password: string }) =>
    apiFetch<AuthResponse>(`/auth/${portal}/login`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  forgotPassword: (email: string) =>
    apiFetch<{ sent: boolean }>("/auth/brand/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (payload: { token: string; password: string }) =>
    apiFetch<{ reset: boolean }>("/auth/brand/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  refresh: (refreshToken: string) =>
    apiFetch<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  previewCampaignInvite: (token: string) =>
    apiFetchPublic<{
      valid: boolean;
      expired: boolean;
      alreadyAccepted: boolean;
      campaignId: string | null;
      campaignTitle: string | null;
      email: string | null;
      needsSignup: boolean;
      hasBrandAccount: boolean;
    }>(`/auth/campaign-invite/preview?token=${encodeURIComponent(token)}`),

  acceptCampaignInvite: (payload: {
    token: string;
    password?: string;
    displayName?: string;
    companyName?: string;
  }) =>
    apiFetchPublic<
      | AuthResponse & { campaign: Campaign }
      | { needsSignup: true }
    >("/auth/campaign-invite/accept", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export type Campaign = {
  id: string;
  brandProfileId: string | null;
  ownership: "brand_created" | "admin_created";
  wizardStep: "basics" | "brief" | "payout" | "review";
  inviteAcceptedAt: string | null;
  title: string;
  category: string | null;
  platform: string;
  platforms: string[];
  status: string;
  brief: string;
  briefHook: string | null;
  doRules: string | null;
  avoidRules: string | null;
  sourceAssets: Array<{ type: "drive" | "youtube"; url: string; label?: string }> | null;
  referenceAssets: Array<{ type: "image" | "video"; url: string; label?: string }> | null;
  coverImageUrl: string | null;
  productUrl: string | null;
  ratePer1kPaise: number;
  ratePer1kDisplay: string;
  maxPayoutPaise: number;
  budgetPaise: number;
  budgetUsedPaise: number;
  poolPercent: number;
  poolRemainingPercent: number;
  startDate: string | null;
  createdAt: string;
  updatedAt?: string;
  submissionCount?: number;
  brandCompanyName?: string | null;
  pendingInviteEmail?: string | null;
};

export type PaginatedCampaigns = {
  items: Campaign[];
  total: number;
  page: number;
  limit: number;
};

export type CampaignStatusFilter = "all" | "draft" | "live" | "paused" | "closed";

export type SubmissionListItem = {
  id: string;
  status: string;
  mediaType: string;
  campaignId: string;
  campaignTitle: string;
  creatorName: string;
  eligibleViews: number;
  estimatedPaise: number;
  submittedAt: string;
};

export type RejectionHistoryEvent = {
  id: string;
  rejectionReason: string;
  draftDriveUrl: string;
  rejectedAt: string;
  reviewedByDisplayName: string | null;
};

export type DeliverableListItem = {
  id: string;
  platform: string;
  status: string;
  draftDriveUrl: string | null;
  draftSubmittedAt: string | null;
  campaignId: string;
  campaignTitle: string;
  participationId: string;
  creatorName: string;
  priorRejectionCount: number;
  siblingDeliverables: Array<{
    id: string;
    platform: string;
    status: string;
  }>;
};

export type DeliverableDetail = {
  id: string;
  platform: string;
  status: string;
  draftDriveUrl: string | null;
  livePostUrl: string | null;
  rejectionReason: string | null;
  draftSubmittedAt: string | null;
  participationId: string;
  rejectionHistory: RejectionHistoryEvent[];
  campaign: { id: string; title: string; ratePer1kDisplay: string };
  creator: {
    id: string;
    displayName: string | null;
    username: string | null;
    phone: string | null;
  };
  siblingDeliverables: Array<{
    id: string;
    platform: string;
    status: string;
    draftDriveUrl: string | null;
    rejectionReason: string | null;
  }>;
};

export type BrandStats = {
  liveCampaigns: number;
  pendingReviews: number;
  budgetUsedPaise: number;
  totalViews: number;
};

export type BrandMe = {
  id: string;
  role: string;
  email: string | null;
  displayName: string | null;
  companyName: string | null;
  brandProfile?: { id: string; companyName: string; logoUrl?: string | null } | null;
};

export type AdminBrand = {
  id: string;
  companyName: string;
  logoUrl: string | null;
  email: string | null;
  displayName: string | null;
  campaignCount: number;
  createdAt: string;
};

export type CampaignInvite = {
  id: string;
  campaignId: string;
  email: string;
  status: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

const campaignsApi = {
  list: (
    token: string,
    params?: { status?: string; page?: number; limit?: number },
  ) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    const q = search.toString();
    return apiFetch<PaginatedCampaigns>(`/campaigns${q ? `?${q}` : ""}`, {
      accessToken: token,
    });
  },
  get: (token: string, id: string) =>
    apiFetch<Campaign & { submissionCount: number }>(`/campaigns/${id}`, {
      accessToken: token,
    }),
  create: (token: string, body: Record<string, unknown>) =>
    apiFetch<Campaign>("/campaigns", {
      method: "POST",
      accessToken: token,
      body: JSON.stringify(body),
    }),
  update: (token: string, id: string, body: Record<string, unknown>) =>
    apiFetch<Campaign>(`/campaigns/${id}`, {
      method: "PATCH",
      accessToken: token,
      body: JSON.stringify(body),
    }),
  updateStep: (token: string, id: string, body: Record<string, unknown>) =>
    apiFetch<Campaign>(`/campaigns/${id}/step`, {
      method: "PATCH",
      accessToken: token,
      body: JSON.stringify(body),
    }),
  delete: (token: string, id: string) =>
    apiFetch<{ deleted: boolean; id: string }>(`/campaigns/${id}`, {
      method: "DELETE",
      accessToken: token,
    }),
  uploadReferenceAsset: (token: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetchForm<{ url: string; path?: string; type: "image" | "video"; name: string }>(
      "/campaigns/reference-assets/upload",
      {
        method: "POST",
        accessToken: token,
        body: formData,
      },
    );
  },
  uploadCoverImage: (token: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetchForm<{ url: string; path?: string; name: string }>(
      "/campaigns/cover/upload",
      {
        method: "POST",
        accessToken: token,
        body: formData,
      },
    );
  },
};

const submissionsApi = {
  list: (token: string, params?: { status?: string; campaignId?: string }) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.campaignId) search.set("campaignId", params.campaignId);
    const q = search.toString();
    return apiFetch<DeliverableListItem[]>(
      `/submissions/deliverables${q ? `?${q}` : ""}`,
      {
        accessToken: token,
      },
    );
  },
  get: (token: string, id: string) =>
    apiFetch<DeliverableDetail>(`/submissions/deliverables/${id}`, {
      accessToken: token,
    }),
  review: (
    token: string,
    id: string,
    body: { action: "approve" | "reject"; rejectionReason?: string },
  ) =>
    apiFetch<{ id: string; status: string }>(
      `/submissions/deliverables/${id}/review`,
      {
        method: "PATCH",
        accessToken: token,
        body: JSON.stringify(body),
      },
    ),
};

export const portalApi = {
  me: (token: string) =>
    apiFetch<BrandMe>("/users/me", { accessToken: token }),

  stats: (token: string) =>
    apiFetch<BrandStats>("/submissions/stats", { accessToken: token }),

  campaigns: campaignsApi,
  submissions: submissionsApi,
};

export const adminApi = {
  dashboard: (token: string) =>
    apiFetch<{
      brandCount: number;
      campaignCount: number;
      pendingInvites: number;
    }>("/admin/dashboard", { accessToken: token }),

  brands: (token: string) =>
    apiFetch<AdminBrand[]>("/admin/brands", { accessToken: token }),

  campaigns: (token: string, params?: { status?: string; page?: number; limit?: number }) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    const q = search.toString();
    return apiFetch<PaginatedCampaigns>(`/admin/campaigns${q ? `?${q}` : ""}`, {
      accessToken: token,
    });
  },

  listInvites: (token: string, campaignId: string) =>
    apiFetch<CampaignInvite[]>(`/admin/campaigns/${campaignId}/invites`, {
      accessToken: token,
    }),

  sendInvite: (token: string, campaignId: string, email: string) =>
    apiFetch<CampaignInvite>(`/admin/campaigns/${campaignId}/invites`, {
      method: "POST",
      accessToken: token,
      body: JSON.stringify({ email }),
    }),

  revokeInvite: (token: string, campaignId: string, inviteId: string) =>
    apiFetch<{ revoked: boolean; id: string }>(
      `/admin/campaigns/${campaignId}/invites/${inviteId}`,
      { method: "DELETE", accessToken: token },
    ),

  campaignsCrud: campaignsApi,
  submissions: submissionsApi,
  stats: (token: string) =>
    apiFetch<BrandStats>("/submissions/stats", { accessToken: token }),
};

/** @deprecated use portalApi */
export const brandApi = portalApi;
