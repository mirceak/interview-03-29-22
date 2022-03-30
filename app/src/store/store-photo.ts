import { AlbumDto } from 'src/models/album';
import { Photo, PhotoDto } from 'src/models/photo';
import { BaseStore, ListStore } from 'src/models/store/store';
import serviceApi from 'src/services/service-api';
import { reactive } from 'vue';
import { AlbumStoreState } from './store-album';

export interface PhotoStoreState {
  photos?: Photo[];
}

class PhotoStore implements BaseStore<PhotoStoreState> {
  useState = (): PhotoStoreState => {
    return {};
  };

  resetState = (): void => {
    this.state = reactive(this.useState());
  };

  getList = async (): Promise<PhotoDto[] | undefined> => {
    this.state.photos = await serviceApi.photoGetListController().then((photoList) => {
      return photoList.map((photo): Photo => {
        return {
          ...photo,
        };
      });
    });
    this.state.photos.forEach((photo) => {
      if (this.albumStore && this.albumStore.state.albums) {
        this.albumStore.state.albums[photo.albumId - 1].photos.push(photo);
      }
    });
    return this.state.photos;
  };

  state: PhotoStoreState;
  albumStore: ListStore<AlbumDto, AlbumStoreState> | undefined;

  constructor() {
    this.state = reactive(this.useState());
  }
}

export const usePhotoStore = (
  albumStore: ListStore<AlbumDto, AlbumStoreState>
): ListStore<PhotoDto, PhotoStoreState> => {
  const photoStore = new PhotoStore();
  const { resetState, getList, state } = photoStore;

  photoStore.albumStore = albumStore;

  return { resetState, getList, state };
};
