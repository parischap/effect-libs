/* eslint-disable functional/no-expression-statements */
import { CVNumberBase10Format, CVPlaceHolder, CVReal, CVTemplate } from '@parischap/conversions';
import { MInputError, MString, MTypes } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Either } from 'effect';
import { describe, it } from 'vitest';

describe('CVTemplate', () => {
	const params = {
		fillChar: '0',
		padPosition: MString.PadPosition.Left,
		disallowEmptyString: true,
		numberBase10Format: CVNumberBase10Format.integer
	};
	const template = CVTemplate.make(
		CVPlaceHolder.fixedLengthToReal({ ...params, id: 'dd', length: 2 }),
		CVPlaceHolder.literal({ id: 'separator1', value: '/' }),
		CVPlaceHolder.fixedLengthToReal({ ...params, id: 'MM', length: 2 }),
		CVPlaceHolder.literal({ id: 'separator2', value: '/' }),
		CVPlaceHolder.fixedLengthToReal({ ...params, id: 'yyyy', length: 4 }),
		CVPlaceHolder.literal({ id: 'separator3', value: ' ' }),
		CVPlaceHolder.real({ ...params, id: 'MM' })
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
				`{
  "_id": "@parischap/conversions/Template/",
  "placeHolders": [
    "'dd' placeholder: 2-character string left-padded with '0' to integer",
    "'separator1' placeholder: '/' string",
    "'MM' placeholder: 2-character string left-padded with '0' to integer",
    "'separator2' placeholder: '/' string",
    "'yyyy' placeholder: 4-character string left-padded with '0' to integer",
    "'separator3' placeholder: ' ' string",
    "'MM' placeholder: integer"
  ]
}`
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
						readonly separator1: string;
						readonly MM: CVReal.Type;
						readonly separator2: string;
						readonly yyyy: CVReal.Type;
						readonly separator3: string;
					},
					MInputError.Type
				>
			>
		>() satisfies true;

		it('Empty text', () => {
			TEUtils.assertLeftMessage(
				parser(''),
				"Expected length of 'dd' placeholder to be: 2. Actual: 0"
			);
		});

		it('Text too short', () => {
			TEUtils.assertLeftMessage(
				parser('25/12'),
				"Expected remaining text for 'separator2' placeholder to start with '/'. Actual: ''"
			);
		});

		it('Wrong separator', () => {
			TEUtils.assertLeftMessage(
				parser('25|12'),
				"Expected remaining text for 'separator1' placeholder to start with '/'. Actual: '|12'"
			);
		});

		it('Same placeholder receives different values', () => {
			TEUtils.assertLeftMessage(
				parser('25/12/2025 13'),
				"'MM' placeholder is present twice in template and receives differing values '12' and '13'"
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
				separator1: '/',
				MM: CVReal.unsafeFromNumber(12),
				separator2: '/',
				yyyy: CVReal.unsafeFromNumber(2025),
				separator3: ' '
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
					readonly separator1: string;
					readonly MM: CVReal.Type;
					readonly separator2: string;
					readonly yyyy: CVReal.Type;
					readonly separator3: string;
				},
				Either.Either<string, MInputError.Type>
			>
		>() satisfies true;

		it('With correct values', () => {
			TEUtils.assertRight(
				formatter({
					dd: CVReal.unsafeFromNumber(5),
					separator1: '/',
					MM: CVReal.unsafeFromNumber(12),
					separator2: '/',
					yyyy: CVReal.unsafeFromNumber(2025),
					separator3: ' '
				}),
				'05/12/2025 12'
			);
		});

		it('With incorrect values', () => {
			TEUtils.assertLeftMessage(
				formatter({
					dd: CVReal.unsafeFromNumber(115),
					separator1: '/',
					MM: CVReal.unsafeFromNumber(12),
					separator2: '/',
					yyyy: CVReal.unsafeFromNumber(2025),
					separator3: ' '
				}),
				"Expected length of 'dd' placeholder to be at most(included): 2. Actual: 3"
			);
		});
	});
});
