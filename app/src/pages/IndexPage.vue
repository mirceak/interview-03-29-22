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
        <header @click="album.expanded = !album.expanded">
          <drag-handle @mousedown.prevent="closeAlbums" />
          <span class="ellipsis q-mr-sm">{{ album.title }}</span>
          ({{ album.photos.length }})
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
              {{ photo.title }}
            </div>
          </SlickItem>
        </SlickList>
      </SlickItem>
    </SlickList>
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

import { ref } from 'vue';

import { SlickList, SlickItem } from 'src/npm_overrides/slicksort/slicksort';
import DragHandle from 'src/components/drag-handle.vue';

const albumStore = useAlbumStore();
const photoStore = usePhotoStore(albumStore);

const albumList = ref<Album[]>([]);

const selectedAlbum = ref<Album>();

albumStore
  .getList()
  .then(photoStore.getList)
  .finally(() => {
    albumList.value = albumStore.state.albums || [];
    selectedAlbum.value = albumList.value[0];
  });

const closeAlbums = () => {
  albumList.value.forEach((album) => {
    album.expanded = false;
  });
};
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
    max-width: 370px;
    display: flex;
    align-items: center;
    padding: 10px;
    font-size: 1.5rem;
    font-weight: bold;
  }
}
.kanban-list {
  overflow: auto;
  display: flex;
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

<style lang="scss">
.kanban-list-item {
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
  }
  &.kanban-helper .kanban-list-item-inner {
    transform: rotate(10deg);
    background: #9b51e0;
    color: white;
  }
}
</style>
