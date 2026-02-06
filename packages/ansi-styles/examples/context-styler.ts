import {
  ASConstantContextStyler,
  ASContextStyler,
  ASPalette,
  ASPaletteContextStyler,
} from '@parischap/ansi-styles';

interface Value {
  readonly pos1: number;
  readonly otherStuff: string;
}

const { red }: { readonly red: ASContextStyler.Type<Value> } = ASConstantContextStyler;

const pos1 = (value: Value): number => value.pos1;

const pos1BasedAllColorsFormatter = ASPaletteContextStyler.make({
  indexFromContext: pos1,
  palette: ASPalette.allStandardOriginalColors,
});

const value1: Value = {
  pos1: 2,
  otherStuff: 'dummy',
};
const pos1BasedAllColorsFormatterInValue1Context = ASContextStyler.toStyle(
  pos1BasedAllColorsFormatter,
)(value1);
const redInValue1Context = ASContextStyler.toStyle(red)(value1);

/* Prints `foo` in red */
console.log(redInValue1Context('foo'));

/* Prints `foo` in green */
console.log(pos1BasedAllColorsFormatterInValue1Context('foo'));
