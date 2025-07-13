"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface LoadingBoundaryProps {
  children: React.ReactNode;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </div>
    </div>
  );
}

export function LoadingBoundary({ children }: LoadingBoundaryProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
}