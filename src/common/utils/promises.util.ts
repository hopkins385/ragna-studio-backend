export const sequencePromises = <T>(promises: (() => Promise<T>)[]): Promise<void> =>
  promises.reduce((prev, next) => prev.then(() => next().then(() => undefined)), Promise.resolve());

export const promiseWithTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  timeoutRef: { id?: NodeJS.Timeout },
) =>
  Promise.race([
    promise,
    new Promise(
      (_, reject) =>
        (timeoutRef.id = setTimeout(() => reject(new Error('Timeout after ' + ms + 'ms')), ms)),
    ),
  ]);

export async function handlePromise<T>(
  promise: Promise<T>,
): Promise<{ result: T | null; error: Error | null }> {
  try {
    const result = await promise;
    return { result, error: null };
  } catch (error) {
    return { result: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
