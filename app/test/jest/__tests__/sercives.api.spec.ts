import { describe, beforeAll, afterAll, jest, it, expect } from '@jest/globals';

import { photoGetListController, albumGetListController } from 'src/services'; // import the default export from index.js

describe('photoGetListController', () => {
  const unmockedFetch = global.fetch;

  beforeAll(() => {
    global.fetch = () =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      }) as Promise<Response>;
  });

  afterAll(() => {
    global.fetch = unmockedFetch;
  });

  it('gets album list', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() => Promise.resolve({ json: () => Promise.resolve([]) } as Response));

    const json = await albumGetListController();
    expect(fetchMock).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/albums');

    expect(Array.isArray(json)).toEqual(true);
    expect(json.length).toEqual(0);
  });

  it('gets photo list', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() => Promise.resolve({ json: () => Promise.resolve([]) } as Response));

    const json = await photoGetListController();
    expect(fetchMock).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/photos');

    expect(Array.isArray(json)).toEqual(true);
    expect(json.length).toEqual(0);
  });
});
