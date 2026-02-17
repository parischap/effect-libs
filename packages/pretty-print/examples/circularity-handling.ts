import * as PPOption from '@parischap/pretty-print/PPOption'
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue'
import {pipe} from 'effect'

const stringifier = PPOption.toStringifier(
  PPOption.make({ ...PPOption.utilInspectLike, maxDepth: Infinity }),
);

const circular = { a: 1 as unknown, b: { inner: 1 as unknown, circular: 1 as unknown } };
circular.a = [circular];
circular.b.inner = circular.b;
circular.b.circular = circular;

console.log(pipe(circular, stringifier, PPStringifiedValue.toAnsiString()));
