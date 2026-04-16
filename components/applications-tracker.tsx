"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ChevronRight,
  Users,
  ArrowRight,
  Send,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type ApplicationStatus = "pending" | "viewed" | "interview" | "accepted" | "rejected"

interface Application {
  id: number
  wgTitle: string
  district: string
  price: number
  roomSize: string
  appliedDate: string
  status: ApplicationStatus
  matchScore: number
  blindPhase: boolean
  lastUpdate: string
  residents: { name: string; initials: string }[]
  message?: string
}

const applications: Application[] = [
  {
    id: 1,
    wgTitle: "Sunny 3er-WG in Kreuzberg",
    district: "Kreuzberg",
    price: 480,
    roomSize: "18m\u00B2",
    appliedDate: "Jan 28, 2026",
    status: "interview",
    matchScore: 92,
    blindPhase: false,
    lastUpdate: "2 hours ago",
    residents: [
      { name: "Maria", initials: "MK" },
      { name: "Jonas", initials: "JB" },
    ],
    message: "We'd love to have you over for a coffee! Are you free this Saturday?",
  },
  {
    id: 2,
    wgTitle: "Green WG in Prenzlauer Berg",
    district: "Prenzlauer Berg",
    price: 510,
    roomSize: "16m\u00B2",
    appliedDate: "Feb 1, 2026",
    status: "viewed",
    matchScore: 84,
    blindPhase: true,
    lastUpdate: "1 day ago",
    residents: [
      { name: "Lena", initials: "LR" },
      { name: "Tom", initials: "TW" },
      { name: "Sara", initials: "SK" },
    ],
  },
  {
    id: 3,
    wgTitle: "Cozy room near TU Berlin",
    district: "Charlottenburg",
    price: 420,
    roomSize: "14m\u00B2",
    appliedDate: "Feb 3, 2026",
    status: "pending",
    matchScore: 87,
    blindPhase: true,
    lastUpdate: "3 days ago",
    residents: [{ name: "Felix", initials: "FH" }],
  },
  {
    id: 4,
    wgTitle: "Modern WG in Friedrichshain",
    district: "Friedrichshain",
    price: 530,
    roomSize: "20m\u00B2",
    appliedDate: "Jan 15, 2026",
    status: "accepted",
    matchScore: 81,
    blindPhase: false,
    lastUpdate: "5 days ago",
    residents: [
      { name: "Anna", initials: "AM" },
      { name: "David", initials: "DK" },
    ],
    message: "Congratulations! We'd love to have you. Let's discuss the move-in details.",
  },
  {
    id: 5,
    wgTitle: "Artist WG in Neuk\u00F6lln",
    district: "Neuk\u00F6lln",
    price: 390,
    roomSize: "15m\u00B2",
    appliedDate: "Jan 10, 2026",
    status: "rejected",
    matchScore: 78,
    blindPhase: false,
    lastUpdate: "1 week ago",
    residents: [
      { name: "Max", initials: "MR" },
      { name: "Lisa", initials: "LB" },
    ],
    message: "Thanks for applying! We found someone whose schedule better matches ours.",
  },
]

const statusConfig: Record<
  ApplicationStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  pending: { label: "Pending", icon: Clock, color: "bg-muted text-muted-foreground" },
  viewed: { label: "Viewed", icon: Eye, color: "bg-primary/15 text-primary" },
  interview: { label: "Interview", icon: MessageSquare, color: "bg-accent/15 text-accent" },
  accepted: { label: "Accepted", icon: CheckCircle2, color: "bg-accent/15 text-accent" },
  rejected: { label: "Declined", icon: XCircle, color: "bg-destructive/10 text-destructive" },
}

export function ApplicationsTracker() {
  const [activeTab, setActiveTab] = useState("all")

  const filteredApps =
    activeTab === "all"
      ? applications
      : applications.filter((app) => app.status === activeTab)

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    viewed: applications.filter((a) => a.status === "viewed").length,
    interview: applications.filter((a) => a.status === "interview").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Total Applied" value={counts.all} />
        <MiniStat label="In Progress" value={counts.pending + counts.viewed} />
        <MiniStat label="Interviews" value={counts.interview} accent />
        <MiniStat label="Accepted" value={counts.accepted} accent />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto w-full justify-start gap-1 rounded-xl bg-muted p-1 flex-wrap">
          <TabsTrigger value="all" className="rounded-lg text-xs gap-1.5 data-[state=active]:bg-card">
            All
            <Badge variant="secondary" className="h-5 min-w-5 rounded-full text-[10px] px-1.5">
              {counts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-lg text-xs gap-1.5 data-[state=active]:bg-card">
            Pending
            <Badge variant="secondary" className="h-5 min-w-5 rounded-full text-[10px] px-1.5">
              {counts.pending}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="interview" className="rounded-lg text-xs gap-1.5 data-[state=active]:bg-card">
            Interview
            <Badge variant="secondary" className="h-5 min-w-5 rounded-full text-[10px] px-1.5">
              {counts.interview}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="accepted" className="rounded-lg text-xs gap-1.5 data-[state=active]:bg-card">
            Accepted
            <Badge variant="secondary" className="h-5 min-w-5 rounded-full text-[10px] px-1.5">
              {counts.accepted}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-lg text-xs gap-1.5 data-[state=active]:bg-card">
            Declined
            <Badge variant="secondary" className="h-5 min-w-5 rounded-full text-[10px] px-1.5">
              {counts.rejected}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="flex flex-col gap-4">
            {filteredApps.length === 0 ? (
              <Card className="rounded-2xl border-border shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Send className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No applications in this category</p>
                </CardContent>
              </Card>
            ) : (
              filteredApps.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ApplicationCard({ application }: { application: Application }) {
  const config = statusConfig[application.status]
  const StatusIcon = config.icon

  return (
    <Card className="rounded-2xl border-border shadow-sm transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-foreground">{application.wgTitle}</h4>
                  <Badge className={`gap-1 rounded-full border-0 text-[10px] font-semibold ${config.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                  {application.blindPhase && (
                    <Badge variant="secondary" className="gap-1 rounded-full text-[10px] font-semibold bg-primary/8 text-primary border-0">
                      <EyeOff className="h-3 w-3" />
                      Blind Phase
                    </Badge>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-body">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {application.district}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>{application.roomSize}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>{"\u20AC"}{application.price}/mo</span>
                </div>
              </div>

              {/* Match score */}
              <div className="shrink-0 text-right">
                <span className="text-lg font-bold text-primary">{application.matchScore}%</span>
                <p className="text-[10px] text-muted-foreground">Match</p>
              </div>
            </div>

            {/* Residents */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-2">
                {application.residents.map((r) => (
                  <Avatar key={r.initials} className="h-7 w-7 border-2 border-card">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                      {r.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-body">
                {application.residents.map((r) => r.name).join(", ")}
              </span>
            </div>

            {/* Message */}
            {application.message && (
              <div className="mt-3 rounded-xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  {application.blindPhase ? (
                    <span className="italic">Message hidden during blind phase</span>
                  ) : (
                    <>
                      <span className="font-semibold text-foreground">
                        {application.residents[0]?.name}:
                      </span>{" "}
                      {application.message}
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-body">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Applied {application.appliedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Updated {application.lastUpdate}
                </span>
              </div>
              {(application.status === "interview" || application.status === "accepted") && (
                <Button size="sm" className="h-8 rounded-xl text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  {application.status === "interview" ? "Reply" : "Details"}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MiniStat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className={`text-2xl font-bold leading-tight ${accent ? "text-primary" : "text-foreground"}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
