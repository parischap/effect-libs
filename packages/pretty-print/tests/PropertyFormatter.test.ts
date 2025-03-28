/* eslint-disable functional/no-expression-statements */
import { ASStyle, ASText } from '@parischap/ansi-styles';
import {
	PPMarkShowerConstructor,
	PPNonPrimitiveFormatter,
	PPOption,
	PPPropertyFormatter,
	PPStringifiedValue,
	PPValue,
	PPValueBasedStylerConstructor
} from '@parischap/pretty-print';
import { Array, Equal, Function, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('PropertyFormatter', () => {
	const utilInspectLike = PPOption.darkModeUtilInspectLike;
	const valueBasedStylerConstructor = PPValueBasedStylerConstructor.fromOption(utilInspectLike);
	const markShowerConstructor = PPMarkShowerConstructor.fromOption(utilInspectLike);
	const nonPrimitiveOption = PPOption.NonPrimitive.maps('Foo');
	const constructors = {
		valueBasedStylerConstructor,
		markShowerConstructor
	};
	const valueOnly = PPPropertyFormatter.valueOnly;

	const stringified = pipe('1', ASText.fromString, PPStringifiedValue.fromText);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.strictEqual(
				PPPropertyFormatter.moduleTag,
				TEUtils.moduleTagFromTestFilePath(__filename)
			);
		});

		describe('Equal.equals', () => {
			const dummy = PPPropertyFormatter.make({
				id: 'ValueOnly',
				action: () => () => () => PPStringifiedValue.empty
			});
			it('Matching', () => {
				TEUtils.assertTrue(Equal.equals(valueOnly, dummy));
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(Equal.equals(valueOnly, PPPropertyFormatter.keyAndValue));
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(valueOnly.toString(), `ValueOnly`);
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(valueOnly.pipe(PPPropertyFormatter.id), 'ValueOnly');
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(PPPropertyFormatter.has(valueOnly));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(PPPropertyFormatter.has(new Date()));
			});
		});
	});

	it('valueOnly', () => {
		const valueOnlyFormatter = PPPropertyFormatter.valueOnly.call(nonPrimitiveOption, constructors);
		TEUtils.strictEqual(
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
			),
			pipe('1', ASStyle.none, PPStringifiedValue.fromText, PPStringifiedValue.toAnsiString())
		);
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
			TEUtils.strictEqual(
				pipe(
					keyAndValueFormatter({ value: PPValue.fromTopValue(1), isLeaf: false }),
					Function.apply(stringified),
					PPStringifiedValue.toAnsiString()
				),
				pipe('1', ASStyle.none, PPStringifiedValue.fromText, PPStringifiedValue.toAnsiString())
			);
		});

		it('With one-line key at protoDepth=0', () => {
			TEUtils.strictEqual(
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
				),
				pipe(
					ASStyle.none(ASStyle.red('a'), ASStyle.white(' => '), '1'),
					PPStringifiedValue.fromText,
					PPStringifiedValue.toAnsiString()
				)
			);
		});

		it('With one-line key at protoDepth=2', () => {
			TEUtils.strictEqual(
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
				),
				pipe(
					ASStyle.none(ASStyle.red('a'), ASStyle.green('@@'), ASStyle.white(' => '), '1'),
					PPStringifiedValue.fromText,
					PPStringifiedValue.toAnsiString()
				)
			);
		});

		it('With multi-line key and multiline value', () => {
			TEUtils.strictEqual(
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
				),
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
				TEUtils.deepStrictEqual(
					pipe(
						treeifyFormatter({ value: PPValue.fromTopValue(1), isLeaf: false }),
						Function.apply(stringified),
						PPStringifiedValue.toUnstyledStrings
					),
					['1']
				);
			});

			it('isLeaf=true', () => {
				TEUtils.deepStrictEqual(
					pipe(
						treeifyFormatter({ value: PPValue.fromTopValue(1), isLeaf: true }),
						Function.apply(stringified),
						PPStringifiedValue.toUnstyledStrings
					),
					['1']
				);
			});
		});

		describe('With one-line key at protoDepth=0', () => {
			it('isLeaf=false', () => {
				TEUtils.deepStrictEqual(
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
					),
					['a', '1']
				);
			});

			it('isLeaf=true', () => {
				TEUtils.deepStrictEqual(
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
					),
					['a => 1']
				);
			});
		});
	});
});
