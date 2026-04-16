"use client"

import React from "react"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Pencil,
  Check,
  Upload,
  X,
  MapPin,
  Euro,
  Maximize2,
  Calendar,
  Wifi,
  WashingMachine,
  CookingPot,
  Bike,
  TreePine,
  ShowerHead,
  Sofa,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react"

interface ListingPhoto {
  id: number
  src: string
  label: string
}

const initialPhotos: ListingPhoto[] = [
  { id: 1, src: "/wg-room-1.jpg", label: "Available Room" },
  { id: 2, src: "/wg-kitchen.jpg", label: "Kitchen" },
  { id: 3, src: "/wg-living.jpg", label: "Living Room" },
  { id: 4, src: "/wg-bathroom.jpg", label: "Bathroom" },
]

const amenityOptions = [
  { id: "wifi", label: "WiFi", icon: Wifi, enabled: true },
  { id: "washer", label: "Washing Machine", icon: WashingMachine, enabled: true },
  { id: "kitchen", label: "Fully Equipped Kitchen", icon: CookingPot, enabled: true },
  { id: "bike", label: "Bike Storage", icon: Bike, enabled: true },
  { id: "garden", label: "Garden / Balcony", icon: TreePine, enabled: false },
  { id: "shower", label: "Private Shower", icon: ShowerHead, enabled: false },
  { id: "furnished", label: "Furnished Room", icon: Sofa, enabled: true },
]

