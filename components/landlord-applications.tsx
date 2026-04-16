"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Check,
  X,
  Clock,
  Eye,
  EyeOff,
  CalendarClock,
  MessageSquare,
  Sparkles,
  Leaf,
  ChefHat,
  Moon,
  BookOpen,
  GraduationCap,
  ArrowRight,
  UserCheck,
  UserX,
  Inbox,
} from "lucide-react"

type AppStatus = "new" | "reviewed" | "shortlisted" | "accepted" | "rejected"

interface Applicant {
  id: number
  initials: string
  matchScore: number
  blindPhase: boolean
  status: AppStatus
  appliedDate: string
  lastActivity: string
  study: string
  semester: string
  age: number
  message: string
  traits: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }[]
}

const applicants: Applicant[] = [
  {
    id: 1,
    initials: "AS",
    matchScore: 92,
    blindPhase: false,
    status: "new",
    appliedDate: "Feb 6, 2026",
    lastActivity: "2 hours ago",
    study: "M.Sc. Computer Science",
    semester: "3rd semester",
    age: 25,
    message: "Hi! I'm a tidy, quiet student who loves cooking for flatmates. I work from home sometimes and value a calm environment. Looking forward to meeting you!",
    traits: [
      { label: "Cleanliness", value: 85, icon: Sparkles },
      { label: "Recycling", value: 90, icon: Leaf },
      { label: "Cooking", value: 75, icon: ChefHat },
      { label: "Quietness", value: 70, icon: Moon },
      { label: "Study Habits", value: 80, icon: BookOpen },
    ],
  },
  {
    id: 2,
    initials: "JL",
    matchScore: 87,
    blindPhase: true,
    status: "new",
    appliedDate: "Feb 5, 2026",
    lastActivity: "5 hours ago",
    study: "B.A. International Relations",
    semester: "5th semester",
    age: 22,
    message: "Looking for a friendly WG where I can focus on studies but also enjoy occasional dinners together. I'm very organized and respect shared spaces.",
    traits: [
      { label: "Cleanliness", value: 80, icon: Sparkles },
      { label: "Recycling", value: 70, icon: Leaf },
      { label: "Cooking", value: 60, icon: ChefHat },
      { label: "Quietness", value: 85, icon: Moon },
      { label: "Study Habits", value: 90, icon: BookOpen },
    ],
  },
  {
    id: 3,
    initials: "PR",
    matchScore: 84,
    blindPhase: true,
    status: "reviewed",
    appliedDate: "Feb 3, 2026",
    lastActivity: "1 day ago",
    study: "M.A. Urban Planning",
    semester: "1st semester",
    age: 24,
    message: "Just moved to Berlin and looking for a welcoming WG. I'm into sustainability, cycling, and making the apartment feel like home. Happy to contribute to shared cooking!",
    traits: [
      { label: "Cleanliness", value: 75, icon: Sparkles },
      { label: "Recycling", value: 95, icon: Leaf },
      { label: "Cooking", value: 80, icon: ChefHat },
      { label: "Quietness", value: 60, icon: Moon },
      { label: "Study Habits", value: 70, icon: BookOpen },
    ],
  },
  {
    id: 4,
    initials: "TN",
    matchScore: 81,
    blindPhase: false,
    status: "shortlisted",
    appliedDate: "Feb 1, 2026",
    lastActivity: "2 days ago",
    study: "B.Sc. Physics",
    semester: "4th semester",
    age: 21,
    message: "Easy-going student who keeps things clean and enjoys a good movie night. I'm a morning person and usually study at the library during the day.",
    traits: [
      { label: "Cleanliness", value: 70, icon: Sparkles },
      { label: "Recycling", value: 65, icon: Leaf },
      { label: "Cooking", value: 55, icon: ChefHat },
      { label: "Quietness", value: 75, icon: Moon },
      { label: "Study Habits", value: 85, icon: BookOpen },
    ],
  },
  {
    id: 5,
    initials: "KW",
    matchScore: 79,
    blindPhase: false,
    status: "accepted",
    appliedDate: "Jan 28, 2026",
    lastActivity: "3 days ago",
    study: "M.Sc. Environmental Science",
    semester: "2nd semester",
    age: 23,
    message: "Passionate about sustainability and community living. I love cooking plant-based meals and organizing small gatherings. Very respectful of quiet hours.",
    traits: [
      { label: "Cleanliness", value: 80, icon: Sparkles },
      { label: "Recycling", value: 98, icon: Leaf },
      { label: "Cooking", value: 85, icon: ChefHat },
      { label: "Quietness", value: 65, icon: Moon },
      { label: "Study Habits", value: 75, icon: BookOpen },
    ],
  },
]

const statusConfig: Record<AppStatus, { label: string; color: string }> = {
  new: { label: "New", color: "bg-primary/15 text-primary" },
  reviewed: { label: "Reviewed", color: "bg-muted text-muted-foreground" },
  shortlisted: { label: "Shortlisted", color: "bg-accent/15 text-accent" },
  accepted: { label: "Accepted", color: "bg-accent/15 text-accent" },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive" },
}

