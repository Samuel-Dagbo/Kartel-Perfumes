"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-b from-ivory to-mist/20 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 bg-rosegold/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-rosegold" />
            </div>
            <h1 className="text-2xl font-serif text-charcoal mb-3">Critical Error</h1>
            <p className="text-sm text-charcoal/40 mb-8">
              {error.message || "A critical error occurred. Please refresh the page."}
            </p>
            <Button variant="primary" onClick={reset} icon={<RefreshCw className="w-4 h-4" />}>
              Refresh Page
            </Button>
          </motion.div>
        </div>
      </body>
    </html>
  );
}