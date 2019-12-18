CodeEngine utilities
======================================

[![Cross-Platform Compatibility](https://engine.codes/img/badges/os-badges.svg)](https://travis-ci.com/CodeEngineOrg/code-engine-utils)
[![Build Status](https://api.travis-ci.com/CodeEngineOrg/code-engine-utils.svg?branch=master)](https://travis-ci.com/CodeEngineOrg/code-engine-utils)

[![Coverage Status](https://coveralls.io/repos/github/CodeEngineOrg/code-engine-utils/badge.svg?branch=master)](https://coveralls.io/github/CodeEngineOrg/code-engine-utils)
[![Dependencies](https://david-dm.org/CodeEngineOrg/code-engine-utils.svg)](https://david-dm.org/CodeEngineOrg/code-engine-utils)

[![npm](https://img.shields.io/npm/v/@code-engine/utils.svg)](https://www.npmjs.com/package/@code-engine/utils)
[![License](https://img.shields.io/npm/l/@code-engine/utils.svg)](LICENSE)



This is a utility library that's used inside [CodeEngine](https://engine.codes/). It contains miscellaneous utility functions, some of which are experimental and may be removed or changed in the future.

> **NOTE:** This is an **internal library** that is only intended to be used by CodeEngine. Using it outside of CodeEngine is discouraged.

### Table of Contents

- [File utilities](#file-utilities)
- [Module utilities](#module-utilities)
- [Iteration utilities](#iteration-utilities)
- [Miscellaneous utilities](#miscellaneous-utilities)



File utilities
-------------------------------

### `createFile(info, [pluginName])`
Creates a [CodeEngine `File` object](https://github.com/CodeEngineOrg/code-engine/wiki/Files).

- **info:** - A [`FileInfo` object](https://github.com/CodeEngineOrg/code-engine/wiki/Files#fileinfo-objects). All fields are optional except for the `path`.

- **pluginName:** - (optional) The name of the plugin that's creating the file. This is used to create a unique `source` URL for the file. If not provided, it just defaults to "plugin".

```javascript
import { createFile } from "@code-engine/utils";

createFile({ path: "robots.txt" });
createFile({ path: "page.html", text: "<h1>Hello, world!</h1>" });
createFile({ path: "img/logo.jpg", contents: Buffer.from([0, 1, 0, 1, 1]) });
```


### `createChangedFile(info, [pluginName])`
This is the same as [`createFile()`](#createfileinfo-pluginname), except that it requires a `change` property to be set (to "created", "modified", or "deleted").

```javascript
import { createChangedFile } from "@code-engine/utils";

createChangedFile({ path: "robots.txt", change: "created" });
createChangedFile({ path: "page.html", text: "<h1>Hello, world!</h1>", change: "modified" });
```


### `normalizeFileInfo(info)`
Normalizes a [`FileInfo` object](https://github.com/CodeEngineOrg/code-engine/wiki/Files#fileinfo-objects). For ease of use, the `FileInfo` interface is pretty loose and allows multiple different data types for most fields. This function returns a normalized `FileInfo` object where each field is a specific type.

This function is called internally by [`createFile()`](#createfileinfo-pluginname) and [`createChangedFile()`](#createchangedfileinfo-pluginname).

```javascript
import { normalizeFileInfo } from "@code-engine/utils";

normalizeFileInfo({ path: "robots.txt" });
normalizeFileInfo({ path: "page.html", text: "<h1>Hello, world!</h1>" });
```



Module utilities
-------------------------------

### `resolveModule(moduleId, [cwd])`
Resolves the entry-file path of the specified JavaScript module, either from the specified path or a globally-installed NPM package.

- **moduleId:** - The name or path of the module to resolve

- **cwd** - (optional) The directory to resolve from. Defaults to `process.cwd()`

```javascript
import { resolveModule } from "@code-engine/utils";

resolveModule("lodash");
resolveModule("lodash", "/my/custom/path");
resolveModule("../node_modules/lodash");
resolveModule("../node_modules/lodash/lib/index.js");
```

### `importModule(moduleId, [cwd])`
Imports the specified JavaScript module, either from the specified path or a globally-installed NPM package.

- **moduleId:** - The name or path of the module to resolve

- **cwd** - (optional) The directory to resolve from. Defaults to `process.cwd()`

```javascript
import { importModule } from "@code-engine/utils";

importModule("lodash");
importModule("lodash", "/my/custom/path");
importModule("../node_modules/lodash");
importModule("../node_modules/lodash/lib/index.js");
```



Iteration utilities
-------------------------------

### `ConcurrentTasks` class
This class helps when running multiple async tasks concurrently. Given a concurrency limit, it tracks availability to run additional tasks.

```javascript
import { ConcurrentTasks } from "@code-engine/utils";

// Run up to 3 async tasks concurrently
let concurrentTasks = new ConcurrentTasks(3);

// Process a large list of files, 3 at a time
for await (let file of files) {
  // Wait for one of the 3 task "slots" to become available
  await concurrentTasks.waitForAvailability();

  // Start an async task
  let promise = processFile(file);
  concurrentTasks.add(promise);
}

// Wait for any remainint tasks to complete
await concurrentTasks.waitForAll();
```


### `IterableWriter` class
Creates an async iterable that you can write values to.

```javascript
import { IterableWriter } from "@code-engine/utils";

// The writer.iterable property is the async iterable that gets written to
let writer = new IterableWriter();

// Write a value to the iterable, and wait for it to be read
await writer.write("Some value");

// Cause the iterable to throw an error on the next read
await writer.throw(new Error("Boom!"));

// Indicate that there are no more values, and wait for all existing values to be read.
await writer.end();
```


### `iterate(values)`
Iterates over anything. This can be a single value, an array of values, an iterable, an async iterable, a Promise that returns one or more values. Literally anything.

This function is used to allow CodeEngine plugins to return files however they want. They can return a single file, an array of files, an async iterator of files, a Promise of files, etc.  If the plugin returns `undefined`, then that's the same as returning an empty array (i.e. no files).

```javascript
import { iterate } from "@code-engine/utils";

// undefined is the same as an empty list
for await (let value of iterate(undefined)) {
  console.log("This line will never be executed");
}

// Iterate over a single async value
let promise = Promise.resolve({ path: "some-file.txt" });

for await (let file of iterate(promise)) {
  console.log(`Processing file: ${file.path}`);
}

// Iterate over an array of values
let files = [
  { path: "file1.txt" },
  { path: "file2.txt" },
  { path: "file3.txt" },
];

for await (let file of iterate(files)) {
  console.log(`Processing file: ${file.path}`);
}
```


### `iterateParallel(iterable, concurrency)`
Iterates over an async iterable, always reading the specified number of values at a time. Values are yielded in first-available order.

- **iterable:** - An async iterable

- **concurrency:** - The number of values to read simultaneously

```javascript
import { iterateParallel } from "@code-engine/utils";

// Read 3 files at a time from disk. Some files may take longer to read than others.
// The loop iterates each file in first-available order.
for await (let file of iterateParallel(myAsyncFileReader, 3)) {
  console.log(`Processing file: ${file.path}`);
}
```


### `joinIterables(...iterables)`
Joins multiple iterables into a single one that yields values in first-available order.

- **iterables:** - The iterables (sync and/or async) to join together

```javascript
import { joinIterables } from "@code-engine/utils";

let source1 = readFilesFrom("/my/first/directory");
let source2 = readFilesFrom("/my/second/directory");
let source3 = readFilesFrom("/my/third/directory");

// Read files from all three sources, and process them in first-available order
for await (let file of joinIterables(source1, source2, source3)) {
  console.log(`Processing file: ${file.path}`);
}
```


### `splitIterable(iterable, concurrency)`
Splits an iterable into separate ones that each iterate a subset of the values. Each value in the original iterable will only be sent to ONE of the separate iterables. Values are sent in a first-come, first-serve order, so some iterables may receive more values than others.

- **iterable:** - The iterable to split

- **concurrency:** - The number of separate iterables to create


```javascript
import { splitIterable } from "@code-engine/utils";

// Split one async iterable into three
let [iterable1, iterable2, iterable3] = splitIterable(myAsyncIterable, 3);
```


### `debounceIterable(iterable, delay)`
Debounces an async iterable, so all values that are yielded within a threshold are grouped together.

- **iterable:** - An async iterable

- **delay:** - The amount of time, in milliseconds, to wait for additional values before yielding

```javascript
import { debounceIterable } from "@code-engine/utils";

// Each iteration of this loop will wait at least 300ms.
// The values variable contains all values that were yielded since the previous iteration.
for await (let values of debounceIterable(myAsyncIterable, 300)) {
  console.log(`${values.length} values were yielded`);
}
```


### `drainIterable(iterable, [concurrency])`
Iterates over all values in an async iterable, optionally multiple values at a time. The values are immediately discarded, so very little memory is consumed.

- **iterable:** - An async iterable

- **concurrency:** - (optional) The number of values to read simultaneously. Defaults to 1.

```javascript
import { drainIterable } from "@code-engine/utils";

// Iterate over all values, one at a time
await drainIterable(myAsyncIterable);

// Iterate over all values, three at a time
await drainIterable(myAsyncIterable, 3);
```



Miscellaneous utilities
-------------------------------


### `log(logger, level, message, [data])`
This is just a convenience function that calls the corresponding method of the [`Logger` object](https://github.com/CodeEngineOrg/code-engine-types#types).

- **logger:** - A [`Logger` object](https://github.com/CodeEngineOrg/code-engine-types#types)

- **level:** - A severity level, which determines which `Logger` method to call. Can be "info", "log", "debug", "warn", "warning", or "error".

- **message:** - The string or `Error` object to log

- **data:** (optional) A POJO with additional data to log

```javascript
import { log } from "@code-engine/utils";

log(myLogger, "info", "This is an info message");
log(myLogger, "warning", "This is a warning!", { code: "LOW_MEMORY" });
log(myLogger, "error", new RangeError("Out of range!"));
```


### `typedOno(error, [props], [message])`
This is a wrapper around [ono](https://github.com/js-devtools/ono). It calls the ono method that corresponds to the type of error. For example, if `error` is a `RangeError`, then it will call `ono.range()`.

- **error:** - The error to wrap

- **props:** - (optional) A POJO with custom properties to add to the error

- **message:** (optional) A custom message to prepend to the `error` message

```javascript
import { typedOno } from "@code-engine/utils";

typedOno(new RangeError("Out of range!"));
typedOno(new SyntaxError("Bad syntax"), { line: 5, col: 12 });
typedOno(new TypeError("Incorrect type"), { expected: "number", actual: "string" }, "The value should be a number, not a string.");
```



Contributing
--------------------------
Contributions, enhancements, and bug-fixes are welcome!  [File an issue](https://github.com/CodeEngineOrg/code-engine-utils/issues) on GitHub and [submit a pull request](https://github.com/CodeEngineOrg/code-engine-utils/pulls).

#### Building
To build the project locally on your computer:

1. __Clone this repo__<br>
`git clone https://github.com/CodeEngineOrg/code-engine-utils.git`

2. __Install dependencies__<br>
`npm install`

3. __Build the code__<br>
`npm run build`

4. __Run the tests__<br>
`npm test`



License
--------------------------
@code-engine/utils is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.



Big Thanks To
--------------------------
Thanks to these awesome companies for their support of Open Source developers ❤

[![Travis CI](https://engine.codes/img/badges/travis-ci.svg)](https://travis-ci.com)
[![SauceLabs](https://engine.codes/img/badges/sauce-labs.svg)](https://saucelabs.com)
[![Coveralls](https://engine.codes/img/badges/coveralls.svg)](https://coveralls.io)
