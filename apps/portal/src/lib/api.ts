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
  const { accessToken, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const body = (await res.json()) as ApiEnvelope<T>;

  if (!res.ok || !body.success || body.data === null) {
    throw new ApiError(
      body.error?.code ?? "INTERNAL_ERROR",
      body.error?.message ?? "Request failed",
    );
  }

  return body.data;
}

export async function apiFetchForm<T>(
  path: string,
  options: Omit<RequestInit, "body"> & { body: FormData; accessToken?: string },
): Promise<T> {
  const { accessToken, ...init } = options;
  const headers = new Headers(init.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    body: options.body,
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

type RegisterPayload = {
  email: string;
  password: string;
  companyName: string;
  displayName?: string;
  acceptTerms: true;
};

export const authApi = {
  register: (portal: Portal, payload: RegisterPayload) =>
    apiFetch<AuthResponse>(`/auth/${portal}/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (portal: Portal, payload: { email: string; password: string }) =>
    apiFetch<AuthResponse>(`/auth/${portal}/login`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  forgotPassword: (portal: Portal, email: string) =>
    apiFetch<{ sent: boolean }>(`/auth/${portal}/forgot-password`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (
    portal: Portal,
    payload: { token: string; password: string },
  ) =>
    apiFetch<{ reset: boolean }>(`/auth/${portal}/reset-password`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  refresh: (refreshToken: string) =>
    apiFetch<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  previewBrandInvite: (token: string) =>
    apiFetchPublic<{
      valid: boolean;
      expired: boolean;
      agencyName: string | null;
      brandName: string | null;
      email: string | null;
    }>(`/auth/brand-invite/preview?token=${encodeURIComponent(token)}`),

  acceptBrandInvite: (payload: {
    token: string;
    password?: string;
    displayName?: string;
  }) =>
    apiFetchPublic<AuthResponse & { accepted: boolean; brandProfileId: string }>(
      "/auth/brand-invite/accept",
      { method: "POST", body: JSON.stringify(payload) },
    ),
};

export type BrandWorkspace = {
  brandProfileId: string;
  companyName: string;
  linkedAgency: { id: string; companyName: string } | null;
};

export type BrandAgencyConnection = {
  brandProfileId: string;
  companyName: string;
  agency: { id: string; companyName: string };
};

export type Campaign = {
  id: string;
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
  submissionCount?: number;
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

export type BrandStats = {
  liveCampaigns: number;
  pendingReviews: number;
  budgetUsedPaise: number;
  totalViews: number;
};

export type ManagedBrand = {
  brandProfileId: string;
  companyName: string;
  hasOwner: boolean;
  campaignCount: number;
  pendingInvite: { email: string; expiresAt: string } | null;
};

export type AgencyMe = {
  id: string;
  role: string;
  email: string | null;
  displayName: string | null;
  agency: { id: string; companyName: string } | null;
  managedBrands: Array<{
    brandProfileId: string;
    companyName: string;
    hasOwner: boolean;
    inviteStatus: string | null;
  }>;
};

export type BrandMe = {
  id: string;
  role: string;
  email: string | null;
  displayName: string | null;
  companyName: string | null;
  brandProfile?: { id: string; companyName: string } | null;
  linkedAgency?: { id: string; companyName: string } | null;
  workspaces?: BrandWorkspace[];
  agencyConnections?: BrandAgencyConnection[];
};

const campaignsApi = {
  list: (
    token: string,
    params?: {
      status?: string;
      page?: number;
      limit?: number;
      brandProfileId?: string;
    },
  ) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.brandProfileId) {
      search.set("brandProfileId", params.brandProfileId);
    }
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
  list: (
    token: string,
    params?: { status?: string; brandProfileId?: string },
  ) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.brandProfileId) {
      search.set("brandProfileId", params.brandProfileId);
    }
    const q = search.toString();
    return apiFetch<SubmissionListItem[]>(`/submissions${q ? `?${q}` : ""}`, {
      accessToken: token,
    });
  },
  get: (token: string, id: string) =>
    apiFetch<Record<string, unknown>>(`/submissions/${id}`, {
      accessToken: token,
    }),
  review: (
    token: string,
    id: string,
    body: { action: "approve" | "reject"; rejectionReason?: string },
  ) =>
    apiFetch<{ id: string; status: string }>(`/submissions/${id}/review`, {
      method: "PATCH",
      accessToken: token,
      body: JSON.stringify(body),
    }),
};

export const brandApi = {
  me: (token: string) =>
    apiFetch<BrandMe>("/users/me", { accessToken: token }),

  stats: (token: string, brandProfileId?: string) => {
    const q = brandProfileId
      ? `?brandProfileId=${encodeURIComponent(brandProfileId)}`
      : "";
    return apiFetch<BrandStats>(`/submissions/stats${q}`, { accessToken: token });
  },

  campaigns: campaignsApi,
  submissions: submissionsApi,

  agency: {
    get: (token: string, brandProfileId?: string) => {
      const q = brandProfileId
        ? `?brandProfileId=${encodeURIComponent(brandProfileId)}`
        : "";
      return apiFetch<{
        agency: { id: string; companyName: string; linkedAt: string } | null;
      }>(`/brand/agency${q}`, { accessToken: token });
    },
    revoke: (token: string, brandProfileId?: string) => {
      const q = brandProfileId
        ? `?brandProfileId=${encodeURIComponent(brandProfileId)}`
        : "";
      return apiFetch<{ revoked: boolean }>(`/brand/agency${q}`, {
        method: "DELETE",
        accessToken: token,
      });
    },
  },
};

export const agencyApi = {
  me: (token: string) =>
    apiFetch<AgencyMe>("/users/me", { accessToken: token }),

  brands: {
    list: (token: string) =>
      apiFetch<ManagedBrand[]>("/agency/brands", { accessToken: token }),
    create: (
      token: string,
      body: { companyName: string; contactEmail?: string },
    ) =>
      apiFetch<{ id: string; companyName: string; inviteSent: boolean }>(
        "/agency/brands",
        {
          method: "POST",
          accessToken: token,
          body: JSON.stringify(body),
        },
      ),
    get: (token: string, brandProfileId: string) =>
      apiFetch<Record<string, unknown>>(`/agency/brands/${brandProfileId}`, {
        accessToken: token,
      }),
    invite: (token: string, brandProfileId: string, email: string) =>
      apiFetch<{ sent: boolean; inviteId: string }>(
        `/agency/brands/${brandProfileId}/invites`,
        {
          method: "POST",
          accessToken: token,
          body: JSON.stringify({ email }),
        },
      ),
    revokeLink: (token: string, brandProfileId: string) =>
      apiFetch<{ revoked: boolean }>(
        `/agency/brands/${brandProfileId}/link`,
        { method: "DELETE", accessToken: token },
      ),
  },

  stats: (token: string, brandProfileId?: string) => {
    const q = brandProfileId
      ? `?brandProfileId=${encodeURIComponent(brandProfileId)}`
      : "";
    return apiFetch<BrandStats>(`/submissions/stats${q}`, { accessToken: token });
  },

  campaigns: campaignsApi,
  submissions: submissionsApi,
};
