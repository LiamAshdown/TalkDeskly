import { useState } from "react";
import { MessageSquare, Users, CheckCircle2 } from "lucide-react";
import { BaseWizard, type WizardStep } from "../base-wizard";
import { CreateInbox } from "@/components/protected/settings/inbox/wizard/create-inbox";
import { Complete } from "@/components/protected/settings/inbox/wizard/website/complete";
import { AddAgents } from "@/components/protected/settings/inbox/wizard/add-agents";
import { useTranslation } from "react-i18next";
import { Inbox } from "@/lib/interfaces";

export function WebsiteWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useTranslation();
  const [inbox, setInbox] = useState<Inbox | null>(null);

  const steps: WizardStep[] = [
    {
      id: "inbox",
      name: t("inbox.wizard.website.steps.create.name"),
      description: t("inbox.wizard.website.steps.create.description"),
      icon: MessageSquare,
    },
    {
      id: "agents",
      name: t("inbox.wizard.website.steps.addAgents.name"),
      description: t("inbox.wizard.website.steps.addAgents.description"),
      icon: Users,
    },
    {
      id: "complete",
      name: t("inbox.wizard.website.steps.complete.name"),
      description: t("inbox.wizard.website.steps.complete.description"),
      icon: CheckCircle2,
    },
  ];

  const handleAgentsAdd = (inbox: Inbox) => {
    setInbox(inbox);
    setCurrentStep(2);
  };

  const handleInboxCreated = (inbox: Inbox) => {
    setInbox(inbox);
    setCurrentStep(1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CreateInbox
            title={t("inbox.wizard.website.title")}
            description={t("inbox.wizard.website.description")}
            onCreated={handleInboxCreated}
          />
        );
      case 1:
        return (
          <AddAgents
            inboxID={inbox?.id!}
            agentsAlreadyAdded={inbox?.users.map((user) => ({
              label: user.name,
              value: user.id,
            }))}
            availableAgents={inbox?.users.map((user) => ({
              label: user.name,
              value: user.id,
            }))}
            onCreated={handleAgentsAdd}
            required={false}
          />
        );
      case 2:
        return <Complete inbox={inbox!} />;
      default:
        return null;
    }
  };

  return (
    <BaseWizard steps={steps} currentStep={currentStep} title="Website Inbox">
      {renderStepContent()}
    </BaseWizard>
  );
}
