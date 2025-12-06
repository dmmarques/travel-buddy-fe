import { Accommodation } from "./accommodation";
import { Activity } from "./activity";

export type Trip = {
  id?: string | number;
  tripId?: string | number;
  description?: string;
  name: string;
  destination?: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
  budget?: number;
  spent?: number;
  creatorUsername?: string;
  participantUsernames?: string[];
  preferences?: string[];
  accommodations?: Accommodation[];
  activityList?: Activity[];
  travelList?: import("./travel").Travel[];
  username?: string;
  babies?: number;
  pets?: number;
};
