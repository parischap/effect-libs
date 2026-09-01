import { it } from '@effect/vitest';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MZoneOffsetParts from '@parischap/effect-lib/MZoneOffsetParts';

it('moduleTag', () => {
  TestUtils.assertEquals(
    Option.some(MZoneOffsetParts.moduleTag),
    TestUtils.moduleTagFromTestFilePath(import.meta.filename),
  );
});
