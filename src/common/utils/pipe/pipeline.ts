import { retryWithExponentialBackoff } from '../backoff/exponentialBackoff';

type StepFunction<T = any, R = any> = (input: T) => Promise<R>;
type FinallyFunction<T = any> = (input: T) => void;

export class Pipe<T = any> {
  private steps: StepFunction<T>[] = [];
  private lastStepCallback?: FinallyFunction;

  constructor(private retryLimit: number = 3) {}

  /**
   * Creates a new Pipe instance with the given retry limit and callback.
   * @param retryLimit The maximum number of retries for each step.
   * @param callback The callback to execute to build the pipeline.
   * @returns The new Pipe instance.
   */
  static create(retryLimit: number, callback: (p: Pipe) => void): Pipe {
    const p = new Pipe(retryLimit);
    callback(p);
    return p;
  }

  /**
   * Adds a step to the pipeline.
   * @param stepFunction The function to execute as a step.
   * @returns The Pipe instance for chaining.
   */
  public addStep(stepFunction: StepFunction): this {
    this.steps.push(stepFunction);
    return this;
  }

  /**
   * Adds a callback to execute after the last step.
   * @param callback The callback to execute after the last step.
   * @returns The Pipe instance for chaining.
   */
  public lastStep(callback: FinallyFunction): this {
    this.lastStepCallback = callback;
    return this;
  }

  /**
   * Runs the pipeline with the given initial input.
   * @param initialInput The initial input for the pipeline.
   * @returns A promise that resolves when the pipeline completes.
   */
  async run(initialInput?: any): Promise<void> {
    let input = initialInput;
    try {
      for (const fn of this.steps) {
        input = await retryWithExponentialBackoff(async () => fn(input), {
          retries: this.retryLimit,
          delay: 1000,
          factor: 3,
        });
      }
    } catch (error) {
      console.error('Pipeline execution failed', error);
    }

    if (this.lastStepCallback) {
      try {
        this.lastStepCallback(input);
      } catch (error) {
        console.error('Error in finally callback', error);
      }
    }
  }
}
