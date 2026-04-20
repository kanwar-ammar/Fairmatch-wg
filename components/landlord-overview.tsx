"use client";

import React, { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Inbox,
  CalendarClock,
  Eye,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";

type ResidentApplicant = {
  id: string;
  initials: string;
  score: number;
  status: "new" | "viewed" | "interview" | "other";
  time: string;
};

type ResidentOverviewResponse = {
  newApplications: number;
  profileViews: number;
  interviews: number;
  matchesMade: number;
  recentApplicants: ResidentApplicant[];
  activity: {
    pending: number;
    viewed: number;
    interview: number;
  };
  listingCompleteness: number;
};

function formatDisplayName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function LandlordOverview({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [overview, setOverview] = useState<ResidentOverviewResponse | null>(
    null,
  );

  useEffect(() => {
    if (!currentUser?.id) return;

    const loadOverview = async () => {
      try {
        const response = await fetch(
          `/api/overview/resident?userId=${encodeURIComponent(currentUser.id)}`,
          { cache: "no-store" },
        );
        const result = (await response.json()) as ResidentOverviewResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(result.error || "Failed to load resident overview");
        }

        setOverview(result);
      } catch (error) {
        console.error("Failed to load resident overview:", error);
      }
    };

    void loadOverview();

    const interval = window.setInterval(() => {
      void loadOverview();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [currentUser?.id]);

  const displayName = currentUser?.fullName
    ? formatDisplayName(currentUser.fullName)
    : "Resident";
  const recentApplicants = overview?.recentApplicants ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-primary/8 border border-primary/15 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              Welcome back, {displayName}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground font-body leading-relaxed">
              You have {overview?.newApplications ?? 0} new applications and{" "}
              {overview?.interviews ?? 0} upcoming interviews.
            </p>
          </div>
          <Button
            className="rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onNavigate("ll-applications")}
          >
            <Inbox className="h-4 w-4" />
            Review Applications
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Inbox}
          label="New Applications"
          value={String(overview?.newApplications ?? 0)}
        />
        <StatCard
          icon={Eye}
          label="Profile Views"
          value={String(overview?.profileViews ?? 0)}
        />
        <StatCard
          icon={CalendarClock}
          label="Interviews"
          value={String(overview?.interviews ?? 0)}
          accent
        />
        <StatCard
          icon={CheckCircle2}
          label="Matches Made"
          value={String(overview?.matchesMade ?? 0)}
          accent
        />
      </div>

      {/* Listing completeness */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Listing Completeness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress
              value={overview?.listingCompleteness ?? 0}
              className="h-2.5 flex-1"
            />
            <span className="text-sm font-bold text-primary">
              {overview?.listingCompleteness ?? 0}%
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground font-body">
            Add more photos and update your house rules to reach 100% and
            attract better matches.
          </p>
        </CardContent>
      </Card>

      {/* Two columns: recent applicants + application activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent applicants */}
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Recent Applicants
              </CardTitle>
              <button
                type="button"
                onClick={() => onNavigate("ll-applications")}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {recentApplicants.map((a) => (
                <li key={a.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border-2 border-card">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {a.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        Candidate #{a.initials}
                      </span>
                      {a.status === "new" && (
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                      <Clock className="h-3 w-3" />
                      {a.time}
                    </div>
                  </div>
                  <Badge className="rounded-full bg-accent/15 text-accent border-0 text-xs font-bold px-2">
                    {a.score}%
                  </Badge>
                </li>
              ))}
            </ul>
            {!recentApplicants.length ? (
              <p className="text-sm text-muted-foreground">
                No applicants yet.
              </p>
            ) : null}
          </CardContent>
        </Card>

        {/* Application activity */}
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Application Activity
              </CardTitle>
              <button
                type="button"
                onClick={() => onNavigate("ll-applications")}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted/60 p-3 text-center">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {overview?.activity.pending ?? 0}
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3 text-center">
                <p className="text-xs text-muted-foreground">Viewed</p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {overview?.activity.viewed ?? 0}
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3 text-center">
                <p className="text-xs text-muted-foreground">Interview</p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {overview?.activity.interview ?? 0}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Manage interview scheduling and final decisions from the
              Applications tab.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            accent ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-lg font-bold text-foreground leading-tight">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
