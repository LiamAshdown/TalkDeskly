import { Onboarding } from "./onboarding";
import { useMiscStore } from "@/stores/misc";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const { appInformation } = useMiscStore();
  const { t } = useTranslation();

  if (!appInformation?.registrationEnabled) {
    return (
      <div className="flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <Lock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("auth.registration.disabled.title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {t("auth.registration.disabled.description")}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">
                  {t("auth.registration.disabled.helpTitle")}
                </span>{" "}
                {t("auth.registration.disabled.helpDescription")}
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("auth.registration.disabled.backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Onboarding />;
}
