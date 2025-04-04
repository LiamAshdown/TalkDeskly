import React, { createContext, useContext, useState, useEffect } from "react";
import { Inbox, WorkingHours, WorkingHoursMap } from "@/lib/interfaces";
import { useInboxesStore } from "@/stores/inboxes";
import { inboxService } from "@/lib/api/services/inbox";
import { useTranslation } from "react-i18next";
import { useToast } from "@/lib/hooks/use-toast";

// Default working hours configuration
const defaultWorkingHours = {
  monday: { startTime: "09:00", endTime: "17:00", enabled: true },
  tuesday: { startTime: "09:00", endTime: "17:00", enabled: true },
  wednesday: { startTime: "09:00", endTime: "17:00", enabled: true },
  thursday: { startTime: "09:00", endTime: "17:00", enabled: true },
  friday: { startTime: "09:00", endTime: "17:00", enabled: true },
  saturday: { startTime: "09:00", endTime: "17:00", enabled: false },
  sunday: { startTime: "09:00", endTime: "17:00", enabled: false },
};

// Helper function to convert time string to minutes for comparison
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper function to validate working hours
const validateWorkingHours = (hours: WorkingHoursMap): boolean => {
  return Object.values(hours).every((day) => {
    if (!day.enabled) return true;
    return timeToMinutes(day.endTime) > timeToMinutes(day.startTime);
  });
};

interface EditInboxContextType {
  inbox: Inbox | null;
  teamMembers: string[];
  isLoading: boolean;
  isSaving: boolean;
  autoAssignment: boolean;
  autoAssignmentLimit: string;
  widgetColor: string;
  widgetPosition: string;
  updateInbox: (updates: Partial<Inbox>) => Promise<void>;
  saveInbox: () => Promise<void>;
  deleteInbox: () => Promise<void>;
  setAutoAssignment: (enabled: boolean) => void;
  setAutoAssignmentLimit: (limit: string) => void;
  setWidgetColor: (color: string) => void;
  setWidgetPosition: (position: string) => void;
  setTabValidation: (tab: string, isValid: boolean) => void;
  isTabValid: (tab: string) => boolean;
  canSave: boolean;
  updateTeamMembers: (memberIds: string[]) => Promise<void>;
}

const EditInboxContext = createContext<EditInboxContextType | undefined>(
  undefined
);

export function useEditInbox() {
  const context = useContext(EditInboxContext);
  if (context === undefined) {
    throw new Error("useEditInbox must be used within an EditInboxProvider");
  }
  return context;
}

export function EditInboxProvider({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const [inbox, setInbox] = useState<Inbox | null>(null);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [autoAssignment, setAutoAssignment] = useState(false);
  const [autoAssignmentLimit, setAutoAssignmentLimit] = useState<string>("5");
  const [widgetColor, setWidgetColor] = useState("#4f46e5");
  const [widgetPosition, setWidgetPosition] = useState("bottom-right");
  const [tabValidation, setTabValidation] = useState<Record<string, boolean>>({
    general: true,
    team: true,
    automation: true,
    widget: true,
  });
  const { getInbox, handleInboxUpdated } = useInboxesStore();
  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    const fetchInbox = async () => {
      setIsLoading(true);
      try {
        const inboxData = await getInbox(id);
        setInbox(inboxData);
        if (inboxData.users) {
          setTeamMembers(inboxData.users.map((user) => user.id));
        }
        if (inboxData.widgetCustomization) {
          setWidgetColor(inboxData.widgetCustomization.color);
          setWidgetPosition(inboxData.widgetCustomization.position);
        }
      } catch (error) {
        // Do nothing
      } finally {
        setIsLoading(false);
      }
    };

    fetchInbox();
  }, [id, getInbox]);

  const updateInbox = async (updates: Partial<Inbox>) => {
    if (!inbox) return;

    // If updating working hours, validate them first
    if (updates.workingHours) {
      if (!validateWorkingHours(updates.workingHours)) {
        toast({
          title: t("inbox.edit.invalidWorkingHours"),
          description: t("inbox.edit.endTimeBeforeStartTime"),
          variant: "destructive",
        });
        return;
      }
    }

    setInbox((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const updateTeamMembers = async (memberIds: string[]) => {
    if (!inbox) return;

    try {
      const response = await inboxService.updateInboxUsers(inbox.id, {
        agentIds: memberIds,
      });
      handleInboxUpdated(response.data);
      setTeamMembers(memberIds);
      setInbox(response.data);
    } catch (error) {
      console.error("Failed to update team members:", error);
    }
  };

  const saveInbox = async () => {
    if (!inbox || !canSaveState) return;

    setIsSaving(true);
    try {
      const response = await inboxService.updateInbox(inbox.id, inbox);
      handleInboxUpdated(response.data);

      toast({
        title: t("inbox.edit.inboxUpdated"),
      });
    } catch {
      toast({
        title: t("inbox.edit.inboxUpdateFailed"),
        description: t("inbox.edit.inboxUpdateFailedDescription"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteInbox = async () => {
    if (!inbox) return;

    try {
      // await inboxService.deleteInbox(inbox.id);
      // handleDeleteInbox(inbox.id);
    } catch (error) {
      console.error("Failed to delete inbox:", error);
    }
  };

  const setTabValidationState = (tab: string, isValid: boolean) => {
    setTabValidation((prev) => {
      // Only update if the validation state actually changed
      if (prev[tab] === isValid) {
        return prev;
      }
      return { ...prev, [tab]: isValid };
    });
  };

  const isTabValidState = (tab: string) => {
    return tabValidation[tab] ?? true;
  };

  // Memoize the canSave calculation to prevent unnecessary recalculations
  const canSaveState = React.useMemo(() => {
    return Object.values(tabValidation).every((isValid) => isValid);
  }, [tabValidation]);

  return (
    <EditInboxContext.Provider
      value={{
        inbox,
        teamMembers,
        isLoading,
        isSaving,
        autoAssignment,
        autoAssignmentLimit,
        widgetColor,
        widgetPosition,
        updateInbox,
        saveInbox,
        deleteInbox,
        setAutoAssignment,
        setAutoAssignmentLimit,
        setWidgetColor,
        setWidgetPosition,
        setTabValidation: setTabValidationState,
        isTabValid: isTabValidState,
        canSave: canSaveState,
        updateTeamMembers,
      }}
    >
      {children}
    </EditInboxContext.Provider>
  );
}
