import { it } from '@effect/vitest';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MGregorianDate from '@parischap/effect-lib/MGregorianDate';

it('moduleTag', () => {
  TestUtils.assertEquals(
    Option.some(MGregorianDate.moduleTag),
    TestUtils.moduleTagFromTestFilePath(import.meta.filename),
  );
});
