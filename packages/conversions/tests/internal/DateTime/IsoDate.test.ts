import { it } from '@effect/vitest';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
//import {} from '@parischap/conversions';
import * as CVIsoDate from '@parischap/conversions/CVIsoDate';

it('moduleTag', () => {
  TestUtils.assertEquals(
    Option.some(CVIsoDate.moduleTag),
    TestUtils.moduleTagFromTestFilePath(import.meta.filename),
  );
});
