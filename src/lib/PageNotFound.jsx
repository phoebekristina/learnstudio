import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-6xl font-bold text-muted-foreground/20 mb-4">404</div>
        <h1 className="text-xl font-semibold mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link to={createPageUrl("Dashboard")}>
          <Button variant="outline" size="sm" className="text-xs">
            <ArrowLeft className="w-3 h-3 mr-1.5" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}