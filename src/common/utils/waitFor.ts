export async function waitFor(
  condition: () => Promise<boolean> | boolean,
  pollInterval: number = 500,
  maxAttempts: number = 1000,
  timeoutAfter?: number,
): Promise<boolean> {
  const startTime = Date.now();
  let attempts = 0;

  while (attempts < maxAttempts) {
    if (typeof timeoutAfter === 'number' && Date.now() > startTime + timeoutAfter) {
      throw new Error('Condition not met before timeout');
    }

    try {
      const result = await condition();
      if (result) {
        return result;
      }
    } catch (error) {
      console.error('Error occurred while checking condition:', error);
      throw error; // or handle it differently based on requirements
    }

    await new Promise((r) => setTimeout(r, pollInterval));
    attempts++;
  }

  throw new Error('Maximum number of attempts reached');
}
