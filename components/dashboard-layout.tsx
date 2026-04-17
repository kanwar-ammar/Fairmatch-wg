"use client";

import React from "react";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  User,
  Sliders,
  Search,
  FileText,
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
import { useAppSelector } from "@/store/hooks";

const navItems = [
  { label: "Dashboard", icon: Home, id: "dashboard" },
  { label: "My Profile", icon: User, id: "profile" },
  { label: "Preferences", icon: Sliders, id: "preferences" },
  { label: "Browse WGs", icon: Search, id: "browse" },
  { label: "Applications", icon: FileText, id: "applications" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSwitchRole?: () => void;
  onSignOut?: () => void;
}

export function DashboardLayout({
  children,
  activeTab,
  onTabChange,
  onSwitchRole,
  onSignOut,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const displayName = currentUser?.fullName?.trim() || "Your profile";
  const university = currentUser?.studentProfile?.university;
  const avatarUrl = currentUser?.avatarUrl ?? "/placeholder-avatar.jpg";
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
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
                  {item.id === "applications" && (
                    <Badge className="ml-auto h-5 min-w-5 rounded-full bg-primary-foreground/20 text-[10px] font-bold text-inherit border-0 px-1.5">
                      3
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
            <button
              type="button"
              onClick={onSwitchRole}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-primary hover:bg-sidebar-accent transition-colors"
            >
              <ArrowLeftRight className="h-[18px] w-[18px]" />
              Switch to Resident
            </button>
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
