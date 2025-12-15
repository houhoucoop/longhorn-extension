declare module '@shell/components/TabTitle' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@shell/plugins/i18n" {
  import { Store } from "vuex";

  export function stringFor(
    store: Store<any> | null,
    key: string,
    args?: unknown,
    raw?: boolean
  ): string;
}