"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import SettingsContent from "@/components/protected/settings/settings-content";
import { CannedResponse } from "@/lib/interfaces";
import { cannedResponsesService } from "@/lib/api/services/canned-responses";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CannedResponsesList } from "@/components/protected/settings/canned-responses/canned-responses-list";
import { CannedResponseModal } from "@/components/protected/settings/canned-responses/canned-responses-modal";
import { useTranslation } from "react-i18next";

export default function CannedResponsesPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  // Fetch canned responses
  useEffect(() => {
    const fetchCannedResponses = async () => {
      setLoading(true);
      try {
        const response = await cannedResponsesService.getCannedResponses();
        setCannedResponses(response.data);
      } catch (error) {
        toast({
          title: t("common.error"),
          description: t("cannedResponses.errors.loadFailed"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCannedResponses();
  }, [toast, t]);

  // Filter responses based on search query
  const filteredResponses = cannedResponses.filter(
    (response) =>
      response.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle create response
  const handleCreateResponse = async (
    data: Omit<CannedResponse, "id" | "createdAt" | "updatedAt" | "companyId">
  ) => {
    try {
      const response = await cannedResponsesService.createCannedResponse({
        ...data,
        id: "",
        companyId: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setCannedResponses([...cannedResponses, response.data]);
      setIsCreateModalOpen(false);
      setLastAddedId(response.data.id);

      toast({
        title: t("common.success"),
        description: t("cannedResponses.create.success"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("cannedResponses.create.error"),
        variant: "destructive",
      });
    }
  };

  // Handle update response
  const handleUpdateResponse = async (
    id: string,
    data: Omit<CannedResponse, "id" | "createdAt" | "updatedAt" | "companyId">
  ) => {
    try {
      const response = await cannedResponsesService.updateCannedResponse(id, {
        ...data,
        id,
        companyId: cannedResponses.find((r) => r.id === id)?.companyId || "",
        createdAt:
          cannedResponses.find((r) => r.id === id)?.createdAt ||
          new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setCannedResponses(
        cannedResponses.map((item) => (item.id === id ? response.data : item))
      );

      toast({
        title: t("common.success"),
        description: t("cannedResponses.update.success"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("cannedResponses.update.error"),
        variant: "destructive",
      });
    }
  };

  // Handle delete response
  const handleDeleteResponse = async (id: string) => {
    try {
      await cannedResponsesService.deleteCannedResponse(id);
      setCannedResponses(cannedResponses.filter((r) => r.id !== id));

      if (lastAddedId === id) {
        setLastAddedId(null);
      }

      toast({
        title: t("common.success"),
        description: t("cannedResponses.delete.success"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("cannedResponses.delete.error"),
        variant: "destructive",
      });
    }
  };

  return (
    <SettingsContent
      title={t("cannedResponses.title")}
      description={t("cannedResponses.description")}
      showBackButton={false}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("cannedResponses.search")}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("cannedResponses.addResponse")}
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="h-6 w-2/3 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredResponses.length > 0 ? (
          <CannedResponsesList
            responses={filteredResponses}
            onDelete={handleDeleteResponse}
            onUpdate={handleUpdateResponse}
          />
        ) : (
          <Card className="flex flex-col items-center justify-center p-6 text-center">
            <CardContent className="py-10">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl mb-2">
                {t("cannedResponses.empty.title")}
              </CardTitle>
              <CardDescription className="max-w-md mx-auto mb-6">
                {searchQuery
                  ? t("cannedResponses.empty.searchDescription")
                  : t("cannedResponses.empty.description")}
              </CardDescription>
              {!searchQuery && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("cannedResponses.createResponse")}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Modal */}
        <CannedResponseModal
          type="create"
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSave={handleCreateResponse}
        />
      </div>
    </SettingsContent>
  );
}
