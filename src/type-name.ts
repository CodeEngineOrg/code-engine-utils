/**
 * Returns the type name of the given value.
 */
export function typeName(value: unknown): string {
  if (value === null) {
    return "null";
  }
  else if (Number.isNaN(value as number)) {
    return "NaN";
  }

  let type = typeof value;

  if (type === "object") {
    return className(value as object);
  }

  return type;
}

/**
 * Returns the class name of the given object.
 */
export function className(obj: object): string {
  let name = Object.prototype.toString.call(obj).slice(8, -1);

  if ((name === "Object" || name === "Error") && obj.constructor) {
    return functionName(obj.constructor);
  }

  return name;
}

/**
 * Returns the name of the given function.
 */
// tslint:disable-next-line: ban-types
export function functionName(func: Function): string {
  if (func.name) {
    return func.name;
  }

  let match = /^\s*function\s*([^\(]*)/im.exec(func.toString());
  return match ? match[1] : "";
}
