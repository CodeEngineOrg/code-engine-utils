import { AnyContents, File, FileInfo } from "@code-engine/types";
import { ono } from "ono";
import * as path from "path";
import { valueToString } from "./value-to-string";

const _private = Symbol("private");


/**
 * Creats a CodeEngine `File` object.
 */
export function createFile(info: File | FileInfo, pluginName?: string): File;
export function createFile(path: string, pluginName?: string): File;
export function createFile(arg: File | FileInfo | string, pluginName?: string): File {
  if (isFile(arg)) {
    return arg;
  }

  let fileProps = createFileProps(arg, pluginName);
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
  get dir(this: CodeEngineFile): string {
    return this[_private].dir;
  },

  set dir(this: CodeEngineFile, dir: string) {
    let { name, ext } = this[_private];
    this.path = path.format({ dir, name, ext });
  },

  get name(this: CodeEngineFile): string {
    let { name, ext } = this[_private];
    return name + ext;
  },

  set name(this: CodeEngineFile, base: string) {
    let { dir } = this[_private];
    this.path = path.format({ dir, base });
  },

  get extension(this: CodeEngineFile): string {
    return this[_private].ext;
  },

  set extension(this: CodeEngineFile, ext: string) {
    let { dir, name } = this[_private];
    this.path = path.format({ dir, name, ext });
  },

  get text(this: CodeEngineFile): string {
    return this[_private].contents.toString();
  },

  set text(this: CodeEngineFile, text: string) {
    this.contents = Buffer.from(text);
  },

  get size(this: CodeEngineFile): number {
    return this[_private].contents.byteLength;
  },

  toString(this: CodeEngineFile): string {
    return this.path;
  },

  [Symbol.toStringTag]: "File",
};


/**
 * Creates the property descriptors for a `CodeEngineFile` instance.
 */
function createFileProps(props: File | FileInfo | string, pluginName?: string): PropertyDescriptorMap {
  if (typeof props === "string") {
    props = { path: props };
  }

  if (!props || typeof props !== "object" || typeof props.path !== "string") {
    throw ono.type(`Invalid CodeEngine file: ${valueToString(props)}. Expected an object with at least a "path" property.`);
  }

  let filePath = validatePath(props.path);
  let { dir, name, ext } = path.parse(filePath);
  let contents = toBuffer(props.contents === undefined ? props.text : props.contents);
  let source = props.source ? String(props.source) : createSourceURL(filePath, pluginName);
  let createdAt = props.createdAt || new Date();
  let modifiedAt = props.modifiedAt || new Date();
  let metadata = props.metadata || {};

  return {
    [_private]: { value: { dir, name, ext, contents }},
    source: { value: source, enumerable: true },
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


/**
 * Determines whether the given file is one of our internal `File` objects.
 */
function isFile(file: unknown): file is File {
  return file && Object.getPrototypeOf(file) === filePrototype;
}


/**
 * Validates a `File` path.
 */
function validatePath(value: string): string {
  if (!value) {
    throw ono("The file path must be specified.");
  }

  let normalizedPath = path.normalize(value);

  if (path.isAbsolute(normalizedPath)) {
    throw ono({ path: value }, `File paths must be relative, not absolute: ${value}`);
  }

  return normalizedPath;
}


/**
 * Converts any valid `FileInfo` content type to a `Buffer`.
 */
function toBuffer(value?: AnyContents): Buffer {
  try {
    if (value === null || value === undefined) {
      return Buffer.alloc(0);
    }
    else if (Buffer.isBuffer(value)) {
      return value;
    }
    else {
      return Buffer.from(value as string);
    }
  }
  catch (error) {
    throw ono.type(error, `Invalid file contents: ${valueToString(value)}`);
  }
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
