import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVDateTimeFormatSeparator from '@parischap/conversions/CVDateTimeFormatSeparator';

import { describe, it } from 'vitest';

describe('CVDateTimeFormatSeparator', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(CVDateTimeFormatSeparator.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
