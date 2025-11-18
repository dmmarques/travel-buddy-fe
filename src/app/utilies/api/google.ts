"use server";

import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client();

export const autoComplete = async (input: string) => {
  if (!input) return [];

  try {
    const response = await client.placeAutocomplete({
      params: {
        input,
        key: process.env.GOOGLE_API_KEY!,
      },
    });
    return response.data.predictions || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export async function getPlaceDetails(placeId: string) {
  const response = await client.placeDetails({
    params: {
      place_id: placeId,
      key: process.env.GOOGLE_API_KEY!,
    },
  });
  console.log("Place details response:", response.data);
  return response.data.result;
}
