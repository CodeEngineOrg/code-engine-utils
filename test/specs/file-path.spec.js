"use strict";

const { createFile } = require("../../");
const { expect } = require("chai");
const path = require("path");
const isValidFile = require("../utils/is-valid-file");

describe("File path properties", () => {

  it("can initialize the path properties from a string", () => {
    let file = createFile({ path: "path/to/my/file.txt" });
    expect(file).to.satisfy(isValidFile);
    expect(file.source).to.equal("code-engine://plugin/path/to/my/file.txt");
    expect(file.path).to.equal(path.normalize("path/to/my/file.txt"));
    expect(file.dir).to.equal(path.normalize("path/to/my"));
    expect(file.name).to.equal("file.txt");
    expect(file.extension).to.equal(".txt");
  });

  it("can initialize the path properties from an object", () => {
    let file = createFile({ path: "path/to/my/file.txt" });
    expect(file).to.satisfy(isValidFile);
    expect(file.source).to.equal("code-engine://plugin/path/to/my/file.txt");
    expect(file.path).to.equal(path.normalize("path/to/my/file.txt"));
    expect(file.dir).to.equal(path.normalize("path/to/my"));
    expect(file.name).to.equal("file.txt");
    expect(file.extension).to.equal(".txt");
  });

  it("can create a file in the root directory", () => {
    let file = createFile({ path: "my-root-file.html" });
    expect(file).to.satisfy(isValidFile);
    expect(file.source).to.equal("code-engine://plugin/my-root-file.html");
    expect(file.path).to.equal("my-root-file.html");
    expect(file.dir).to.equal("");
    expect(file.name).to.equal("my-root-file.html");
    expect(file.extension).to.equal(".html");
  });

  it("can create a file without an extension", () => {
    let file = createFile({ path: "My File" });
    expect(file).to.satisfy(isValidFile);
    expect(file.source).to.equal("code-engine://plugin/My%20File");
    expect(file.path).to.equal("My File");
    expect(file.dir).to.equal("");
    expect(file.name).to.equal("My File");
    expect(file.extension).to.equal("");

    let file2 = createFile({ path: "My Directory/My File" });
    expect(file2).to.satisfy(isValidFile);
    expect(file2.source).to.equal("code-engine://plugin/My%20Directory/My%20File");
    expect(file2.path).to.equal(path.normalize("My Directory/My File"));
    expect(file2.dir).to.equal("My Directory");
    expect(file2.name).to.equal("My File");
    expect(file2.extension).to.equal("");
  });

  it("can create a file with multiple extensions", () => {
    let file = createFile({ path: "index.min.js.map" });
    expect(file).to.satisfy(isValidFile);
    expect(file.source).to.equal("code-engine://plugin/index.min.js.map");
    expect(file.path).to.equal("index.min.js.map");
    expect(file.dir).to.equal("");
    expect(file.name).to.equal("index.min.js.map");
    expect(file.extension).to.equal(".map");

    let file2 = createFile({ path: "some.directory/index.min.js.map" });
    expect(file2).to.satisfy(isValidFile);
    expect(file2.source).to.equal("code-engine://plugin/some.directory/index.min.js.map");
    expect(file2.path).to.equal(path.normalize("some.directory/index.min.js.map"));
    expect(file2.dir).to.equal("some.directory");
    expect(file2.name).to.equal("index.min.js.map");
    expect(file2.extension).to.equal(".map");
  });

  it("can create a dotfile", () => {
    let file = createFile({ path: ".gitignore" });
    expect(file).to.satisfy(isValidFile);
    expect(file.source).to.equal("code-engine://plugin/.gitignore");
    expect(file.path).to.equal(".gitignore");
    expect(file.dir).to.equal("");
    expect(file.name).to.equal(".gitignore");
    expect(file.extension).to.equal("");

    let file2 = createFile({ path: ".some/.directory/.gitignore" });
    expect(file2).to.satisfy(isValidFile);
    expect(file2.source).to.equal("code-engine://plugin/.some/.directory/.gitignore");
    expect(file2.path).to.equal(path.normalize(".some/.directory/.gitignore"));
    expect(file2.dir).to.equal(path.normalize(".some/.directory"));
    expect(file2.name).to.equal(".gitignore");
    expect(file2.extension).to.equal("");
  });

  it("can set the source to a string", () => {
    let file = createFile({
      path: "path/to/my/file.html",
      source: "http://example.com/search?file=file.njk",
    });

    expect(file).to.satisfy(isValidFile);
    expect(file.source).to.equal("http://example.com/search?file=file.njk");
    expect(file.path).to.equal(path.normalize("path/to/my/file.html"));
    expect(file.dir).to.equal(path.normalize("path/to/my"));
    expect(file.name).to.equal("file.html");
    expect(file.extension).to.equal(".html");
  });

  it("can set the source to a URL object", () => {
    let file = createFile({
      path: "path/to/my/file.html",
      source: new URL("file.njk", "file:///c:/user/my%20documents/"),
    });

    expect(file).to.satisfy(isValidFile);
    expect(file.source).to.equal("file:///c:/user/my%20documents/file.njk");
    expect(file.path).to.equal(path.normalize("path/to/my/file.html"));
    expect(file.dir).to.equal(path.normalize("path/to/my"));
    expect(file.name).to.equal("file.html");
    expect(file.extension).to.equal(".html");
  });

  it("should use the plugin name for the source URL", () => {
    let file = createFile({ path: "path/to/my/file.html", plugin: "My Custom Plugin" });

    expect(file).to.satisfy(isValidFile);
    expect(file.source).to.equal("code-engine://My-Custom-Plugin/path/to/my/file.html");
    expect(file.path).to.equal(path.normalize("path/to/my/file.html"));
    expect(file.dir).to.equal(path.normalize("path/to/my"));
    expect(file.name).to.equal("file.html");
    expect(file.extension).to.equal(".html");
  });

  it("should sanitize special characters in the plugin name and file path when setting the source", () => {
    let file = createFile({ path: "Th!$/p@th/h,a,s/\"#special#` characters?", plugin: "$uper ++AWESOME++ Plugin-!" });

    expect(file).to.satisfy(isValidFile);
    expect(file.source).to.equal("code-engine://uper-AWESOME-Plugin/Th!%24/p%40th/h%2Ca%2Cs/%22%23special%23%60%20characters%3F");
    expect(file.path).to.equal(path.normalize("Th!$/p@th/h,a,s/\"#special#` characters?"));
    expect(file.dir).to.equal(path.normalize("Th!$/p@th/h,a,s"));
    expect(file.name).to.equal("\"#special#` characters?");
    expect(file.extension).to.equal("");

    // The encoded URL should be a valid URL
    expect(new URL(file.source).href).to.equal(file.source);

    // It should decode correctly
    expect(decodeURIComponent(file.source)).to.equal("code-engine://uper-AWESOME-Plugin/Th!$/p@th/h,a,s/\"#special#` characters?");
  });

  it("should update all path properties when the path is changed", () => {
    let file = createFile({ path: "path/to/my/file.njk" });
    expect(file.path).to.equal(path.normalize("path/to/my/file.njk"));
    expect(file.dir).to.equal(path.normalize("path/to/my"));
    expect(file.name).to.equal("file.njk");
    expect(file.extension).to.equal(".njk");

    file.path = "some/other/dir/new-name.min.html";
    expect(file.path).to.equal(path.normalize("some/other/dir/new-name.min.html"));
    expect(file.dir).to.equal(path.normalize("some/other/dir"));
    expect(file.name).to.equal("new-name.min.html");
    expect(file.extension).to.equal(".html");

    file.path = "index";
    expect(file.path).to.equal("index");
    expect(file.dir).to.equal("");
    expect(file.name).to.equal("index");
    expect(file.extension).to.equal("");
  });

  it("should update all path properties when the dir is changed", () => {
    let file = createFile({ path: "path/to/my/file.njk" });
    expect(file.path).to.equal(path.normalize("path/to/my/file.njk"));
    expect(file.dir).to.equal(path.normalize("path/to/my"));
    expect(file.name).to.equal("file.njk");
    expect(file.extension).to.equal(".njk");

    file.dir = "some/other/dir";
    expect(file.path).to.equal(path.normalize("some/other/dir/file.njk"));
    expect(file.dir).to.equal(path.normalize("some/other/dir"));
    expect(file.name).to.equal("file.njk");
    expect(file.extension).to.equal(".njk");

    file.dir = "";
    expect(file.path).to.equal("file.njk");
    expect(file.dir).to.equal("");
    expect(file.name).to.equal("file.njk");
    expect(file.extension).to.equal(".njk");
  });

  it("should update all path properties when the name is changed", () => {
    let file = createFile({ path: "path/to/my/file.njk" });
    expect(file.path).to.equal(path.normalize("path/to/my/file.njk"));
    expect(file.dir).to.equal(path.normalize("path/to/my"));
    expect(file.name).to.equal("file.njk");
    expect(file.extension).to.equal(".njk");

    file.name = "new-name.min.html";
    expect(file.path).to.equal(path.normalize("path/to/my/new-name.min.html"));
    expect(file.dir).to.equal(path.normalize("path/to/my"));
    expect(file.name).to.equal("new-name.min.html");
    expect(file.extension).to.equal(".html");
  });

  it("should update all path properties when the extension is changed", () => {
    let file = createFile({ path: "path/to/my/file.njk" });
    expect(file.path).to.equal(path.normalize("path/to/my/file.njk"));
    expect(file.dir).to.equal(path.normalize("path/to/my"));
    expect(file.name).to.equal("file.njk");
    expect(file.extension).to.equal(".njk");

    file.extension = ".html";
    expect(file.path).to.equal(path.normalize("path/to/my/file.html"));
    expect(file.dir).to.equal(path.normalize("path/to/my"));
    expect(file.name).to.equal("file.html");
    expect(file.extension).to.equal(".html");

    file.extension = ".min.html";
    expect(file.path).to.equal(path.normalize("path/to/my/file.min.html"));
    expect(file.dir).to.equal(path.normalize("path/to/my"));
    expect(file.name).to.equal("file.min.html");
    expect(file.extension).to.equal(".html");
  });

  it("should throw an error if called with an absolute path", () => {
    function absolutePath () {
      return createFile({ path: "/my/file.txt" });
    }

    expect(absolutePath).to.throw(Error);
    expect(absolutePath).to.throw("File paths must be relative, not absolute: /my/file.txt");
  });

  if (process.platform === "win32") {
    it("should throw an error if called with an absolute Windows path", () => {
      function absolutePath () {
        return createFile({ path: "C:\\my\\file.txt" });
      }

      expect(absolutePath).to.throw(Error);
      expect(absolutePath).to.throw("File paths must be relative, not absolute: C:\\my\\file.txt");
    });
  }

  it("should throw an error if path is set to an absolute path", () => {
    let file = createFile({ path: "file.njk" });

    function absolutePath () {
      file.path = "/file.njk";
    }

    expect(absolutePath).to.throw(Error);
    expect(absolutePath).to.throw("File paths must be relative, not absolute: /file.njk");
  });

  it("should throw an error if dir is set to an absolute path", () => {
    let file = createFile({ path: "file.njk" });

    function absolutePath () {
      file.dir = "/root";
    }

    expect(absolutePath).to.throw(Error);
    expect(absolutePath).to.throw(`File paths must be relative, not absolute: /root${path.sep}file.njk`);
  });

  if (process.platform === "win32") {
    it("should throw an error if path is set to an absolute Windows path", () => {
      let file = createFile({ path: "file.njk" });

      function absolutePath () {
        file.path = "C:\\file.njk";
      }

      expect(absolutePath).to.throw(Error);
      expect(absolutePath).to.throw("File paths must be relative, not absolute: C:\\file.njk");
    });

    it("should throw an error if dir is set to an absolute Windows path", () => {
      let file = createFile({ path: "file.njk" });

      function absolutePath () {
        file.dir = "C:\\root";
      }

      expect(absolutePath).to.throw(Error);
      expect(absolutePath).to.throw("File paths must be relative, not absolute: C:\\root\\file.njk");
    });
  }

});
