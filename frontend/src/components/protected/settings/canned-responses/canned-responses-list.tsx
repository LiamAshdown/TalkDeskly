"use client";

import { useState } from "react";
import { Edit, Trash2, Copy, MoreHorizontal, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/lib/hooks/use-toast";
import { CannedResponseModal } from "@/components/protected/settings/canned-responses/canned-responses-modal";
import { useTranslation } from "react-i18next";
import { UseFormReturn } from "react-hook-form";
import { CannedResponseFormData } from "@/lib/schemas/canned-response-schema";

interface CannedResponse {
  id: string;
  title: string;
  message: string;
  tag: string;
  createdAt: string;
  updatedAt: string;
}

interface CannedResponsesListProps {
  responses: CannedResponse[];
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    response: Omit<
      CannedResponse,
      "id" | "createdAt" | "updatedAt" | "companyId"
    >,
    form: UseFormReturn<CannedResponseFormData>
  ) => void;
}

export function CannedResponsesList({
  responses,
  onDelete,
  onUpdate,
}: CannedResponsesListProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [editingResponse, setEditingResponse] = useState<CannedResponse | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (message: string, id: string) => {
    navigator.clipboard.writeText(message);
    setCopiedId(id);

    toast({
      title: t("cannedResponses.copy.title"),
      description: t("cannedResponses.copy.description"),
    });

    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (response: CannedResponse) => {
    setEditingResponse(response);
    setIsEditModalOpen(true);
  };

  const handleUpdate = (
    data: Omit<CannedResponse, "id" | "createdAt" | "updatedAt" | "companyId">,
    form: UseFormReturn<CannedResponseFormData>
  ) => {
    if (editingResponse) {
      onUpdate(editingResponse.id, data, form);
      setIsEditModalOpen(false);
      setEditingResponse(null);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {responses.map((response) => (
        <Card key={response.id} className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg line-clamp-1">
                {response.title}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 relative"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">
                      {t("cannedResponses.actions")}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleCopy(response.message, response.id)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {t("cannedResponses.actions.copy")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEdit(response)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t("cannedResponses.actions.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteConfirmId(response.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("cannedResponses.actions.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent
            className="flex-1 cursor-pointer"
            onClick={() => handleEdit(response)}
          >
            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words line-clamp-4">
              {response.message}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col items-start pt-4 border-t">
            <div className="mb-2">
              {response.tag && (
                <Badge variant="secondary" className="text-xs">
                  {response.tag}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap justify-between w-full mt-2 gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => handleCopy(response.message, response.id)}
                >
                  {copiedId === response.id ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      {t("cannedResponses.copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      {t("cannedResponses.actions.copy")}
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => handleEdit(response)}
                >
                  <Edit className="mr-1 h-3 w-3" />
                  {t("cannedResponses.actions.edit")}
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">
                {t("cannedResponses.updated", {
                  time: formatDistanceToNow(new Date(response.updatedAt), {
                    addSuffix: true,
                  }),
                })}
              </span>
            </div>
          </CardFooter>
        </Card>
      ))}

      {/* Edit Modal */}
      <CannedResponseModal
        type="edit"
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSave={handleUpdate}
        response={editingResponse || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("cannedResponses.delete.confirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("cannedResponses.delete.confirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {t("cannedResponses.actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
