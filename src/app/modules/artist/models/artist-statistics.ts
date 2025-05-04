export interface ArtistStatisticsDTO {
  artistId: number;
  artistName: string;
  profileImage?: string;
  totalFollowers: number;
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  lastUpdateDate?: Date;
  followerGrowthRate?: number;
}
