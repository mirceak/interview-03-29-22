import { Photo } from 'src/models/photo';

export interface AlbumDto {
  id: number;
  title: string;
  userId: string;
}

export interface Album extends AlbumDto {
  photos: Photo[];
  expanded: boolean;
}
