import { plugin as Slicksort } from 'src/npm_overrides/slicksort/slicksort';
import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  app.use(Slicksort);
});
