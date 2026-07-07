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

export type PublicReferenceAsset = { type: "image" | "video"; url: string; label?: string };
export type PublicSourceAsset = { type: "drive" | "youtube"; url: string; label?: string };

export type PublicCampaign = {
  id: string;
  title: string;
  category: string | null;
  platform: string;
  platforms: string[];
  locationType: "pan_india" | "states";
  targetStates: string[];
  status: string;
  brief: string;
  briefHook: string | null;
  doRules: string | null;
  avoidRules: string | null;
  sourceAssets: PublicSourceAsset[] | null;
  referenceAssets: PublicReferenceAsset[] | null;
  coverImageUrl: string | null;
  productUrl: string | null;
  startDate: string | null;
  brandCompanyName: string | null;
  brandLogoUrl: string | null;
};

export type PublicDeliverableListItem = {
  id: string;
  platform: string;
  status: string;
  draftDriveUrl: string | null;
  livePostUrl: string | null;
  rejectionReason: string | null;
  draftSubmittedAt: string | null;
  participationId: string;
  joinedAt: string;
  creatorName: string;
  priorRejectionCount: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  estimatedPaise: number;
  siblingDeliverables: Array<{ id: string; platform: string; status: string }>;
};

export const publicApi = {
  campaign: (id: string) =>
    apiFetchPublic<PublicCampaign>(`/public/campaigns/${id}`),
  deliverables: (id: string) =>
    apiFetchPublic<PublicDeliverableListItem[]>(`/public/campaigns/${id}/deliverables`),
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
  locationType: "pan_india" | "states";
  targetStates: string[];
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
  creatorId: string;
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

export type CreatorProfileSnippet = {
  id: string;
  platform: string;
  handle: string;
  label: string | null;
  avatarUrl: string | null;
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
  joinedAt: string;
  creatorId: string;
  creatorName: string;
  creatorProfile: CreatorProfileSnippet;
  priorRejectionCount: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  estimatedPaise: number;
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
  draftReviewedAt: string | null;
  liveSubmittedAt: string | null;
  proofReviewedAt: string | null;
  participationId: string;
  rejectionHistory: RejectionHistoryEvent[];
  campaign: { id: string; title: string; status: string; ratePer1kDisplay: string; budgetPaise: number };
  creator: {
    id: string;
    displayName: string | null;
    username: string | null;
    phone: string | null;
  };
  creatorProfile: CreatorProfileSnippet;
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
  phone: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  companyName: string | null;
  bio: string | null;
  socialLinks: Record<string, string> | null;
  brandProfile?: { id: string; companyName: string; logoUrl?: string | null } | null;
};

/** A single linked platform handle (Instagram/YouTube/etc) under one creator login — the "account switcher". */
export type LinkedCreatorProfile = {
  id: string;
  platform: string;
  handle: string;
  label: string | null;
  avatarUrl: string | null;
  isDefault: boolean;
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

export type AdminBrandDetail = {
  id: string;
  companyName: string;
  companyEmail: string | null;
  logoUrl: string | null;
  email: string | null;
  displayName: string | null;
  pocName: string | null;
  pocPhone: string | null;
  pocEmail: string | null;
  createdAt: string;
  campaigns: Campaign[];
};

export type KycStatus = "not_started" | "pending" | "verified";

export type AdminCreatorSummary = {
  id: string;
  displayName: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  kycStatus: KycStatus;
  isActive: boolean;
  createdAt: string;
  campaignCount: number;
  walletAvailablePaise: number;
  walletLifetimePaise: number;
};

export type AdminCreatorCampaignEntry = {
  campaignId: string;
  title: string;
  status: string;
  coverImageUrl: string | null;
  viewCount: number;
  earnedPaise: number;
};

export type AdminCreatorPayoutMethod = {
  id: string;
  type: string;
  label: string;
  accountMasked: string;
  isDefault: boolean;
};

export type AdminCreatorWithdrawal = {
  id: string;
  amountPaise: number;
  feePaise: number;
  netPaise: number;
  status: string;
  createdAt: string;
  processedAt: string | null;
};

export type AdminCreatorDetail = {
  id: string;
  displayName: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  socialLinks: Record<string, string> | null;
  kycStatus: KycStatus;
  isActive: boolean;
  createdAt: string;
  linkedProfiles: LinkedCreatorProfile[];
  wallet: { availablePaise: number; pendingPaise: number; lifetimePaise: number };
  payoutMethods: AdminCreatorPayoutMethod[];
  withdrawals: AdminCreatorWithdrawal[];
  runningCampaigns: AdminCreatorCampaignEntry[];
  pastCampaigns: AdminCreatorCampaignEntry[];
  totalViews: number;
  totalEarnedPaise: number;
};

export type StaffBrand = {
  id: string;
  companyName: string;
  logoUrl: string | null;
  companyEmail: string | null;
  campaignCount: number;
  assignedAt: string;
};

export type StaffAccessLevel = "view_only" | "full";

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isActive: boolean;
  assignedBrands: { id: string; companyName: string; logoUrl: string | null; accessLevel: StaffAccessLevel }[];
};

export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: { id: string; name: string };
  brand: { id: string; companyName: string } | null;
};

