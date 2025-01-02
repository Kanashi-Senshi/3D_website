// src/components/layout.tsx
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <div className="relative flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
