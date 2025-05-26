/* eslint-disable functional/no-expression-statements */
import { PPMarkMap } from '@parischap/pretty-print';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('MarkMap', () => {
	const utilInspectLike = PPMarkMap.utilInspectLike;

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), PPMarkMap.moduleTag);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertEquals(utilInspectLike, PPMarkMap.make(utilInspectLike));
			});

			it('Non-matching', () => {
				TEUtils.assertNotEquals(
					utilInspectLike,
					PPMarkMap.make({ ...utilInspectLike, id: 'Dummy' })
				);
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(utilInspectLike.toString(), `UtilInspectLike`);
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(utilInspectLike.pipe(PPMarkMap.id), 'UtilInspectLike');
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(PPMarkMap.has(utilInspectLike));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(PPMarkMap.has(new Date()));
			});
		});
	});
});
