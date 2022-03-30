<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn @click="clickButton(addGroupButtonListeners)" outlined color="secondary" label="Add Group">
          <q-icon name="add_circle_outline" class="q-pl-xs" />
        </q-btn>
        <q-space />
        <section>
          <q-btn
            @click="clickButton(addUploadPhotoListeners)"
            :disable="addPhotoButtonDisabled"
            outlined
            color="secondary"
            label="Upload Photo"
          >
            <q-icon name="upload_file" class="q-pl-xs" />
          </q-btn>
        </section>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
export default {
  name: 'MainLayout',
};
</script>

<script lang="ts" setup>
import { provide, ref } from 'vue';

const addGroupButtonListeners = ref<CallableFunction[]>([]);
const addUploadPhotoListeners = ref<CallableFunction[]>([]);

const addPhotoButtonDisabled = ref(true);

const clickButton = async (listeners: CallableFunction[]) => {
  for (const listener of listeners) {
    await listener();
  }
};

provide('mainLayout.addGroupButtonListeners', addGroupButtonListeners);
provide('mainLayout.addUploadPhotoListeners', addUploadPhotoListeners);
provide('mainLayout.addPhotoButtonDisabled', addPhotoButtonDisabled);
</script>
<style lang="scss">
.q-layout {
  min-height: 100% !important;
}
</style>
