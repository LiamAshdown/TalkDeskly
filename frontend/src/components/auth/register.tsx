"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { UserDetailsForm } from "@/components/auth/register/user-details-form";
import { CompanyDetailsForm } from "@/components/auth/register/company-details-form";
import { Progress } from "@/components/ui/progress";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 2;
  const progress = (currentStep / totalSteps) * 100;

  const handleUserFormSubmit = () => {
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  const handleCompanyFormSubmit = () => {};

  const goBack = () => {
    setCurrentStep(1);
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Create an account
            </CardTitle>
            <div className="text-sm font-medium">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <CardDescription>
            {currentStep === 1
              ? "Enter your personal information"
              : "Tell us about your company"}
          </CardDescription>
        </CardHeader>

        {currentStep === 1 ? (
          <UserDetailsForm onNextStep={handleUserFormSubmit} />
        ) : (
          <>
            <CompanyDetailsForm onNextStep={handleCompanyFormSubmit} />
          </>
        )}
      </Card>
    </div>
  );
}
