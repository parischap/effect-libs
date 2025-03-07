/* eslint-disable functional/no-expression-statements */
import { PPOption, PPStringifiedValue } from '@parischap/pretty-print';
import { pipe } from 'effect';

const stringifier = PPOption.toStringifier(
	PPOption.make({ ...PPOption.utilInspectLike, maxDepth: +Infinity })
);

const circular = { a: 1 as unknown, b: { inner: 1 as unknown, circular: 1 as unknown } };
/* eslint-disable functional/immutable-data */
circular.a = [circular];
circular.b.inner = circular.b;
circular.b.circular = circular;
/* eslint-enable functional/immutable-data*/

console.log(pipe(circular, stringifier, PPStringifiedValue.toAnsiString()));
