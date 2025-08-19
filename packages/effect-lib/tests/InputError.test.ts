/* eslint-disable functional/no-expression-statements */
import { MInputError } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('MInputError', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), MInputError.moduleTag);
	});

	describe('assertValue', () => {
		it('Not passing number without name', () => {
			TEUtils.assertLeftMessage(
				MInputError.assertValue({ expected: 5 })(10),
				'Expected value to be: 5. Actual: 10'
			);
		});

		it('Not passing without name', () => {
			TEUtils.assertLeftMessage(
				MInputError.assertValue({ expected: 'foo' })('bar'),
				"Expected value to be: 'foo'. Actual: 'bar'"
			);
		});

		it('Not passing with name', () => {
			TEUtils.assertLeftMessage(
				MInputError.assertValue({ expected: 5, name: "'age'" })(10),
				"Expected 'age' to be: 5. Actual: 10"
			);
		});

		it('Passing', () => {
			TEUtils.assertRight(MInputError.assertValue({ expected: 5 })(5), 5);
		});
	});

	describe('assertLength', () => {
		it('Not passing', () => {
			TEUtils.assertLeftMessage(
				MInputError.assertLength({ expected: 5, name: "'name'" })('foo'),
				"Expected length of 'name' to be: 5. Actual: 3"
			);
		});

		it('Passing', () => {
			TEUtils.assertRight(MInputError.assertLength({ expected: 3 })('foo'), 'foo');
		});
	});

	describe('assertMaxLength', () => {
		it('Not passing', () => {
			TEUtils.assertLeftMessage(
				MInputError.assertMaxLength({ expected: 2, name: "'name'" })('foo'),
				"Expected length of 'name' to be at most(included): 2. Actual: 3"
			);
		});

		it('Passing', () => {
			TEUtils.assertRight(MInputError.assertMaxLength({ expected: 3 })('foo'), 'foo');
		});
	});

	describe('assertInRange', () => {
		it('Not passing', () => {
			TEUtils.assertLeftMessage(
				MInputError.assertInRange({
					min: 3,
					max: 5,
					minIncluded: false,
					maxIncluded: false,
					offset: 1,
					name: "'age'"
				})(3),
				"Expected 'age' to be between 4 (excluded) and 6 (excluded). Actual: 4"
			);
			TEUtils.assertLeftMessage(
				MInputError.assertInRange({
					min: 3,
					max: 5,
					minIncluded: true,
					maxIncluded: false,
					offset: 0,
					name: "'age'"
				})(2),
				"Expected 'age' to be between 3 (included) and 5 (excluded). Actual: 2"
			);
			TEUtils.assertLeftMessage(
				MInputError.assertInRange({
					min: 3,
					max: 5,
					minIncluded: false,
					maxIncluded: false,
					offset: 0,
					name: "'age'"
				})(5),
				"Expected 'age' to be between 3 (excluded) and 5 (excluded). Actual: 5"
			);
			TEUtils.assertLeftMessage(
				MInputError.assertInRange({
					min: 3,
					max: 5,
					minIncluded: false,
					maxIncluded: true,
					offset: 0,
					name: "'age'"
				})(6),
				"Expected 'age' to be between 3 (excluded) and 5 (included). Actual: 6"
			);
		});

		it('Passing', () => {
			TEUtils.assertRight(
				MInputError.assertInRange({
					min: 3,
					max: 5,
					minIncluded: false,
					maxIncluded: false,
					offset: 0,
					name: "'age'"
				})(4),
				4
			);
			TEUtils.assertRight(
				MInputError.assertInRange({
					min: 3,
					max: 5,
					minIncluded: true,
					maxIncluded: false,
					offset: 0,
					name: "'age'"
				})(3),
				3
			);
			TEUtils.assertRight(
				MInputError.assertInRange({
					min: 3,
					max: 5,
					minIncluded: true,
					maxIncluded: true,
					offset: 0,
					name: "'age'"
				})(5),
				5
			);
		});
	});

	describe('assertStartsWith', () => {
		it('Not passing', () => {
			TEUtils.assertLeftMessage(
				MInputError.assertStartsWith({ startString: 'foo', name: "'text'" })('baz'),
				"Expected 'text' to start with 'foo'. Actual: 'baz'"
			);
		});

		it('Passing', () => {
			TEUtils.assertRight(
				MInputError.assertStartsWith({ startString: 'foo' })('foo and baz'),
				'foo and baz'
			);
		});
	});

	describe('assertMatches', () => {
		const assertContainsOneDigit = MInputError.assertMatches({
			regExp: /\d/,
			regExpDescriptor: 'to contain a digit',
			name: "'text'"
		});

		it('Not passing', () => {
			TEUtils.assertLeftMessage(
				assertContainsOneDigit('foo'),
				"Expected 'text' to contain a digit. Actual: 'foo'"
			);
		});

		it('Passing', () => {
			TEUtils.assertRight(assertContainsOneDigit('fo4o'), 'fo4o');
		});
	});

	describe('assertEmpty', () => {
		it('Not passing', () => {
			TEUtils.assertLeftMessage(
				MInputError.assertEmpty({ name: "'text'" })('baz'),
				"Expected 'text' to be empty. Actual: 'baz'"
			);
		});

		it('Passing', () => {
			TEUtils.assertRight(MInputError.assertEmpty()(''), '');
		});
	});
});
