declare module 'slicksort' {
  import { DirectiveOptions, Component } from 'vue';

  export const ContainerMixin: Component;
  export const ElementMixin: Component;

  export const SlickList: Component;
  export const SlickItem: Component;

  export const HandleDirective: DirectiveOptions;

  export function arrayMove<T>(arr: Array<T>, prevIndex: number, newIndex: number): Array<T>;
}
