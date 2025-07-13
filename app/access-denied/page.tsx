import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, Mail } from "lucide-react";
import Link from "next/link";

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason = params?.reason || 'Access denied';

  const getReasonDetails = (reason: string) => {
    switch (reason) {
      case 'Account pending approval':
        return {
          title: 'Account Pending Approval',
          description: 'Your account is currently under review. You will receive an email notification once your account has been approved.',
          showContactAdmin: true,
        };
      case 'Account access denied':
        return {
          title: 'Account Access Denied',
          description: 'Your account access has been denied. Please contact your administrator for more information.',
          showContactAdmin: true,
        };
      case 'Admin access required':
        return {
          title: 'Admin Access Required',
          description: 'You do not have permission to access this area. Admin privileges are required.',
          showContactAdmin: false,
        };
      default:
        return {
          title: 'Access Denied',
          description: 'You do not have permission to access this resource.',
          showContactAdmin: false,
        };
    }
  };

  const { title, description, showContactAdmin } = getReasonDetails(reason);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              {description}
            </p>
            
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Link>
              </Button>
              
              {showContactAdmin && (
                <Button variant="outline" asChild className="w-full">
                  <Link href="mailto:admin@yourfirm.com">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Administrator
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}