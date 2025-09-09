/* eslint-disable functional/no-expression-statements */
import {
	CVNumberBase10Format,
	CVReal,
	CVTemplate,
	CVTemplatePlaceholder,
	CVTemplateSeparator
} from '@parischap/conversions';
import { MInputError, MTypes } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Either, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVTemplate', () => {
	const params = {
		fillChar: '0',
		numberBase10Format: pipe(CVNumberBase10Format.integer, CVNumberBase10Format.withoutSignDisplay)
	};
	const placeholder = CVTemplatePlaceholder;
	const sep = CVTemplateSeparator;

	const template = CVTemplate.make(
		placeholder.fixedLengthToReal({ ...params, name: 'dd', length: 2 }),
		sep.slash,
		placeholder.fixedLengthToReal({ ...params, name: 'MM', length: 2 }),
		sep.slash,
		placeholder.fixedLengthToReal({ ...params, name: 'yyyy', length: 4 }),
		sep.space,
		placeholder.real({ ...params, name: 'MM' })
	);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVTemplate.moduleTag);
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(template.pipe(CVTemplate.has));
		});

		it('.toString()', () => {
			TEUtils.strictEqual(
				template.toString(),
				`#dd/#MM/#yyyy #MM

#dd: 2-character string left-padded with '0' to unsigned integer.
#MM: 2-character string left-padded with '0' to unsigned integer.
#yyyy: 4-character string left-padded with '0' to unsigned integer.
#MM: unsigned integer`
			);
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(CVTemplate.has(template));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(CVTemplate.has(new Date()));
			});
		});
	});

	describe('toParser', () => {
		const parser = CVTemplate.toParser(template);

		MTypes.areEqualTypes<
			typeof parser,
			MTypes.OneArgFunction<
				string,
				Either.Either<
					{
						readonly dd: CVReal.Type;
						readonly MM: CVReal.Type;
						readonly yyyy: CVReal.Type;
					},
					MInputError.Type
				>
			>
		>() satisfies true;

		it('Empty text', () => {
			TEUtils.assertLeftMessage(parser(''), 'Expected length of #dd to be: 2. Actual: 0');
		});

		it('Text too short', () => {
			TEUtils.assertLeftMessage(
				parser('25/12'),
				"Expected remaining text for separator at position 4 to start with '/'. Actual: ''"
			);
		});

		it('Wrong separator', () => {
			TEUtils.assertLeftMessage(
				parser('25|12'),
				"Expected remaining text for separator at position 2 to start with '/'. Actual: '|12'"
			);
		});

		it('Same placeholder receives different values', () => {
			TEUtils.assertLeftMessage(
				parser('25/12/2025 13'),
				"#MM is present more than once in template and receives differing values '12' and '13'"
			);
		});

		it('Text too long', () => {
			TEUtils.assertLeftMessage(
				parser('25/12/2025 12is XMas'),
				"Expected text not consumed by template to be empty. Actual: 'is XMas'"
			);
		});

		it('Matching text', () => {
			TEUtils.assertRight(parser('05/12/2025 12'), {
				dd: CVReal.unsafeFromNumber(5),
				MM: CVReal.unsafeFromNumber(12),
				yyyy: CVReal.unsafeFromNumber(2025)
			});
		});
	});

	describe('toFormatter', () => {
		const formatter = CVTemplate.toFormatter(template);

		MTypes.areEqualTypes<
			typeof formatter,
			MTypes.OneArgFunction<
				{
					readonly dd: CVReal.Type;
					readonly MM: CVReal.Type;
					readonly yyyy: CVReal.Type;
				},
				Either.Either<string, MInputError.Type>
			>
		>() satisfies true;

		it('With correct values', () => {
			TEUtils.assertRight(
				formatter({
					dd: CVReal.unsafeFromNumber(5),
					MM: CVReal.unsafeFromNumber(12),
					yyyy: CVReal.unsafeFromNumber(2025)
				}),
				'05/12/2025 12'
			);
		});

		it('With incorrect values', () => {
			TEUtils.assertLeftMessage(
				formatter({
					dd: CVReal.unsafeFromNumber(115),
					MM: CVReal.unsafeFromNumber(12),
					yyyy: CVReal.unsafeFromNumber(2025)
				}),
				'Expected length of #dd to be: 2. Actual: 3'
			);
		});
	});
});
