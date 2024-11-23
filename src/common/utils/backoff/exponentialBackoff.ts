// Utility function for retry with exponential backoff
export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: { retries: number; delay: number; factor: number } = { retries: 3, delay: 1000, factor: 2 },
): Promise<T> {
  let attempt = 0;
  while (attempt < options.retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= options.retries) {
        throw error;
      }
      const backoff = options.delay * Math.pow(options.factor, attempt - 1);
      console.log(`Retrying in ${backoff}ms`);
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
  throw new Error('Retry attempts exceeded');
}
