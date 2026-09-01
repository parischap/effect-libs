import { it } from '@effect/vitest';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MTime from '@parischap/effect-lib/MTime';

it('moduleTag', () => {
  TestUtils.assertEquals(
    Option.some(MTime.moduleTag),
    TestUtils.moduleTagFromTestFilePath(import.meta.filename),
  );
});
