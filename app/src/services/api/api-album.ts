export const albumGetListController = async () => {
  return fetch('https://jsonplaceholder.typicode.com/albums').then((response) => response.json());
};
