"use client";

import React, { useEffect, useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Users,
  Calendar,
  Heart,
  ArrowUpDown,
  Home,
  Wifi,
  Bike,
  TreePine,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Send,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";

type ApplicationStatus =
  | "PENDING"
  | "VIEWED"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | null;

interface WGListing {
  id: string;
  title: string;
  district: string;
  price: number;
  roomSize: string;
  roomSizeM2: number | null;
  totalRooms: number;
  currentResidents: number;
  availableFrom: string | null;
  matchScore: number;
  verified: boolean;
  tags: string[];
  description: string;
  amenities: string[];
  address: string | null;
  isFavorite: boolean;
  applicationStatus: ApplicationStatus;
  residentNames: string[];
  ownerName: string;
}

const amenityIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  wifi: Wifi,
  bike: Bike,
  garden: TreePine,
  green: TreePine,
};

function getMatchColor(score: number): string {
  if (score >= 85) return "bg-accent/15 text-accent";
  if (score >= 70) return "bg-primary/15 text-primary";
  return "bg-muted text-muted-foreground";
}

function getApplicationLabel(status: ApplicationStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "VIEWED":
      return "Viewed";
    case "INTERVIEW":
      return "Interview";
    case "ACCEPTED":
      return "Accepted";
    case "REJECTED":
      return "Rejected";
    default:
      return "";
  }
}

function getApplicationClass(status: ApplicationStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-muted text-muted-foreground";
    case "VIEWED":
      return "bg-primary/15 text-primary";
    case "INTERVIEW":
      return "bg-accent/15 text-accent";
    case "ACCEPTED":
      return "bg-accent/20 text-accent";
    case "REJECTED":
      return "bg-destructive/10 text-destructive";
    default:
      return "";
  }
}

