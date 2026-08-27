import * as assert from '@effect/vitest/assert';
import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';

import * as MStringFillPosition from '@parischap/effect-lib/MStringFillPosition';

describe('MStringFillPosition', () => {
  describe('toString', () => {
    it('Left position', () => {
      assert.strictEqual(MStringFillPosition.toString(MStringFillPosition.Type.Left), 'left');
    });

    it('Right position', () => {
      assert.strictEqual(MStringFillPosition.toString(MStringFillPosition.Type.Right), 'right');
    });
  });
});
