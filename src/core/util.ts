export const randomStr = () => Math.random().toString(32).slice(2);
export const currentTime = () => new Date().getTime().toString(32);
export const generateId = () => `${currentTime()}${randomStr()}`;

export const getPermutations = <T>(array: Array<T>, size: number): T[][] => {
  function p(t: T[], i: number) {
    if (t.length === size) {
      result.push(t);
      return;
    }
    if (i + 1 > array.length) {
      return;
    }
    p(t.concat(array[i]), i + 1);
    p(t, i + 1);
  }

  let result: Array<T[]> = [];
  p([], 0);
  return result;
};
