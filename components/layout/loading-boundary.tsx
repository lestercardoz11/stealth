"use client";

import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface LoadingBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function DefaultLoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px] animate-fade-in">
      <LoadingSpinner text="Loading..." />
    </div>
  );
}

export function LoadingBoundary({ children, fallback }: LoadingBoundaryProps) {
  return (
    <Suspense fallback={fallback || <DefaultLoadingSpinner />}>
      {children}
    </Suspense>
  );
}