import { PhotoDto } from 'src/models/photo';
import { BaseStore, ListStore } from 'src/models/store/store';
import serviceApi from 'src/services/service-api';
import { ref, reactive } from 'vue';

interface PhotoStoreState {
  readonly photos?: PhotoDto[];
}

class PhotoStore implements BaseStore<PhotoStoreState, PhotoDto> {
  useState = (): PhotoStoreState => {
    return {};
  };

  resetState = (): void => {
    this.state.value = reactive(this.useState());
  };

  state = ref();

  getList = async (): Promise<PhotoDto[]> => {
    this.state.value.photos = await serviceApi.photoGetListController();
    return this.state.value.photos;
  };

  constructor() {
    this.resetState();
  }
}

export const usePhotoStore = (): ListStore<PhotoDto, PhotoStoreState> => {
  const { resetState, getList, state } = new PhotoStore();
  return { resetState, getList, state };
};
