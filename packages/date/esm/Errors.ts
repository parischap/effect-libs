import { Data } from 'effect';

/* eslint-disable-next-line @typescript-eslint/ban-types */
export class MissingData extends Data.TaggedError('MissingData')<{}> {}
