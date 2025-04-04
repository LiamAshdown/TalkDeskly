import type React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import SettingsContent from "../../settings-content";

export interface WizardStep {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

interface BaseWizardProps {
  steps: WizardStep[];
  currentStep: number;
  title: string;
  children: React.ReactNode;
}

export function BaseWizard({
  steps,
  currentStep,
  title,
  children,
}: BaseWizardProps) {
  return (
    <SettingsContent title={title} description={"Create your new inbox"}>
      {/* Progress Steps */}
      <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-6 md:gap-8">
        <nav aria-label="Progress" className="mb-6 md:mb-0">
          <ol role="list" className="overflow-hidden">
            {steps.map((step, index) => (
              <li
                key={step.id}
                className={cn("relative", index !== steps.length - 1 && "pb-8")}
              >
                {index !== steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5",
                      index < currentStep ? "bg-primary" : "bg-border"
                    )}
                    aria-hidden="true"
                  />
                )}
                <div className="group relative flex items-start">
                  <span className="flex h-9 items-center">
                    <span
                      className={cn(
                        "relative z-10 flex h-8 w-8 items-center justify-center rounded-full",
                        index < currentStep
                          ? "bg-primary text-primary-foreground"
                          : index === currentStep
                          ? "border-2 border-primary bg-background"
                          : "border-2 border-border bg-background"
                      )}
                    >
                      <step.icon className="h-4 w-4" />
                    </span>
                  </span>
                  <div className="ml-4 flex min-w-0 flex-col">
                    <span className="text-sm font-medium">{step.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {step.description}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        {/* Content */}
        <div className="min-h-[400px]">{children}</div>
      </div>
    </SettingsContent>
  );
}
