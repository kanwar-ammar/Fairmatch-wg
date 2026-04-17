"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrentUserFromDatabase } from "@/store/auth-slice";
import type { CurrentUser, VerificationDocSummary } from "@/store/auth-slice";
import {
  ShieldCheck,
  Upload,
  GraduationCap,
  MapPin,
  Calendar,
  Globe,
  Pencil,
  Check,
} from "lucide-react";

type EditableQuickDetails = {
  budgetMin: string;
  budgetMax: string;
  moveInDate: string;
  semester: string;
  preferredDistricts: string;
};

const QUICK_DETAIL_PLACEHOLDERS = {
  budget: "Set your budget range",
  moveIn: "Add your preferred move-in timeline",
  semester: "Add your current semester",
  district: "Add preferred districts",
};

export function StudentProfile() {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const profile = currentUser?.studentProfile;
  const fullName = profile?.fullName || currentUser?.fullName || "Your profile";
  const avatarUrl = currentUser?.avatarUrl ?? "/placeholder-avatar.jpg";
  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";
  const isVerified = profile?.verificationStatus === "VERIFIED";
  const hasLocation = Boolean(profile?.location);
  const hasAge = typeof profile?.age === "number";
  const hasLanguages = Boolean(profile?.languages);

  const [bio, setBio] = useState("");
  const [editBio, setEditBio] = useState(bio);
  const [editQuickDetails, setEditQuickDetails] = useState<EditableQuickDetails>(
    {
      budgetMin: "",
      budgetMax: "",
      moveInDate: "",
      semester: "",
      preferredDistricts: "",
    },
  );

  const profileBio =
    profile?.bio ??
    "Add a short intro so potential WG housemates can understand your lifestyle and expectations.";

  useEffect(() => {
    setBio(profileBio);
    setEditBio(profileBio);
    setEditQuickDetails({
      budgetMin:
        typeof profile?.budgetMin === "number" ? String(profile.budgetMin) : "",
      budgetMax:
        typeof profile?.budgetMax === "number" ? String(profile.budgetMax) : "",
      moveInDate: profile?.moveInDate ?? "",
      semester: profile?.semester ?? "",
      preferredDistricts: profile?.preferredDistricts ?? "",
    });
  }, [profileBio]);

  const verificationDocs = useMemo(() => {
    const defaults: VerificationDocSummary[] = [
      { type: "STUDENT_ID", label: "Student ID", status: "PENDING" },
      {
        type: "UNIVERSITY_EMAIL",
        label: "University Email",
        status: "PENDING",
      },
      { type: "ID_DOCUMENT", label: "ID Document", status: "PENDING" },
      {
        type: "ENROLLMENT_PROOF",
        label: "Enrollment Proof",
        status: "PENDING",
      },
    ];

    if (!currentUser?.verificationDocs?.length) {
      return defaults;
    }

    return defaults.map((item) => {
      const fromDb = currentUser.verificationDocs?.find(
        (doc) => doc.type === item.type,
      );
      return fromDb ?? item;
    });
  }, [currentUser?.verificationDocs]);

  const quickDetailRows = useMemo(
    () => [
      {
        key: "budget",
        label: "Budget",
        value:
          typeof profile?.budgetMin === "number" && typeof profile?.budgetMax === "number"
            ? `EUR ${profile.budgetMin} - EUR ${profile.budgetMax} / month`
            : QUICK_DETAIL_PLACEHOLDERS.budget,
        isPlaceholder:
          !(typeof profile?.budgetMin === "number" && typeof profile?.budgetMax === "number"),
      },
      {
        key: "move-in",
        label: "Move-in",
        value: profile?.moveInDate || QUICK_DETAIL_PLACEHOLDERS.moveIn,
        isPlaceholder: !profile?.moveInDate,
      },
      {
        key: "semester",
        label: "Semester",
        value: profile?.semester || QUICK_DETAIL_PLACEHOLDERS.semester,
        isPlaceholder: !profile?.semester,
      },
      {
        key: "district",
        label: "District",
        value: profile?.preferredDistricts || QUICK_DETAIL_PLACEHOLDERS.district,
        isPlaceholder: !profile?.preferredDistricts,
      },
    ],
    [profile],
  );

  const handleQuickDetailChange = (
    field: keyof EditableQuickDetails,
    value: string,
  ) => {
    setEditQuickDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const parseOptionalNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? Math.round(parsed) : null;
  };

  const parseOptionalText = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    setSaveError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/users/current", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          bio: parseOptionalText(editBio),
          budgetMin: parseOptionalNumber(editQuickDetails.budgetMin),
          budgetMax: parseOptionalNumber(editQuickDetails.budgetMax),
          moveInDate: parseOptionalText(editQuickDetails.moveInDate),
          semester: parseOptionalText(editQuickDetails.semester),
          preferredDistricts: parseOptionalText(editQuickDetails.preferredDistricts),
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        user?: CurrentUser;
      };

      if (!response.ok || !result.user) {
        setSaveError(result.error || "Unable to save profile.");
        return;
      }

      dispatch(setCurrentUserFromDatabase(result.user));
      setBio(result.user.studentProfile?.bio ?? profileBio);
      setIsEditing(false);
    } catch {
      setSaveError("Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Profile header card */}
      <Card className="overflow-hidden rounded-2xl border-border shadow-sm">
        {/* Cover area */}
        <div className="relative h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10 sm:h-40">
          <div className="absolute -bottom-12 left-6 sm:-bottom-14 sm:left-8">
            <Avatar className="h-24 w-24 border-4 border-card shadow-md sm:h-28 sm:w-28">
              <AvatarImage src={avatarUrl} alt={fullName} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="pt-16 sm:pt-18 px-6 pb-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  {fullName}
                </h2>
                <Badge className="gap-1 rounded-full bg-accent/15 text-accent border-0 text-xs font-semibold">
                  <ShieldCheck className="h-3 w-3" />
                  {isVerified ? "Verified Student" : "Student"}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-body">
                {profile?.degreeProgram ? (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {profile.degreeProgram}
                  </span>
                ) : null}
                {hasLocation ? (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile?.location}
                  </span>
                ) : null}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-body">
                {hasAge ? (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {profile?.age} years old
                  </span>
                ) : null}
                {hasLanguages ? (
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    {profile?.languages}
                  </span>
                ) : null}
              </div>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              className="rounded-xl gap-2"
              onClick={() => {
                if (isEditing) {
                  void handleSaveProfile();
                  return;
                }
                setSaveError("");
                setIsEditing(!isEditing);
              }}
              disabled={isSaving}
            >
              {isEditing ? (
                <>
                  <Check className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Profile"}
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
        {/* Left column - About */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* About me */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                About Me
              </CardTitle>
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
              {saveError ? (
                <p className="mt-3 text-sm text-destructive">{saveError}</p>
              ) : null}
            </CardContent>
          </Card>

          {/* Quick details */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Quick Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Budget Min (EUR)</p>
                    <Input
                      value={editQuickDetails.budgetMin}
                      onChange={(e) => handleQuickDetailChange("budgetMin", e.target.value)}
                      placeholder="350"
                      className="rounded-xl"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Budget Max (EUR)</p>
                    <Input
                      value={editQuickDetails.budgetMax}
                      onChange={(e) => handleQuickDetailChange("budgetMax", e.target.value)}
                      placeholder="550"
                      className="rounded-xl"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Move-in</p>
                    <Input
                      value={editQuickDetails.moveInDate}
                      onChange={(e) => handleQuickDetailChange("moveInDate", e.target.value)}
                      placeholder="March 2026"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Semester</p>
                    <Input
                      value={editQuickDetails.semester}
                      onChange={(e) => handleQuickDetailChange("semester", e.target.value)}
                      placeholder="3rd (Master's)"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground">Preferred districts</p>
                    <Input
                      value={editQuickDetails.preferredDistricts}
                      onChange={(e) =>
                        handleQuickDetailChange("preferredDistricts", e.target.value)
                      }
                      placeholder="Kreuzberg, Neukolln, Mitte"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              ) : (
                <dl className="flex flex-col gap-3">
                  {quickDetailRows.map((detail) => (
                    <DetailRow
                      key={detail.key}
                      label={detail.label}
                      value={detail.value}
                      isPlaceholder={detail.isPlaceholder}
                    />
                  ))}
                </dl>
              )}
            </CardContent>
          </Card>

          {/* Photo Gallery (temporarily disabled)
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Photo Gallery
                </CardTitle>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-2 text-xs bg-transparent"
                  >
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
          */}

          {/* WG Rules (temporarily disabled)
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                My WG Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2.5">
                {rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground font-body leading-relaxed">
                      {rule}
                    </span>
                    {isEditing && (
                      <button
                        type="button"
                        className="ml-auto text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-xl gap-2 text-xs bg-transparent"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Rule
                </Button>
              )}
            </CardContent>
          </Card>
          */}
        </div>

        {/* Right column - Verification & Quick Info */}
        <div className="flex flex-col gap-6">
          {/* Verification status */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {verificationDocs.map((doc) => (
                <VerificationItem
                  key={doc.type}
                  label={doc.label}
                  verified={doc.status === "VERIFIED"}
                  pending={doc.status === "PENDING"}
                />
              ))}
              <Separator className="my-1" />
              <Button
                variant="outline"
                className="w-full rounded-xl gap-2 text-sm bg-transparent"
              >
                <Upload className="h-4 w-4" />
                Upload Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image lightbox (temporarily disabled with gallery) */}
    </div>
  );
}

function VerificationItem({
  label,
  verified,
  pending,
}: {
  label: string;
  verified?: boolean;
  pending?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground font-body">{label}</span>
      {verified ? (
        <Badge className="gap-1 rounded-full bg-accent/15 text-accent border-0 text-[10px] font-semibold">
          <ShieldCheck className="h-3 w-3" />
          Verified
        </Badge>
      ) : pending ? (
        <Badge
          variant="secondary"
          className="rounded-full text-[10px] font-semibold bg-primary/10 text-primary border-0"
        >
          Pending
        </Badge>
      ) : (
        <Badge
          variant="secondary"
          className="rounded-full text-[10px] font-semibold"
        >
          Not submitted
        </Badge>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  isPlaceholder,
}: {
  label: string;
  value: string;
  isPlaceholder?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={[
          "text-sm text-right",
          isPlaceholder
            ? "font-normal text-muted-foreground italic"
            : "font-medium text-foreground",
        ].join(" ")}
      >
        {value}
      </dd>
    </div>
  );
}
