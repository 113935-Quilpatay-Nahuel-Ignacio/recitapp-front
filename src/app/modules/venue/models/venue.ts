export interface Venue {
  id?: number;
  name: string;
  address: string;
  googleMapsUrl?: string;
  totalCapacity?: number;
  description?: string;
  instagramUrl?: string;
  webUrl?: string;
  image?: string;
  active?: boolean;
  registrationDate?: Date;
  updatedAt?: Date;
  latitude?: number;
  longitude?: number;
  sections?: VenueSection[];
}

export interface VenueSection {
  id?: number;
  name: string;
  capacity: number;
  description?: string;
  active?: boolean;
  venueId?: number;
}

export interface VenueAvailability {
  venueId: number;
  venueName: string;
  isAvailable: boolean;
  startDateTime: Date;
  endDateTime: Date;
  conflictingEvents?: EventConflict[];
}

export interface EventConflict {
  eventId: number;
  eventName: string;
  startDateTime: Date;
  endDateTime: Date;
}

export interface VenueStatistics {
  venueId: number;
  venueName: string;
  totalEvents: number;
  upcomingEvents?: number;
  pastEvents?: number;
  occupancyRate?: number;
  lastUpdateDate?: Date;
}

export interface VenueFollower {
  venueId: number;
  venueName: string;
  venueAddress: string;
  venueImage?: string;
  followDate: Date;
}
