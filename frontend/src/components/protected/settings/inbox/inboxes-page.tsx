"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Rocket,
  TrendingUp,
  Wrench,
  AlertTriangle,
  Flame,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import SettingsContent from "@/components/protected/settings/settings-content";
import { useInboxesStore } from "@/stores/inboxes";

export default function InboxesPage() {
  const { inboxes, fetchInboxes } = useInboxesStore();

  useEffect(() => {
    fetchInboxes();
  }, []);

  return (
    <SettingsContent
      title="Inboxes"
      description="Create and manage inboxes for your customer support channels."
      showBackButton={false}
    >
      <div>
        <div className="flex justify-end mb-4">
          <Link to="new">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Inbox
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {inboxes.map((inbox) => (
            <Link key={inbox.id} to={`${inbox.id}`} className="block">
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Inbox className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{inbox.name}</CardTitle>
                    <CardDescription>Created {inbox.createdAt}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {inbox.welcomeMessage}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span>{inbox.users.length} members</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </SettingsContent>
  );
}
