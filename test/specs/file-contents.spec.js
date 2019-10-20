"use strict";

const { createFile } = require("../../");
const { expect } = require("chai");
const isValidFile = require("../utils/is-valid-file");

describe("File contents", () => {

  it("should default to an empty buffer", () => {
    let file = createFile("file.txt");
    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents).to.have.lengthOf(0);
    expect(file.text).to.equal("");
  });

  it("can explicitly set the content to empty (null)", () => {
    let file = createFile({
      path: "file.txt",
      contents: null
    });

    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents).to.have.lengthOf(0);
    expect(file.text).to.equal("");
  });

  it("can explicitly set the content to empty (string)", () => {
    let file = createFile({
      path: "file.txt",
      contents: ""
    });

    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents).to.have.lengthOf(0);
    expect(file.text).to.equal("");
  });

  it("can explicitly set the content to empty (buffer)", () => {
    let file = createFile({
      path: "file.txt",
      contents: Buffer.alloc(0)
    });

    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents).to.have.lengthOf(0);
  });

  it("can explicitly set the content to empty (Uint8Array)", () => {
    let file = createFile({
      path: "file.txt",
      contents: new Uint8Array(),
    });

    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents).to.have.lengthOf(0);
  });

  it("can explicitly set the text to empty (string)", () => {
    let file = createFile({
      path: "file.txt",
      text: ""
    });

    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents).to.have.lengthOf(0);
    expect(file.text).to.equal("");
  });

  it("can initialize the content to a buffer", () => {
    let file = createFile({
      path: "file.txt",
      contents: Buffer.from("hello, world"),
    });

    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents.toString()).to.equal("hello, world");
    expect(file.text).to.equal("hello, world");
  });

  it("can initialize the content to a string", () => {
    let file = createFile({
      path: "file.txt",
      contents: "hello, world",
    });

    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents.toString()).to.equal("hello, world");
    expect(file.text).to.equal("hello, world");
  });

  it("can initialize the content to a Uint8Array", () => {
    let file = createFile({
      path: "file.txt",
      contents: new Uint8Array([104, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100])
    });

    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents.toString()).to.equal("hello, world");
    expect(file.text).to.equal("hello, world");
  });

  it("can initialize the content to a ArrayBuffer", () => {
    let typedArray = new Uint8Array([104, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100]);
    let buffer = typedArray.buffer;

    let file = createFile({
      path: "file.txt",
      contents: buffer,
    });

    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents.toString()).to.equal("hello, world");
    expect(file.text).to.equal("hello, world");
  });

  it("can initialize the text to a string", () => {
    let file = createFile({
      path: "file.txt",
      text: "hello, world",
    });

    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents.toString()).to.equal("hello, world");
    expect(file.text).to.equal("hello, world");
  });

  it("can set the content property to a buffer", () => {
    let file = createFile("file.txt");
    file.contents = Buffer.from("hello, world");

    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents.toString()).to.equal("hello, world");
    expect(file.text).to.equal("hello, world");
  });

  it("can set the content property to a string", () => {
    let file = createFile("file.txt");
    file.contents = "hello, world";

    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents.toString()).to.equal("hello, world");
    expect(file.text).to.equal("hello, world");
  });

  it("can set the content property to a Uint8Array", () => {
    let file = createFile("file.txt");
    file.contents = new Uint8Array([104, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100]);

    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents.toString()).to.equal("hello, world");
    expect(file.text).to.equal("hello, world");
  });

  it("can set the content property to an ArrayBuffer", () => {
    let file = createFile("file.txt");
    let typedArray = new Uint8Array([104, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100]);
    file.contents = typedArray.buffer;

    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents.toString()).to.equal("hello, world");
    expect(file.text).to.equal("hello, world");
  });

  it("can set the text property to a string", () => {
    let file = createFile("file.txt");
    file.text = "hello, world";

    expect(file).to.satisfy(isValidFile);
    expect(file.contents).to.be.an.instanceOf(Buffer);
    expect(file.contents.toString()).to.equal("hello, world");
    expect(file.text).to.equal("hello, world");
  });

  it("should throw an error if called with invalid contents", () => {
    function invalidContents () {
      return createFile({
        path: "file.txt",
        contents: 12345,
      });
    }

    expect(invalidContents).to.throw(TypeError);
    expect(invalidContents).to.throw("Invalid file contents: 12345");
  });

  it("should throw an error if called with invalid text", () => {
    function invalidContents () {
      return createFile({
        path: "file.txt",
        text: 12345,
      });
    }

    expect(invalidContents).to.throw(TypeError);
    expect(invalidContents).to.throw("Invalid file contents: 12345");
  });

});
