import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
//import {} from '@parischap/conversions';
import * as CVGregorianDate from '@parischap/conversions/CVGregorianDate';

import { it } from 'vitest';

it('moduleTag', () => {
  TestUtils.assertEquals(
    Option.some(CVGregorianDate.moduleTag),
    TestUtils.moduleTagFromTestFilePath(import.meta.filename),
  );
});
