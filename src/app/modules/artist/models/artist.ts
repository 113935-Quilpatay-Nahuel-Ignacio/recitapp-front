export interface Artist {
  id: number;
  name: string;
  biography?: string;
  profileImage?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  soundcloudUrl?: string;
  instagramUrl?: string;
  bandcampUrl?: string;
  active?: boolean;
  genreIds?: number[];
}

export interface ArtistFollower {
  artistId: number;
  artistName: string;
  artistImage?: string;
  followDate: Date;
}
