import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVTemplatePart from '@parischap/conversions/CVTemplatePart';
import * as CVTemplatePartPlaceholder from '@parischap/conversions/CVTemplatePartPlaceholder';
import * as CVTemplatePartSeparator from '@parischap/conversions/CVTemplatePartSeparator';
import { describe, it } from 'vitest';

describe('CVTemplatePart', () => {
  const separator = CVTemplatePartSeparator.make('foo');
  const threeChars = CVTemplatePartPlaceholder.fixedLength({ name: 'foo', length: 3 });

  describe('isPlaceholder', () => {
    it('Not passing', () => {
      TestUtils.assertFalse(CVTemplatePart.isPlaceholder(separator));
    });

    it('Passing', () => {
      TestUtils.assertTrue(CVTemplatePart.isPlaceholder(threeChars));
    });
  });

  describe('isSeparator', () => {
    it('Not passing', () => {
      TestUtils.assertFalse(CVTemplatePart.isSeparator(threeChars));
    });

    it('Passing', () => {
      TestUtils.assertTrue(CVTemplatePart.isSeparator(separator));
    });
  });
});
