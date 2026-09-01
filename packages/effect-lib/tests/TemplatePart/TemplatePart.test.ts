import { assert, describe, it } from '@effect/vitest';

import * as MTemplatePart from '@parischap/effect-lib/MTemplatePart';
import * as MTemplatePlaceholder from '@parischap/effect-lib/MTemplatePlaceholder';
import * as MTemplateSeparator from '@parischap/effect-lib/MTemplateSeparator';

describe('MTemplatePart', () => {
  const separator = MTemplateSeparator.make('foo');
  const threeChars = MTemplatePlaceholder.fixedLength({ name: 'foo', length: 3 });

  describe('isPlaceholder', () => {
    it('Not passing', () => {
      assert.isFalse(MTemplatePart.isPlaceholder(separator));
    });

    it('Passing', () => {
      assert.isTrue(MTemplatePart.isPlaceholder(threeChars));
    });
  });

  describe('isSeparator', () => {
    it('Not passing', () => {
      assert.isFalse(MTemplatePart.isSeparator(threeChars));
    });

    it('Passing', () => {
      assert.isTrue(MTemplatePart.isSeparator(separator));
    });
  });
});
