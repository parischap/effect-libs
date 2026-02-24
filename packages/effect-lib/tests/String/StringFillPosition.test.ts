import * as TestUtils from '@parischap/configs/TestUtils';
import * as MStringFillPosition from '@parischap/effect-lib/MStringFillPosition';
import { describe, it } from 'vitest';

describe('MStringFillPosition', () => {
  describe('toString', () => {
    it('Left position', () => {
      TestUtils.strictEqual(MStringFillPosition.toString(MStringFillPosition.Type.Left), 'left');
    });

    it('Right position', () => {
      TestUtils.strictEqual(MStringFillPosition.toString(MStringFillPosition.Type.Right), 'right');
    });
  });
});
