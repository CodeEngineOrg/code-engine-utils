"use strict";

const { createChangedFile } = require("../../lib");
const { expect } = require("chai");
const path = require("path");
const isValidFile = require("../utils/is-valid-file");

describe("createChangedFile() function", () => {

  function isValidChangedFile (file) {
    isValidFile(file);
    expect(file.change).to.be.oneOf(["created", "modified", "deleted"]);
    return true;
  }

  it("can be called with new", () => {
    // eslint-disable-next-line new-cap
    let file = new createChangedFile({ path: "path/to/my/file.txt", change: "created" });
    expect(file).to.satisfy(isValidChangedFile);
    expect(file.change).to.equal("created");
  });

  it("can be called with an object with a path property", () => {
    let file = createChangedFile({ path: "path/to/my/file.txt", change: "modified" });
    expect(file).to.satisfy(isValidChangedFile);
    expect(file.change).to.equal("modified");
  });

  it("should use the plugin name for the source URL", () => {
    let file = createChangedFile(
      {
        path: "file.txt",
        change: "modified",
      },
      "My Cool Plugin"
    );

    expect(file).to.satisfy(isValidChangedFile);
    expect(file.change).to.equal("modified");
    expect(file.source).to.equal("code-engine://My-Cool-Plugin/file.txt");
  });

  it("should set custom metadata", () => {
    let file = createChangedFile({
      path: "file.txt",
      change: "modified",
      metadata: {
        change: "updated",
        foo: true,
        bar: 5,
      }
    });

    expect(file).to.satisfy(isValidChangedFile);
    expect(file.change).to.equal("modified");
    expect(file.metadata).to.deep.equal({
      change: "updated",
      foo: true,
      bar: 5,
    });
  });

  it("should ignore unknown properties", () => {
    let file = createChangedFile({
      path: "my/directory/file.txt",
      change: "deleted",
      createdAt: new Date("2005-05-15T05:15:25.035Z"),
      modifiedAt: new Date("2006-06-16T06:16:26.036Z"),
      dir: "xxxxx",
      name: "yyyyy",
      extension: "zzzzz",
      foo: true,
      bar: 5
    });

    expect(file).to.satisfy(isValidChangedFile);
    expect(file.change).to.equal("deleted");
    expect(file.source).to.equal("code-engine://plugin/my/directory/file.txt");
    expect(file.path).to.equal(path.normalize("my/directory/file.txt"));
    expect(file.createdAt.toISOString()).to.equal("2005-05-15T05:15:25.035Z");
    expect(file.modifiedAt.toISOString()).to.equal("2006-06-16T06:16:26.036Z");

    // The "dir", "name", and "extension" should be set by the "path"
    expect(file.dir).to.equal(path.normalize("my/directory"));
    expect(file.name).to.equal("file.txt");
    expect(file.extension).to.equal(".txt");

    // The unknown properties should not be copied to the File
    expect(file.foo).to.equal(undefined);
    expect(file.bar).to.equal(undefined);
    expect(file).not.to.have.any.keys("foo", "bar");

    // They also should not be copied to the metadata
    expect(file.metadata).to.deep.equal({});
  });

  it("should return the same instance if the argument is already a File", () => {
    let fileInfo = { path: "path/to/my/file.txt", change: "created" };
    let file1 = createChangedFile(fileInfo);
    let file2 = createChangedFile(file1);

    expect(file1).not.to.equal(fileInfo);
    expect(file2).not.to.equal(fileInfo);
    expect(file1).to.equal(file2);            // Same instance
  });

  it("should return a new instance if the argument is a spread File", () => {
    let fileInfo = { path: "path/to/my/file.txt", change: "created" };
    let file1 = createChangedFile(fileInfo);
    let file2 = createChangedFile({ ...file1 });

    expect(file1).not.to.equal(fileInfo);
    expect(file2).not.to.equal(fileInfo);
    expect(file1).not.to.equal(file2);        // Different instances
    expect(file1).to.deep.equal(file2);       // Same values
  });

  it("should work with Object.assign()", () => {
    let file = createChangedFile({
      path: "path/to/file.txt",
      change: "modified",
      createdAt: new Date("2001-01-01T01:01:01.001Z"),
      modifiedAt: new Date("2002-02-02T02:02:02.002Z"),
      contents: "hello, world",
      metadata: { foo: "bar" },
      sourceMap: { file: "file.txt" },
    });

    let pojo = Object.assign(
      { a: "A", change: "created" },
      file,
      { b: "B", change: "deleted" }
    );

    // The POJO should have all properties of the 3 objects, merged together.
    expect(pojo).to.deep.equal({
      path: path.normalize("path/to/file.txt"),
      change: "deleted",
      createdAt: new Date("2001-01-01T01:01:01.001Z"),
      modifiedAt: new Date("2002-02-02T02:02:02.002Z"),
      source: "code-engine://plugin/path/to/file.txt",
      contents: Buffer.from("hello, world"),
      metadata: { foo: "bar" },
      sourceMap: { file: "file.txt" },
      a: "A",
      b: "B",
    });
  });

  it("should work with the spread operator", () => {
    let file = createChangedFile({
      path: "path/to/file.txt",
      change: "modified",
      createdAt: new Date("2001-01-01T01:01:01.001Z"),
      modifiedAt: new Date("2002-02-02T02:02:02.002Z"),
      contents: "hello, world",
      metadata: { foo: "bar" },
      sourceMap: { file: "file.txt" },
    });

    let pojo = {
      a: "A",
      change: "created",
      ...file,
      b: "B",
      change: "deleted",    // eslint-disable-line no-dupe-keys
    };

    // The POJO should have all properties of the 3 objects, merged together.
    expect(pojo).to.deep.equal({
      path: path.normalize("path/to/file.txt"),
      change: "deleted",
      createdAt: new Date("2001-01-01T01:01:01.001Z"),
      modifiedAt: new Date("2002-02-02T02:02:02.002Z"),
      source: "code-engine://plugin/path/to/file.txt",
      contents: Buffer.from("hello, world"),
      metadata: { foo: "bar" },
      sourceMap: { file: "file.txt" },
      a: "A",
      b: "B",
    });
  });

  it("should support toString()", () => {
    expect(createChangedFile({ path: "file.txt", change: "created" }).toString()).to.equal("file.txt");
    expect(Object.prototype.toString.call(createChangedFile({ path: "file.txt", change: "created" }))).to.equal("[object File]");

    expect(createChangedFile({ path: "path/to/my/file.txt", change: "deleted" }).toString()).to.equal(path.normalize("path/to/my/file.txt"));
    expect(Object.prototype.toString.call(createChangedFile({ path: "path/to/my/file.txt", change: "deleted" }))).to.equal("[object File]");
  });

  it("should support JSON.stringify()", () => {
    let file = createChangedFile({
      path: "path/to/file.txt",
      change: "modified",
      metadata: {
        foo: "bar",
      },
      sourceMap: { file: "file.txt" },
      contents: "hello, world",
    });

    let json = JSON.parse(JSON.stringify(file));

    expect(json).to.deep.equal({
      path: path.normalize("path/to/file.txt"),
      change: "modified",
      source: "code-engine://plugin/path/to/file.txt",
      createdAt: file.createdAt.toISOString(),
      modifiedAt: file.modifiedAt.toISOString(),
      metadata: {
        foo: "bar",
      },
      sourceMap: { file: "file.txt" },
      contents: {
        type: "Buffer",
        data: [104, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100],
      }
    });
  });

  it("should throw an error if called without any arguments", () => {
    function noArgs () {
      return createChangedFile();
    }

    expect(noArgs).to.throw(TypeError);
    expect(noArgs).to.throw("Invalid CodeEngine file: undefined. Expected an object with at least a \"path\" property.");
  });

  it("should throw an error if called with an empty object", () => {
    function emptyObj () {
      return createChangedFile({});
    }

    expect(emptyObj).to.throw(TypeError);
    expect(emptyObj).to.throw("Invalid CodeEngine file: {}. Expected an object with at least a \"path\" property.");
  });

  it("should throw an error if called with an empty string", () => {
    function emptyString () {
      return createChangedFile("");
    }

    expect(emptyString).to.throw(Error);
    expect(emptyString).to.throw("Invalid CodeEngine file: \"\". Expected an object with at least a \"path\" property.");
  });

  it("should throw an error if called with an invalid argument", () => {
    function invalidArg () {
      return createChangedFile(12345);
    }

    expect(invalidArg).to.throw(TypeError);
    expect(invalidArg).to.throw("Invalid CodeEngine file: 12345. Expected an object with at least a \"path\" property.");
  });

  it("should throw an error if called with an empty path", () => {
    function invalidPath () {
      return createChangedFile({ path: "" });
    }

    expect(invalidPath).to.throw(Error);
    expect(invalidPath).to.throw("The file path must be specified.");
  });

  it("should throw an error if called with an invalid path", () => {
    function invalidPath () {
      return createChangedFile({ path: 12345 });
    }

    expect(invalidPath).to.throw(TypeError);
    expect(invalidPath).to.throw("Invalid CodeEngine file: {path}. Expected an object with at least a \"path\" property.");
  });

  it("should throw an error if called without a change type", () => {
    function invalidPath () {
      return createChangedFile({ path: "file1.txt" });
    }

    expect(invalidPath).to.throw(TypeError);
    expect(invalidPath).to.throw('The type of file change must be specified ("created", "modified", or "deleted").');
  });

  it("should throw an error if called with an invalid change type", () => {
    function invalidPath () {
      return createChangedFile({ path: "file1.txt", change: 12345 });
    }

    expect(invalidPath).to.throw(TypeError);
    expect(invalidPath).to.throw('Invalid file change: 12345. Expected "created", "modified", or "deleted".');
  });

});
