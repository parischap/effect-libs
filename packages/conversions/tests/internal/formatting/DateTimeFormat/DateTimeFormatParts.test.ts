import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVDateTimeFormatContext from '@parischap/conversions/CVDateTimeFormatContext';
import * as CVDateTimeFormatParts from '@parischap/conversions/CVDateTimeFormatParts';
import * as CVDateTimeFormatPlaceholder from '@parischap/conversions/CVDateTimeFormatPlaceholder';
import * as CVDateTimeFormatSeparator from '@parischap/conversions/CVDateTimeFormatSeparator';

import { describe, it } from 'vitest';

describe('CVDateTimeFormatParts', () => {
  describe('toTemplateParts', () => {
    const enGBContext = CVDateTimeFormatContext.enGB;
    const convert = CVDateTimeFormatParts.toTemplateParts(enGBContext);

    it('Empty array', () => {
      TestUtils.assertEquals(convert([]), []);
    });

    it('Array with placeholders and separators', () => {
      const parts = [
        CVDateTimeFormatPlaceholder.make('yyyy'),
        CVDateTimeFormatSeparator.hyphen,
        CVDateTimeFormatPlaceholder.make('MM'),
      ];
      const result = convert(parts);
      TestUtils.assertEquals(result.length, 3);
    });
  });
});
