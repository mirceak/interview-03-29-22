import { describe, expect, it } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import App from 'src/App.vue';

installQuasarPlugin();

describe('App', () => {
  it('sets the correct default data', () => {
    expect(App).toBeTruthy();
  });
});
