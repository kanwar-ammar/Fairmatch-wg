"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Pencil,
  Check,
  Plus,
  X,
  GraduationCap,
  MapPin,
  Music,
  BookOpen,
  ChefHat,
  Dumbbell,
  Camera,
  Moon,
  Clock,
  Users,
  Sparkles,
  ShieldCheck,
} from "lucide-react"

interface Housemate {
  id: number
  name: string
  initials: string
  age: number
  study: string
  university: string
  bio: string
  interests: string[]
  color: string
}

interface HouseRule {
  id: number
  text: string
  category: "cleaning" | "noise" | "guests" | "shared" | "general"
}

const initialHousemates: Housemate[] = [
  {
    id: 1,
    name: "Maria Kovacs",
    initials: "MK",
    age: 24,
    study: "Architecture",
    university: "TU Berlin",
    bio: "I'm passionate about sustainable design and love creating cozy spaces. I enjoy cooking Mediterranean food and having coffee mornings with my flatmates. Early riser, usually in bed by 23:00.",
    interests: ["Cooking", "Photography", "Yoga", "Design"],
    color: "bg-primary/10 text-primary",
  },
  {
    id: 2,
    name: "Jonas Becker",
    initials: "JB",
    age: 26,
    study: "Philosophy",
    university: "HU Berlin",
    bio: "Book nerd and amateur guitarist. I like a quiet atmosphere for reading but I'm always up for a movie night or board game evening. I handle the recycling schedule for the WG.",
    interests: ["Reading", "Guitar", "Board Games", "Cycling"],
    color: "bg-accent/15 text-accent",
  },
]

const initialRules: HouseRule[] = [
  { id: 1, text: "Kitchen must be cleaned after cooking (same day)", category: "cleaning" },
  { id: 2, text: "Weekly cleaning rotation: bathroom, kitchen, hallway", category: "cleaning" },
  { id: 3, text: "Quiet hours: 22:00 - 08:00 on weekdays, 23:00 - 09:00 on weekends", category: "noise" },
  { id: 4, text: "Overnight guests need a heads-up in the WG group chat", category: "guests" },
  { id: 5, text: "Shared expenses (toilet paper, cleaning supplies) split equally", category: "shared" },
  { id: 6, text: "No smoking inside the apartment", category: "general" },
  { id: 7, text: "Trash and recycling taken out on rotation (schedule on fridge)", category: "cleaning" },
  { id: 8, text: "Parties with more than 5 guests need WG approval", category: "guests" },
]

const categoryColors: Record<string, string> = {
  cleaning: "bg-accent/15 text-accent",
  noise: "bg-primary/10 text-primary",
  guests: "bg-chart-4/15 text-chart-4",
  shared: "bg-chart-5/15 text-chart-5",
  general: "bg-muted text-muted-foreground",
}

const categoryLabels: Record<string, string> = {
  cleaning: "Cleaning",
  noise: "Noise",
  guests: "Guests",
  shared: "Shared Costs",
  general: "General",
}

const interestIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Cooking: ChefHat,
  Photography: Camera,
  Yoga: Dumbbell,
  Design: Sparkles,
  Reading: BookOpen,
  Guitar: Music,
  "Board Games": Users,
  Cycling: Dumbbell,
}

export function LandlordHousemates() {
  const [isEditing, setIsEditing] = useState(false)
  const [housemates, setHousemates] = useState(initialHousemates)
  const [rules, setRules] = useState(initialRules)
  const [newRule, setNewRule] = useState("")

  const addRule = () => {
    if (!newRule.trim()) return
    setRules((prev) => [
      ...prev,
      { id: Date.now(), text: newRule.trim(), category: "general" },
    ])
    setNewRule("")
  }

  const removeRule = (id: number) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">Housemates & Rules</h3>
          <p className="mt-0.5 text-sm text-muted-foreground font-body">
            Introduce your WG and set expectations for new applicants.
          </p>
        </div>
        <Button
          variant={isEditing ? "default" : "outline"}
          className="rounded-xl gap-2"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <Check className="h-4 w-4" />
              Done Editing
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" />
              Edit
            </>
          )}
        </Button>
      </div>

      {/* Housemate cards */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-4">Current Housemates</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          {housemates.map((mate) => (
            <Card key={mate.id} className="rounded-2xl border-border shadow-sm">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 border-2 border-card">
                    <AvatarFallback className={`${mate.color} text-sm font-bold`}>
                      {mate.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-foreground">{mate.name}</h5>
                      <Badge className="rounded-full bg-accent/15 text-accent border-0 text-[10px] font-semibold gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground font-body">
                      <span>{mate.age} years old</span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {mate.study}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground font-body flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {mate.university}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-4">
                  {isEditing ? (
                    <Textarea
                      value={mate.bio}
                      onChange={(e) => {
                        setHousemates((prev) =>
                          prev.map((m) =>
                            m.id === mate.id ? { ...m, bio: e.target.value } : m
                          )
                        )
                      }}
                      rows={3}
                      className="rounded-xl font-body text-sm leading-relaxed resize-none"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground font-body leading-relaxed">{mate.bio}</p>
                  )}
                </div>

                {/* Interests */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {mate.interests.map((interest) => {
                    const Icon = interestIcons[interest] || Sparkles
                    return (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="gap-1.5 rounded-full text-[10px] font-medium px-2.5 py-1"
                      >
                        <Icon className="h-3 w-3" />
                        {interest}
                      </Badge>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add housemate placeholder */}
          {isEditing && (
            <button
              type="button"
              className="flex min-h-[200px] items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">Add Housemate</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* WG Lifestyle summary */}
      <Card className="rounded-2xl border-border shadow-sm bg-primary/5">
        <CardContent className="p-5">
          <h4 className="text-sm font-bold text-foreground mb-3">Our WG Vibe</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <VibeStat icon={Moon} label="Quietness" value="High" />
            <VibeStat icon={ChefHat} label="Shared Cooking" value="Often" />
            <VibeStat icon={Sparkles} label="Cleanliness" value="Very Tidy" />
            <VibeStat icon={Clock} label="Sleep Schedule" value="22:00-07:00" />
          </div>
        </CardContent>
      </Card>

      {/* House Rules */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">House Rules</CardTitle>
            <Badge variant="secondary" className="rounded-full text-xs">
              {rules.length} rules
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const count = rules.filter((r) => r.category === key).length
              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className={`rounded-full text-[10px] font-semibold px-2.5 ${categoryColors[key]}`}
                >
                  {label} ({count})
                </Badge>
              )
            })}
          </div>

          <Separator className="mb-4" />

          {/* Rule list */}
          <ul className="flex flex-col gap-2.5">
            {rules.map((rule, i) => (
              <li key={rule.id} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {i + 1}
                </span>
                <div className="flex-1 flex items-start gap-2">
                  <span className="text-sm text-foreground font-body leading-relaxed flex-1">
                    {rule.text}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`shrink-0 rounded-full text-[9px] font-semibold ${categoryColors[rule.category]}`}
                  >
                    {categoryLabels[rule.category]}
                  </Badge>
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => removeRule(rule.id)}
                    className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="sr-only">Remove rule</span>
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Add new rule */}
          {isEditing && (
            <div className="mt-4 flex items-center gap-2">
              <Input
                placeholder="Add a new house rule..."
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRule()}
                className="rounded-xl flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5 shrink-0 bg-transparent"
                onClick={addRule}
                disabled={!newRule.trim()}
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function VibeStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
        <p className="text-xs font-bold text-foreground">{value}</p>
      </div>
    </div>
  )
}
