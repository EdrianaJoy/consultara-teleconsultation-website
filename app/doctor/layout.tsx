/**
 * Doctor Layout
 * 
 * Main layout wrapper for all doctor pages.
 * Includes sidebar navigation, header, and authentication protection.
 * 
 * @module app/doctor/layout
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

/**
 * Doctor Layout Component
 * 
 * Protects doctor routes and provides consistent layout structure.
 * Redirects unauthenticated users or non-doctors to appropriate pages.
 */
export default function DoctorLayout({
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

    // Redirect if not a doctor
    if (user.role !== "doctor") {
      router.push("/patient/dashboard");
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

  // Don't render if not authenticated as doctor
  if (!user || user.role !== "doctor") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <Sidebar role="doctor" />

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