export type ActivityLogEntry = {
  id: string;
  action: string;
  label: string;
  brandName: string | null;
  metadata: Record<string, unknown> | null;
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
    params?: { status?: string; search?: string; page?: number; limit?: number },
  ) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.search) search.set("search", params.search);
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
  listByCampaign: (token: string, campaignId: string) =>
    apiFetch<DeliverableListItem[]>(`/submissions/deliverables?campaignId=${campaignId}`, {
      accessToken: token,
    }),
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
  approveProof: (token: string, deliverableId: string) =>
    apiFetch<{ id: string; status: string }>(
      `/submissions/deliverables/${deliverableId}/approve-proof`,
      { method: "PATCH", accessToken: token },
    ),
  rejectProof: (token: string, deliverableId: string, reason: string) =>
    apiFetch<{ id: string; status: string }>(
      `/submissions/deliverables/${deliverableId}/reject-proof`,
      {
        method: "PATCH",
        accessToken: token,
        body: JSON.stringify({ reason }),
      },
    ),
  analyticsOverview: (token: string) =>
    apiFetch<AnalyticsOverview>("/submissions/analytics", { accessToken: token }),
};

export type AnalyticsOverview = {
  totals: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalEarningsPaise: number;
    totalCampaigns: number;
    totalClippers: number;
  };
  campaigns: Array<{
    id: string;
    title: string;
    status: string;
    coverImageUrl: string | null;
    totalViews: number;
    totalEarningsPaise: number;
    clipperCount: number;
  }>;
  topCreators: Array<{
    creatorId: string;
    creatorName: string;
    avatarUrl: string | null;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalEarningsPaise: number;
  }>;
};

export const portalApi = {
  me: (token: string) =>
    apiFetch<BrandMe>("/users/me", { accessToken: token }),

  updateBrandProfile: (
    token: string,
    body: { companyName?: string; displayName?: string; logoUrl?: string },
  ) =>
    apiFetch<{ companyName: string; logoUrl: string | null; displayName: string | null }>(
      "/users/me/brand-profile",
      { method: "PATCH", body: JSON.stringify(body), accessToken: token },
    ),

  updateProfile: (
    token: string,
    body: {
      displayName?: string;
      phone?: string;
      bio?: string;
      avatarUrl?: string;
      socialLinks?: Record<string, string>;
    },
  ) =>
    apiFetch<{
      displayName: string | null;
      phone: string | null;
      bio: string | null;
      avatarUrl: string | null;
      socialLinks: Record<string, string> | null;
    }>("/users/me", { method: "PATCH", body: JSON.stringify(body), accessToken: token }),

  changePassword: (
    token: string,
    body: { currentPassword: string; newPassword: string },
  ) =>
    apiFetch<{ changed: boolean }>("/users/me/change-password", {
      method: "POST",
      body: JSON.stringify(body),
      accessToken: token,
    }),

  uploadBrandLogo: (token: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetchForm<{ url: string }>("/users/me/brand-logo", {
      method: "POST",
      body: form,
      accessToken: token,
    });
  },

  uploadAvatar: (token: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetchForm<{ url: string }>("/users/me/avatar", {
      method: "POST",
      body: form,
      accessToken: token,
    });
  },

  stats: (token: string) =>
    apiFetch<BrandStats>("/submissions/stats", { accessToken: token }),

  campaigns: campaignsApi,
  submissions: submissionsApi,
};

