import { stringify } from "@code-engine/stringify";
import { ChangedFile, ChangedFileInfo, FileChange } from "@code-engine/types";
import { validate } from "@code-engine/validate";
import { ono } from "ono";
import { createFile } from "./create-file";


const fileChangeTypes = [FileChange.Created, FileChange.Modified, FileChange.Deleted];


/**
 * Creats a CodeEngine `ChangedFile` object.
 */
export function createChangedFile(info: ChangedFile | ChangedFileInfo, pluginName?: string): ChangedFile {
  let file = createFile(info) as ChangedFile;

  if (!info.change) {
    let list = stringify.values(fileChangeTypes, { conjunction: "or" });
    throw ono.type(`The type of file change must be specified (${list}).`);
  }

  file.change = validate.value.oneOf(info.change, fileChangeTypes, "file change");

  return file;
}
