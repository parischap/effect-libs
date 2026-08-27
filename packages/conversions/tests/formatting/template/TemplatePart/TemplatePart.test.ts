import * as assert from '@effect/vitest/assert';
import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';

import * as CVTemplatePart from '@parischap/conversions/CVTemplatePart';
import * as CVTemplatePlaceholder from '@parischap/conversions/CVTemplatePlaceholder';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';

describe('CVTemplatePart', () => {
  const separator = CVTemplateSeparator.make('foo');
  const threeChars = CVTemplatePlaceholder.fixedLength({ name: 'foo', length: 3 });

  describe('isPlaceholder', () => {
    it('Not passing', () => {
      assert.isFalse(CVTemplatePart.isPlaceholder(separator));
    });

    it('Passing', () => {
      assert.isTrue(CVTemplatePart.isPlaceholder(threeChars));
    });
  });

  describe('isSeparator', () => {
    it('Not passing', () => {
      assert.isFalse(CVTemplatePart.isSeparator(threeChars));
    });

    it('Passing', () => {
      assert.isTrue(CVTemplatePart.isSeparator(separator));
    });
  });
});
