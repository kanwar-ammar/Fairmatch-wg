"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  MapPin,
  Users,
  Calendar,
  Heart,
  ArrowUpDown,
  SlidersHorizontal,
  Home,
  Wifi,
  Bike,
  TreePine,
  ShieldCheck,
  ChevronRight,
} from "lucide-react"

interface WGListing {
  id: number
  title: string
  district: string
  price: number
  roomSize: string
  totalRooms: number
  currentResidents: number
  availableFrom: string
  matchScore: number
  verified: boolean
  tags: string[]
  description: string
  amenities: string[]
}

const listings: WGListing[] = [
  {
    id: 1,
    title: "Sunny 3er-WG in Kreuzberg",
    district: "Kreuzberg",
    price: 480,
    roomSize: "18m\u00B2",
    totalRooms: 3,
    currentResidents: 2,
    availableFrom: "Mar 1, 2026",
    matchScore: 92,
    verified: true,
    tags: ["Furnished", "Balcony", "LGBTQ+ friendly"],
    description: "A bright, spacious room in a lively Kreuzberg WG. We love cooking together and keeping things tidy.",
    amenities: ["wifi", "bike", "green"],
  },
  {
    id: 2,
    title: "Cozy room near TU Berlin",
    district: "Charlottenburg",
    price: 420,
    roomSize: "14m\u00B2",
    totalRooms: 2,
    currentResidents: 1,
    availableFrom: "Apr 1, 2026",
    matchScore: 87,
    verified: true,
    tags: ["Study-friendly", "Near campus"],
    description: "Perfect for focused students. 5 min walk to TU Berlin. Quiet neighborhood with great transit.",
    amenities: ["wifi"],
  },
  {
    id: 3,
    title: "Green WG in Prenzlauer Berg",
    district: "Prenzlauer Berg",
    price: 510,
    roomSize: "16m\u00B2",
    totalRooms: 4,
    currentResidents: 3,
    availableFrom: "Mar 15, 2026",
    matchScore: 84,
    verified: true,
    tags: ["Eco-conscious", "Vegetarian kitchen"],
    description: "Join our eco-friendly household! We compost, bike everywhere, and host weekly veggie dinner nights.",
    amenities: ["wifi", "bike", "green"],
  },
  {
    id: 4,
    title: "Artist WG in Neuk\u00F6lln",
    district: "Neuk\u00F6lln",
    price: 390,
    roomSize: "15m\u00B2",
    totalRooms: 3,
    currentResidents: 2,
    availableFrom: "Mar 1, 2026",
    matchScore: 78,
    verified: false,
    tags: ["Creative", "Music-friendly"],
    description: "We're a creative bunch - filmmaker and illustrator. Looking for someone who appreciates art and occasional jam sessions.",
    amenities: ["wifi"],
  },
  {
    id: 5,
    title: "Modern WG in Friedrichshain",
    district: "Friedrichshain",
    price: 530,
    roomSize: "20m\u00B2",
    totalRooms: 3,
    currentResidents: 2,
    availableFrom: "Apr 15, 2026",
    matchScore: 81,
    verified: true,
    tags: ["Newly renovated", "Dishwasher"],
    description: "Large room in a freshly renovated apartment. We're social but respectful of personal space and quiet time.",
    amenities: ["wifi", "bike"],
  },
  {
    id: 6,
    title: "Student WG near FU Berlin",
    district: "Dahlem",
    price: 450,
    roomSize: "13m\u00B2",
    totalRooms: 4,
    currentResidents: 3,
    availableFrom: "May 1, 2026",
    matchScore: 75,
    verified: true,
    tags: ["Student-only", "Garden access"],
    description: "All of us study at FU. We share groceries and study together. Garden is perfect for summer BBQs!",
    amenities: ["wifi", "green"],
  },
]

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  bike: Bike,
  green: TreePine,
}

function getMatchColor(score: number): string {
  if (score >= 85) return "bg-accent/15 text-accent"
  if (score >= 70) return "bg-primary/15 text-primary"
  return "bg-muted text-muted-foreground"
}

