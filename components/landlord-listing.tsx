"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Pencil,
  Check,
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
  AlertCircle,
  Trash2,
  Search,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";

type ListingPreview = {
  id: string;
  title: string;
  district: string;
  rentPrice: number;
  roomSizeM2: number | null;
  availableFrom: string | null;
  availableRooms: number;
  isLive: boolean;
  updatedAt: string;
};

interface HomeAmenity {
  id: string;
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
}

const amenityIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  wifi: Wifi,
  washer: WashingMachine,
  kitchen: CookingPot,
  bike: Bike,
  garden: TreePine,
  shower: ShowerHead,
  furnished: Sofa,
};

const amenityLabels: Record<string, string> = {
  wifi: "WiFi",
  washer: "Washing Machine",
  kitchen: "Fully Equipped Kitchen",
  bike: "Bike Storage",
  garden: "Garden / Balcony",
  shower: "Private Shower",
  furnished: "Furnished Room",
};

const defaultAmenities: HomeAmenity[] = [
  { id: "wifi", key: "wifi", label: "WiFi", icon: Wifi, enabled: true },
  {
    id: "washer",
    key: "washer",
    label: "Washing Machine",
    icon: WashingMachine,
    enabled: true,
  },
  {
    id: "kitchen",
    key: "kitchen",
    label: "Fully Equipped Kitchen",
    icon: CookingPot,
    enabled: true,
  },
  { id: "bike", key: "bike", label: "Bike Storage", icon: Bike, enabled: true },
  {
    id: "garden",
    key: "garden",
    label: "Garden / Balcony",
    icon: TreePine,
    enabled: false,
  },
  {
    id: "shower",
    key: "shower",
    label: "Private Shower",
    icon: ShowerHead,
    enabled: false,
  },
  {
    id: "furnished",
    key: "furnished",
    label: "Furnished Room",
    icon: Sofa,
    enabled: true,
  },
];

