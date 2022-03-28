import { Album } from 'src/models/album';

export interface PhotoDto {
  albumId: number;
  id: number;
  thumbnailUrl: string;
  title: string;
  url: string;
}

export interface Photo extends PhotoDto {
  album?: Album;
}
