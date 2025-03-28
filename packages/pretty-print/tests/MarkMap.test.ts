/* eslint-disable functional/no-expression-statements */
import { PPMarkMap } from '@parischap/pretty-print';
import { Equal } from 'effect';
import { describe, it } from 'vitest';

describe('MarkMap', () => {
	const utilInspectLike = PPMarkMap.utilInspectLike;

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), PPMarkMap.moduleTag);
		});

		describe('Equal.equals', () => {
			const dummy = PPMarkMap.make(utilInspectLike);
			it('Matching', () => {
				TEUtils.assertTrue(Equal.equals(utilInspectLike, dummy));
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(Equal.equals(utilInspectLike, PPMarkMap.defaultsHideNullables));
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(utilInspectLike.toString(), `Defaults`);
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(utilInspectLike.pipe(PPMarkMap.id), 'Defaults');
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
