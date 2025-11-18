import { GenTravelCost } from "./GenTravelCost";

export type Travel = {
  id?: string;
  name?: string;
  transport: string;
  fromLat: string;
  fromLng: string;
  departureDate: Date;
  toLat: string;
  toLng: string;
  arrivalDate: Date;
  estimatedDuration?: string;
  distance: string;
  estimatedCost?: string;
  genTravelCost: GenTravelCost;
};