export type CampaignPayoutDeliverable = {
  id: string;
  platform: string;
  viewCount: number;
  earnedPaise: number;
  paidAt: string | null;
  paidAmountPaise: number | null;
};

export type CampaignCreatorPayout = {
  creatorId: string;
  creatorName: string;
  deliverables: CampaignPayoutDeliverable[];
  totalApprovedPaise: number;
  totalUnpaidPaise: number;
  totalPaidPaise: number;
};

export type PayoutResult = {
  paidCount: number;
  totalPaidPaise: number;
};

export const adminApi = {
  dashboard: (token: string) =>
    apiFetch<{
      brandCount: number;
      campaignCount: number;
      activeCampaignCount: number;
      pendingInvites: number;
      totalViews: number;
      totalSpentPaise: number;
      pendingTasks: {
        id: string;
        status: string;
        platform: string;
        draftSubmittedAt: string | null;
        creatorId: string;
        creatorName: string;
        campaignId: string;
        campaignTitle: string;
      }[];
      topClippers: {
        creatorId: string;
        creatorName: string;
        totalViews: number;
        earnedPaise: number;
      }[];
    }>("/admin/dashboard", { accessToken: token }),

  brands: (token: string) =>
    apiFetch<AdminBrand[]>("/admin/brands", { accessToken: token }),

  brand: (token: string, id: string) =>
    apiFetch<AdminBrandDetail>(`/admin/brands/${id}`, { accessToken: token }),

  creators: (token: string) =>
    apiFetch<AdminCreatorSummary[]>("/admin/creators", { accessToken: token }),

  creator: (token: string, id: string) =>
    apiFetch<AdminCreatorDetail>(`/admin/creators/${id}`, { accessToken: token }),

  uploadBrandLogo: (token: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetchForm<{ url: string }>("/admin/brand-logo", {
      method: "POST",
      body: form,
      accessToken: token,
    });
  },

  createBrand: (token: string, body: { companyName: string; companyEmail: string; pocName?: string; pocPhone?: string; pocEmail?: string; logoUrl?: string }) =>
    apiFetch<AdminBrand & { tempPassword: string; companyEmail?: string; pocName?: string; pocPhone?: string; pocEmail?: string }>("/admin/brands", {
      method: "POST",
      body: JSON.stringify(body),
      accessToken: token,
    }),

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

  // Team members
  listTeamMembers: (token: string) =>
    apiFetch<StaffMember[]>("/admin/team-members", { accessToken: token }),

  createTeamMember: (token: string, body: { name: string; email: string; password: string }) =>
    apiFetch<StaffMember>("/admin/team-members", {
      method: "POST",
      body: JSON.stringify(body),
      accessToken: token,
    }),

  assignBrand: (token: string, staffId: string, brandId: string, accessLevel?: StaffAccessLevel) =>
    apiFetch<{ assigned: boolean }>(`/admin/team-members/${staffId}/brands/${brandId}`, {
      method: "POST",
      body: JSON.stringify(accessLevel ? { accessLevel } : {}),
      accessToken: token,
    }),

  deactivateStaff: (token: string, staffId: string) =>
    apiFetch<{ deactivated: boolean }>(`/admin/team-members/${staffId}/deactivate`, {
      method: "POST",
      accessToken: token,
    }),

  reactivateStaff: (token: string, staffId: string) =>
    apiFetch<{ reactivated: boolean }>(`/admin/team-members/${staffId}/reactivate`, {
      method: "POST",
      accessToken: token,
    }),

  getStaffActivity: (token: string, staffId: string) =>
    apiFetch<ActivityLogEntry[]>(`/admin/team-members/${staffId}/activity`, { accessToken: token }),

  createTask: (token: string, body: { title: string; description?: string; assignedToUserId: string; brandProfileId?: string; dueDate?: string }) =>
    apiFetch<Task>("/admin/tasks", { method: "POST", body: JSON.stringify(body), accessToken: token }),

  listTasks: (token: string, params?: { staffId?: string; status?: TaskStatus }) => {
    const search = new URLSearchParams();
    if (params?.staffId) search.set("staffId", params.staffId);
    if (params?.status) search.set("status", params.status);
    const q = search.toString();
    return apiFetch<Task[]>(`/admin/tasks${q ? `?${q}` : ""}`, { accessToken: token });
  },

  deleteTask: (token: string, taskId: string) =>
    apiFetch<{ deleted: boolean }>(`/admin/tasks/${taskId}`, { method: "DELETE", accessToken: token }),

  removeBrand: (token: string, staffId: string, brandId: string) =>
    apiFetch<{ removed: boolean }>(`/admin/team-members/${staffId}/brands/${brandId}`, {
      method: "DELETE",
      accessToken: token,
    }),

  // Payouts
  campaignPayouts: (token: string, campaignId: string) =>
    apiFetch<CampaignCreatorPayout[]>(`/admin/campaigns/${campaignId}/payouts`, {
      accessToken: token,
    }),

  payoutAll: (token: string, campaignId: string) =>
    apiFetch<PayoutResult>(`/admin/campaigns/${campaignId}/payouts/all`, {
      method: "POST",
      accessToken: token,
    }),

  payoutCreator: (token: string, campaignId: string, creatorId: string) =>
    apiFetch<PayoutResult>(`/admin/campaigns/${campaignId}/payouts/creator/${creatorId}`, {
      method: "POST",
      accessToken: token,
    }),
};

