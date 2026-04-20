"use client";

import React, { useEffect, useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Calendar, Inbox, MessageSquare } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

type ApplicationStatus =
  | "PENDING"
  | "VIEWED"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED";

type ApplicationItem = {
  id: string;
  status: ApplicationStatus;
  matchScore: number;
  appliedAt: string;
  updatedAt: string;
  message: string | null;
  homeProfile: {
    id: string;
    title: string;
    district: string;
    rentPrice: number;
    roomSizeM2: number | null;
  };
  interviews: Array<{
    id: string;
    scheduledAt: string;
    type: string;
    location: string | null;
    notes: string | null;
    status: string;
  }>;
  messages: Array<{
    id: string;
    text: string;
    createdAt: string;
    sender: {
      displayName: string | null;
      studentProfile: { fullName: string | null } | null;
      residentProfile: { fullName: string | null } | null;
    };
  }>;
};

const statusLabel: Record<ApplicationStatus, string> = {
  PENDING: "Pending",
  VIEWED: "Viewed",
  INTERVIEW: "Interview",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

const statusClass: Record<ApplicationStatus, string> = {
  PENDING: "bg-muted text-muted-foreground",
  VIEWED: "bg-primary/15 text-primary",
  INTERVIEW: "bg-accent/15 text-accent",
  ACCEPTED: "bg-accent/15 text-accent",
  REJECTED: "bg-destructive/10 text-destructive",
};

export function ApplicationsTracker({
  onNavigateMessages,
}: {
  onNavigateMessages?: (applicationId: string) => void;
}) {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [activeTab, setActiveTab] = useState("all");
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/applications?userId=${encodeURIComponent(currentUser.id)}&role=student`,
          { cache: "no-store" },
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load applications");
        }

        setApplications(result.applications || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load applications",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadApplications();
  }, [currentUser?.id]);

  const filteredApps = useMemo(() => {
    if (activeTab === "all") return applications;
    return applications.filter(
      (application) => application.status === activeTab,
    );
  }, [applications, activeTab]);

  const counts = {
    all: applications.length,
    PENDING: applications.filter((app) => app.status === "PENDING").length,
    INTERVIEW: applications.filter((app) => app.status === "INTERVIEW").length,
    ACCEPTED: applications.filter((app) => app.status === "ACCEPTED").length,
    REJECTED: applications.filter((app) => app.status === "REJECTED").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Loading applications...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto w-full justify-start gap-1 rounded-xl bg-muted p-1 flex-wrap">
          <TabsTrigger
            value="all"
            className="rounded-lg text-xs gap-1.5 data-[state=active]:bg-card"
          >
            All
            <Badge
              variant="secondary"
              className="h-5 min-w-5 rounded-full text-[10px] px-1.5"
            >
              {counts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="PENDING"
            className="rounded-lg text-xs gap-1.5 data-[state=active]:bg-card"
          >
            Pending
            <Badge
              variant="secondary"
              className="h-5 min-w-5 rounded-full text-[10px] px-1.5"
            >
              {counts.PENDING}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="INTERVIEW"
            className="rounded-lg text-xs gap-1.5 data-[state=active]:bg-card"
          >
            Interview
            <Badge
              variant="secondary"
              className="h-5 min-w-5 rounded-full text-[10px] px-1.5"
            >
              {counts.INTERVIEW}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="ACCEPTED"
            className="rounded-lg text-xs gap-1.5 data-[state=active]:bg-card"
          >
            Accepted
            <Badge
              variant="secondary"
              className="h-5 min-w-5 rounded-full text-[10px] px-1.5"
            >
              {counts.ACCEPTED}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="REJECTED"
            className="rounded-lg text-xs gap-1.5 data-[state=active]:bg-card"
          >
            Rejected
            <Badge
              variant="secondary"
              className="h-5 min-w-5 rounded-full text-[10px] px-1.5"
            >
              {counts.REJECTED}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="flex flex-col gap-4">
            {filteredApps.length === 0 ? (
              <Card className="rounded-2xl border-border shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Inbox className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No applications in this category
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredApps.map((application) => {
                const interview = application.interviews[0];
                const interviewDate = interview?.scheduledAt
                  ? new Date(interview.scheduledAt)
                  : null;
                return (
                  <Card
                    key={application.id}
                    className="rounded-2xl border-border shadow-sm transition-all hover:shadow-md"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-foreground">
                              {application.homeProfile.title}
                            </h4>
                            <Badge
                              className={`rounded-full border-0 text-[10px] font-semibold ${statusClass[application.status]}`}
                            >
                              {statusLabel[application.status]}
                            </Badge>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-body">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {application.homeProfile.district}
                            </span>
                            <span>
                              EUR {application.homeProfile.rentPrice}/mo
                            </span>
                            <span>
                              {application.homeProfile.roomSizeM2 || 0}m2
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {application.matchScore}%
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Match
                          </p>
                        </div>
                      </div>

                      {application.messages[0] ? (
                        <div className="mt-3 rounded-xl bg-muted/60 p-3">
                          <p className="text-xs text-muted-foreground font-body leading-relaxed">
                            {application.messages[0].text}
                          </p>
                        </div>
                      ) : null}

                      {interview && interviewDate ? (
                        <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Clock className="h-4 w-4 text-accent" />
                            Interview on {interviewDate.toLocaleString()}
                          </div>
                          {interview.location ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Location: {interview.location}
                            </p>
                          ) : null}
                          {interview.notes ? (
                            <p className="mt-2 text-sm text-foreground">
                              {interview.notes}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Applied{" "}
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() =>
                            onNavigateMessages?.(application.id)
                          }
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 hover:bg-accent/10 transition-colors text-foreground"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Chat
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
