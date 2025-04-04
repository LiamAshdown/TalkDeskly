import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface User {
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export default function ProfileTab() {
  const [user, setUser] = useState<User>({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/placeholder.svg?height=80&width=80",
    role: "Admin",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update your personal information and profile picture
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm" className="mb-2">
              Upload new picture
            </Button>
            <p className="text-xs text-muted-foreground">
              JPG, GIF or PNG. Max size of 800K
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={user.role} disabled />
            <p className="text-xs text-muted-foreground">
              Your role determines your permissions within the system
            </p>
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
