/**
 * Doctor Search Page
 * 
 * Allows patients to search and filter doctors by:
 * - Location
 * - Specialty/Department
 * - Availability
 * - Name
 * 
 * @module app/patient/search/page
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Filter,
  X,
  Stethoscope
} from "lucide-react";
import { doctors, DEPARTMENTS, LOCATIONS } from "@/lib/data";
import { Doctor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Doctor Card Component
 */
function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Link
      href={`/patient/doctors/${doctor.id}`}
      className="bg-card rounded-xl p-4 hover:shadow-lg transition-shadow border border-border"
    >
      <div className="flex gap-4">
        {/* Doctor Avatar */}
        <div className="w-20 h-20 rounded-xl bg-accent overflow-hidden flex-shrink-0">
          {doctor.avatar ? (
            <img 
              src={doctor.avatar} 
              alt={doctor.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Stethoscope size={32} />
            </div>
          )}
        </div>

        {/* Doctor Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{doctor.name}</h3>
          <p className="text-sm text-primary">{doctor.specialty}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-foreground">{doctor.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({doctor.reviewCount} reviews)
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <MapPin size={14} />
            <span className="truncate">{doctor.location}</span>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
          {doctor.experience} years exp.
        </span>
        <span className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
          ${doctor.consultationFee} consultation
        </span>
        {doctor.isAvailableToday && (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            Available Today
          </span>
        )}
      </div>
    </Link>
  );
}

/**
 * Search Content Component (uses useSearchParams)
 */
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get("specialty") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(doctors);

  // Apply filters
  useEffect(() => {
    let filtered = [...doctors];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        d => d.name.toLowerCase().includes(query) || 
             d.specialty.toLowerCase().includes(query)
      );
    }

    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter(d => d.location === selectedLocation);
    }

    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter(d => d.specialty === selectedSpecialty);
    }

    setFilteredDoctors(filtered);
  }, [searchQuery, selectedLocation, selectedSpecialty]);

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("");
    setSelectedSpecialty("");
    router.push("/patient/search");
  };

  const hasActiveFilters = searchQuery || selectedLocation || selectedSpecialty;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder="Search by doctor name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Toggle (Mobile) */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden"
        >
          <Filter size={18} className="mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${showFilters ? "block" : "hidden sm:grid"}`}>
        {/* Location Filter */}
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground"
          aria-label="Filter by location"
        >
          <option value="">All Locations</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        {/* Specialty Filter */}
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground"
          aria-label="Filter by specialty"
        >
          <option value="">All Specialties</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="justify-start">
            <X size={18} className="mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Results Grid */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No doctors found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or filters.
          </p>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </div>
      )}
    </div>
  );
}

/**
 * Doctor Search Page Component
 */
export default function DoctorSearchPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Find a Doctor</h1>
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
