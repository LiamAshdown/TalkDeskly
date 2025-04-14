import { useNavigate, useParams } from "react-router-dom";
import { UserDetailsForm } from "./register/user-details-form";
import { UserDetailsFormSkeleton } from "./register/user-details-form-skeleton";
import { useState, useEffect } from "react";
import { CompanyInvite } from "@/lib/interfaces";
import { companyService } from "@/lib/api/services/company";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function InvitePage() {
  const [invite, setInvite] = useState<CompanyInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchInvite = async () => {
      if (!token) {
        setError(t("auth.onboarding.invite.inviteNotFound"));
        setLoading(false);
        return;
      }

      try {
        const response = await companyService.getCompanyInvite(token);
        setInvite(response.data);
      } catch (err: any) {
        setError(t("auth.onboarding.invite.inviteNotFoundDescription"));
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  return (
    <div>
      {error ? (
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
              {t("auth.onboarding.invite.somethingWentWrong")}
            </h2>
          </div>
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive text-destructive"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg">{t("common.error")}</AlertTitle>
            <AlertDescription className="mt-2 text-base">
              {error}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button asChild>
              <Link to="/">{t("auth.onboarding.invite.returnToHome")}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? (
              <div className="h-9 w-64">
                <div className="h-full w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            ) : (
              t("auth.onboarding.invite.inviteFound", {
                companyName: invite?.company.name,
              })
            )}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {t("auth.onboarding.invite.inviteFoundDescription", {
              companyName: invite?.company.name,
            })}
          </p>
          <div>
            {loading ? (
              <UserDetailsFormSkeleton />
            ) : (
              <UserDetailsForm
                onNextStep={() => {
                  navigate("/portal");
                }}
                type="invite"
                email={invite?.email}
                companyID={invite?.company.id}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
