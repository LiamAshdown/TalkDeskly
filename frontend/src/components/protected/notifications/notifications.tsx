"use client";

import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Clock, Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/lib/hooks/use-toast";
import { notificationService } from "@/lib/api/services/notifications";
import { UserNotification, NotificationType } from "@/lib/interfaces";
import { useTranslation } from "react-i18next";

export default function NotificationsPage() {
  // State for notifications
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const unreadOnly = activeTab === "unread";
        const typeFilter = [
          "assigned_conversation",
          "new_message",
          "mention",
        ].includes(activeTab)
          ? (activeTab as NotificationType)
          : undefined;

        const response = await notificationService.getNotifications({
          page: currentPage,
          limit: 20,
          unread_only: unreadOnly,
        });

        // Debug logging to help identify the issue
        console.log("API Response:", response);
        console.log("Response data:", response.data);
        console.log("Notifications array:", response.data.notifications);

        // Ensure we always have an array, even if the API returns null/undefined
        let filteredNotifications = response.data.notifications || [];

        // Ensure filteredNotifications is an array
        if (!Array.isArray(filteredNotifications)) {
          console.warn("Notifications is not an array:", filteredNotifications);
          filteredNotifications = [];
        }

        // Filter by type if needed (since backend doesn't support type filtering yet)
        if (typeFilter && filteredNotifications.length > 0) {
          filteredNotifications = filteredNotifications.filter(
            (notification) => notification.type === typeFilter
          );
        }

        setNotifications(filteredNotifications);
        setTotal(response.data.total || 0);
        setUnreadCount(response.data.unreadCount || 0);
      } catch (err) {
        setError(t("notifications.toast.loadFailed"));
        console.error("Error fetching notifications:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [activeTab, currentPage]);

  // Filter notifications based on active tab (already handled in useEffect)
  // Ensure filteredNotifications is always an array to prevent .length errors
  const filteredNotifications = notifications || [];

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead({ notification_ids: [id] });
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast({
        description: t("notifications.toast.markedAsRead"),
      });
    } catch (err) {
      toast({
        description: t("notifications.toast.markAsReadFailed"),
        variant: "destructive",
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      toast({
        description: t("notifications.toast.allMarkedAsRead"),
      });
    } catch (err) {
      toast({
        description: t("notifications.toast.markAllAsReadFailed"),
        variant: "destructive",
      });
    }
  };

  // Delete a notification
  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
      setTotal((prev) => prev - 1);
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find((n) => n.id === id);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast({
        description: t("notifications.toast.deleted"),
      });
    } catch (err) {
      toast({
        description: t("notifications.toast.deleteFailed"),
        variant: "destructive",
      });
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setTotal(0);
      setUnreadCount(0);
      toast({
        description: t("notifications.toast.allCleared"),
      });
    } catch (err) {
      toast({
        description: t("notifications.toast.clearAllFailed"),
        variant: "destructive",
      });
    }
  };

  // Format timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return t("notifications.time.justNow");
    if (diffMins < 60)
      return t("notifications.time.minutesAgo", { count: diffMins });

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return t("notifications.time.hoursAgo", { count: diffHours });

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7)
      return t("notifications.time.daysAgo", { count: diffDays });

    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "new_message":
        return <Bell className="h-4 w-4 text-blue-500" />;
      case "assigned_conversation":
        return <Clock className="h-4 w-4 text-purple-500" />;
      case "mention":
        return <Bell className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Get notification badge based on type
  const getNotificationBadge = (type: NotificationType) => {
    switch (type) {
      case "new_message":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            {t("notifications.badges.new_message")}
          </Badge>
        );
      case "assigned_conversation":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            {t("notifications.badges.assigned_conversation")}
          </Badge>
        );
      case "mention":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            {t("notifications.badges.mention")}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <Card className="w-full border-none">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">
                {t("notifications.title")}
              </CardTitle>
              <CardDescription>
                {t("notifications.description")}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    {t("notifications.filter")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => markAllAsRead()}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    {t("notifications.markAllAsRead")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => clearAllNotifications()}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("notifications.clearAll")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Tabs
            defaultValue="all"
            className="mt-4"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all">
                {t("notifications.tabs.all")}
                {total > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {total}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread">
                {t("notifications.tabs.unread")}
                {unreadCount > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="new_message">
                {t("notifications.tabs.messages")}
              </TabsTrigger>
              <TabsTrigger value="assigned_conversation">
                {t("notifications.tabs.assignments")}
              </TabsTrigger>
              <TabsTrigger value="mention">
                {t("notifications.tabs.mentions")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    {t("notifications.error.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    {t("notifications.error.tryAgain")}
                  </Button>
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg transition-colors ${
                        notification.read
                          ? "bg-background"
                          : "bg-muted/50 border-l-4 border-primary"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">
                                {t(`notifications.types.${notification.type}`)}
                              </h3>
                              {getNotificationBadge(notification.type)}
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.createdAt)}
                              </span>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  {t("notifications.actions.markAsRead")}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">
                            {t("notifications.actions.delete")}
                          </span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    {t("notifications.empty.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(`notifications.empty.${activeTab}`, {
                      defaultValue: t("notifications.empty.all"),
                    })}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
        <CardContent>
          {total > 0 && (
            <div className="flex justify-between items-center pt-2">
              <p className="text-sm text-muted-foreground">
                {t("notifications.footer.showing", {
                  count: filteredNotifications.length,
                  total: total,
                })}
              </p>
              {unreadCount > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-auto p-0"
                >
                  {t("notifications.footer.markAllAsRead")}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
