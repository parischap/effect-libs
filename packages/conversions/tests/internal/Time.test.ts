import * as TestUtils from '@parischap/configs/TestUtils';
//import {} from '@parischap/conversions';
import * as CVTime from '@parischap/conversions/CVTime';
import { Option } from 'effect';
import { it } from 'vitest';

it('moduleTag', () => {
  TestUtils.assertEquals(
    Option.some(CVTime.moduleTag),
    TestUtils.moduleTagFromTestFilePath(import.meta.filename),
  );
});
