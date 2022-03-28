interface Store<StoreState> {
  state: StoreState;
  resetState: () => void;
}
export interface BaseStore<StoreState> extends Store<StoreState> {
  useState: () => StoreState;
}

export interface ListStore<Dto, StoreState> extends Store<StoreState> {
  getList: () => Promise<Dto[] | undefined>;
}
