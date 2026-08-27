import * as CVDateTimeFormatContext from '@parischap/conversions/CVDateTimeFormatContext';
import * as CVDateTimeFormatPart from '@parischap/conversions/CVDateTimeFormatPart';
import * as CVDateTimeFormatPlaceholder from '@parischap/conversions/CVDateTimeFormatPlaceholder';
import * as CVDateTimeFormatSeparator from '@parischap/conversions/CVDateTimeFormatSeparator';
import * as CVTemplatePart from '@parischap/conversions/CVTemplatePart';

import { assert, describe, it } from '@effect/vitest';

describe('CVDateTimeFormatPart', () => {
  const placeholder = CVDateTimeFormatPlaceholder.make('yyyy');
  const separator = CVDateTimeFormatSeparator.hyphen;

  describe('isPlaceholder', () => {
    it('Not passing', () => {
      assert.isFalse(CVDateTimeFormatPart.isPlaceholder(separator));
    });

    it('Passing', () => {
      assert.isTrue(CVDateTimeFormatPart.isPlaceholder(placeholder));
    });
  });

  describe('isSeparator', () => {
    it('Not passing', () => {
      assert.isFalse(CVDateTimeFormatPart.isSeparator(placeholder));
    });

    it('Passing', () => {
      assert.isTrue(CVDateTimeFormatPart.isSeparator(separator));
    });
  });

  describe('toTemplatePart', () => {
    const enGBContext = CVDateTimeFormatContext.enGB;
    const convert = CVDateTimeFormatPart.toTemplatePart(enGBContext);

    it('Placeholder', () => {
      const result = convert(placeholder);
      assert.isTrue(CVTemplatePart.isPlaceholder(result));
    });

    it('Separator', () => {
      const result = convert(separator);
      assert.isTrue(CVTemplatePart.isSeparator(result));
    });
  });
});
