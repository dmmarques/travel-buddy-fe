import React, { useState } from "react";
import {
  parseDistance,
  parseDuration,
  formatDistance,
  formatDuration,
} from "../../../../../utilies/travelCardHelpers";
import type { Travel } from "@/app/(bo)/trips/types/travel";
import TravelOverlay from "./TravelOverlay";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";
import { deleteTravelFromTrip } from "../../../../../utilies/api/activities";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InfoIcon, ReceiptEuro, BrainCircuit } from "lucide-react";
import { LuFuel } from "react-icons/lu";
import { FaRoad } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
// Removed Dialog import; using custom overlay instead

interface TravelCardProps {
  onAddTravel?: (travel: Travel) => void;
  estimatedDuration?: string;
  estimatedDistance?: string;
  onFromPick?: (coords: { lat: number; lng: number }) => void;
  onToPick?: (coords: { lat: number; lng: number }) => void;
  formEstimatedDistance?: string;
  formEstimatedDuration?: string;
  fromCoords?: { lat: number; lng: number };
  toCoords?: { lat: number; lng: number };
  tripId?: string | number;
  onTravelAdded?: (travel: Travel) => void;
  onTravelEdited?: (travel: Travel) => void;
  onTravelDeleted?: () => void;
  travels?: Travel[];
}

