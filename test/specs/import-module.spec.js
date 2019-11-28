"use strict";

const { importModule } = require("../../");
const { assert, expect } = require("chai");
const { createDir } = require("../utils");

describe("joinIterables() function", () => {

  it("should import from the current directory by default", async () => {
    let dir = await createDir([
      { path: "node_modules/foo-bar/index.js", contents: "module.exports = { foo: 'bar' };" },
    ]);

    const ORIGINAL_CWD = process.cwd();

    try {
      process.chdir(dir);
      let exports = await importModule("foo-bar");

      expect(exports).to.deep.equal({ foo: "bar" });
    }
    finally {
      process.chdir(ORIGINAL_CWD);
    }
  });

  it("should import a CommonJS module", async () => {
    let dir = await createDir([
      { path: "node_modules/foo-bar/index.js", contents: "module.exports = { foo: 'bar' };" },
    ]);

    let exports = await importModule("foo-bar", dir);

    expect(exports).to.deep.equal({ foo: "bar" });
  });

  it("should import an ESM module", async () => {
    let dir = await createDir([
      { path: "node_modules/foo-bar/index.js", contents: "exports.foo = 'bar';\n\nexports.default = 'foobar';" },
    ]);

    let exports = await importModule("foo-bar", dir);

    expect(exports).to.deep.equal({
      foo: "bar",
      default: "foobar",
    });
  });

  it("should import a CommonJS module that exports a falsy value", async () => {
    let dir = await createDir([
      { path: "node_modules/foo-bar/index.js", contents: "module.exports = false;" },
    ]);

    let exports = await importModule("foo-bar", dir);

    expect(exports).to.deep.equal({ default: false });
  });

  it("should import an ESM module that exports a falsy value", async () => {
    let dir = await createDir([
      { path: "node_modules/foo-bar/index.js", contents: "exports.default = false;" },
    ]);

    let exports = await importModule("foo-bar", dir);

    expect(exports).to.deep.equal({ default: false });
  });

  it("should throw an error if the package doesn't exist", async () => {
    try {
      await importModule("foo-bar");
      assert.fail("An error should have been thrown!");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal('Cannot find module "foo-bar" in the local path or as a globally-installed package.');
      expect(error.workerId).to.equal(0);
      expect(error.moduleId).to.equal("foo-bar");
    }
  });

});
