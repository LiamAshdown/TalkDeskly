import { createBrowserRouter, redirect } from "react-router-dom";
import App from "@/App";
import LiveChatPage from "@/pages/(protected)/live-chat/page";
import ProtectedLayout from "@/pages/(protected)/layout";
import SettingsLayout from "@/pages/(protected)/settings/layout";
import InboxesPage from "@/pages/(protected)/settings/inboxes/page";
import NewInboxPage from "@/pages/(protected)/settings/inboxes/new/page";
import EditInboxPage from "@/pages/(protected)/settings/inboxes/[id]/page";
import AccountSettingsPage from "@/pages/(protected)/settings/account/page";
import TeamSettingsPage from "./pages/(protected)/settings/team/page";
import GeneralSettingsPage from "./pages/(protected)/settings/general/page";
import ContactsPage from "@/components/protected/contacts/contacts";
import NotificationsPage from "@/components/protected/notifications/notifications";
import CompanySettingsPage from "@/pages/(protected)/settings/company/page";
import AnalyticsPage from "@/pages/(protected)/settings/analytics/page";
import LoginPage from "@/pages/(auth)/login/page";
import RegisterPage from "@/pages/(auth)/register/page";
import ForgotPasswordPage from "@/pages/(auth)/forgot-password/page";
import ResetPasswordPage from "@/pages/(auth)/reset-password/[token]/page";
import InvitePage from "./components/auth/invite";
import { AuthLayout } from "@/components/layouts/auth-layout";
import CannedResponsesPage from "./pages/(protected)/settings/canned-responses/page";
import { RouteErrorBoundary } from "@/components/route-error-boundary";

// SuperAdmin imports
import SuperAdminLayout from "@/pages/(superadmin)/layout";
import SuperAdminDashboard from "@/pages/(superadmin)/dashboard/page";
import SuperAdminUsersPage from "@/pages/(superadmin)/users/page";
import NewUserPage from "@/pages/(superadmin)/users/new";
import EditUserPage from "@/pages/(superadmin)/users/edit";
import SuperAdminCompaniesPage from "@/pages/(superadmin)/companies/page";
import NewCompanyPage from "@/pages/(superadmin)/companies/new";
import EditCompanyPage from "@/pages/(superadmin)/companies/edit";
import CompanyUsersPage from "@/pages/(superadmin)/companies/users";
import ConfigPage from "@/pages/(superadmin)/config/page";
import SuperAdminSystemPage from "@/pages/(superadmin)/system/page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    id: "root",
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/",
        loader: () => redirect("/auth/login"),
      },
      {
        path: "login",
        loader: () => redirect("/auth/login"),
      },
      {
        path: "register",
        loader: () => redirect("/auth/register"),
      },
      {
        path: "forgot-password",
        loader: () => redirect("/auth/forgot-password"),
      },
      {
        path: "reset-password/:token",
        loader: ({ params }) =>
          redirect(`/auth/reset-password/${params.token}`),
      },
      {
        path: "invite/:token",
        loader: () => redirect("/auth/invite/:token"),
      },
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
            id: "login",
          },
          {
            path: "register",
            element: <RegisterPage />,
            id: "register",
          },
          {
            path: "forgot-password",
            element: <ForgotPasswordPage />,
            id: "forgot-password",
          },
          {
            path: "reset-password/:token",
            element: <ResetPasswordPage />,
            id: "reset-password",
          },
          {
            path: "invite/:token/",
            element: <InvitePage />,
            id: "invite",
          },
        ],
      },
      {
        path: "superadmin",
        element: <SuperAdminLayout />,
        id: "superadmin",
        children: [
          {
            path: "",
            element: <SuperAdminDashboard />,
            id: "superadmin-dashboard",
          },
          {
            path: "users",
            element: <SuperAdminUsersPage />,
            id: "superadmin-users",
          },
          {
            path: "users/new",
            element: <NewUserPage />,
            id: "superadmin-new-user",
          },
          {
            path: "users/:id",
            element: <EditUserPage />,
            id: "superadmin-edit-user",
          },
          {
            path: "companies",
            element: <SuperAdminCompaniesPage />,
            id: "superadmin-companies",
          },
          {
            path: "companies/new",
            element: <NewCompanyPage />,
            id: "superadmin-new-company",
          },
          {
            path: "companies/:id",
            element: <EditCompanyPage />,
            id: "superadmin-edit-company",
          },
          {
            path: "companies/:id/users",
            element: <CompanyUsersPage />,
            id: "superadmin-company-users",
          },
          {
            path: "config",
            element: <ConfigPage />,
            id: "superadmin-config",
          },
          {
            path: "system",
            element: <SuperAdminSystemPage />,
            id: "superadmin-system",
          },
        ],
      },
      {
        path: "portal",
        element: <ProtectedLayout />,
        id: "portal",
        children: [
          {
            path: "",
            element: <LiveChatPage />,
            id: "dashboard",
          },
          {
            path: "conversations/:id",
            element: <LiveChatPage />,
            id: "conversation-detail",
          },
          {
            path: "contacts",
            element: <ContactsPage />,
            id: "contacts",
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
            id: "notifications",
          },
          {
            path: "settings",
            element: <SettingsLayout />,
            id: "settings",
            children: [
              {
                path: "account",
                element: <AccountSettingsPage />,
                id: "account-settings",
              },
              {
                path: "team",
                element: <TeamSettingsPage />,
                id: "team-settings",
              },
              {
                path: "general",
                element: <GeneralSettingsPage />,
                id: "general-settings",
              },
              {
                path: "company",
                element: <CompanySettingsPage />,
                id: "company-settings",
              },
              {
                path: "canned-responses",
                element: <CannedResponsesPage />,
                id: "canned-responses",
              },
              {
                path: "analytics",
                element: <AnalyticsPage />,
                id: "analytics",
              },
              {
                path: "inboxes",
                element: <InboxesPage />,
                id: "inboxes",
              },
              {
                path: "inboxes/new",
                element: <NewInboxPage />,
                id: "new-inbox",
              },
              {
                path: "inboxes/:id",
                element: <EditInboxPage />,
                id: "edit-inbox",
              },
            ],
          },
        ],
      },
    ],
  },
]);
