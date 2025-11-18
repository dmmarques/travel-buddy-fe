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
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    if (!input) {
      setPredictions([]);
      return;
    }
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
          value={selected || input}
          onValueChange={(val) => {
            setInput(val);
            setSelected("");
          }}
        />
        {/* Reserve space for predictions so input doesn't move */}
        <div style={{ minHeight: "160px", position: "relative" }}>
          {predictions.length > 0 && (
            <div className="absolute left-0 right-0 z-10 bg-white border border-gray-200 rounded shadow-md mt-1">
              <CommandList>
                <CommandGroup>
                  {predictions.map((prediction) => {
                    const main =
                      prediction.structured_formatting?.main_text ||
                      prediction.description ||
                      "";
                    const secondary =
                      prediction.structured_formatting?.secondary_text || "";
                    const value = secondary ? `${main}, ${secondary}` : main;
                    return (
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
                          setSelected(value);
                          setPredictions([]);
                        }}
                      >
                        {value}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </div>
          )}
        </div>
      </Command>
    </div>
  );
}
