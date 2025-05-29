import { ArrowLeft, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link, useNavigate } from "react-router-dom";
import SettingsContent from "@/components/protected/settings/settings-content";
import { WidgetCustomization } from "@/components/protected/settings/inbox/edit/website/widget-customization";
import { GeneralTab } from "@/components/protected/settings/inbox/edit/tabs/general-tab";
import { TeamTab } from "@/components/protected/settings/inbox/edit/tabs/team-tab";
import { AutomationTab } from "@/components/protected/settings/inbox/edit/website/automation-tab";
import { PreChatFormTab } from "@/components/protected/settings/inbox/edit/website/pre-chat-form-tab";
import { EditInboxProvider, useEditInbox } from "@/context/edit-inbox-context";
import { useTranslation } from "react-i18next";

interface EditInboxProps {
  id: string;
}

function EditInboxContent() {
  const navigate = useNavigate();
  const { inbox, isLoading, isSaving, saveInbox, deleteInbox, canSave } =
    useEditInbox();
  const { t } = useTranslation();

  const handleDelete = async () => {
    await deleteInbox();
    navigate("/settings/inboxes");
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/settings/inboxes">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="h-8 w-40 bg-muted animate-pulse rounded-md"></div>
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-muted animate-pulse rounded-md"></div>
          <div className="h-64 bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>
    );
  }

  if (!inbox) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/settings/inboxes">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Inbox not found</h1>
        </div>
        <p className="text-muted-foreground">
          The inbox you're looking for doesn't exist or you don't have access to
          it.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/settings/inboxes">Back to Inboxes</Link>
        </Button>
      </div>
    );
  }

  return (
    <SettingsContent
      title={t("inbox.edit.title")}
      description={t("inbox.edit.description")}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Inbox
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the{" "}
                  {inbox.name} inbox and all associated conversations.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog> */}
          <Button
            onClick={saveInbox}
            disabled={isSaving || !canSave}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="mb-6 w-full sm:w-auto inline-flex">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="team">Team Members</TabsTrigger>
            <TabsTrigger value="pre-chat-form">Pre-Chat Form</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="widget">Widget</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralTab />
          </TabsContent>

          <TabsContent value="team">
            <TeamTab />
          </TabsContent>

          <TabsContent value="pre-chat-form">
            <PreChatFormTab />
          </TabsContent>

          <TabsContent value="automation">
            <AutomationTab />
          </TabsContent>

          <TabsContent value="widget">
            <WidgetCustomization />
          </TabsContent>
        </Tabs>
      </div>
    </SettingsContent>
  );
}

export default function EditInbox({ id }: EditInboxProps) {
  return (
    <EditInboxProvider id={id}>
      <EditInboxContent />
    </EditInboxProvider>
  );
}
