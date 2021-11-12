import { computed, ref } from "vue";
import { getRunFastCards } from "./Card";
import { Player } from "./Player";
import { generateId } from "./util";

export const useGame = (players: Player[]) => {
  const id = generateId();
  const cards = getRunFastCards();
  return { id };
};
