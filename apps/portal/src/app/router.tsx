import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import {
  CampaignListSkeleton,
  DetailPageSkeleton,
  PortalShellSkeleton,
  TableSkeleton,
} from "@/components/ui/page-skeletons";
import { AuthLayout } from "@/routes/AuthLayout";
import { CampaignWizardLayout } from "@/routes/CampaignWizardLayout";
import { AdminRoute } from "@/routes/guards/AdminRoute";
import { BrandRoute } from "@/routes/guards/BrandRoute";
import { GuestRoute } from "@/routes/guards/GuestRoute";
import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";
import { RoleRoute } from "@/routes/guards/RoleRoute";
import { PortalLayout } from "@/routes/PortalLayout";
import { RootLayout } from "@/routes/RootLayout";

const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);
const AdminLoginPage = lazy(() =>
  import("@/features/auth/pages/AdminLoginPage").then((m) => ({
    default: m.AdminLoginPage,
  })),
);
const SignupPage = lazy(() =>
  import("@/features/auth/pages/SignupPage").then((m) => ({
    default: m.SignupPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import("@/features/auth/pages/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("@/features/auth/pages/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);

const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const AdminDashboardPage = lazy(() =>
  import("@/features/admin/pages/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
const AdminBrandsPage = lazy(() =>
  import("@/features/admin/pages/AdminBrandsPage").then((m) => ({
    default: m.AdminBrandsPage,
  })),
);
const CampaignsPage = lazy(() =>
  import("@/features/campaigns/pages/CampaignsPage").then((m) => ({
    default: m.CampaignsPage,
  })),
);
const CampaignDetailPage = lazy(() =>
  import("@/features/campaigns/pages/CampaignDetailPage").then((m) => ({
    default: m.CampaignDetailPage,
  })),
);
const CampaignNewBasicsPage = lazy(() =>
  import("@/features/campaigns/pages/CampaignNewBasicsPage").then((m) => ({
    default: m.CampaignNewBasicsPage,
  })),
);
const CampaignBriefPage = lazy(() =>
  import("@/features/campaigns/pages/CampaignBriefPage").then((m) => ({
    default: m.CampaignBriefPage,
  })),
);
const CampaignPayoutPage = lazy(() =>
  import("@/features/campaigns/pages/CampaignPayoutPage").then((m) => ({
    default: m.CampaignPayoutPage,
  })),
);
const CampaignReviewPage = lazy(() =>
  import("@/features/campaigns/pages/CampaignReviewPage").then((m) => ({
    default: m.CampaignReviewPage,
  })),
);
const AdminCampaignInvitePage = lazy(() =>
  import("@/features/admin/pages/AdminCampaignInvitePage").then((m) => ({
    default: m.AdminCampaignInvitePage,
  })),
);

const SubmissionsPage = lazy(() =>
  import("@/features/submissions/pages/SubmissionsPage").then((m) => ({
    default: m.SubmissionsPage,
  })),
);
const SubmissionReviewPage = lazy(() =>
  import("@/features/submissions/pages/SubmissionReviewPage").then((m) => ({
    default: m.SubmissionReviewPage,
  })),
);

const AnalyticsPage = lazy(() =>
  import("@/features/analytics/pages/AnalyticsPage").then((m) => ({
    default: m.AnalyticsPage,
  })),
);
const BillingPage = lazy(() =>
  import("@/features/billing/pages/BillingPage").then((m) => ({
    default: m.BillingPage,
  })),
);
const BrandSettingsPage = lazy(() =>
  import("@/features/settings/pages/BrandSettingsPage").then((m) => ({
    default: m.BrandSettingsPage,
  })),
);
const AcceptCampaignInvitePage = lazy(() =>
  import("@/features/invite/pages/AcceptCampaignInvitePage").then((m) => ({
    default: m.AcceptCampaignInvitePage,
  })),
);

function withSuspense(fallback: React.ReactNode, element: React.ReactNode) {
  return <Suspense fallback={fallback}>{element}</Suspense>;
}

const wizardRoutes = [
  {
    path: "new",
    element: withSuspense(
      <PortalShellSkeleton />,
      <CampaignNewBasicsPage />,
    ),
  },
  {
    path: "new/brief",
    element: withSuspense(<PortalShellSkeleton />, <CampaignBriefPage />),
  },
  {
    path: "new/payout",
    element: withSuspense(<PortalShellSkeleton />, <CampaignPayoutPage />),
  },
  {
    path: "new/review",
    element: withSuspense(<PortalShellSkeleton />, <CampaignReviewPage />),
  },
  {
    path: ":id/edit",
    element: withSuspense(
      <PortalShellSkeleton />,
      <CampaignNewBasicsPage />,
    ),
  },
  {
    path: ":id/edit/brief",
    element: withSuspense(<PortalShellSkeleton />, <CampaignBriefPage />),
  },
  {
    path: ":id/edit/payout",
    element: withSuspense(<PortalShellSkeleton />, <CampaignPayoutPage />),
  },
  {
    path: ":id/edit/review",
    element: withSuspense(<PortalShellSkeleton />, <CampaignReviewPage />),
  },
];

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              {
                path: "login",
                element: withSuspense(null, <LoginPage />),
              },
              {
                path: "admin/login",
                element: withSuspense(null, <AdminLoginPage />),
              },
              {
                path: "signup",
                element: withSuspense(null, <SignupPage />),
              },
              {
                path: "forgot-password",
                element: withSuspense(null, <ForgotPasswordPage />),
              },
              {
                path: "reset-password",
                element: withSuspense(null, <ResetPasswordPage />),
              },
              {
                path: "invite/campaign",
                element: withSuspense(null, <AcceptCampaignInvitePage />),
              },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <BrandRoute />,
            children: [
              {
                element: <PortalLayout />,
                children: [
                  {
                    path: "dashboard",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <DashboardPage />,
                    ),
                  },
                  {
                    path: "campaigns",
                    element: withSuspense(
                      <CampaignListSkeleton />,
                      <CampaignsPage />,
                    ),
                  },
                  {
                    element: <CampaignWizardLayout />,
                    children: wizardRoutes.map((r) => ({
                      path: `campaigns/${r.path}`,
                      element: r.element,
                    })),
                  },
                  {
                    path: "campaigns/:id",
                    element: withSuspense(
                      <DetailPageSkeleton />,
                      <CampaignDetailPage />,
                    ),
                  },
                  {
                    path: "submissions",
                    element: withSuspense(
                      <TableSkeleton />,
                      <SubmissionsPage />,
                    ),
                  },
                  {
                    path: "submissions/:id",
                    element: withSuspense(
                      <DetailPageSkeleton />,
                      <SubmissionReviewPage />,
                    ),
                  },
                  {
                    path: "analytics",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <AnalyticsPage />,
                    ),
                  },
                  {
                    element: <RoleRoute allowedRoles={["brand"]} />,
                    children: [
                      {
                        path: "billing",
                        element: withSuspense(
                          <PortalShellSkeleton />,
                          <BillingPage />,
                        ),
                      },
                    ],
                  },
                  {
                    path: "settings/brand",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <BrandSettingsPage />,
                    ),
                  },
                ],
              },
            ],
          },
          {
            element: <AdminRoute />,
            children: [
              {
                element: <PortalLayout />,
                children: [
                  {
                    path: "admin/dashboard",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <AdminDashboardPage />,
                    ),
                  },
                  {
                    path: "admin/brands",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <AdminBrandsPage />,
                    ),
                  },
                  {
                    path: "admin/campaigns",
                    element: withSuspense(
                      <CampaignListSkeleton />,
                      <CampaignsPage />,
                    ),
                  },
                  {
                    element: <CampaignWizardLayout />,
                    children: wizardRoutes.map((r) => ({
                      path: `admin/campaigns/${r.path}`,
                      element: r.element,
                    })),
                  },
                  {
                    path: "admin/campaigns/:id/invite",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <AdminCampaignInvitePage />,
                    ),
                  },
                  {
                    path: "admin/campaigns/:id",
                    element: withSuspense(
                      <DetailPageSkeleton />,
                      <CampaignDetailPage />,
                    ),
                  },
                  {
                    path: "admin/submissions",
                    element: withSuspense(
                      <TableSkeleton />,
                      <SubmissionsPage />,
                    ),
                  },
                  {
                    path: "admin/submissions/:id",
                    element: withSuspense(
                      <DetailPageSkeleton />,
                      <SubmissionReviewPage />,
                    ),
                  },
                  {
                    path: "admin/analytics",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <AnalyticsPage />,
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
