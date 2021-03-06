import { File, FileInfo } from "@code-engine/types";
import * as path from "path";
import { NormalizedFileInfo, normalizeFileInfo, toBuffer, validatePath } from "./normalize-file-info";

const _private = Symbol("private");


/**
 * Creats a CodeEngine `File` object.
 */
export function createFile(info: unknown, pluginName?: string): File {
  if (isFile(info)) {
    return info;
  }

  info = normalizeFileInfo(info);
  let fileProps = createFileProps(info as NormalizedFileInfo, pluginName);
  return Object.create(filePrototype, fileProps) as File;
}


/**
 * A CodeEngine `File` instance.
 * It has all the fields of a `FileInfo` object, plus private CodeEngine fields.
 */
interface CodeEngineFile extends FileInfo {
  [_private]: {
    dir: string;
    name: string;
    ext: string;
    contents: Buffer;
  };
}


/**
 * The prototype for a `CodeEngineFile` object.
 * It defines the convenience members that a `File` has in addition to a `FileInfo` object.
 */
const filePrototype = {
  get dir(): string {
    let file = this as unknown as CodeEngineFile;
    return file[_private].dir;
  },

  set dir(dir: string) {
    let file = this as unknown as CodeEngineFile;
    let { name, ext } = file[_private];
    file.path = path.format({ dir, name, ext });
  },

  get name(): string {
    let file = this as unknown as CodeEngineFile;
    let { name, ext } = file[_private];
    return name + ext;
  },

  set name(base: string) {
    let file = this as unknown as CodeEngineFile;
    let { dir } = file[_private];
    file.path = path.format({ dir, base });
  },

  get extension(): string {
    let file = this as unknown as CodeEngineFile;
    return file[_private].ext;
  },

  set extension(ext: string) {
    let file = this as unknown as CodeEngineFile;
    let { dir, name } = file[_private];
    file.path = path.format({ dir, name, ext });
  },

  get text(): string {
    let file = this as unknown as CodeEngineFile;
    return file[_private].contents.toString();
  },

  set text(text: string) {
    let file = this as unknown as CodeEngineFile;
    file.contents = Buffer.from(text);
  },

  get size(): number {
    let file = this as unknown as CodeEngineFile;
    return file[_private].contents.byteLength;
  },

  toString(): string {
    let file = this as unknown as CodeEngineFile;
    return file.path;
  },

  [Symbol.toStringTag]: "File",
};


/**
 * Creates the property descriptors for a `CodeEngineFile` instance.
 */
function createFileProps(info: NormalizedFileInfo, pluginName?: string): PropertyDescriptorMap {
  let { dir, name, ext } = path.parse(info.path);
  let contents = info.contents || Buffer.alloc(0);
  let source = info.source || createSourceURL(info.path, pluginName);
  let sourceMap = info.sourceMap || undefined;
  let createdAt = info.createdAt || new Date();
  let modifiedAt = info.modifiedAt || new Date();
  let metadata = info.metadata || {};

  return {
    [_private]: { value: { dir, name, ext, contents }},
    source: { value: source, enumerable: true },
    sourceMap: { value: sourceMap, enumerable: true },
    createdAt: { value: createdAt, writable: true, enumerable: true },
    modifiedAt: { value: modifiedAt, writable: true, enumerable: true },
    metadata: { value: metadata, writable: true, enumerable: true },
    path: { get: getPath, set: setPath, enumerable: true },
    contents: { get: getContents, set: setContents, enumerable: true },
  };
}


function getPath(this: CodeEngineFile): string {
  // NOTE: This getter is called A LOT, so we use simple concatenation rather than
  // calling `path.join()` to improve performance
  let { dir, name, ext } = this[_private];
  return dir.length === 0 ? name + ext : dir + path.sep + name + ext;
}


function setPath(this: CodeEngineFile, value: string) {
  value = validatePath(value);
  let { dir, name, ext } = path.parse(value);
  this[_private].dir = dir;
  this[_private].name = name;
  this[_private].ext = ext;
}


function getContents(this: CodeEngineFile): Buffer {
  return this[_private].contents;
}


function setContents(this: CodeEngineFile, value: Buffer) {
  this[_private].contents = toBuffer(value);
}


const illegalHostnameCharacters = /[^a-z0-9]+/ig;
const windowsPathSeparators = /\\/g;


/**
 * Creates a default `File.source` URL using the name of the plugin that created the file.
 */
function createSourceURL(relativePath: string, pluginName?: string): string {
  // Convert the plugin name to a valid host name
  pluginName = pluginName || "plugin";
  pluginName = pluginName.replace(illegalHostnameCharacters, "-");
  if (pluginName.startsWith("-")) {
    pluginName = pluginName.slice(1);
  }
  if (pluginName.endsWith("-")) {
    pluginName = pluginName.slice(0, -1);
  }

  // Convert Windows path separators to URL separators
  if (process.platform === "win32") {
    relativePath = relativePath.replace(windowsPathSeparators, "/");
  }

  // Encode special characters in each segment of the path
  relativePath = relativePath.split("/").map(encodeURIComponent).join("/");

  return `code-engine://${pluginName}/${relativePath}`;
}


/**
 * Determines whether the given value is one of our internal `File` objects.
 */
function isFile(file: unknown): file is File {
  return file && Object.getPrototypeOf(file) === filePrototype;
}
