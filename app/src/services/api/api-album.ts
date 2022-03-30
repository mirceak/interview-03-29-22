import { AlbumDto } from 'src/models/album';

export const albumGetListController = async (): Promise<AlbumDto[]> => {
  return fetch('https://jsonplaceholder.typicode.com/albums').then((response) => response.json());
};
