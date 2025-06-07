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
  Building,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Globe,
  Mail,
  AlertCircle,
  Activity,
} from "lucide-react";
import { superAdminService } from "@/lib/api/services/superadmin";
import { SuperAdminCompany } from "@/lib/interfaces";
import { useToast } from "@/lib/hooks/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

export default function SuperAdminCompaniesPage() {
  const { t } = useTranslation();
  const [allCompanies, setAllCompanies] = useState<SuperAdminCompany[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<
    SuperAdminCompany[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] =
    useState<SuperAdminCompany | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    // Filter companies when search term changes
    if (searchTerm) {
      const filtered = allCompanies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.website?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(allCompanies);
    }
  }, [searchTerm, allCompanies]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getAllCompanies();
      setAllCompanies(data.companies);
      setFilteredCompanies(data.companies);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      toast({
        variant: "destructive",
        title: t("superadmin.common.error"),
        description: t("superadmin.companies.toast.loadError"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;

    try {
      setDeleting(true);
      await superAdminService.deleteCompany(companyToDelete.id);
      await fetchCompanies();
      toast({
        title: t("superadmin.common.success"),
        description: t("superadmin.companies.toast.deleteSuccess"),
      });
    } catch (error) {
      // Do nothing
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    }
  };

  const getActivityStatus = (company: SuperAdminCompany) => {
    if (!company.lastActiveAt)
      return { label: "Never", color: "bg-gray-100 text-gray-800" };

    const lastActive = new Date(company.lastActiveAt);
    const daysSince = Math.floor(
      (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince === 0)
      return { label: "Today", color: "bg-green-100 text-green-800" };
    if (daysSince <= 7)
      return {
        label: `${daysSince}d ago`,
        color: "bg-green-100 text-green-800",
      };
    if (daysSince <= 30)
      return {
        label: `${daysSince}d ago`,
        color: "bg-yellow-100 text-yellow-800",
      };
    return { label: `${daysSince}d ago`, color: "bg-red-100 text-red-800" };
  };

  // Define columns for the companies DataTable
  const companyColumns: ColumnDef<SuperAdminCompany>[] = [
    {
      accessorKey: "company",
      header: t("superadmin.companies.columns.name"),
      cell: ({ row }) => {
        const company = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage src={company.logo} alt={company.name} />
              <AvatarFallback className="rounded-lg">
                {company.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {company.name}
              </div>
              {company.website && (
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Globe className="h-3 w-3" />
                  <span>{company.website}</span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const company = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-3 w-3" />
              <span>{company.email}</span>
            </div>
            {company.phone && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {company.phone}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "users",
      header: t("superadmin.companies.columns.users"),
      cell: ({ row }) => {
        const company = row.original;
        return (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">{company.userCount}</span>
            <span className="text-xs text-gray-500">
              ({company.activeUserCount} active)
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "lastActiveAt",
      header: "Last Active",
      cell: ({ row }) => {
        const company = row.original;
        const activityStatus = getActivityStatus(company);
        return (
          <Badge variant="secondary" className={activityStatus.color}>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>{activityStatus.label}</span>
            </div>
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t("superadmin.companies.columns.created"),
      cell: ({ row }) => {
        const company = row.original;
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(company.createdAt).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: t("superadmin.companies.columns.actions"),
      size: 50,
      cell: ({ row }) => {
        const company = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/superadmin/companies/${company.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t("superadmin.companies.actions.edit")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/superadmin/companies/${company.id}/users`}>
                  <Users className="h-4 w-4 mr-2" />
                  {t("superadmin.companies.actions.viewUsers")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setCompanyToDelete(company);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("superadmin.companies.actions.delete")}
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("superadmin.companies.title")}
            </h1>
            <p className="text-gray-600 mt-1">
              {t("superadmin.companies.description")}
            </p>
          </div>
          <Skeleton className="h-10 w-28" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("superadmin.companies.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("superadmin.companies.description")}
          </p>
        </div>
        <Link to="/superadmin/companies/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t("superadmin.companies.addCompany")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5" />
            {t("superadmin.companies.title")}
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("superadmin.companies.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-600">
              {t("superadmin.companies.totalCompanies", {
                count: filteredCompanies.length,
              })}{" "}
              {searchTerm && `of ${allCompanies.length} total`}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCompanies.length === 0 && !loading ? (
            <div className="p-12 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No companies found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "No companies match your search criteria."
                  : "No companies have been created yet."}
              </p>
              {!searchTerm && (
                <Link to="/superadmin/companies/new">
                  <Button>Add First Company</Button>
                </Link>
              )}
            </div>
          ) : (
            <DataTable
              columns={companyColumns}
              data={filteredCompanies}
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
              Delete Company
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {companyToDelete?.name}? This
              action cannot be undone and will permanently remove the company
              and all associated data, including users and conversations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCompany}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
