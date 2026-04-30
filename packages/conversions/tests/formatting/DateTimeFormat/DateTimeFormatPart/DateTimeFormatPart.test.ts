import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVDateTimeFormatContext from '@parischap/conversions/CVDateTimeFormatContext';
import * as CVDateTimeFormatPart from '@parischap/conversions/CVDateTimeFormatPart';
import * as CVDateTimeFormatPlaceholder from '@parischap/conversions/CVDateTimeFormatPlaceholder';
import * as CVDateTimeFormatSeparator from '@parischap/conversions/CVDateTimeFormatSeparator';
import * as CVTemplatePart from '@parischap/conversions/CVTemplatePart';

import { describe, it } from 'vitest';

describe('CVDateTimeFormatPart', () => {
  const placeholder = CVDateTimeFormatPlaceholder.make('yyyy');
  const separator = CVDateTimeFormatSeparator.hyphen;

  describe('isPlaceholder', () => {
    it('Not passing', () => {
      TestUtils.assertFalse(CVDateTimeFormatPart.isPlaceholder(separator));
    });

    it('Passing', () => {
      TestUtils.assertTrue(CVDateTimeFormatPart.isPlaceholder(placeholder));
    });
  });

  describe('isSeparator', () => {
    it('Not passing', () => {
      TestUtils.assertFalse(CVDateTimeFormatPart.isSeparator(placeholder));
    });

    it('Passing', () => {
      TestUtils.assertTrue(CVDateTimeFormatPart.isSeparator(separator));
    });
  });

  describe('toTemplatePart', () => {
    const enGBContext = CVDateTimeFormatContext.enGB;
    const convert = CVDateTimeFormatPart.toTemplatePart(enGBContext);

    it('Placeholder', () => {
      const result = convert(placeholder);
      TestUtils.assertTrue(CVTemplatePart.isPlaceholder(result));
    });

    it('Separator', () => {
      const result = convert(separator);
      TestUtils.assertTrue(CVTemplatePart.isSeparator(result));
    });
  });
});
