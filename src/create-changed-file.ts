import { ChangedFile, ChangedFileInfo, FileChange } from "@code-engine/types";
import { ono } from "ono";
import { createFile } from "./create-file";
import { validate } from "./validate";
import { valuesToString } from "./values-to-string";


const fileChangeTypes = [FileChange.Created, FileChange.Modified, FileChange.Deleted];


/**
 * Creats a CodeEngine `ChangedFile` object.
 */
export function createChangedFile(info: ChangedFile | ChangedFileInfo, pluginName?: string): ChangedFile {
  let file = createFile(info) as ChangedFile;

  if (!info.change) {
    let list = valuesToString(fileChangeTypes, { conjunction: "or" });
    throw ono.type(`The type of file change must be specified (${list}).`);
  }

  file.change = validate.oneOf(info.change, fileChangeTypes, "file change");

  return file;
}
