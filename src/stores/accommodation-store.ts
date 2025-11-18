import { Accommodation } from "@/app/(bo)/trips/types/accommodation";
import { create } from "zustand";

interface AccommodationStore {
  accommodations: Accommodation[];
  setAccommodations: (accommodations: Accommodation[]) => void;
}

export const useAccommodationStore = create<AccommodationStore>((set) => ({
  accommodations: [],
  setAccommodations: (accommodations) => set({ accommodations }),
}));
