"use client";

import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck,
  Eye,
  Heart,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";

const recentWGs = [
  {
    id: 1,
    title: "Sunny 3er-WG in Kreuzberg",
    price: 480,
    match: 92,
    size: "18m\u00B2",
    available: "Mar 1",
  },
  {
    id: 2,
    title: "Cozy room near TU Berlin",
    price: 420,
    match: 87,
    size: "14m\u00B2",
    available: "Apr 1",
  },
  {
    id: 3,
    title: "Green WG in Prenzlauer Berg",
    price: 510,
    match: 84,
    size: "16m\u00B2",
    available: "Mar 15",
  },
];

export function DashboardOverview({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) {
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const displayName = currentUser?.fullName?.trim() || "Your profile";

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome section */}
      <div className="rounded-2xl bg-primary/8 border border-primary/15 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              Welcom {displayName}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground font-body leading-relaxed">
              Your profile is looking great. You have 3 new matches waiting for
              you.
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
          value="Complete"
          accent
        />
        <StatCard icon={Eye} label="Profile Views" value="24" />
        <StatCard icon={Heart} label="WG Matches" value="12" />
        <StatCard icon={MessageSquare} label="Messages" value="5" />
      </div>

      {/* Profile completeness */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Profile Completeness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={78} className="h-2.5 flex-1" />
            <span className="text-sm font-bold text-primary">78%</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground font-body">
            Add a photo gallery and complete your preferences to boost your
            match rate.
          </p>
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
          {recentWGs.map((wg) => (
            <Card
              key={wg.id}
              className="group cursor-pointer rounded-2xl border-border shadow-sm transition-all hover:shadow-md hover:border-primary/30"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {wg.title}
                  </h4>
                  <Badge className="shrink-0 rounded-full bg-accent/15 text-accent border-0 text-xs font-bold px-2">
                    {wg.match}%
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground font-body">
                  <span>{wg.size}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>From {wg.available}</span>
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
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
