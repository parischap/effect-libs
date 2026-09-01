import { assert, describe, it } from '@effect/vitest';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MTemplateParts from '@parischap/effect-lib/MTemplateParts';
import * as MTemplatePlaceholder from '@parischap/effect-lib/MTemplatePlaceholder';
import * as MTemplateSeparator from '@parischap/effect-lib/MTemplateSeparator';

describe('MTemplateParts', () => {
  const namePlaceholder = MTemplatePlaceholder.fixedLength({ name: 'name', length: 10 });
  const agePlaceholder = MTemplatePlaceholder.fixedLength({ name: 'age', length: 3 });
  const separator = MTemplateSeparator.make(' is ');

  const parts: MTemplateParts.Type = [namePlaceholder, separator, agePlaceholder];

  describe('getSyntheticDescription', () => {
    it('Empty array', () => {
      TestUtils.assertEquals(MTemplateParts.getSyntheticDescription([]), '');
    });

    it('Parts with placeholders and separators', () => {
      TestUtils.assertEquals(MTemplateParts.getSyntheticDescription(parts), '#name is #age');
    });
  });

  describe('getPlaceholderDescription', () => {
    it('Empty array', () => {
      TestUtils.assertEquals(MTemplateParts.getPlaceholderDescription([]), '');
    });

    it('Parts with placeholders and separators', () => {
      const result = MTemplateParts.getPlaceholderDescription(parts);
      assert.isTrue(result.includes('name'));
      assert.isTrue(result.includes('age'));
    });
  });
});
