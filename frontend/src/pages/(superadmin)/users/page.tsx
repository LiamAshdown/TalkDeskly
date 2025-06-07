import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Building,
  Shield,
  AlertCircle,
} from "lucide-react";
import { superAdminService } from "@/lib/api/services/superadmin";
import { SuperAdminUser } from "@/lib/interfaces";
import { useToast } from "@/lib/hooks/use-toast";
import { UserRoleBadge } from "@/components/ui/user-role-badge";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

export default function SuperAdminUsersPage() {
  const { t } = useTranslation();
  const [allUsers, setAllUsers] = useState<SuperAdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SuperAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SuperAdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users when search term changes
    if (searchTerm) {
      const filtered = allUsers.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(allUsers);
    }
  }, [searchTerm, allUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch all users at once for client-side pagination
      const data = await superAdminService.getAllUsers(1, 1000); // Large page size to get all
      setAllUsers(data.users);
      setFilteredUsers(data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        variant: "destructive",
        title: t("superadmin.common.error"),
        description: t("superadmin.users.toast.loadError"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await superAdminService.deleteUser(userToDelete.id);
      await fetchUsers();
      toast({
        title: t("superadmin.common.success"),
        description: t("superadmin.users.toast.deleteSuccess"),
      });
    } catch (error) {
      // Do nothing
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // Define columns for the users DataTable
  const userColumns: ColumnDef<SuperAdminUser>[] = [
    {
      accessorKey: "user",
      header: t("superadmin.users.columns.name"),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
              />
              <AvatarFallback>
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "company",
      header: t("superadmin.users.columns.company"),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray-400 dark:text-white" />
            <span className="text-sm">
              {user.company?.name || "No Company"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: t("superadmin.users.columns.role"),
      cell: ({ row }) => {
        const user = row.original;
        return <UserRoleBadge role={user.role} size="sm" />;
      },
    },
    {
      accessorKey: "lastLoginAt",
      header: t("superadmin.users.columns.lastActive"),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {user.lastLoginAt
              ? new Date(user.lastLoginAt).toLocaleDateString()
              : "Never"}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: t("superadmin.users.columns.actions"),
      size: 50,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/superadmin/users/${user.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t("superadmin.users.actions.edit")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setUserToDelete(user);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("superadmin.users.actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("superadmin.users.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("superadmin.users.description")}
            </p>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("superadmin.users.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("superadmin.users.description")}
          </p>
        </div>
        <Link to="/superadmin/users/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t("superadmin.users.addUser")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" />
            {t("superadmin.users.title")}
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("superadmin.users.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-600">
              {t("superadmin.users.totalUsers", {
                count: filteredUsers.length,
              })}{" "}
              {searchTerm && `of ${allUsers.length} total`}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUsers.length === 0 && !loading ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "No users match your search criteria."
                  : "No users have been created yet."}
              </p>
              {!searchTerm && (
                <Link to="/superadmin/users/new">
                  <Button>{t("superadmin.users.addUser")}</Button>
                </Link>
              )}
            </div>
          ) : (
            <DataTable
              columns={userColumns}
              data={filteredUsers}
              isLoading={loading}
              showAdvancedPagination={true}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              {t("superadmin.users.confirmDelete.title")}
            </DialogTitle>
            <DialogDescription>
              {t("superadmin.users.confirmDelete.description")}{" "}
              {userToDelete?.firstName} {userToDelete?.lastName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              {t("superadmin.users.confirmDelete.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleting}
            >
              {deleting
                ? t("superadmin.common.saving")
                : t("superadmin.users.confirmDelete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
