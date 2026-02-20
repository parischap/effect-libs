import * as TestUtils from '@parischap/configs/TestUtils';
//import {} from '@parischap/conversions';
import * as CVZoneOffsetParts from '@parischap/conversions/CVZoneOffsetParts';
import * as Option from 'effect/Option'
import { it } from 'vitest';

it('moduleTag', () => {
  TestUtils.assertEquals(
    Option.some(CVZoneOffsetParts.moduleTag),
    TestUtils.moduleTagFromTestFilePath(import.meta.filename),
  );
});
