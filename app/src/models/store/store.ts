import { Ref } from 'vue';

export interface BaseStore<StoreState, Dto> {
  state: Ref<StoreState>;

  useState: () => StoreState;

  resetState: () => void;
  getList: () => Promise<Dto[]>;
}

export interface ListStore<Dto, StoreState> {
  resetState: () => void;
  getList: () => Promise<Dto[]>;
  state: Ref<StoreState>;
}
