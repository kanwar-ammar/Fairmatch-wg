"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  CalendarClock,
  Clock,
  Video,
  MapPin,
  Phone,
  Plus,
  X,
  Check,
  MessageSquare,
  GraduationCap,
  ChevronRight,
} from "lucide-react"

type InterviewStatus = "upcoming" | "completed" | "cancelled"

interface Interview {
  id: number
  candidateInitials: string
  candidateStudy: string
  matchScore: number
  date: string
  time: string
  type: "video" | "in-person" | "phone"
  location: string
  notes: string
  status: InterviewStatus
}

const initialInterviews: Interview[] = [
  {
    id: 1,
    candidateInitials: "KW",
    candidateStudy: "M.Sc. Environmental Science",
    matchScore: 79,
    date: "2026-02-12",
    time: "14:00",
    type: "video",
    location: "Zoom link shared via email",
    notes: "Wants to discuss shared cooking arrangements and recycling setup.",
    status: "upcoming",
  },
  {
    id: 2,
    candidateInitials: "AS",
    candidateStudy: "M.Sc. Computer Science",
    matchScore: 92,
    date: "2026-02-14",
    time: "10:30",
    type: "in-person",
    location: "At the WG - Gneisenaustr. 42",
    notes: "Very high match score. Interested in the room. Confirmed attendance.",
    status: "upcoming",
  },
  {
    id: 3,
    candidateInitials: "TN",
    candidateStudy: "B.Sc. Physics",
    matchScore: 81,
    date: "2026-02-10",
    time: "16:00",
    type: "phone",
    location: "Phone call",
    notes: "Quick introductory call. Seemed friendly and organized.",
    status: "completed",
  },
  {
    id: 4,
    candidateInitials: "LM",
    candidateStudy: "B.A. Communication",
    matchScore: 72,
    date: "2026-02-08",
    time: "11:00",
    type: "video",
    location: "Google Meet",
    notes: "Cancelled by candidate due to schedule conflict.",
    status: "cancelled",
  },
]

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  video: Video,
  "in-person": MapPin,
  phone: Phone,
}

const typeLabels: Record<string, string> = {
  video: "Video Call",
  "in-person": "In-Person",
  phone: "Phone Call",
}

const statusColors: Record<InterviewStatus, string> = {
  upcoming: "bg-primary/15 text-primary",
  completed: "bg-accent/15 text-accent",
  cancelled: "bg-muted text-muted-foreground",
}

export function LandlordInterviews() {
  const [interviews, setInterviews] = useState(initialInterviews)
  const [showScheduleForm, setShowScheduleForm] = useState(false)

  const upcoming = interviews.filter((i) => i.status === "upcoming")
  const past = interviews.filter((i) => i.status !== "upcoming")

  const markCompleted = (id: number) => {
    setInterviews((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "completed" as InterviewStatus } : i))
    )
  }

  const cancelInterview = (id: number) => {
    setInterviews((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "cancelled" as InterviewStatus } : i))
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">Scheduled Interviews</h3>
          <p className="mt-0.5 text-sm text-muted-foreground font-body">
            Manage your upcoming and past interviews with WG candidates.
          </p>
        </div>
        <Button
          className="rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowScheduleForm(!showScheduleForm)}
        >
          {showScheduleForm ? (
            <>
              <X className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Schedule Interview
            </>
          )}
        </Button>
      </div>

      {/* New interview form */}
      {showScheduleForm && (
        <Card className="rounded-2xl border-primary/20 shadow-sm bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Schedule New Interview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Candidate</Label>
                <Input placeholder="Candidate initials" className="rounded-xl" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Date</Label>
                <Input type="date" className="rounded-xl" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Time</Label>
                <Input type="time" className="rounded-xl" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Type</Label>
                <select className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
                  <option value="video">Video Call</option>
                  <option value="in-person">In-Person</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Location / Link</Label>
              <Input placeholder="Zoom link or address..." className="rounded-xl" />
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                className="rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setShowScheduleForm(false)}
              >
                <Check className="h-4 w-4" />
                Confirm Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Upcoming</p>
            <p className="text-2xl font-bold text-primary leading-tight">{upcoming.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Completed</p>
            <p className="text-2xl font-bold text-accent leading-tight">
              {interviews.filter((i) => i.status === "completed").length}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Cancelled</p>
            <p className="text-2xl font-bold text-muted-foreground leading-tight">
              {interviews.filter((i) => i.status === "cancelled").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming interviews */}
      {upcoming.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-foreground mb-4">Upcoming</h4>
          <div className="flex flex-col gap-4">
            {upcoming.map((iv) => (
              <InterviewCard
                key={iv.id}
                interview={iv}
                onComplete={() => markCompleted(iv.id)}
                onCancel={() => cancelInterview(iv.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past interviews */}
      {past.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-foreground mb-4">Past Interviews</h4>
          <div className="flex flex-col gap-4">
            {past.map((iv) => (
              <InterviewCard key={iv.id} interview={iv} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InterviewCard({
  interview,
  onComplete,
  onCancel,
}: {
  interview: Interview
  onComplete?: () => void
  onCancel?: () => void
}) {
  const TypeIcon = typeIcons[interview.type] || Video
  const isUpcoming = interview.status === "upcoming"
  const formattedDate = new Date(interview.date).toLocaleDateString("en-DE", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card className={`rounded-2xl border-border shadow-sm transition-all ${isUpcoming ? "hover:shadow-md" : "opacity-80"}`}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* Date block */}
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
            <span className="text-lg font-bold leading-none">
              {new Date(interview.date).getDate()}
            </span>
            <span className="text-[10px] font-semibold uppercase mt-0.5">
              {new Date(interview.date).toLocaleDateString("en-DE", { month: "short" })}
            </span>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-foreground">
                    Candidate #{interview.candidateInitials}
                  </span>
                  <Badge className={`rounded-full border-0 text-[10px] font-semibold ${statusColors[interview.status]}`}>
                    {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground font-body flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {interview.candidateStudy}
                </p>
              </div>
              <Badge className="rounded-full bg-accent/15 text-accent border-0 text-xs font-bold px-2 shrink-0">
                {interview.matchScore}%
              </Badge>
            </div>

            {/* Interview details */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground font-body">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formattedDate} at {interview.time}
              </span>
              <span className="flex items-center gap-1.5">
                <TypeIcon className="h-3.5 w-3.5" />
                {typeLabels[interview.type]}
              </span>
              <span className="flex items-center gap-1.5 text-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {interview.location}
              </span>
            </div>

            {/* Notes */}
            {interview.notes && (
              <div className="mt-3 rounded-xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground font-body leading-relaxed flex items-start gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  {interview.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            {isUpcoming && (
              <div className="mt-4 flex items-center gap-3">
                <Button
                  size="sm"
                  className="rounded-xl gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={onComplete}
                >
                  <Check className="h-3.5 w-3.5" />
                  Mark Completed
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl gap-2 text-destructive hover:bg-destructive/10 bg-transparent"
                  onClick={onCancel}
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
