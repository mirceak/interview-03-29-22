import { Album, AlbumDto } from 'src/models/album';
import { BaseStore, ListStore } from 'src/models/store/store';
import { albumGetListController } from 'src/services';
import { reactive } from 'vue';

export interface AlbumStoreState {
  albums?: Album[];
}

class AlbumStore implements BaseStore<AlbumStoreState> {
  useState = (): AlbumStoreState => {
    return {};
  };

  resetState = (): void => {
    this.state = reactive(this.useState());
  };

  state: AlbumStoreState;

  getList = async (): Promise<AlbumDto[] | undefined> => {
    this.state.albums = await albumGetListController().then((albumList) => {
      return albumList.map((album): Album => {
        return {
          photos: [],
          expanded: false,
          selected: false,
          ...album,
        };
      });
    });
    return this.state.albums;
  };

  constructor() {
    this.state = reactive(this.useState());
  }
}

export const useAlbumStore = (): ListStore<AlbumDto, AlbumStoreState> => {
  const { resetState, getList, state } = new AlbumStore();
  return { resetState, getList, state };
};
