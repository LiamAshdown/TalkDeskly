import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import SettingsContent from "@/components/protected/settings/settings-content";
import { toast } from "@/lib/hooks/use-toast";
import { TeamMember } from "@/lib/interfaces";
import { TeamSettingsHeader } from "./team/team-settings-header";
import { TeamMembersTable } from "./team/team-members-table";
import { useTranslation } from "react-i18next";
import { companyService } from "@/lib/api/services/company";

export default function TeamSettings() {
  const { t } = useTranslation();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter members based on selected tab
  const displayedMembers =
    selectedTab === "all"
      ? filteredMembers
      : filteredMembers.filter((m) => m.status === "Invited");

  const fetchTeamMembers = useCallback(async () => {
    const response = await companyService.getTeamMembers();
    setTeamMembers(response.data);
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleAddMember = async (newMember: TeamMember) => {
    setTeamMembers([...teamMembers, newMember]);
  };

  const handleInviteMembers = async (emails: string[]) => {
    if (emails.length === 0) {
      toast({
        title: t("invite.errors.noEmails.title"),
        description: t("invite.errors.noEmails.description"),
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const invalidEmails = emails.filter(
      (email) => !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    );
    if (invalidEmails.length > 0) {
      toast({
        title: t("invite.errors.invalidEmails.title"),
        description: t("invite.errors.invalidEmails.description", {
          emails: invalidEmails.join(", "),
        }),
        variant: "destructive",
      });
      return;
    }

    try {
      await companyService.sendCompanyInvite(emails);

      toast({
        title: t("invite.success.title"),
        description: t("invite.success.description", {
          emails: emails.join(", "),
        }),
      });

      fetchTeamMembers();
    } catch (error) {
      toast({
        title: t("invite.errors.inviteFailed.title"),
        description: t("invite.errors.inviteFailed.description"),
        variant: "destructive",
      });
    }

    toast({
      title: "Invitations sent",
      description: `Invitations have been sent to ${emails.length} email${
        emails.length > 1 ? "s" : ""
      }.`,
    });
  };

  const handleDeleteMember = (id: string) => {
    const memberToDelete = teamMembers.find((member) => member.id === id);
    setTeamMembers(teamMembers.filter((member) => member.id !== id));
    toast({
      title: "Member removed",
      description: `${
        memberToDelete?.name || "Team member"
      } has been removed from your team.`,
    });
  };

  const handleUpdateRole = (id: string, role: "admin" | "agent") => {
    setTeamMembers(
      teamMembers.map((member) =>
        member.id === id ? { ...member, role } : member
      )
    );
  };

  const handleResendInvite = (id: string) => {
    companyService.resendCompanyInvite(id);

    toast({
      title: t("invite.resend.title"),
      description: t("invite.resend.description"),
    });
  };

  return (
    <SettingsContent
      title="Team Members"
      description="Manage your team members and their access"
      showBackButton={false}
    >
      <TeamSettingsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onInvite={handleInviteMembers}
        onAdd={handleAddMember}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      <TeamMembersTable
        members={displayedMembers}
        onDelete={handleDeleteMember}
        onUpdateRole={handleUpdateRole}
        onResendInvite={handleResendInvite}
      />

      <Toaster />
    </SettingsContent>
  );
}
