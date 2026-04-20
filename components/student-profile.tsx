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
import { toast } from "@/hooks/use-toast";
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
  age: string;
  university: string;
  contact: string;
  location: string;
  budgetMin: string;
  budgetMax: string;
  moveInDate: string;
  semester: string;
  hobbies: string;
};

const QUICK_DETAIL_PLACEHOLDERS = {
  location: "Select your city",
  budget: "Set your budget range",
  moveIn: "Add your preferred move-in timeline",
  semester: "Add your current semester",
};

const GERMAN_CITIES = [
  "Berlin",
  "Hamburg",
  "Munich",
  "Cologne",
  "Frankfurt am Main",
  "Stuttgart",
  "Dusseldorf",
  "Dortmund",
  "Essen",
  "Leipzig",
  "Bremen",
  "Dresden",
  "Hanover",
  "Nuremberg",
  "Duisburg",
  "Bochum",
  "Wuppertal",
  "Bielefeld",
  "Bonn",
  "Munster",
  "Karlsruhe",
  "Mannheim",
  "Augsburg",
  "Wiesbaden",
  "Gelsenkirchen",
  "Monchengladbach",
  "Braunschweig",
  "Chemnitz",
  "Kiel",
  "Aachen",
  "Halle (Saale)",
  "Magdeburg",
  "Freiburg im Breisgau",
  "Krefeld",
  "Lubeck",
  "Mainz",
  "Erfurt",
  "Rostock",
  "Kassel",
  "Saarbrucken",
] as const;

