/* eslint-disable functional/no-expression-statements */
import { ASStyle, ASText } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import {
	PPMarkShowerConstructor,
	PPNonPrimitiveFormatter,
	PPOption,
	PPPropertyFormatter,
	PPStringifiedValue,
	PPValue,
	PPValueBasedFormatterConstructor
} from '@parischap/pretty-print';
import { Array, Equal, Function, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('PropertyFormatter', () => {
	const utilInspectLike = PPOption.darkModeUtilInspectLike;
	const valueBasedFormatterConstructor =
		PPValueBasedFormatterConstructor.fromOption(utilInspectLike);
	const markShowerConstructor = PPMarkShowerConstructor.fromOption(utilInspectLike);
	const nonPrimitiveOption = PPOption.NonPrimitive.maps('Foo');
	const constructors = {
		valueBasedFormatterConstructor,
		markShowerConstructor
	};
	const valueOnly = PPPropertyFormatter.valueOnly;

	const stringified = pipe('1', ASText.fromString, PPStringifiedValue.fromText);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(PPPropertyFormatter.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			const dummy = PPPropertyFormatter.make({
				id: 'ValueOnly',
				action: () => () => () => PPStringifiedValue.empty
			});
			it('Matching', () => {
				expect(Equal.equals(valueOnly, dummy)).toBe(true);
			});

			it('Non-matching', () => {
				expect(Equal.equals(valueOnly, PPPropertyFormatter.keyAndValue)).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(valueOnly.toString()).toBe(`ValueOnly`);
		});

		it('.pipe()', () => {
			expect(valueOnly.pipe(PPPropertyFormatter.id)).toBe('ValueOnly');
		});

		describe('has', () => {
			it('Matching', () => {
				expect(PPPropertyFormatter.has(valueOnly)).toBe(true);
			});
			it('Non matching', () => {
				expect(PPPropertyFormatter.has(new Date())).toBe(false);
			});
		});
	});

	it('valueOnly', () => {
		const valueOnlyFormatter = PPPropertyFormatter.valueOnly.call(nonPrimitiveOption, constructors);
		expect(
			pipe(
				valueOnlyFormatter({
					value: PPValue.fromNonPrimitiveValueAndKey({
						nonPrimitiveContent: { a: 1, b: 'foo' },
						key: 'a',
						depth: 1,
						protoDepth: 0
					}),
					isLeaf: false
				}),
				Function.apply(stringified),
				PPStringifiedValue.toAnsiString()
			)
		).toBe(pipe('1', ASStyle.none, PPStringifiedValue.fromText, PPStringifiedValue.toAnsiString()));
	});

	describe('keyAndValue', () => {
		const keyAndValueFormatter = PPPropertyFormatter.keyAndValue.call(
			nonPrimitiveOption,
			constructors
		);
		const tabifiedKeyAndValueFormatter = PPPropertyFormatter.keyAndValue.call(
			PPOption.NonPrimitive.make({
				...nonPrimitiveOption,
				nonPrimitiveFormatter: PPNonPrimitiveFormatter.tabify
			}),
			constructors
		);
		it('With empty key', () => {
			expect(
				pipe(
					keyAndValueFormatter({ value: PPValue.fromTopValue(1), isLeaf: false }),
					Function.apply(stringified),
					PPStringifiedValue.toAnsiString()
				)
			).toBe(
				pipe('1', ASStyle.none, PPStringifiedValue.fromText, PPStringifiedValue.toAnsiString())
			);
		});

		it('With one-line key at protoDepth=0', () => {
			expect(
				pipe(
					keyAndValueFormatter({
						value: PPValue.fromNonPrimitiveValueAndKey({
							nonPrimitiveContent: { a: 1, b: 'foo' },
							key: 'a',
							depth: 1,
							protoDepth: 0
						}),
						isLeaf: false
					}),
					Function.apply(stringified),
					PPStringifiedValue.toAnsiString()
				)
			).toBe(
				pipe(
					ASStyle.none(ASStyle.red('a'), ASStyle.white(' => '), '1'),
					PPStringifiedValue.fromText,
					PPStringifiedValue.toAnsiString()
				)
			);
		});

		it('With one-line key at protoDepth=2', () => {
			expect(
				pipe(
					keyAndValueFormatter({
						value: PPValue.fromNonPrimitiveValueAndKey({
							nonPrimitiveContent: { a: 1, b: 'foo' },
							key: 'a',
							depth: 1,
							protoDepth: 2
						}),
						isLeaf: false
					}),
					Function.apply(stringified),
					PPStringifiedValue.toAnsiString()
				)
			).toBe(
				pipe(
					ASStyle.none(ASStyle.red('a'), ASStyle.green('@@'), ASStyle.white(' => '), '1'),
					PPStringifiedValue.fromText,
					PPStringifiedValue.toAnsiString()
				)
			);
		});

		it('With multi-line key and multiline value', () => {
			expect(
				pipe(
					tabifiedKeyAndValueFormatter({
						value: PPValue.fromIterable({
							content: { c: 3, d: 4 },
							stringKey: ['{', '  c : 3,', '  d : 4', '}'],
							depth: 1
						}),
						isLeaf: false
					}),
					Function.apply(
						Array.make(
							ASText.fromString('{'),
							ASText.fromString('  a : 1,'),
							ASText.fromString('  b : 2'),
							ASText.fromString('}')
						)
					),
					PPStringifiedValue.toAnsiString()
				)
			).toBe(
				pipe(
					Array.make(
						ASStyle.red('{'),
						ASStyle.red('  c : 3,'),
						ASStyle.red('  d : 4'),
						ASStyle.none(ASStyle.red('}'), ASStyle.white(' => '), '{'),
						ASStyle.none('  a : 1,'),
						ASStyle.none('  b : 2'),
						ASStyle.none('}')
					),
					PPStringifiedValue.toAnsiString()
				)
			);
		});
	});

	describe('treeify', () => {
		const treeifyFormatter = PPPropertyFormatter.treeify.call(nonPrimitiveOption, constructors);

		describe('With empty key', () => {
			it('isLeaf=false', () => {
				expect(
					pipe(
						treeifyFormatter({ value: PPValue.fromTopValue(1), isLeaf: false }),
						Function.apply(stringified),
						PPStringifiedValue.toUnstyledStrings
					)
				).toStrictEqual(['1']);
			});

			it('isLeaf=true', () => {
				expect(
					pipe(
						treeifyFormatter({ value: PPValue.fromTopValue(1), isLeaf: true }),
						Function.apply(stringified),
						PPStringifiedValue.toUnstyledStrings
					)
				).toStrictEqual(['1']);
			});
		});

		describe('With one-line key at protoDepth=0', () => {
			it('isLeaf=false', () => {
				expect(
					pipe(
						treeifyFormatter({
							value: PPValue.fromNonPrimitiveValueAndKey({
								nonPrimitiveContent: { a: 1, b: 'foo' },
								key: 'a',
								depth: 1,
								protoDepth: 0
							}),
							isLeaf: false
						}),
						Function.apply(stringified),
						PPStringifiedValue.toUnstyledStrings
					)
				).toStrictEqual(['a', '1']);
			});

			it('isLeaf=true', () => {
				expect(
					pipe(
						treeifyFormatter({
							value: PPValue.fromNonPrimitiveValueAndKey({
								nonPrimitiveContent: { a: 1, b: 'foo' },
								key: 'a',
								depth: 1,
								protoDepth: 0
							}),
							isLeaf: true
						}),
						Function.apply(stringified),
						PPStringifiedValue.toUnstyledStrings
					)
				).toStrictEqual(['a => 1']);
			});
		});
	});
});
