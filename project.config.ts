import * as Configs from '@parischap/configs';
import { basename } from 'path';
export default Configs.configMonoRepo({
  packageName: basename(import.meta.dirname),
  description:
    'effect-libs is a set of open-source libraries to be used in complement to the effect library. Offers Date and number parsing/formatting, sscanf/sprintf templating, number rounding, object pretty-printing and ansi-colors for terminal printing.',
});
