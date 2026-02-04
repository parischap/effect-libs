import * as TestUtils from '@parischap/configs/TestUtils';
import {
  CVTemplatePartAll,
  CVTemplatePartPlaceholder,
  CVTemplatePartSeparator,
} from '@parischap/conversions';
import { describe, it } from 'vitest';

describe('CVTemplatePart', () => {
  const separator = CVTemplatePartSeparator.make('foo');
  const threeChars = CVTemplatePartPlaceholder.fixedLength({ name: 'foo', length: 3 });

  describe('isPlaceholder', () => {
    it('Not passing', () => {
      TestUtils.assertFalse(CVTemplatePartAll.isPlaceholder(separator));
    });

    it('Passing', () => {
      TestUtils.assertTrue(CVTemplatePartAll.isPlaceholder(threeChars));
    });
  });

  describe('isSeparator', () => {
    it('Not passing', () => {
      TestUtils.assertFalse(CVTemplatePartAll.isSeparator(threeChars));
    });

    it('Passing', () => {
      TestUtils.assertTrue(CVTemplatePartAll.isSeparator(separator));
    });
  });
});
