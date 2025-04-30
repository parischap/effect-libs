/* eslint-disable functional/no-expression-statements */
import { CVPlaceHolder } from '@parischap/conversions';
import { MTypes } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('CVPlaceHolder', () => {
	const threeChars = CVPlaceHolder.fixedLength({ name: 'foo', length: 3 });
	MTypes.areEqualTypes<typeof threeChars, CVPlaceHolder.Type<'foo'>>() satisfies true;

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVPlaceHolder.moduleTag);
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(threeChars.pipe(CVPlaceHolder.has));
		});

		it('.toString()', () => {
			TEUtils.strictEqual(threeChars.toString(), 'Placeholder foo');
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
		describe('Reading', () => {
			it('Not enough characters left', () => {
				TEUtils.assertLeft(threeChars.reader(''));
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
				TEUtils.assertLeft(threeChars.reader(''));
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

	describe('literal', () => {
		const literal = CVPlaceHolder.literal({ name: 'foo', value: 'foo' });

		MTypes.areEqualTypes<typeof literal, CVPlaceHolder.Type<'foo'>>() satisfies true;

		describe('Reading', () => {
			it('Not starting by value', () => {
				TEUtils.assertLeft(literal.reader(''));
				TEUtils.assertLeft(literal.reader('fo1 and bar'));
			});

			it('Passing', () => {
				TEUtils.assertRight(literal.reader('foo and bar'), Tuple.make('foo', ' and bar'));
			});
		});

		describe('Writing', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(literal.writer(''));
				TEUtils.assertLeft(literal.writer('foo1'));
			});

			it('Passing', () => {
				TEUtils.assertRight(literal.writer('foo'), 'foo');
			});
		});
	});

	describe('digits', () => {
		const digits = CVPlaceHolder.digits({
			name: 'foo'
		});

		MTypes.areEqualTypes<typeof digits, CVPlaceHolder.Type<'foo'>>() satisfies true;

		describe('Reading', () => {
			it('Empty string', () => {
				TEUtils.assertRight(digits.reader(''), Tuple.make('', ''));
			});

			it('Predicate not matched before the end', () => {
				TEUtils.assertRight(digits.reader('001 and 002'), Tuple.make('001', ' and 002'));
			});

			it('Predicate matched till the end', () => {
				TEUtils.assertRight(digits.reader('001'), Tuple.make('001', ''));
			});
		});

		describe('Writing', () => {
			it('Containing a non-digit', () => {
				TEUtils.assertLeft(digits.writer('0f0'));
			});

			it('Empty string', () => {
				TEUtils.assertRight(digits.writer(''), '');
			});

			it('Matching string', () => {
				TEUtils.assertRight(digits.writer('001'), '001');
			});
		});
	});

	describe('noSpace', () => {
		const noSpace = CVPlaceHolder.noSpace({
			name: 'foo'
		});

		MTypes.areEqualTypes<typeof noSpace, CVPlaceHolder.Type<'foo'>>() satisfies true;

		it('Reading', () => {
			TEUtils.assertRight(noSpace.reader('001 and 002'), Tuple.make('001', ' and 002'));
		});

		describe('Writing', () => {
			it('Not containing a non-digit', () => {
				TEUtils.assertRight(noSpace.writer('001'), '001');
			});

			it('Containing a non-digit', () => {
				TEUtils.assertLeft(noSpace.writer('00 1'));
			});
		});
	});

	describe('allBut', () => {
		const allButSlash = CVPlaceHolder.allBut({
			name: 'foo',
			separator: '/'
		});

		MTypes.areEqualTypes<typeof allButSlash, CVPlaceHolder.Type<'foo'>>() satisfies true;

		it('Reading', () => {
			TEUtils.assertRight(allButSlash.reader('11/12'), Tuple.make('11', '/12'));
		});

		describe('Writing', () => {
			it('Not containing a slash', () => {
				TEUtils.assertRight(allButSlash.writer('001'), '001');
			});

			it('Containing a slash', () => {
				TEUtils.assertLeft(allButSlash.writer('11/12'));
			});
		});
	});

	describe('final', () => {
		const final = CVPlaceHolder.final({ name: 'foo' });

		MTypes.areEqualTypes<typeof final, CVPlaceHolder.Type<'foo'>>() satisfies true;

		it('Reading', () => {
			TEUtils.assertRight(final.reader('001 and 002'), Tuple.make('001 and 002', ''));
		});

		it('Writing', () => {
			TEUtils.assertRight(final.writer('001 and 002'), '001 and 002');
		});
	});
});
