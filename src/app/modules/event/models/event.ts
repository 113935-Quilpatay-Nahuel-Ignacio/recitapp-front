export interface EventDTO {
  id: number;
  name: string;
  description?: string;
  startDateTime: string | Date;
  endDateTime?: string | Date;
  venueId: number;
  venueName: string;
  mainArtistId?: number;
  mainArtistName?: string;
  statusName: string;
  flyerImage?: string;
}
