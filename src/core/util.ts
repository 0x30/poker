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

export const useCache = <T>() => {
  const pools: { [key: string]: T } = {};

  return (key: string, gen: () => T) => {
    const res = pools[key];
    if (res) return res;
    const nres = gen();
    pools[key] = nres;
    return nres;
  };
};

export const stringToColour = function (str: string) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = "#";
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xff;
    colour += ("00" + value.toString(16)).substr(-2);
  }
  return colour;
};
