import { redirectBasedOnRole } from "@/lib/auth/route-utils";

export default async function DashboardPage() {
  // This will redirect to the appropriate dashboard based on user role
  await redirectBasedOnRole();
}