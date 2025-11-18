import { autoComplete, getPlaceDetails } from "@/app/utilies/api/google";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js/dist/places/autocomplete";
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
};

export default function Predictions({ onPick }: PredictionsProps) {
  const [predictions, setPredictions] = useState<PlaceAutocompleteResult[]>([]);
  const [input, setInput] = useState("");

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
                        if (onPick) {
                          let details = {};
                          if (prediction.place_id) {
                            try {
                              details = await getPlaceDetails(
                                prediction.place_id
                              );
                            } catch {}
                          }
                          onPick({ ...prediction, ...details });
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
        </div>
      </Command>
    </div>
  );
}
