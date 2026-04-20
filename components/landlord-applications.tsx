"use client";

import React, { useEffect, useMemo, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CalendarClock,
  Check,
  Clock,
  Inbox,
  MessageSquare,
  Send,
  X,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";

type ApplicationStatus =
  | "PENDING"
  | "VIEWED"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED";

type ResidentApplication = {
  id: string;
  status: ApplicationStatus;
  matchScore: number;
  appliedAt: string;
  updatedAt: string;
  message: string | null;
  student: {
    id: string;
    email: string;
    displayName: string | null;
    studentProfile: {
      fullName: string | null;
      university: string | null;
      degreeProgram: string | null;
      semester: string | null;
      age: number | null;
      bio: string | null;
      houseBio: string | null;
      contact: string | null;
      hobbies: string | null;
      languages: string | null;
      location: string | null;
    } | null;
  };
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

const statusClass: Record<ApplicationStatus, string> = {
  PENDING: "bg-muted text-muted-foreground",
  VIEWED: "bg-primary/15 text-primary",
  INTERVIEW: "bg-accent/15 text-accent",
  ACCEPTED: "bg-accent/15 text-accent",
  REJECTED: "bg-destructive/10 text-destructive",
};

const statusLabel: Record<ApplicationStatus, string> = {
  PENDING: "Pending",
  VIEWED: "Viewed",
  INTERVIEW: "Interview",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

export function LandlordApplications({
  onNavigateMessages,
}: {
  onNavigateMessages?: () => void;
}) {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [activeTab, setActiveTab] = useState("all");
  const [applications, setApplications] = useState<ResidentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedulingApplication, setSchedulingApplication] =
    useState<ResidentApplication | null>(null);
  const [acceptingApplication, setAcceptingApplication] =
    useState<ResidentApplication | null>(null);
  const [profileApplication, setProfileApplication] =
    useState<ResidentApplication | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    notes: "",
    location: "",
    interviewType: "in-person",
  });

  const loadApplications = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/applications?userId=${encodeURIComponent(currentUser.id)}&role=resident`,
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

  useEffect(() => {
    void loadApplications();
  }, [currentUser?.id]);

  const scheduleInterview = async () => {
    if (!currentUser?.id || !schedulingApplication) return;

    const scheduledAt =
      scheduleForm.date && scheduleForm.time
        ? new Date(`${scheduleForm.date}T${scheduleForm.time}`)
        : null;
    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      setError("Please select a valid interview date and time.");
      return;
    }

    try {
      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          applicationId: schedulingApplication.id,
          status: "INTERVIEW",
          scheduledAt: scheduledAt.toISOString(),
          notes: scheduleForm.notes,
          location: scheduleForm.location,
          interviewType: scheduleForm.interviewType,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to schedule interview");
      }

      setSchedulingApplication(null);
      await loadApplications();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to schedule interview",
      );
    }
  };

  const acceptApplicant = async () => {
    if (!currentUser?.id || !acceptingApplication) return;

    try {
      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          applicationId: acceptingApplication.id,
          status: "ACCEPTED",
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to accept applicant");
      }

      setAcceptingApplication(null);
      await loadApplications();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to accept applicant",
      );
    }
  };

  const rejectApplicant = async (applicationId: string) => {
    if (!currentUser?.id) return;

    try {
      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          applicationId,
          status: "REJECTED",
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to reject applicant");
      }

      await loadApplications();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject applicant",
      );
    }
  };

  const openProfile = async (application: ResidentApplication) => {
    if (currentUser?.id) {
      try {
        await fetch("/api/profile-views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: application.student.id,
            viewerId: currentUser.id,
          }),
        });
      } catch (error) {
        console.error("Failed to record profile view:", error);
      }
    }

    setProfileApplication(application);
  };

  const filtered = useMemo(() => {
    if (activeTab === "all") return applications;
    return applications.filter(
      (application) => application.status === activeTab,
    );
  }, [activeTab, applications]);

  const counts = {
    all: applications.length,
    PENDING: applications.filter(
      (application) => application.status === "PENDING",
    ).length,
    INTERVIEW: applications.filter(
      (application) => application.status === "INTERVIEW",
    ).length,
    ACCEPTED: applications.filter(
      (application) => application.status === "ACCEPTED",
    ).length,
    REJECTED: applications.filter(
      (application) => application.status === "REJECTED",
    ).length,
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Loading applications...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
          <CardContent className="flex gap-3 py-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
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
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <Card className="rounded-2xl">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  <Inbox className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                  No applications in this view.
                </CardContent>
              </Card>
            ) : (
              filtered.map((application) => {
                const studentName =
                  application.student.displayName ||
                  application.student.studentProfile?.fullName ||
                  application.student.email;
                const initials =
                  studentName
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("") || "ST";
                const interview = application.interviews[0];
                const interviewDateTime = interview?.scheduledAt
                  ? new Date(interview.scheduledAt)
                  : null;

                return (
                  <Card
                    key={application.id}
                    className="rounded-2xl border-border shadow-sm"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10 border-2 border-card">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">
                                {studentName}
                              </p>
                              <Badge
                                className={`rounded-full border-0 text-[10px] ${statusClass[application.status]}`}
                              >
                                {statusLabel[application.status]}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="rounded-full text-[10px]"
                              >
                                {application.matchScore}% match
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {application.homeProfile.title} -{" "}
                              {application.homeProfile.district}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {application.student.studentProfile
                                ?.degreeProgram || "Student"}
                              {application.student.studentProfile?.semester
                                ? `, ${application.student.studentProfile.semester}`
                                : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {application.status !== "ACCEPTED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl gap-1"
                              onClick={() => {
                                setSchedulingApplication(application);
                                const nextDate =
                                  interviewDateTime ?? new Date();
                                setScheduleForm({
                                  date: nextDate.toISOString().slice(0, 10),
                                  time: nextDate.toISOString().slice(11, 16),
                                  notes: interview?.notes || "",
                                  location: interview?.location || "",
                                  interviewType: interview?.type || "in-person",
                                });
                              }}
                            >
                              <CalendarClock className="h-3.5 w-3.5" />
                              {interview
                                ? "Reschedule Interview"
                                : "Schedule Interview"}
                            </Button>
                          ) : null}
                          {application.status !== "ACCEPTED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl gap-1"
                              onClick={() =>
                                setAcceptingApplication(application)
                              }
                            >
                              <Check className="h-3.5 w-3.5" />
                              Accept
                            </Button>
                          ) : null}
                          {application.status !== "REJECTED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl gap-1"
                              onClick={() =>
                                void rejectApplicant(application.id)
                              }
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl gap-1"
                            onClick={() => onNavigateMessages?.()}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Chat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl gap-1"
                            onClick={() => void openProfile(application)}
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>

                      {application.messages[0] ? (
                        <div className="mt-4 rounded-xl bg-muted/60 p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Latest message
                          </p>
                          <p className="text-sm text-foreground">
                            {application.messages[0].text}
                          </p>
                        </div>
                      ) : null}

                      {interview && interviewDateTime ? (
                        <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Clock className="h-4 w-4 text-accent" />
                            Interview scheduled for{" "}
                            {interviewDateTime.toLocaleString()}
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
                      ) : application.status === "INTERVIEW" ? (
                        <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-3 text-sm text-foreground">
                          Interview requested. Schedule it from the Interview
                          button.
                        </div>
                      ) : null}

                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Applied{" "}
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-xl gap-1"
                          onClick={() => onNavigateMessages?.()}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Open chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={Boolean(schedulingApplication)}
        onOpenChange={(open) => !open && setSchedulingApplication(null)}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Pick a date, time, and notes for the applicant. This will update
              the application status to interview.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Interview Date</Label>
              <Input
                type="date"
                value={scheduleForm.date}
                onChange={(event) =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    date: event.target.value,
                  }))
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Interview Time</Label>
              <Input
                type="time"
                value={scheduleForm.time}
                onChange={(event) =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    time: event.target.value,
                  }))
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Interview Type</Label>
              <select
                value={scheduleForm.interviewType}
                onChange={(event) =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    interviewType: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="in-person">In-Person</option>
                <option value="video">Video Call</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Location or Link</Label>
              <Input
                value={scheduleForm.location}
                onChange={(event) =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    location: event.target.value,
                  }))
                }
                className="rounded-xl"
                placeholder="Room, address, or call link"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Notes</Label>
              <textarea
                value={scheduleForm.notes}
                onChange={(event) =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                rows={4}
                className="w-full rounded-xl border border-input bg-background p-3 text-sm"
                placeholder="Bring ID, enrollment proof, or any other documents..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl bg-transparent"
              onClick={() => setSchedulingApplication(null)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl gap-2"
              onClick={() => void scheduleInterview()}
            >
              <Send className="h-4 w-4" />
              Save Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(acceptingApplication)}
        onOpenChange={(open) => !open && setAcceptingApplication(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Accept Applicant</DialogTitle>
            <DialogDescription>
              Please confirm the following actions before accepting this
              applicant:
            </DialogDescription>
          </DialogHeader>

          <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
            <li>The applicant will be added to this WG as a member.</li>
            <li>
              All other pending or interview applications for this listing will
              become rejected.
            </li>
            <li>
              All application chats and history will remain available for
              review.
            </li>
          </ul>

          <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-foreground">
            <p className="font-semibold">
              {acceptingApplication?.student.displayName ||
                acceptingApplication?.student.studentProfile?.fullName ||
                acceptingApplication?.student.email}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {acceptingApplication?.homeProfile.title}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl bg-transparent"
              onClick={() => setAcceptingApplication(null)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl gap-2"
              onClick={() => void acceptApplicant()}
            >
              <Check className="h-4 w-4" />
              Accept Applicant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(profileApplication)}
        onOpenChange={(open) => !open && setProfileApplication(null)}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Applicant Profile</DialogTitle>
            <DialogDescription>
              Review profile details before scheduling or accepting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="font-semibold text-foreground">
                {profileApplication?.student.displayName ||
                  profileApplication?.student.studentProfile?.fullName ||
                  profileApplication?.student.email}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">University</p>
                <p className="text-foreground">
                  {profileApplication?.student.studentProfile?.university ||
                    "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Program</p>
                <p className="text-foreground">
                  {profileApplication?.student.studentProfile?.degreeProgram ||
                    "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Semester</p>
                <p className="text-foreground">
                  {profileApplication?.student.studentProfile?.semester || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-foreground">
                  {profileApplication?.student.studentProfile?.location || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="text-foreground">
                  {profileApplication?.student.studentProfile?.age ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Languages</p>
                <p className="text-foreground">
                  {profileApplication?.student.studentProfile?.languages || "-"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contact</p>
              <p className="text-foreground">
                {profileApplication?.student.studentProfile?.contact ||
                  profileApplication?.student.email ||
                  "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bio</p>
              <p className="text-foreground whitespace-pre-wrap">
                {profileApplication?.student.studentProfile?.bio || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">WG-specific Bio</p>
              <p className="text-foreground whitespace-pre-wrap">
                {profileApplication?.student.studentProfile?.houseBio || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hobbies</p>
              <p className="text-foreground">
                {profileApplication?.student.studentProfile?.hobbies || "-"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl bg-transparent"
              onClick={() => setProfileApplication(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
