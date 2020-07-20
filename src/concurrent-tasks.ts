import { assert } from "@jsdevtools/assert";
import { ono } from "@jsdevtools/ono";

/**
 * Concurrently runs async tasks, up to a specified limit at a time.
 */
export class ConcurrentTasks<T = unknown> {
  /** @internal */
  private _concurrency: number;

  /** @internal */
  private _taskId = 0;

  /** @internal */
  private _tasks = new Map<number, Promise<[number, T]>>();

  public constructor(concurrency: number) {
    this._concurrency = assert.number.integer.positive(concurrency, "concurrency");
  }

  /**
   * Indicates whether there are any available task slots.
   */
  public get isAvailable() {
    return this._tasks.size < this._concurrency;
  }

  /**
   * Adds a task to the list.
   *
   * Call `waitForAvailability()` first to ensure that there's an open slot available;
   * otherwise an error will be thrown.
   */
  public add(task: Promise<T>): void {
    if (!this.isAvailable) {
      throw ono.range(`Attempted to run too many concurrent tasks. Max is ${this._concurrency}.`);
    }

    // Create a unique ID for this task
    let id = ++this._taskId;

    // Add this task to the list, and return its ID when it completes
    this._tasks.set(id, Promise.resolve(task).then((result) => [id, result]));
  }

  /**
   * Waits for the first task to finish, and returns its result.
   */
  public async race(): Promise<T> {
    let promises = [...this._tasks.values()];

    if (promises.length === 0) {
      throw ono.range(`There are no pending tasks.`);
    }

    // Wait for a task to finish
    let [taskId, result] = await Promise.race(promises);

    // Remove the finished task
    this._tasks.delete(taskId);

    return result;
  }

  /**
   * Waits for an available task slot.
   */
  public async waitForAvailability(): Promise<void> {
    if (this.isAvailable) {
      // There's already an open slot, so return immediately
      return;
    }

    await this.race();
  }

  /**
   * Waits for all current tasks to complete.
   */
  public async waitForAll(): Promise<void> {
    await Promise.all(this._tasks.values());
  }
}
