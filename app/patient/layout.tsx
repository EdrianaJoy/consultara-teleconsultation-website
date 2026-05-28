/**
 * Patient Layout
 * 
 * Main layout wrapper for all patient pages.
 * Includes sidebar navigation, header, and authentication protection.
 * 
 * @module app/patient/layout
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

/**
 * Patient Layout Component
 * 
 * Protects patient routes and provides consistent layout structure.
 * Redirects unauthenticated users or non-patients to appropriate pages.
 */
export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Redirect if not authenticated
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    // Redirect if not a patient
    if (user.role !== "patient") {
      router.push("/doctor/dashboard");
      return;
    }
  }, [user, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated as patient
  if (!user || user.role !== "patient") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <Sidebar role="patient" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Header />
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
