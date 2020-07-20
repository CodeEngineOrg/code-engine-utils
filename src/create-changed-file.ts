import { ChangedFile, ChangedFileInfo, FileChange } from "@code-engine/types";
import { assert } from "@jsdevtools/assert";
import { humanize } from "@jsdevtools/humanize-anything";
import { ono } from "@jsdevtools/ono";
import { createFile } from "./create-file";


const fileChangeTypes = [FileChange.Created, FileChange.Modified, FileChange.Deleted];


/**
 * Creats a CodeEngine `ChangedFile` object.
 */
export function createChangedFile(info: unknown, pluginName?: string): ChangedFile {
  let file = createFile(info, pluginName) as ChangedFile;
  let fileInfo = info as ChangedFileInfo;

  if (!fileInfo.change) {
    let list = humanize.values(fileChangeTypes, { conjunction: "or" });
    throw ono.type(`The type of file change must be specified (${list}).`);
  }

  file.change = assert.value.oneOf(fileInfo.change, fileChangeTypes, "file change");

  return file;
}
