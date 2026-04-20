"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  Dumbbell,
  GraduationCap,
  MapPin,
  Music,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/hooks";

type HomeMember = {
  id: string;
  role: "OWNER" | "MEMBER";
  displayName?: string | null;
  user: {
    id: string;
    email: string;
    displayName?: string | null;
    studentProfile?: {
      fullName?: string | null;
      age?: number | null;
      university?: string | null;
      contact?: string | null;
      hobbies?: string | null;
      houseBio?: string | null;
      avatarUrl?: string | null;
    } | null;
    residentProfile?: {
      fullName?: string | null;
      avatarUrl?: string | null;
    } | null;
  };
};

type HomeRule = {
  id: string;
  text: string;
};

type HomeProfile = {
  id: string;
  ownerId: string;
  title: string;
  district: string;
  isLive?: boolean;
  memberships: HomeMember[];
  rules: HomeRule[];
  prefCleanliness: number;
  prefRecycling: number;
  prefDiy: number;
  prefCooking: number;
  prefQuietness: number;
  prefMusic: number;
  prefFitness: number;
  prefStudyHabits: number;
  prefSocial: number;
  prefParties: number;
};

type SearchResult = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  age?: number | null;
  university?: string | null;
  currentRole?: string;
  currentHomeId?: string | null;
  currentHomeLabel?: string | null;
};

type WgPreferences = {
  cleanliness: number;
  recycling: number;
  diy: number;
  cooking: number;
  quietness: number;
  music: number;
  fitness: number;
  studyHabits: number;
  social: number;
  parties: number;
};

type EditableRule = {
  id: string;
  text: string;
};

const interestIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Cooking: Star,
  Photography: Sparkles,
  Yoga: Dumbbell,
  Design: Sparkles,
  Reading: Star,
  Guitar: Music,
  "Board Games": Users,
  Cycling: Dumbbell,
};

const preferenceMeta: Array<{ key: keyof WgPreferences; label: string }> = [
  { key: "cleanliness", label: "Cleanliness" },
  { key: "recycling", label: "Recycling" },
  { key: "diy", label: "DIY" },
  { key: "cooking", label: "Cooking" },
  { key: "quietness", label: "Quietness" },
  { key: "music", label: "Music" },
  { key: "fitness", label: "Fitness" },
  { key: "studyHabits", label: "Study Habits" },
  { key: "social", label: "Social Activity" },
  { key: "parties", label: "Parties" },
];

function splitHobbies(value?: string | null) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getMemberName(member: HomeMember) {
  return (
    member.user.displayName ??
    member.user.studentProfile?.fullName ??
    member.user.residentProfile?.fullName ??
    member.displayName ??
    member.user.email
  );
}

