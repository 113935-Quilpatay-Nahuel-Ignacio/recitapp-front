export interface Venue {
  id: number;
  name: string;
  address: string;
  googleMapsUrl?: string;
  totalCapacity?: number;
  description?: string;
  instagramUrl?: string;
  webUrl?: string;
  image?: string;
  registrationDate?: Date;
}

export interface VenueFollower {
  venueId: number;
  venueName: string;
  venueAddress: string;
  venueImage?: string;
  followDate: Date;
}
