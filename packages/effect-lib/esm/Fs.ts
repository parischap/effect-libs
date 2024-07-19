import { Brand } from 'effect';

const moduleTag = '@parischap/effect-lib/TypedPath/';
type moduleTag = typeof moduleTag;

export type FileBrand = Brand.Branded<string, `${moduleTag}FileBrand`>;
export type FolderBrand = Brand.Branded<string, `${moduleTag}FolderBrand`>;
export type NameBrand = Brand.Branded<string, `${moduleTag}NameBrand`>;
export type PathBrand = Brand.Branded<string, `${moduleTag}PathBrand`>;

export type Filename = FileBrand & NameBrand;
export const Filename = Brand.nominal<Filename>();
export type Foldername = FolderBrand & NameBrand;
export const Foldername = Brand.nominal<Foldername>();
export type Filepath = FileBrand & PathBrand;
export const Filepath = Brand.nominal<Filepath>();
export type Folderpath = FolderBrand & PathBrand;
export const Folderpath = Brand.nominal<Folderpath>();
export type Name = Filename | Foldername;
export const Name = Brand.nominal<Name>();
export type Path = Filepath | Folderpath;
export const Path = Brand.nominal<Path>();
/**
 * Turns a path into a name
 * @category utils
 */
export type ToName<P extends Path> =
	readonly [P] extends readonly [Filepath] ? Filename
	: readonly [P] extends readonly [Folderpath] ? Foldername
	: Name;

/**
 * Turns a file system name into a path
 * @category utils
 */
export type ToPath<N extends Name> =
	readonly [N] extends readonly [Filename] ? Filepath
	: readonly [N] extends readonly [Foldername] ? Folderpath
	: Path;