function getMemberAvatar(member: HomeMember) {
  return (
    member.user.studentProfile?.avatarUrl ??
    member.user.residentProfile?.avatarUrl ??
    null
  );
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function getLevel(value: number): string {
  if (value >= 80) return "Very Important";
  if (value >= 60) return "Important";
  if (value >= 40) return "Moderate";
  if (value >= 20) return "Low Priority";
  return "Not Important";
}

function getLevelColor(value: number): string {
  if (value >= 80) return "bg-accent/15 text-accent";
  if (value >= 60) return "bg-primary/15 text-primary";
  if (value >= 40) return "bg-muted text-muted-foreground";
  return "bg-muted text-muted-foreground";
}

export function LandlordHousemates() {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [homeProfile, setHomeProfile] = useState<HomeProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"OWNER" | "MEMBER">(
    "MEMBER",
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [savingMember, setSavingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const [editableRules, setEditableRules] = useState<EditableRule[]>([]);
  const [newRuleText, setNewRuleText] = useState("");
  const [preferences, setPreferences] = useState<WgPreferences>({
    cleanliness: 50,
    recycling: 50,
    diy: 50,
    cooking: 50,
    quietness: 50,
    music: 50,
    fitness: 50,
    studyHabits: 50,
    social: 50,
    parties: 50,
  });

  const hydrateEditableState = (profile: HomeProfile) => {
    setEditableRules(
      (profile.rules ?? []).map((rule) => ({ id: rule.id, text: rule.text })),
    );
    setPreferences({
      cleanliness: clampPercent(profile.prefCleanliness ?? 50),
      recycling: clampPercent(profile.prefRecycling ?? 50),
      diy: clampPercent(profile.prefDiy ?? 50),
      cooking: clampPercent(profile.prefCooking ?? 50),
      quietness: clampPercent(profile.prefQuietness ?? 50),
      music: clampPercent(profile.prefMusic ?? 50),
      fitness: clampPercent(profile.prefFitness ?? 50),
      studyHabits: clampPercent(profile.prefStudyHabits ?? 50),
      social: clampPercent(profile.prefSocial ?? 50),
      parties: clampPercent(profile.prefParties ?? 50),
    });
  };

  const fetchHome = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      setError("You need to sign in first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/homes/current?userId=${currentUser.id}`,
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load your WG.");
      }

      setHomeProfile(payload.homeProfile);
      setIsOwner(Boolean(payload.isOwner));
      hydrateEditableState(payload.homeProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load your WG.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchHome();
  }, [currentUser?.id]);

  const members = useMemo(
    () =>
      [...(homeProfile?.memberships ?? [])].sort((left, right) => {
        if (left.role === right.role) return 0;
        return left.role === "OWNER" ? -1 : 1;
      }),
    [homeProfile?.memberships],
  );

  const hobbySummary = useMemo(() => {
    const values = new Set<string>();
    members.forEach((member) => {
      splitHobbies(member.user.studentProfile?.hobbies).forEach((item) =>
        values.add(item),
      );
    });
    return Array.from(values).slice(0, 10);
  }, [members]);

  const currentMemberCount = members.length;
  const currentUserIsOwner = isOwner;

  const isMemberUnavailable =
    Boolean(searchResult) &&
    Boolean(
      homeProfile &&
      searchResult &&
      (members.some((member) => member.user.id === searchResult.id) ||
        (searchResult.currentHomeId &&
          searchResult.currentHomeId !== homeProfile.id)),
    );

  const handlePreferenceChange = (key: keyof WgPreferences, value: number) => {
    setPreferences((prev) => ({ ...prev, [key]: clampPercent(value) }));
  };

  const handleRuleChange = (ruleId: string, value: string) => {
    setEditableRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, text: value } : rule,
      ),
    );
  };

  const handleAddRule = () => {
    const text = newRuleText.trim();
    if (!text) return;

    setEditableRules((prev) => [...prev, { id: `new-${Date.now()}`, text }]);
    setNewRuleText("");
  };

  const handleRemoveRule = (ruleId: string) => {
    setEditableRules((prev) => prev.filter((rule) => rule.id !== ruleId));
  };

  const handleToggleEditProfile = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!currentUser?.id || !homeProfile) return;

    setIsSavingProfile(true);
    try {
      const response = await fetch(
        `/api/homes/current?userId=${currentUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rules: editableRules.map((rule) => ({ text: rule.text })),
            preferences,
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to save WG profile.");
      }

      setHomeProfile(payload.homeProfile);
      hydrateEditableState(payload.homeProfile);
      setIsEditing(false);
      toast({
        title: "WG profile updated",
        description: "Rules and preferences were saved successfully.",
      });
    } catch (err) {
      toast({
        title: "Unable to save WG profile",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setSearchMessage("Enter an email address first.");
      return;
    }

    setSearchLoading(true);
    setSearchMessage(null);
    setSearchResult(null);

    try {
      const response = await fetch(
        `/api/users/search?email=${encodeURIComponent(searchEmail.trim())}`,
      );
      const payload = await response.json();

      if (!response.ok || !payload.user) {
        throw new Error(payload.error || "No user found for that email.");
      }

      setSearchResult(payload.user);

      if (homeProfile) {
        if (members.some((member) => member.user.id === payload.user.id)) {
          setSearchMessage("This user is already part of your WG.");
        } else if (
          payload.user.currentHomeId &&
          payload.user.currentHomeId !== homeProfile.id
        ) {
          setSearchMessage(
            `Already part of ${payload.user.currentHomeLabel}. They need to leave that WG first.`,
          );
        }
      }
    } catch (err) {
      setSearchMessage(
        err instanceof Error ? err.message : "Unable to search user.",
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!currentUser?.id || !homeProfile || !searchResult) return;

    setSavingMember(true);

    try {
      const response = await fetch(
        `/api/homes/current/members?userId=${currentUser.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetUserId: searchResult.id,
            role: selectedRole,
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 409 && payload.existingHomeLabel) {
          setSearchMessage(
            payload.error || `Already part of ${payload.existingHomeLabel}`,
          );
          return;
        }
        throw new Error(payload.error || "Unable to add this housemate.");
      }

      toast({
        title: "Housemate added",
        description: `${getMemberName(payload.member)} joined ${homeProfile.title}.`,
      });

      setDialogOpen(false);
      setSearchEmail("");
      setSearchResult(null);
      setSearchMessage(null);
      setSelectedRole("MEMBER");
      await fetchHome();
    } catch (err) {
      setSearchMessage(
        err instanceof Error ? err.message : "Unable to add this housemate.",
      );
    } finally {
      setSavingMember(false);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!currentUser?.id) return;

    setRemovingMemberId(targetUserId);
    try {
      const response = await fetch(
        `/api/homes/current/members?userId=${currentUser.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to remove this housemate.");
      }

      toast({
        title: "Housemate removed",
        description: "The WG members list has been updated.",
      });

      await fetchHome();
    } catch (err) {
      toast({
        title: "Unable to remove housemate",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setRemovingMemberId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">My WG</h3>
          <p className="mt-0.5 text-sm text-muted-foreground font-body">
            Live housemates, editable house rules, and WG preference percentages
            for {homeProfile?.title ?? "your current WG"}.
          </p>
        </div>
        {currentUserIsOwner ? (
          <Button
            variant={isEditing ? "default" : "outline"}
            className="rounded-xl gap-2"
            onClick={() => void handleToggleEditProfile()}
            disabled={isSavingProfile}
          >
            {isEditing ? (
              <>
                <Check className="h-4 w-4" />
                {isSavingProfile ? "Saving..." : "Save Profile"}
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        ) : null}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load your WG</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">
              Current Housemates
            </CardTitle>
            {currentUserIsOwner && isEditing ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-2 bg-transparent"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Housemate
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground font-body">
              Loading live housemates...
            </p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body">
              No housemates found yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {members.map((member) => {
                const hobbies = splitHobbies(
                  member.user.studentProfile?.hobbies,
                );
                const isSelf = member.user.id === currentUser?.id;

                return (
                  <Card
                    key={member.id}
                    className="rounded-2xl border-border shadow-sm"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 border-2 border-card">
                          <AvatarImage
                            src={getMemberAvatar(member) ?? undefined}
                            alt={getMemberName(member)}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                            {getMemberName(member)
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((part) => part[0]?.toUpperCase())
                              .join("") || "WG"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-sm font-bold text-foreground">
                              {getMemberName(member)}
                            </h5>
                            <Badge className="rounded-full bg-accent/15 text-accent border-0 text-[10px] font-semibold gap-1">
                              <ShieldCheck className="h-3 w-3" />
                              {member.role === "OWNER" ? "Owner" : "Member"}
                            </Badge>
                            {isSelf ? (
                              <Badge
                                variant="secondary"
                                className="rounded-full text-[10px] font-semibold"
                              >
                                You
                              </Badge>
                            ) : null}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground font-body">
                            {member.user.studentProfile?.age ? (
                              <span>
                                {member.user.studentProfile.age} years old
                              </span>
                            ) : null}
                            {member.user.studentProfile?.age ? (
                              <span className="h-1 w-1 rounded-full bg-border" />
                            ) : null}
                            {member.user.studentProfile?.university ? (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {member.user.studentProfile.university}
                              </span>
                            ) : null}
                          </div>
                          {member.user.studentProfile?.contact ? (
                            <p className="mt-0.5 text-[11px] text-muted-foreground font-body flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {member.user.studentProfile.contact}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            WG Bio
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground font-body leading-relaxed">
                            {member.user.studentProfile?.houseBio ||
                              "No WG-specific bio shared yet."}
                          </p>
                        </div>

                        {hobbies.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {hobbies.map((hobby) => {
                              const Icon = interestIcons[hobby] || Sparkles;
                              return (
                                <Badge
                                  key={hobby}
                                  variant="secondary"
                                  className="gap-1.5 rounded-full text-[10px] font-medium px-2.5 py-1"
                                >
                                  <Icon className="h-3 w-3" />
                                  {hobby}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : null}

                        {currentUserIsOwner && isEditing && !isSelf ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl gap-2 bg-transparent"
                              onClick={() =>
                                void handleRemoveMember(member.user.id)
                              }
                              disabled={removingMemberId === member.user.id}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {removingMemberId === member.user.id
                                ? "Removing..."
                                : "Remove"}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">
              House Rules
            </CardTitle>
            <Badge variant="secondary" className="rounded-full text-xs">
              {editableRules.length} rules
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {editableRules.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body">
              No rules added yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {editableRules.map((rule, index) => (
                <li key={rule.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {index + 1}
                  </span>
                  {isEditing ? (
                    <Input
                      value={rule.text}
                      onChange={(event) =>
                        handleRuleChange(rule.id, event.target.value)
                      }
                      className="rounded-xl flex-1"
                    />
                  ) : (
                    <span className="text-sm text-foreground font-body leading-relaxed flex-1">
                      {rule.text}
                    </span>
                  )}
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(rule.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove rule</span>
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {isEditing ? (
            <div className="mt-4 flex items-center gap-2">
              <Input
                placeholder="Add a new house rule..."
                value={newRuleText}
                onChange={(event) => setNewRuleText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddRule();
                  }
                }}
                className="rounded-xl flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5 shrink-0 bg-transparent"
                onClick={handleAddRule}
                disabled={!newRuleText.trim()}
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border shadow-sm bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            WG Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {preferenceMeta.map((item) => (
            <div key={item.key} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <span className="text-xs font-bold text-foreground">
                  {preferences[item.key]}%
                </span>
              </div>
              {isEditing ? (
                <Slider
                  value={[preferences[item.key]]}
                  onValueChange={(value) =>
                    handlePreferenceChange(item.key, value[0] ?? preferences[item.key])
                  }
                  max={100}
                  step={5}
                  className="w-full"
                />
              ) : (
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-primary/15">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${preferences[item.key]}%` }}
                  />
                </div>
              )}
              <Badge
                className={`rounded-full border-0 text-[10px] font-semibold ${getLevelColor(preferences[item.key])}`}
              >
                {getLevel(preferences[item.key])}
              </Badge>
            </div>
          ))}

          {hobbySummary.length > 0 ? (
            <>
              <Separator className="my-2" />
              <div className="flex flex-wrap gap-2">
                {hobbySummary.map((hobby) => (
                  <Badge
                    key={hobby}
                    variant="secondary"
                    className="rounded-full text-[10px] font-semibold px-2.5 py-1"
                  >
                    {hobby}
                  </Badge>
                ))}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add housemate</DialogTitle>
            <DialogDescription>
              Search by email, confirm the mini profile, then choose the role
              before adding them.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Email address
              </p>
              <div className="flex gap-2">
                <Input
                  value={searchEmail}
                  onChange={(event) => setSearchEmail(event.target.value)}
                  placeholder="candidate@example.com"
                  className="rounded-xl"
                />
                <Button
                  variant="outline"
                  className="rounded-xl gap-2 bg-transparent"
                  onClick={() => void handleSearch()}
                  disabled={searchLoading}
                >
                  <Search className="h-4 w-4" />
                  {searchLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            {searchMessage ? (
              <Alert variant={isMemberUnavailable ? "destructive" : "default"}>
                <AlertTitle>Heads up</AlertTitle>
                <AlertDescription>{searchMessage}</AlertDescription>
              </Alert>
            ) : null}

            {searchResult ? (
              <div className="flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <Avatar className="h-12 w-12 border-2 border-card">
                  <AvatarImage
                    src={searchResult.avatarUrl ?? undefined}
                    alt={searchResult.fullName}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {searchResult.fullName
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join("") || "UG"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">
                      {searchResult.fullName}
                    </h4>
                    <Badge
                      variant="secondary"
                      className="rounded-full text-[10px] font-semibold"
                    >
                      {searchResult.currentRole ?? "Student"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {searchResult.email}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {searchResult.age ? (
                      <span>{searchResult.age} years old</span>
                    ) : null}
                    {searchResult.university ? (
                      <span>{searchResult.university}</span>
                    ) : null}
                    {searchResult.currentHomeLabel ? (
                      <span>Current WG: {searchResult.currentHomeLabel}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Role in this WG
              </p>
              <select
                value={selectedRole}
                onChange={(event) =>
                  setSelectedRole(event.target.value as "OWNER" | "MEMBER")
                }
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="MEMBER">Member</option>
                <option value="OWNER" disabled={!currentUserIsOwner}>
                  Owner
                </option>
              </select>
              {!currentUserIsOwner ? (
                <p className="text-[11px] text-muted-foreground">
                  Only owners can add another owner.
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl bg-transparent"
              onClick={() => {
                setDialogOpen(false);
                setSearchMessage(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl gap-2"
              onClick={() => void handleAddMember()}
              disabled={!searchResult || isMemberUnavailable || savingMember}
            >
              <Plus className="h-4 w-4" />
              {savingMember ? "Adding..." : "Add Housemate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
