import { AlbumDto } from 'src/models/album';
import { BaseStore, ListStore } from 'src/models/store/store';
import serviceApi from 'src/services/service-api';
import { ref, reactive } from 'vue';

interface AlbumStoreState {
  readonly albums?: AlbumDto[];
}

class AlbumStore implements BaseStore<AlbumStoreState, AlbumDto> {
  useState = (): AlbumStoreState => {
    return {};
  };

  resetState = (): void => {
    this.state.value = reactive(this.useState());
  };

  state = ref();

  getList = async (): Promise<AlbumDto[]> => {
    this.state.value.albums = await serviceApi.albumGetListController();
    return this.state.value.albums;
  };

  constructor() {
    this.resetState();
  }
}

export const useAlbumStore = (): ListStore<AlbumDto, AlbumStoreState> => {
  const { resetState, getList, state } = new AlbumStore();
  return { resetState, getList, state };
};
