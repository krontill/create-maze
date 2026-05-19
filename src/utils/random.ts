/**
 * Seeded pseudo-random number generator utilities.
 *
 * Time complexity:  O(1) per operation
 * Space complexity: O(1)
 */

/**
 * Creates a seeded LCG (Linear Congruential Generator) PRNG.
 *
 * LCG parameters are from Knuth / Numerical Recipes:
 *   X_{n+1} = (A × X_n + C) mod M
 *   M = 2^31, A = 1664525, C = 1013904223
 *
 * @param seed - Optional integer seed. When omitted a random seed is chosen
 *               so output is non-deterministic.
 * @returns A function that returns a float in [0, 1).
 */
export function createRandom(seed?: number): () => number {
  const M = 0x80000000; // 2^31
  const A = 1664525;
  const C = 1013904223;

  let state: number =
    seed !== undefined ? (seed >>> 0) : Math.floor(Math.random() * M);

  return (): number => {
    state = (A * state + C) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Performs an in-place Fisher-Yates shuffle of an array using the
 * provided PRNG for randomness.
 *
 * Time complexity:  O(n)
 * Space complexity: O(1) – mutates the array in place
 *
 * @param arr    - Array to shuffle (mutated in place).
 * @param random - PRNG function returning floats in [0, 1).
 */
export function shuffle<T>(arr: T[], random: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j] as T;
    arr[j] = tmp;
  }
}
