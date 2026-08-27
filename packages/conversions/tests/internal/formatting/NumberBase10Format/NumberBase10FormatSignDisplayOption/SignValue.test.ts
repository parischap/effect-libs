import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVSignValue from '@parischap/conversions/CVSignValue';

describe('CVSignValue', () => {
  describe('fromSignString', () => {
    it('Minus sign', () => {
      TestUtils.assertEquals(CVSignValue.fromSignString('-'), -1);
    });

    it('Plus sign', () => {
      TestUtils.assertEquals(CVSignValue.fromSignString('+'), 1);
    });

    it('Empty string', () => {
      TestUtils.assertEquals(CVSignValue.fromSignString(''), 1);
    });
  });
});
