"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Sparkles,
  Leaf,
  Wrench,
  ChefHat,
  Moon,
  Music,
  Dog,
  Cigarette,
  Dumbbell,
  BookOpen,
  Users,
  PartyPopper,
  Save,
} from "lucide-react"

interface Preference {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  value: number
  color: string
}

const initialPreferences: Preference[] = [
  {
    id: "cleanliness",
    label: "Cleanliness",
    description: "How important is a tidy shared space?",
    icon: Sparkles,
    value: 85,
    color: "text-primary",
  },
  {
    id: "recycling",
    label: "Recycling & Sustainability",
    description: "Commitment to waste separation and eco habits",
    icon: Leaf,
    value: 90,
    color: "text-accent",
  },
  {
    id: "diy",
    label: "DIY & Repairs",
    description: "Willingness to fix things around the apartment",
    icon: Wrench,
    value: 60,
    color: "text-primary",
  },
  {
    id: "cooking",
    label: "Shared Cooking",
    description: "Interest in cooking together or sharing meals",
    icon: ChefHat,
    value: 75,
    color: "text-accent",
  },
  {
    id: "quiet",
    label: "Quietness",
    description: "Preference for a calm and quiet environment",
    icon: Moon,
    value: 70,
    color: "text-primary",
  },
  {
    id: "music",
    label: "Music & Noise Tolerance",
    description: "Comfort with music, instruments, or general noise",
    icon: Music,
    value: 45,
    color: "text-accent",
  },
  {
    id: "fitness",
    label: "Fitness & Sports",
    description: "Active lifestyle and sports enthusiasm",
    icon: Dumbbell,
    value: 65,
    color: "text-primary",
  },
  {
    id: "study",
    label: "Study Habits",
    description: "Studying at home vs. library preference",
    icon: BookOpen,
    value: 80,
    color: "text-accent",
  },
  {
    id: "social",
    label: "Social Activity",
    description: "How often do you enjoy socializing at home?",
    icon: Users,
    value: 55,
    color: "text-primary",
  },
  {
    id: "parties",
    label: "Parties & Events",
    description: "Openness to hosting gatherings at home",
    icon: PartyPopper,
    value: 35,
    color: "text-accent",
  },
]

const booleanPrefs = [
  { id: "pets", label: "Pet Friendly", icon: Dog, enabled: true },
  { id: "smoking", label: "Smoking Allowed", icon: Cigarette, enabled: false },
]

function getLevel(value: number): string {
  if (value >= 80) return "Very Important"
  if (value >= 60) return "Important"
  if (value >= 40) return "Moderate"
  if (value >= 20) return "Low Priority"
  return "Not Important"
}

function getLevelColor(value: number): string {
  if (value >= 80) return "bg-accent/15 text-accent"
  if (value >= 60) return "bg-primary/15 text-primary"
  if (value >= 40) return "bg-muted text-muted-foreground"
  return "bg-muted text-muted-foreground"
}

export function LifestylePreferences() {
  const [preferences, setPreferences] = useState<Preference[]>(initialPreferences)
  const [boolPrefs, setBoolPrefs] = useState(booleanPrefs)
  const [saved, setSaved] = useState(false)

  const updatePreference = (id: string, newValue: number) => {
    setPreferences((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value: newValue } : p))
    )
    setSaved(false)
  }

  const toggleBoolPref = (id: string) => {
    setBoolPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    )
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">Lifestyle Preferences</h3>
          <p className="mt-1 text-sm text-muted-foreground font-body leading-relaxed">
            Rate how important each trait is for you. These help us find WGs that match your lifestyle.
          </p>
        </div>
        <Button
          className="rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSave}
        >
          <Save className="h-4 w-4" />
          {saved ? "Saved!" : "Save Preferences"}
        </Button>
      </div>

      {/* Compatibility score preview */}
      <Card className="rounded-2xl border-border shadow-sm bg-primary/5">
        <CardContent className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Your Compatibility Profile</p>
              <p className="mt-0.5 text-xs text-muted-foreground font-body">
                Based on your ratings, we match you with WGs that share similar values.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {preferences.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="h-8 w-2 rounded-full bg-primary/20 overflow-hidden"
                  >
                    <div
                      className="w-full rounded-full bg-primary transition-all duration-300"
                      style={{ height: `${p.value}%`, marginTop: `${100 - p.value}%` }}
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm font-bold text-primary ml-1">
                {Math.round(preferences.reduce((sum, p) => sum + p.value, 0) / preferences.length)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slider preferences */}
      <div className="grid gap-4 sm:grid-cols-2">
        {preferences.map((pref) => {
          const Icon = pref.icon
          return (
            <Card key={pref.id} className="rounded-2xl border-border shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${pref.value >= 60 ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`h-5 w-5 ${pref.value >= 60 ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{pref.label}</p>
                      <p className="text-xs text-muted-foreground font-body">{pref.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Slider
                    value={[pref.value]}
                    onValueChange={(val) => updatePreference(pref.id, val[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between">
                    <Badge className={`rounded-full border-0 text-[10px] font-semibold ${getLevelColor(pref.value)}`}>
                      {getLevel(pref.value)}
                    </Badge>
                    <span className="text-xs font-bold text-foreground">{pref.value}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Boolean preferences */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Preferences</CardTitle>
          <CardDescription className="text-sm font-body">Toggle these on or off based on your household requirements.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {boolPrefs.map((pref) => {
              const Icon = pref.icon
              return (
                <div key={pref.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${pref.enabled ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`h-4 w-4 ${pref.enabled ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <Label htmlFor={pref.id} className="text-sm font-medium text-foreground cursor-pointer">
                      {pref.label}
                    </Label>
                  </div>
                  <Switch
                    id={pref.id}
                    checked={pref.enabled}
                    onCheckedChange={() => toggleBoolPref(pref.id)}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
