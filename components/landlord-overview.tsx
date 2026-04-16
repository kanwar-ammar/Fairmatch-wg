"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Inbox,
  CalendarClock,
  Eye,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react"

const recentApplicants = [
  { id: 1, initials: "AS", score: 92, status: "new", time: "2h ago" },
  { id: 2, initials: "JL", score: 87, status: "new", time: "5h ago" },
  { id: 3, initials: "PR", score: 84, status: "viewed", time: "1d ago" },
  { id: 4, initials: "TN", score: 81, status: "viewed", time: "2d ago" },
  { id: 5, initials: "KW", score: 79, status: "interview", time: "3d ago" },
]

const upcomingInterviews = [
  { id: 1, initials: "KW", date: "Feb 12, 2026", time: "14:00", type: "Video Call" },
  { id: 2, initials: "AS", date: "Feb 14, 2026", time: "10:30", type: "In-Person" },
]

export function LandlordOverview({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-primary/8 border border-primary/15 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">Welcome back, Maria</h3>
            <p className="mt-1 text-sm text-muted-foreground font-body leading-relaxed">
              You have 5 new applications and 2 upcoming interviews this week.
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
        <StatCard icon={Inbox} label="New Applications" value="5" />
        <StatCard icon={Eye} label="Profile Views" value="38" />
        <StatCard icon={CalendarClock} label="Interviews" value="2" accent />
        <StatCard icon={CheckCircle2} label="Matches Made" value="1" accent />
      </div>

      {/* Listing completeness */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Listing Completeness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={85} className="h-2.5 flex-1" />
            <span className="text-sm font-bold text-primary">85%</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground font-body">
            Add more photos and update your house rules to reach 100% and attract better matches.
          </p>
        </CardContent>
      </Card>

      {/* Two columns: recent applicants + upcoming interviews */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent applicants */}
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Applicants</CardTitle>
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
                      <span className="text-sm font-semibold text-foreground">Candidate #{a.initials}</span>
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
          </CardContent>
        </Card>

        {/* Upcoming interviews */}
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Upcoming Interviews</CardTitle>
              <button
                type="button"
                onClick={() => onNavigate("ll-interviews")}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingInterviews.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <CalendarClock className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming interviews</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {upcomingInterviews.map((iv) => (
                  <li key={iv.id} className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
                    <Avatar className="h-9 w-9 border-2 border-card">
                      <AvatarFallback className="bg-accent/15 text-accent text-xs font-semibold">
                        {iv.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">Candidate #{iv.initials}</p>
                      <p className="text-xs text-muted-foreground font-body">
                        {iv.date} at {iv.time}
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-full text-[10px] font-semibold">
                      {iv.type}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  accent?: boolean
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
          <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
