import { useEffect, useState } from "react";
import { UserDetailsForm } from "@/components/auth/register/user-details-form";
import { CompanyDetailsForm } from "@/components/auth/register/company-details-form";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/auth";
import { useNavigate } from "react-router-dom";
export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  const totalSteps = 2;
  const progress = (currentStep / totalSteps) * 100;

  const handleUserFormSubmit = () => {
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (!user && token) {
      setCurrentStep(2);
    }
  }, [user, token]);

  const handleCompanyFormSubmit = () => {};

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
        Create an account
      </h2>
      <p className="text-slate-500">
        {currentStep === 1
          ? "Enter your personal information"
          : "Tell us about your company"}
      </p>

      {/* Step Indicators */}
      <div className="mt-4 flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              currentStep >= 1
                ? "bg-teal-500 text-white"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            <span className="text-sm font-medium">1</span>
          </div>
          <div
            className={`ml-2 text-sm font-medium ${
              currentStep >= 1 ? "text-teal-500" : "text-slate-500"
            }`}
          >
            Personal Info
          </div>
        </div>

        <div className="flex-1 mx-4">
          <div className="h-0.5 bg-slate-200"></div>
        </div>

        <div className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              currentStep >= 2
                ? "bg-teal-500 text-white"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            <span className="text-sm font-medium">2</span>
          </div>
          <div
            className={`ml-2 text-sm font-medium ${
              currentStep >= 2 ? "text-teal-500" : "text-slate-500"
            }`}
          >
            Company Info
          </div>
        </div>
      </div>

      {currentStep === 1 ? (
        <UserDetailsForm onNextStep={handleUserFormSubmit} type="register" />
      ) : (
        <CompanyDetailsForm onNextStep={handleCompanyFormSubmit} />
      )}
    </div>
  );
}
