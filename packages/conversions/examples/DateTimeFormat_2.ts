import * as CVDateTimeFormat from '@parischap/conversions/CVDateTimeFormat'
import * as CVDateTimeFormatContext from '@parischap/conversions/CVDateTimeFormatContext'
import * as CVDateTimeFormatPlaceholder from '@parischap/conversions/CVDateTimeFormatPlaceholder'
import * as CVDateTimeFormatSeparator from '@parischap/conversions/CVDateTimeFormatSeparator'

// Let's define useful shortcuts
const placeholder = CVDateTimeFormatPlaceholder.make;
const sep = CVDateTimeFormatSeparator;

// Let's define a DateTimeFormat: iiii d MMMM yyyy
const frenchFormat = CVDateTimeFormat.make({
  context: CVDateTimeFormatContext.enGB,
  parts: [
    placeholder('iiii'),
    sep.space,
    placeholder('d'),
    sep.space,
    placeholder('MMMM'),
    sep.space,
    placeholder('yyyy'),
  ],
});

// Result: "'iiii d MMMM yyyy' in 'en-GB' context"
console.log(frenchFormat);
