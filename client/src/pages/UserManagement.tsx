import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, Search, Shield, ShieldOff, Trash2, Key, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
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
import { Breadcrumb } from "@/components/Breadcrumb";

export default function UserManagement() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [activityUserId, setActivityUserId] = useState<number | null>(null);

  const pageSize = 20;

  // Queries and mutations
  const usersQuery = trpc.admin.getAllUsers.useQuery(
    {
      limit: pageSize,
      offset: page * pageSize,
      search: searchTerm || undefined,
    },
    {
      enabled: !loading && !!user && user.role === "admin",
    }
  );

  const activityQuery = trpc.admin.getUserActivity.useQuery(
    { userId: activityUserId! },
    {
      enabled: activityUserId !== null,
    }
  );

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation();
  const deleteUserMutation = trpc.admin.deleteUser.useMutation();
  const resetPasswordMutation = trpc.admin.resetUserPassword.useMutation();

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      setLocation("/profile");
    }
  }, [user, loading, setLocation]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  // Don't render if not admin
  if (!user || user.role !== "admin") {
    return null;
  }

  const handleRoleToggle = async (userId: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    
    try {
      await updateRoleMutation.mutateAsync({
        userId,
        role: newRole,
      });
      
      toast.success("Role Updated", {
        description: `User role changed to ${newRole}`,
      });
      
      usersQuery.refetch();
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to update user role",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await deleteUserMutation.mutateAsync({
        userId: deleteUserId,
      });
      
      toast.success("User Deleted", {
        description: "User account has been permanently deleted",
      });
      
      setDeleteUserId(null);
      usersQuery.refetch();
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to delete user",
      });
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUserId) return;

    try {
      const result = await resetPasswordMutation.mutateAsync({
        userId: resetPasswordUserId,
      });
      
      setTempPassword(result.tempPassword);
      toast.success("Password Reset", {
        description: "Temporary password generated successfully",
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to reset password",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const totalPages = Math.ceil((usersQuery.data?.total || 0) / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: "Profile", href: "/profile" }, { label: "Admin Dashboard", href: "/profile/admin" }, { label: "User Management" }]} />
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/profile")}
            className="text-slate-300 hover:text-white mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
            User Management
          </h1>
          <p className="text-slate-300">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        {/* Search */}
        <Card className="bg-slate-800/50 border-purple-500/20 mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="pl-10 bg-slate-700/50 border-purple-500/30 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">
              All Users ({usersQuery.data?.total || 0})
            </CardTitle>
            <CardDescription className="text-slate-400">
              View and manage user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            ) : usersQuery.data?.users.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No users found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Email</TableHead>
                        <TableHead className="text-slate-300">Name</TableHead>
                        <TableHead className="text-slate-300">Role</TableHead>
                        <TableHead className="text-slate-300">Subscription</TableHead>
                        <TableHead className="text-slate-300">Last Login</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersQuery.data?.users.map((u: any) => (
                        <TableRow key={u.id} className="border-slate-700">
                          <TableCell className="text-white">{u.email || "N/A"}</TableCell>
                          <TableCell className="text-white">{u.name || "N/A"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={u.role === "admin" ? "default" : "secondary"}
                              className={
                                u.role === "admin"
                                  ? "bg-purple-600 text-white"
                                  : "bg-slate-600 text-slate-200"
                              }
                            >
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white capitalize">
                            {u.subscriptionTier || "free"}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {formatDate(u.lastSignedIn)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRoleToggle(u.id, u.role)}
                                className="bg-slate-700 text-slate-100 hover:bg-slate-600 border-slate-600"
                                disabled={updateRoleMutation.isPending}
                              >
                                {u.role === "admin" ? (
                                  <><ShieldOff className="h-4 w-4 mr-1" /> Demote</>
                                ) : (
                                  <><Shield className="h-4 w-4 mr-1" /> Promote</>
                                )}
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setActivityUserId(u.id)}
                                className="bg-slate-700 text-slate-100 hover:bg-slate-600 border-slate-600"
                              >
                                <Activity className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setResetPasswordUserId(u.id)}
                                className="bg-slate-700 text-slate-100 hover:bg-slate-600 border-slate-600"
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteUserId(u.id)}
                                disabled={deleteUserMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-slate-400">
                      Page {page + 1} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="bg-slate-700 text-slate-100 hover:bg-slate-600 border-slate-600"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="bg-slate-700 text-slate-100 hover:bg-slate-600 border-slate-600"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
          <AlertDialogContent className="bg-slate-800 border-purple-500/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete User Account</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                This action cannot be undone. This will permanently delete the user account and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-700 text-slate-100 hover:bg-slate-600 border-slate-600">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reset Password Dialog */}
        <AlertDialog open={resetPasswordUserId !== null} onOpenChange={() => {
          setResetPasswordUserId(null);
          setTempPassword(null);
        }}>
          <AlertDialogContent className="bg-slate-800 border-purple-500/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Reset User Password</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                {tempPassword ? (
                  <div className="space-y-4">
                    <p>Temporary password generated successfully:</p>
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <code className="text-purple-400 text-lg font-mono">{tempPassword}</code>
                    </div>
                    <p className="text-sm text-slate-400">
                      Please share this password securely with the user. They should change it on next login.
                    </p>
                  </div>
                ) : (
                  "Generate a temporary password for this user? They will need to change it on next login."
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-700 text-slate-100 hover:bg-slate-600 border-slate-600">
                {tempPassword ? "Close" : "Cancel"}
              </AlertDialogCancel>
              {!tempPassword && (
                <AlertDialogAction
                  onClick={handleResetPassword}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Generate Password
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* User Activity Dialog */}
        <AlertDialog open={activityUserId !== null} onOpenChange={() => setActivityUserId(null)}>
          <AlertDialogContent className="bg-slate-800 border-purple-500/20 max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">User Activity</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                API usage and quota consumption
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {activityQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            ) : activityQuery.data?.apiUsage.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No activity recorded
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">API</TableHead>
                      <TableHead className="text-slate-300">Calls</TableHead>
                      <TableHead className="text-slate-300">Quota Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityQuery.data?.apiUsage.map((api: any) => (
                      <TableRow key={api.apiName} className="border-slate-700">
                        <TableCell className="text-white">{api.apiName}</TableCell>
                        <TableCell className="text-white">{api.count}</TableCell>
                        <TableCell className="text-white">{api.totalQuota}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-700 text-slate-100 hover:bg-slate-600 border-slate-600">
                Close
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
