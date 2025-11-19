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

export async function getAISuggestions(location: string, numberOfDays: number) {
  console.log("Fetching AI suggestions", location, numberOfDays);
  const res = await axios.get(`${BASE_URL}/travelSuggestions`, {
    params: { location, numberOfDays },
  });
  console.log("AI suggestions response:", res.data);
  return res.data;
}
