import { stringify } from "@code-engine/stringify";
import { AnyContents, FileInfo, FileMetadata, SourceMap } from "@code-engine/types";
import { ono } from "ono";
import * as path from "path";

/**
 * Normalizes a `FileInfo` object so each of its fields is a known type.
 */
export function normalizeFileInfo(info: unknown): NormalizedFileInfo {
  if (!isFileInfo(info)) {
    throw ono.type(`Invalid CodeEngine file: ${stringify(info)}. Expected an object with at least a "path" property.`);
  }

  let normalized: NormalizedFileInfo = {
    path: validatePath(info.path),
  };

  if (info.contents || info.text) {
    normalized.contents = toBuffer(info.contents || info.text);
  }

  info.source && (normalized.source = String(info.source));
  info.sourceMap && (normalized.sourceMap = info.sourceMap);
  info.createdAt && (normalized.createdAt = info.createdAt);
  info.modifiedAt && (normalized.modifiedAt = info.modifiedAt);
  info.metadata && (normalized.metadata = info.metadata);

  return normalized;
}


/**
 * A normalized `FileInfo` object, where each field is a known type.
 */
export interface NormalizedFileInfo {
  path: string;
  plugin?: string;
  source?: string;
  sourceMap?: SourceMap;
  createdAt?: Date;
  modifiedAt?: Date;
  metadata?: FileMetadata;
  contents?: Buffer;
}


/**
 * Validates a `File` path.
 * @internal
 */
export function validatePath(value: string): string {
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
 * @internal
 */
export function toBuffer(value?: AnyContents): Buffer {
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
    throw ono.type(error, `Invalid file contents: ${stringify(value)}`);
  }
}


/**
 * Determines whether the given value is a `FileInfo` object.
 */
function isFileInfo(info: unknown): info is FileInfo {
  return info && typeof info === "object" && typeof (info as FileInfo).path === "string";
}