/** @deprecated use portalApi */
export const brandApi = portalApi;

export const staffApi = {
  brands: (token: string) =>
    apiFetch<StaffBrand[]>("/staff/brands", { accessToken: token }),

  brand: (token: string, brandId: string) =>
    apiFetch<AdminBrandDetail>(`/staff/brands/${brandId}`, { accessToken: token }),

  createCampaign: (token: string, brandId: string, body: Record<string, unknown>) =>
    apiFetch<Campaign>(`/staff/brands/${brandId}/campaigns`, {
      method: "POST",
      body: JSON.stringify(body),
      accessToken: token,
    }),

  listMyTasks: (token: string) =>
    apiFetch<Task[]>("/staff/tasks", { accessToken: token }),

  updateTaskStatus: (token: string, taskId: string, status: TaskStatus) =>
    apiFetch<Task>(`/staff/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      accessToken: token,
    }),
};

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export const notificationsApi = {
  list: (token: string) =>
    apiFetch<AppNotification[]>("/notifications", { accessToken: token }),

  unreadCount: (token: string) =>
    apiFetch<{ count: number }>("/notifications/unread-count", { accessToken: token }),

  markRead: (token: string, id: string) =>
    apiFetch<{ read: boolean }>(`/notifications/${id}/read`, { method: "PATCH", accessToken: token }),

  markAllRead: (token: string) =>
    apiFetch<{ read: boolean }>("/notifications/read-all", { method: "PATCH", accessToken: token }),
};

export type CreatorCampaignSummary = {
  campaignId: string;
  title: string;
  status: string;
};

export type CreatorProfile = {
  id: string;
  displayName: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  socialLinks: Record<string, string> | null;
  createdAt: string;
  linkedProfiles: LinkedCreatorProfile[];
  runningCampaigns: CreatorCampaignSummary[];
  pastCampaigns: CreatorCampaignSummary[];
};

export const creatorApi = {
  get: (token: string, id: string) =>
    apiFetch<CreatorProfile>(`/creators/${id}`, { accessToken: token }),
};
