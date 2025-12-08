"use client";
import { useState, useEffect } from "react";
import { useAccommodationStore } from "@/stores/accommodation-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AccommodationForm } from "./AccommodationForm";
import { DataTable } from "./table/data-table";
import { columns as baseColumns } from "./table/columns";
import Predictions from "./Predictions";
import { Trip } from "@/app/(bo)/trips/types/trip";
import { Accommodation } from "@/app/(bo)/trips/types/accommodation";
import {
  deleteAccommodation,
  updateAccommodation,
} from "@/app/utilies/api/activities";
import { CloudSunRain } from "lucide-react";

interface AccommodationCardProps {
  trip: Trip;
  onAccommodationAdded?: (accommodation: Accommodation) => void;
  onAccommodationPicking?: (accommodation: Accommodation | null) => void;
  destinationCoords?: { lat: number; lng: number };
}

export default function AccommodationCard({
  trip,
  onAccommodationAdded,
  onAccommodationPicking,
  destinationCoords,
}: AccommodationCardProps) {
  const [showPredictions, setShowPredictions] = useState(false);

  // Use accommodations from global store
  const { accommodations, setAccommodations } = useAccommodationStore();
  // Sync global accommodations state with trip prop on mount/prop change
  useEffect(() => {
    setAccommodations(trip.accommodations || []);
  }, [trip.accommodations, setAccommodations]);
  // Handler to delete accommodation
  async function handleDeleteAccommodation(accommodation: Accommodation) {
    if (!trip.id || !accommodation.id) {
      toast.error("Missing trip or accommodation id");
      return;
    }
    try {
      await deleteAccommodation(trip.id, accommodation.id);
      setAccommodations(
        accommodations.filter((a) => a.id !== accommodation.id)
      );
      toast.success("Accommodation deleted!");
    } catch (error) {
      console.error("Delete accommodation error", error);
      toast.error("Failed to delete accommodation. Please try again.");
    }
  }
  // State for selected accommodation (for editing/viewing)
  const [selectedAccommodation, setSelectedAccommodation] =
    useState<Accommodation | null>(null);

  async function onSubmit(values: Accommodation) {
    try {
      setSelectedAccommodation(null);
      if (values.id) {
        // Update existing accommodation
        if (!trip.id) throw new Error("Trip ID is missing");
        await updateAccommodation(trip.id, values);
        setAccommodations(
          accommodations.map((a) => (a.id === values.id ? values : a))
        );
        toast.success("Accommodation updated!");
      } else {
        // Add new accommodation
        if (typeof onAccommodationAdded === "function") {
          await onAccommodationAdded(values);
        }
        toast.success("Accommodation saved!");
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to save the accommodation. Please try again.");
    }
  }

  // Check if there are accommodations
  const hasAccommodation = accommodations.length > 0;

  // Handler for picking a place from predictions
  // Type for Google Places prediction or place object
  type PlacePrediction = {
    structured_formatting?: {
      main_text?: string;
      secondary_text?: string;
    };
    name?: string;
    address?: string;
    formatted_address?: string;
    place_id?: string;
    googlePlaceId?: string;
    rating?: number;
    user_ratings_total?: number;
    wheelchair_accessible_entrance?: boolean;
    international_phone_number?: string;
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
  };

  function handlePickPlace(place: unknown) {
    const p = place as PlacePrediction;
    // Compose accommodation object from picked place
    function toIsoDateTime(dateStr?: string) {
      if (!dateStr) return new Date().toISOString();
      if (dateStr.includes("T")) return dateStr;
      return dateStr + "T00:00:00";
    }
    const acc: Accommodation = {
      id: "",
      name: p.structured_formatting?.main_text || p.name || "",
      address:
        p.structured_formatting?.secondary_text ||
        p.address ||
        p.formatted_address ||
        "",
      googlePlaceId: p.place_id || p.googlePlaceId || "",
      googleRating: p.rating || undefined,
      googleReviewsNumber: p.user_ratings_total || undefined,
      isAccessible: p.wheelchair_accessible_entrance || false,
      internationalPhoneNumber: p.international_phone_number || "",
      latitude: p.geometry?.location?.lat?.toString() || "",
      longitude: p.geometry?.location?.lng?.toString() || "",
      checkInDate: toIsoDateTime(trip.startDate),
      checkOutDate: toIsoDateTime(trip.endDate),
    };
    setSelectedAccommodation(acc);
    setShowPredictions(false);
    if (onAccommodationPicking) {
      onAccommodationPicking(acc);
    }
  }

  // Notify parent when user is searching or cancels
  function handleShowPredictions(val: boolean) {
    setShowPredictions(val);
    setSelectedAccommodation(null);
    if (onAccommodationPicking) {
      onAccommodationPicking(null);
    }
  }

  return (
    <div className="flex w-full h-full rounded-xl flex-col gap-8 items-center justify-center border border-gray-300relative">
      {/* No accommodations and not picking: show empty state */}
      {!hasAccommodation && !showPredictions && !selectedAccommodation && (
        <div className="absolute flex flex-col items-center justify-center z-10 bg-white/80">
          <CloudSunRain className="mb-4 text-gray-300" size={256} />
          <div className="text-gray-400 text-center mb-2">
            You are not planning sleeping out there, are you ?
          </div>
          <Button onClick={() => handleShowPredictions(true)} className="mb-2">
            Add staying
          </Button>
        </div>
      )}

      {/* Show predictions picker */}
      {showPredictions && !selectedAccommodation && (
        <div className="flex flex-col items-center justify-center z-20 bg-white/90">
          <Predictions
            onPick={handlePickPlace}
            destinationCoords={destinationCoords}
          />
          <Button
            variant="outline"
            onClick={() => handleShowPredictions(false)}
            className="mt-2"
          >
            Go back
          </Button>
        </div>
      )}

      {/* Show table if there are accommodations and not picking or editing */}
      {hasAccommodation && !showPredictions && !selectedAccommodation && (
        <div className="w-full h-full p-2 bg-white border rounded text-sm">
          <div className="container mx-auto h-full flex flex-col justify-between py-10">
            <div className="flex w-full items-center justify-between mb-2">
              <div />
              <Button
                className="min-w-fit max-w-[25%] px-2 py-2 text-white hover:bg-green-700 transition text-sm self-end"
                onClick={() => handleShowPredictions(true)}
              >
                Add
              </Button>
            </div>
            <div className="flex-grow">
              <DataTable
                columns={baseColumns({
                  onDelete: handleDeleteAccommodation,
                  onEdit: (acc: Accommodation) => setSelectedAccommodation(acc),
                })}
                data={accommodations}
                // Row click handler: select accommodation for editing
                onRowClick={(row: Accommodation) =>
                  setSelectedAccommodation(row)
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Show form when picking or editing */}
      {selectedAccommodation && !showPredictions && (
        <div className="w-full max-w-xl">
          <Button
            variant="outline"
            onClick={() => setSelectedAccommodation(null)}
            className="mb-2"
          >
            Back to list
          </Button>
          <AccommodationForm
            accommodation={selectedAccommodation}
            onSubmit={onSubmit}
          />
        </div>
      )}
    </div>
  );
}
