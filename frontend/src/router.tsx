import { createBrowserRouter } from "react-router-dom";
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
import LoginPage from "@/pages/(auth)/login/page";
import RegisterPage from "@/pages/(auth)/register/page";
import ForgotPasswordPage from "@/pages/(auth)/forgot-password/page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    id: "root",
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