export function BrowseWGs() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("match")
  const [districtFilter, setDistrictFilter] = useState("all")
  const [favorites, setFavorites] = useState<number[]>([])
  const [selectedListing, setSelectedListing] = useState<WGListing | null>(null)

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    )
  }

  const filteredListings = listings
    .filter((l) => {
      const matchesSearch =
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.district.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDistrict = districtFilter === "all" || l.district === districtFilter
      return matchesSearch && matchesDistrict
    })
    .sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore
      if (sortBy === "price-low") return a.price - b.price
      if (sortBy === "price-high") return b.price - a.price
      return 0
    })

  const districts = [...new Set(listings.map((l) => l.district))]

  return (
    <div className="flex flex-col gap-6">
      {/* Search and filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger className="w-[160px] rounded-xl">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] rounded-xl">
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
          <span className="font-semibold text-foreground">{filteredListings.length}</span> WGs found
        </p>
        <p className="text-xs text-muted-foreground font-body">
          Sorted by {sortBy === "match" ? "compatibility" : sortBy === "price-low" ? "lowest price" : "highest price"}
        </p>
      </div>

      {/* Listings grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredListings.map((listing) => (
          <Card
            key={listing.id}
            className="group cursor-pointer rounded-2xl border-border shadow-sm transition-all hover:shadow-md hover:border-primary/25"
            onClick={() => setSelectedListing(listing)}
          >
            {/* Image placeholder */}
            <div className="relative h-36 rounded-t-2xl bg-muted overflow-hidden">
              <div className="flex h-full w-full items-center justify-center">
                <Home className="h-10 w-10 text-muted-foreground/30" />
              </div>
              {/* Match badge */}
              <Badge
                className={`absolute left-3 top-3 rounded-full border-0 text-xs font-bold px-2.5 py-0.5 ${getMatchColor(listing.matchScore)}`}
              >
                {listing.matchScore}% Match
              </Badge>
              {/* Favorite */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(listing.id)
                }}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm shadow-sm hover:bg-card transition-colors"
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    favorites.includes(listing.id) ? "fill-destructive text-destructive" : "text-muted-foreground"
                  }`}
                />
                <span className="sr-only">
                  {favorites.includes(listing.id) ? "Remove from favorites" : "Add to favorites"}
                </span>
              </button>
              {listing.verified && (
                <div className="absolute bottom-3 left-3">
                  <Badge className="gap-1 rounded-full bg-card/80 backdrop-blur-sm text-accent border-0 text-[10px] font-semibold">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                </div>
              )}
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
                  <Badge key={tag} variant="secondary" className="rounded-full text-[10px] font-medium px-2 py-0">
                    {tag}
                  </Badge>
                ))}
                {listing.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity]
                  return Icon ? (
                    <span key={amenity} className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                    </span>
                  ) : null
                })}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {"\u20AC"}{listing.price}
                    <span className="text-xs font-normal text-muted-foreground">/month</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                  <Calendar className="h-3 w-3" />
                  {listing.availableFrom}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail modal */}
      {selectedListing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedListing(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelectedListing(null)}
        >
          <Card
            className="w-full max-w-lg rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
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
                  <h3 className="text-lg font-bold text-foreground">{selectedListing.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground font-body">
                    <MapPin className="h-3.5 w-3.5" />
                    {selectedListing.district}, Berlin
                  </p>
                </div>
                <p className="text-xl font-bold text-foreground shrink-0">
                  {"\u20AC"}{selectedListing.price}
                  <span className="text-xs font-normal text-muted-foreground">/mo</span>
                </p>
              </div>

              <p className="mt-4 text-sm text-muted-foreground font-body leading-relaxed">
                {selectedListing.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Room Size</p>
                  <p className="font-semibold text-foreground">{selectedListing.roomSize}</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Residents</p>
                  <p className="font-semibold text-foreground">{selectedListing.currentResidents} of {selectedListing.totalRooms}</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="font-semibold text-foreground">{selectedListing.availableFrom}</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Verified</p>
                  <p className="font-semibold text-foreground">{selectedListing.verified ? "Yes" : "No"}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {selectedListing.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full text-xs font-medium">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  Apply Now
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl gap-2 bg-transparent"
                  onClick={() => toggleFavorite(selectedListing.id)}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      favorites.includes(selectedListing.id) ? "fill-destructive text-destructive" : ""
                    }`}
                  />
                  {favorites.includes(selectedListing.id) ? "Saved" : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
