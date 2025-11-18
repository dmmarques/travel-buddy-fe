export type Accommodation = {
  id?: string;
  name: string;
  googlePlaceId: string;
  googleRating?: number;
  googleReviewsNumber?: number;
  address: string;
  internationalPhoneNumber?: string;
  latitude: string;
  longitude: string;
  isAccessible?: boolean;
  checkInDate: string; // ISO date string
  checkOutDate: string; // ISO date string
  priceForAdult?: number;
  priceForChild?: number;
  allowsPets?: boolean;
  priceForPet?: number;
};
