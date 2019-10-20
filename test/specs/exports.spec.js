"use strict";

const { expect } = require("chai");
const commonJSExport = require("../../");
const {
  default: defaultExport, createFile, log, validate, valueToString, ConcurrentTasks,
  iterate, iterateAll, joinIterables, splitIterable, IterableWriter
} = require("../../");

describe("@code-engine/utils package exports", () => {

  it("should not have a default ESM export", () => {
    expect(defaultExport).to.be.equal(undefined);
  });

  it("should export the createFile function as a named export", () => {
    expect(createFile).to.be.a("function");
    expect(createFile.name).to.equal("createFile");
  });

  it("should export the log function as a named export", () => {
    expect(log).to.be.a("function");
    expect(log.name).to.equal("log");
  });

  it("should export the validate object as a named export", () => {
    expect(validate).to.be.an("object").with.keys("concurrency");
    expect(validate.concurrency).to.be.a("function");
  });

  it("should export the valueToString function as a named export", () => {
    expect(valueToString).to.be.a("function");
    expect(valueToString.name).to.equal("valueToString");
  });

  it("should export the ConcurrentTasks class as a named export", () => {
    expect(ConcurrentTasks).to.be.a("function");
    expect(ConcurrentTasks.name).to.equal("ConcurrentTasks");
  });

  it("should export the iterate function as a named export", () => {
    expect(iterate).to.be.a("function");
    expect(iterate.name).to.equal("iterate");
  });

  it("should export the iterateAll function as a named export", () => {
    expect(iterateAll).to.be.a("function");
    expect(iterateAll.name).to.equal("iterateAll");
  });

  it("should export the joinIterables function as a named export", () => {
    expect(joinIterables).to.be.a("function");
    expect(joinIterables.name).to.equal("joinIterables");
  });

  it("should export the splitIterable function as a named export", () => {
    expect(splitIterable).to.be.a("function");
    expect(splitIterable.name).to.equal("splitIterable");
  });

  it("should export the IterableWriter class as a named export", () => {
    expect(IterableWriter).to.be.a("function");
    expect(IterableWriter.name).to.equal("IterableWriter");
  });

  it("should not export anything else", () => {
    expect(commonJSExport).to.have.keys(
      "createFile",
      "log",
      "validate",
      "valueToString",
      "ConcurrentTasks",
      "iterate",
      "iterateAll",
      "joinIterables",
      "splitIterable",
      "IterableWriter",
    );
  });

});
