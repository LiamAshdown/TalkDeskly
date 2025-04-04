"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  UserX,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import SettingsContent from "@/components/protected/settings/settings-content";
import { toast, useToast } from "@/lib/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Agent" | "Viewer";
  status: "Active" | "Invited" | "Inactive";
  avatar: string;
  inboxes: string[];
}

// Update the TeamMembersTable component to handle responsive design
function TeamMembersTable({
  members,
  onDelete,
  onUpdateRole,
  onUpdateStatus,
}: TeamMembersTableProps) {
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  // Detect mobile screen size
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleEditMember = (member: TeamMember) => {
    setEditMember(member);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editMember) {
      // Update the member's role if it changed
      if (
        editMember.role !== members.find((m) => m.id === editMember.id)?.role
      ) {
        onUpdateRole(editMember.id, editMember.role);
      }

      // Update the member's status if it changed
      if (
        editMember.status !==
        members.find((m) => m.id === editMember.id)?.status
      ) {
        onUpdateStatus(
          editMember.id,
          editMember.status === "Active" ? "Active" : "Inactive"
        );
      }

      setIsEditDialogOpen(false);
      setEditMember(null);
      toast({
        title: "Member updated",
        description: "The team member has been updated successfully.",
      });
    }
  };

  const handleResendInvite = (email: string) => {
    // Simulate resending invite
    toast({
      title: "Invite resent",
      description: `A new invitation has been sent to ${email}.`,
    });
  };

  return (
    <>
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className={isMobile ? "hidden md:table-cell" : ""}>
                Role
              </TableHead>
              <TableHead className={isMobile ? "hidden md:table-cell" : ""}>
                Status
              </TableHead>
              <TableHead className="hidden lg:table-cell">Inboxes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No team members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>
                          {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.email}
                        </div>
                        {/* Show role and status on mobile as part of name cell */}
                        <div className="md:hidden flex flex-wrap gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {member.role}
                          </Badge>
                          {member.status === "Invited" ? (
                            <Badge
                              variant="outline"
                              className="bg-yellow-50 text-yellow-700 border-yellow-200"
                            >
                              Invited
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        onUpdateRole(
                          member.id,
                          value as "Admin" | "Agent" | "Viewer"
                        )
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Agent">Agent</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {member.status === "Invited" ? (
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                      >
                        Invited
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {member.inboxes.length > 0 ? (
                        member.inboxes.map((inbox) => (
                          <Badge
                            key={inbox}
                            variant="secondary"
                            className="text-xs"
                          >
                            {inbox}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No inboxes
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleEditMember(member)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Shield className="h-4 w-4 mr-2" />
                            Change Role
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                onClick={() => onUpdateRole(member.id, "Admin")}
                              >
                                <ShieldAlert className="h-4 w-4 mr-2" />
                                Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onUpdateRole(member.id, "Agent")}
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Agent
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  onUpdateRole(member.id, "Viewer")
                                }
                              >
                                <ShieldX className="h-4 w-4 mr-2" />
                                Viewer
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        {member.status === "Invited" ? (
                          <DropdownMenuItem
                            onClick={() => handleResendInvite(member.email)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Resend Invite
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove {member.name} from
                                your team. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(member.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update information for this team member.
            </DialogDescription>
          </DialogHeader>
          {editMember && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={editMember.avatar} alt={editMember.name} />
                  <AvatarFallback>
                    {editMember.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{editMember.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {editMember.email}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editMember.role}
                  onValueChange={(value) =>
                    setEditMember({
                      ...editMember,
                      role: value as "Admin" | "Agent" | "Viewer",
                    })
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Agent">Agent</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Admins can manage all settings, Agents can respond to
                  conversations, Viewers can only view.
                </p>
              </div>
              {editMember.status !== "Invited" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editMember.status}
                    onValueChange={(value) =>
                      setEditMember({
                        ...editMember,
                        status: value as "Active" | "Inactive",
                      })
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Now let's update the main TeamSettings component to implement the Add Member and Invite modals
export default function TeamSettings() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Admin",
      status: "Active",
      avatar: "/placeholder.svg?height=40&width=40",
      inboxes: ["Support", "Sales"],
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Agent",
      status: "Active",
      avatar: "/placeholder.svg?height=40&width=40",
      inboxes: ["Support"],
    },
    {
      id: "3",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      role: "Agent",
      status: "Active",
      avatar: "/placeholder.svg?height=40&width=40",
      inboxes: ["Sales", "Engineering"],
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "Viewer",
      status: "Invited",
      avatar: "/placeholder.svg?height=40&width=40",
      inboxes: [],
    },
    {
      id: "5",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      role: "Agent",
      status: "Inactive",
      avatar: "/placeholder.svg?height=40&width=40",
      inboxes: ["Support"],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "Agent",
  });
  const [inviteEmails, setInviteEmails] = useState("");

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) {
      toast({
        title: "Missing information",
        description:
          "Please provide both name and email for the new team member.",
        variant: "destructive",
      });
      return;
    }

    const newTeamMember: TeamMember = {
      id: `${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role as "Admin" | "Agent" | "Viewer",
      status: "Active",
      avatar: "/placeholder.svg?height=40&width=40",
      inboxes: [],
    };
    setTeamMembers([...teamMembers, newTeamMember]);
    setNewMember({ name: "", email: "", role: "Agent" });
    setIsAddDialogOpen(false);
    toast({
      title: "Member added",
      description: `${newMember.name} has been added to your team.`,
    });
  };

  const handleInviteMembers = () => {
    if (!inviteEmails.trim()) {
      toast({
        title: "No emails provided",
        description:
          "Please enter at least one email address to send invitations.",
        variant: "destructive",
      });
      return;
    }

    const emails = inviteEmails
      .split(/[\s,]+/)
      .filter((email) => email.trim() !== "");

    // Validate email format
    const invalidEmails = emails.filter(
      (email) => !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    );
    if (invalidEmails.length > 0) {
      toast({
        title: "Invalid email format",
        description: `The following emails are invalid: ${invalidEmails.join(
          ", "
        )}`,
        variant: "destructive",
      });
      return;
    }

    const newInvites = emails.map((email) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: email.split("@")[0],
      email: email.trim(),
      role: "Agent" as const,
      status: "Invited" as const,
      avatar: "/placeholder.svg?height=40&width=40",
      inboxes: [],
    }));

    setTeamMembers([...teamMembers, ...newInvites]);
    setInviteEmails("");
    setIsInviteDialogOpen(false);
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

  const handleUpdateRole = (id: string, role: "Admin" | "Agent" | "Viewer") => {
    setTeamMembers(
      teamMembers.map((member) =>
        member.id === id ? { ...member, role } : member
      )
    );
  };

  const handleUpdateStatus = (id: string, status: "Active" | "Inactive") => {
    setTeamMembers(
      teamMembers.map((member) =>
        member.id === id ? { ...member, status } : member
      )
    );
  };

  return (
    <SettingsContent
      title="Team Members"
      description="Manage your team members and their access"
      showBackButton={false}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Dialog
            open={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Members</DialogTitle>
                <DialogDescription>
                  Invite new team members by email. They will receive an
                  invitation to join your workspace.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="emails">Email Addresses</Label>
                  <textarea
                    id="emails"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter email addresses separated by commas or new lines"
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Team members will be invited as Agents by default. You can
                    change their role later.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsInviteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleInviteMembers}>Send Invitations</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Add a new team member to your workspace. They will have access
                  based on their role.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) =>
                      setNewMember({ ...newMember, email: e.target.value })
                    }
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newMember.role}
                    onValueChange={(value) =>
                      setNewMember({ ...newMember, role: value })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Agent">Agent</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Admins can manage all settings, Agents can respond to
                    conversations, Viewers can only view.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddMember}>Add Member</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all">
        <div className="flex md:items-center md:justify-between justify-start mb-4 sm:flex-row flex-col items-start gap-2">
          <TabsList className="w-full sm:w-auto inline-flex">
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="invited">Invited</TabsTrigger>
          </TabsList>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search members..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <TeamMembersTable
            members={filteredMembers}
            onDelete={handleDeleteMember}
            onUpdateRole={handleUpdateRole}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>

        <TabsContent value="invited" className="mt-0">
          <TeamMembersTable
            members={filteredMembers.filter((m) => m.status === "Invited")}
            onDelete={handleDeleteMember}
            onUpdateRole={handleUpdateRole}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>
      </Tabs>

      <Toaster />
    </SettingsContent>
  );
}

interface TeamMembersTableProps {
  members: TeamMember[];
  onDelete: (id: string) => void;
  onUpdateRole: (id: string, role: "Admin" | "Agent" | "Viewer") => void;
  onUpdateStatus: (id: string, status: "Active" | "Inactive") => void;
}
