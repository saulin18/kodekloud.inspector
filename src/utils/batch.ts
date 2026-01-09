import { config } from '../config';

/**
 *
 */
export const splitBatches = <T extends unknown>(
  array: T[],
  maxBatches = config.parallelBatches,
): T[][] => {
  const batchSize = Math.ceil(array.length / maxBatches);

  return Array.from({ length: config.parallelBatches }, (_, i) =>
    array.slice(i * batchSize, (i + 1) * batchSize),
  );
};
