declare module 'slicksort' {
  import { Component } from 'vue';

  export const ContainerMixin: Component;
  export const ElementMixin: Component;

  export const SlickList: Component;
  export const SlickItem: Component;

  export function arrayMove<T>(arr: Array<T>, prevIndex: number, newIndex: number): Array<T>;
}
