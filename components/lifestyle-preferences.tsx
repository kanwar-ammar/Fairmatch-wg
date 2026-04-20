"use client"

import React from "react"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAppSelector } from "@/store/hooks"
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
}

const initialPreferences: Preference[] = [
  {
    id: "cleanliness",
    label: "Cleanliness",
    description: "How important is a tidy shared space?",
    icon: Sparkles,
    value: 85,
  },
  {
    id: "recycling",
    label: "Recycling & Sustainability",
    description: "Commitment to waste separation and eco habits",
    icon: Leaf,
    value: 90,
  },
  {
    id: "diy",
    label: "DIY & Repairs",
    description: "Willingness to fix things around the apartment",
    icon: Wrench,
    value: 60,
  },
  {
    id: "cooking",
    label: "Shared Cooking",
    description: "Interest in cooking together or sharing meals",
    icon: ChefHat,
    value: 75,
  },
  {
    id: "quiet",
    label: "Quietness",
    description: "Preference for a calm and quiet environment",
    icon: Moon,
    value: 70,
  },
  {
    id: "music",
    label: "Music & Noise Tolerance",
    description: "Comfort with music, instruments, or general noise",
    icon: Music,
    value: 45,
  },
  {
    id: "fitness",
    label: "Fitness & Sports",
    description: "Active lifestyle and sports enthusiasm",
    icon: Dumbbell,
    value: 65,
  },
  {
    id: "study",
    label: "Study Habits",
    description: "Studying at home vs. library preference",
    icon: BookOpen,
    value: 80,
  },
  {
    id: "social",
    label: "Social Activity",
    description: "How often do you enjoy socializing at home?",
    icon: Users,
    value: 55,
  },
  {
    id: "parties",
    label: "Parties & Events",
    description: "Openness to hosting gatherings at home",
    icon: PartyPopper,
    value: 35,
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
  const currentUser = useAppSelector((state) => state.auth.currentUser)
  const [preferences, setPreferences] = useState<Preference[]>(initialPreferences)
  const [boolPrefs, setBoolPrefs] = useState(booleanPrefs)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loadPreferences = async () => {
      if (!currentUser?.id) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setSaveError("")

      try {
        const response = await fetch(
          `/api/users/preferences?userId=${encodeURIComponent(currentUser.id)}`,
          { cache: "no-store" },
        )
        const result = (await response.json()) as {
          error?: string
          preference?: {
            cleanliness: number
            recycling: number
            diy: number
            cooking: number
            quietness: number
            music: number
            fitness: number
            studyHabits: number
            socialActivity: number
            parties: number
            petFriendly: boolean
            smokingAllowed: boolean
          } | null
        }

        if (!response.ok) {
          setSaveError(result.error || "Unable to load preferences.")
          return
        }

        if (!result.preference) {
          return
        }

        const pref = result.preference
        setPreferences((prev) =>
          prev.map((item) => {
            const valueMap: Record<string, number> = {
              cleanliness: pref.cleanliness,
              recycling: pref.recycling,
              diy: pref.diy,
              cooking: pref.cooking,
              quiet: pref.quietness,
              music: pref.music,
              fitness: pref.fitness,
              study: pref.studyHabits,
              social: pref.socialActivity,
              parties: pref.parties,
            }
            return {
              ...item,
              value: valueMap[item.id] ?? item.value,
            }
          }),
        )

        setBoolPrefs((prev) =>
          prev.map((item) => {
            if (item.id === "pets") {
              return { ...item, enabled: pref.petFriendly }
            }
            if (item.id === "smoking") {
              return { ...item, enabled: pref.smokingAllowed }
            }
            return item
          }),
        )
      } catch {
        setSaveError("Unable to load preferences.")
      } finally {
        setIsLoading(false)
      }
    }

    void loadPreferences()
  }, [currentUser?.id])

  const canSave = useMemo(
    () => hasUnsavedChanges && !isSaving && !isLoading,
    [hasUnsavedChanges, isSaving, isLoading],
  )

  const updatePreference = (id: string, newValue: number) => {
    setPreferences((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value: newValue } : p))
    )
    setHasUnsavedChanges(true)
    setSaved(false)
  }

  const toggleBoolPref = (id: string) => {
    setBoolPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    )
    setHasUnsavedChanges(true)
    setSaved(false)
  }

  const handleSave = async () => {
    if (!currentUser?.id || !canSave) return

    setSaveError("")
    setIsSaving(true)

    const sliderMap = Object.fromEntries(
      preferences.map((pref) => [pref.id, pref.value]),
    ) as Record<string, number>

    const boolMap = Object.fromEntries(
      boolPrefs.map((pref) => [pref.id, pref.enabled]),
    ) as Record<string, boolean>

    try {
      const response = await fetch("/api/users/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          preferences: {
            cleanliness: sliderMap.cleanliness,
            recycling: sliderMap.recycling,
            diy: sliderMap.diy,
            cooking: sliderMap.cooking,
            quietness: sliderMap.quiet,
            music: sliderMap.music,
            fitness: sliderMap.fitness,
            studyHabits: sliderMap.study,
            socialActivity: sliderMap.social,
            parties: sliderMap.parties,
            petFriendly: boolMap.pets,
            smokingAllowed: boolMap.smoking,
          },
        }),
      })

      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setSaveError(result.error || "Unable to save preferences.")
        return
      }

      setSaved(true)
      setHasUnsavedChanges(false)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setSaveError("Unable to save preferences.")
    } finally {
      setIsSaving(false)
    }
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
          disabled={!canSave}
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : saved ? "Saved!" : "Save Preferences"}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading your saved preferences...</p>
      ) : null}

      {hasUnsavedChanges ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
          You have unsaved changes. Click Save Preferences to store them in the database.
        </div>
      ) : null}

      {saveError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive">
          {saveError}
        </div>
      ) : null}

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
