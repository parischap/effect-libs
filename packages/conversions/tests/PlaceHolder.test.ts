/* eslint-disable functional/no-expression-statements */
import { CVNumberBase10Format, CVPlaceHolder, CVReal } from '@parischap/conversions';
import { MString } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('CVPlaceHolder', () => {
	const threeChars = CVPlaceHolder.fixedLength({ id: 'foo', length: 3 });

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVPlaceHolder.moduleTag);
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(threeChars.pipe(CVPlaceHolder.has));
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(CVPlaceHolder.has(threeChars));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(CVPlaceHolder.has(new Date()));
			});
		});
	});

	describe('fixedLength', () => {
		it('.toString()', () => {
			TEUtils.strictEqual(threeChars.toString(), "'foo' placeholder: 3-character string");
		});

		describe('Reading', () => {
			it('Not enough characters left', () => {
				TEUtils.assertLeftMessage(
					threeChars.reader(''),
					"Expected length of 'foo' placeholder to be: 3. Actual: 0"
				);
				TEUtils.assertLeft(threeChars.reader('aa'));
			});

			it('Just enough characters left', () => {
				TEUtils.assertRight(threeChars.reader('foo'), Tuple.make('foo', ''));
			});

			it('More characters than necessary', () => {
				TEUtils.assertRight(threeChars.reader('foo and baz'), Tuple.make('foo', ' and baz'));
			});
		});

		describe('Writing', () => {
			it('Too few characters', () => {
				TEUtils.assertLeftMessage(
					threeChars.reader(''),
					"Expected length of 'foo' placeholder to be: 3. Actual: 0"
				);
				TEUtils.assertLeft(threeChars.writer('aa'));
			});

			it('Too many characters', () => {
				TEUtils.assertLeft(threeChars.writer('foo and baz'));
			});

			it('Just the expected number of characters', () => {
				TEUtils.assertRight(threeChars.writer('foo'), 'foo');
			});
		});
	});

	describe('paddedFixedLength', () => {
		const placeHolder = CVPlaceHolder.paddedFixedLength({
			id: 'foo',
			length: 3,
			fillChar: '0',
			padPosition: MString.PadPosition.Left,
			disallowEmptyString: true
		});
		it('.toString()', () => {
			TEUtils.strictEqual(
				placeHolder.toString(),
				"'foo' placeholder: 3-character string left-padded with '0'"
			);
		});

		describe('Reading', () => {
			it('Not passing', () => {
				TEUtils.assertLeftMessage(
					placeHolder.reader(''),
					"Expected length of 'foo' placeholder to be: 3. Actual: 0"
				);
			});

			it('Passing', () => {
				TEUtils.assertRight(placeHolder.reader('001 and baz'), Tuple.make('1', ' and baz'));
			});
		});

		describe('Writing', () => {
			it('Not passing', () => {
				TEUtils.assertLeftMessage(
					placeHolder.writer('foo and baz'),
					"Expected length of 'foo' placeholder to be at most(included): 3. Actual: 11"
				);
			});

			it('Passing', () => {
				TEUtils.assertRight(placeHolder.writer('a'), '00a');
			});
		});
	});

	describe('fixedLengthToReal', () => {
		const placeHolder = CVPlaceHolder.fixedLengthToReal({
			id: 'foo',
			length: 3,
			fillChar: '0',
			padPosition: MString.PadPosition.Left,
			disallowEmptyString: true,
			numberBase10Format: CVNumberBase10Format.undividedInteger
		});
		it('.toString()', () => {
			TEUtils.strictEqual(
				placeHolder.toString(),
				"'foo' placeholder: 3-character string left-padded with '0' to undivided integer"
			);
		});

		describe('Reading', () => {
			it('Not passing', () => {
				TEUtils.assertLeftMessage(
					placeHolder.reader(''),
					"Expected length of 'foo' placeholder to be: 3. Actual: 0"
				);
			});

			it('Passing', () => {
				TEUtils.assertRight(
					placeHolder.reader('0015'),
					Tuple.make(CVReal.unsafeFromNumber(1), '5')
				);
			});
		});

		describe('Writing', () => {
			it('Not passing: too long', () => {
				TEUtils.assertLeftMessage(
					placeHolder.writer(CVReal.unsafeFromNumber(1154)),
					"Expected length of 'foo' placeholder to be at most(included): 3. Actual: 4"
				);
			});

			it('Passing', () => {
				TEUtils.assertRight(placeHolder.writer(CVReal.unsafeFromNumber(34)), '034');
			});
		});
	});

	describe('real', () => {
		const placeHolder = CVPlaceHolder.real({
			id: 'foo',
			numberBase10Format: CVNumberBase10Format.frenchStyleThreeDecimalNumber
		});
		it('.toString()', () => {
			TEUtils.strictEqual(
				placeHolder.toString(),
				"'foo' placeholder: French-style three-decimal number"
			);
		});

		describe('Reading', () => {
			it('Not passing', () => {
				TEUtils.assertLeftMessage(
					placeHolder.reader(''),
					"'foo' placeholder contains '' from the start of which a French-style three-decimal number could not be extracted"
				);
				TEUtils.assertLeft(placeHolder.reader('1 014,1254 and foo'));
			});

			it('Passing', () => {
				TEUtils.assertRight(
					placeHolder.reader('1 014,125 and foo'),
					Tuple.make(CVReal.unsafeFromNumber(1014.125), ' and foo')
				);
			});
		});

		it('Writing', () => {
			TEUtils.assertRight(placeHolder.writer(CVReal.unsafeFromNumber(1014.1256)), '1 014,126');
		});
	});

	describe('literal', () => {
		const literal = CVPlaceHolder.literal({ id: 'foo', value: 'foo' });

		it('.toString()', () => {
			TEUtils.strictEqual(literal.toString(), "'foo' placeholder: 'foo' string");
		});

		describe('Reading', () => {
			it('Not starting by value', () => {
				TEUtils.assertLeftMessage(
					literal.reader(''),
					"Expected remaining text for 'foo' placeholder to start with 'foo'. Actual: ''"
				);
				TEUtils.assertLeft(literal.reader('fo1 and bar'));
			});

			it('Passing', () => {
				TEUtils.assertRight(literal.reader('foo and bar'), Tuple.make('foo', ' and bar'));
			});
		});

		describe('Writing', () => {
			it('Not passing', () => {
				TEUtils.assertLeftMessage(
					literal.writer(''),
					"Expected 'foo' placeholder to be: 'foo'. Actual: ''"
				);
				TEUtils.assertLeft(literal.writer('foo1'));
			});

			it('Passing', () => {
				TEUtils.assertRight(literal.writer('foo'), 'foo');
			});
		});
	});

	describe('atLeastOneNonSpaceChar', () => {
		const atLeastOneNonSpaceChar = CVPlaceHolder.atLeastOneNonSpaceChar('foo');

		it('.toString()', () => {
			TEUtils.strictEqual(
				atLeastOneNonSpaceChar.toString(),
				"'foo' placeholder: a non-empty string containing non-space characters"
			);
		});

		describe('Reading', () => {
			it('Not passing', () => {
				TEUtils.assertLeftMessage(
					atLeastOneNonSpaceChar.reader(''),
					"Expected 'foo' placeholder to be a non-empty string containing non-space characters. Actual: ''"
				);
			});

			it('Passing', () => {
				TEUtils.assertRight(
					atLeastOneNonSpaceChar.reader('foo and bar'),
					Tuple.make('foo', ' and bar')
				);
				TEUtils.assertRight(atLeastOneNonSpaceChar.reader('foo'), Tuple.make('foo', ''));
			});
		});

		describe('Writing', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(atLeastOneNonSpaceChar.writer(''));
				TEUtils.assertLeftMessage(
					atLeastOneNonSpaceChar.writer('fo o'),
					"'foo' placeholder: expected a non-empty string containing non-space characters. Actual: 'fo o'"
				);
			});

			it('Passing', () => {
				TEUtils.assertRight(atLeastOneNonSpaceChar.writer('foo'), 'foo');
			});
		});
	});
});
