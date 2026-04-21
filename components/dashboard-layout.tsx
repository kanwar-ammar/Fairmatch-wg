"use client";

import React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  User,
  Sliders,
  Search,
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppSelector } from "@/store/hooks";

const navItems = [
  { label: "Dashboard", icon: Home, id: "dashboard" },
  { label: "My Profile", icon: User, id: "profile" },
  { label: "Preferences", icon: Sliders, id: "preferences" },
  { label: "Browse WGs", icon: Search, id: "browse" },
  { label: "Applications", icon: FileText, id: "applications" },
  { label: "Messages", icon: MessageSquare, id: "messages" },
];

function formatDisplayName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSwitchRole?: () => void;
  onRegisterWg?: () => void;
  onSignOut?: () => void;
}

export function DashboardLayout({
  children,
  activeTab,
  onTabChange,
  onSwitchRole,
  onRegisterWg,
  onSignOut,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applicationCount, setApplicationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  // Fetch application count (pending + interview)
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchCounts = async () => {
      try {
        const [appRes, msgRes] = await Promise.all([
          fetch(
            `/api/applications/count?userId=${encodeURIComponent(currentUser.id)}&role=student`,
            { cache: "no-store" },
          ),
          fetch(
            `/api/messages/unread-count?userId=${encodeURIComponent(currentUser.id)}&role=student`,
            { cache: "no-store" },
          ),
        ]);

        if (appRes.ok) {
          const data = (await appRes.json()) as { count: number };
          setApplicationCount(data.count);
        }

        if (msgRes.ok) {
          const data = (await msgRes.json()) as { count: number };
          setMessageCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch counts:", error);
      }
    };

    void fetchCounts();

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      void fetchCounts();
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const displayName = currentUser?.fullName
    ? formatDisplayName(currentUser.fullName)
    : "Your profile";
  const university = currentUser?.studentProfile?.university;
  const avatarUrl = currentUser?.avatarUrl ?? "/placeholder-avatar.jpg";
  const canUseResident = Boolean(currentUser?.capabilities?.canUseResident);
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";
  const isVerified =
    currentUser?.studentProfile?.verificationStatus === "VERIFIED";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-background">
            <Image
              src="/logo.png"
              alt="FairMatch logo"
              width={40}
              height={40}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">
              FairMatch
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              WG Matching
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* User section */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent p-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={avatarUrl} alt={`${displayName} avatar`} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {displayName}
              </p>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="secondary"
                  className="h-5 bg-accent/15 text-accent border-0 text-[10px] font-semibold px-1.5"
                >
                  {isVerified ? "Verified" : "Student"}
                </Badge>
                {university ? (
                  <span className="text-[10px] text-muted-foreground">
                    {university}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 px-3 py-2"
          role="navigation"
          aria-label="Main navigation"
        >
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                  {item.id === "applications" && applicationCount > 0 && (
                    <Badge className="ml-auto h-5 min-w-5 rounded-full bg-primary-foreground/20 text-[10px] font-bold text-inherit border-0 px-1.5">
                      {applicationCount}
                    </Badge>
                  )}
                  {item.id === "messages" && messageCount > 0 && (
                    <Badge className="ml-auto h-5 min-w-5 rounded-full bg-primary-foreground/20 text-[10px] font-bold text-inherit border-0 px-1.5">
                      {messageCount}
                    </Badge>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="border-t border-sidebar-border p-3 flex flex-col gap-1">
          {onSwitchRole && (
            <TooltipProvider>
              <div className="flex flex-col gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block w-full">
                      <button
                        type="button"
                        onClick={onSwitchRole}
                        disabled={!canUseResident}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent text-primary hover:bg-sidebar-accent"
                      >
                        <ArrowLeftRight className="h-[18px] w-[18px]" />
                        Switch to Resident
                      </button>
                    </span>
                  </TooltipTrigger>
                  {canUseResident ? (
                    <TooltipContent side="right" className="max-w-xs">
                      Switch to Resident to manage your WG, applications, and listings.
                    </TooltipContent>
                  ) : (
                    <TooltipContent side="right" className="max-w-xs">
                      You can switch to Resident only after creating your own WG or
                      being added to one.
                    </TooltipContent>
                  )}
                </Tooltip>

                {onRegisterWg && !canUseResident ? (
                  <button
                    type="button"
                    onClick={onRegisterWg}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-primary hover:bg-sidebar-accent transition-colors"
                  >
                    <Home className="h-[18px] w-[18px]" />
                    Register your own WG
                  </button>
                ) : null}
              </div>
            </TooltipProvider>
          )}
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 border-b border-border bg-card px-4 py-3 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">
              {navItems.find((item) => item.id === activeTab)?.label ??
                "Dashboard"}
            </h2>
          </div>
          <Link
            href="#"
            className="text-sm font-medium text-primary hover:underline"
          >
            Help Center
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
