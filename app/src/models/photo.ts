export interface PhotoDto {
  albumId: number;
  id: number;
  thumbnailUrl: string;
  title: string;
  url: string;
}

export type Photo = PhotoDto;