export function LandlordListing() {
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const [viewMode, setViewMode] = useState<"list" | "details">("list");
  const [listings, setListings] = useState<ListingPreview[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null,
  );
  const [searchValue, setSearchValue] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [editData, setEditData] = useState({
    title: "",
    description: "",
    rent: "",
    deposit: "",
    roomSize: "",
    availableFrom: "",
    minStay: "",
    isLive: true,
    address: "",
    district: "",
    vibeSummary: "",
  });

  const [amenities, setAmenities] = useState<HomeAmenity[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "",
    district: "",
    address: "",
    description: "",
    rentPrice: "",
    roomSizeM2: "",
    availableRooms: "1",
    totalRooms: "3",
  });

  const selectedListing = useMemo(
    () => listings.find((listing) => listing.id === selectedListingId) ?? null,
    [listings, selectedListingId],
  );

  const filteredListings = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return listings;

    return listings.filter((listing) => {
      const text = `${listing.title} ${listing.district}`.toLowerCase();
      return text.includes(query);
    });
  }, [listings, searchValue]);

  const fetchListings = async () => {
    if (!currentUser?.id) return;

    const response = await fetch(
      `/api/homes/listings?userId=${encodeURIComponent(currentUser.id)}`,
      { cache: "no-store" },
    );

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Failed to load listings");
    }

    setListings(payload.listings || []);
    setIsOwner(Boolean(payload.ownerForAnchor));

    if (
      selectedListingId &&
      !payload.listings.some((l: ListingPreview) => l.id === selectedListingId)
    ) {
      setSelectedListingId(null);
      setViewMode("list");
    }
  };

  const fetchListingDetails = async (listingId: string) => {
    if (!currentUser?.id) return;

    const response = await fetch(
      `/api/homes/current?userId=${encodeURIComponent(currentUser.id)}&listingId=${encodeURIComponent(listingId)}`,
      { cache: "no-store" },
    );

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Failed to load listing details");
    }

    const homeProfile = payload.homeProfile;

    setIsOwner(Boolean(payload.isOwner));
    setEditData({
      title: homeProfile.title || "",
      description: homeProfile.description || "",
      rent: String(homeProfile.rentPrice ?? 0),
      deposit: String(homeProfile.depositAmount ?? 0),
      roomSize: String(homeProfile.roomSizeM2 ?? 0),
      availableFrom: homeProfile.availableFrom || "",
      minStay: String(homeProfile.minStayMonths ?? 0),
      isLive: Boolean(homeProfile.isLive),
      address: homeProfile.address || "",
      district: homeProfile.district || "",
      vibeSummary: homeProfile.vibeSummary || "",
    });

    if (homeProfile.amenities?.length) {
      setAmenities(
        homeProfile.amenities.map((amenity: any) => ({
          id: amenity.id,
          key: amenity.key,
          label: amenityLabels[amenity.key] || amenity.key,
          icon: amenityIcons[amenity.key] || Sofa,
          enabled: amenity.enabled,
        })),
      );
    } else {
      setAmenities(defaultAmenities);
    }
  };

  const refreshListings = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      setError("User not logged in");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await fetchListings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshListings();
  }, [currentUser?.id]);

  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedListingId || viewMode !== "details") return;
      setLoadingDetails(true);
      setError(null);
      try {
        await fetchListingDetails(selectedListingId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load listing details",
        );
      } finally {
        setLoadingDetails(false);
      }
    };

    void loadDetails();
  }, [selectedListingId, viewMode]);

  const handleEditFieldChange = (field: string, value: string | boolean) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (id: string) => {
    setAmenities((prev) =>
      prev.map((amenity) =>
        amenity.id === id ? { ...amenity, enabled: !amenity.enabled } : amenity,
      ),
    );
  };

  const openListingDetails = (listingId: string) => {
    setSelectedListingId(listingId);
    setIsEditing(false);
    setSaveMessage(null);
    setViewMode("details");
  };

  const goBackToList = () => {
    setViewMode("list");
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!currentUser?.id || !isOwner || !selectedListingId) {
      setSaveMessage({
        type: "error",
        text: "You are not authorized to edit this listing",
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const payload = {
        title: editData.title.trim(),
        description: editData.description.trim(),
        rentPrice: Math.max(0, parseInt(editData.rent, 10) || 0),
        depositAmount: Math.max(0, parseInt(editData.deposit, 10) || 0),
        roomSizeM2: Math.max(0, parseInt(editData.roomSize, 10) || 0),
        availableFrom: editData.availableFrom.trim(),
        minStayMonths: Math.max(0, parseInt(editData.minStay, 10) || 0),
        isLive: editData.isLive,
        address: editData.address.trim(),
        district: editData.district.trim(),
        vibeSummary: editData.vibeSummary.trim(),
        amenities: amenities.map((amenity, index) => ({
          key: amenity.key,
          enabled: amenity.enabled,
          sortOrder: index,
        })),
      };

      const response = await fetch(
        `/api/homes/current?userId=${encodeURIComponent(currentUser.id)}&listingId=${encodeURIComponent(selectedListingId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to save changes");
      }

      setSaveMessage({ type: "success", text: "Listing saved successfully!" });
      setIsEditing(false);
      await fetchListings();
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save changes",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickLiveToggle = async (checked: boolean) => {
    if (!currentUser?.id || !selectedListingId || !isOwner) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch(
        `/api/homes/current?userId=${encodeURIComponent(currentUser.id)}&listingId=${encodeURIComponent(selectedListingId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isLive: checked }),
        },
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to update");

      setEditData((prev) => ({ ...prev, isLive: checked }));
      setSaveMessage({ type: "success", text: "Listing visibility updated!" });
      await fetchListings();
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage({ type: "error", text: "Failed to update visibility" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateListing = async () => {
    if (!currentUser?.id || !isOwner) return;

    if (!newListing.title.trim() || !newListing.district.trim()) {
      setSaveMessage({
        type: "error",
        text: "Title and district are required",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(
        `/api/homes/listings?userId=${encodeURIComponent(currentUser.id)}${selectedListingId ? `&listingId=${encodeURIComponent(selectedListingId)}` : ""}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newListing.title,
            district: newListing.district,
            address: newListing.address,
            description: newListing.description,
            rentPrice: parseInt(newListing.rentPrice, 10) || 0,
            roomSizeM2: parseInt(newListing.roomSizeM2, 10) || 0,
            availableRooms: Math.max(
              1,
              parseInt(newListing.availableRooms, 10) || 1,
            ),
            totalRooms: Math.max(1, parseInt(newListing.totalRooms, 10) || 1),
            isLive: false,
          }),
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to create listing");
      }

      setCreateOpen(false);
      setNewListing({
        title: "",
        district: "",
        address: "",
        description: "",
        rentPrice: "",
        roomSizeM2: "",
        availableRooms: "1",
        totalRooms: "3",
      });
      setSaveMessage({ type: "success", text: "New listing created" });
      await fetchListings();
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to create listing",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!currentUser?.id || !selectedListingId || !isOwner) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/homes/listings?userId=${encodeURIComponent(currentUser.id)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: selectedListingId }),
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete listing");
      }

      setSaveMessage({ type: "success", text: "Listing deleted" });
      setIsEditing(false);
      setSelectedListingId(null);
      setViewMode("list");
      await fetchListings();
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete listing",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading your WG listings...</p>
      </div>
    );
  }

  if (error && viewMode === "list") {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5 max-w-md">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-6">
        {saveMessage ? (
          <div
            className={`rounded-xl p-4 text-sm font-medium ${
              saveMessage.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {saveMessage.text}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              My WG Listings
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground font-body">
              All listings are shown here. Select one to open its dedicated
              detail page.
            </p>
          </div>
          {isOwner ? (
            <Button
              className="rounded-xl gap-2"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Listing
            </Button>
          ) : null}
        </div>

        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search by listing title or district"
                className="rounded-xl pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredListings.map((listing) => (
            <button
              key={listing.id}
              type="button"
              onClick={() => openListingDetails(listing.id)}
              className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground line-clamp-1">
                  {listing.title}
                </p>
                <Badge
                  variant="secondary"
                  className={`rounded-full text-[10px] font-semibold ${listing.isLive ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}
                >
                  {listing.isLive ? "Live" : "Hidden"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {listing.district || "No district"}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>EUR {listing.rentPrice}/month</span>
                <span>{listing.roomSizeM2 || 0}m2</span>
                <span>{listing.availableRooms} room(s)</span>
              </div>
              <p className="mt-4 text-xs font-semibold text-primary">
                Open listing
              </p>
            </button>
          ))}
        </div>

        {filteredListings.length === 0 ? (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                No listings found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try a different search term or create a new listing.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {createOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
            <Card className="w-full max-w-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Add New WG Listing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Title *
                    </Label>
                    <Input
                      value={newListing.title}
                      onChange={(event) =>
                        setNewListing((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                      className="mt-1 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      District *
                    </Label>
                    <Input
                      value={newListing.district}
                      onChange={(event) =>
                        setNewListing((prev) => ({
                          ...prev,
                          district: event.target.value,
                        }))
                      }
                      className="mt-1 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Address
                  </Label>
                  <Input
                    value={newListing.address}
                    onChange={(event) =>
                      setNewListing((prev) => ({
                        ...prev,
                        address: event.target.value,
                      }))
                    }
                    className="mt-1 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Description
                  </Label>
                  <Textarea
                    value={newListing.description}
                    onChange={(event) =>
                      setNewListing((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    rows={3}
                    className="mt-1 rounded-lg text-sm"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Rent (EUR)
                    </Label>
                    <Input
                      type="number"
                      value={newListing.rentPrice}
                      onChange={(event) =>
                        setNewListing((prev) => ({
                          ...prev,
                          rentPrice: event.target.value,
                        }))
                      }
                      className="mt-1 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Room Size (m2)
                    </Label>
                    <Input
                      type="number"
                      value={newListing.roomSizeM2}
                      onChange={(event) =>
                        setNewListing((prev) => ({
                          ...prev,
                          roomSizeM2: event.target.value,
                        }))
                      }
                      className="mt-1 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Available Rooms
                    </Label>
                    <Input
                      type="number"
                      value={newListing.availableRooms}
                      onChange={(event) =>
                        setNewListing((prev) => ({
                          ...prev,
                          availableRooms: event.target.value,
                        }))
                      }
                      className="mt-1 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Total Rooms
                    </Label>
                    <Input
                      type="number"
                      value={newListing.totalRooms}
                      onChange={(event) =>
                        setNewListing((prev) => ({
                          ...prev,
                          totalRooms: event.target.value,
                        }))
                      }
                      className="mt-1 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl bg-transparent"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="rounded-xl gap-2"
                    onClick={() => void handleCreateListing()}
                    disabled={isCreating}
                  >
                    <Plus className="h-4 w-4" />
                    {isCreating ? "Creating..." : "Create Listing"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {saveMessage ? (
        <div
          className={`rounded-xl p-4 text-sm font-medium ${
            saveMessage.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {saveMessage.text}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={goBackToList}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Listings
          </Button>
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {selectedListing?.title || "Listing Details"}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground font-body">
              Edit and manage the selected WG listing.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOwner ? (
            <Button
              variant={isEditing ? "default" : "outline"}
              className="rounded-xl gap-2"
              onClick={() => {
                if (isEditing) {
                  void handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={isSaving || loadingDetails}
            >
              {isEditing ? (
                <>
                  <Check className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  Edit Listing
                </>
              )}
            </Button>
          ) : null}
          {isOwner ? (
            <Button
              variant="outline"
              className="rounded-xl gap-2"
              onClick={() => void handleDeleteListing()}
              disabled={isSaving || listings.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      {loadingDetails ? (
        <Card className="rounded-2xl">
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading listing details...
          </CardContent>
        </Card>
      ) : null}

      {error && !loadingDetails ? (
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!loadingDetails && !error ? (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Listing Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="listing-title"
                      className="text-sm font-medium"
                    >
                      Title
                    </Label>
                    {isEditing && isOwner ? (
                      <Input
                        id="listing-title"
                        value={editData.title}
                        onChange={(event) =>
                          handleEditFieldChange("title", event.target.value)
                        }
                        className="rounded-xl"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-foreground">
                        {editData.title || "-"}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="listing-desc"
                      className="text-sm font-medium"
                    >
                      Description
                    </Label>
                    {isEditing && isOwner ? (
                      <Textarea
                        id="listing-desc"
                        value={editData.description}
                        onChange={(event) =>
                          handleEditFieldChange(
                            "description",
                            event.target.value,
                          )
                        }
                        rows={5}
                        className="rounded-xl font-body text-sm leading-relaxed resize-none"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground font-body leading-relaxed whitespace-pre-line">
                        {editData.description || "-"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Amenities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {amenities.map((amenity) => {
                      const Icon = amenity.icon;
                      return (
                        <div
                          key={amenity.id}
                          className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                            amenity.enabled
                              ? "bg-primary/8 border border-primary/15"
                              : "bg-muted/50 border border-transparent"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              amenity.enabled
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span
                            className={`text-sm font-medium flex-1 ${amenity.enabled ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {amenity.label}
                          </span>
                          {isEditing && isOwner ? (
                            <Switch
                              checked={amenity.enabled}
                              onCheckedChange={() => toggleAmenity(amenity.id)}
                            />
                          ) : amenity.enabled ? (
                            <Check className="h-4 w-4 text-accent" />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Listing Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                    <div className="flex items-center gap-2">
                      {editData.isLive ? (
                        <Eye className="h-4 w-4 text-accent" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">
                        {editData.isLive ? "Live" : "Hidden"}
                      </span>
                    </div>
                    <Switch
                      checked={editData.isLive}
                      onCheckedChange={(checked) => {
                        setEditData((prev) => ({ ...prev, isLive: checked }));
                        if (!isEditing) {
                          void handleQuickLiveToggle(checked);
                        }
                      }}
                      disabled={!isOwner || isSaving}
                    />
                  </div>

                  <DetailField
                    icon={Euro}
                    label="Monthly Rent"
                    fieldKey="rent"
                    value={editData.rent}
                    suffix="/month"
                    isEditing={isEditing && isOwner}
                    onEditChange={handleEditFieldChange}
                    type="number"
                  />
                  <Separator />
                  <DetailField
                    icon={Euro}
                    label="Deposit"
                    fieldKey="deposit"
                    value={editData.deposit}
                    suffix=""
                    isEditing={isEditing && isOwner}
                    onEditChange={handleEditFieldChange}
                    type="number"
                  />
                  <Separator />
                  <DetailField
                    icon={Maximize2}
                    label="Room Size"
                    fieldKey="roomSize"
                    value={editData.roomSize}
                    suffix="m2"
                    isEditing={isEditing && isOwner}
                    onEditChange={handleEditFieldChange}
                    type="number"
                  />
                  <Separator />
                  <DetailField
                    icon={Calendar}
                    label="Minimum Stay"
                    fieldKey="minStay"
                    value={editData.minStay}
                    suffix="months"
                    isEditing={isEditing && isOwner}
                    onEditChange={handleEditFieldChange}
                    type="number"
                  />
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Address
                    </Label>
                    {isEditing && isOwner ? (
                      <Input
                        value={editData.address}
                        onChange={(event) =>
                          handleEditFieldChange("address", event.target.value)
                        }
                        className="mt-1 rounded-lg text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {editData.address || "-"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      District
                    </Label>
                    {isEditing && isOwner ? (
                      <Input
                        value={editData.district}
                        onChange={(event) =>
                          handleEditFieldChange("district", event.target.value)
                        }
                        className="mt-1 rounded-lg text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {editData.district || "-"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Available From
                    </Label>
                    {isEditing && isOwner ? (
                      <Input
                        type="date"
                        value={editData.availableFrom}
                        onChange={(event) =>
                          handleEditFieldChange(
                            "availableFrom",
                            event.target.value,
                          )
                        }
                        className="mt-1 rounded-lg text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {editData.availableFrom || "-"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function DetailField({
  icon: Icon,
  label,
  fieldKey,
  value,
  suffix,
  isEditing,
  onEditChange,
  type = "text",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  fieldKey: string;
  value: string;
  suffix: string;
  isEditing: boolean;
  onEditChange: (field: string, value: string) => void;
  type?: string;
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
            value={value}
            onChange={(event) => onEditChange(fieldKey, event.target.value)}
            className="mt-1 h-8 rounded-lg text-sm"
            type={type}
          />
        ) : (
          <p className="text-sm font-medium text-foreground">
            {label.includes("Rent") || label.includes("Deposit") ? "EUR " : ""}
            {value || "0"}
            {suffix ? ` ${suffix}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
