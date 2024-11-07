import { Transformer } from '@parischap/templater';
import { pipe } from 'effect';

const unsignedInt = Transformer.unsignedInt('.');
const a = pipe('107.485foo and bar', unsignedInt.read);
console.log(a);
