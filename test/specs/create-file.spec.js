"use strict";

const { createFile } = require("../../");
const { expect } = require("chai");
const path = require("path");
const isValidFile = require("../utils/is-valid-file");

describe("createFile() function", () => {

  it("can be called with new", () => {
    // eslint-disable-next-line new-cap
    let file = new createFile({ path: "path/to/my/file.txt" });
    expect(file).to.satisfy(isValidFile);
  });

  it("can be called with an object with a path property", () => {
    let file = createFile({ path: "path/to/my/file.txt" });
    expect(file).to.satisfy(isValidFile);
  });

  it("should use custom dates", () => {
    let file = createFile({
      path: "file.txt",
      createdAt: new Date("2005-05-15T05:15:25.035Z"),
      modifiedAt: new Date("2006-06-16T06:16:26.036Z"),
    });

    expect(file).to.satisfy(isValidFile);
    expect(file.createdAt.toISOString()).to.equal("2005-05-15T05:15:25.035Z");
    expect(file.modifiedAt.toISOString()).to.equal("2006-06-16T06:16:26.036Z");
  });

  it("should set custom metadata", () => {
    let file = createFile({
      path: "file.txt",
      metadata: {
        source: "aaaaaaaa",
        sourceMap: { file: "xxxxx" },
        path: "bbbbbbbbb",
        dir: "xxxxx",
        name: "yyyyy",
        extension: "zzzzz",
        createdAt: new Date("2005-05-15T05:15:25.035Z"),
        modifiedAt: new Date("2006-06-16T06:16:26.036Z"),
        foo: true,
        bar: 5,
      }
    });

    expect(file).to.satisfy(isValidFile);

    // All path properties are set from "path", NOT metadata
    expect(file.source).to.equal("code-engine://plugin/file.txt");
    expect(file.sourceMap).to.equal(undefined);
    expect(file.path).to.equal("file.txt");
    expect(file.dir).to.equal("");
    expect(file.name).to.equal("file.txt");
    expect(file.extension).to.equal(".txt");

    // The date properties are NOT set by metadata
    expect(file.createdAt.toISOString()).not.to.equal("2005-05-15T05:15:25.035Z");
    expect(file.modifiedAt.toISOString()).not.to.equal("2006-06-16T06:16:26.036Z");

    // All metadata should be copied as-is
    expect(file.metadata).to.deep.equal({
      source: "aaaaaaaa",
      sourceMap: { file: "xxxxx" },
      path: "bbbbbbbbb",
      dir: "xxxxx",
      name: "yyyyy",
      extension: "zzzzz",
      createdAt: new Date("2005-05-15T05:15:25.035Z"),
      modifiedAt: new Date("2006-06-16T06:16:26.036Z"),
      foo: true,
      bar: 5,
    });
  });

  it("should ignore unknown properties", () => {
    let file = createFile({
      path: "my/directory/file.txt",
      createdAt: new Date("2005-05-15T05:15:25.035Z"),
      modifiedAt: new Date("2006-06-16T06:16:26.036Z"),
      dir: "xxxxx",
      name: "yyyyy",
      extension: "zzzzz",
      foo: true,
      bar: 5
    });

    expect(file).to.satisfy(isValidFile);
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
    let fileInfo = { path: "path/to/my/file.txt" };
    let file1 = createFile(fileInfo);
    let file2 = createFile(file1);

    expect(file1).not.to.equal(fileInfo);
    expect(file2).not.to.equal(fileInfo);
    expect(file1).to.equal(file2);            // Same instance
  });

  it("should return a new instance if the argument is a spread File", () => {
    let fileInfo = { path: "path/to/my/file.txt" };
    let file1 = createFile(fileInfo);
    let file2 = createFile({ ...file1 });

    expect(file1).not.to.equal(fileInfo);
    expect(file2).not.to.equal(fileInfo);
    expect(file1).not.to.equal(file2);        // Different instances
    expect(file1).to.deep.equal(file2);       // Same values
  });

  it("should work with Object.assign()", () => {
    let file = createFile({
      path: "path/to/file.txt",
      createdAt: new Date("2001-01-01T01:01:01.001Z"),
      modifiedAt: new Date("2002-02-02T02:02:02.002Z"),
      contents: "hello, world",
      metadata: { foo: "bar" },
      sourceMap: { file: "file.txt" },
    });

    let pojo = Object.assign(
      { a: "A", createdAt: new Date("2003-03-03T03:03:03.003Z") },
      file,
      { b: "B", modifiedAt: new Date("2004-04-04T04:04:04.004Z") }
    );

    // The POJO should have all properties of the 3 objects, merged together.
    expect(pojo).to.deep.equal({
      path: path.normalize("path/to/file.txt"),
      source: "code-engine://plugin/path/to/file.txt",
      contents: Buffer.from("hello, world"),
      metadata: { foo: "bar" },
      sourceMap: { file: "file.txt" },

      // The createdAt of the file overwrites the createdAt of object A
      a: "A",
      createdAt: new Date("2001-01-01T01:01:01.001Z"),

      // The modifiedAt of Object B overwrite the modifiedAt of the file
      b: "B",
      modifiedAt: new Date("2004-04-04T04:04:04.004Z"),
    });
  });

  it("should work with the spread operator", () => {
    let file = createFile({
      path: "path/to/file.txt",
      createdAt: new Date("2001-01-01T01:01:01.001Z"),
      modifiedAt: new Date("2002-02-02T02:02:02.002Z"),
      contents: "hello, world",
      metadata: { foo: "bar" },
      sourceMap: { file: "file.txt" },
    });

    let pojo = {
      a: "A",
      createdAt: new Date("2003-03-03T03:03:03.003Z"),
      ...file,
      b: "B",
      modifiedAt: new Date("2004-04-04T04:04:04.004Z")
    };

    // The POJO should have all properties of the 3 objects, merged together.
    expect(pojo).to.deep.equal({
      path: path.normalize("path/to/file.txt"),
      source: "code-engine://plugin/path/to/file.txt",
      contents: Buffer.from("hello, world"),
      metadata: { foo: "bar" },
      sourceMap: { file: "file.txt" },

      // The createdAt of the file overwrites the createdAt of the pojo
      a: "A",
      createdAt: new Date("2001-01-01T01:01:01.001Z"),

      // The modifiedAt of the pojo overwrite the modifiedAt of the file
      b: "B",
      modifiedAt: new Date("2004-04-04T04:04:04.004Z"),
    });
  });

  it("should support toString()", () => {
    expect(createFile({ path: "file.txt" }).toString()).to.equal("file.txt");
    expect(Object.prototype.toString.call(createFile({ path: "file.txt" }))).to.equal("[object File]");

    expect(createFile({ path: "path/to/my/file.txt" }).toString()).to.equal(path.normalize("path/to/my/file.txt"));
    expect(Object.prototype.toString.call(createFile({ path: "path/to/my/file.txt" }))).to.equal("[object File]");
  });

  it("should support JSON.stringify()", () => {
    let file = createFile({
      path: "path/to/file.txt",
      metadata: {
        foo: "bar",
      },
      sourceMap: { file: "file.txt" },
      contents: "hello, world",
    });

    let json = JSON.parse(JSON.stringify(file));

    expect(json).to.deep.equal({
      path: path.normalize("path/to/file.txt"),
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
      return createFile();
    }

    expect(noArgs).to.throw(TypeError);
    expect(noArgs).to.throw("Invalid CodeEngine file: undefined. Expected an object with at least a \"path\" property.");
  });

  it("should throw an error if called with an empty object", () => {
    function emptyObj () {
      return createFile({});
    }

    expect(emptyObj).to.throw(TypeError);
    expect(emptyObj).to.throw("Invalid CodeEngine file: {}. Expected an object with at least a \"path\" property.");
  });

  it("should throw an error if called with an empty string", () => {
    function emptyString () {
      return createFile("");
    }

    expect(emptyString).to.throw(Error);
    expect(emptyString).to.throw("Invalid CodeEngine file: \"\". Expected an object with at least a \"path\" property.");
  });

  it("should throw an error if called with an invalid argument", () => {
    function invalidArg () {
      return createFile(12345);
    }

    expect(invalidArg).to.throw(TypeError);
    expect(invalidArg).to.throw("Invalid CodeEngine file: 12345. Expected an object with at least a \"path\" property.");
  });

  it("should throw an error if called with an empty path", () => {
    function invalidPath () {
      return createFile({ path: "" });
    }

    expect(invalidPath).to.throw(Error);
    expect(invalidPath).to.throw("The file path must be specified.");
  });

  it("should throw an error if called with an invalid path", () => {
    function invalidPath () {
      return createFile({ path: 12345 });
    }

    expect(invalidPath).to.throw(TypeError);
    expect(invalidPath).to.throw("Invalid CodeEngine file: {path}. Expected an object with at least a \"path\" property.");
  });

});
