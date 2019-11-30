"use strict";

const { resolveModule } = require("../../");
const { expect } = require("chai");
const { createDir } = require("../utils");
const { join } = require("path");

describe("resolveModule() function", () => {

  it("should resolve from the current directory by default", async () => {
    let dir = await createDir([
      { path: "node_modules/foo-bar/index.js", contents: "module.exports = { foo: 'bar' };" },
    ]);

    const ORIGINAL_CWD = process.cwd();

    try {
      process.chdir(dir);
      let path = await resolveModule("foo-bar");

      expect(path).to.equal(join(dir, "node_modules/foo-bar/index.js"));
    }
    finally {
      process.chdir(ORIGINAL_CWD);
    }
  });

  it("should resolve from the specified directory", async () => {
    let dir = await createDir([
      { path: "node_modules/foo-bar/index.js", contents: "module.exports = { foo: 'bar' };" },
    ]);

    let path = await resolveModule("foo-bar", dir);

    expect(path).to.equal(join(dir, "node_modules/foo-bar/index.js"));
  });

  it("should resolve the path from the package.json file instead of index.js", async () => {
    let dir = await createDir([
      { path: "node_modules/foo-bar/package.json", contents: '{ "main": "lib/foobar.js" }' },
      { path: "node_modules/foo-bar/index.js", contents: "module.exports = { wrong: 'file' };" },
      { path: "node_modules/foo-bar/lib/foobar.js", contents: "module.exports = { foo: 'bar' };" },
    ]);

    let path = await resolveModule("foo-bar", dir);

    expect(path).to.equal(join(dir, "node_modules/foo-bar/lib/foobar.js"));
  });

  it("should return undefined if the package doesn't exist", async () => {
    let path = await resolveModule("foo-bar");
    expect(path).to.equal(undefined);
  });

});
