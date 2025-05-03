export interface ArtistFollowing {
  id?: number;
  userId: number;
  artistId: number;
  artistName?: string;
  followDate: Date;
}

export interface VenueFollowing {
  id?: number;
  userId: number;
  venueId: number;
  venueName?: string;
  followDate: Date;
}
