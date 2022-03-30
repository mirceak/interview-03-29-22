import { describe, expect, it } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { mount } from '@vue/test-utils';
import DragHandle from 'src/components/drag-handle.vue';

installQuasarPlugin();

describe('Drag Handle', () => {
  it('sets the correct default data', () => {
    const wrapper = mount(DragHandle);
    const { vm } = wrapper;
    expect(typeof vm.$el.sortableHandle).toBe('boolean');
    expect(vm.$el.sortableHandle).toBe(true);
  });
});
