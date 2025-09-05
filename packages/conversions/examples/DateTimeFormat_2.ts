/* eslint-disable functional/no-expression-statements */
import { CVDateTimeFormat, CVDateTimeFormatContext } from '@parischap/conversions';

// Let's define useful shortcuts
const placeholder = CVDateTimeFormat.TemplatePart.Placeholder.make;
const sep = CVDateTimeFormat.TemplatePart.Separator;

// Let's define a DateTimeFormat: iiii d MMMM yyyy
const frenchFormat = CVDateTimeFormat.make({
	context: CVDateTimeFormatContext.enGB,
	templateparts: [
		placeholder('iiii'),
		sep.space,
		placeholder('d'),
		sep.space,
		placeholder('MMMM'),
		sep.space,
		placeholder('yyyy')
	]
});

// Result: "'iiii d MMMM yyyy' in 'en-GB' context"
console.log(frenchFormat);
