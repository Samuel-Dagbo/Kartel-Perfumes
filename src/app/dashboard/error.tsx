"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-64 flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-rosegold/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-rosegold" />
        </div>
        <h2 className="text-lg font-serif mb-2">Something went wrong</h2>
        <p className="text-sm text-charcoal/40 mb-6">{error.message || "An error occurred"}</p>
        <Button variant="primary" size="sm" onClick={reset} icon={<RefreshCw className="w-4 h-4" />}>
          Try Again
        </Button>
      </div>
    </div>
  );
}