<!-- LTeX: language=en-US -->

# Table of Contents

- [General](#general)
- [Documenting](#documenting)
  - [JSDoc comments](#jsdoc-comments)
    - [Module-level JSDoc](#module-level-jsdoc)
    - [Function-level JSDoc](#function-level-jsdoc)
      - [Bullet point patterns](#bullet-point-patterns)
      - [Type guards](#type-guards)
      - [Example block format](#example-block-format)
    - [Property- and field-level JSDoc](#property--and-field-level-jsdoc)
    

# General

Repo of libraries complementing the Effect ecosystem. Packages `effect-report`, `node-effect-lib` and `playground` are outdated and must never be handled even when the request is for the whole repo.

# Documenting

## JSDoc comments

Modules in this repo are published to NPM and need to receive more thorough documentation (except modules in `esm/internal`: can be documented normally)

### Module-level JSDoc

Brief description, "Mental model" section, "Common tasks" (linked list), "Gotchas", "Quickstart" + example, `@see`.

````ts
/**
 * Utilities for working with immutable arrays in a functional style.
 * All functions treat arrays as immutable — they return new arrays
 * rather than mutating the input.
 *
 * ## Mental model
 *
 * - **`Array<A>`** is a standard JS array. All functions return new arrays.
 * - **`NonEmptyReadonlyArray<A>`** is a readonly array guaranteed to have
 *   at least one element.
 * - Most functions are **dual** — callable as `Array.fn(array, arg)` or
 *   piped as `pipe(array, Array.fn(arg))`.
 *
 * ## Common tasks
 *
 * - **Create**: {@link make}, {@link empty}, {@link fromIterable}
 * - **Transform**: {@link map}, {@link flatMap}, {@link flatten}
 * - **Filter**: {@link filter}, {@link partition}
 *
 * ## Gotchas
 *
 * - {@link fromIterable} returns the original array reference when given
 *   an array; use {@link copy} if you need a fresh array.
 * - {@link range}(start, end) is inclusive on both ends.
 *
 * ## Quickstart
 *
 * **Example** (Basic operations)
 *
 * ```ts
 * import { Array } from "effect"
 * const nums = Array.make(1, 2, 3)
 * console.log(Array.map(nums, (n) => n * 2)) // [2, 4, 6]
 * ```
 *
 * @see {@link make} — create an array
 */
````

### Function-level JSDoc

- Exported: one-line imperative summary, bullet points (use cases, guarantees, edge cases), **Example**, `@see`, `@category`.
- Non-exported: brief description, no tag.

````ts
/**
 * Safely reads an element at the given index, returning `Option.some` or
 * `Option.none` if the index is out of bounds.
 *
 * - The index is floored to an integer.
 * - Never throws.
 * - Use when accessing an element at a potentially invalid index.
 *
 * **Example** (Safe index access)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.get([1, 2, 3], 1)) // Some(2)
 * console.log(Array.get([1, 2, 3], 10)) // None
 * ```
 *
 * @see {@link getNonEmpty} — requires non-empty array
 *
 * @category getters
 */
export const get: {
  <A>(index: number): (self: ReadonlyArray<A>) => Option.Option<A>;
  <A>(self: ReadonlyArray<A>, index: number): Option.Option<A>;
};
````

#### Bullet point patterns

- **Use cases**: "Use when...", "Useful for...", "Use if..."
- **Guarantees**: "Always returns...", "Never throws...", "Acts as a type guard..."
- **Behavior notes**: "The index is floored...", "Delegates to...", "If the input is already..."
- **Related variants**: "Prefer {@link otherFn} when..." or "Use the `*NonEmpty` variants..."

#### Type guards

Include "Acts as a type guard narrowing..." + type narrowed to.

````ts
/**
 * Tests whether a value is an `Array`.
 *
 * - Acts as a type guard narrowing the input to `Array<unknown>`.
 * - Delegates to `globalThis.Array.isArray`.
 *
 * **Example** (Type-guarding an unknown value)
 *
 * ```ts
 * import { Array } from "effect"
 * console.log(Array.isArray([1, 2, 3])) // true
 * ```
 *
 * @category guards
 */
export const isArray: ...
````

#### Example block format

- **Example** (concise description)
- Always: `import`, usage, output as comment.
- Typical happy-path.
- Use functional style per `generate-code` skill.

````ts
/**
 * **Example** (Creating a range)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.range(1, 3)
 * console.log(result) // [1, 2, 3]
 * ```
 */
````

### Property- and field-level JSDoc

Properties/fields/methods (exported or not) → short description, no tag.
