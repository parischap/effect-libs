import { it } from '@effect/vitest';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MIsoDate from '@parischap/effect-lib/MIsoDate';

it('moduleTag', () => {
  TestUtils.assertEquals(
    Option.some(MIsoDate.moduleTag),
    TestUtils.moduleTagFromTestFilePath(import.meta.filename),
  );
});
