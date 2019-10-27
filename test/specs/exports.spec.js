"use strict";

const { expect } = require("chai");
const commonJSExport = require("../../");
const { default: defaultExport } = require("../../");
const {
  createFile, createChangedFile, normalizeFileInfo, log, validate, valueToString, valuesToString, ConcurrentTasks,
  iterate, iterateAll, debounceIterable, drainIterable, joinIterables, splitIterable, IterableWriter
} = require("../../");

describe("@code-engine/utils package exports", () => {

  it("should not have a default ESM export", () => {
    expect(defaultExport).to.be.equal(undefined);
  });

  it("should export the createFile function as a named export", () => {
    expect(createFile).to.be.a("function");
    expect(createFile.name).to.equal("createFile");
  });

  it("should export the createChangedFile function as a named export", () => {
    expect(createChangedFile).to.be.a("function");
    expect(createChangedFile.name).to.equal("createChangedFile");
  });

  it("should export the normalizeFileInfo function as a named export", () => {
    expect(normalizeFileInfo).to.be.a("function");
    expect(normalizeFileInfo.name).to.equal("normalizeFileInfo");
  });

  it("should export the log function as a named export", () => {
    expect(log).to.be.a("function");
    expect(log.name).to.equal("log");
  });

  it("should export the validate object as a named export", () => {
    expect(validate).to.be.an("object");
    for (let key of Object.keys(validate)) {
      expect(validate[key]).to.be.a("function").with.property("name", key);
    }
  });

  it("should export the valueToString function as a named export", () => {
    expect(valueToString).to.be.a("function");
    expect(valueToString.name).to.equal("valueToString");
  });

  it("should export the valuesToString function as a named export", () => {
    expect(valuesToString).to.be.a("function");
    expect(valuesToString.name).to.equal("valuesToString");
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

  it("should export the debounceIterable function as a named export", () => {
    expect(debounceIterable).to.be.a("function");
    expect(debounceIterable.name).to.equal("debounceIterable");
  });

  it("should export the drainIterable function as a named export", () => {
    expect(drainIterable).to.be.a("function");
    expect(drainIterable.name).to.equal("drainIterable");
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
      "createChangedFile",
      "normalizeFileInfo",
      "log",
      "validate",
      "valueToString",
      "valuesToString",
      "ConcurrentTasks",
      "iterate",
      "iterateAll",
      "debounceIterable",
      "drainIterable",
      "joinIterables",
      "splitIterable",
      "IterableWriter",
    );
  });

});
