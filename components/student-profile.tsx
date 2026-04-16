"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ShieldCheck,
  Upload,
  Camera,
  GraduationCap,
  MapPin,
  Calendar,
  Globe,
  Plus,
  X,
  Pencil,
  Check,
} from "lucide-react"

interface GalleryImage {
  id: number
  src: string
  alt: string
}

const initialGallery: GalleryImage[] = [
  { id: 1, src: "/gallery-1.jpg", alt: "Student room setup" },
  { id: 2, src: "/gallery-2.jpg", alt: "Cooking hobby" },
  { id: 3, src: "/gallery-3.jpg", alt: "Outdoor activity" },
  { id: 4, src: "/gallery-4.jpg", alt: "University campus" },
]

export function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [gallery] = useState<GalleryImage[]>(initialGallery)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  const [bio, setBio] = useState(
    "Hi! I'm Ammar, a Computer Science Master's student at University of Bremen  I'm tidy, enjoy cooking for the WG, and value a quiet environment for studying. On weekends, I love exploring the city, visiting flea markets, and cycling along the Spree. Looking for a welcoming WG where we share meals and respect each other's space."
  )
  const [editBio, setEditBio] = useState(bio)

  const [rules] = useState([
    "No smoking indoors",
    "Quiet hours after 22:00",
    "Clean up shared spaces daily",
    "Guests welcome with notice",
    "Share cooking duties weekly",
  ])

  return (
    <div className="flex flex-col gap-6">
      {/* Profile header card */}
      <Card className="overflow-hidden rounded-2xl border-border shadow-sm">
        {/* Cover area */}
        <div className="relative h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10 sm:h-40">
          <div className="absolute -bottom-12 left-6 sm:-bottom-14 sm:left-8">
            <Avatar className="h-24 w-24 border-4 border-card shadow-md sm:h-28 sm:w-28">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Ammar Ali" />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                AS
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="pt-16 sm:pt-18 px-6 pb-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">Ammar Ali</h2>
                <Badge className="gap-1 rounded-full bg-accent/15 text-accent border-0 text-xs font-semibold">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Student
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-body">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  M.Sc. Computer Science
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Berlin, Germany
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-body">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  25 years old
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  German, English, Turkish
                </span>
              </div>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              className="rounded-xl gap-2"
              onClick={() => {
                if (isEditing) {
                  setBio(editBio)
                }
                setIsEditing(!isEditing)
              }}
            >
              {isEditing ? (
                <>
                  <Check className="h-4 w-4" />
                  Save Profile
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - About & Rules */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* About me */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">About Me</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={5}
                  className="rounded-xl font-body text-sm leading-relaxed resize-none"
                  placeholder="Tell potential WG-mates about yourself..."
                />
              ) : (
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {bio}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Photo Gallery */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Photo Gallery</CardTitle>
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
                {gallery.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <Image
                      src={img.src || "/placeholder.svg"}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
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
                    className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
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

          {/* WG Rules */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">My WG Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2.5">
                {rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground font-body leading-relaxed">{rule}</span>
                    {isEditing && (
                      <button type="button" className="ml-auto text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {isEditing && (
                <Button variant="outline" size="sm" className="mt-4 rounded-xl gap-2 text-xs bg-transparent">
                  <Plus className="h-3.5 w-3.5" />
                  Add Rule
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Verification & Quick Info */}
        <div className="flex flex-col gap-6">
          {/* Verification status */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <VerificationItem label="Student ID" verified />
              <VerificationItem label="University Email" verified />
              <VerificationItem label="ID Document" verified />
              <VerificationItem label="Enrollment Proof" pending />
              <Separator className="my-1" />
              <Button variant="outline" className="w-full rounded-xl gap-2 text-sm bg-transparent">
                <Upload className="h-4 w-4" />
                Upload Documents
              </Button>
            </CardContent>
          </Card>

          {/* Quick details */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Quick Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-3">
                <DetailRow label="Budget" value="\u20AC350 - \u20AC550 / month" />
                <DetailRow label="Move-in" value="March 2026" />
                <DetailRow label="Duration" value="12+ months" />
                <DetailRow label="Semester" value="3rd (Master's)" />
                <DetailRow label="WG Size" value="2-4 people" />
                <DetailRow label="District" value="Kreuzberg, Neuk\u00F6lln, Mitte" />
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelectedImage(null)}
        >
          <div className="relative max-h-[80vh] max-w-[80vw] overflow-hidden rounded-2xl bg-card shadow-xl">
            <div className="relative h-[60vh] w-[80vw] max-w-2xl bg-muted">
              <Image
                src={selectedImage.src || "/placeholder.svg"}
                alt={selectedImage.alt}
                fill
                className="object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
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

function VerificationItem({ label, verified, pending }: { label: string; verified?: boolean; pending?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground font-body">{label}</span>
      {verified ? (
        <Badge className="gap-1 rounded-full bg-accent/15 text-accent border-0 text-[10px] font-semibold">
          <ShieldCheck className="h-3 w-3" />
          Verified
        </Badge>
      ) : pending ? (
        <Badge variant="secondary" className="rounded-full text-[10px] font-semibold bg-primary/10 text-primary border-0">
          Pending
        </Badge>
      ) : (
        <Badge variant="secondary" className="rounded-full text-[10px] font-semibold">
          Not submitted
        </Badge>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground text-right">{value}</dd>
    </div>
  )
}
