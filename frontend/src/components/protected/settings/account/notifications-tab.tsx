import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotificationsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure how you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Email Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New conversations</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when a new conversation is assigned to you
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New messages</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when you receive a new message in your
                  conversations
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mentions</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone mentions you in a conversation
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Browser Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable browser notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications directly in your browser when you're
                  online
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
        <Button variant="outline" className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button className="w-full sm:w-auto">Save changes</Button>
      </CardFooter>
    </Card>
  );
}
