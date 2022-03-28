<template>
  <q-page class="row items-center justify-evenly"> {{ albumList?.length ? albumList[0].userId : 2 }} </q-page>
</template>

<script lang="ts">
import { useAlbumStore } from 'src/store/store-album';
import { usePhotoStore } from 'src/store/store-photo';
import { onBeforeMount, ref } from 'vue';

export default {
  name: 'IndexPage',
};
</script>

<script lang="ts" setup>
const albumStore = useAlbumStore();
const photoStore = usePhotoStore();

const albumList = ref<typeof albumStore.state.value.albums>([]);
const photoList = ref<typeof photoStore.state.value.photos>([]);

onBeforeMount(async () => {
  albumList.value = await albumStore.getList();
  photoList.value = await photoStore.getList();

  console.log(albumList.value, photoList.value, this);
});
</script>
