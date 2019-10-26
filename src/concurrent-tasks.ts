import { ono } from "ono";
import { validate } from "./validate";

/**
 * Concurrently runs async tasks, up to a specified limit at a time.
 */
export class ConcurrentTasks {
  /** @internal */
  private _concurrency: number;

  /** @internal */
  private _taskId = 0;

  /** @internal */
  private _tasks = new Map<number, Promise<number>>();

  public constructor(concurrency: number) {
    this._concurrency = validate.positiveInteger("concurrency", concurrency);
  }

  /**
   * Adds a task to the list.
   *
   * Call `waitForAvailability()` first to ensure that there's an open slot available;
   * otherwise an error will be thrown.
   */
  public add(task: Promise<unknown>): void {
    if (this._tasks.size >= this._concurrency) {
      throw ono.range(`Attempted to run too many concurrent tasks. Max is ${this._concurrency}.`);
    }

    // Create a unique ID for this task
    let id = ++this._taskId;

    // Add this task to the list, and return its ID when it completes
    this._tasks.set(id, Promise.resolve(task).then(() => id));
  }

  /**
   * Waits for an available task slot.
   */
  public async waitForAvailability() {
    if (this._tasks.size < this._concurrency) {
      // There's already an open slot, so return immediately
      return;
    }

    // Wait for a task to finish
    let taskId = await Promise.race(this._tasks.values());

    // Remove the finished task
    this._tasks.delete(taskId);
  }

  /**
   * Waits for all current tasks to complete.
   */
  public async waitForAll() {
    await Promise.all(this._tasks.values());
  }
}
