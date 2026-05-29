/**
 * Sidebar Component
 * 
 * Reusable navigation sidebar for both Patient and Doctor dashboards.
 * Features:
 * - Responsive design (collapsible on mobile)
 * - Role-based navigation items
 * - Active state highlighting
 * - ConsulTara branding
 * 
 * @module components/sidebar
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Stethoscope, 
  Phone, 
  MessageSquare, 
  FileText, 
  Calendar, 
  HelpCircle, 
  LogOut,
  Menu,
  X,
  Users,
  Clock,
  ClipboardList,
  Bot,
  Bell
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

/**
 * Navigation item configuration
 */
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

/**
 * Navigation section with grouped items
 */
interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Get navigation sections based on user role
 */
function getNavSections(role: "patient" | "doctor"): NavSection[] {
  if (role === "patient") {
    return [
      {
        title: "General",
        items: [
          { label: "Dashboard", href: "/patient/dashboard", icon: <LayoutDashboard size={20} /> },
          { label: "Our Services", href: "/patient/services", icon: <Stethoscope size={20} /> },
          { label: "Consulty AI", href: "/patient/consulty", icon: <Bot size={20} /> },
          { label: "Contact Us", href: "/patient/contact", icon: <Phone size={20} /> },
        ],
      },
      {
        title: "Personal",
        items: [
          { label: "Messages", href: "/patient/messages", icon: <MessageSquare size={20} /> },
          { label: "Notifications", href: "/patient/notifications", icon: <Bell size={20} /> },
          { label: "Medical Records", href: "/patient/records", icon: <FileText size={20} /> },
          { label: "Calendar", href: "/patient/calendar", icon: <Calendar size={20} /> },
        ],
      },
    ];
  }
  
  // Doctor navigation
  return [
    {
      title: "General",
      items: [
        { label: "Dashboard", href: "/doctor/dashboard", icon: <LayoutDashboard size={20} /> },
        { label: "My Schedule", href: "/doctor/schedule", icon: <Clock size={20} /> },
        { label: "Patients", href: "/doctor/patients", icon: <Users size={20} /> },
      ],
    },
    {
      title: "Personal",
      items: [
        { label: "Messages", href: "/doctor/messages", icon: <MessageSquare size={20} /> },
        { label: "Consultations", href: "/doctor/consultations", icon: <ClipboardList size={20} /> },
        { label: "Calendar", href: "/doctor/calendar", icon: <Calendar size={20} /> },
      ],
    },
  ];
}

/**
 * Sidebar Props
 */
interface SidebarProps {
  role: "patient" | "doctor";
}

/**
 * Main Sidebar Component
 * 
 * Renders a responsive sidebar with navigation items based on user role.
 * Includes mobile toggle functionality and logout capability.
 */
export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const navSections = getNavSections(role);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // Redirect to the main landing page even if sign-out fails.
      router.push('/');
    }
  };

  const handleHelpClick = () => {
    // Navigate to how it works section on landing page
    router.push('/#how-it-works');
  };

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <Link href="/" className="p-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
          <img 
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ConsulTara%20Logo-oqtBESzen2QQnxkVKzgc7RxAQEbHnb.png" 
            alt="ConsulTara Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-xl font-semibold text-primary">ConsulTara</span>
      </Link>

      {/* Navigation Sections */}
      <nav className="flex-1 px-4 py-2">
        {navSections.map((section, sectionIndex) => (
          <div key={section.title} className={cn(sectionIndex > 0 && "mt-8")}>
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleHelpClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <HelpCircle size={20} />
          Help
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-md"
        aria-label="Toggle navigation menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