export function BrowseWGs() {
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const [listings, setListings] = useState<WGListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedListing, setSelectedListing] = useState<WGListing | null>(
    null,
  );

  const [isApplying, setIsApplying] = useState(false);
  const [showApplyBox, setShowApplyBox] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadListings = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      setError("User not logged in.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        userId: currentUser.id,
        search: searchQuery,
        favoritesOnly: favoritesOnly ? "true" : "false",
      });

      const response = await fetch(`/api/homes/browse?${query.toString()}`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load listings");
      }

      setListings(result.listings || []);

      if (selectedListing) {
        const refreshedSelected = (result.listings || []).find(
          (listing: WGListing) => listing.id === selectedListing.id,
        );
        setSelectedListing(refreshedSelected || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadListings();
  }, [currentUser?.id, favoritesOnly]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadListings();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadListings();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [currentUser?.id, favoritesOnly, searchQuery]);

  const toggleFavorite = async (listing: WGListing) => {
    if (!currentUser?.id) return;

    const nextValue = !listing.isFavorite;

    setListings((prev) =>
      prev.map((item) =>
        item.id === listing.id ? { ...item, isFavorite: nextValue } : item,
      ),
    );
    setSelectedListing((prev) =>
      prev && prev.id === listing.id
        ? { ...prev, isFavorite: nextValue }
        : prev,
    );

    try {
      const response = await fetch("/api/homes/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          homeProfileId: listing.id,
          favorite: nextValue,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update favorite");
      }

      if (favoritesOnly) {
        void loadListings();
      }
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : "Failed to update favorite",
      );
      setListings((prev) =>
        prev.map((item) =>
          item.id === listing.id
            ? { ...item, isFavorite: listing.isFavorite }
            : item,
        ),
      );
      setSelectedListing((prev) =>
        prev && prev.id === listing.id
          ? { ...prev, isFavorite: listing.isFavorite }
          : prev,
      );
    }
  };

  const submitApplication = async () => {
    if (!selectedListing || !currentUser?.id) return;

    if (selectedListing.applicationStatus) {
      setFeedback(
        `Application already ${getApplicationLabel(selectedListing.applicationStatus)}.`,
      );
      setShowApplyBox(false);
      return;
    }

    const message = applicationMessage.trim();
    if (!message) {
      setFeedback("Please write a short message before applying.");
      return;
    }

    setIsApplying(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          homeProfileId: selectedListing.id,
          message,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit application");
      }

      setFeedback("Application sent successfully.");
      setShowApplyBox(false);
      setApplicationMessage("");
      await loadListings();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : "Failed to submit application",
      );
    } finally {
      setIsApplying(false);
    }
  };

  const displayedListings = useMemo(() => {
    const filtered = listings.filter((listing) =>
      districtFilter === "all" ? true : listing.district === districtFilter,
    );

    return filtered.sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return 0;
    });
  }, [listings, districtFilter, sortBy]);

  const districts = [...new Set(listings.map((listing) => listing.district))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading WG listings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : null}

      {/* Search and filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or district..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={favoritesOnly ? "default" : "outline"}
            className="rounded-xl gap-2"
            onClick={() => setFavoritesOnly((prev) => !prev)}
          >
            <Heart
              className={`h-4 w-4 ${favoritesOnly ? "fill-current" : ""}`}
            />
            Favorites
          </Button>
          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger className="w-[160px] rounded-xl">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best Match</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-body">
          <span className="font-semibold text-foreground">
            {displayedListings.length}
          </span>{" "}
          WGs found
        </p>
        <p className="text-xs text-muted-foreground font-body">
          Sorted by{" "}
          {sortBy === "match"
            ? "compatibility"
            : sortBy === "price-low"
              ? "lowest price"
              : "highest price"}
        </p>
      </div>

      {/* Listings grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedListings.map((listing) => (
          <Card
            key={listing.id}
            className="group cursor-pointer rounded-2xl border-border shadow-sm transition-all hover:shadow-md hover:border-primary/25"
            onClick={() => {
              setSelectedListing(listing);
              setShowApplyBox(false);
              setApplicationMessage("");
              setFeedback(null);
            }}
          >
            <div className="relative h-36 rounded-t-2xl bg-muted overflow-hidden">
              <div className="flex h-full w-full items-center justify-center">
                <Home className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <Badge
                className={`absolute left-3 top-3 rounded-full border-0 text-xs font-bold px-2.5 py-0.5 ${getMatchColor(listing.matchScore)}`}
              >
                {listing.matchScore}% Match
              </Badge>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void toggleFavorite(listing);
                }}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm shadow-sm hover:bg-card transition-colors"
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    listing.isFavorite
                      ? "fill-destructive text-destructive"
                      : "text-muted-foreground"
                  }`}
                />
                <span className="sr-only">
                  {listing.isFavorite
                    ? "Remove from favorites"
                    : "Add to favorites"}
                </span>
              </button>
              {listing.applicationStatus ? (
                <Badge
                  className={`absolute right-3 top-12 rounded-full border-0 text-[10px] font-semibold px-2.5 py-0.5 ${getApplicationClass(listing.applicationStatus)}`}
                >
                  {getApplicationLabel(listing.applicationStatus)}
                </Badge>
              ) : null}
              {listing.verified ? (
                <div className="absolute bottom-3 left-3">
                  <Badge className="gap-1 rounded-full bg-card/80 backdrop-blur-sm text-accent border-0 text-[10px] font-semibold">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                </div>
              ) : null}
            </div>

            <CardContent className="p-4">
              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {listing.title}
              </h4>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground font-body">
                <MapPin className="h-3 w-3" />
                {listing.district}
                <span className="h-1 w-1 rounded-full bg-border" />
                <Users className="h-3 w-3" />
                {listing.currentResidents}/{listing.totalRooms}
                <span className="h-1 w-1 rounded-full bg-border" />
                {listing.roomSize}
              </div>
              <p className="mt-2 text-xs text-muted-foreground font-body leading-relaxed line-clamp-2">
                {listing.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {listing.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-full text-[10px] font-medium px-2 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
                {listing.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity];
                  return Icon ? (
                    <span
                      key={amenity}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-muted"
                    >
                      <Icon className="h-3 w-3 text-muted-foreground" />
                    </span>
                  ) : null;
                })}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <div>
                  <p className="text-lg font-bold text-foreground">
                    EUR {listing.price}
                    <span className="text-xs font-normal text-muted-foreground">
                      /month
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                  <Calendar className="h-3 w-3" />
                  {listing.availableFrom || "Flexible"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {displayedListings.length === 0 ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              No WG listings found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try changing your filters or search.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Detail modal */}
      {selectedListing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedListing(null)}
          onKeyDown={(event) =>
            event.key === "Escape" && setSelectedListing(null)
          }
        >
          <Card
            className="w-full max-w-lg rounded-2xl shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-48 rounded-t-2xl bg-muted overflow-hidden">
              <div className="flex h-full w-full items-center justify-center">
                <Home className="h-16 w-16 text-muted-foreground/30" />
              </div>
              <Badge
                className={`absolute left-4 top-4 rounded-full border-0 text-sm font-bold px-3 py-1 ${getMatchColor(selectedListing.matchScore)}`}
              >
                {selectedListing.matchScore}% Match
              </Badge>
            </div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {selectedListing.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground font-body">
                    <MapPin className="h-3.5 w-3.5" />
                    {selectedListing.district}, Berlin
                  </p>
                </div>
                <p className="text-xl font-bold text-foreground shrink-0">
                  EUR {selectedListing.price}
                  <span className="text-xs font-normal text-muted-foreground">
                    /mo
                  </span>
                </p>
              </div>

              <p className="mt-4 text-sm text-muted-foreground font-body leading-relaxed">
                {selectedListing.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Room Size</p>
                  <p className="font-semibold text-foreground">
                    {selectedListing.roomSize}
                  </p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Residents</p>
                  <p className="font-semibold text-foreground">
                    {selectedListing.currentResidents} of{" "}
                    {selectedListing.totalRooms}
                  </p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="font-semibold text-foreground">
                    {selectedListing.availableFrom || "Flexible"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Verified</p>
                  <p className="font-semibold text-foreground">
                    {selectedListing.verified ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {selectedListing.residentNames.length ? (
                <div className="mt-4 rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted-foreground">
                    Current residents
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {selectedListing.residentNames.join(", ")}
                  </p>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {selectedListing.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-full text-xs font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {feedback ? (
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
                  {feedback}
                </div>
              ) : null}

              {showApplyBox ? (
                <div className="mt-4 rounded-xl border border-border p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    Application Message
                  </p>
                  <textarea
                    value={applicationMessage}
                    onChange={(event) =>
                      setApplicationMessage(event.target.value)
                    }
                    rows={4}
                    placeholder="Write why you are a good match for this WG..."
                    className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setShowApplyBox(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="rounded-xl gap-2"
                      onClick={() => void submitApplication()}
                      disabled={isApplying}
                    >
                      <Send className="h-4 w-4" />
                      {isApplying ? "Sending..." : "Send Application"}
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex gap-3">
                <Button
                  className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  onClick={() => {
                    if (selectedListing.applicationStatus) {
                      setFeedback(
                        `Application already ${getApplicationLabel(selectedListing.applicationStatus)}.`,
                      );
                      return;
                    }
                    setShowApplyBox(true);
                    setFeedback(null);
                  }}
                  disabled={Boolean(selectedListing.applicationStatus)}
                >
                  <MessageSquare className="h-4 w-4" />
                  {selectedListing.applicationStatus
                    ? `Application ${getApplicationLabel(selectedListing.applicationStatus)}`
                    : "Apply Now"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl gap-2 bg-transparent"
                  onClick={() => void toggleFavorite(selectedListing)}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      selectedListing.isFavorite
                        ? "fill-destructive text-destructive"
                        : ""
                    }`}
                  />
                  {selectedListing.isFavorite ? "Saved" : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
