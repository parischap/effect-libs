import * as MStringFillPosition from '@parischap/effect-lib/MStringFillPosition';

import { assert, describe, it } from '@effect/vitest';

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
