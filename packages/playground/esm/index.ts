#!/usr/bin/env node
import * as CVDateTimeFormat from '@parischap/conversions/CVDateTimeFormat';
import * as CVDateTimeFormatContext from '@parischap/conversions/CVDateTimeFormatContext';

// Let's define useful shortcuts
const placeholder = CVDateTimeFormat.TemplatePart.Placeholder.make;
const sep = CVDateTimeFormat.TemplatePart.Separator;

// Let's define a context
const frenchContext = CVDateTimeFormatContext.fromLocaleOrThrow('fr-FR');

// Let's define a DateTimeFormat: iiii d MMMM yyyy
const frenchFormat = CVDateTimeFormat.make({
  context: frenchContext,
  templateParts: [
    placeholder('iiii'),
    sep.space,
    placeholder('d'),
    sep.space,
    placeholder('MMMM'),
    sep.space,
    placeholder('yyyy'),
  ],
});

// Let's define a parser
// Type: (dateString: string) => Either.Either<CVDateTime.Type, MInputError.Type>
const parser = CVDateTimeFormat.toParser(frenchFormat);

// Result: { _id: 'Either', _tag: 'Right', right: '2025-09-04T00:00:00.000+02:00' }
console.log(parser('jeudi 4 septembre 2025'));
