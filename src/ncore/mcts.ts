import { shuffle } from "lodash";
import { deskCards } from "../core/Card";
import { Card } from "../core/model";
import { monotone, same } from "./util";

function combinations<T>(set: Array<T>, k: number): Array<Array<T>> {
  if (k > set.length || k <= 0) return [];
  if (k === set.length) return [set];

  return set.reduce((p, c, i) => {
    combinations(set.slice(i + 1), k - 1).forEach((tailArray) =>
      p.push([c].concat(tailArray))
    );
    return p;
  }, [] as T[][]);
}

console.log(combinations(shuffle(deskCards).slice(0, 18), 18));