export function LandlordApplications({ onNavigateInterviews }: { onNavigateInterviews: () => void }) {
  const [apps, setApps] = useState(applicants)
  const [activeTab, setActiveTab] = useState("all")
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const filteredApps =
    activeTab === "all"
      ? apps
      : apps.filter((a) => a.status === activeTab)

  const counts = {
    all: apps.length,
    new: apps.filter((a) => a.status === "new").length,
    reviewed: apps.filter((a) => a.status === "reviewed").length,
    shortlisted: apps.filter((a) => a.status === "shortlisted").length,
    accepted: apps.filter((a) => a.status === "accepted").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  }

  const handleAccept = (id: number) => {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "accepted" as AppStatus } : a))
    )
  }

  const handleReject = (id: number) => {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "rejected" as AppStatus } : a))
    )
  }

  const handleShortlist = (id: number) => {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "shortlisted" as AppStatus } : a))
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        <MiniStat label="New" value={counts.new} highlight />
        <MiniStat label="Reviewed" value={counts.reviewed} />
        <MiniStat label="Shortlisted" value={counts.shortlisted} />
        <MiniStat label="Accepted" value={counts.accepted} accent />
        <MiniStat label="Rejected" value={counts.rejected} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto w-full justify-start gap-1 rounded-xl bg-muted p-1 flex-wrap">
          {(["all", "new", "shortlisted", "accepted", "rejected"] as const).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-lg text-xs gap-1.5 capitalize data-[state=active]:bg-card"
            >
              {tab}
              <Badge variant="secondary" className="h-5 min-w-5 rounded-full text-[10px] px-1.5">
                {counts[tab]}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="flex flex-col gap-4">
            {filteredApps.length === 0 ? (
              <Card className="rounded-2xl border-border shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Inbox className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No applications here</p>
                </CardContent>
              </Card>
            ) : (
              filteredApps.map((app) => (
                <ApplicantCard
                  key={app.id}
                  applicant={app}
                  isExpanded={expandedId === app.id}
                  onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  onAccept={() => handleAccept(app.id)}
                  onReject={() => handleReject(app.id)}
                  onShortlist={() => handleShortlist(app.id)}
                  onScheduleInterview={onNavigateInterviews}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ApplicantCard({
  applicant,
  isExpanded,
  onToggle,
  onAccept,
  onReject,
  onShortlist,
  onScheduleInterview,
}: {
  applicant: Applicant
  isExpanded: boolean
  onToggle: () => void
  onAccept: () => void
  onReject: () => void
  onShortlist: () => void
  onScheduleInterview: () => void
}) {
  const config = statusConfig[applicant.status]
  const isActionable = applicant.status === "new" || applicant.status === "reviewed" || applicant.status === "shortlisted"

  return (
    <Card className="rounded-2xl border-border shadow-sm transition-all hover:shadow-md">
      <CardContent className="p-0">
        {/* Compact header - always visible */}
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center gap-4 p-5 text-left"
        >
          <Avatar className="h-11 w-11 border-2 border-card shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
              {applicant.blindPhase ? "?" : applicant.initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-foreground">
                {applicant.blindPhase ? `Candidate #${applicant.id}` : `Candidate #${applicant.initials}`}
              </span>
              <Badge className={`rounded-full border-0 text-[10px] font-semibold ${config.color}`}>
                {config.label}
              </Badge>
              {applicant.blindPhase && (
                <Badge variant="secondary" className="gap-1 rounded-full text-[10px] font-semibold bg-primary/8 text-primary border-0">
                  <EyeOff className="h-3 w-3" />
                  Blind
                </Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground font-body">
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {applicant.study}
              </span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {applicant.lastActivity}
              </span>
            </div>
          </div>

          {/* Match score */}
          <div className="shrink-0 text-right">
            <span className="text-xl font-bold text-primary">{applicant.matchScore}%</span>
            <p className="text-[10px] text-muted-foreground">Match</p>
          </div>

          <ArrowRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        </button>

        {/* Expanded details */}
        {isExpanded && (
          <div className="border-t border-border px-5 pb-5 pt-4">
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Left: Message and info */}
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">APPLICATION MESSAGE</p>
                  <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-sm text-foreground font-body leading-relaxed">{applicant.message}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground font-body">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    {applicant.semester}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>{applicant.age} years old</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>Applied {applicant.appliedDate}</span>
                </div>
              </div>

              {/* Right: Compatibility traits */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">COMPATIBILITY TRAITS</p>
                <div className="flex flex-col gap-2.5">
                  {applicant.traits.map((trait) => {
                    const Icon = trait.icon
                    return (
                      <div key={trait.label} className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-xs font-medium text-foreground w-20 shrink-0">{trait.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${trait.value}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground w-8 text-right">{trait.value}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {isActionable && (
              <>
                <Separator className="my-4" />
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="sm"
                    className="rounded-xl gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={onAccept}
                  >
                    <UserCheck className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl gap-2 bg-transparent"
                    onClick={onShortlist}
                  >
                    <Eye className="h-4 w-4" />
                    Shortlist
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl gap-2 bg-transparent"
                    onClick={onScheduleInterview}
                  >
                    <CalendarClock className="h-4 w-4" />
                    Schedule Interview
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl gap-2 text-destructive hover:bg-destructive/10 bg-transparent"
                    onClick={onReject}
                  >
                    <UserX className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </>
            )}

            {/* Status for already decided */}
            {applicant.status === "accepted" && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center gap-2 text-sm font-medium text-accent">
                  <UserCheck className="h-4 w-4" />
                  This applicant has been accepted. Contact details shared.
                </div>
              </>
            )}
            {applicant.status === "rejected" && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <UserX className="h-4 w-4" />
                  This applicant has been declined.
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MiniStat({
  label,
  value,
  accent,
  highlight,
}: {
  label: string
  value: number
  accent?: boolean
  highlight?: boolean
}) {
  return (
    <Card className={`rounded-2xl border-border shadow-sm ${highlight && value > 0 ? "border-primary/30" : ""}`}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className={`text-2xl font-bold leading-tight ${accent ? "text-accent" : highlight ? "text-primary" : "text-foreground"}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
