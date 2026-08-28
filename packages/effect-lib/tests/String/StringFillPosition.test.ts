import { assert, describe, it } from '@effect/vitest';

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
