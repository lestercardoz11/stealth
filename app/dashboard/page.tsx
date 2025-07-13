import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/auth/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Users, Settings } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentUserProfile();
  
  if (!profile) {
    redirect("/auth/login");
  }

  // Get some basic stats
  const [documentsResult, conversationsResult] = await Promise.all([
    supabase.from('documents').select('id', { count: 'exact' }).eq('user_id', profile.id),
    supabase.from('conversations').select('id', { count: 'exact' }).eq('user_id', profile.id),
  ]);

  const documentCount = documentsResult.count || 0;
  const conversationCount = conversationsResult.count || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Approval</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default">Administrator</Badge>;
      case 'employee':
        return <Badge variant="outline">Employee</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {profile.full_name || profile.email}
        </p>
      </div>

      {/* User Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            {getStatusBadge(profile.status)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Role:</span>
            {getRoleBadge(profile.role)}
          </div>
          {profile.status === 'pending' && (
            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
              Your account is pending approval. You will have full access once approved by an administrator.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentCount}</div>
            <p className="text-xs text-muted-foreground">
              Your uploaded documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversationCount}</div>
            <p className="text-xs text-muted-foreground">
              Chat conversations
            </p>
          </CardContent>
        </Card>

        {profile.role === 'admin' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Panel</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/admin">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-2">
            <Button asChild variant="outline" disabled={profile.status !== 'approved'}>
              <Link href="/documents">
                <FileText className="mr-2 h-4 w-4" />
                Manage Documents
              </Link>
            </Button>
            <Button asChild variant="outline" disabled={profile.status !== 'approved'}>
              <Link href="/chat">
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Chat
              </Link>
            </Button>
          </div>
          {profile.status !== 'approved' && (
            <p className="text-sm text-muted-foreground">
              Some features are disabled until your account is approved.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}