import { AsyncAllIterable } from "@code-engine/types";
import { IterableWriter } from "./iterable-writer";


/**
 * Joins multiple iterables into a single one that yields values in first-available order.
 */
export function joinIterables<T>(...sources: Array<AsyncIterable<T>>): AsyncAllIterable<T> {
  let writer = new IterableWriter<T>();

  for (let source of sources) {
    writer.writeFrom(source);
  }

  writer.end();   // tslint:disable-line: no-floating-promises
  return writer.iterable;
}
