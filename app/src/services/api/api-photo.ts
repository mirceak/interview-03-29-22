import { PhotoDto } from 'src/models/photo';

export const photoGetListController = async (): Promise<PhotoDto[]> => {
  return fetch('https://jsonplaceholder.typicode.com/photos').then((response) => response.json());
};
