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
const AcceptInvitePage = lazy(() =>
  import("@/features/invite/pages/AcceptInvitePage").then((m) => ({
    default: m.AcceptInvitePage,
  })),
);
const BrandsPage = lazy(() =>
  import("@/features/agency/pages/BrandsPage").then((m) => ({
    default: m.BrandsPage,
  })),
);
const BrandNewPage = lazy(() =>
  import("@/features/agency/pages/BrandNewPage").then((m) => ({
    default: m.BrandNewPage,
  })),
);

function withSuspense(fallback: React.ReactNode, element: React.ReactNode) {
  return <Suspense fallback={fallback}>{element}</Suspense>;
}

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
                path: "invite/accept",
                element: withSuspense(null, <AcceptInvitePage />),
              },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute />,
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
                element: <RoleRoute allowedRoles={["agency"]} />,
                children: [
                  {
                    path: "brands",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <BrandsPage />,
                    ),
                  },
                  {
                    path: "brands/new",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <BrandNewPage />,
                    ),
                  },
                ],
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
                children: [
                  {
                    path: "campaigns/:id/edit",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <CampaignNewBasicsPage />,
                    ),
                  },
                  {
                    path: "campaigns/:id/edit/brief",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <CampaignBriefPage />,
                    ),
                  },
                  {
                    path: "campaigns/:id/edit/payout",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <CampaignPayoutPage />,
                    ),
                  },
                  {
                    path: "campaigns/:id/edit/review",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <CampaignReviewPage />,
                    ),
                  },
                ],
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
                element: withSuspense(<TableSkeleton />, <SubmissionsPage />),
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
              {
                element: <CampaignWizardLayout />,
                children: [
                  {
                    path: "campaigns/new",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <CampaignNewBasicsPage />,
                    ),
                  },
                  {
                    path: "campaigns/new/brief",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <CampaignBriefPage />,
                    ),
                  },
                  {
                    path: "campaigns/new/payout",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <CampaignPayoutPage />,
                    ),
                  },
                  {
                    path: "campaigns/new/review",
                    element: withSuspense(
                      <PortalShellSkeleton />,
                      <CampaignReviewPage />,
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
