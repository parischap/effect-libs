/* eslint-disable functional/no-expression-statements */
import { CVNumberBase10Format, CVReal, CVTemplatePlaceholder } from '@parischap/conversions';
import { MRegExpString, MString, MTypes } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('CVTemplatePlaceholder', () => {
	const threeChars = CVTemplatePlaceholder.fixedLength({ name: 'foo', length: 3 });

	MTypes.areEqualTypes<
		CVTemplatePlaceholder.ExtractName<typeof threeChars>,
		'foo'
	>() satisfies true;
	MTypes.areEqualTypes<
		CVTemplatePlaceholder.ExtractType<typeof threeChars>,
		string
	>() satisfies true;

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(
				TEUtils.moduleTagFromTestFilePath(__filename),
				CVTemplatePlaceholder.moduleTag
			);
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(threeChars.pipe(CVTemplatePlaceholder.has));
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(CVTemplatePlaceholder.has(threeChars));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(CVTemplatePlaceholder.has(new Date()));
			});
		});
	});

	describe('fixedLength', () => {
		it('.toString()', () => {
			TEUtils.strictEqual(threeChars.toString(), '#foo: 3-character string');
		});

		describe('Parsing', () => {
			it('Not enough characters left', () => {
				TEUtils.assertLeftMessage(
					threeChars.parser(''),
					'Expected length of #foo to be: 3. Actual: 0'
				);
				TEUtils.assertLeft(threeChars.parser('aa'));
			});

			it('Just enough characters left', () => {
				TEUtils.assertRight(threeChars.parser('foo'), Tuple.make('foo', ''));
			});

			it('More characters than necessary', () => {
				TEUtils.assertRight(threeChars.parser('foo and baz'), Tuple.make('foo', ' and baz'));
			});
		});

		describe('Formatting', () => {
			it('Too few characters', () => {
				TEUtils.assertLeftMessage(
					threeChars.parser(''),
					'Expected length of #foo to be: 3. Actual: 0'
				);
				TEUtils.assertLeft(threeChars.formatter('aa'));
			});

			it('Too many characters', () => {
				TEUtils.assertLeft(threeChars.formatter('foo and baz'));
			});

			it('Just the expected number of characters', () => {
				TEUtils.assertRight(threeChars.formatter('foo'), 'foo');
			});
		});
	});

	describe('paddedFixedLength', () => {
		const templatepart = CVTemplatePlaceholder.paddedFixedLength({
			name: 'foo',
			length: 3,
			fillChar: '0',
			padPosition: MString.PadPosition.Left,
			disallowEmptyString: true
		});
		it('.toString()', () => {
			TEUtils.strictEqual(templatepart.toString(), "#foo: 3-character string left-padded with '0'");
		});

		describe('Parsing', () => {
			it('Not passing', () => {
				TEUtils.assertLeftMessage(
					templatepart.parser(''),
					'Expected length of #foo to be: 3. Actual: 0'
				);
			});

			it('Passing', () => {
				TEUtils.assertRight(templatepart.parser('001 and baz'), Tuple.make('1', ' and baz'));
			});
		});

		describe('Formatting', () => {
			it('Not passing', () => {
				TEUtils.assertLeftMessage(
					templatepart.formatter('foo and baz'),
					'Expected length of #foo to be: 3. Actual: 11'
				);
			});

			it('Passing', () => {
				TEUtils.assertRight(templatepart.formatter('a'), '00a');
			});
		});
	});

	describe('fixedLengthToReal', () => {
		const templatepart = CVTemplatePlaceholder.fixedLengthToReal({
			name: 'foo',
			length: 3,
			fillChar: ' ',
			numberBase10Format: CVNumberBase10Format.integer
		});
		it('.toString()', () => {
			TEUtils.strictEqual(
				templatepart.toString(),
				"#foo: 3-character string left-padded with ' ' to potentially signed integer"
			);
		});

		describe('Parsing', () => {
			it('Not passing', () => {
				TEUtils.assertLeftMessage(
					templatepart.parser(''),
					'Expected length of #foo to be: 3. Actual: 0'
				);
			});

			it('Passing', () => {
				TEUtils.assertRight(
					templatepart.parser('  15'),
					Tuple.make(CVReal.unsafeFromNumber(1), '5')
				);
			});
		});

		describe('Formatting', () => {
			it('Not passing: too long', () => {
				TEUtils.assertLeftMessage(
					templatepart.formatter(CVReal.unsafeFromNumber(1154)),
					'Expected length of #foo to be: 3. Actual: 4'
				);
			});

			it('Passing', () => {
				TEUtils.assertRight(templatepart.formatter(CVReal.unsafeFromNumber(34)), ' 34');
				TEUtils.assertRight(templatepart.formatter(CVReal.unsafeFromNumber(-4)), '- 4');
			});
		});
	});

	describe('real', () => {
		const templatepart = CVTemplatePlaceholder.real({
			name: 'foo',
			numberBase10Format: CVNumberBase10Format.frenchStyleNumber
		});
		it('.toString()', () => {
			TEUtils.strictEqual(templatepart.toString(), '#foo: potentially signed French-style number');
		});

		describe('Parsing', () => {
			it('Not passing', () => {
				TEUtils.assertLeftMessage(
					templatepart.parser(''),
					"#foo contains '' from the start of which a(n) potentially signed French-style number could not be extracted"
				);
				TEUtils.assertLeft(templatepart.parser('1 014,1254 and foo'));
			});

			it('Passing', () => {
				TEUtils.assertRight(
					templatepart.parser('1 014,125 and foo'),
					Tuple.make(CVReal.unsafeFromNumber(1014.125), ' and foo')
				);
			});
		});

		it('Formatting', () => {
			TEUtils.assertRight(templatepart.formatter(CVReal.unsafeFromNumber(1014.1256)), '1 014,126');
		});
	});

	describe('mappedLiterals', () => {
		const map = CVTemplatePlaceholder.mappedLiterals({
			name: 'foo',
			keyValuePairs: [
				['foo', 6],
				['bazbar', 12]
			]
		});

		it('.toString()', () => {
			TEUtils.strictEqual(map.toString(), '#foo: from [foo, bazbar] to [6, 12]');
		});

		describe('Parsing', () => {
			it('Not starting by value', () => {
				TEUtils.assertLeftMessage(
					map.parser(''),
					"Expected remaining text for #foo to start with one of [foo, bazbar]. Actual: ''"
				);
				TEUtils.assertLeft(map.parser('baz is away'));
			});

			it('Passing', () => {
				TEUtils.assertRight(map.parser('bazbar is away'), Tuple.make(12, ' is away'));
			});
		});

		describe('Formatting', () => {
			it('Not passing', () => {
				TEUtils.assertLeftMessage(map.formatter(4), '#foo: expected one of [6, 12]. Actual: 4');
			});

			it('Passing', () => {
				TEUtils.assertRight(map.formatter(6), 'foo');
			});
		});
	});

	describe('anythingBut', () => {
		const noSpaceChars = CVTemplatePlaceholder.anythingBut({
			name: 'foo',
			forbiddenChars: [MRegExpString.space]
		});

		it('.toString()', () => {
			TEUtils.strictEqual(
				noSpaceChars.toString(),
				'#foo: a non-empty string containing non-space characters'
			);
		});

		describe('Parsing', () => {
			it('Not passing', () => {
				TEUtils.assertLeftMessage(
					noSpaceChars.parser(''),
					"Expected #foo to be a non-empty string containing non-space characters. Actual: ''"
				);
			});

			it('Passing', () => {
				TEUtils.assertRight(noSpaceChars.parser('foo and bar'), Tuple.make('foo', ' and bar'));
				TEUtils.assertRight(noSpaceChars.parser('foo'), Tuple.make('foo', ''));
			});
		});

		describe('Formatting', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(noSpaceChars.formatter(''));
				TEUtils.assertLeftMessage(
					noSpaceChars.formatter('fo o'),
					"#foo: expected a non-empty string containing non-space characters. Actual: 'fo o'"
				);
			});

			it('Passing', () => {
				TEUtils.assertRight(noSpaceChars.formatter('foo'), 'foo');
			});
		});
	});

	describe('toEnd', () => {
		const toEnd = CVTemplatePlaceholder.toEnd('foo');

		it('.toString()', () => {
			TEUtils.strictEqual(toEnd.toString(), '#foo: a string');
		});

		it('Parsing', () => {
			TEUtils.assertRight(toEnd.parser('foo and bar'), Tuple.make('foo and bar', ''));
		});

		it('Formatting', () => {
			TEUtils.assertRight(toEnd.formatter('foo'), 'foo');
		});
	});
});
