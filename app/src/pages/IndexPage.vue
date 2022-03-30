<template>
  <div class="kanban-board">
    <SlickList
      v-model:list="albumList"
      :axis="'y'"
      :lock-axis="'y'"
      class="column-container"
      use-drag-handle
      useWindowAsScrollContainer
    >
      <SlickItem v-for="(album, i) in albumList" :key="album.id" :index="i" class="kanban-column">
        <header @click="onAlbumHeaderClick(album)">
          <drag-handle @mousedown.prevent="onDragAlbumStart(album)" @touchstart.prevent="onDragAlbumStart(album)" />
          <q-separator vertical :size="'2px'" class="q-mr-sm" />
          <q-icon :name="album.expanded ? 'expand_less' : 'expand_more'" class="q-pr-xs" />
          <q-checkbox class="no-pointer-events" v-bind:model-value="album.selected" />
          <small v-if="album.selected" class="q-mr-sm">Selected</small>
          <q-separator vertical :size="'2px'" class="q-mr-sm" />
          <small class="ellipsis q-mr-sm">
            <span>Nr. Photos:</span>
            <span>{{ album.photos.length }}</span>
          </small>
          <q-separator vertical :size="'2px'" class="q-mr-sm" />
          <small class="ellipsis q-mr-sm">
            <span>Title:</span>
            <span>{{ album.title }}</span>
            <q-tooltip anchor="top middle" self="bottom middle">
              <strong>Title: {{ album.title }}</strong>
            </q-tooltip>
          </small>
        </header>
        <SlickList
          v-model:list="album.photos"
          axis="y"
          :group="'photos'"
          class="kanban-list"
          helper-class="kanban-helper"
          useWindowAsScrollContainer
        >
          <SlickItem
            v-show="album.expanded"
            v-for="(photo, j) in album.photos"
            :key="photo.id"
            :index="j"
            class="kanban-list-item"
          >
            <div class="kanban-list-item-inner">
              <small class="ellipsis q-mr-sm full-width">
                <span class="ellipsis">
                  <b>Title:</b>
                  {{ photo.title }}
                </span>
              </small>
            </div>
          </SlickItem>
        </SlickList>
      </SlickItem>
    </SlickList>

    <q-file ref="qFileRef" v-show="false" v-model="file" label="Pick one file" filled style="max-width: 300px"></q-file>
  </div>
</template>

<script lang="ts">
export default {
  name: 'IndexPage',
};
</script>

<script lang="ts" setup>
import { Album } from 'src/models/album';

import { useAlbumStore } from 'src/store/store-album';
import { usePhotoStore } from 'src/store/store-photo';

import { nextTick, inject, Ref, ref, watch } from 'vue';

import { SlickList, SlickItem } from 'src/npm_overrides/slicksort/slicksort';
import DragHandle from 'src/components/drag-handle.vue';
import { QFile } from 'quasar';

const albumStore = useAlbumStore();
const photoStore = usePhotoStore(albumStore);

const albumList = ref<Album[]>([]);
const selectedAlbum = ref<Album | null>();
const qFileRef = ref<QFile>();
const file = ref();

const onMainLayoutAddGroupButtonClick = async (): Promise<void> => {
  albumList.value.unshift({
    id: albumList.value.length,
    photos: [],
    title: `Album #${albumList.value.length}`,
    expanded: false,
    selected: false,
    userId: -1,
  });
};

const onMainLayoutUploadPhotoButtonClick = async (): Promise<void> => {
  if (qFileRef.value) {
    qFileRef.value.pickFiles();
  }
};

const onAlbumHeaderClick = (album: Album): void => {
  album.expanded = !album.expanded;
  clearAlbumSelections();
  album.selected = album.expanded;
  selectedAlbum.value = album.selected ? album : null;
  mainLayoutAddPhotoButtonDisabled.value = !album.selected;
};

const clearAlbumSelections = () => {
  albumList.value.forEach((album) => {
    album.selected = false;
  });
};

const onDragAlbumStart = (album: Album): void => {
  album.expanded = false;
  clearAlbumSelections();
  mainLayoutAddPhotoButtonDisabled.value = true;
};

watch(file, (value: File): void => {
  if (!value) {
    file.value = null;
    return;
  }
  selectedAlbum.value?.photos.unshift({
    id: albumList.value.length,
    title: value.name,
    albumId: selectedAlbum.value.id,
    thumbnailUrl: value.name,
    url: value.name,
  });
  nextTick(() => {
    // must skip a frame otherwise if we want to be able to keep loading the same file
    file.value = null;
  });
});

const mainLayoutAddGroupButtonListeners = inject('mainLayout.addGroupButtonListeners') as Ref<CallableFunction[]>;
mainLayoutAddGroupButtonListeners.value.push(onMainLayoutAddGroupButtonClick);

const mainLayouUploadPhotoButtonListeners = inject('mainLayout.addUploadPhotoListeners') as Ref<CallableFunction[]>;
mainLayouUploadPhotoButtonListeners.value.push(onMainLayoutUploadPhotoButtonClick);

const mainLayoutAddPhotoButtonDisabled = inject('mainLayout.addPhotoButtonDisabled') as Ref<boolean>;

albumStore
  .getList()
  .then(photoStore.getList)
  .finally(() => {
    albumList.value = albumStore.state.albums || [];
  });
</script>

<style lang="scss" scoped>
.kanban-board {
  padding-top: var(--header-height);
  width: 100%;
}
.column-container {
  display: flex;
  align-items: flex-start;
}
.kanban-column {
  min-width: 370px;
  width: 370px;
  margin: 10px;
  padding: 10px;
  background: #eee;
  border-radius: 20px;
  > header {
    display: flex;
    align-items: center;
    padding: 10px;
    font-size: 1.5rem;
    font-weight: bold;
    flex-wrap: wrap;
  }
}
.kanban-list {
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding-left: 10%;
  padding-right: 10%;
}
.column-container {
  flex-direction: column;
  align-items: stretch;
}
.kanban-column {
  width: auto;
}
</style>

<style lang="scss" scoped>
.kanban-list-item {
  min-width: 100%;
  width: 100%;
  margin: 5px;
  pointer-events: auto;
  .kanban-list-item-inner {
    min-height: 100px;
    padding: 10px 15px;
    border-radius: 10px;
    background: white;
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.1);
    cursor: grab;
    transition: background 0.2s, transform 0.2s;

    .ellipsis {
      display: block;
    }
  }
  &.kanban-helper .kanban-list-item-inner {
    transform: rotate(10deg);
    background: $secondary;
    color: white;
  }
}
</style>
