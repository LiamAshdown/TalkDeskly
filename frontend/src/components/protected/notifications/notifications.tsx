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

// Types for our notifications
interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: "message" | "system" | "alert";
}

export default function NotificationsPage() {
  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications (simulated)
  useEffect(() => {
    const fetchNotifications = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "New message from Customer Support",
          message: "You have a new message in the support channel",
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          read: false,
          type: "message",
        },
        {
          id: "2",
          title: "System maintenance scheduled",
          message:
            "The system will be down for maintenance on Saturday from 2-4 AM",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: true,
          type: "system",
        },
        {
          id: "3",
          title: "High priority alert",
          message:
            "Customer #1092 has an urgent request that requires immediate attention",
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          type: "alert",
        },
        {
          id: "4",
          title: "New agent joined your team",
          message: "Sarah Johnson has joined your support team",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          type: "system",
        },
        {
          id: "5",
          title: "Chat transferred to you",
          message: "A chat with customer #2045 has been transferred to you",
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          read: false,
          type: "message",
        },
      ];

      setNotifications(mockNotifications);
      setIsLoading(false);
    };

    fetchNotifications();
  }, []);

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    return notification.type === activeTab;
  });

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    toast({
      description: "Notification marked as read",
    });
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    toast({
      description: "All notifications marked as read",
    });
  };

  // Delete a notification
  const deleteNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
    toast({
      description: "Notification deleted",
    });
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      description: "All notifications cleared",
    });
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <Bell className="h-4 w-4 text-blue-500" />;
      case "system":
        return <Clock className="h-4 w-4 text-purple-500" />;
      case "alert":
        return <Bell className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Get notification badge based on type
  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "message":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Message
          </Badge>
        );
      case "system":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            System
          </Badge>
        );
      case "alert":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Alert
          </Badge>
        );
      default:
        return null;
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <Card className="w-full border-none">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">
                Notifications
              </CardTitle>
              <CardDescription>
                Stay updated with messages, alerts, and system notifications
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => markAllAsRead()}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark all as read
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => clearAllNotifications()}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear all notifications
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
                All
                {notifications.length > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="message">Messages</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="alert">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                                {notification.title}
                              </h3>
                              {getNotificationBadge(notification.type)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Mark as read
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
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No notifications</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeTab === "all"
                      ? "You don't have any notifications yet"
                      : `You don't have any ${
                          activeTab === "unread" ? "unread" : activeTab
                        } notifications`}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 && (
            <div className="flex justify-between items-center pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {filteredNotifications.length} of {notifications.length}{" "}
                notifications
              </p>
              {unreadCount > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-auto p-0"
                >
                  Mark all as read
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
