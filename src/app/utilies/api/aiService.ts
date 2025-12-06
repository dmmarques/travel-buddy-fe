import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_AI_BASE_URL ||
  "https://ai-travel-buddy-production.up.railway.app/travel-buddy/ai";

export async function getAIEstimatedTravelCost(
  fromLocation: string,
  toLocation: string
) {
  console.log("Fetching AI estimated travel cost", fromLocation, toLocation);
  const res = await axios.get(`${BASE_URL}/travelCostSuggestions`, {
    params: { fromLocation, toLocation },
  });
  return res.data;
}

export async function getAISuggestions(
  arrivalDate: Date,
  location: string,
  numberOfDays: number,
  tripStartDate: Date,
  preferences?: string
) {
  console.log(
    "Fetching AI suggestions",
    tripStartDate,
    location,
    numberOfDays,
    preferences
  );
  const res = await axios.get(`${BASE_URL}/travelSuggestions`, {
    params: { arrivalDate, tripStartDate, location, numberOfDays, preferences },
  });
  console.log("AI suggestions response:", res.data);
  return res.data;
}
