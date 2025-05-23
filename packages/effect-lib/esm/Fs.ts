/** A module that applies the concept of branding to filepaths */

import { Brand } from 'effect';

/**
 * Module tag
 *
 * @category Module tag
 */
export const moduleTag = '@parischap/effect-lib/Fs/';
type moduleTag = typeof moduleTag;

/**
 * Brand that represents a file
 *
 * @category Branding
 */
export type FileBrand = Brand.Branded<string, `${moduleTag}FileBrand`>;

/**
 * Brand that represents a folder
 *
 * @category Branding
 */
export type FolderBrand = Brand.Branded<string, `${moduleTag}FolderBrand`>;

/**
 * Brand that represents a name
 *
 * @category Branding
 */
export type NameBrand = Brand.Branded<string, `${moduleTag}NameBrand`>;

/**
 * Brand that represents a path
 *
 * @category Branding
 */
export type PathBrand = Brand.Branded<string, `${moduleTag}PathBrand`>;

/**
 * Brand that represents a filename
 *
 * @category Branding
 */
export type Filename = FileBrand & NameBrand;

/**
 * Filename constructor
 *
 * @category Constructors
 */
export const Filename = Brand.nominal<Filename>();

/**
 * Brand that represents a foldername
 *
 * @category Branding
 */
export type Foldername = FolderBrand & NameBrand;

/**
 * Foldername constructor
 *
 * @category Constructors
 */
export const Foldername = Brand.nominal<Foldername>();

/**
 * Brand that represents a file path
 *
 * @category Branding
 */
export type Filepath = FileBrand & PathBrand;

/**
 * Filename constructor
 *
 * @category Constructors
 */
export const Filepath = Brand.nominal<Filepath>();

/**
 * Brand that represents a folder path
 *
 * @category Branding
 */
export type Folderpath = FolderBrand & PathBrand;

/**
 * Folder path constructor
 *
 * @category Constructors
 */
export const Folderpath = Brand.nominal<Folderpath>();

/**
 * Brand that represents a filename or a folder name
 *
 * @category Branding
 */
export type Name = Filename | Foldername;

/**
 * Name constructor
 *
 * @category Constructors
 */
export const Name = Brand.nominal<Name>();

/**
 * Brand that represents a file path or a folder path
 *
 * @category Branding
 */
export type Path = Filepath | Folderpath;

/**
 * Path constructor
 *
 * @category Constructors
 */
export const Path = Brand.nominal<Path>();

/**
 * Type utility that turns a path into a name
 *
 * @category Utility types
 */
export type ToName<P extends Path> =
	readonly [P] extends readonly [Filepath] ? Filename
	: readonly [P] extends readonly [Folderpath] ? Foldername
	: Name;

/**
 * Type utility that turns a file system name into a path
 *
 * @category Utility types
 */
export type ToPath<N extends Name> =
	readonly [N] extends readonly [Filename] ? Filepath
	: readonly [N] extends readonly [Foldername] ? Folderpath
	: Path;
