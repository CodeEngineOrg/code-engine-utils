import { ono } from "ono";

/**
 * Function that coerce an `ErrorClone` to one of the built-in JavaScript error types
 */
const builtInErrorTypes = {
  [EvalError.name]: ono.eval,
  [RangeError.name]: ono.range,
  [ReferenceError.name]: ono.reference,
  [SyntaxError.name]: ono.syntax,
  [TypeError.name]: ono.type,
  [URIError.name]: ono.uri,
};

/**
 * Creates a new error of the same type as the given error.
 */
export function typedOno<T extends Error>(error: T, message?: string): T;
export function typedOno<T extends Error>(error: T, props?: object, message?: string): T;
export function typedOno<T extends Error>(error: T, props?: object | string, message?: string): T {
  let _ono = builtInErrorTypes[error.name] || ono;

  if (props && message) {
    return _ono(error, props as object, message);
  }
  else if (props) {
    return _ono(error, props as string);
  }
  else {
    return _ono(error);
  }
}
