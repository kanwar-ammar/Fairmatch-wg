"use client";

import React, { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck,
  Eye,
  Heart,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppSelector } from "@/store/hooks";

type TopMatch = {
  id: string;
  title: string;
  price: number;
  roomSize: string;
  availableFrom: string | null;
  matchScore: number;
};

type StudentOverviewResponse = {
  uniqueProfileViews: number;
  wgMatchesCount: number;
  averageMatch: number;
  strongMatches: number;
  topMatches: TopMatch[];
  profileCompleteness: {
    percentage: number;
    missing: string[];
  };
};

const PROFILE_CHECK_LABELS = [
  "Full name",
  "Age",
  "About me",
  "WG bio",
  "University",
  "Degree program",
  "Semester",
  "Location",
  "Contact",
  "Hobbies",
  "Languages",
  "Minimum budget",
  "Maximum budget",
  "Preferred districts",
  "Move-in date",
  "Profile photo",
];

function getLocalMissingFields(currentUser: {
  studentProfile?: {
    fullName?: string | null;
    age?: number | null;
    bio?: string | null;
    houseBio?: string | null;
    university?: string | null;
    degreeProgram?: string | null;
    semester?: string | null;
    location?: string | null;
    contact?: string | null;
    hobbies?: string | null;
    languages?: string | null;
    budgetMin?: number | null;
    budgetMax?: number | null;
    preferredDistricts?: string | null;
    moveInDate?: string | null;
    avatarUrl?: string | null;
  } | null;
} | null | undefined) {
  const profile = currentUser?.studentProfile;

  return [
    !profile?.fullName?.trim() ? "Full name" : null,
    profile?.age === null || profile?.age === undefined ? "Age" : null,
    !profile?.bio?.trim() ? "About me" : null,
    !profile?.houseBio?.trim() ? "WG bio" : null,
    !profile?.university?.trim() ? "University" : null,
    !profile?.degreeProgram?.trim() ? "Degree program" : null,
    !profile?.semester?.trim() ? "Semester" : null,
    !profile?.location?.trim() ? "Location" : null,
    !profile?.contact?.trim() ? "Contact" : null,
    !profile?.hobbies?.trim() ? "Hobbies" : null,
    !profile?.languages?.trim() ? "Languages" : null,
    profile?.budgetMin === null || profile?.budgetMin === undefined
      ? "Minimum budget"
      : null,
    profile?.budgetMax === null || profile?.budgetMax === undefined
      ? "Maximum budget"
      : null,
    !profile?.preferredDistricts?.trim() ? "Preferred districts" : null,
    !profile?.moveInDate?.trim() ? "Move-in date" : null,
    !profile?.avatarUrl?.trim() ? "Profile photo" : null,
  ].filter((item): item is string => Boolean(item));
}

export function DashboardOverview({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [overview, setOverview] = useState<StudentOverviewResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const displayName = currentUser?.fullName?.trim() || "Your profile";

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    const loadOverview = async () => {
      try {
        const response = await fetch(
          `/api/overview/student?userId=${encodeURIComponent(currentUser.id)}`,
          { cache: "no-store" },
        );
        const result = (await response.json()) as StudentOverviewResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(result.error || "Failed to load overview");
        }

        setOverview(result);
      } catch (error) {
        console.error("Failed to load student overview:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadOverview();

    const interval = window.setInterval(() => {
      void loadOverview();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [currentUser?.id]);

  const hasApiOverview = Boolean(overview);
  const apiCompleteness = overview?.profileCompleteness.percentage;
  const apiMissingFields = overview?.profileCompleteness.missing ?? [];
  const localMissingFields = getLocalMissingFields(currentUser);
  const missingFields = hasApiOverview ? apiMissingFields : localMissingFields;
  const localCompleteness = Math.round(
    ((PROFILE_CHECK_LABELS.length - localMissingFields.length) /
      PROFILE_CHECK_LABELS.length) *
      100,
  );
  const completeness = hasApiOverview ? (apiCompleteness ?? 0) : localCompleteness;
  const topMatches = overview?.topMatches ?? [];
  const hasMissing = missingFields.length > 0 || completeness < 100;
  const isProfileComplete = !hasMissing && completeness >= 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome section */}
      <div className="rounded-2xl bg-primary/8 border border-primary/15 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              Welcome {displayName}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground font-body leading-relaxed">
              {loading
                ? "Loading your latest matching insights..."
                : `You currently have ${overview?.strongMatches ?? 0} strong WG matches waiting for you.`}
            </p>
          </div>
          <Button
            className="rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onNavigate("browse")}
          >
            <Sparkles className="h-4 w-4" />
            View Matches
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={ShieldCheck}
          label="Verification"
          value={
            currentUser?.studentProfile?.verificationStatus === "VERIFIED"
              ? "Complete"
              : "Pending"
          }
          accent
        />
        <StatCard
          icon={Eye}
          label="Unique Profile Views"
          value={String(overview?.uniqueProfileViews ?? 0)}
        />
        <StatCard
          icon={Heart}
          label="WG Match Avg"
          value={`${overview?.averageMatch ?? 0}%`}
          subtext={`${overview?.wgMatchesCount ?? 0} live listings`}
        />
      </div>

      {/* Profile completeness */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">
              Profile Completeness
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    What is missing?
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {hasMissing ? (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">Missing fields</p>
                      <ul className="text-xs space-y-0.5">
                        {(missingFields.length
                          ? missingFields
                          : ["Complete your student profile details"]).map((field) => (
                          <li key={field}>- {field}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold">
                      All profile details are complete.
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={completeness} className="h-2.5 flex-1" />
            <span className="text-sm font-bold text-primary">
              {completeness}%
            </span>
          </div>
          {!isProfileComplete ? (
            <p className="mt-2 text-sm text-muted-foreground font-body">
              Complete your remaining profile details to improve matching.{" "}
              <button
                type="button"
                className="text-primary font-medium hover:underline"
                onClick={() => onNavigate("profile")}
              >
                Go to profile
              </button>
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground font-body">
              Your profile is complete. You are at 100%.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top matches */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">
            Top WG Matches
          </h3>
          <button
            type="button"
            onClick={() => onNavigate("browse")}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topMatches.map((wg) => (
            <Card
              key={wg.id}
              className="group cursor-pointer rounded-2xl border-border shadow-sm transition-all hover:shadow-md hover:border-primary/30"
              onClick={() => onNavigate("browse")}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {wg.title}
                  </h4>
                  <Badge className="shrink-0 rounded-full bg-accent/15 text-accent border-0 text-xs font-bold px-2">
                    {wg.matchScore}%
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground font-body">
                  <span>{wg.roomSize}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>From {wg.availableFrom || "Flexible"}</span>
                </div>
                <p className="mt-2 text-lg font-bold text-foreground">
                  {"\u20AC"}
                  {wg.price}
                  <span className="text-xs font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        {!topMatches.length ? (
          <Card className="rounded-2xl border-dashed mt-4">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No live WG matches available yet.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext?: string;
  accent?: boolean;
}) {
  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            accent ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-lg font-bold text-foreground leading-tight">
            {value}
          </p>
          {subtext ? (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {subtext}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
