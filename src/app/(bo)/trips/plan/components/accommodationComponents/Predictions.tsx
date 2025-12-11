import { autoComplete, getPlaceDetails } from "@/app/utilies/api/google";
import { toast } from "sonner";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js/dist/places/autocomplete";
import { Place } from "@googlemaps/google-maps-services-js/dist/common";
import { useEffect, useState } from "react";

type PlacePrediction = PlaceAutocompleteResult & {
  formatted_address?: string;
  description?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
};

type PredictionsProps = {
  onPick?: (place: PlacePrediction) => void;
  destinationCoords?: { lat: number; lng: number };
};

export default function Predictions({
  onPick,
  destinationCoords,
}: PredictionsProps) {
  const [predictions, setPredictions] = useState<PlaceAutocompleteResult[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      const predictions = await autoComplete(input);
      setPredictions(predictions ?? []);
    };
    fetchPredictions();
  }, [input]);

  return (
    <div className="w-full max-w-md relative">
      <Command>
        <CommandInput
          placeholder="Type where you are staying..."
          value={input}
          onValueChange={setInput}
        />
        {/* Reserve space for predictions so input doesn't move */}
        <div style={{ minHeight: "160px", position: "relative" }}>
          {predictions.length > 0 && (
            <div className="absolute left-0 right-0 z-10 bg-white border border-gray-200 rounded shadow-md mt-1">
              <CommandList>
                <CommandGroup>
                  {predictions.map((prediction) => (
                    <CommandItem
                      key={prediction.place_id}
                      onSelect={async () => {
                        setError(null);
                        setDebug(null);
                        let details: Place = {};
                        if (prediction.place_id) {
                          try {
                            details = await getPlaceDetails(
                              prediction.place_id
                            );
                          } catch {}
                        }
                        const picked = { ...prediction, ...details };
                        // Debug: show coordinates used
                        let debugMsg = "";
                        const accLocation = details.geometry?.location;
                        setDebug(debugMsg);
                        // If destinationCoords is provided, check distance
                        if (accLocation && destinationCoords) {
                          const toLat = destinationCoords.lat;
                          const toLng = destinationCoords.lng;
                          if (isNaN(toLat) || isNaN(toLng)) {
                            setError(
                              "Destination coordinates are invalid. Please check your trip setup."
                            );
                            return;
                          }
                          const toRad = (v: number) => (v * Math.PI) / 180;
                          const R = 6371; // Earth radius in km
                          const dLat = toRad(accLocation.lat - toLat);
                          const dLng = toRad(accLocation.lng - toLng);
                          const a =
                            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                            Math.cos(toRad(toLat)) *
                              Math.cos(toRad(accLocation.lat)) *
                              Math.sin(dLng / 2) *
                              Math.sin(dLng / 2);
                          const c =
                            2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                          const distance = R * c;
                          debugMsg += `\nDistance: ${distance.toFixed(2)} km`;
                          setDebug(debugMsg);
                          if (distance > 50) {
                            toast.error(
                              "Selected accommodation is too far from your destination (over 50km). Please pick a closer place."
                            );
                            setError(
                              "Selected accommodation is too far from your destination (over 50km). Please pick a closer place."
                            );
                            return;
                          }
                        }
                        if (onPick) {
                          onPick(picked);
                        }
                        // Close predictions by clearing input and predictions
                        setInput("");
                        setPredictions([]);
                      }}
                    >
                      {(prediction.structured_formatting?.main_text ||
                        "No main text") +
                        (prediction.structured_formatting?.secondary_text !==
                        undefined
                          ? " - " +
                            prediction.structured_formatting?.secondary_text
                          : "")}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </div>
          )}
          {error && (
            <div className="text-red-600 text-center mt-2">{error}</div>
          )}
          {debug && (
            <div className="text-xs text-gray-500 text-center mt-2 whitespace-pre">
              {debug}
            </div>
          )}
        </div>
      </Command>
    </div>
  );
}
