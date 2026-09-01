import { describe, it } from '@effect/vitest';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MSignValue from '@parischap/effect-lib/MSignValue';

describe('MSignValue', () => {
  describe('fromSignString', () => {
    it('Minus sign', () => {
      TestUtils.assertEquals(MSignValue.fromSignString('-'), -1);
    });

    it('Plus sign', () => {
      TestUtils.assertEquals(MSignValue.fromSignString('+'), 1);
    });

    it('Empty string', () => {
      TestUtils.assertEquals(MSignValue.fromSignString(''), 1);
    });
  });
});
