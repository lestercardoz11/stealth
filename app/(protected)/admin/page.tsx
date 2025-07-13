import { redirect } from "next/navigation";
import { requireAdmin, getAllUsers, getPendingUsers } from "@/lib/auth/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserManagement } from "@/components/admin/user-management";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

export default async function AdminDashboardPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/access-denied?reason=Admin access required");
  }

  const [allUsers, pendingUsers] = await Promise.all([
    getAllUsers(),
    getPendingUsers(),
  ]);

  const approvedUsers = allUsers.filter(user => user.status === 'approved');
  const rejectedUsers = allUsers.filter(user => user.status === 'rejected');
  const adminUsers = allUsers.filter(user => user.role === 'admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users and system settings
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Admin users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Users Alert */}
      {pendingUsers.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200">
              Pending User Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              You have {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} waiting for approval.
            </p>
            <div className="space-y-2">
              {pendingUsers.slice(0, 3).map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{user.email}</span>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              ))}
              {pendingUsers.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  And {pendingUsers.length - 3} more...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <UserManagement users={allUsers} />
        </CardContent>
      </Card>
    </div>
  );
}