import { MusicGenreDTO } from './music-genre';

export interface ArtistDetailDTO {
  id: number;
  name: string;
  biography?: string;
  profileImage?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  soundcloudUrl?: string;
  instagramUrl?: string;
  bandcampUrl?: string;
  registrationDate?: Date;
  updatedAt?: Date;
  active: boolean;
  genres: MusicGenreDTO[];
  followerCount: number;
  upcomingEventsCount: number;
  pastEventsCount: number;
}
