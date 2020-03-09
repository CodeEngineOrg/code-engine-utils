import { ono } from "@jsdevtools/ono";
import * as resolveFrom from "resolve-from";
import * as resolveGlobal from "resolve-global";

/**
 * CommonJS or ECMAScript module exports.
 */
export interface ModuleExports {
  default?: unknown;
  [name: string]: unknown;
}

/**
 * Resolves the entry-file path of the specified JavaScript module, either from the specified
 * path or a globally-installed NPM package.
 *
 * @param moduleId - The name or path of the module to resolve
 * @param [cwd] - The directory to start searching for the module
 */
export function resolveModule(moduleId: string, cwd = process.cwd()): string | undefined {
  return resolveFrom.silent(cwd, moduleId) || resolveGlobal.silent(moduleId);
}

/**
 * Imports the specified JavaScript module, either from the specified
 * path or a globally-installed NPM package.
 *
 * @param moduleId - The name or path of the module to import
 * @param [cwd] - The directory to start searching for the module
 */
export async function importModule(moduleId: string, cwd?: string): Promise<ModuleExports> {
  let modulePath = resolveModule(moduleId, cwd);

  if (!modulePath) {
    throw ono({ moduleId }, `Cannot find module: ${moduleId}`);
  }

  let exports = await import(modulePath);

  if (exports && typeof exports === "object") {
    return exports as ModuleExports;
  }
  else {
    return { default: exports };
  }
}