export default function TravelCard({
  onFromPick,
  onToPick,
  formEstimatedDistance,
  formEstimatedDuration,
  fromCoords,
  toCoords,
  tripId,
  onTravelAdded,
  onTravelEdited,
  onTravelDeleted,
  travels,
}: TravelCardProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [editTravel, setEditTravel] = useState<Travel | null>(null);

  // State for delete confirmation
  const [deleteTravel, setDeleteTravel] = useState<Travel | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Log travels for debugging
  React.useEffect(() => {
    console.log("TravelCard travels:", travels);
  }, [travels]);

  const handleButtonClick = () => {
    setEditTravel(null);
    setShowOverlay(true);
  };

  const handleEditTravel = (travel: Travel) => {
    setEditTravel(travel);
    setShowOverlay(true);
  };

  // Handler for delete click in table
  const handleDeleteTravel = (travel: Travel) => {
    setDeleteTravel(travel);
    setShowDeleteDialog(true);
  };

  const handleCloseOverlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOverlay(false);
    setEditTravel(null);
  };

  // Placeholder for confirming delete
  const handleConfirmDelete = async () => {
    if (!deleteTravel || tripId === undefined || tripId === null) {
      setShowDeleteDialog(false);
      setDeleteTravel(null);
      return;
    }
    try {
      if (!deleteTravel.name) throw new Error("Missing travel name");
      await deleteTravelFromTrip(String(tripId), deleteTravel.name);
      // Optionally show a toast here
      if (onTravelDeleted) onTravelDeleted(); // Refresh trip from backend
    } catch (err) {
      // Optionally handle error (show toast)
      console.error("Failed to delete travel entry", err);
    }
    setShowDeleteDialog(false);
    setDeleteTravel(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteTravel(null);
  };

  const handleTravelEdited = (updatedTravel: Travel) => {
    setShowOverlay(false);
    setEditTravel(null);
    if (typeof onTravelEdited === "function") {
      onTravelEdited(updatedTravel);
    }
  };

  // Calculate totals
  let totalDistance = 0;
  let totalDuration = 0;
  let totalCost = 0;
  if (travels && travels.length > 0) {
    for (const t of travels) {
      totalDistance +=
        typeof t.distance === "string"
          ? parseDistance(t.distance)
          : t.distance || 0;
      totalDuration +=
        typeof t.estimatedDuration === "string"
          ? parseDuration(t.estimatedDuration)
          : t.estimatedDuration || 0;
      totalCost +=
        typeof t.estimatedCost === "string"
          ? parseFloat(t.estimatedCost)
          : t.estimatedCost || 0;
    }
  }

  return (
    <div className="flex w-full h-full rounded-xl flex-col gap-8 items-center justify-centerborder border-gray-300 bg-gray-50 relative">
      {travels && travels.length > 0 ? (
        <div className="w-full h-full p-2 bg-white border rounded text-sm">
          <div className="container mx-auto h-full flex flex-col justify-between py-10">
            <div className="flex w-full items-center justify-between mb-2">
              <div />
              <Button
                className="min-w-fit max-w-[25%] px-2 py-2 text-white hover:bg-green-700 transition text-sm self-end"
                onClick={handleButtonClick}
              >
                Add
              </Button>
            </div>
            <div className="flex-grow">
              <DataTable
                columns={columns(handleEditTravel, handleDeleteTravel)}
                data={travels}
              />
            </div>
            <div className="flex gap-4 mt-4 mb-2">
              <Card className="flex-1 p-2 ">
                Total Distance
                <br />
                <span className="font-bold text-base">
                  {formatDistance(totalDistance)}
                </span>
              </Card>
              <Card className="flex-1 p-2">
                Total Time
                <br />
                <span className="font-bold text-base">
                  {formatDuration(totalDuration)}
                </span>
              </Card>
              <Card className="flex-1 p-2 ">
                <div className="flex items-center justify-center gap-2">
                  <span>Estimated Total Cost</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        tabIndex={0}
                        aria-label="Show cost breakdown"
                      >
                        <InfoIcon className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-3 text-xs">
                      <div className="font-semibold mb-3 text-center">Cost</div>
                      {travels &&
                      travels.length > 0 &&
                      travels.some((t) => t.genTravelCost) ? (
                        (() => {
                          let fuel = 0,
                            toll = 0,
                            total = 0;
                          travels.forEach((t) => {
                            if (t.genTravelCost) {
                              fuel += t.genTravelCost.fuel || 0;
                              toll += t.genTravelCost.tollCost || 0;
                              total += t.genTravelCost.totalCost || 0;
                            }
                          });
                          return (
                            <div className="relative grid grid-cols-5 gap-0 text-center items-stretch">
                              {/* Top row: Fuel and Toll */}
                              <div className="col-span-2 flex flex-col items-center justify-center">
                                <span className="flex items-center gap-1">
                                  <LuFuel className="w-4 h-4 text-black dark:text-white" />
                                  <span className="font-medium whitespace-nowrap">
                                    {fuel} €
                                  </span>
                                </span>
                              </div>
                              <div></div>
                              <div className="col-span-2 flex flex-col items-center justify-center">
                                <span className="flex items-center gap-1">
                                  <FaRoad className="w-4 h-4 text-black dark:text-white" />
                                  <span className="font-medium whitespace-nowrap">
                                    {toll} €
                                  </span>
                                </span>
                              </div>
                              {/* Middle row: Equal sign */}
                              <Separator
                                orientation="horizontal"
                                className="col-span-5 my-2"
                              />
                              {/* Bottom row: Total */}
                              <div className="col-span-5 flex flex-col items-center justify-center mt-1">
                                <span className="flex items-center gap-1">
                                  <ReceiptEuro className="w-4 h-4 text-black dark:text-white" />
                                  <span className="font-medium whitespace-nowrap">
                                    {total} €
                                  </span>
                                </span>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <span>No breakdown available.</span>
                      )}
                    </PopoverContent>
                  </Popover>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <BrainCircuit className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-40">
                      <div className="flex justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm">Calculated by AI.</p>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <span className="font-bold text-base">
                  {totalCost.toLocaleString(undefined, {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-gray-500 mb-4 w-full h-full">
          <span className="mb-4">No travel information added yet.</span>
          <Button
            className="px-4 py-2 text-white rounded hover:bg-green-700 transition"
            onClick={handleButtonClick}
          >
            Add Travel
          </Button>
        </div>
      )}

      {showOverlay && (
        <TravelOverlay
          onClose={handleCloseOverlay}
          onFromPick={onFromPick}
          onToPick={onToPick}
          estimatedDistance={formEstimatedDistance}
          estimatedDuration={formEstimatedDuration}
          fromCoords={fromCoords}
          toCoords={toCoords}
          tripId={tripId}
          onTravelAdded={editTravel ? undefined : onTravelAdded}
          travel={editTravel || undefined}
          onTravelEdited={editTravel ? handleTravelEdited : undefined}
        />
      )}

      {/* Delete confirmation overlay (only over the card) */}
      {showDeleteDialog && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90%]">
            <div className="font-semibold text-lg mb-2">Confirm Delete</div>
            <div className="py-2">
              Are you sure you want to delete this travel entry?
              <div className="mt-2 text-gray-500 text-sm">
                {deleteTravel?.name ? `Name: ${deleteTravel.name}` : null}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
