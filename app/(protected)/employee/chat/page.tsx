import { requireApprovedUser } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default async function ChatPage() {
  try {
    await requireApprovedUser();
  } catch {
    redirect("/access-denied?reason=Account pending approval");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Chat</h1>
        <p className="text-muted-foreground">
          Chat with your AI assistant
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            Chat interface will be implemented in the next step.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}