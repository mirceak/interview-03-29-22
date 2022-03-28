import { PhotoDto } from 'src/models/photo';
import { BaseStore, ListStore } from 'src/models/store/store';
import serviceApi from 'src/services/service-api';
import { reactive } from 'vue';

interface PhotoStoreState {
  photos?: PhotoDto[];
}

class PhotoStore implements BaseStore<PhotoStoreState> {
  useState = (): PhotoStoreState => {
    return {};
  };

  resetState = (): void => {
    this.state = reactive(this.useState());
  };

  state: PhotoStoreState;

  getList = async (): Promise<PhotoDto[] | undefined> => {
    this.state.photos = await serviceApi.photoGetListController();
    return this.state.photos;
  };

  constructor() {
    this.state = reactive(this.useState());
  }
}

export const usePhotoStore = (): ListStore<PhotoDto, PhotoStoreState> => {
  const { resetState, getList, state } = new PhotoStore();
  return { resetState, getList, state };
};