export function LandlordListing() {
  const [isEditing, setIsEditing] = useState(false)
  const [photos] = useState<ListingPhoto[]>(initialPhotos)
  const [selectedPhoto, setSelectedPhoto] = useState<ListingPhoto | null>(null)
  const [isLive, setIsLive] = useState(true)

  const [title, setTitle] = useState("Sunny 3er-WG in Kreuzberg")
  const [editTitle, setEditTitle] = useState(title)
  const [description, setDescription] = useState(
    "A warm and welcoming 3-person WG right in the heart of Kreuzberg. The available room is 18m\u00B2 with great natural light and a view of the courtyard. We share a spacious kitchen and a cozy living room. The apartment is close to public transport (U7 Gneisenaustr.) and surrounded by cafes, parks, and markets."
  )
  const [editDescription, setEditDescription] = useState(description)

  const [rent, setRent] = useState("480")
  const [deposit, setDeposit] = useState("960")
  const [roomSize, setRoomSize] = useState("18")
  const [availableFrom, setAvailableFrom] = useState("2026-03-01")
  const [minStay, setMinStay] = useState("12")

  const [amenities, setAmenities] = useState(amenityOptions)

  const toggleAmenity = (id: string) => {
    setAmenities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    )
  }

  const handleSave = () => {
    setTitle(editTitle)
    setDescription(editDescription)
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">My WG Listing</h3>
          <p className="mt-0.5 text-sm text-muted-foreground font-body">
            Manage your room listing, photos, and details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live toggle */}
          <div className="flex items-center gap-2">
            {isLive ? (
              <Eye className="h-4 w-4 text-accent" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
            <Label htmlFor="listing-live" className="text-sm font-medium cursor-pointer">
              {isLive ? "Live" : "Hidden"}
            </Label>
            <Switch
              id="listing-live"
              checked={isLive}
              onCheckedChange={setIsLive}
            />
          </div>
          <Button
            variant={isEditing ? "default" : "outline"}
            className="rounded-xl gap-2"
            onClick={() => {
              if (isEditing) handleSave()
              else {
                setEditTitle(title)
                setEditDescription(description)
                setIsEditing(true)
              }
            }}
          >
            {isEditing ? (
              <>
                <Check className="h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Edit Listing
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Photo gallery */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Photos</CardTitle>
            {isEditing && (
              <Button variant="outline" size="sm" className="rounded-xl gap-2 text-xs bg-transparent">
                <Plus className="h-3.5 w-3.5" />
                Add Photo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedPhoto(photo)}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <Image
                  src={photo.src || "/placeholder.svg"}
                  alt={photo.label}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/60 to-transparent p-2">
                  <span className="text-[10px] font-semibold text-primary-foreground">{photo.label}</span>
                </div>
                {isEditing && (
                  <div className="absolute right-1.5 top-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow">
                      <X className="h-3 w-3" />
                    </span>
                  </div>
                )}
              </button>
            ))}
            {isEditing && (
              <button
                type="button"
                className="flex aspect-[4/3] items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-6 w-6" />
                  <span className="text-[10px] font-medium">Upload</span>
                </div>
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Title, description */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Listing Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="listing-title" className="text-sm font-medium">Title</Label>
                {isEditing ? (
                  <Input
                    id="listing-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="rounded-xl"
                  />
                ) : (
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="listing-desc" className="text-sm font-medium">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="listing-desc"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={5}
                    className="rounded-xl font-body text-sm leading-relaxed resize-none"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {amenities.map((amenity) => {
                  const Icon = amenity.icon
                  return (
                    <div
                      key={amenity.id}
                      className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                        amenity.enabled ? "bg-primary/8 border border-primary/15" : "bg-muted/50 border border-transparent"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          amenity.enabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={`text-sm font-medium flex-1 ${amenity.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                        {amenity.label}
                      </span>
                      {isEditing && (
                        <Switch
                          checked={amenity.enabled}
                          onCheckedChange={() => toggleAmenity(amenity.id)}
                        />
                      )}
                      {!isEditing && amenity.enabled && (
                        <Check className="h-4 w-4 text-accent" />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Room details */}
        <div className="flex flex-col gap-6">
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Room Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <DetailField
                icon={Euro}
                label="Monthly Rent"
                value={`${rent}`}
                suffix="/month"
                isEditing={isEditing}
                editValue={rent}
                onEditChange={setRent}
                type="number"
              />
              <Separator />
              <DetailField
                icon={Euro}
                label="Deposit"
                value={deposit}
                suffix=""
                isEditing={isEditing}
                editValue={deposit}
                onEditChange={setDeposit}
                type="number"
              />
              <Separator />
              <DetailField
                icon={Maximize2}
                label="Room Size"
                value={roomSize}
                suffix="m\u00B2"
                isEditing={isEditing}
                editValue={roomSize}
                onEditChange={setRoomSize}
                type="number"
              />
              <Separator />
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Available From</p>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={availableFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                      className="mt-1 h-8 rounded-lg text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground">
                      {new Date(availableFrom).toLocaleDateString("en-DE", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Minimum Stay</p>
                  {isEditing ? (
                    <Input
                      value={minStay}
                      onChange={(e) => setMinStay(e.target.value)}
                      className="mt-1 h-8 rounded-lg text-sm"
                      type="number"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground">{minStay} months</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location card */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Gneisenaustr. 42</p>
                  <p className="text-xs text-muted-foreground font-body">10961 Berlin-Kreuzberg</p>
                  <p className="mt-1 text-xs text-muted-foreground font-body">Near U7 Gneisenaustr.</p>
                </div>
              </div>
              <div className="mt-4 aspect-[16/9] rounded-xl bg-muted flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Map preview</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Photo lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedPhoto(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelectedPhoto(null)}
        >
          <div className="relative max-h-[80vh] max-w-[80vw] overflow-hidden rounded-2xl bg-card shadow-xl">
            <div className="relative h-[60vh] w-[80vw] max-w-3xl bg-muted">
              <Image
                src={selectedPhoto.src || "/placeholder.svg"}
                alt={selectedPhoto.label}
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/60 to-transparent p-4">
              <p className="text-sm font-semibold text-primary-foreground">{selectedPhoto.label}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/80 text-background hover:bg-foreground transition-colors"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailField({
  icon: Icon,
  label,
  value,
  suffix,
  isEditing,
  editValue,
  onEditChange,
  type = "text",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  suffix: string
  isEditing: boolean
  editValue: string
  onEditChange: (v: string) => void
  type?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            className="mt-1 h-8 rounded-lg text-sm"
            type={type}
          />
        ) : (
          <p className="text-sm font-medium text-foreground">
            {label.includes("Rent") && "\u20AC"}{value}{suffix && ` ${suffix}`}
          </p>
        )}
      </div>
    </div>
  )
}
