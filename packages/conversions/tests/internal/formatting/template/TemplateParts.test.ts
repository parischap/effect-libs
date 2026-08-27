import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVTemplateParts from '@parischap/conversions/CVTemplateParts';
import * as CVTemplatePlaceholder from '@parischap/conversions/CVTemplatePlaceholder';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';

import { assert, describe, it } from '@effect/vitest';

describe('CVTemplateParts', () => {
  const namePlaceholder = CVTemplatePlaceholder.fixedLength({ name: 'name', length: 10 });
  const agePlaceholder = CVTemplatePlaceholder.fixedLength({ name: 'age', length: 3 });
  const separator = CVTemplateSeparator.make(' is ');

  const parts: CVTemplateParts.Type = [namePlaceholder, separator, agePlaceholder];

  describe('getSyntheticDescription', () => {
    it('Empty array', () => {
      TestUtils.assertEquals(CVTemplateParts.getSyntheticDescription([]), '');
    });

    it('Parts with placeholders and separators', () => {
      TestUtils.assertEquals(CVTemplateParts.getSyntheticDescription(parts), '#name is #age');
    });
  });

  describe('getPlaceholderDescription', () => {
    it('Empty array', () => {
      TestUtils.assertEquals(CVTemplateParts.getPlaceholderDescription([]), '');
    });

    it('Parts with placeholders and separators', () => {
      const result = CVTemplateParts.getPlaceholderDescription(parts);
      assert.isTrue(result.includes('name'));
      assert.isTrue(result.includes('age'));
    });
  });
});