function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMoveInDate(value: string | null | undefined) {
  if (!value) return QUICK_DETAIL_PLACEHOLDERS.moveIn;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function StudentProfile() {
  const dispatch = useAppDispatch();
  const todayIsoDate = useMemo(() => getTodayIsoDate(), []);
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
  const hasLanguages = Boolean(profile?.languages);

  const [bio, setBio] = useState("");
  const [editBio, setEditBio] = useState(bio);
  const [editHouseBio, setEditHouseBio] = useState("");
  const [editQuickDetails, setEditQuickDetails] = useState<EditableQuickDetails>(
    {
      age: "",
      university: "",
      contact: "",
      location: "",
      budgetMin: "",
      budgetMax: "",
      moveInDate: "",
      semester: "",
      hobbies: "",
    },
  );

  const profileBio =
    profile?.bio ??
    "Add a short intro so potential WG housemates can understand your lifestyle and expectations.";

  useEffect(() => {
    setBio(profileBio);
    setEditBio(profileBio);
    setEditHouseBio(profile?.houseBio ?? "");
    setEditQuickDetails({
      age: typeof profile?.age === "number" ? String(profile.age) : "",
      university: profile?.university ?? "",
      contact: profile?.contact ?? "",
      location: profile?.location ?? "",
      budgetMin:
        typeof profile?.budgetMin === "number" ? String(profile.budgetMin) : "",
      budgetMax:
        typeof profile?.budgetMax === "number" ? String(profile.budgetMax) : "",
      moveInDate: profile?.moveInDate ?? "",
      semester: profile?.semester ?? "",
      hobbies: profile?.hobbies ?? "",
    });
  }, [profile, profileBio]);

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
        key: "location",
        label: "Location",
        value: profile?.location || QUICK_DETAIL_PLACEHOLDERS.location,
        isPlaceholder: !profile?.location,
      },
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
        value: formatMoveInDate(profile?.moveInDate),
        isPlaceholder: !profile?.moveInDate,
      },
      {
        key: "semester",
        label: "Semester",
        value: profile?.semester || QUICK_DETAIL_PLACEHOLDERS.semester,
        isPlaceholder: !profile?.semester,
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

  const hobbyItems = useMemo(
    () =>
      (profile?.hobbies ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [profile?.hobbies],
  );

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

    if (editQuickDetails.moveInDate && editQuickDetails.moveInDate < todayIsoDate) {
      setSaveError("Move-in date cannot be earlier than today.");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/users/current", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          bio: parseOptionalText(editBio),
          houseBio: parseOptionalText(editHouseBio),
          age: parseOptionalNumber(editQuickDetails.age),
          university: parseOptionalText(editQuickDetails.university),
          contact: parseOptionalText(editQuickDetails.contact),
          location: parseOptionalText(editQuickDetails.location),
          budgetMin: parseOptionalNumber(editQuickDetails.budgetMin),
          budgetMax: parseOptionalNumber(editQuickDetails.budgetMax),
          moveInDate: parseOptionalText(editQuickDetails.moveInDate),
          semester: parseOptionalText(editQuickDetails.semester),
          hobbies: parseOptionalText(editQuickDetails.hobbies),
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
      setEditHouseBio(result.user.studentProfile?.houseBio ?? "");
      toast({
        title: "Profile saved",
        description: "Your student profile and WG summary were updated.",
      });
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
                {typeof profile?.age === "number" ? (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {profile.age} years old
                  </span>
                ) : null}
                {profile?.university ? (
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    {profile.university}
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
                {profile?.contact ? (
                  <span className="flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" />
                    {profile.contact}
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
                Personal Bio
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

          <Card className="rounded-2xl border-border shadow-sm bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                WG Bio
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editHouseBio}
                  onChange={(e) => setEditHouseBio(e.target.value)}
                  rows={4}
                  className="rounded-xl font-body text-sm leading-relaxed resize-none"
                  placeholder="A short summary that appears on your current WG listing..."
                />
              ) : (
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {profile?.houseBio ||
                    "Add a short house-specific summary for your current WG listing."}
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                This summary is shared with your current WG listing only.
              </p>
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
                    <p className="text-xs font-medium text-muted-foreground">Age</p>
                    <Input
                      value={editQuickDetails.age}
                      onChange={(e) => handleQuickDetailChange("age", e.target.value)}
                      placeholder="24"
                      className="rounded-xl"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">University</p>
                    <Input
                      value={editQuickDetails.university}
                      onChange={(e) => handleQuickDetailChange("university", e.target.value)}
                      placeholder="University of Bremen"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground">Contact</p>
                    <Input
                      value={editQuickDetails.contact}
                      onChange={(e) => handleQuickDetailChange("contact", e.target.value)}
                      placeholder="Email or phone"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground">Location (Germany)</p>
                    <Input
                      value={editQuickDetails.location}
                      onChange={(e) => handleQuickDetailChange("location", e.target.value)}
                      placeholder="Berlin"
                      list="german-city-options"
                      className="rounded-xl"
                    />
                    <datalist id="german-city-options">
                      {GERMAN_CITIES.map((city) => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                  </div>
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
                      type="date"
                      value={editQuickDetails.moveInDate}
                      onChange={(e) => handleQuickDetailChange("moveInDate", e.target.value)}
                      min={todayIsoDate}
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
                    <p className="text-xs font-medium text-muted-foreground">Hobbies</p>
                    <Textarea
                      value={editQuickDetails.hobbies}
                      onChange={(e) => handleQuickDetailChange("hobbies", e.target.value)}
                      placeholder="Cooking, cycling, reading"
                      rows={3}
                      className="rounded-xl font-body text-sm leading-relaxed resize-none"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Separate hobbies with commas.
                    </p>
                  </div>
                </div>
              ) : (
                <dl className="flex flex-col gap-3">
                  <DetailRow
                    label="Age"
                    value={profile?.age ? String(profile.age) : "Add your age"}
                    isPlaceholder={!profile?.age}
                  />
                  <DetailRow
                    label="University"
                    value={profile?.university || "Add your university"}
                    isPlaceholder={!profile?.university}
                  />
                  <DetailRow
                    label="Contact"
                    value={profile?.contact || "Add a contact method"}
                    isPlaceholder={!profile?.contact}
                  />
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

          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Hobbies</CardTitle>
            </CardHeader>
            <CardContent>
              {hobbyItems.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {hobbyItems.map((hobby) => (
                    <Badge
                      key={hobby}
                      variant="secondary"
                      className="rounded-full text-[10px] font-semibold px-2.5 py-1"
                    >
                      {hobby}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-body">
                  Add a few hobbies so housemates can get to know you faster.
                </p>
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
